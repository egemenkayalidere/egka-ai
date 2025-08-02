#!/usr/bin/env node

const { program } = require("commander");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");
const { execSync } = require("child_process");

// Güvenilir timestamp fonksiyonu
function getReliableTimestamp() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Tarih kontrolü - mantıksız tarihleri engelle
  if (currentYear < 2020 || currentYear > 2030) {
    console.log(chalk.red("⚠️  Sistem saati yanlış görünüyor!"));
    console.log(chalk.yellow("Lütfen sistem saatinizi kontrol edin."));
    process.exit(1);
  }

  // Saat kontrolü - mantıksız saatleri engelle
  const currentHour = now.getHours();
  if (currentHour < 0 || currentHour > 23) {
    console.log(chalk.red("⚠️  Sistem saati yanlış görünüyor!"));
    console.log(chalk.yellow("Lütfen sistem saatinizi kontrol edin."));
    process.exit(1);
  }

  return now.toISOString();
}

// Tarih formatı için yardımcı fonksiyon
function formatDateForDisplay(date) {
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Welcome message
function showWelcome() {
  console.log(
    chalk.cyan(`
${chalk.bold("🚀 Welcome to EGKA AI AGENTS!")}
${chalk.gray("Your intelligent development companion")}

${chalk.yellow("Available Commands:")}
  ${chalk.white("create")}     - Create a new project with interactive wizard
  ${chalk.white("status")}     - Show system status and agent information
  ${chalk.white("task")}       - Manage tasks and workflows
  ${chalk.white("agent")}      - Manage AI agents
  ${chalk.white("project")}    - Manage projects
  ${chalk.white("template")}   - Manage project templates
  ${chalk.white("log")}        - View system logs
  ${chalk.white("workflow")}   - Manage workflows
  ${chalk.white("init")}       - Initialize multi-agent system
  ${chalk.white("setup")}      - Setup development environment
  ${chalk.white("install")}    - Install dependencies
  
  ${chalk.white("test-communication")} - Test agent communication

${chalk.gray("Use --help for detailed information about each command")}
`)
  );
}

// Version bilgisi
const packageJson = require("../package.json");
program.version(packageJson.version);

// Ana komut
program
  .name("egka-ai")
  .description(
    "EgKaSoft AI Agents - Multi-Agent System for automated task management and development"
  )
  .usage("[command] [options]")
  .action(() => {
    showWelcome();
  });

// ============================================================================
// STATUS KOMUTU - Sistem durumu ve agent bilgileri
// ============================================================================
program
  .command("status")
  .description("Show current system status and agent information")
  .option("-v, --verbose", "Show detailed information")
  .action(async (options) => {
    console.log(chalk.blue.bold("🤖 EGKA AI AGENTS Status"));
    console.log(chalk.gray("─────────────────────────────────"));

    try {
      const multiAgentPath = path.join(__dirname, "..", "multi-agent");
      const exists = await fs.pathExists(multiAgentPath);

      if (exists) {
        console.log(chalk.green("✅ Multi-Agent System: Active"));
        console.log(chalk.cyan(`📦 Version: ${packageJson.version}`));

        // Agent dosyalarını kontrol et
        const agentsPath = path.join(multiAgentPath, "agents");
        if (await fs.pathExists(agentsPath)) {
          const agents = await fs.readdir(agentsPath);
          const contextFiles = agents.filter((file) =>
            file.endsWith(".context7.json")
          );

          console.log(
            chalk.cyan(`📁 Available Agents: ${contextFiles.length}`)
          );
          contextFiles.forEach((agent) => {
            const agentName = agent.replace(".context7.json", "");
            console.log(chalk.white(`   • ${agentName}`));
          });
        }

        // Task durumunu kontrol et
        const tasksPath = path.join(multiAgentPath, "shared", "tasks");
        if (await fs.pathExists(tasksPath)) {
          const taskFiles = await fs.readdir(tasksPath);
          const contextTasks = taskFiles.filter((file) =>
            file.endsWith(".context7.json")
          );

          console.log(chalk.cyan(`📋 Active Tasks: ${contextTasks.length}`));
          if (options.verbose && contextTasks.length > 0) {
            contextTasks.forEach((task) => {
              console.log(chalk.white(`   • ${task}`));
            });
          }
        }

        // Log dosyalarını kontrol et
        const logsPath = path.join(multiAgentPath, "shared", "logs");
        if (await fs.pathExists(logsPath)) {
          const logFiles = await fs.readdir(logsPath);
          const logCount = logFiles.filter((file) =>
            file.endsWith(".log")
          ).length;
          console.log(chalk.cyan(`📝 Log Files: ${logCount}`));
        }

        // Proje yapısını kontrol et
        const projects = [
          "mobile-app",
          "web-app",
          "admin-panel",
          "backend-api",
        ];
        const activeProjects = [];

        for (const project of projects) {
          const projectPath = path.join(__dirname, "..", project);
          if (await fs.pathExists(projectPath)) {
            activeProjects.push(project);
          }
        }

        console.log(
          chalk.cyan(`🏗️  Active Projects: ${activeProjects.length}`)
        );
        if (activeProjects.length > 0) {
          activeProjects.forEach((project) => {
            console.log(chalk.white(`   • ${project}`));
          });
        }
      } else {
        console.log(chalk.red("❌ Multi-Agent System: Not Found"));
        console.log(
          chalk.yellow("💡 Run 'egka-ai init' to initialize the system")
        );
      }

      console.log(chalk.gray("─────────────────────────────────"));
      console.log(chalk.yellow('💡 Use "egka-ai --help" for more commands'));
    } catch (error) {
      console.error(chalk.red("Error checking status:"), error.message);
    }
  });

// ============================================================================
// TASK KOMUTU - Task yönetimi
// ============================================================================
program
  .command("task")
  .description("Task management commands")
  .option("-l, --list", "List all tasks")
  .option("-c, --create", "Create new task")
  .option("-s, --status <taskId>", "Show task status")
  .option("-d, --delete <taskId>", "Delete task")
  .action(async (options) => {
    const tasksPath = path.join(
      __dirname,
      "..",
      "multi-agent",
      "shared",
      "tasks"
    );

    if (!(await fs.pathExists(tasksPath))) {
      console.log(
        chalk.red("❌ Tasks directory not found. Run 'egka-ai init' first.")
      );
      return;
    }

    if (options.list) {
      await listTasks(tasksPath);
    } else if (options.create) {
      await createTask(tasksPath);
    } else if (options.status) {
      await showTaskStatus(tasksPath, options.status);
    } else if (options.delete) {
      await deleteTask(tasksPath, options.delete);
    } else {
      console.log(
        chalk.yellow("💡 Use 'egka-ai task --help' for task options")
      );
    }
  });

// ============================================================================
// CREATE KOMUTU - Yeni proje oluşturma
// ============================================================================
program
  .command("create")
  .description("Create a new project with interactive wizard")
  .option("-t, --template <template>", "Use specific template")
  .option("-y, --yes", "Skip prompts and use defaults")
  .action(async (options) => {
    console.log(chalk.blue.bold("🚀 EGKA AI Project Creator"));
    console.log(chalk.gray("─────────────────────────────────"));

    try {
      await createProjectWizard(options);
    } catch (error) {
      console.error(chalk.red("Error creating project:"), error.message);
    }
  });

// ============================================================================
// TEMPLATE KOMUTU - Template yönetimi
// ============================================================================
program
  .command("template")
  .description("Template management commands")
  .option("-l, --list", "List available templates")
  .option("-i, --info <templateName>", "Show template information")
  .option("-c, --create <templateName>", "Create new template")
  .option("-d, --delete <templateName>", "Delete template")
  .action(async (options) => {
    const templatesPath = path.join(__dirname, "..", "templates");

    if (!(await fs.pathExists(templatesPath))) {
      await fs.ensureDir(templatesPath);
    }

    if (options.list) {
      await listTemplates(templatesPath);
    } else if (options.info) {
      await showTemplateInfo(templatesPath, options.info);
    } else if (options.create) {
      await createTemplate(templatesPath, options.create);
    } else if (options.delete) {
      await deleteTemplate(templatesPath, options.delete);
    } else {
      console.log(
        chalk.yellow("💡 Use 'egka-ai template --help' for template options")
      );
    }
  });

// ============================================================================
// AGENT KOMUTU - Agent yönetimi (genişletilmiş)
// ============================================================================
program
  .command("agent")
  .description("Agent management commands")
  .option("-l, --list", "List all agents")
  .option("-s, --status <agentName>", "Show agent status")
  .option("-r, --restart <agentName>", "Restart agent")
  .option("-a, --add <agentName>", "Add new agent")
  .option("-d, --delete <agentName>", "Delete agent")
  .option("-c, --config <agentName>", "Configure agent")
  .action(async (options) => {
    const agentsPath = path.join(__dirname, "..", "multi-agent", "agents");

    if (!(await fs.pathExists(agentsPath))) {
      console.log(
        chalk.red("❌ Agents directory not found. Run 'egka-ai init' first.")
      );
      return;
    }

    if (options.list) {
      await listAgents(agentsPath);
    } else if (options.status) {
      await showAgentStatus(agentsPath, options.status);
    } else if (options.restart) {
      await restartAgent(agentsPath, options.restart);
    } else if (options.add) {
      await addNewAgent(agentsPath, options.add);
    } else if (options.delete) {
      await deleteAgent(agentsPath, options.delete);
    } else if (options.config) {
      await configureAgent(agentsPath, options.config);
    } else {
      console.log(
        chalk.yellow("💡 Use 'egka-ai agent --help' for agent options")
      );
    }
  });

// ============================================================================
// PROJECT KOMUTU - Proje yönetimi
// ============================================================================
program
  .command("project")
  .description("Project management commands")
  .option("-l, --list", "List all projects")
  .option("-s, --status <projectName>", "Show project status")
  .option("-i, --install <projectName>", "Install project dependencies")
  .option("-d, --dev <projectName>", "Start development server")
  .option("-b, --build <projectName>", "Build project")
  .action(async (options) => {
    if (options.list) {
      await listProjects();
    } else if (options.status) {
      await showProjectStatus(options.status);
    } else if (options.install) {
      await installProjectDependencies(options.install);
    } else if (options.dev) {
      await startDevelopmentServer(options.dev);
    } else if (options.build) {
      await buildProject(options.build);
    } else {
      console.log(
        chalk.yellow("💡 Use 'egka-ai project --help' for project options")
      );
    }
  });

// ============================================================================
// LOG KOMUTU - Log yönetimi
// ============================================================================
program
  .command("log")
  .description("Log management commands")
  .option("-s, --system", "Show system logs")
  .option("-a, --agent <agentName>", "Show agent logs")
  .option("-t, --task <taskId>", "Show task logs")
  .option("-c, --clear", "Clear all logs")
  .option("-f, --follow", "Follow log updates")
  .action(async (options) => {
    const logsPath = path.join(
      __dirname,
      "..",
      "multi-agent",
      "shared",
      "logs"
    );

    if (!(await fs.pathExists(logsPath))) {
      console.log(
        chalk.red("❌ Logs directory not found. Run 'egka-ai init' first.")
      );
      return;
    }

    if (options.system) {
      await showSystemLogs(logsPath, options.follow);
    } else if (options.agent) {
      await showAgentLogs(logsPath, options.agent, options.follow);
    } else if (options.task) {
      await showTaskLogs(logsPath, options.task, options.follow);
    } else if (options.clear) {
      await clearLogs(logsPath);
    } else {
      console.log(chalk.yellow("💡 Use 'egka-ai log --help' for log options"));
    }
  });

// ============================================================================
// INIT KOMUTU - Sistem başlatma
// ============================================================================
program
  .command("init")
  .description("Initialize the multi-agent system")
  .option("-f, --force", "Force reinitialization")
  .action(async (options) => {
    console.log(chalk.blue.bold("🚀 Initializing EGKA AI AGENTS..."));

    try {
      // Mevcut proje için cursor rules oluştur
      const currentProjectConfig = {
        projectName: path.basename(process.cwd()),
        framework: "unknown",
        language: "javascript",
        cssFramework: "css",
        features: [],
        packageManager: "npm",
      };

      await createCursorRules(process.cwd(), currentProjectConfig);

      const initScript = path.join(__dirname, "..", "scripts", "init.js");
      if (await fs.pathExists(initScript)) {
        require(initScript);
      } else {
        console.log(chalk.yellow("⚠️  Init script not found"));
      }
    } catch (error) {
      console.error(chalk.red("Error during initialization:"), error.message);
    }
  });

// ============================================================================
// SETUP KOMUTU - Geliştirme ortamı kurulumu
// ============================================================================
program
  .command("setup")
  .description("Setup the development environment")
  .option("-p, --project <projectName>", "Setup specific project")
  .action(async (options) => {
    console.log(chalk.blue.bold("⚙️  Setting up EGKA AI AGENTS..."));

    try {
      const setupScript = path.join(__dirname, "..", "scripts", "setup.js");
      if (await fs.pathExists(setupScript)) {
        require(setupScript);
      } else {
        console.log(chalk.yellow("⚠️  Setup script not found"));
      }
    } catch (error) {
      console.error(chalk.red("Error during setup:"), error.message);
    }
  });

// ============================================================================
// INSTALL KOMUTU - Bağımlılık kurulumu
// ============================================================================
program
  .command("install")
  .description("Install dependencies")
  .option(
    "-p, --project <projectName>",
    "Install specific project dependencies"
  )
  .option("-a, --all", "Install all project dependencies")
  .action(async (options) => {
    console.log(chalk.blue.bold("📦 Installing dependencies..."));

    try {
      if (options.all) {
        await installAllDependencies();
      } else if (options.project) {
        await installProjectDependencies(options.project);
      } else {
        const installScript = path.join(
          __dirname,
          "..",
          "scripts",
          "install.js"
        );
        if (await fs.pathExists(installScript)) {
          require(installScript);
        } else {
          console.log(chalk.yellow("⚠️  Install script not found"));
        }
      }
    } catch (error) {
      console.error(chalk.red("Error during installation:"), error.message);
    }
  });

// ============================================================================
// TEST KOMUTU - Ajanlar arası iletişim testi
// ============================================================================
program
  .command("test-communication")
  .description("Test agent communication and task transfer")
  .option("-t, --task <taskId>", "Test with specific task ID")
  .action(async (options) => {
    console.log(chalk.blue.bold("🧪 Testing Agent Communication"));
    console.log(chalk.gray("─────────────────────────────────"));

    try {
      const taskId =
        options.task ||
        `TASK-${new Date().getFullYear()}-${
          Math.floor(Math.random() * 9000) + 1000
        }`;

      // Test senaryosu: Manager → Analyst → Developer
      console.log(chalk.yellow("🔄 Testing task transfer flow..."));

      // 1. Manager'dan Analyst'a
      await transferTask(
        "managerAgent",
        "analystAgent",
        taskId,
        "Test senaryosu - analiz için"
      );

      // 2. Analyst'dan Developer'a
      await transferTask(
        "analystAgent",
        "developerAgent",
        taskId,
        "Test senaryosu - geliştirme için"
      );

      // 3. Developer'dan Backend'e
      await transferTask(
        "developerAgent",
        "backendAgent",
        taskId,
        "Test senaryosu - backend için"
      );

      console.log(chalk.green("✅ Communication test completed!"));
      console.log(chalk.cyan(`📋 Check logs: egka-ai log --system`));
      console.log(chalk.cyan(`📋 Check task: egka-ai task --status ${taskId}`));
    } catch (error) {
      console.error(
        chalk.red("Error during communication test:"),
        error.message
      );
    }
  });

// ============================================================================
// WORKFLOW KOMUTU - Workflow yönetimi
// ============================================================================
program
  .command("workflow")
  .description("Workflow management commands")
  .option("-s, --status", "Show workflow status")
  .option("-r, --reset", "Reset workflow")
  .option("-p, --pause", "Pause workflow")
  .option("-c, --continue", "Continue workflow")
  .action(async (options) => {
    const workflowPath = path.join(
      __dirname,
      "..",
      "multi-agent",
      "orchestrator",
      "workflow.context7.json"
    );

    if (!(await fs.pathExists(workflowPath))) {
      console.log(
        chalk.red("❌ Workflow file not found. Run 'egka-ai init' first.")
      );
      return;
    }

    if (options.status) {
      await showWorkflowStatus(workflowPath);
    } else if (options.reset) {
      await resetWorkflow(workflowPath);
    } else if (options.pause) {
      await pauseWorkflow(workflowPath);
    } else if (options.continue) {
      await continueWorkflow(workflowPath);
    } else {
      console.log(
        chalk.yellow("💡 Use 'egka-ai workflow --help' for workflow options")
      );
    }
  });

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

// Ajanlar arası iletişim için log fonksiyonu
async function agentLog(agentName, message) {
  try {
    const logsPath = path.join(
      __dirname,
      "..",
      "multi-agent",
      "shared",
      "logs"
    );
    const logPath = path.join(logsPath, `${agentName}-agent.log`);

    // Log klasörünü oluştur
    await fs.ensureDir(logsPath);

    const timestamp = getReliableTimestamp();
    const logEntry = `[${timestamp}] ${message}\n`;

    await fs.appendFile(logPath, logEntry);

    // Sistem loguna da yaz
    const systemLogPath = path.join(logsPath, "system.log");
    const systemEntry = `[${timestamp}] [${agentName}] ${message}\n`;
    await fs.appendFile(systemLogPath, systemEntry);
  } catch (error) {
    console.error(chalk.red(`Log yazma hatası (${agentName}):`), error.message);
  }
}

// Task history güncelleme fonksiyonu
async function updateTaskHistory(taskId, agentName, action) {
  try {
    const tasksPath = path.join(
      __dirname,
      "..",
      "multi-agent",
      "shared",
      "tasks"
    );
    const taskPath = path.join(tasksPath, `${taskId}.context7.json`);

    if (await fs.pathExists(taskPath)) {
      const task = await fs.readJson(taskPath);

      if (!task.history) {
        task.history = [];
      }

      task.history.push({
        timestamp: getReliableTimestamp(),
        agent: agentName,
        action: action,
      });

      task.updatedAt = getReliableTimestamp();

      await fs.writeJson(taskPath, task, { spaces: 2 });
    }
  } catch (error) {
    console.error(chalk.red(`Task history güncelleme hatası:`), error.message);
  }
}

// Ajanlar arası iş devri fonksiyonu
async function transferTask(fromAgent, toAgent, taskId, reason = "") {
  const timestamp = getReliableTimestamp();

  // Gönderen ajan logu
  await agentLog(
    fromAgent,
    `TASK-${taskId} işini ${toAgent}'a devrettim. ${reason}`
  );

  // Alan ajan logu
  await agentLog(toAgent, `TASK-${taskId} işini devraldım.`);

  // Task history güncelle
  await updateTaskHistory(taskId, fromAgent, `İşi ${toAgent}'a devretti`);
  await updateTaskHistory(taskId, toAgent, "İşi devraldı");

  console.log(
    chalk.cyan(`🔄 ${fromAgent} → ${toAgent}: TASK-${taskId} devredildi`)
  );
}

async function listTasks(tasksPath) {
  try {
    const files = await fs.readdir(tasksPath);
    const taskFiles = files.filter((file) => file.endsWith(".context7.json"));

    console.log(chalk.blue.bold("📋 Available Tasks:"));
    console.log(chalk.gray("─────────────────────────────────"));

    if (taskFiles.length === 0) {
      console.log(chalk.yellow("No tasks found"));
      return;
    }

    for (const taskFile of taskFiles) {
      const taskPath = path.join(tasksPath, taskFile);
      const taskData = await fs.readJson(taskPath);

      const status = taskData.status || "unknown";
      const statusColor = getStatusColor(status);

      console.log(
        `${statusColor(`[${status.toUpperCase()}]`)} ${taskFile.replace(
          ".context7.json",
          ""
        )}`
      );
      if (taskData.description) {
        console.log(chalk.gray(`   ${taskData.description}`));
      }
    }
  } catch (error) {
    console.error(chalk.red("Error listing tasks:"), error.message);
  }
}

async function createTask(tasksPath) {
  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "taskId",
        message: "Task ID (TASK-YYYY-XXXX format):",
        default: `TASK-${new Date().getFullYear()}-${
          Math.floor(Math.random() * 9000) + 1000
        }`,
      },
      {
        type: "input",
        name: "description",
        message: "Task description:",
      },
      {
        type: "list",
        name: "priority",
        message: "Task priority:",
        choices: ["low", "medium", "high", "critical"],
        default: "medium",
      },
      {
        type: "list",
        name: "assignedAgent",
        message: "Assign to agent:",
        choices: ["manager", "analyst", "developer"],
        default: "analyst",
      },
    ]);

    const taskData = {
      id: answers.taskId,
      description: answers.description,
      priority: answers.priority,
      status: "pending",
      assignedAgent: answers.assignedAgent,
      createdAt: getReliableTimestamp(),
      updatedAt: getReliableTimestamp(),
    };

    const taskPath = path.join(tasksPath, `${answers.taskId}.context7.json`);
    await fs.writeJson(taskPath, taskData, { spaces: 2 });

    // Task oluşturulduğunda manager agent logu
    await agentLog(
      "managerAgent",
      `Yeni task oluşturuldu: ${answers.taskId} - ${answers.description}`
    );

    // Task'ı atanan ajan'a devret
    await transferTask(
      "managerAgent",
      answers.assignedAgent,
      answers.taskId,
      `Task oluşturuldu ve ${answers.assignedAgent}'a atandı`
    );

    console.log(chalk.green(`✅ Task created: ${answers.taskId}`));
    console.log(chalk.cyan(`🔄 Task ${answers.assignedAgent}'a devredildi`));
  } catch (error) {
    console.error(chalk.red("Error creating task:"), error.message);
  }
}

