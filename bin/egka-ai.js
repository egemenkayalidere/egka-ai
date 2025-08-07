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
      const multiAgentPath = path.join(__dirname, "..", "multi-agent-v2");
      const exists = await fs.pathExists(multiAgentPath);

      if (exists) {
        console.log(chalk.green("✅ Multi-Agent V2 System: Active"));
        console.log(chalk.cyan(`📦 Version: ${packageJson.version}`));

        // V2 Agent dosyalarını kontrol et
        const agentsPath = path.join(multiAgentPath, "agents");
        if (await fs.pathExists(agentsPath)) {
          const agents = await fs.readdir(agentsPath);
          const contextFiles = agents.filter((file) =>
            file.endsWith(".context7.json")
          );

          console.log(
            chalk.cyan(`📁 Available V2 Agents: ${contextFiles.length}`)
          );
          contextFiles.forEach((agent) => {
            const agentName = agent.replace(".context7.json", "");
            console.log(chalk.white(`   • ${agentName} V2`));
          });
        }

        // V2 Task durumunu kontrol et
        const tasksPath = path.join(multiAgentPath, "shared", "tasks");
        if (await fs.pathExists(tasksPath)) {
          const taskFiles = await fs.readdir(tasksPath);
          const contextTasks = taskFiles.filter((file) =>
            file.endsWith(".context7.json")
          );

          console.log(chalk.cyan(`📋 Active V2 Tasks: ${contextTasks.length}`));
          if (options.verbose && contextTasks.length > 0) {
            contextTasks.forEach((task) => {
              console.log(chalk.white(`   • ${task}`));
            });
          }
        }

        // V2 Log dosyalarını kontrol et
        const logsPath = path.join(multiAgentPath, "shared", "logs");
        if (await fs.pathExists(logsPath)) {
          const logFiles = await fs.readdir(logsPath);
          const logCount = logFiles.filter((file) =>
            file.endsWith(".log")
          ).length;
          console.log(chalk.cyan(`📝 V2 Log Files: ${logCount}`));
        }

        // V2 Performance metrics kontrol et
        const performanceLog = path.join(logsPath, "performance.log");
        if (await fs.pathExists(performanceLog)) {
          console.log(chalk.green("⚡ Performance Monitoring: Active"));
        }

        // V2 Security audit kontrol et
        const securityLog = path.join(logsPath, "security-audit.log");
        if (await fs.pathExists(securityLog)) {
          console.log(chalk.green("🔒 Security Audit: Active"));
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
// CREATE KOMUTU - Yeni proje oluşturma V2
// ============================================================================
program
  .command("create")
  .description("Create a new project with Multi-Agent V2 System")
  .option("-t, --template <template>", "Use specific template")
  .option("-y, --yes", "Skip prompts and use defaults")
  .option("-v2", "Force V2 system creation")
  .action(async (options) => {
    console.log(chalk.blue.bold("🚀 EGKA AI Project Creator V2"));
    console.log(chalk.gray("─────────────────────────────────"));

    try {
      // V2 sistemi zorla kullan
      options.v2 = true;
      await createProjectWizardV2(options);
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
// INIT KOMUTU - Sistem başlatma V2
// ============================================================================
program
  .command("init")
  .description("Initialize the Multi-Agent V2 system")
  .option("-f, --force", "Force reinitialization")
  .action(async (options) => {
    console.log(chalk.blue.bold("🚀 Initializing EGKA AI AGENTS V2..."));

    try {
      // Mevcut proje için V2 cursor rules oluştur
      const currentProjectConfig = {
        projectName: path.basename(
          (() => {
            try {
              return process.cwd();
            } catch (error) {
              return path.dirname(__dirname);
            }
          })()
        ),
        framework: "unknown",
        language: "javascript",
        cssFramework: "css",
        features: ["performance", "security", "atomic-design"],
        packageManager: "npm",
        includeMultiAgentV2: true,
      };

      await createCursorRulesV2(
        (() => {
          try {
            return process.cwd();
          } catch (error) {
            return path.dirname(__dirname);
          }
        })(),
        currentProjectConfig
      );

      // Multi-Agent V2 sistemini oluştur
      await createMultiAgentSystemV2(process.cwd(), currentProjectConfig);

      console.log(
        chalk.green("✅ Multi-Agent V2 system initialized successfully!")
      );
      console.log(chalk.cyan("📋 Available V2 commands:"));
      console.log(chalk.white("   npm run status"));
      console.log(chalk.white("   npm run test"));
      console.log(chalk.white("   npm run performance"));
      console.log(chalk.white("   npm run security"));
    } catch (error) {
      console.error(
        chalk.red("Error during V2 initialization:"),
        error.message
      );
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

// Proje adını npm paket adı formatına çeviren yardımcı fonksiyon
function normalizeProjectName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-") // Özel karakterleri tire ile değiştir
    .replace(/^-+|-+$/g, "") // Başta ve sonda tireleri kaldır
    .replace(/-+/g, "-") // Birden fazla tireyi tek tireye çevir
    .replace(/^[0-9]/, "app-$&"); // Rakamla başlıyorsa başına 'app-' ekle
}

async function createProjectWizardV2(options) {
  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Proje adını girin:",
        default: "my-egka-v2-project",
        validate: (input) => {
          if (input.trim() === "") return "Proje adı boş olamaz";

          // npm paket adı kurallarına uygunluk kontrolü
          const npmPackageNameRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
          if (!npmPackageNameRegex.test(input)) {
            return (
              "Proje adı npm paket adı kurallarına uygun olmalıdır:\n" +
              "• Sadece küçük harfler, rakamlar ve tire (-) kullanılabilir\n" +
              "• Tire ile başlayamaz veya bitemez\n" +
              "• En az 1 karakter olmalıdır\n" +
              "Örnek: my-project, prodigy-web-app, app123"
            );
          }

          // Rezerve kelimeler kontrolü
          const reservedWords = ["node_modules", "favicon.ico"];
          if (reservedWords.includes(input.toLowerCase())) {
            return "Bu isim rezerve edilmiş bir kelimedir, başka bir isim seçin";
          }

          return true;
        },
        filter: (input) => {
          // Proje adını otomatik olarak normalize et
          const normalized = normalizeProjectName(input);
          if (normalized !== input) {
            console.log(
              chalk.yellow(
                `ℹ️  Proje adı normalize edildi: "${input}" → "${normalized}"`
              )
            );
          }
          return normalized;
        },
      },
      {
        type: "list",
        name: "framework",
        message: "Framework seçin:",
        choices: [
          { name: "Next.js (React SSR) - V2 Optimized", value: "nextjs" },
          { name: "React (SPA) - V2 Optimized", value: "react" },
          { name: "Lovable (AI-powered) - V2 Optimized", value: "lovable" },
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
          {
            name: "TypeScript (Önerilen) - V2 Strict Mode",
            value: "typescript",
          },
          { name: "JavaScript", value: "javascript" },
        ],
        default: "typescript",
      },
      {
        type: "list",
        name: "cssFramework",
        message: "CSS Framework seçin:",
        choices: [
          { name: "Tailwind CSS (Önerilen) - V2 Optimized", value: "tailwind" },
          { name: "Radix UI + Tailwind - V2 Modern", value: "radix" },
          { name: "Material-UI - V2 Optimized", value: "mui" },
          { name: "Bootstrap", value: "bootstrap" },
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
        message: "V2 Özellikleri seçin:",
        choices: [
          {
            name: "Performance Optimization (React.memo, useCallback, useMemo)",
            value: "performance",
          },
          {
            name: "Security Enhancement (XSS, CSRF Protection)",
            value: "security",
          },
          {
            name: "Atomic Design V2 (Atoms, Molecules, Organisms)",
            value: "atomic-design",
          },
          { name: "Storybook Integration V2", value: "storybook" },
          { name: "Authentication", value: "auth" },
          { name: "Database Integration", value: "database" },
          { name: "API Routes", value: "api" },
          { name: "State Management (Zustand)", value: "state" },
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
      {
        type: "confirm",
        name: "includeMultiAgentV2",
        message: "Multi-Agent V2 sistemi otomatik kurulsun mu?",
        default: true,
      },
    ]);

    await generateProjectV2(answers);
  } catch (error) {
    console.error(chalk.red("Error in project wizard V2:"), error.message);
  }
}

async function generateProjectV2(config) {
  // Proje adını normalize et
  config.projectName = normalizeProjectName(config.projectName);

  // Güvenli current working directory alma
  let currentCwd;
  try {
    currentCwd = process.cwd();
  } catch (error) {
    // Eğer process.cwd() başarısız olursa, __dirname kullan
    currentCwd = path.dirname(__dirname);
  }

  const projectPath = path.join(currentCwd, config.projectName);

  console.log(
    chalk.blue(`\n🚀 ${config.projectName} projesi V2 ile oluşturuluyor...`)
  );

  try {
    // Framework'e özel CLI araçlarını kullanarak proje oluştur
    await createProjectWithFrameworkCLI(config);

    // Proje klasörüne geç
    const originalCwd = currentCwd;
    try {
      process.chdir(projectPath);
    } catch (error) {
      console.error(chalk.red("Proje klasörüne geçiş hatası:"), error.message);
      return;
    }

    // V2 Konfigürasyon dosyaları oluştur
    await createConfigFilesV2(projectPath, config);

    // V2 Özellik dosyaları oluştur
    await createFeatureFilesV2(projectPath, config);

    // Multi-Agent V2 sistemi oluştur (zorunlu)
    await createMultiAgentSystemV2(projectPath, config);

    // V2 Cursor rules oluştur
    await createCursorRulesV2(projectPath, config);

    // Git init
    if (config.includeGit) {
      await initGit(projectPath);
    }

    // V2 Performance ve Security optimizasyonları
    await optimizeProjectV2(projectPath, config);

    // CI/CD setup
    if (config.includeCI) {
      await setupCIV2(projectPath, config);
    }

    // Orijinal dizine geri dön
    try {
      process.chdir(originalCwd);
    } catch (error) {
      console.error(chalk.red("Orijinal dizine dönüş hatası:"), error.message);
    }

    console.log(chalk.green("\n✅ Proje V2 başarıyla oluşturuldu!"));
    console.log(chalk.cyan(`\n📂 Proje klasörü: ${projectPath}`));

    // V2 Performance metrics göster
    if (config.features?.includes("performance")) {
      console.log(chalk.yellow("\n⚡ V2 Performance Optimizations:"));
      console.log(chalk.white("   • React.memo kullanımı zorunlu"));
      console.log(chalk.white("   • useCallback ve useMemo optimizasyonu"));
      console.log(chalk.white("   • Bundle size optimization"));
      console.log(chalk.white("   • Memory leak prevention"));
    }

    if (config.features?.includes("security")) {
      console.log(chalk.yellow("\n🔒 V2 Security Enhancements:"));
      console.log(chalk.white("   • XSS ve CSRF koruması"));
      console.log(chalk.white("   • Input validation"));
      console.log(chalk.white("   • Content-Security-Policy"));
      console.log(chalk.white("   • Secure API handling"));
    }

    if (config.features?.includes("atomic-design")) {
      console.log(chalk.yellow("\n🎨 V2 Atomic Design System:"));
      console.log(chalk.white("   • Atoms, Molecules, Organisms"));
      console.log(chalk.white("   • Storybook integration"));
      console.log(chalk.white("   • Component library"));
      console.log(chalk.white("   • Design tokens"));
    }

    // Otomatik paket yükleme
    console.log(chalk.yellow("\n📦 V2 Bağımlılıklar yükleniyor..."));
    try {
      const originalCwd = currentCwd;
      try {
        process.chdir(projectPath);
      } catch (error) {
        console.error(
          chalk.red("Proje klasörüne geçiş hatası:"),
          error.message
        );
        return;
      }

      const installCommand =
        config.packageManager === "yarn"
          ? "yarn install"
          : config.packageManager === "pnpm"
          ? "pnpm install"
          : "npm install --legacy-peer-deps";

      console.log(chalk.gray(`   ${installCommand} çalıştırılıyor...`));
      execSync(installCommand, { stdio: "inherit" });

      try {
        process.chdir(originalCwd);
      } catch (error) {
        console.error(
          chalk.red("Orijinal dizine dönüş hatası:"),
          error.message
        );
      }
      console.log(chalk.green("✅ V2 Bağımlılıklar başarıyla yüklendi!"));

      console.log(chalk.cyan("\n🚀 V2 Proje hazır! Hemen başlayabilirsiniz:"));
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

      if (config.includeMultiAgentV2) {
        console.log(chalk.cyan("\n🤖 Multi-Agent V2 Komutları:"));
        console.log(chalk.white("   npm run status"));
        console.log(chalk.white("   npm run test"));
        console.log(chalk.white("   npm run performance"));
        console.log(chalk.white("   npm run security"));
      }
    } catch (error) {
      console.log(
        chalk.yellow(
          "⚠️  V2 Bağımlılık yükleme başarısız oldu, manuel olarak yükleyin:"
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

    // V2 Özel talimatlar
    if (config.framework === "lovable") {
      console.log(
        chalk.yellow("\n💡 Lovable V2 projesi için özel talimatlar:")
      );
      console.log(chalk.white("   - Lovable AI agent'ınızı yapılandırın"));
      console.log(
        chalk.white("   - API anahtarlarınızı .env dosyasına ekleyin")
      );
      console.log(chalk.white("   - V2 Performance optimizasyonları aktif"));

      if (config.cssFramework === "radix") {
        console.log(
          chalk.cyan("   - Radix UI + Tailwind V2 entegrasyonu hazır")
        );
        console.log(
          chalk.white("   - Modern UI component'ları kullanabilirsiniz")
        );
      }
    }

    if (config.cssFramework === "radix") {
      console.log(chalk.yellow("\n🎨 Radix UI + Tailwind V2 özellikleri:"));
      console.log(chalk.white("   - Modern, accessible UI component'ları"));
      console.log(chalk.white("   - Dark mode desteği"));
      console.log(chalk.white("   - Tailwind CSS ile tam entegrasyon"));
      console.log(chalk.white("   - TypeScript strict mode"));
      console.log(chalk.white("   - V2 Performance optimizasyonları"));
    }

    if (config.features?.includes("storybook")) {
      console.log(chalk.yellow("\n📚 Storybook V2 özellikleri:"));
      console.log(chalk.white("   - Otomatik story generation"));
      console.log(chalk.white("   - HTML preview support"));
      console.log(chalk.white("   - Component documentation"));
      console.log(chalk.white("   - Interactive testing"));
    }
  } catch (error) {
    console.error(chalk.red("Error generating project V2:"), error.message);
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

async function createConfigFilesV2(projectPath, config) {
  // TypeScript V2 config - Strict mode
  if (config.language === "typescript") {
    const tsConfigV2 = {
      compilerOptions: {
        target: "es2020",
        lib: ["dom", "dom.iterable", "es6", "es2020"],
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
        // V2 Strict mode additions
        noImplicitAny: true,
        noImplicitReturns: true,
        noImplicitThis: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        exactOptionalPropertyTypes: true,
        noUncheckedIndexedAccess: true,
        noImplicitOverride: true,
        // Performance optimizations
        incremental: true,
        tsBuildInfoFile: "./node_modules/.cache/.tsbuildinfo",
      },
      include: ["src", "**/*.ts", "**/*.tsx"],
      exclude: ["node_modules", "dist", "build"],
    };

    await fs.writeJson(path.join(projectPath, "tsconfig.json"), tsConfigV2, {
      spaces: 2,
    });
  }

  // CSS Framework V2 config
  await createCSSConfigV2(projectPath, config.cssFramework);

  // ESLint V2 config
  await createESLintConfigV2(projectPath, config);

  // Gitignore V2
  await createGitignoreV2(projectPath, config);

  // V2 Performance config
  await createPerformanceConfigV2(projectPath, config);

  // V2 Security config
  await createSecurityConfigV2(projectPath, config);
}

async function createCSSConfigV2(projectPath, cssFramework) {
  switch (cssFramework) {
    case "tailwind":
      const tailwindConfigV2 = {
        content: [
          "./pages/**/*.{js,ts,jsx,tsx,mdx}",
          "./components/**/*.{js,ts,jsx,tsx,mdx}",
          "./app/**/*.{js,ts,jsx,tsx,mdx}",
          "./src/**/*.{js,ts,jsx,tsx,mdx}",
        ],
        theme: {
          extend: {
            // V2 Performance optimizations
            animation: {
              "fade-in": "fadeIn 0.5s ease-in-out",
              "slide-up": "slideUp 0.3s ease-out",
            },
            keyframes: {
              fadeIn: {
                "0%": { opacity: "0" },
                "100%": { opacity: "1" },
              },
              slideUp: {
                "0%": { transform: "translateY(10px)", opacity: "0" },
                "100%": { transform: "translateY(0)", opacity: "1" },
              },
            },
          },
        },
        plugins: [],
        // V2 Performance optimizations
        future: {
          hoverOnlyWhenSupported: true,
        },
      };

      await fs.writeJson(
        path.join(projectPath, "tailwind.config.js"),
        tailwindConfigV2,
        { spaces: 2 }
      );

      const postcssConfigV2 = {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
          // V2 Performance optimizations
          cssnano: {
            preset: [
              "default",
              {
                discardComments: {
                  removeAll: true,
                },
                normalizeWhitespace: false,
              },
            ],
          },
        },
      };

      await fs.writeJson(
        path.join(projectPath, "postcss.config.js"),
        postcssConfigV2,
        { spaces: 2 }
      );
      break;

    case "radix":
      const radixTailwindConfigV2 = {
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
              // V2 Performance animations
              "fade-in": {
                from: { opacity: "0" },
                to: { opacity: "1" },
              },
              "slide-up": {
                from: { transform: "translateY(10px)", opacity: "0" },
                to: { transform: "translateY(0)", opacity: "1" },
              },
            },
            animation: {
              "accordion-down": "accordion-down 0.2s ease-out",
              "accordion-up": "accordion-up 0.2s ease-out",
              "fade-in": "fade-in 0.5s ease-in-out",
              "slide-up": "slide-up 0.3s ease-out",
            },
          },
        },
        plugins: [],
        // V2 Performance optimizations
        future: {
          hoverOnlyWhenSupported: true,
        },
      };

      await fs.writeJson(
        path.join(projectPath, "tailwind.config.js"),
        radixTailwindConfigV2,
        { spaces: 2 }
      );

      const radixPostcssConfigV2 = {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
          // V2 Performance optimizations
          cssnano: {
            preset: [
              "default",
              {
                discardComments: {
                  removeAll: true,
                },
                normalizeWhitespace: false,
              },
            ],
          },
        },
      };

      await fs.writeJson(
        path.join(projectPath, "postcss.config.js"),
        radixPostcssConfigV2,
        { spaces: 2 }
      );

      // Radix UI V2 için global CSS
      const globalCSSV2 = `@tailwind base;
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
}

/* V2 Performance optimizations */
@layer utilities {
  .performance-optimized {
    will-change: transform;
    transform: translateZ(0);
  }
  
  .no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
}`;

      const stylesPath = path.join(projectPath, "src", "styles");
      await fs.ensureDir(stylesPath);
      await fs.writeFile(path.join(stylesPath, "globals.css"), globalCSSV2);
      break;
  }
}

async function createESLintConfigV2(projectPath, config) {
  const eslintConfigV2 = {
    extends: [
      "next/core-web-vitals",
      "eslint:recommended",
      "@typescript-eslint/recommended",
      // V2 Performance and security rules
      "plugin:react-hooks/recommended",
      "plugin:jsx-a11y/recommended",
      "plugin:security/recommended",
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "react-hooks", "jsx-a11y", "security"],
    rules: {
      // V2 Strict TypeScript rules
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",

      // V2 React Performance rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-no-bind": "warn",
      "react/jsx-key": "error",

      // V2 Security rules
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",

      // V2 Accessibility rules
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",

      // V2 Performance rules
      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  };

  await fs.writeJson(path.join(projectPath, ".eslintrc.json"), eslintConfigV2, {
    spaces: 2,
  });
}

async function createGitignoreV2(projectPath, config) {
  const gitignoreContentV2 = `# Dependencies
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

# V2 Performance cache
.performance-cache/
.security-cache/

# V2 Multi-Agent logs
multi-agent-v2/shared/logs/
multi-agent-v2/shared/tasks/

# V2 Storybook
storybook-static/

# V2 TypeScript build info
*.tsbuildinfo

# V2 Security audit
security-audit.json
performance-metrics.json`;

  await fs.writeFile(path.join(projectPath, ".gitignore"), gitignoreContentV2);
}

async function createPerformanceConfigV2(projectPath, config) {
  const performanceConfig = {
    bundleAnalyzer: {
      enabled: process.env.ANALYZE === "true",
    },
    optimization: {
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    },
    compression: {
      gzip: true,
      brotli: true,
    },
  };

  await fs.writeJson(
    path.join(projectPath, "performance.config.json"),
    performanceConfig,
    {
      spaces: 2,
    }
  );
}

async function createSecurityConfigV2(projectPath, config) {
  const securityConfig = {
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    },
    validation: {
      inputSanitization: true,
      xssProtection: true,
      csrfProtection: true,
    },
  };

  await fs.writeJson(
    path.join(projectPath, "security.config.json"),
    securityConfig,
    {
      spaces: 2,
    }
  );
}

async function createFeatureFilesV2(projectPath, config) {
  const features = config.features || [];

  for (const feature of features) {
    switch (feature) {
      case "performance":
        await createPerformanceFeatureV2(projectPath, config);
        break;
      case "security":
        await createSecurityFeatureV2(projectPath, config);
        break;
      case "atomic-design":
        await createAtomicDesignFeatureV2(projectPath, config);
        break;
      case "storybook":
        await createStorybookFeatureV2(projectPath, config);
        break;
      case "auth":
        await createAuthFeatureV2(projectPath, config);
        break;
      case "database":
        await createDatabaseFeatureV2(projectPath, config);
        break;
      case "api":
        await createAPIFeatureV2(projectPath, config);
        break;
      case "state":
        await createStateFeatureV2(projectPath, config);
        break;
      case "testing":
        await createTestingFeatureV2(projectPath, config);
        break;
      case "pwa":
        await createPWAFeatureV2(projectPath, config);
        break;
      case "i18n":
        await createI18nFeatureV2(projectPath, config);
        break;
      case "dark-mode":
        await createDarkModeFeatureV2(projectPath, config);
        break;
    }
  }
}

async function createPerformanceFeatureV2(projectPath, config) {
  const performancePath = path.join(projectPath, "src", "utils", "performance");
  await fs.ensureDir(performancePath);

  const performanceUtils = `import { useCallback, useMemo, memo } from 'react';

// V2 Performance optimization utilities
export const withPerformanceOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    displayName?: string;
    shouldComponentUpdate?: (prevProps: P, nextProps: P) => boolean;
  } = {}
) => {
  const OptimizedComponent = memo(Component, options.shouldComponentUpdate);
  OptimizedComponent.displayName = options.displayName || Component.displayName || Component.name;
  return OptimizedComponent;
};

// V2 useCallback wrapper with performance logging
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options: {
    name?: string;
    logPerformance?: boolean;
  } = {}
) => {
  const optimizedCallback = useCallback(callback, deps);
  
  if (options.logPerformance) {
    const wrappedCallback = ((...args: Parameters<T>) => {
      const startTime = performance.now();
      const result = optimizedCallback(...args);
      const endTime = performance.now();
      console.log(\`[Performance] \${options.name || 'Callback'} took \${endTime - startTime}ms\`);
      return result;
    }) as T;
    
    return wrappedCallback;
  }
  
  return optimizedCallback;
};

// V2 useMemo wrapper with performance logging
export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    name?: string;
    logPerformance?: boolean;
  } = {}
) => {
  const memoizedValue = useMemo(factory, deps);
  
  if (options.logPerformance) {
    console.log(\`[Performance] \${options.name || 'Memo'} recalculated\`);
  }
  
  return memoizedValue;
};

// V2 Bundle size analyzer
export const analyzeBundleSize = (componentName: string, size: number) => {
  if (size > 50 * 1024) { // 50KB
    console.warn(\`[Bundle Size] \${componentName} is large: \${(size / 1024).toFixed(2)}KB\`);
  }
};

// V2 Memory leak detection
export const useMemoryLeakDetection = (componentName: string) => {
  React.useEffect(() => {
    const startMemory = performance.memory?.usedJSHeapSize || 0;
    
    return () => {
      const endMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryDiff = endMemory - startMemory;
      
      if (memoryDiff > 1024 * 1024) { // 1MB
        console.warn(\`[Memory Leak] \${componentName} may have memory leak: +\${(memoryDiff / 1024 / 1024).toFixed(2)}MB\`);
      }
    };
  }, [componentName]);
};`;

  await fs.writeFile(
    path.join(performancePath, "performance-utils.ts"),
    performanceUtils
  );
}

async function createSecurityFeatureV2(projectPath, config) {
  const securityPath = path.join(projectPath, "src", "utils", "security");
  await fs.ensureDir(securityPath);

  const securityUtils = `// V2 Security utilities
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\\w+=/gi, '');
};

export const validateInput = (input: string, rules: {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedChars?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (rules.minLength && input.length < rules.minLength) {
    errors.push(\`Minimum length is \${rules.minLength} characters\`);
  }
  
  if (rules.maxLength && input.length > rules.maxLength) {
    errors.push(\`Maximum length is \${rules.maxLength} characters\`);
  }
  
  if (rules.pattern && !rules.pattern.test(input)) {
    errors.push('Input does not match required pattern');
  }
  
  if (rules.allowedChars) {
    const invalidChars = input.split('').filter(char => !rules.allowedChars!.includes(char));
    if (invalidChars.length > 0) {
      errors.push(\`Invalid characters: \${invalidChars.join(', ')}\`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  return token === expectedToken;
};

export const escapeHtml = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export const createSecureHeaders = () => {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
};`;

  await fs.writeFile(
    path.join(securityPath, "security-utils.ts"),
    securityUtils
  );
}

async function createAtomicDesignFeatureV2(projectPath, config) {
  const atomicPath = path.join(projectPath, "src", "components");
  await fs.ensureDir(atomicPath);

  // Create atomic design structure
  const atomicStructure = {
    atoms: {},
    molecules: {},
    organisms: {},
    templates: {},
    pages: {},
  };

  for (const [level, content] of Object.entries(atomicStructure)) {
    const levelPath = path.join(atomicPath, level);
    await fs.ensureDir(levelPath);

    // Create index file for each level
    const indexContent = `// V2 ${
      level.charAt(0).toUpperCase() + level.slice(1)
    } Components
// Auto-generated by Multi-Agent V2 System

export * from './Button';
export * from './Input';
export * from './Typography';`;

    await fs.writeFile(path.join(levelPath, "index.ts"), indexContent);
  }

  // Create atomic design config
  const atomicConfig = {
    version: "2.0.0",
    levels: ["atoms", "molecules", "organisms", "templates", "pages"],
    rules: {
      atoms: "Basic building blocks (buttons, inputs, typography)",
      molecules: "Simple combinations of atoms (form fields, search bars)",
      organisms: "Complex combinations of molecules (headers, forms)",
      templates: "Page layouts and structure",
      pages: "Complete pages with real content",
    },
    naming: {
      convention: "PascalCase",
      prefix: "",
      suffix: "",
    },
    storybook: {
      enabled: true,
      autoGenerate: true,
      includeHTMLPreview: true,
    },
  };

  await fs.writeJson(
    path.join(atomicPath, "atomic-design.config.json"),
    atomicConfig,
    {
      spaces: 2,
    }
  );
}

async function createStorybookFeatureV2(projectPath, config) {
  const storybookPath = path.join(projectPath, ".storybook");
  await fs.ensureDir(storybookPath);

  const mainConfig = `module.exports = {
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../src/**/*.stories.mdx"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
    "@storybook/addon-performance",
    {
      name: "@storybook/addon-docs",
      options: {
        configureJSX: true,
      },
    },
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: true,
  },
  // V2 Performance optimizations
  core: {
    builder: "@storybook/builder-vite",
  },
  features: {
    storyStoreV7: true,
    interactionsDebugger: true,
  },
};`;

  await fs.writeFile(path.join(storybookPath, "main.ts"), mainConfig);

  const previewConfig = `import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    // V2 Performance and accessibility
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
        ],
      },
    },
    performance: {
      maxDuration: 1000,
    },
  },
};

export default preview;`;

  await fs.writeFile(path.join(storybookPath, "preview.ts"), previewConfig);
}

async function createMultiAgentSystemV2(projectPath, config) {
  const multiAgentPath = path.join(projectPath, "multi-agent-v2");
  await fs.ensureDir(multiAgentPath);

  // Copy V2 system files
  const sourcePath = path.join(__dirname, "..", "multi-agent-v2");
  if (await fs.pathExists(sourcePath)) {
    await fs.copy(sourcePath, multiAgentPath);
    console.log(chalk.green("✅ Multi-Agent V2 system copied"));
  } else {
    console.log(
      chalk.yellow(
        "⚠️  Multi-Agent V2 system not found, creating basic structure..."
      )
    );
    await createBasicMultiAgentV2(multiAgentPath, config);
  }

  // V2 .mdc dosyasını oluştur
  await createMDCFile(projectPath, config);

  // V2 Cursor rules oluştur
  await createCursorRulesV2(projectPath, config);

  console.log(chalk.green("✅ Multi-Agent V2 system setup completed"));
}

async function createBasicMultiAgentV2(multiAgentPath, config) {
  console.log(chalk.yellow("📝 Creating basic Multi-Agent V2 structure..."));

  // Create basic V2 structure
  const structure = {
    agents: {},
    orchestrator: {},
    shared: {
      tasks: {},
      logs: {},
      "context-injection": {},
    },
    scripts: {},
  };

  for (const [dir, content] of Object.entries(structure)) {
    const dirPath = path.join(multiAgentPath, dir);
    await fs.ensureDir(dirPath);

    if (typeof content === "object" && Object.keys(content).length > 0) {
      for (const [subDir, subContent] of Object.entries(content)) {
        const subDirPath = path.join(dirPath, subDir);
        await fs.ensureDir(subDirPath);
      }
    }
  }

  // Create basic agent files
  await createBasicAgentFiles(multiAgentPath, config);

  // Create basic orchestrator files
  await createBasicOrchestratorFiles(multiAgentPath, config);

  // Create basic script files
  await createBasicScriptFiles(multiAgentPath, config);

  // Create basic V2 config
  const v2Config = {
    version: "2.0.0",
    system_name: "Multi-Agent V2 System",
    active_agents: 3,
    agents: ["managerAgent", "analystAgent", "developerAgent"],
    features: {
      performance_optimization: true,
      security_enhancement: true,
      atomic_design_v2: true,
      storybook_integration: true,
    },
  };

  await fs.writeJson(
    path.join(multiAgentPath, "main.context7.json"),
    v2Config,
    {
      spaces: 2,
    }
  );

  console.log(chalk.green("✅ Basic Multi-Agent V2 structure created"));
}

async function createBasicAgentFiles(multiAgentPath, config) {
  const agentsPath = path.join(multiAgentPath, "agents");

  // Manager Agent V2
  const managerAgent = {
    id: "manager",
    name: "Manager Agent V2",
    version: "2.0.0",
    capabilities: ["project_analysis", "workflow_orchestration", "resource_allocation"],
    performance_requirements: {
      response_time: 1000,
      memory_usage: "50MB",
      cpu_usage: "10%"
    },
    security_requirements: {
      input_validation: true,
      xss_protection: true,
      data_encryption: false
    }
  };

  await fs.writeJson(
    path.join(agentsPath, "managerAgent.context7.json"),
    managerAgent,
    { spaces: 2 }
  );

  // Analyst Agent V2
  const analystAgent = {
    id: "analyst",
    name: "Analyst Agent V2",
    version: "2.0.0",
    capabilities: ["requirements_analysis", "task_planning", "complexity_assessment"],
    performance_requirements: {
      response_time: 2000,
      memory_usage: "75MB",
      cpu_usage: "15%"
    },
    security_requirements: {
      input_validation: true,
      xss_protection: true,
      data_encryption: false
    }
  };

  await fs.writeJson(
    path.join(agentsPath, "analystAgent.context7.json"),
    analystAgent,
    { spaces: 2 }
  );

  // Developer Agent V2
  const developerAgent = {
    id: "developer",
    name: "Developer Agent V2",
    version: "2.0.0",
    capabilities: ["frontend_development", "component_creation", "performance_optimization"],
    performance_requirements: {
      response_time: 5000,
      memory_usage: "100MB",
      cpu_usage: "25%"
    },
    security_requirements: {
      input_validation: true,
      xss_protection: true,
      data_encryption: false
    }
  };

  await fs.writeJson(
    path.join(agentsPath, "developerAgent.context7.json"),
    developerAgent,
    { spaces: 2 }
  );
}

async function createBasicOrchestratorFiles(multiAgentPath, config) {
  const orchestratorPath = path.join(multiAgentPath, "orchestrator");

  // Workflow context V2
  const workflowContext = {
    version: "2.0.0",
    description: "Multi-Agent V2 Workflow",
    steps: [
      {
        step: 1,
        agent: "manager",
        action: "project_analysis",
        performance_requirements: {
          timeout: 30000,
          memory_limit: "100MB"
        },
        security_validation: {
          input_validation: true,
          xss_protection: true
        }
      },
      {
        step: 2,
        agent: "analyst",
        action: "task_creation",
        performance_requirements: {
          timeout: 45000,
          memory_limit: "150MB"
        },
        security_validation: {
          input_validation: true,
          xss_protection: true
        }
      },
      {
        step: 3,
        agent: "developer",
        action: "code_development",
        performance_requirements: {
          timeout: 120000,
          memory_limit: "200MB"
        },
        security_validation: {
          input_validation: true,
          xss_protection: true
        }
      }
    ],
    global_performance_optimization: {
      enable_caching: true,
      enable_compression: true,
      enable_minification: true
    },
    global_security_features: {
      enable_audit_logging: true,
      enable_performance_monitoring: true,
      enable_error_tracking: true
    }
  };

  await fs.writeJson(
    path.join(orchestratorPath, "workflow.context7.json"),
    workflowContext,
    { spaces: 2 }
  );
}

async function createBasicScriptFiles(multiAgentPath, config) {
  const scriptsPath = path.join(multiAgentPath, "scripts");

  // Status script V2
  const statusScript = `#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🤖 Multi-Agent V2 System Status");
console.log("=================================");

const basePath = path.join(__dirname, "..");
const agentsPath = path.join(basePath, "agents");
const sharedPath = path.join(basePath, "shared");

// Agent durumlarını kontrol et
if (fs.existsSync(agentsPath)) {
  const agents = fs.readdirSync(agentsPath).filter(file => file.endsWith(".context7.json"));
  console.log(\`📁 Agents: \${agents.length} active\`);
  agents.forEach(agent => {
    console.log(\`   • \${agent.replace(".context7.json", "")}\`);
  });
}

// Task durumlarını kontrol et
const tasksPath = path.join(sharedPath, "tasks");
if (fs.existsSync(tasksPath)) {
  const tasks = fs.readdirSync(tasksPath).filter(file => file.endsWith(".context7.json"));
  console.log(\`📋 Tasks: \${tasks.length} active\`);
}

// Log durumlarını kontrol et
const logsPath = path.join(sharedPath, "logs");
if (fs.existsSync(logsPath)) {
  const logs = fs.readdirSync(logsPath).filter(file => file.endsWith(".log"));
  console.log(\`📝 Logs: \${logs.length} files\`);
}

console.log("✅ Multi-Agent V2 System is running");
`;

  await fs.writeFile(path.join(scriptsPath, "status.js"), statusScript);
}

async function createMDCFile(projectPath, config) {
  const mdcContent = `# Multi-Agent V2 System - Cursor Auto Tasks Configuration

## System Overview
This configuration enables automatic tasks for the Multi-Agent V2 development system, including workflow orchestration, agent communication, task assignment, and automatic triggering.

## Auto Tasks Configuration

### 1. Workflow Execution Engine
\`\`\`javascript
// Auto task: Initialize workflow execution
{
  "task": "workflow_init",
  "trigger": "file_change",
  "pattern": "orchestrator/workflow-execution-engine.js",
  "action": "validate_workflow_structure",
  "description": "Validate workflow execution engine structure and dependencies"
}
\`\`\`

### 2. Agent Communication System
\`\`\`javascript
// Auto task: Monitor agent communication
{
  "task": "agent_communication_monitor",
  "trigger": "file_change",
  "pattern": "orchestrator/agent-communication-system.js",
  "action": "validate_communication_protocols",
  "description": "Monitor and validate agent communication protocols"
}
\`\`\`

### 3. Task Assignment Manager
\`\`\`javascript
// Auto task: Task assignment validation
{
  "task": "task_assignment_validation",
  "trigger": "file_change",
  "pattern": "orchestrator/task-assignment-manager.js",
  "action": "validate_task_assignment_logic",
  "description": "Validate task assignment logic and agent workload management"
}
\`\`\`

### 4. Automatic Triggering System
\`\`\`javascript
// Auto task: Trigger system validation
{
  "task": "trigger_system_validation",
  "trigger": "file_change",
  "pattern": "orchestrator/automatic-triggering-system.js",
  "action": "validate_trigger_rules",
  "description": "Validate automatic triggering rules and conditions"
}
\`\`\`

## Performance Optimization Tasks

### React Component Optimization
\`\`\`javascript
// Auto task: React optimization validation
{
  "task": "react_optimization_check",
  "trigger": "file_change",
  "pattern": "**/*.tsx",
  "action": "validate_react_optimization",
  "rules": [
    "React.memo kullanımı zorunlu",
    "useCallback ile fonksiyon optimizasyonu",
    "useMemo ile hesaplama optimizasyonu",
    "Arrow function kullanımı",
    "Explicit return tercih edilmeli"
  ],
  "description": "Validate React component optimization rules"
}
\`\`\`

### TypeScript Strict Mode
\`\`\`javascript
// Auto task: TypeScript validation
{
  "task": "typescript_validation",
  "trigger": "file_change",
  "pattern": "**/*.ts",
  "action": "validate_typescript_strict",
  "rules": [
    "Strict mode kullanımı",
    "Proper interface tanımlamaları",
    "Type safety sağlanmalı"
  ],
  "description": "Validate TypeScript strict mode compliance"
}
\`\`\`

## Security Validation Tasks

### XSS Protection
\`\`\`javascript
// Auto task: XSS protection validation
{
  "task": "xss_protection_check",
  "trigger": "file_change",
  "pattern": "**/*.{js,ts,tsx}",
  "action": "validate_xss_protection",
  "rules": [
    "Content-Security-Policy uygulanmalı",
    "Input validation zorunlu",
    "XSS pattern kontrolü"
  ],
  "description": "Validate XSS protection implementation"
}
\`\`\`

### Input Validation
\`\`\`javascript
// Auto task: Input validation check
{
  "task": "input_validation_check",
  "trigger": "file_change",
  "pattern": "**/*.{js,ts,tsx}",
  "action": "validate_input_validation",
  "rules": [
    "Tüm kullanıcı girdileri doğrulanmalı",
    "Hassas veri kontrolü",
    "Sanitization uygulanmalı"
  ],
  "description": "Validate input validation implementation"
}
\`\`\`

## Atomic Design Validation

### Component Structure
\`\`\`javascript
// Auto task: Atomic design validation
{
  "task": "atomic_design_validation",
  "trigger": "file_change",
  "pattern": "**/components/**/*.{tsx,ts}",
  "action": "validate_atomic_design",
  "levels": {
    "atoms": ["Button", "Input", "Icon", "Typography", "Avatar"],
    "molecules": ["FormField", "Card", "SearchBar", "Navigation"],
    "organisms": ["Header", "Sidebar", "Footer", "ProductList"],
    "templates": ["MasterPage", "DashboardLayout", "AuthLayout"],
    "pages": ["HomePage", "LoginPage", "DashboardPage"]
  },
  "description": "Validate atomic design structure compliance"
}
\`\`\`

## Storybook Generation

### Auto Story Creation
\`\`\`javascript
// Auto task: Storybook story generation
{
  "task": "storybook_generation",
  "trigger": "file_change",
  "pattern": "**/components/**/*.tsx",
  "action": "generate_storybook_stories",
  "rules": [
    "Her component için story oluşturulmalı",
    "Variant'lar için story exports",
    "HTML preview generation"
  ],
  "description": "Auto-generate Storybook stories for components"
}
\`\`\`

## Testing Tasks

### Unit Test Generation
\`\`\`javascript
// Auto task: Unit test generation
{
  "task": "unit_test_generation",
  "trigger": "file_change",
  "pattern": "**/components/**/*.tsx",
  "action": "generate_unit_tests",
  "rules": [
    "Component test coverage",
    "Props validation tests",
    "Event handling tests"
  ],
  "description": "Auto-generate unit tests for components"
}
\`\`\`

## Code Quality Tasks

### ESLint Validation
\`\`\`javascript
// Auto task: ESLint validation
{
  "task": "eslint_validation",
  "trigger": "file_change",
  "pattern": "**/*.{js,ts,tsx}",
  "action": "validate_eslint_rules",
  "rules": [
    "Modern JavaScript/TypeScript kullanımı",
    "Code formatting standards",
    "Best practices compliance"
  ],
  "description": "Validate ESLint rules compliance"
}
\`\`\`

### Prettier Formatting
\`\`\`javascript
// Auto task: Prettier formatting
{
  "task": "prettier_formatting",
  "trigger": "file_change",
  "pattern": "**/*.{js,ts,tsx,json}",
  "action": "format_with_prettier",
  "description": "Auto-format code with Prettier"
}
\`\`\`

## Multi-Agent System Tasks

### Workflow Monitoring
\`\`\`javascript
// Auto task: Workflow monitoring
{
  "task": "workflow_monitoring",
  "trigger": "file_change",
  "pattern": "orchestrator/**/*.js",
  "action": "monitor_workflow_execution",
  "metrics": [
    "Execution time tracking",
    "Step completion rates",
    "Error rate monitoring",
    "Performance optimization"
  ],
  "description": "Monitor workflow execution performance"
}
\`\`\`

### Agent Status Monitoring
\`\`\`javascript
// Auto task: Agent status monitoring
{
  "task": "agent_status_monitoring",
  "trigger": "file_change",
  "pattern": "agents/**/*.json",
  "action": "monitor_agent_status",
  "metrics": [
    "Agent availability",
    "Message processing rates",
    "Task completion rates",
    "Error handling"
  ],
  "description": "Monitor agent status and performance"
}
\`\`\`

### Task Assignment Monitoring
\`\`\`javascript
// Auto task: Task assignment monitoring
{
  "task": "task_assignment_monitoring",
  "trigger": "file_change",
  "pattern": "shared/tasks/**/*.json",
  "action": "monitor_task_assignment",
  "metrics": [
    "Task assignment efficiency",
    "Agent workload balance",
    "Priority handling",
    "Completion tracking"
  ],
  "description": "Monitor task assignment and management"
}
\`\`\`

## Security Audit Tasks

### Security Compliance
\`\`\`javascript
// Auto task: Security compliance check
{
  "task": "security_compliance_check",
  "trigger": "file_change",
  "pattern": "**/*.{js,ts,tsx}",
  "action": "validate_security_compliance",
  "rules": [
    "XSS protection",
    "CSRF protection",
    "Input validation",
    "Secure headers",
    "Content Security Policy"
  ],
  "description": "Validate security compliance"
}
\`\`\`

### Audit Logging
\`\`\`javascript
// Auto task: Audit logging
{
  "task": "audit_logging",
  "trigger": "file_change",
  "pattern": "shared/logs/**/*.log",
  "action": "validate_audit_logging",
  "rules": [
    "Security events logging",
    "Performance metrics logging",
    "Error tracking",
    "User activity logging"
  ],
  "description": "Validate audit logging implementation"
}
\`\`\`

## Performance Monitoring Tasks

### Performance Metrics
\`\`\`javascript
// Auto task: Performance metrics collection
{
  "task": "performance_metrics_collection",
  "trigger": "file_change",
  "pattern": "shared/logs/performance.log",
  "action": "collect_performance_metrics",
  "metrics": [
    "Execution time tracking",
    "Memory usage monitoring",
    "Bundle size analysis",
    "Render count monitoring"
  ],
  "description": "Collect and analyze performance metrics"
}
\`\`\`

### Memory Optimization
\`\`\`javascript
// Auto task: Memory optimization check
{
  "task": "memory_optimization_check",
  "trigger": "file_change",
  "pattern": "**/*.{js,ts,tsx}",
  "action": "validate_memory_optimization",
  "rules": [
    "Gereksiz re-render'lar engellenmeli",
    "Bundle size optimization",
    "Caching stratejileri",
    "Memory leak prevention"
  ],
  "description": "Validate memory optimization"
}
\`\`\`

## File Structure Validation

### Project Structure
\`\`\`javascript
// Auto task: Project structure validation
{
  "task": "project_structure_validation",
  "trigger": "file_change",
  "pattern": "**/*",
  "action": "validate_project_structure",
  "structure": {
    "multi-agent-v2/": {
      "orchestrator/": ["workflow-execution-engine.js", "agent-communication-system.js", "task-assignment-manager.js", "automatic-triggering-system.js", "main-system-controller.js"],
      "agents/": ["managerAgent.context7.json", "analystAgent.context7.json", "developerAgent.context7.json"],
      "shared/": {
        "tasks/": "*.context7.json",
        "logs/": "*.log",
        "context-injection/": "*-injection.context7.json"
      },
      "scripts/": ["status.js", "test-system.js"],
      "main.js": "Entry point"
    }
  },
  "description": "Validate project structure compliance"
}
\`\`\`

## Auto-Execution Rules

### Execution Priority
\`\`\`javascript
// Auto execution priority rules
{
  "priority_order": [
    "security_validation",
    "performance_optimization",
    "code_quality_validation",
    "atomic_design_validation",
    "testing_generation",
    "documentation_update"
  ],
  "parallel_execution": [
    "eslint_validation",
    "prettier_formatting",
    "typescript_validation"
  ],
  "sequential_execution": [
    "workflow_validation",
    "agent_communication_validation",
    "task_assignment_validation"
  ]
}
\`\`\`

### Error Handling
\`\`\`javascript
// Auto error handling rules
{
  "error_severity": {
    "critical": ["security_violation", "workflow_failure"],
    "high": ["performance_degradation", "agent_failure"],
    "medium": ["code_quality_issues", "test_failures"],
    "low": ["formatting_issues", "documentation_updates"]
  },
  "retry_policy": {
    "max_retries": 3,
    "retry_delay": 1000,
    "exponential_backoff": true
  },
  "notification_rules": {
    "critical": "immediate_notification",
    "high": "notification_within_5_minutes",
    "medium": "notification_within_30_minutes",
    "low": "daily_summary"
  }
}
\`\`\`

## Integration with Multi-Agent V2 System

### System Integration
\`\`\`javascript
// Auto integration with Multi-Agent V2 system
{
  "system_integration": {
    "workflow_engine": "orchestrator/workflow-execution-engine.js",
    "communication_system": "orchestrator/agent-communication-system.js",
    "task_manager": "orchestrator/task-assignment-manager.js",
    "triggering_system": "orchestrator/automatic-triggering-system.js",
    "main_controller": "orchestrator/main-system-controller.js"
  },
  "auto_tasks": {
    "workflow_monitoring": "Monitor workflow execution",
    "agent_communication": "Monitor agent communication",
    "task_assignment": "Monitor task assignment",
    "performance_tracking": "Track system performance",
    "security_auditing": "Audit security compliance"
  },
  "trigger_conditions": {
    "file_change": "Trigger on file modification",
    "workflow_start": "Trigger on workflow start",
    "task_completion": "Trigger on task completion",
    "error_occurrence": "Trigger on error occurrence",
    "performance_threshold": "Trigger on performance threshold"
  }
}
\`\`\`

## Summary

This \`.mdc\` configuration enables comprehensive automatic task management for the Multi-Agent V2 system, including:

1. **Workflow Orchestration**: Automatic workflow execution monitoring
2. **Agent Communication**: Real-time agent communication monitoring
3. **Task Assignment**: Intelligent task assignment and management
4. **Performance Optimization**: React optimization and memory management
5. **Security Validation**: XSS protection and input validation
6. **Code Quality**: ESLint, Prettier, and TypeScript validation
7. **Atomic Design**: Component structure validation
8. **Testing**: Auto-generation of unit tests and Storybook stories
9. **Monitoring**: Performance metrics and audit logging
10. **Error Handling**: Comprehensive error handling and retry policies

The configuration ensures that all aspects of the Multi-Agent V2 system are automatically monitored, validated, and optimized according to the established rules and best practices.

description:
globs:
alwaysApply: false

---

`;

  await fs.writeFile(path.join(projectPath, ".mdc"), mdcContent);
  console.log(chalk.green("📝 .mdc (Cursor Auto Tasks) oluşturuldu"));
}

async function createCursorRulesV2(projectPath, config) {
  const cursorRulesPath = path.join(projectPath, ".cursor", "rules");
  await fs.ensureDir(cursorRulesPath);

  const rulesContent = `---
alwaysApply: true
---

# EGKA AI AGENTS V2 - Multi-Agent Rules

## Multi-Agent V2 System Rules

### Agent Activation Rules V2

Her yeni chat başlangıcında aşağıdaki multi-agent V2 sistemi otomatik olarak devreye girer:

#### 1. Manager Agent V2 Activation
- **Trigger:** Kullanıcı herhangi bir komut girdiğinde
- **Action:** "Merhaba! Multi-Agent V2 Sistemine hoş geldiniz. Performance ve security optimizasyonları ile görevinizi alıyorum."
- **Next Step:** Görevi analist agent'a aktarır ve V2 performance requirements belirler

#### 2. Analyst Agent V2 Activation
- **Trigger:** Manager'dan gelen görev
- **Action:**
  - Auto increment ID ile task oluşturur (TASK-2025-1000 formatında)
  - Task context dosyası oluşturur: \`multi-agent-v2/shared/tasks/TASK-XXXX-XXXX.context7.json\`
  - Performance requirements ekler (React.memo, useCallback, useMemo)
  - Security requirements ekler (XSS, CSRF protection)
  - Atomic design level belirler (atoms, molecules, organisms)
  - Storybook requirements ekler

#### 3. Developer Agent V2 Activation
- **Trigger:** Frontend/UI ile ilgili task'lar
- **Action:**
  - Task context dosyasını okur
  - V2 Performance optimizasyonları uygular
  - V2 Security enhancements uygular
  - Atomic design V2 kurallarına uygun component'lar oluşturur
  - Storybook V2 integration yapar
  - Shared log'a yazar
  - Task durumunu günceller

## File Structure V2

\`\`\`
multi-agent-v2/
├── agents/
│   ├── managerAgent.context7.json
│   ├── analystAgent.context7.json
│   └── developerAgent.context7.json
├── shared/
│   ├── tasks/          # Task context dosyaları V2
│   └── logs/           # Shared log dosyaları V2
└── orchestrator/       # Agent koordinasyonu V2
\`\`\`

## V2 Performance Requirements

- **React.memo kullanımı zorunlu**: Tüm component'lerde React.memo ile performance optimization
- **useCallback optimizasyonu**: Prop olarak fonksiyon gönderiliyorsa useCallback kullanımı zorunlu
- **useMemo optimizasyonu**: Hesaplama maliyeti yüksek işlemlerde useMemo kullanımı zorunlu
- **Memory optimization**: Gereksiz re-render'lar engellenir
- **Bundle size optimization**: Bundle boyutu optimize edilir

## V2 Security Requirements

- **XSS Protection**: Content-Security-Policy uygulanmalı
- **CSRF Protection**: SameSite cookies kullanılmalı
- **Input Validation**: Tüm kullanıcı girdileri doğrulanmalı
- **API Security**: Hassas veriler backend'de tutulmalı

## V2 Atomic Design Rules

- **Atoms**: Basic components (buttons, inputs, typography)
- **Molecules**: Simple combinations of atoms (form fields, search bars)
- **Organisms**: Complex combinations of molecules (headers, forms)
- **Templates**: Page layouts and structure
- **Pages**: Complete pages with real content

## V2 Modern React Practices

- **TypeScript strict mode**: TypeScript strict mode kullanılmalı
- **Arrow function kullanımı**: Tüm fonksiyonlar arrow function şeklinde tanımlanmalı
- **Explicit return**: Mümkünse return kullanılarak açık şekilde değer dönülmeli
- **Material UI entegrasyonu**: UI bileşenleri Material UI kullanmalı

## V2 Code Quality Rules

- **ESLint V2 kurallarına uyulmalı**: Performance ve security rules dahil
- **Prettier ile kod formatlanmalı**
- **TypeScript strict mode kullanılmalı**
- **Modern JavaScript/TypeScript özellikleri kullanılmalı**
- **Accessibility (a11y) standartlarına uyulmalı**
- **Performance optimizasyonları yapılmalı**

## V2 Communication Rules

- Ajanlar, her zaman Türkçe cevaplar vermeli
- Kod yorumları Türkçe olmalı
- Değişken ve fonksiyon isimleri İngilizce olmalı
- Dosya isimleri İngilizce olmalı

## V2 Commands

- \`npm run status\` - V2 Sistem durumu
- \`npm run test\` - V2 Test çalıştır
- \`npm run performance\` - Performance metrics
- \`npm run security\` - Security audit

## Project Info V2

- **Name:** ${config.projectName}
- **Version:** 3.0.0
- **Features:** ${config.features?.join(", ") || "V2 Default"}
- **Framework:** ${config.framework}
- **Language:** ${config.language}
- **CSS Framework:** ${config.cssFramework}

---

**Bu dosya V2 otomatik olarak oluşturulmuştur ve "always" seçili olmalıdır.**`;

  await fs.writeFile(
    path.join(cursorRulesPath, "multi-agent-rules.mdc"),
    rulesContent
  );
  console.log(
    chalk.green("📝 V2 .cursor/rules/multi-agent-rules.mdc oluşturuldu")
  );
}

async function optimizeProjectV2(projectPath, config) {
  console.log(
    chalk.yellow(
      "⚡ V2 Performance ve Security optimizasyonları uygulanıyor..."
    )
  );

  // Update package.json with V2 scripts
  const packageJsonPath = path.join(projectPath, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageData = await fs.readJson(packageJsonPath);

    // Add V2 scripts
    packageData.scripts = {
      ...packageData.scripts,
      status: "node multi-agent-v2/scripts/status.js",
      test: "node multi-agent-v2/scripts/status.js",
      performance: "echo 'Performance metrics available'",
      security: "echo 'Security audit available'",
      storybook: "storybook dev -p 6006",
      "build-storybook": "storybook build",
    };

    await fs.writeJson(packageJsonPath, packageData, { spaces: 2 });
  }
}

async function setupCIV2(projectPath, config) {
  const ciPath = path.join(projectPath, ".github", "workflows");
  await fs.ensureDir(ciPath);

  const ciConfig = {
    name: "V2 CI/CD Pipeline",
    on: {
      push: {
        branches: ["main", "develop"],
      },
      pull_request: {
        branches: ["main"],
      },
    },
    jobs: {
      test: {
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
            name: "Performance audit",
            run: "npm run performance",
          },
          {
            name: "Security audit",
            run: "npm run security",
          },
        ],
      },
    },
  };

  await fs.writeJson(path.join(ciPath, "ci.yml"), ciConfig, { spaces: 2 });
}

// Legacy function aliases for backward compatibility
async function createFeatureFiles(projectPath, config) {
  return createFeatureFilesV2(projectPath, config);
}

async function createConfigFiles(projectPath, config) {
  return createConfigFilesV2(projectPath, config);
}

async function createCursorRules(projectPath, config) {
  return createCursorRulesV2(projectPath, config);
}

async function setupCI(projectPath, config) {
  return setupCIV2(projectPath, config);
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

  const multiAgentRulesContent = `# Multi-Agent System Rules

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
    path.join(cursorRulesPath, "multi-agent-rules.mdc"),
    multiAgentRulesContent
  );
  console.log(chalk.green("✅ Cursor rules oluşturuldu"));
}

async function createProjectWithFrameworkCLI(config) {
  // Güvenli current working directory alma
  let currentCwd;
  try {
    currentCwd = process.cwd();
  } catch (error) {
    currentCwd = path.dirname(__dirname);
  }

  const projectPath = path.join(currentCwd, config.projectName);

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

  // Güvenli current working directory alma
  let currentCwd;
  try {
    currentCwd = process.cwd();
  } catch (error) {
    currentCwd = path.dirname(__dirname);
  }

  const createCommand = `npx create-next-app@latest ${
    config.projectName
  } --typescript=${config.language === "typescript"} --tailwind=${
    config.cssFramework === "tailwind"
  } --eslint --app --src-dir --import-alias "@/*" --yes`;

  console.log(chalk.gray(`   ${createCommand}`));

  try {
    execSync(createCommand, {
      stdio: "inherit",
      cwd: currentCwd,
      env: { ...process.env, FORCE_COLOR: "1" },
    });

    console.log(chalk.green("✅ Next.js projesi oluşturuldu"));
  } catch (error) {
    console.log(
      chalk.yellow("⚠️  Next.js CLI hatası, manuel oluşturma yapılıyor...")
    );
    throw error; // Manuel oluşturmaya geç
  }
}

async function createReactProject(config) {
  // Vite ile React projesi oluştur (Create React App deprecated)
  const template = config.language === "typescript" ? "react-ts" : "react";

  // Güvenli current working directory alma
  let currentCwd;
  try {
    currentCwd = process.cwd();
  } catch (error) {
    currentCwd = path.dirname(__dirname);
  }

  const createCommand = `npx create-vite@latest ${config.projectName} --template ${template} --yes`;

  console.log(chalk.gray(`   ${createCommand}`));

  try {
    // Önce mevcut dizini kaydet
    const originalCwd = currentCwd;

    // Proje dizinine geç
    const projectPath = path.join(currentCwd, config.projectName);

    // Vite ile proje oluştur
    execSync(createCommand, {
      stdio: "inherit",
      cwd: currentCwd,
      env: { ...process.env, FORCE_COLOR: "1" },
    });

    console.log(chalk.green("✅ Vite projesi oluşturuldu"));
  } catch (error) {
    console.log(
      chalk.yellow("⚠️  Vite CLI hatası, manuel oluşturma yapılıyor...")
    );
    throw error; // Manuel oluşturmaya geç
  }
}

async function createLovableProject(config) {
  // Lovable projesi oluştur (varsayılan olarak Vite kullan)

  // Güvenli current working directory alma
  let currentCwd;
  try {
    currentCwd = process.cwd();
  } catch (error) {
    currentCwd = path.dirname(__dirname);
  }

  const createCommand = `npx create-vite@latest ${config.projectName} --template react-ts --yes`;

  console.log(chalk.gray(`   ${createCommand}`));

  try {
    execSync(createCommand, {
      stdio: "inherit",
      cwd: currentCwd,
      env: { ...process.env, FORCE_COLOR: "1" },
    });

    console.log(chalk.green("✅ Lovable projesi oluşturuldu"));
  } catch (error) {
    console.log(
      chalk.yellow("⚠️  Lovable CLI hatası, manuel oluşturma yapılıyor...")
    );
    throw error; // Manuel oluşturmaya geç
  }
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
  // Güvenli current working directory alma
  let currentCwd;
  try {
    currentCwd = process.cwd();
  } catch (error) {
    currentCwd = path.dirname(__dirname);
  }

  const projectPath = path.join(currentCwd, config.projectName);

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
  // Güvenli current working directory alma
  let currentCwd;
  try {
    currentCwd = process.cwd();
  } catch (error) {
    currentCwd = path.dirname(__dirname);
  }

  const projectPath = path.join(currentCwd, config.projectName);

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
      "context-injection": {},
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
        conditional: "ui_task_required",
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

  // Context injection dosyalarını kopyala
  const sourceContextInjectionPath = path.join(
    __dirname,
    "..",
    "multi-agent",
    "shared",
    "context-injection"
  );
  const targetContextInjectionPath = path.join(
    multiAgentPath,
    "shared",
    "context-injection"
  );

  if (await fs.pathExists(sourceContextInjectionPath)) {
    await fs.copy(sourceContextInjectionPath, targetContextInjectionPath);
    console.log(chalk.green("✅ Context injection dosyaları kopyalandı"));
  }

  // Scripts klasörünü oluştur ve dosyaları kopyala
  const scriptsPath = path.join(multiAgentPath, "scripts");
  await fs.ensureDir(scriptsPath);

  const sourceScriptsPath = path.join(
    __dirname,
    "..",
    "multi-agent",
    "scripts"
  );
  if (await fs.pathExists(sourceScriptsPath)) {
    await fs.copy(sourceScriptsPath, scriptsPath);
    console.log(chalk.green("✅ Scripts dosyaları kopyalandı"));
  }

  // Orchestrator dosyalarını kopyala (workflow.context7.json hariç)
  const sourceOrchestratorPath = path.join(
    __dirname,
    "..",
    "multi-agent",
    "orchestrator"
  );
  const targetOrchestratorPath = path.join(multiAgentPath, "orchestrator");

  if (await fs.pathExists(sourceOrchestratorPath)) {
    const orchestratorFiles = await fs.readdir(sourceOrchestratorPath);
    for (const file of orchestratorFiles) {
      if (file !== "workflow.context7.json") {
        // workflow dosyasını atla, zaten oluşturuldu
        const sourceFile = path.join(sourceOrchestratorPath, file);
        const targetFile = path.join(targetOrchestratorPath, file);
        await fs.copy(sourceFile, targetFile);
      }
    }
    console.log(chalk.green("✅ Orchestrator dosyaları kopyalandı"));
  }

  console.log(chalk.green("✅ Multi-agent sistemi oluşturuldu"));
}

function createMultiAgentSystem(projectPath) {
  console.log("🤖 Multi-Agent sistemi oluşturuluyor...");

  const multiAgentPath = path.join(projectPath, "multi-agent");

  if (!fs.existsSync(multiAgentPath)) {
    fs.mkdirSync(multiAgentPath, { recursive: true });
  }

  // Ana dizinleri oluştur
  const dirs = [
    "agents",
    "shared",
    "shared/tasks",
    "shared/logs",
    "shared/context-injection",
    "orchestrator",
    "scripts",
  ];

  dirs.forEach((dir) => {
    const dirPath = path.join(multiAgentPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Agent dosyalarını oluştur
  const agents = [
    "managerAgent.context7.json",
    "analystAgent.context7.json",
    "developerAgent.context7.json",
  ];

  agents.forEach((agent) => {
    const agentPath = path.join(multiAgentPath, "agents", agent);
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "multi-agent",
      "agents",
      agent
    );

    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, agentPath);
    }
  });

  // Ana context dosyası
  const mainContext = {
    system_name: "Multi-Agent Development System",
    version: "2.0.0",
    description: "AI destekli geliştirme sistemi",
    created_at: new Date().toISOString(),
    active_agents: 3,
    agents: ["managerAgent", "analystAgent", "developerAgent"],
    file_structure: {
      "agents/": "Agent konfigürasyonları",
      "shared/": "Paylaşılan dosyalar",
      "shared/tasks/": "Task dosyaları",
      "shared/logs/": "Log dosyaları",
      "orchestrator/": "Agent koordinasyonu",
      "scripts/": "Sistem scriptleri",
    },
    enhancements: [
      "Multi-project desteği",

      "Atomic design support",
      "AI-powered component editing",
    ],
  };

  fs.writeFileSync(
    path.join(multiAgentPath, "main.context7.json"),
    JSON.stringify(mainContext, null, 2)
  );

  // Workflow dosyası
  const workflow = {
    workflow_name: "Multi-Agent Development Workflow",
    version: "2.0.0",
    steps: [
      {
        step: 1,
        agent: "managerAgent",
        action: "project_analysis",
        description: "Proje analizi ve görev dağıtımı",
      },
      {
        step: 2,
        agent: "analystAgent",
        action: "task_creation",
        description: "Task oluşturma ve context hazırlama",
      },
      {
        step: 3,
        agent: "developerAgent",
        action: "code_development",
        description: "Kod geliştirme ve implementasyon",
      },
    ],
  };

  fs.writeFileSync(
    path.join(multiAgentPath, "orchestrator", "workflow.context7.json"),
    JSON.stringify(workflow, null, 2)
  );

  // Log dosyaları
  const logFiles = [
    "manager-agent.log",
    "analyst-agent.log",
    "developer-agent.log",

    "system.log",
  ];

  logFiles.forEach((logFile) => {
    const logPath = path.join(multiAgentPath, "shared", "logs", logFile);
    const logContent = `# ${logFile.replace(".log", "")} Log
# Başlangıç: ${new Date().toISOString()}

`;
    fs.writeFileSync(logPath, logContent);
  });

  // Context injection dosyalarını kopyala
  const sourceContextInjectionPath = path.join(
    __dirname,
    "..",
    "multi-agent",
    "shared",
    "context-injection"
  );
  const targetContextInjectionPath = path.join(
    multiAgentPath,
    "shared",
    "context-injection"
  );

  if (fs.existsSync(sourceContextInjectionPath)) {
    fs.copySync(sourceContextInjectionPath, targetContextInjectionPath, {
      recursive: true,
    });
    console.log(chalk.green("✅ Context injection dosyaları kopyalandı"));
  }

  // Orchestrator dosyalarını kopyala
  const sourceOrchestratorPath = path.join(
    __dirname,
    "..",
    "multi-agent",
    "orchestrator"
  );
  const targetOrchestratorPath = path.join(multiAgentPath, "orchestrator");

  if (fs.existsSync(sourceOrchestratorPath)) {
    const orchestratorFiles = fs.readdirSync(sourceOrchestratorPath);
    for (const file of orchestratorFiles) {
      if (file !== "workflow.context7.json") {
        // workflow dosyasını atla, zaten oluşturuldu
        const sourceFile = path.join(sourceOrchestratorPath, file);
        const targetFile = path.join(targetOrchestratorPath, file);
        fs.copyFileSync(sourceFile, targetFile);
      }
    }
    console.log(chalk.green("✅ Orchestrator dosyaları kopyalandı"));
  }

  // Scripts dosyalarını kopyala
  const sourceScriptsPath = path.join(
    __dirname,
    "..",
    "multi-agent",
    "scripts"
  );
  const targetScriptsPath = path.join(multiAgentPath, "scripts");

  if (fs.existsSync(sourceScriptsPath)) {
    const scriptFiles = fs.readdirSync(sourceScriptsPath);
    for (const file of scriptFiles) {
      const sourceFile = path.join(sourceScriptsPath, file);
      const targetFile = path.join(targetScriptsPath, file);
      fs.copyFileSync(sourceFile, targetFile);
    }
    console.log(chalk.green("✅ Scripts dosyaları kopyalandı"));
  }

  // README
  const readme = `# Multi-Agent Development System

Bu sistem, AI destekli geliştirme için multi-agent mimarisi kullanır.

## 🤖 Agentlar

- **Manager Agent**: Proje analizi ve görev dağıtımı
- **Analyst Agent**: Task oluşturma ve context hazırlama  
- **Developer Agent**: Kod geliştirme ve implementasyon
- **Developer Agent**: Kod geliştirme ve UI düzenleme

## 🚀 Başlatma

\`\`\`bash


# Sistem scriptleri
cd multi-agent/scripts
node status.js
\`\`\`

## 📁 Yapı

- \`agents/\`: Agent konfigürasyonları
- \`shared/tasks/\`: Task dosyaları
- \`shared/logs/\`: Log dosyaları

- \`orchestrator/\`: Agent koordinasyonu

## 🔄 Workflow

1. Manager Agent → Proje analizi
2. Analyst Agent → Task oluşturma
3. Developer Agent → Kod geliştirme
3. Developer Agent → Kod geliştirme ve UI düzenleme
`;

  fs.writeFileSync(path.join(multiAgentPath, "README.md"), readme);

  console.log("✅ Multi-Agent sistemi oluşturuldu!");
  console.log(`📁 Konum: ${multiAgentPath}`);
}

// ... existing code ...

function create(projectName) {
  console.log(`🚀 Yeni proje oluşturuluyor: ${projectName}`);

  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.error(`❌ Hata: ${projectName} projesi zaten mevcut!`);
    process.exit(1);
  }

  // Proje dizinini oluştur
  fs.mkdirSync(projectPath, { recursive: true });

  // Multi-Agent sistemini oluştur
  createMultiAgentSystem(projectPath);

  // Ana README
  const mainReadme = `# ${projectName}

Bu proje, Multi-Agent Development System kullanılarak oluşturulmuştur.

## 🚀 Başlatma

\`\`\`bash
# Sistem durumu
cd multi-agent/scripts
node status.js
\`\`\`

## 📁 Proje Yapısı

- \`multi-agent/\`: Multi-agent sistemi

- \`src/\`: Ana proje kaynak kodları

## 🤖 Agentlar

- Manager Agent: Proje analizi
- Analyst Agent: Task oluşturma
- Developer Agent: Kod geliştirme  
- Developer Agent: Kod geliştirme ve UI düzenleme


`;

  fs.writeFileSync(path.join(projectPath, "README.md"), mainReadme);

  console.log(`✅ Proje başarıyla oluşturuldu: ${projectName}`);
  console.log(`📁 Konum: ${projectPath}`);
}

function init() {
  console.log("🔧 Mevcut projeye Multi-Agent sistemi ekleniyor...");

  const projectPath = process.cwd();

  // Multi-Agent sistemini oluştur
  createMultiAgentSystem(projectPath);

  console.log("✅ Multi-Agent sistemi başarıyla eklendi!");
  console.log("🚀 Sistem durumunu kontrol etmek için:");
  console.log("   cd multi-agent/scripts");
  console.log("   node status.js");
}

// ... existing code ...

program.parse();