async function showTaskStatus(tasksPath, taskId) {
  try {
    const taskPath = path.join(tasksPath, `${taskId}.context7.json`);

    if (!(await fs.pathExists(taskPath))) {
      console.log(chalk.red(`❌ Task not found: ${taskId}`));
      return;
    }

    const taskData = await fs.readJson(taskPath);

    console.log(chalk.blue.bold(`📋 Task Status: ${taskId}`));
    console.log(chalk.gray("─────────────────────────────────"));
    console.log(chalk.white(`Description: ${taskData.description || "N/A"}`));
    console.log(
      chalk.white(
        `Status: ${getStatusColor(taskData.status || "unknown")(
          taskData.status || "unknown"
        )}`
      )
    );
    console.log(chalk.white(`Priority: ${taskData.priority || "N/A"}`));
    console.log(
      chalk.white(`Assigned Agent: ${taskData.assignedAgent || "N/A"}`)
    );
    console.log(chalk.white(`Created: ${taskData.createdAt || "N/A"}`));
    console.log(chalk.white(`Updated: ${taskData.updatedAt || "N/A"}`));

    // Task history göster
    if (taskData.history && taskData.history.length > 0) {
      console.log(chalk.cyan("\n📜 Task History:"));
      console.log(chalk.gray("─────────────────────────────────"));
      taskData.history.forEach((entry, index) => {
        const date = new Date(entry.timestamp);
        const formattedDate = formatDateForDisplay(date);
        console.log(
          chalk.white(
            `${index + 1}. [${formattedDate}] ${entry.agent}: ${entry.action}`
          )
        );
      });
    }
  } catch (error) {
    console.error(chalk.red("Error showing task status:"), error.message);
  }
}

async function deleteTask(tasksPath, taskId) {
  try {
    const taskPath = path.join(tasksPath, `${taskId}.context7.json`);

    if (!(await fs.pathExists(taskPath))) {
      console.log(chalk.red(`❌ Task not found: ${taskId}`));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to delete task ${taskId}?`,
        default: false,
      },
    ]);

    if (answers.confirm) {
      await fs.remove(taskPath);
      console.log(chalk.green(`✅ Task deleted: ${taskId}`));
    } else {
      console.log(chalk.yellow("❌ Task deletion cancelled"));
    }
  } catch (error) {
    console.error(chalk.red("Error deleting task:"), error.message);
  }
}

async function listAgents(agentsPath) {
  try {
    const files = await fs.readdir(agentsPath);
    const agentFiles = files.filter((file) => file.endsWith(".context7.json"));

    console.log(chalk.blue.bold("🤖 Available Agents:"));
    console.log(chalk.gray("─────────────────────────────────"));

    for (const agentFile of agentFiles) {
      const agentName = agentFile.replace(".context7.json", "");
      console.log(chalk.white(`• ${agentName}`));
    }
  } catch (error) {
    console.error(chalk.red("Error listing agents:"), error.message);
  }
}

async function showAgentStatus(agentsPath, agentName) {
  try {
    const agentPath = path.join(agentsPath, `${agentName}.context7.json`);

    if (!(await fs.pathExists(agentPath))) {
      console.log(chalk.red(`❌ Agent not found: ${agentName}`));
      return;
    }

    const agentData = await fs.readJson(agentPath);

    console.log(chalk.blue.bold(`🤖 Agent Status: ${agentName}`));
    console.log(chalk.gray("─────────────────────────────────"));
    console.log(chalk.white(`Status: ${agentData.status || "unknown"}`));
    console.log(chalk.white(`Last Active: ${agentData.lastActive || "N/A"}`));
    console.log(
      chalk.white(`Tasks Completed: ${agentData.tasksCompleted || 0}`)
    );
  } catch (error) {
    console.error(chalk.red("Error showing agent status:"), error.message);
  }
}

async function restartAgent(agentsPath, agentName) {
  try {
    const agentPath = path.join(agentsPath, `${agentName}.context7.json`);

    if (!(await fs.pathExists(agentPath))) {
      console.log(chalk.red(`❌ Agent not found: ${agentName}`));
      return;
    }

    const agentData = await fs.readJson(agentPath);
    agentData.status = "restarting";
    agentData.lastRestart = getReliableTimestamp();

    await fs.writeJson(agentPath, agentData, { spaces: 2 });

    console.log(chalk.green(`✅ Agent restarting: ${agentName}`));
  } catch (error) {
    console.error(chalk.red("Error restarting agent:"), error.message);
  }
}

async function listProjects() {
  const projects = ["mobile-app", "web-app", "admin-panel", "backend-api"];

  console.log(chalk.blue.bold("🏗️  Available Projects:"));
  console.log(chalk.gray("─────────────────────────────────"));

  for (const project of projects) {
    const projectPath = path.join(__dirname, "..", project);
    const exists = await fs.pathExists(projectPath);
    const status = exists
      ? chalk.green("✅ Active")
      : chalk.red("❌ Not Found");

    console.log(`${status} ${project}`);
  }
}

async function showProjectStatus(projectName) {
  const projectPath = path.join(__dirname, "..", projectName);

  if (!(await fs.pathExists(projectPath))) {
    console.log(chalk.red(`❌ Project not found: ${projectName}`));
    return;
  }

  const packageJsonPath = path.join(projectPath, "package.json");
  const hasPackageJson = await fs.pathExists(packageJsonPath);

  console.log(chalk.blue.bold(`🏗️  Project Status: ${projectName}`));
  console.log(chalk.gray("─────────────────────────────────"));
  console.log(chalk.white(`Path: ${projectPath}`));
  console.log(
    chalk.white(
      `Package.json: ${
        hasPackageJson ? chalk.green("✅ Found") : chalk.red("❌ Not Found")
      }`
    )
  );

  if (hasPackageJson) {
    try {
      const packageData = await fs.readJson(packageJsonPath);
      console.log(chalk.white(`Name: ${packageData.name || "N/A"}`));
      console.log(chalk.white(`Version: ${packageData.version || "N/A"}`));
    } catch (error) {
      console.log(chalk.red("Error reading package.json"));
    }
  }
}

async function installProjectDependencies(projectName) {
  const projectPath = path.join(__dirname, "..", projectName);

  if (!(await fs.pathExists(projectPath))) {
    console.log(chalk.red(`❌ Project not found: ${projectName}`));
    return;
  }

  console.log(chalk.blue(`📦 Installing dependencies for ${projectName}...`));

  try {
    const { execSync } = require("child_process");
    execSync("npm install", { cwd: projectPath, stdio: "inherit" });
    console.log(chalk.green(`✅ Dependencies installed for ${projectName}`));
  } catch (error) {
    console.error(
      chalk.red(`Error installing dependencies for ${projectName}:`),
      error.message
    );
  }
}

async function startDevelopmentServer(projectName) {
  const projectPath = path.join(__dirname, "..", projectName);

  if (!(await fs.pathExists(projectPath))) {
    console.log(chalk.red(`❌ Project not found: ${projectName}`));
    return;
  }

  console.log(
    chalk.blue(`🚀 Starting development server for ${projectName}...`)
  );

  try {
    const { execSync } = require("child_process");
    execSync("npm run dev", { cwd: projectPath, stdio: "inherit" });
  } catch (error) {
    console.error(
      chalk.red(`Error starting development server for ${projectName}:`),
      error.message
    );
  }
}

async function buildProject(projectName) {
  const projectPath = path.join(__dirname, "..", projectName);

  if (!(await fs.pathExists(projectPath))) {
    console.log(chalk.red(`❌ Project not found: ${projectName}`));
    return;
  }

  console.log(chalk.blue(`🔨 Building project ${projectName}...`));

  try {
    const { execSync } = require("child_process");
    execSync("npm run build", { cwd: projectPath, stdio: "inherit" });
    console.log(chalk.green(`✅ Project built: ${projectName}`));
  } catch (error) {
    console.error(
      chalk.red(`Error building project ${projectName}:`),
      error.message
    );
  }
}

async function installAllDependencies() {
  const projects = ["mobile-app", "web-app", "admin-panel", "backend-api"];

  console.log(chalk.blue("📦 Installing dependencies for all projects..."));

  for (const project of projects) {
    const projectPath = path.join(__dirname, "..", project);
    if (await fs.pathExists(projectPath)) {
      await installProjectDependencies(project);
    }
  }
}

async function showSystemLogs(logsPath, follow) {
  try {
    const systemLogPath = path.join(logsPath, "system.log");

    if (!(await fs.pathExists(systemLogPath))) {
      console.log(chalk.yellow("No system logs found"));
      return;
    }

    const logContent = await fs.readFile(systemLogPath, "utf8");
    console.log(chalk.blue.bold("📝 System Logs:"));
    console.log(chalk.gray("─────────────────────────────────"));
    console.log(logContent);
  } catch (error) {
    console.error(chalk.red("Error reading system logs:"), error.message);
  }
}

async function showAgentLogs(logsPath, agentName, follow) {
  try {
    const agentLogPath = path.join(logsPath, `${agentName}-agent.log`);

    if (!(await fs.pathExists(agentLogPath))) {
      console.log(chalk.yellow(`No logs found for agent: ${agentName}`));
      return;
    }

    const logContent = await fs.readFile(agentLogPath, "utf8");
    console.log(chalk.blue.bold(`📝 ${agentName} Agent Logs:`));
    console.log(chalk.gray("─────────────────────────────────"));
    console.log(logContent);
  } catch (error) {
    console.error(chalk.red("Error reading agent logs:"), error.message);
  }
}

async function showTaskLogs(logsPath, taskId, follow) {
  try {
    const taskReportsPath = path.join(logsPath, "task-reports.md");

    if (!(await fs.pathExists(taskReportsPath))) {
      console.log(chalk.yellow("No task reports found"));
      return;
    }

    const reportContent = await fs.readFile(taskReportsPath, "utf8");
    console.log(chalk.blue.bold(`📝 Task Reports:`));
    console.log(chalk.gray("─────────────────────────────────"));
    console.log(reportContent);
  } catch (error) {
    console.error(chalk.red("Error reading task logs:"), error.message);
  }
}

async function clearLogs(logsPath) {
  try {
    const answers = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Are you sure you want to clear all logs?",
        default: false,
      },
    ]);

    if (answers.confirm) {
      const files = await fs.readdir(logsPath);
      const logFiles = files.filter((file) => file.endsWith(".log"));

      for (const logFile of logFiles) {
        const logPath = path.join(logsPath, logFile);
        await fs.writeFile(logPath, "");
      }

      console.log(chalk.green("✅ All logs cleared"));
    } else {
      console.log(chalk.yellow("❌ Log clearing cancelled"));
    }
  } catch (error) {
    console.error(chalk.red("Error clearing logs:"), error.message);
  }
}

async function showWorkflowStatus(workflowPath) {
  try {
    const workflowData = await fs.readJson(workflowPath);

    console.log(chalk.blue.bold("🔄 Workflow Status:"));
    console.log(chalk.gray("─────────────────────────────────"));
    console.log(chalk.white(`Status: ${workflowData.status || "unknown"}`));
    console.log(
      chalk.white(`Current Step: ${workflowData.currentStep || "N/A"}`)
    );
    console.log(
      chalk.white(`Last Updated: ${workflowData.lastUpdated || "N/A"}`)
    );
  } catch (error) {
    console.error(chalk.red("Error reading workflow status:"), error.message);
  }
}

async function resetWorkflow(workflowPath) {
  try {
    const workflowData = await fs.readJson(workflowPath);
    workflowData.status = "reset";
    workflowData.currentStep = "initial";
    workflowData.lastUpdated = getReliableTimestamp();

    await fs.writeJson(workflowPath, workflowData, { spaces: 2 });

    console.log(chalk.green("✅ Workflow reset"));
  } catch (error) {
    console.error(chalk.red("Error resetting workflow:"), error.message);
  }
}

async function pauseWorkflow(workflowPath) {
  try {
    const workflowData = await fs.readJson(workflowPath);
    workflowData.status = "paused";
    workflowData.lastUpdated = getReliableTimestamp();

    await fs.writeJson(workflowPath, workflowData, { spaces: 2 });

    console.log(chalk.yellow("⏸️  Workflow paused"));
  } catch (error) {
    console.error(chalk.red("Error pausing workflow:"), error.message);
  }
}

async function continueWorkflow(workflowPath) {
  try {
    const workflowData = await fs.readJson(workflowPath);
    workflowData.status = "running";
    workflowData.lastUpdated = getReliableTimestamp();

    await fs.writeJson(workflowPath, workflowData, { spaces: 2 });

    console.log(chalk.green("▶️  Workflow continued"));
  } catch (error) {
    console.error(chalk.red("Error continuing workflow:"), error.message);
  }
}

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "completed":
    case "success":
      return chalk.green;
    case "in_progress":
    case "running":
      return chalk.blue;
    case "pending":
    case "waiting":
      return chalk.yellow;
    case "failed":
    case "error":
      return chalk.red;
    default:
      return chalk.gray;
  }
}

// ============================================================================
// YENİ FONKSİYONLAR - Proje oluşturma ve template yönetimi
// ============================================================================

async function createProjectWizard(options) {
  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Proje adını girin:",
        default: "my-egka-project",
        validate: (input) => {
          if (input.trim() === "") return "Proje adı boş olamaz";
          if (!/^[a-zA-Z0-9-_]+$/.test(input))
            return "Proje adı sadece harf, rakam, tire ve alt çizgi içerebilir";
          return true;
        },
      },
      {
        type: "list",
        name: "framework",
        message: "Framework seçin:",
        choices: [
          { name: "Next.js (React SSR)", value: "nextjs" },
          { name: "React (SPA)", value: "react" },
          { name: "Lovable (AI-powered)", value: "lovable" },
          { name: "Vue.js", value: "vue" },
          { name: "Svelte", value: "svelte" },
          { name: "Vanilla JavaScript", value: "vanilla" },
        ],
        default: "nextjs",
      },
      {
        type: "list",
        name: "language",
        message: "Programlama dili seçin:",
        choices: [
          { name: "TypeScript (Önerilen)", value: "typescript" },
          { name: "JavaScript", value: "javascript" },
        ],
        default: "typescript",
      },
      {
        type: "list",
        name: "cssFramework",
        message: "CSS Framework seçin:",
        choices: [
          { name: "Tailwind CSS (Önerilen)", value: "tailwind" },
          { name: "Radix UI + Tailwind", value: "radix" },
          { name: "Bootstrap", value: "bootstrap" },
          { name: "Material-UI", value: "mui" },
          { name: "Chakra UI", value: "chakra" },
          { name: "Ant Design", value: "antd" },
          { name: "Styled Components", value: "styled" },
          { name: "CSS Modules", value: "css-modules" },
          { name: "Sass/SCSS", value: "sass" },
          { name: "CSS (Vanilla)", value: "css" },
        ],
        default: "tailwind",
      },
      {
        type: "checkbox",
        name: "features",
        message: "Ek özellikler seçin:",
        choices: [
          { name: "Authentication", value: "auth" },
          { name: "Database Integration", value: "database" },
          { name: "API Routes", value: "api" },
          { name: "State Management", value: "state" },
          { name: "Testing Setup", value: "testing" },
          { name: "PWA Support", value: "pwa" },
          { name: "Internationalization", value: "i18n" },
          { name: "Dark Mode", value: "dark-mode" },
          { name: "Analytics", value: "analytics" },
          { name: "SEO Optimization", value: "seo" },
        ],
      },
      {
        type: "list",
        name: "packageManager",
        message: "Paket yöneticisi seçin:",
        choices: [
          { name: "npm", value: "npm" },
          { name: "yarn", value: "yarn" },
          { name: "pnpm", value: "pnpm" },
        ],
        default: "npm",
      },
      {
        type: "confirm",
        name: "includeGit",
        message: "Git repository oluşturulsun mu?",
        default: true,
      },
      {
        type: "confirm",
        name: "includeCI",
        message: "CI/CD pipeline eklenilsin mi?",
        default: false,
      },
    ]);

    await generateProject(answers);
  } catch (error) {
    console.error(chalk.red("Error in project wizard:"), error.message);
  }
}

async function generateProject(config) {
  const projectPath = path.join(process.cwd(), config.projectName);

  console.log(
    chalk.blue(`\n🚀 ${config.projectName} projesi oluşturuluyor...`)
  );

  try {
    // Framework'e özel CLI araçlarını kullanarak proje oluştur
    await createProjectWithFrameworkCLI(config);

    // Proje klasörüne geç
    const originalCwd = process.cwd();
    process.chdir(projectPath);

    // Konfigürasyon dosyaları oluştur
    await createConfigFiles(projectPath, config);

    // Özellik dosyaları oluştur
    await createFeatureFiles(projectPath, config);

    // Multi-agent sistemi oluştur
    await createMultiAgentSystem(projectPath, config);

    // Cursor rules oluştur
    await createCursorRules(projectPath, config);

    // Git init
    if (config.includeGit) {
      await initGit(projectPath);
    }

    // AI Agent ile multi-agent sistemini uyumlu hale getir
    await optimizeMultiAgentSystem(projectPath, config);

    // CI/CD setup
    if (config.includeCI) {
      await setupCI(projectPath, config);
    }

    // Orijinal dizine geri dön
    process.chdir(originalCwd);

    console.log(chalk.green("\n✅ Proje başarıyla oluşturuldu!"));
    console.log(chalk.cyan(`\n📂 Proje klasörü: ${projectPath}`));

    // Otomatik paket yükleme
    console.log(chalk.yellow("\n📦 Bağımlılıklar yükleniyor..."));
    try {
      const originalCwd = process.cwd();
      process.chdir(projectPath);

      const installCommand =
        config.packageManager === "yarn"
          ? "yarn install"
          : config.packageManager === "pnpm"
          ? "pnpm install"
          : "npm install --legacy-peer-deps";

      console.log(chalk.gray(`   ${installCommand} çalıştırılıyor...`));
      execSync(installCommand, { stdio: "inherit" });

      process.chdir(originalCwd);
      console.log(chalk.green("✅ Bağımlılıklar başarıyla yüklendi!"));

      console.log(chalk.cyan("\n🚀 Proje hazır! Hemen başlayabilirsiniz:"));
      console.log(chalk.white(`   cd ${config.projectName}`));
      console.log(
        chalk.white(
          `   ${config.packageManager} ${
            config.framework === "nextjs" ||
            config.framework === "lovable" ||
            config.framework === "react"
              ? "run dev"
              : "start"
          }`
        )
      );
    } catch (error) {
      console.log(
        chalk.yellow(
          "⚠️  Bağımlılık yükleme başarısız oldu, manuel olarak yükleyin:"
        )
      );
      console.log(chalk.white(`   cd ${config.projectName}`));
      console.log(
        chalk.white(
          `   ${
            config.packageManager === "npm"
              ? "npm install --legacy-peer-deps"
              : `${config.packageManager} install`
          }`
        )
      );
      console.log(
        chalk.white(
          `   ${config.packageManager} ${
            config.framework === "nextjs" ||
            config.framework === "lovable" ||
            config.framework === "react"
              ? "run dev"
              : "start"
          }`
        )
      );
    }

    // Özel talimatlar
    if (config.framework === "lovable") {
      console.log(chalk.yellow("\n💡 Lovable projesi için özel talimatlar:"));
      console.log(chalk.white("   - Lovable AI agent'ınızı yapılandırın"));
      console.log(
        chalk.white("   - API anahtarlarınızı .env dosyasına ekleyin")
      );

      if (config.cssFramework === "radix") {
        console.log(chalk.cyan("   - Radix UI + Tailwind entegrasyonu hazır"));
        console.log(
          chalk.white("   - Modern UI component'ları kullanabilirsiniz")
        );
      }
    }

    if (config.cssFramework === "radix") {
      console.log(chalk.yellow("\n🎨 Radix UI + Tailwind özellikleri:"));
      console.log(chalk.white("   - Modern, accessible UI component'ları"));
      console.log(chalk.white("   - Dark mode desteği"));
      console.log(chalk.white("   - Tailwind CSS ile tam entegrasyon"));
      console.log(chalk.white("   - TypeScript desteği"));
    }
  } catch (error) {
    console.error(chalk.red("Error generating project:"), error.message);
  }
}

async function selectTemplate(framework, cssFramework) {
  const templatesPath = path.join(__dirname, "..", "templates");
  const templateName = `${framework}-${cssFramework}`;
  const templatePath = path.join(templatesPath, templateName);

  if (await fs.pathExists(templatePath)) {
    return templatePath;
  }

  // Fallback template
  const fallbackPath = path.join(templatesPath, framework);
  if (await fs.pathExists(fallbackPath)) {
    return fallbackPath;
  }

  return null;
}

async function createDefaultTemplate(projectPath, config) {
  console.log(chalk.yellow("📝 Varsayılan template oluşturuluyor..."));

  // Temel dosya yapısı
  const structure = {
    src: {
      components: {},
      pages: {},
      styles: {},
      utils: {},
    },
    public: {},
    docs: {},
  };

  await createDirectoryStructure(projectPath, structure);

  // Framework-specific dosyalar
  await createFrameworkFiles(projectPath, config);
}

async function createDirectoryStructure(basePath, structure) {
  for (const [name, content] of Object.entries(structure)) {
    const fullPath = path.join(basePath, name);
    await fs.ensureDir(fullPath);

    if (typeof content === "object" && Object.keys(content).length > 0) {
      await createDirectoryStructure(fullPath, content);
    }
  }
}

async function createFrameworkFiles(projectPath, config) {
  const srcPath = path.join(projectPath, "src");

  // Framework-specific ana dosyalar
  switch (config.framework) {
    case "nextjs":
      await createNextJSFiles(projectPath, config);
      break;
    case "react":
      await createReactFiles(projectPath, config);
      break;
    case "lovable":
      await createLovableFiles(projectPath, config);
      break;
    case "vue":
      await createVueFiles(projectPath, config);
      break;
    case "svelte":
      await createSvelteFiles(projectPath, config);
      break;
    default:
      await createVanillaFiles(projectPath, config);
  }
}

async function createNextJSFiles(projectPath, config) {
  const pagesPath = path.join(projectPath, "pages");
  await fs.ensureDir(pagesPath);

  // _app.js/ts
  const appFile = config.language === "typescript" ? "_app.tsx" : "_app.js";
  const appContent = `import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}`;

  await fs.writeFile(path.join(pagesPath, appFile), appContent);

  // index.js/ts
  const indexFile = config.language === "typescript" ? "index.tsx" : "index.js";
  const indexContent = `export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to ${config.projectName}
        </h1>
        <p className="text-center text-gray-600">
          Built with Next.js and ${config.cssFramework}
        </p>
      </main>
    </div>
  )
}`;

  await fs.writeFile(path.join(pagesPath, indexFile), indexContent);
}

async function createReactFiles(projectPath, config) {
  const srcPath = path.join(projectPath, "src");
  const publicPath = path.join(projectPath, "public");

  // App.js/ts
  const appFile = config.language === "typescript" ? "App.tsx" : "App.js";
  const appContent = `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to ${config.projectName}</h1>
        <p>Built with React and ${config.cssFramework}</p>
      </header>
    </div>
  );
}

export default App;`;

  await fs.writeFile(path.join(srcPath, appFile), appContent);

  // index.js/ts
  const indexFile = config.language === "typescript" ? "index.tsx" : "index.js";
  const indexContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

  await fs.writeFile(path.join(srcPath, indexFile), indexContent);

  // App.css
  const appCssContent = `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.App-link {
  color: #61dafb;
}`;

  await fs.writeFile(path.join(srcPath, "App.css"), appCssContent);

  // index.css
  const indexCssContent = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`;

  await fs.writeFile(path.join(srcPath, "index.css"), indexCssContent);

  // public/index.html
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>${config.projectName}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;

  await fs.writeFile(path.join(publicPath, "index.html"), indexHtmlContent);

  // public/manifest.json
  const manifestContent = {
    short_name: config.projectName,
    name: config.projectName,
    icons: [
      {
        src: "favicon.ico",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/x-icon",
      },
    ],
    start_url: ".",
    display: "standalone",
    theme_color: "#000000",
    background_color: "#ffffff",
  };

  await fs.writeJson(path.join(publicPath, "manifest.json"), manifestContent, {
    spaces: 2,
  });

  // public/robots.txt
  const robotsContent = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:`;

  await fs.writeFile(path.join(publicPath, "robots.txt"), robotsContent);
}

async function createLovableFiles(projectPath, config) {
  const srcPath = path.join(projectPath, "src");

  // Lovable-specific dosyalar
  const lovableConfig = {
    aiAgent: true,
    contextAware: true,
    adaptiveUI: true,

    radixUI: config.cssFramework === "radix",
  };

  await fs.writeJson(
    path.join(projectPath, "lovable.config.json"),
    lovableConfig,
    { spaces: 2 }
  );

  // Ana Lovable component
  const lovableFile =
    config.language === "typescript" ? "LovableApp.tsx" : "LovableApp.js";

  const lovableContent =
    config.cssFramework === "radix"
      ? createLovableRadixContent(config)
      : createLovableDefaultContent(config);

  await fs.writeFile(path.join(srcPath, lovableFile), lovableContent);

  // Radix UI için utils dosyası
  if (config.cssFramework === "radix") {
    await createRadixUtils(projectPath, config);
  }
}

function createLovableRadixContent(config) {
  return `import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Toast from '@radix-ui/react-toast';
import { cn } from './lib/utils';
${
  config.features?.includes("state")
    ? `import { useAI, useTheme, useUser } from './state/utils';`
    : ""
}

interface LovableContext {
  userIntent: string;
  currentTask: string;
  aiSuggestions: string[];

}

function LovableApp() {
  ${
    config.features?.includes("state")
      ? `
  // Zustand stores
  const { context, updateIntent, updateTask, addSuggestion, addMessage } = useAI();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useUser();
  `
      : `
  const [context, setContext] = useState<LovableContext>({
    userIntent: '',
    currentTask: '',
    aiSuggestions: []
  });
  `
  }
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  useEffect(() => {
    // Lovable AI agent initialization
    console.log('Lovable AI Agent initialized with Radix UI');
    
    ${
      config.features?.includes("state")
        ? `
    // Initialize AI context with Zustand
    updateIntent('AI Assistant initialized');
    updateTask('Ready to help');
    addSuggestion('Try asking me something!');
    `
        : ""
    }
    

  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                ${config.projectName}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                AI-Powered with Lovable Framework + Radix UI
              </p>
            </div>
            
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => setIsAIPanelOpen(true)}
                    className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    AI Assistant
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white dark:bg-slate-100 dark:text-slate-900"
                    sideOffset={5}
                  >
                    Open AI Context Panel
                    <Tooltip.Arrow className="fill-slate-900 dark:fill-slate-100" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              AI Context
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Current Intent
                </label>
                <p className="text-slate-900 dark:text-slate-100">
                  {context.userIntent || 'None detected'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Current Task
                </label>
                <p className="text-slate-900 dark:text-slate-100">
                  {context.currentTask || 'Idle'}
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              AI Suggestions
            </h2>
            <div className="space-y-2">
              {context.aiSuggestions.length > 0 ? (
                context.aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="rounded-md bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  >
                    {suggestion}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400">
                  No suggestions available
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog.Root open={isAIPanelOpen} onOpenChange={setIsAIPanelOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
            <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              AI Assistant Panel
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Interact with your AI assistant
            </Dialog.Description>
            
            <Tabs.Root defaultValue="chat" className="mt-4">
              <Tabs.List className="flex space-x-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
                <Tabs.Trigger
                  value="chat"
                  className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-300 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100"
                >
                  Chat
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="context"
                  className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-300 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100"
                >
                  Context
                </Tabs.Trigger>
              </Tabs.List>
              
              <Tabs.Content value="chat" className="mt-4">
                <div className="rounded-md bg-slate-50 p-4 dark:bg-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Chat interface will be implemented here
                  </p>
                </div>
              </Tabs.Content>
              
              <Tabs.Content value="context" className="mt-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      User Intent
                    </label>
                    <input
                      type="text"
                      value={context.userIntent}
                      onChange={(e) => setContext(prev => ({ ...prev, userIntent: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      placeholder="Enter your intent..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Current Task
                    </label>
                    <input
                      type="text"
                      value={context.currentTask}
                      onChange={(e) => setContext(prev => ({ ...prev, currentTask: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      placeholder="Enter current task..."
                    />
                  </div>
                </div>
              </Tabs.Content>
            </Tabs.Root>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsAIPanelOpen(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Toast.Provider>
        <Toast.Viewport className="fixed bottom-0 right-0 z-50 m-0 flex w-full flex-col-reverse p-4 sm:right-0 sm:top-0 sm:bottom-auto sm:right-0 sm:w-auto" />
      </Toast.Provider>
    </div>
  );
}

export default LovableApp;`;
}

function createLovableDefaultContent(config) {
  return `import React, { useState, useEffect } from 'react';
import './LovableApp.css';

interface LovableContext {
  userIntent: string;
  currentTask: string;
  aiSuggestions: string[];
}

function LovableApp() {
  const [context, setContext] = useState<LovableContext>({
    userIntent: '',
    currentTask: '',
    aiSuggestions: []
  });

  useEffect(() => {
    // Lovable AI agent initialization
    console.log('Lovable AI Agent initialized');
  }, []);

  return (
    <div className="lovable-app">
      <header className="lovable-header">
        <h1>${config.projectName}</h1>
        <p>AI-Powered with Lovable Framework</p>
      </header>
      <main className="lovable-main">
        <div className="ai-context-panel">
          <h2>AI Context</h2>
          <p>Current Intent: {context.userIntent || 'None detected'}</p>
          <p>Current Task: {context.currentTask || 'Idle'}</p>
        </div>
      </main>
    </div>
  );
}

export default LovableApp;`;
}

async function createPackageJson(projectPath, config) {
  const packageData = {
    name: config.projectName,
    version: "0.1.0",
    private: true,
    scripts: getScripts(config),
    dependencies: getDependencies(config),
    devDependencies: getDevDependencies(config),
    browserslist: {
      production: [">0.2%", "not dead", "not op_mini all"],
      development: [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version",
      ],
    },
  };

  await fs.writeJson(path.join(projectPath, "package.json"), packageData, {
    spaces: 2,
  });
}

function getScripts(config) {
  const baseScripts = {
    start: "react-scripts start",
    build: "react-scripts build",
    test: "react-scripts test",
    eject: "react-scripts eject",
  };

  switch (config.framework) {
    case "nextjs":
      return {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      };
    case "react":
      return {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
        test: "vitest",
      };
    case "lovable":
      return {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
        "ai:train": "lovable train",
        "ai:deploy": "lovable deploy",
      };
    default:
      return baseScripts;
  }
}

function getDependencies(config) {
  const baseDeps = {
    react: "^18.2.0",
    "react-dom": "^18.2.0",
  };

  const frameworkDeps = {
    nextjs: {
      next: "^14.0.0",
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    },
    react: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    },
    lovable: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      "lovable-ai": "^1.0.0",
      "lovable-ui": "^1.0.0",
    },
  };

  const cssDeps = getCSSDependencies(config.cssFramework);
  const featureDeps = getFeatureDependencies(config.features);

  return {
    ...baseDeps,
    ...frameworkDeps[config.framework],
    ...cssDeps,
    ...featureDeps,
  };
}

function getCSSDependencies(cssFramework) {
  const cssDeps = {
    tailwind: {
      tailwindcss: "^3.3.0",
      autoprefixer: "^10.4.0",
      postcss: "^8.4.0",
    },
    radix: {
      tailwindcss: "^3.3.0",
      autoprefixer: "^10.4.0",
      postcss: "^8.4.0",
      "tailwindcss-animate": "^1.0.7",
      "@radix-ui/react-accordion": "^1.1.2",
      "@radix-ui/react-alert-dialog": "^1.0.5",
      "@radix-ui/react-aspect-ratio": "^1.0.3",
      "@radix-ui/react-avatar": "^1.0.4",
      "@radix-ui/react-checkbox": "^1.0.4",
      "@radix-ui/react-collapsible": "^1.0.3",
      "@radix-ui/react-context-menu": "^2.1.5",
      "@radix-ui/react-dialog": "^1.0.5",
      "@radix-ui/react-dropdown-menu": "^2.0.6",
      "@radix-ui/react-hover-card": "^1.0.7",
      "@radix-ui/react-label": "^2.0.2",
      "@radix-ui/react-menubar": "^1.0.4",
      "@radix-ui/react-navigation-menu": "^1.1.4",
      "@radix-ui/react-popover": "^1.0.7",
      "@radix-ui/react-progress": "^1.0.3",
      "@radix-ui/react-radio-group": "^1.1.3",
      "@radix-ui/react-scroll-area": "^1.0.5",
      "@radix-ui/react-select": "^2.0.0",
      "@radix-ui/react-separator": "^1.0.3",
      "@radix-ui/react-slider": "^1.1.2",
      "@radix-ui/react-slot": "^1.0.2",
      "@radix-ui/react-switch": "^1.0.3",
      "@radix-ui/react-tabs": "^1.0.4",
      "@radix-ui/react-toast": "^1.1.5",
      "@radix-ui/react-toggle": "^1.0.3",
      "@radix-ui/react-toggle-group": "^1.0.4",
      "@radix-ui/react-tooltip": "^1.0.7",
      "class-variance-authority": "^0.7.0",
      clsx: "^2.0.0",
      "tailwind-merge": "^2.0.0",
    },
    bootstrap: {
      bootstrap: "^5.3.0",
    },
    mui: {
      "@mui/material": "^5.14.0",
      "@emotion/react": "^11.11.0",
      "@emotion/styled": "^11.11.0",
    },
    chakra: {
      "@chakra-ui/react": "^2.8.0",
      "@emotion/react": "^11.11.0",
      "@emotion/styled": "^11.11.0",
      "framer-motion": "^10.16.0",
    },
    antd: {
      antd: "^5.12.0",
    },
    styled: {
      "styled-components": "^6.1.0",
    },
  };

  return cssDeps[cssFramework] || {};
}

function getFeatureDependencies(features) {
  const featureDeps = {
    state: {
      zustand: "^4.4.0",
    },
    auth: {
      "next-auth": "^4.24.0",
      jsonwebtoken: "^9.0.0",
    },
    database: {
      prisma: "^5.0.0",
      "@prisma/client": "^5.0.0",
    },
    api: {
      axios: "^1.5.0",
    },
    testing: {
      "@testing-library/react": "^13.4.0",
      "@testing-library/jest-dom": "^6.1.0",
      jest: "^29.6.0",
    },
    pwa: {
      "next-pwa": "^5.6.0",
    },
    i18n: {
      "next-i18next": "^14.0.0",
      "react-i18next": "^13.2.0",
    },
    analytics: {
      "@vercel/analytics": "^1.1.0",
    },
    seo: {
      "next-seo": "^6.4.0",
    },
  };

  if (!features || features.length === 0) {
    return {};
  }

  const selectedDeps = {};
  features.forEach((feature) => {
    if (featureDeps[feature]) {
      Object.assign(selectedDeps, featureDeps[feature]);
    }
  });

  return selectedDeps;
}

function getDevDependencies(config) {
  const baseDevDeps = {
    "@types/node": "^18.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
  };

  const frameworkDevDeps = {
    nextjs: {
      "@types/node": "^18.0.0",
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      eslint: "^8.0.0",
      "eslint-config-next": "^14.0.0",
    },
    react: {
      "@types/node": "^18.0.0",
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "@vitejs/plugin-react": "^4.1.0",
      vite: "^4.5.0",
      typescript: "^4.9.5",
    },
    lovable: {
      "@types/node": "^18.0.0",
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      vite: "^4.5.0",
      "@vitejs/plugin-react": "^4.1.0",
      typescript: "^5.0.0",
    },
  };

  return {
    ...baseDevDeps,
    ...frameworkDevDeps[config.framework],
  };
}

async function createConfigFiles(projectPath, config) {
  // TypeScript config
  if (config.language === "typescript") {
    const tsConfig = {
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "es6"],
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noFallthroughCasesInSwitch: true,
        module: "esnext",
        moduleResolution: "node",
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
      },
      include: ["src"],
    };

    await fs.writeJson(path.join(projectPath, "tsconfig.json"), tsConfig, {
      spaces: 2,
    });
  }

  // CSS Framework config
  await createCSSConfig(projectPath, config.cssFramework);

  // ESLint config
  await createESLintConfig(projectPath, config);

  // Gitignore
  await createGitignore(projectPath, config);
}

async function createCSSConfig(projectPath, cssFramework) {
  switch (cssFramework) {
    case "tailwind":
      const tailwindConfig = {
        content: [
          "./pages/**/*.{js,ts,jsx,tsx,mdx}",
          "./components/**/*.{js,ts,jsx,tsx,mdx}",
          "./app/**/*.{js,ts,jsx,tsx,mdx}",
        ],
        theme: {
          extend: {},
        },
        plugins: [],
      };

      await fs.writeJson(
        path.join(projectPath, "tailwind.config.js"),
        tailwindConfig,
        { spaces: 2 }
      );

      const postcssConfig = {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
        },
      };

      await fs.writeJson(
        path.join(projectPath, "postcss.config.js"),
        postcssConfig,
        { spaces: 2 }
      );
      break;

    case "radix":
      const radixTailwindConfig = {
        darkMode: ["class"],
        content: [
          "./pages/**/*.{js,ts,jsx,tsx,mdx}",
          "./components/**/*.{js,ts,jsx,tsx,mdx}",
          "./app/**/*.{js,ts,jsx,tsx,mdx}",
          "./src/**/*.{js,ts,jsx,tsx,mdx}",
        ],
        theme: {
          container: {
            center: true,
            padding: "2rem",
            screens: {
              "2xl": "1400px",
            },
          },
          extend: {
            colors: {
              border: "hsl(var(--border))",
              input: "hsl(var(--input))",
              ring: "hsl(var(--ring))",
              background: "hsl(var(--background))",
              foreground: "hsl(var(--foreground))",
              primary: {
                DEFAULT: "hsl(var(--primary))",
                foreground: "hsl(var(--primary-foreground))",
              },
              secondary: {
                DEFAULT: "hsl(var(--secondary))",
                foreground: "hsl(var(--secondary-foreground))",
              },
              destructive: {
                DEFAULT: "hsl(var(--destructive))",
                foreground: "hsl(var(--destructive-foreground))",
              },
              muted: {
                DEFAULT: "hsl(var(--muted))",
                foreground: "hsl(var(--muted-foreground))",
              },
              accent: {
                DEFAULT: "hsl(var(--accent))",
                foreground: "hsl(var(--accent-foreground))",
              },
              popover: {
                DEFAULT: "hsl(var(--popover))",
                foreground: "hsl(var(--popover-foreground))",
              },
              card: {
                DEFAULT: "hsl(var(--card))",
                foreground: "hsl(var(--card-foreground))",
              },
            },
            borderRadius: {
              lg: "var(--radius)",
              md: "calc(var(--radius) - 2px)",
              sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
              "accordion-down": {
                from: { height: "0" },
                to: { height: "var(--radix-accordion-content-height)" },
              },
              "accordion-up": {
                from: { height: "var(--radix-accordion-content-height)" },
                to: { height: "0" },
              },
            },
            animation: {
              "accordion-down": "accordion-down 0.2s ease-out",
              "accordion-up": "accordion-up 0.2s ease-out",
            },
          },
        },
        plugins: [],
      };

      await fs.writeJson(
        path.join(projectPath, "tailwind.config.js"),
        radixTailwindConfig,
        { spaces: 2 }
      );

      const radixPostcssConfig = {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
        },
      };

      await fs.writeJson(
        path.join(projectPath, "postcss.config.js"),
        radixPostcssConfig,
        { spaces: 2 }
      );

      // Radix UI için global CSS
      const globalCSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;

      const stylesPath = path.join(projectPath, "src", "styles");
      await fs.ensureDir(stylesPath);
      await fs.writeFile(path.join(stylesPath, "globals.css"), globalCSS);
      break;
  }
}

async function createFeatureFiles(projectPath, config) {
  const features = config.features || [];

  for (const feature of features) {
    switch (feature) {
      case "auth":
        await createAuthFeature(projectPath, config);
        break;
      case "database":
        await createDatabaseFeature(projectPath, config);
        break;
      case "api":
        await createAPIFeature(projectPath, config);
        break;
      case "state":
        await createStateFeature(projectPath, config);
        break;
      case "testing":
        await createTestingFeature(projectPath, config);
        break;
      case "pwa":
        await createPWAFeature(projectPath, config);
        break;
      case "i18n":
        await createI18nFeature(projectPath, config);
        break;
      case "dark-mode":
        await createDarkModeFeature(projectPath, config);
        break;
    }
  }
}

async function createAuthFeature(projectPath, config) {
  const authPath = path.join(projectPath, "src", "features", "auth");
  await fs.ensureDir(authPath);

  const authComponent = `import React from 'react';

export const AuthProvider = ({ children }) => {
  return (
    <div className="auth-provider">
      {children}
    </div>
  );
};

export const useAuth = () => {
  // Auth hook implementation
  return {
    user: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: false,
  };
};`;

  await fs.writeFile(path.join(authPath, "AuthProvider.js"), authComponent);
}

async function createDatabaseFeature(projectPath, config) {
  const dbPath = path.join(projectPath, "src", "features", "database");
  await fs.ensureDir(dbPath);

  const dbConfig = {
    type: "sqlite",
    host: "localhost",
    port: 5432,
    database: "app_db",
    username: "user",
    password: "password",
  };

  await fs.writeJson(path.join(dbPath, "config.json"), dbConfig, { spaces: 2 });
}

async function createAPIFeature(projectPath, config) {
  const apiPath = path.join(projectPath, "src", "api");
  await fs.ensureDir(apiPath);

  const apiClient = `const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const apiClient = {
  async get(endpoint) {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`);
    return response.json();
  },
  
  async post(endpoint, data) {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};`;

  await fs.writeFile(path.join(apiPath, "client.js"), apiClient);
}

async function createStateFeature(projectPath, config) {
  const statePath = path.join(projectPath, "src", "state");
  await fs.ensureDir(statePath);

  // Zustand store
  const zustandStore = `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User store
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: 'user-storage',
    }
  )
);

// Theme store
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
      },
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

// App settings store
interface AppSettings {
  language: string;
  notifications: boolean;
  autoSave: boolean;
  sidebarCollapsed: boolean;
}

interface AppSettingsState {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  language: 'tr',
  notifications: true,
  autoSave: true,
  sidebarCollapsed: false,
};

export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      updateSettings: (updates) => {
        const currentSettings = get().settings;
        set({ settings: { ...currentSettings, ...updates } });
      },
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'app-settings-storage',
    }
  )
);

// AI Context store (for Lovable projects)
interface AIContext {
  userIntent: string;
  currentTask: string;
  aiSuggestions: string[];
  conversationHistory: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

interface AIState {
  context: AIContext;
  updateIntent: (intent: string) => void;
  updateTask: (task: string) => void;
  addSuggestion: (suggestion: string) => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearContext: () => void;
}

const defaultAIContext: AIContext = {
  userIntent: '',
  currentTask: '',
  aiSuggestions: [],
  conversationHistory: [],
};

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      context: defaultAIContext,
      updateIntent: (intent) => {
        const currentContext = get().context;
        set({
          context: { ...currentContext, userIntent: intent },
        });
      },
      updateTask: (task) => {
        const currentContext = get().context;
        set({
          context: { ...currentContext, currentTask: task },
        });
      },
      addSuggestion: (suggestion) => {
        const currentContext = get().context;
        set({
          context: {
            ...currentContext,
            aiSuggestions: [...currentContext.aiSuggestions, suggestion],
          },
        });
      },
      addMessage: (role, content) => {
        const currentContext = get().context;
        const newMessage = {
          id: Date.now().toString(),
          role,
          content,
          timestamp: new Date(),
        };
        set({
          context: {
            ...currentContext,
            conversationHistory: [...currentContext.conversationHistory, newMessage],
          },
        });
      },
      clearContext: () => set({ context: defaultAIContext }),
    }),
    {
      name: 'ai-context-storage',
    }
  )
);

// Combined store hook for easy access
export const useAppStore = () => {
  const user = useUserStore();
  const theme = useThemeStore();
  const settings = useAppSettingsStore();
  const ai = useAIStore();

  return {
    user,
    theme,
    settings,
    ai,
  };
};`;

  await fs.writeFile(path.join(statePath, "store.ts"), zustandStore);

  // Store provider component
  const storeProvider = `import React from 'react';
import { useUserStore, useThemeStore, useAppSettingsStore, useAIStore } from './store';

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // Initialize stores
  useUserStore();
  useThemeStore();
  useAppSettingsStore();
  useAIStore();

  return <>{children}</>;
};

export default StoreProvider;`;

  await fs.writeFile(path.join(statePath, "provider.tsx"), storeProvider);

  // Store utilities
  const storeUtils = `import { useUserStore, useThemeStore, useAppSettingsStore, useAIStore } from './store';

// User utilities
export const useUser = () => {
  const { user, isAuthenticated, login, logout, updateUser } = useUserStore();
  return { user, isAuthenticated, login, logout, updateUser };
};

// Theme utilities
export const useTheme = () => {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  return { theme, toggleTheme, setTheme };
};

// Settings utilities
export const useSettings = () => {
  const { settings, updateSettings, resetSettings } = useAppSettingsStore();
  return { settings, updateSettings, resetSettings };
};

// AI utilities
export const useAI = () => {
  const { context, updateIntent, updateTask, addSuggestion, addMessage, clearContext } = useAIStore();
  return { context, updateIntent, updateTask, addSuggestion, addMessage, clearContext };
};

// Store selectors for performance
export const useUserSelector = (selector: (state: any) => any) => useUserStore(selector);
export const useThemeSelector = (selector: (state: any) => any) => useThemeStore(selector);
export const useSettingsSelector = (selector: (state: any) => any) => useAppSettingsStore(selector);
export const useAISelector = (selector: (state: any) => any) => useAIStore(selector);`;

  await fs.writeFile(path.join(statePath, "utils.ts"), storeUtils);
}

async function createTestingFeature(projectPath, config) {
  const testPath = path.join(projectPath, "src", "__tests__");
  await fs.ensureDir(testPath);

  const testSetup = `import '@testing-library/jest-dom';

// Test setup configuration
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));`;

  await fs.writeFile(path.join(testPath, "setup.js"), testSetup);
}

async function createPWAFeature(projectPath, config) {
  const publicPath = path.join(projectPath, "public");
  await fs.ensureDir(publicPath);

  const manifest = {
    short_name: "EgKa App",
    name: "EgKaSoft Application",
    icons: [
      {
        src: "favicon.ico",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/x-icon",
      },
    ],
    start_url: ".",
    display: "standalone",
    theme_color: "#000000",
    background_color: "#ffffff",
  };

  await fs.writeJson(path.join(publicPath, "manifest.json"), manifest, {
    spaces: 2,
  });
}

async function createI18nFeature(projectPath, config) {
  const i18nPath = path.join(projectPath, "src", "i18n");
  await fs.ensureDir(i18nPath);

  const trTranslations = {
    welcome: "Hoş Geldiniz",
    hello: "Merhaba",
    goodbye: "Güle Güle",
  };

  const enTranslations = {
    welcome: "Welcome",
    hello: "Hello",
    goodbye: "Goodbye",
  };

  await fs.writeJson(path.join(i18nPath, "tr.json"), trTranslations, {
    spaces: 2,
  });
  await fs.writeJson(path.join(i18nPath, "en.json"), enTranslations, {
    spaces: 2,
  });
}

async function createDarkModeFeature(projectPath, config) {
  const themePath = path.join(projectPath, "src", "theme");
  await fs.ensureDir(themePath);

  const themeConfig = {
    light: {
      background: "#ffffff",
      text: "#000000",
      primary: "#3b82f6",
      secondary: "#6b7280",
    },
    dark: {
      background: "#1f2937",
      text: "#f9fafb",
      primary: "#60a5fa",
      secondary: "#9ca3af",
    },
  };

  await fs.writeJson(path.join(themePath, "theme.json"), themeConfig, {
    spaces: 2,
  });
}

async function listTemplates(templatesPath) {
  try {
    const templates = await fs.readdir(templatesPath);

    console.log(chalk.blue.bold("📋 Available Templates:"));
    console.log(chalk.gray("─────────────────────────────────"));

    if (templates.length === 0) {
      console.log(chalk.yellow("No templates found"));
      return;
    }

    for (const template of templates) {
      const templatePath = path.join(templatesPath, template);
      const stats = await fs.stat(templatePath);

      if (stats.isDirectory()) {
        console.log(chalk.white(`• ${template}`));
      }
    }
  } catch (error) {
    console.error(chalk.red("Error listing templates:"), error.message);
  }
}

async function showTemplateInfo(templatesPath, templateName) {
  try {
    const templatePath = path.join(templatesPath, templateName);

    if (!(await fs.pathExists(templatePath))) {
      console.log(chalk.red(`❌ Template not found: ${templateName}`));
      return;
    }

    const infoPath = path.join(templatePath, "template.json");

    if (await fs.pathExists(infoPath)) {
      const info = await fs.readJson(infoPath);

      console.log(chalk.blue.bold(`📋 Template Info: ${templateName}`));
      console.log(chalk.gray("─────────────────────────────────"));
      console.log(chalk.white(`Name: ${info.name || templateName}`));
      console.log(
        chalk.white(`Description: ${info.description || "No description"}`)
      );
      console.log(chalk.white(`Framework: ${info.framework || "Unknown"}`));
      console.log(
        chalk.white(`CSS Framework: ${info.cssFramework || "Unknown"}`)
      );
      console.log(chalk.white(`Version: ${info.version || "1.0.0"}`));
    } else {
      console.log(
        chalk.yellow(`No info file found for template: ${templateName}`)
      );
    }
  } catch (error) {
    console.error(chalk.red("Error showing template info:"), error.message);
  }
}

async function createTemplate(templatesPath, templateName) {
  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Template name:",
        default: templateName,
      },
      {
        type: "input",
        name: "description",
        message: "Template description:",
      },
      {
        type: "list",
        name: "framework",
        message: "Framework:",
        choices: ["nextjs", "react", "vue", "svelte", "vanilla"],
      },
      {
        type: "list",
        name: "cssFramework",
        message: "CSS Framework:",
        choices: [
          "tailwind",
          "bootstrap",
          "mui",
          "chakra",
          "antd",
          "styled",
          "css",
        ],
      },
    ]);

    const templatePath = path.join(templatesPath, templateName);
    await fs.ensureDir(templatePath);

    const templateInfo = {
      name: answers.name,
      description: answers.description,
      framework: answers.framework,
      cssFramework: answers.cssFramework,
      version: "1.0.0",
      createdAt: getReliableTimestamp(),
    };

    await fs.writeJson(path.join(templatePath, "template.json"), templateInfo, {
      spaces: 2,
    });

    console.log(chalk.green(`✅ Template created: ${templateName}`));
  } catch (error) {
    console.error(chalk.red("Error creating template:"), error.message);
  }
}

async function deleteTemplate(templatesPath, templateName) {
  try {
    const templatePath = path.join(templatesPath, templateName);

    if (!(await fs.pathExists(templatePath))) {
      console.log(chalk.red(`❌ Template not found: ${templateName}`));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to delete template ${templateName}?`,
        default: false,
      },
    ]);

    if (answers.confirm) {
      await fs.remove(templatePath);
      console.log(chalk.green(`✅ Template deleted: ${templateName}`));
    } else {
      console.log(chalk.yellow("❌ Template deletion cancelled"));
    }
  } catch (error) {
    console.error(chalk.red("Error deleting template:"), error.message);
  }
}

async function addNewAgent(agentsPath, agentName) {
  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "description",
        message: "Agent description:",
      },
      {
        type: "list",
        name: "type",
        message: "Agent type:",
        choices: ["manager", "analyst", "developer", "specialist", "custom"],
      },
      {
        type: "input",
        name: "capabilities",
        message: "Agent capabilities (comma-separated):",
      },
    ]);

    const agentData = {
      name: agentName,
      description: answers.description,
      type: answers.type,
      capabilities: answers.capabilities.split(",").map((cap) => cap.trim()),
      status: "active",
      createdAt: getReliableTimestamp(),
      lastActive: getReliableTimestamp(),
      tasksCompleted: 0,
    };

    const agentPath = path.join(agentsPath, `${agentName}.context7.json`);
    await fs.writeJson(agentPath, agentData, { spaces: 2 });

    console.log(chalk.green(`✅ Agent created: ${agentName}`));
  } catch (error) {
    console.error(chalk.red("Error creating agent:"), error.message);
  }
}

async function deleteAgent(agentsPath, agentName) {
  try {
    const agentPath = path.join(agentsPath, `${agentName}.context7.json`);

    if (!(await fs.pathExists(agentPath))) {
      console.log(chalk.red(`❌ Agent not found: ${agentName}`));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to delete agent ${agentName}?`,
        default: false,
      },
    ]);

    if (answers.confirm) {
      await fs.remove(agentPath);
      console.log(chalk.green(`✅ Agent deleted: ${agentName}`));
    } else {
      console.log(chalk.yellow("❌ Agent deletion cancelled"));
    }
  } catch (error) {
    console.error(chalk.red("Error deleting agent:"), error.message);
  }
}

async function configureAgent(agentsPath, agentName) {
  try {
    const agentPath = path.join(agentsPath, `${agentName}.context7.json`);

    if (!(await fs.pathExists(agentPath))) {
      console.log(chalk.red(`❌ Agent not found: ${agentName}`));
      return;
    }

    const agentData = await fs.readJson(agentPath);

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "description",
        message: "Agent description:",
        default: agentData.description || "",
      },
      {
        type: "list",
        name: "status",
        message: "Agent status:",
        choices: ["active", "inactive", "maintenance"],
        default: agentData.status || "active",
      },
      {
        type: "input",
        name: "capabilities",
        message: "Agent capabilities (comma-separated):",
        default: agentData.capabilities
          ? agentData.capabilities.join(", ")
          : "",
      },
    ]);

    agentData.description = answers.description;
    agentData.status = answers.status;
    agentData.capabilities = answers.capabilities
      .split(",")
      .map((cap) => cap.trim());
    agentData.updatedAt = getReliableTimestamp();

    await fs.writeJson(agentPath, agentData, { spaces: 2 });

    console.log(chalk.green(`✅ Agent configured: ${agentName}`));
  } catch (error) {
    console.error(chalk.red("Error configuring agent:"), error.message);
  }
}

async function createESLintConfig(projectPath, config) {
  const eslintConfig = {
    extends: [
      "next/core-web-vitals",
      "eslint:recommended",
      "@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  };

  await fs.writeJson(path.join(projectPath, ".eslintrc.json"), eslintConfig, {
    spaces: 2,
  });
}

async function createGitignore(projectPath, config) {
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
/build
/dist
/.next/
/out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Lovable AI cache
.lovable-cache/
ai-models/
`;

  await fs.writeFile(path.join(projectPath, ".gitignore"), gitignoreContent);
}

async function initGit(projectPath) {
  try {
    const { execSync } = require("child_process");
    execSync("git init", { cwd: projectPath, stdio: "inherit" });
    execSync("git add .", { cwd: projectPath, stdio: "inherit" });
    execSync('git commit -m "Initial commit"', {
      cwd: projectPath,
      stdio: "inherit",
    });
    console.log(chalk.green("✅ Git repository initialized"));
  } catch (error) {
    console.log(
      chalk.yellow("⚠️  Git initialization failed, but project was created")
    );
  }
}

async function setupCI(projectPath, config) {
  const ciPath = path.join(projectPath, ".github", "workflows");
  await fs.ensureDir(ciPath);

  const ciConfig = {
    name: "CI/CD Pipeline",
    on: {
      push: {
        branches: ["main", "develop"],
      },
      pull_request: {
        branches: ["main"],
      },
    },
    jobs: {
      build: {
        runs_on: "ubuntu-latest",
        steps: [
          {
            name: "Checkout",
            uses: "actions/checkout@v3",
          },
          {
            name: "Setup Node.js",
            uses: "actions/setup-node@v3",
            with: {
              "node-version": "18",
              cache: "npm",
            },
          },
          {
            name: "Install dependencies",
            run: "npm ci",
          },
          {
            name: "Run tests",
            run: "npm test",
          },
          {
            name: "Build",
            run: "npm run build",
          },
        ],
      },
    },
  };

  await fs.writeJson(path.join(ciPath, "ci.yml"), ciConfig, { spaces: 2 });
  console.log(chalk.green("✅ CI/CD pipeline configured"));
}

async function createVueFiles(projectPath, config) {
  const srcPath = path.join(projectPath, "src");

  const mainFile = config.language === "typescript" ? "main.ts" : "main.js";
  const mainContent = `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`;

  await fs.writeFile(path.join(srcPath, mainFile), mainContent);

  const appFile = "App.vue";
  const appContent = `<template>
  <div id="app">
    <header>
      <h1>Welcome to ${config.projectName}</h1>
      <p>Built with Vue.js and ${config.cssFramework}</p>
    </header>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>`;

  await fs.writeFile(path.join(srcPath, appFile), appContent);
}

async function createSvelteFiles(projectPath, config) {
  const srcPath = path.join(projectPath, "src");

  const appFile = "App.svelte";
  const appContent = `<script>
  let name = '${config.projectName}';
</script>

<main>
  <h1>Welcome to {name}</h1>
  <p>Built with Svelte and ${config.cssFramework}</p>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>`;

  await fs.writeFile(path.join(srcPath, appFile), appContent);

  const mainFile = config.language === "typescript" ? "main.ts" : "main.js";
  const mainContent = `import App from './App.svelte';

const app = new App({
  target: document.body,
});

export default app;`;

  await fs.writeFile(path.join(srcPath, mainFile), mainContent);
}

async function createVanillaFiles(projectPath, config) {
  const srcPath = path.join(projectPath, "src");

  const indexFile = "index.html";
  const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.projectName}</title>
  <link rel="stylesheet" href="styles/main.css">
</head>
<body>
  <div id="app">
    <header>
      <h1>Welcome to ${config.projectName}</h1>
      <p>Built with Vanilla JavaScript and ${config.cssFramework}</p>
    </header>
  </div>
  <script src="js/main.js"></script>
</body>
</html>`;

  await fs.writeFile(path.join(projectPath, indexFile), indexContent);

  const jsPath = path.join(srcPath, "js");
  await fs.ensureDir(jsPath);

  const mainJS = `// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
  console.log('${config.projectName} loaded successfully!');
});`;

  await fs.writeFile(path.join(jsPath, "main.js"), mainJS);

  const stylesPath = path.join(srcPath, "styles");
  await fs.ensureDir(stylesPath);

  const mainCSS = `/* Main CSS file */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

#app {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

header {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  color: #666;
}`;

  await fs.writeFile(path.join(stylesPath, "main.css"), mainCSS);
}

async function createRadixUtils(projectPath, config) {
  const libPath = path.join(projectPath, "src", "lib");
  await fs.ensureDir(libPath);

  const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;

  await fs.writeFile(path.join(libPath, "utils.ts"), utilsContent);

  // Radix UI components
  const componentsPath = path.join(projectPath, "src", "components", "ui");
  await fs.ensureDir(componentsPath);

  // Button component
  const buttonContent = `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`;

  await fs.writeFile(path.join(componentsPath, "button.tsx"), buttonContent);

  // Card component
  const cardContent = `import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }`;

  await fs.writeFile(path.join(componentsPath, "card.tsx"), cardContent);
}

async function createCursorRules(projectPath, config) {
  console.log(chalk.yellow("📝 Cursor rules oluşturuluyor..."));

  const cursorRulesPath = path.join(projectPath, ".cursor", "rules");
  await fs.ensureDir(cursorRulesPath);

  const newChatRulesContent = `# EGKA AI AGENTS - New Chat Rules

## Multi-Agent System Rules

### Agent Activation Rules

Her yeni chat başlangıcında aşağıdaki multi-agent sistemi otomatik olarak devreye girer:

#### 1. Manager Agent Activation
- **Trigger:** Kullanıcı herhangi bir komut girdiğinde
- **Action:** "Merhaba! Multi-Agent Sistemine hoş geldiniz. Görevinizi alıyorum ve analist ajanımıza aktarıyorum."
- **Next Step:** Görevi analist agent'a aktarır ve proje kapsamını belirler

#### 2. Analyst Agent Activation
- **Trigger:** Manager'dan gelen görev
- **Action:**
  - Auto increment ID ile task oluşturur (TASK-2025-1000 formatında)
  - Task context dosyası oluşturur: \`multi-agent/shared/tasks/TASK-XXXX-XXXX.context7.json\`
  - Proje türüne göre uygun agent'a atar (developer/backend)
  - Multi-project desteği ile tüm projeleri analiz eder

#### 3. Developer Agent Activation (Frontend)
- **Trigger:** Frontend/UI ile ilgili task'lar
- **Action:**
  - Task context dosyasını okur
  - React Native (mobile), React (admin panel) veya Next.js (web-app) geliştirme yapar
  - Backend gereksinimlerini backend agent'a devreder
  - Shared log'a yazar
  - Task durumunu günceller

#### 4. Backend Agent Activation
- **Trigger:** Backend/API ile ilgili task'lar
- **Action:**
  - Task context dosyasını okur
  - Node.js/Express API geliştirme yapar
  - Firebase entegrasyonu ve authentication işlemleri
  - Shared log'a yazar
  - Task durumunu günceller

## File Structure

\`\`\`
multi-agent/
├── agents/
│   ├── managerAgent.context7.json
│   ├── analystAgent.context7.json
│   ├── developerAgent.context7.json
│   └── backendAgent.context7.json
├── shared/
│   ├── tasks/          # Task context dosyaları
│   └── logs/           # Shared log dosyaları
└── orchestrator/       # Agent koordinasyonu
\`\`\`

## Project Structure

\`\`\`
${config.projectName}/
├── mobile-app/         # React Native mobile app
├── admin-panel/        # React admin dashboard
├── web-app/           # Next.js web application
└── backend-api/        # Node.js Express API
\`\`\`

## Workflow

1. User Input → Manager Agent (Greeting + Project Identification)
2. Manager → Analyst Agent (Task Creation + Context File + Agent Assignment)
3. Analyst → Shared Tasks (TASK-XXXX-XXXX.context7.json)
4. Agent Assignment:
   - Frontend Tasks → Developer Agent (React Native/React/Next.js)
   - Backend Tasks → Backend Agent (Node.js/Express)
   - Full-stack Tasks → Both Agents (Coordinated)
5. Agent Execution → Reads Task → Executes → Logs → Updates Status

## Logging

- Tüm aktiviteler \`multi-agent/shared/logs/\` klasöründe loglanır
- Task durumları \`multi-agent/shared/tasks/\` klasöründe takip edilir
- Her agent'ın kendi log dosyası vardır:
  - \`manager-agent.log\`
  - \`analyst-agent.log\`
  - \`developer-agent.log\`
  - \`backend-agent.log\`
  - \`system.log\`

## Multi-Project Support

- **mobile-app**: React Native/Expo mobile app
- **admin-panel**: React/TypeScript admin dashboard
- **web-app**: Next.js web application
- **backend-api**: Node.js/Express API server

Her proje için uygun agent'lar otomatik olarak seçilir ve görevler dağıtılır.

## Framework Specific Rules

### ${
    config.framework === "nextjs"
      ? "Next.js"
      : config.framework === "react"
      ? "React"
      : config.framework === "lovable"
      ? "Lovable"
      : config.framework === "vue"
      ? "Vue.js"
      : config.framework === "svelte"
      ? "Svelte"
      : "Vanilla"
  } Projects

${
  config.framework === "nextjs"
    ? `
- Use Next.js 14+ with App Router
- Implement TypeScript for type safety
- Use Server Components where appropriate
- Follow Next.js best practices for routing and data fetching
`
    : config.framework === "react"
    ? `
- Use React 18+ with modern hooks
- Implement TypeScript for type safety
- Use functional components with hooks
- Follow React best practices
`
    : config.framework === "lovable"
    ? `
- Use Lovable AI-powered framework
- Implement AI-driven development patterns
- Use modern UI components with Radix UI
- Follow Lovable best practices
`
    : config.framework === "vue"
    ? `
- Use Vue 3 with Composition API
- Implement TypeScript for type safety
- Use modern Vue patterns
- Follow Vue best practices
`
    : config.framework === "svelte"
    ? `
- Use Svelte 5 with modern syntax
- Implement TypeScript for type safety
- Use Svelte stores for state management
- Follow Svelte best practices
`
    : `
- Use modern JavaScript/TypeScript
- Follow vanilla JS best practices
- Implement modular architecture
`
}

### CSS Framework: ${config.cssFramework}

${
  config.cssFramework === "radix"
    ? `
- Use Radix UI + Tailwind CSS
- Implement accessible UI components
- Use Tailwind utility classes
- Follow Radix UI design patterns
`
    : config.cssFramework === "tailwind"
    ? `
- Use Tailwind CSS for styling
- Follow utility-first approach
- Use Tailwind components
- Implement responsive design
`
    : `
- Use ${config.cssFramework} for styling
- Follow ${config.cssFramework} best practices
- Implement responsive design
`
}

## Language Rules

### ${config.language === "typescript" ? "TypeScript" : "JavaScript"}

${
  config.language === "typescript"
    ? `
- Use strict TypeScript configuration
- Define proper interfaces and types
- Use type annotations for all functions
- Follow TypeScript best practices
`
    : `
- Use modern JavaScript (ES6+)
- Use proper variable declarations (const/let)
- Follow JavaScript best practices
`
}

## Feature Rules

${
  config.features && config.features.length > 0
    ? config.features
        .map((feature) => {
          switch (feature) {
            case "auth":
              return `
### Authentication
- Implement secure authentication
- Use NextAuth.js or similar
- Follow security best practices
- Implement proper session management
`;
            case "database":
              return `
### Database Integration
- Use Prisma ORM
- Implement proper database schema
- Follow database best practices
- Use migrations for schema changes
`;
            case "api":
              return `
### API Routes
- Implement RESTful API endpoints
- Use proper HTTP methods
- Implement error handling
- Follow API design best practices
`;
            case "state":
              return `
### State Management
- Use Zustand for state management
- Implement proper store structure
- Use persistence middleware
- Follow state management best practices
`;
            case "testing":
              return `
### Testing
- Use Jest and Testing Library
- Write unit and integration tests
- Follow testing best practices
- Maintain good test coverage
`;
            case "pwa":
              return `
### PWA Support
- Implement service workers
- Use Next PWA or similar
- Follow PWA best practices
- Implement offline functionality
`;
            case "i18n":
              return `
### Internationalization
- Use i18next for translations
- Implement proper locale handling
- Follow i18n best practices
- Support multiple languages
`;
            case "darkMode":
              return `
### Dark Mode
- Implement theme switching
- Use CSS variables for theming
- Follow dark mode best practices
- Ensure accessibility
`;
            default:
              return "";
          }
        })
        .join("")
    : ""
}

## Communication Rules

- Ajanlar, her zaman Türkçe cevaplar vermeli
- Kod yorumları Türkçe olmalı
- Değişken ve fonksiyon isimleri İngilizce olmalı
- Dosya isimleri İngilizce olmalı

## Code Quality Rules

- ESLint kurallarına uyulmalı
- Prettier ile kod formatlanmalı
- TypeScript strict mode kullanılmalı
- Modern JavaScript/TypeScript özellikleri kullanılmalı
- Accessibility (a11y) standartlarına uyulmalı
- Performance optimizasyonları yapılmalı

## Security Rules

- Environment variables kullanılmalı
- API anahtarları güvenli şekilde saklanmalı
- Input validation yapılmalı
- XSS ve CSRF koruması sağlanmalı
- HTTPS kullanılmalı

## Performance Rules

- Code splitting uygulanmalı
- Lazy loading kullanılmalı
- Image optimization yapılmalı
- Bundle size optimize edilmeli
- Caching stratejileri uygulanmalı

---

**Bu dosya otomatik olarak oluşturulmuştur ve "always" seçili olmalıdır.**
`;

  await fs.writeFile(
    path.join(cursorRulesPath, "new-chat-rules.mdc"),
    newChatRulesContent
  );
  console.log(chalk.green("✅ Cursor rules oluşturuldu"));
}

async function createProjectWithFrameworkCLI(config) {
  const projectPath = path.join(process.cwd(), config.projectName);

  console.log(
    chalk.yellow("📦 Framework CLI aracı ile proje oluşturuluyor...")
  );

  try {
    switch (config.framework) {
      case "nextjs":
        await createNextJSProject(config);
        break;
      case "react":
        await createReactProject(config);
        break;
      case "lovable":
        await createLovableProject(config);
        break;
      case "vue":
        await createVueProject(config);
        break;
      case "svelte":
        await createSvelteProject(config);
        break;
      default:
        await createVanillaProject(config);
    }

    console.log(chalk.green("✅ Framework projesi oluşturuldu"));
  } catch (error) {
    console.log(
      chalk.yellow("⚠️  Framework CLI hatası, manuel oluşturma yapılıyor...")
    );
    await createProjectManually(config);
  }
}

async function createNextJSProject(config) {
  // Next.js projesi oluştur
  const createCommand = `npx create-next-app@latest ${
    config.projectName
  } --typescript=${config.language === "typescript"} --tailwind=${
    config.cssFramework === "tailwind"
  } --eslint --app --src-dir --import-alias "@/*" --yes`;

  console.log(chalk.gray(`   ${createCommand}`));
  execSync(createCommand, { stdio: "inherit" });
}

async function createReactProject(config) {
  // Vite ile React projesi oluştur (Create React App deprecated)
  const template = config.language === "typescript" ? "react-ts" : "react";
  const createCommand = `npm create vite@latest ${config.projectName} -- --template ${template} --yes`;

  console.log(chalk.gray(`   ${createCommand}`));
  execSync(createCommand, { stdio: "inherit" });
}

async function createLovableProject(config) {
  // Lovable projesi oluştur (varsayılan olarak Vite kullan)
  const createCommand = `npm create vite@latest ${config.projectName} -- --template react-ts --yes`;

  console.log(chalk.gray(`   ${createCommand}`));
  execSync(createCommand, { stdio: "inherit" });
}

async function createVueProject(config) {
  // Vue projesi oluştur
  const createCommand = `npm create vue@latest ${
    config.projectName
  } -- --typescript=${
    config.language === "typescript"
  } --router --pinia --eslint --yes`;

  console.log(chalk.gray(`   ${createCommand}`));
  execSync(createCommand, { stdio: "inherit" });
}

async function createSvelteProject(config) {
  // Svelte projesi oluştur
  const template =
    config.language === "typescript" ? "skeleton-typescript" : "skeleton";
  const createCommand = `npm create svelte@latest ${config.projectName} -- --template ${template} --eslint --prettier --yes`;

  console.log(chalk.gray(`   ${createCommand}`));
  execSync(createCommand, { stdio: "inherit" });
}

async function createVanillaProject(config) {
  const projectPath = path.join(process.cwd(), config.projectName);

  // Vanilla projesi oluştur
  await fs.ensureDir(projectPath);

  // Basit HTML yapısı
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.projectName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app">
        <h1>Welcome to ${config.projectName}</h1>
        <p>Built with Vanilla JavaScript</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`;

  await fs.writeFile(path.join(projectPath, "index.html"), htmlContent);

  // CSS dosyası
  const cssContent = `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

#app {
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}`;

  await fs.writeFile(path.join(projectPath, "styles.css"), cssContent);

  // JavaScript dosyası
  const jsContent = `console.log('${config.projectName} is running!');

// Your JavaScript code here
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded successfully');
});`;

  await fs.writeFile(path.join(projectPath, "script.js"), jsContent);
}

async function createProjectManually(config) {
  const projectPath = path.join(process.cwd(), config.projectName);

  console.log(chalk.yellow("📝 Manuel proje oluşturuluyor..."));

  // Proje klasörü oluştur
  await fs.ensureDir(projectPath);

  // Template seçimi
  const templatePath = await selectTemplate(
    config.framework,
    config.cssFramework
  );

  if (templatePath && (await fs.pathExists(templatePath))) {
    // Template dosyalarını kopyala
    await fs.copy(templatePath, projectPath);
    console.log(chalk.green("✅ Template dosyalarını kopyalandı"));
  } else {
    // Varsayılan template oluştur
    await createDefaultTemplate(projectPath, config);
  }

  // Package.json oluştur
  await createPackageJson(projectPath, config);
}

async function optimizeMultiAgentSystem(projectPath, config) {
  console.log(
    chalk.yellow("🤖 AI Agent multi-agent sistemini optimize ediyor...")
  );

  try {
    // Kullanıcıdan proje açıklaması al
    const projectDescription = await getProjectDescription();

    // Multi-agent sistemini optimize et
    await updateMultiAgentContext(projectPath, config, projectDescription);

    // Agent'ları proje özelliklerine göre güncelle
    await updateAgentConfigurations(projectPath, config, projectDescription);

    // Workflow'u optimize et
    await optimizeWorkflow(projectPath, config, projectDescription);

    console.log(chalk.green("✅ Multi-agent sistemi optimize edildi"));
    console.log(
      chalk.cyan("💡 Proje context'i güncellendi ve agent'lar hazırlandı")
    );
  } catch (error) {
    console.log(
      chalk.yellow("⚠️  Multi-agent optimizasyonu atlandı: " + error.message)
    );
  }
}

async function getProjectDescription() {
  console.log(chalk.blue("\n📝 Proje açıklaması gerekli"));
  console.log(
    chalk.gray(
      "Multi-agent sisteminin projenizi daha iyi anlaması için lütfen projenizi açıklayın:"
    )
  );

  const questions = [
    {
      type: "input",
      name: "projectDescription",
      message: "Proje açıklaması:",
      default: "Modern web uygulaması",
      validate: (input) => {
        if (input.trim().length < 10) {
          return "Lütfen en az 10 karakter girin";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "mainFeatures",
      message: "Ana özellikler (virgülle ayırın):",
      default: "kullanıcı yönetimi, veri görselleştirme",
      validate: (input) => {
        if (input.trim().length < 5) {
          return "Lütfen en az bir özellik belirtin";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "targetUsers",
      message: "Hedef kullanıcılar:",
      default: "genel kullanıcılar",
    },
    {
      type: "input",
      name: "businessGoals",
      message: "İş hedefleri:",
      default: "kullanıcı deneyimini iyileştirmek",
    },
  ];

  const answers = await inquirer.prompt(questions);

  return {
    description: answers.projectDescription,
    features: answers.mainFeatures.split(",").map((f) => f.trim()),
    targetUsers: answers.targetUsers,
    businessGoals: answers.businessGoals,
    timestamp: getReliableTimestamp(),
  };
}

async function updateMultiAgentContext(
  projectPath,
  config,
  projectDescription
) {
  const mainConfigPath = path.join(
    projectPath,
    "multi-agent",
    "main.context7.json"
  );

  if (await fs.pathExists(mainConfigPath)) {
    const mainConfig = await fs.readJson(mainConfigPath);

    // Proje context'ini güncelle
    mainConfig.projectContext = {
      name: config.projectName,
      framework: config.framework,
      language: config.language,
      cssFramework: config.cssFramework,
      features: config.features || [],
      description: projectDescription.description,
      mainFeatures: projectDescription.features,
      targetUsers: projectDescription.targetUsers,
      businessGoals: projectDescription.businessGoals,
      createdAt: projectDescription.timestamp,
      lastUpdated: new Date().toISOString(),
    };

    // Optimizasyon ayarları ekle
    mainConfig.optimization = {
      enabled: true,
      autoAdapt: true,
      contextAware: true,
      learningEnabled: true,
      lastOptimized: getReliableTimestamp(),
    };

    await fs.writeJson(mainConfigPath, mainConfig, { spaces: 2 });
  }
}

async function updateAgentConfigurations(
  projectPath,
  config,
  projectDescription
) {
  const agentsPath = path.join(projectPath, "multi-agent", "agents");

  if (await fs.pathExists(agentsPath)) {
    const agentFiles = await fs.readdir(agentsPath);
    const contextFiles = agentFiles.filter((file) =>
      file.endsWith(".context7.json")
    );

    for (const agentFile of contextFiles) {
      const agentPath = path.join(agentsPath, agentFile);
      const agentConfig = await fs.readJson(agentPath);

      // Agent'a proje context'ini ekle
      agentConfig.projectContext = {
        framework: config.framework,
        language: config.language,
        features: config.features || [],
        description: projectDescription.description,
      };

      // Agent'a özel optimizasyonlar
      if (agentConfig.name === "developerAgent") {
        agentConfig.specializations = getFrameworkSpecializations(
          config.framework,
          config.cssFramework
        );
        agentConfig.codeStandards = getCodeStandards(
          config.language,
          config.framework
        );
      }

      if (agentConfig.name === "analystAgent") {
        agentConfig.analysisContext = {
          businessGoals: projectDescription.businessGoals,
          targetUsers: projectDescription.targetUsers,
          mainFeatures: projectDescription.features,
        };
      }

      if (agentConfig.name === "managerAgent") {
        agentConfig.projectOverview = {
          name: config.projectName,
          description: projectDescription.description,
          framework: config.framework,
          features: config.features || [],
        };
      }

      await fs.writeJson(agentPath, agentConfig, { spaces: 2 });
    }
  }
}

function getFrameworkSpecializations(framework, cssFramework) {
  const specializations = {
    nextjs: [
      "Next.js 14+ App Router",
      "Server Components",
      "API Routes",
      "Static Generation",
      "Image Optimization",
    ],
    react: [
      "React 18+ Hooks",
      "Functional Components",
      "Context API",
      "Custom Hooks",
      "Performance Optimization",
    ],
    lovable: [
      "AI-powered Development",
      "Lovable Framework",
      "AI Integration",
      "Smart Components",
      "Automated Workflows",
    ],
    vue: [
      "Vue 3 Composition API",
      "Vue Router",
      "Pinia State Management",
      "Vue Components",
      "Vue Ecosystem",
    ],
    svelte: [
      "Svelte 5",
      "SvelteKit",
      "Svelte Stores",
      "Svelte Components",
      "Svelte Transitions",
    ],
  };

  const cssSpecializations = {
    radix: ["Radix UI Components", "Accessibility", "Tailwind Integration"],
    tailwind: ["Utility-First CSS", "Tailwind Components", "Responsive Design"],
    bootstrap: ["Bootstrap Components", "Grid System", "Bootstrap Utilities"],
    mui: ["Material-UI Components", "Material Design", "Theme System"],
    chakra: ["Chakra UI Components", "Design System", "Accessibility"],
  };

  return [
    ...(specializations[framework] || []),
    ...(cssSpecializations[cssFramework] || []),
  ];
}

function getCodeStandards(language, framework) {
  const standards = {
    typescript: {
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      strictFunctionTypes: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
    },
    javascript: {
      es6: true,
      modules: true,
      asyncAwait: true,
      destructuring: true,
      arrowFunctions: true,
    },
  };

  const frameworkStandards = {
    nextjs: {
      appRouter: true,
      serverComponents: true,
      apiRoutes: true,
      staticGeneration: true,
    },
    react: {
      functionalComponents: true,
      hooks: true,
      contextApi: true,
      performanceOptimization: true,
    },
    lovable: {
      aiIntegration: true,
      smartComponents: true,
      automatedWorkflows: true,
      modernUI: true,
    },
  };

  return {
    language: standards[language] || standards.javascript,
    framework: frameworkStandards[framework] || {},
    general: {
      cleanCode: true,
      documentation: true,
      testing: true,
      accessibility: true,
      performance: true,
    },
  };
}

async function optimizeWorkflow(projectPath, config, projectDescription) {
  const workflowPath = path.join(
    projectPath,
    "multi-agent",
    "orchestrator",
    "workflow.context7.json"
  );

  if (await fs.pathExists(workflowPath)) {
    const workflowConfig = await fs.readJson(workflowPath);

    // Framework'e özel workflow adımları ekle
    const frameworkSteps = getFrameworkWorkflowSteps(
      config.framework,
      config.features
    );

    workflowConfig.steps = [...workflowConfig.steps, ...frameworkSteps];

    // Proje context'ini workflow'a ekle
    workflowConfig.projectContext = {
      name: config.projectName,
      description: projectDescription.description,
      features: projectDescription.features,
      framework: config.framework,
    };

    // Optimizasyon ayarları
    workflowConfig.optimization = {
      enabled: true,
      adaptiveSteps: true,
      contextAware: true,
      autoRetry: true,
      maxRetries: 3,
    };

    await fs.writeJson(workflowPath, workflowConfig, { spaces: 2 });
  }
}

function getFrameworkWorkflowSteps(framework, features) {
  const baseSteps = [
    {
      name: "code_review",
      agent: "developerAgent",
      action: "review_code_quality",
      timeout: 120000,
      description: "Kod kalitesi kontrolü",
    },
    {
      name: "testing",
      agent: "developerAgent",
      action: "run_tests",
      timeout: 180000,
      description: "Test çalıştırma",
    },
  ];

  const frameworkSteps = {
    nextjs: [
      {
        name: "nextjs_optimization",
        agent: "developerAgent",
        action: "optimize_nextjs_performance",
        timeout: 120000,
        description: "Next.js performans optimizasyonu",
      },
    ],
    react: [
      {
        name: "react_optimization",
        agent: "developerAgent",
        action: "optimize_react_performance",
        timeout: 120000,
        description: "React performans optimizasyonu",
      },
    ],
    lovable: [
      {
        name: "ai_integration",
        agent: "developerAgent",
        action: "setup_ai_integration",
        timeout: 180000,
        description: "AI entegrasyonu kurulumu",
      },
    ],
  };

  const featureSteps = [];

  if (features && features.length > 0) {
    if (features.includes("auth")) {
      featureSteps.push({
        name: "auth_setup",
        agent: "developerAgent",
        action: "setup_authentication",
        timeout: 150000,
        description: "Kimlik doğrulama kurulumu",
      });
    }

    if (features.includes("database")) {
      featureSteps.push({
        name: "database_setup",
        agent: "developerAgent",
        action: "setup_database",
        timeout: 180000,
        description: "Veritabanı kurulumu",
      });
    }

    if (features.includes("state")) {
      featureSteps.push({
        name: "state_setup",
        agent: "developerAgent",
        action: "setup_state_management",
        timeout: 120000,
        description: "State management kurulumu",
      });
    }
  }

  return [...baseSteps, ...(frameworkSteps[framework] || []), ...featureSteps];
}

async function createMultiAgentSystem(projectPath, config) {
  console.log(chalk.yellow("🤖 Multi-agent sistemi oluşturuluyor..."));

  const multiAgentPath = path.join(projectPath, "multi-agent");

  // Multi-agent klasör yapısı
  const structure = {
    agents: {},
    shared: {
      tasks: {},
      logs: {},
    },
    orchestrator: {},
  };

  await createDirectoryStructure(multiAgentPath, structure);

  // Agent konfigürasyonları
  const agents = [
    {
      name: "managerAgent",
      description: "Kullanıcı karşılama ve görev delegasyonu",
      capabilities: [
        "user_interaction",
        "task_delegation",
        "project_management",
      ],
    },
    {
      name: "analystAgent",
      description: "Görev analizi ve task oluşturma",
      capabilities: ["task_analysis", "requirement_gathering", "planning"],
    },
    {
      name: "developerAgent",
      description: "Kod geliştirme ve implementasyon",
      capabilities: ["code_generation", "implementation", "testing"],
    },
  ];

  // Her agent için context dosyası oluştur
  for (const agent of agents) {
    const agentConfig = {
      name: agent.name,
      description: agent.description,
      capabilities: agent.capabilities,
      status: "active",
      version: "1.0.0",
      created: getReliableTimestamp(),
      config: {
        autoStart: true,
        maxConcurrentTasks: 3,
        timeout: 300000, // 5 dakika
      },
    };

    await fs.writeJson(
      path.join(multiAgentPath, "agents", `${agent.name}.context7.json`),
      agentConfig,
      { spaces: 2 }
    );
  }

  // Ana multi-agent konfigürasyonu
  const mainConfig = {
    name: `${config.projectName} Multi-Agent System`,
    version: "1.0.0",
    description: "AI-powered development automation system",
    agents: agents.map((a) => a.name),
    workflow: {
      enabled: true,
      maxRetries: 3,
      timeout: 300000,
    },
    logging: {
      level: "info",
      file: "system.log",
      maxSize: "10MB",
    },
    security: {
      enabled: true,
      apiKey: "auto-generated",
    },
  };

  await fs.writeJson(
    path.join(multiAgentPath, "main.context7.json"),
    mainConfig,
    { spaces: 2 }
  );

  // Workflow konfigürasyonu
  const workflowConfig = {
    name: "default-workflow",
    description: "Default development workflow",
    steps: [
      {
        name: "init",
        agent: "managerAgent",
        action: "initialize_project",
        timeout: 60000,
      },
      {
        name: "analyze",
        agent: "analystAgent",
        action: "analyze_requirements",
        timeout: 120000,
      },
      {
        name: "develop",
        agent: "developerAgent",
        action: "implement_features",
        timeout: 300000,
      },
    ],
    status: "active",
  };

  await fs.writeJson(
    path.join(multiAgentPath, "orchestrator", "workflow.context7.json"),
    workflowConfig,
    { spaces: 2 }
  );

  // README dosyası
  const readmeContent = `# Multi-Agent System

Bu proje, AI-powered multi-agent sistemi ile geliştirilmiştir.

## Agent'lar

- **Manager Agent**: Kullanıcı karşılama ve görev delegasyonu
- **Analyst Agent**: Görev analizi ve task oluşturma  
- **Developer Agent**: Kod geliştirme ve implementasyon

## Kullanım

\`\`\`bash
# Agent durumlarını kontrol et
egka-ai status

# Task oluştur
egka-ai task --create

# Agent'ları yönet
egka-ai agent --list
\`\`\`

## Konfigürasyon

Agent konfigürasyonları \`agents/\` klasöründe bulunur.
Task'lar \`shared/tasks/\` klasöründe saklanır.
Log'lar \`shared/logs/\` klasöründe tutulur.
`;

  await fs.writeFile(path.join(multiAgentPath, "README.md"), readmeContent);

  // Log dosyaları
  const logFiles = [
    "system.log",
    "manager-agent.log",
    "analyst-agent.log",
    "developer-agent.log",
  ];

  for (const logFile of logFiles) {
    await fs.writeFile(
      path.join(multiAgentPath, "shared", "logs", logFile),
      `[${getReliableTimestamp()}] [INFO] Multi-agent system initialized\n`
    );
  }

  console.log(chalk.green("✅ Multi-agent sistemi oluşturuldu"));
}

program.parse();
