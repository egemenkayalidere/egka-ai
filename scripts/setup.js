#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

console.log(chalk.cyan("🔧 Multi-Agent System Setup Başlatılıyor...\n"));

/**
 * Multi-Agent System oluşturma fonksiyonu
 * Yeni bir multi-agent projesi oluşturur
 */
async function create(projectName) {
  try {
    console.log(
      chalk.blue(`🚀 Yeni Multi-Agent Projesi Oluşturuluyor: ${projectName}`)
    );

    const projectPath = path.join(process.cwd(), projectName);

    // Proje klasörünü oluştur
    await fs.ensureDir(projectPath);

    // Multi-Agent System yapısını oluştur
    const multiAgentPath = path.join(projectPath, "multi-agent");
    await createMultiAgentStructure(multiAgentPath);

    // Package.json oluştur
    await createPackageJson(projectPath, projectName);

    // README oluştur
    await createReadme(projectPath, projectName);

    console.log(
      chalk.green(
        `\n✅ Multi-Agent Projesi başarıyla oluşturuldu: ${projectName}`
      )
    );
    console.log(chalk.cyan("\n📁 Proje Yapısı:"));
    console.log(chalk.white(`   ${projectName}/`));
    console.log(chalk.white("   ├── multi-agent/"));
    console.log(chalk.white("   │   ├── agents/"));
    console.log(chalk.white("   │   ├── shared/"));
    console.log(chalk.white("   │   └── orchestrator/"));
    console.log(chalk.white("   ├── package.json"));
    console.log(chalk.white("   └── README.md"));

    console.log(chalk.cyan("\n🚀 Kullanım:"));
    console.log(chalk.white(`   cd ${projectName}`));
    console.log(chalk.white("   npm install"));
    console.log(chalk.white("   npm run agent-status"));
  } catch (error) {
    console.error(chalk.red("❌ Create hatası:"), error.message);
    process.exit(1);
  }
}

/**
 * Multi-Agent System başlatma fonksiyonu
 * Mevcut projeye multi-agent sistemi ekler
 */
async function init() {
  try {
    console.log(
      chalk.blue("🔧 Mevcut Projeye Multi-Agent System Ekleniyor...")
    );

    const projectPath = process.cwd();

    // Multi-Agent System yapısını oluştur
    const multiAgentPath = path.join(projectPath, "multi-agent");
    await createMultiAgentStructure(multiAgentPath);

    // Package.json'a script ekle
    await updatePackageJson(projectPath);

    console.log(chalk.green("\n✅ Multi-Agent System başarıyla eklendi!"));
    console.log(chalk.cyan("\n🚀 Kullanım:"));
    console.log(chalk.white("   npm run agent-status"));
    console.log(chalk.white("   npm run agent-create-task"));
    console.log(chalk.white("   npm run agent-logs"));
  } catch (error) {
    console.error(chalk.red("❌ Init hatası:"), error.message);
    process.exit(1);
  }
}

/**
 * Multi-Agent System yapısını oluşturur
 */
async function createMultiAgentStructure(multiAgentPath) {
  // Ana klasörleri oluştur
  const directories = [
    "agents",
    "shared/tasks",
    "shared/logs",
    "shared/context-injection",
    "orchestrator",
    "scripts",
  ];

  for (const dir of directories) {
    await fs.ensureDir(path.join(multiAgentPath, dir));
  }

  // Agent dosyalarını oluştur
  await createAgentFiles(multiAgentPath);

  // Shared dosyalarını oluştur
  await createSharedFiles(multiAgentPath);

  // Orchestrator dosyalarını oluştur
  await createOrchestratorFiles(multiAgentPath);

  // Script dosyalarını oluştur
  await createScriptFiles(multiAgentPath);

  // Ana context dosyasını oluştur
  await createMainContext(multiAgentPath);

  console.log(chalk.green("🤖 Multi-Agent System yapısı oluşturuldu"));
}

/**
 * Agent dosyalarını oluşturur
 */
async function createAgentFiles(multiAgentPath) {
  const agents = [
    {
      name: "managerAgent.context7.json",
      content: {
        name: "Manager Agent",
        version: "1.0.0",
        description: "Multi-Agent System Manager Agent",
        type: "agent",
        capabilities: [
          "task_management",
          "agent_coordination",
          "workflow_orchestration",
          "status_monitoring",
          "shared_logging",
        ],
        configuration: {
          supported_languages: ["typescript", "javascript", "json"],
          max_file_size: 1000000,
          timeout: 60000,
          log_level: "info",
        },
        workflow: {
          task_execution: {
            task_discovery: {
              scan_shared_tasks: true,
              read_task_context: true,
              priority_sorting: true,
            },
            agent_assignment: {
              analyze_requirements: true,
              select_appropriate_agent: true,
              delegate_task: true,
            },
            status_monitoring: {
              track_progress: true,
              update_status: true,
              handle_completion: true,
            },
          },
          shared_logging: {
            task_execution_log: {
              start_time: true,
              end_time: true,
              duration: true,
              status: true,
              details: true,
            },
            work_log: {
              actions_performed: true,
              files_created: true,
              files_modified: true,
              errors_encountered: true,
            },
          },
        },
        rules: {
          task_management: "Task'ları uygun agent'lara dağıtmalı",
          coordination: "Agent'lar arası koordinasyonu sağlamalı",
          monitoring: "Sistem durumunu sürekli izlemeli",
          logging: "Tüm aktiviteleri loglamalı",
        },
      },
    },
    {
      name: "analystAgent.context7.json",
      content: {
        name: "Analyst Agent",
        version: "1.0.0",
        description: "Multi-Agent System Analyst Agent",
        type: "agent",
        capabilities: [
          "task_analysis",
          "requirement_analysis",
          "task_creation",
          "context_management",
          "priority_assessment",
        ],
        configuration: {
          supported_languages: ["typescript", "javascript", "json"],
          max_file_size: 1000000,
          timeout: 60000,
          log_level: "info",
        },
        workflow: {
          task_analysis: {
            requirement_analysis: {
              analyze_user_input: true,
              identify_requirements: true,
              create_task_context: true,
            },
            task_creation: {
              generate_task_id: true,
              create_task_file: true,
              assign_priority: true,
            },
            agent_assignment: {
              analyze_task_type: true,
              select_appropriate_agent: true,
              delegate_to_agent: true,
            },
          },
        },
        rules: {
          analysis: "Kullanıcı isteklerini detaylı analiz etmeli",
          task_creation: "Task context dosyaları oluşturmalı",
          assignment: "Uygun agent'ı seçmeli",
        },
      },
    },
    {
      name: "developerAgent.context7.json",
      content: {
        name: "Developer Agent",
        version: "1.0.0",
        description: "Multi-Agent System Developer Agent",
        type: "agent",
        capabilities: [
          "frontend_development",
          "react_development",
          "nextjs_development",
          "react_native_development",
          "ui_development",
          "component_development",
        ],
        configuration: {
          supported_languages: ["typescript", "javascript", "jsx", "tsx"],
          frameworks: ["react", "next.js", "react-native"],
          max_file_size: 1000000,
          timeout: 60000,
          log_level: "info",
        },
        workflow: {
          development: {
            component_development: {
              create_components: true,
              implement_ui: true,
              add_styling: true,
            },
            feature_development: {
              implement_features: true,
              add_functionality: true,
              integrate_apis: true,
            },
            optimization: {
              performance_optimization: true,
              code_optimization: true,
              accessibility_improvement: true,
            },
          },
        },
        rules: {
          development:
            "Modern React/Next.js standartlarına uygun geliştirme yapmalı",
          performance: "Performans optimizasyonları uygulamalı",
          accessibility: "Accessibility standartlarına uygun kod yazmalı",
        },
      },
    },
    {
      name: "backendAgent.context7.json",
      content: {
        name: "Backend Agent",
        version: "1.0.0",
        description: "Multi-Agent System Backend Agent",
        type: "agent",
        capabilities: [
          "api_development",
          "nodejs_development",
          "express_development",
          "firebase_integration",
          "authentication",
          "database_management",
        ],
        configuration: {
          supported_languages: ["typescript", "javascript", "json"],
          frameworks: ["express", "node.js"],
          databases: ["firebase", "mongodb", "postgresql"],
          max_file_size: 1000000,
          timeout: 60000,
          log_level: "info",
        },
        workflow: {
          api_development: {
            endpoint_creation: {
              create_routes: true,
              implement_controllers: true,
              add_middleware: true,
            },
            database_integration: {
              setup_database: true,
              create_models: true,
              implement_crud: true,
            },
            authentication: {
              implement_auth: true,
              add_security: true,
              manage_sessions: true,
            },
          },
        },
        rules: {
          development:
            "Modern Node.js/Express standartlarına uygun geliştirme yapmalı",
          security: "Güvenlik önlemlerini uygulamalı",
          performance: "API performansını optimize etmeli",
        },
      },
    },
  ];

  for (const agent of agents) {
    await fs.writeJson(
      path.join(multiAgentPath, "agents", agent.name),
      agent.content,
      { spaces: 2 }
    );
  }
}

/**
 * Shared dosyalarını oluşturur
 */
async function createSharedFiles(multiAgentPath) {
  // Log dosyalarını oluştur
  const logFiles = [
    "system.log",
    "manager-agent.log",
    "analyst-agent.log",
    "developer-agent.log",
    "backend-agent.log",
  ];

  for (const logFile of logFiles) {
    const logPath = path.join(multiAgentPath, "shared/logs", logFile);
    await fs.writeFile(
      logPath,
      `# ${logFile} - Multi-Agent System Log\n# Created: ${new Date().toISOString()}\n\n`
    );
  }

  // Context injection dosyasını oluştur
  const contextInjectionPath = path.join(
    multiAgentPath,
    "shared/context-injection/developer-injection.context7.json"
  );
  await fs.writeJson(
    contextInjectionPath,
    {
      name: "Developer Context Injection",
      version: "1.0.0",
      description: "Developer agent için context injection kuralları",
      type: "context_injection",
      rules: {
        communication: "Türkçe cevap vermeli",
        code_quality: "Modern JavaScript/TypeScript kullanmalı",
        performance: "React.memo, useCallback, useMemo kullanmalı",
        security: "Güvenlik önlemlerini uygulamalı",
      },
    },
    { spaces: 2 }
  );
}

/**
 * Orchestrator dosyalarını oluşturur
 */
async function createOrchestratorFiles(multiAgentPath) {
  const orchestratorPath = path.join(multiAgentPath, "orchestrator");

  // Context injection manager
  await fs.writeFile(
    path.join(orchestratorPath, "context-injection-manager.js"),
    `#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

/**
 * Context injection manager
 * Agent'lara context injection uygular
 */
class ContextInjectionManager {
  constructor() {
    this.contextPath = path.join(__dirname, "../shared/context-injection");
  }
  
  async injectContext(agentName) {
    try {
      const contextFile = path.join(this.contextPath, \`\${agentName}-injection.context7.json\`);
      if (await fs.pathExists(contextFile)) {
        const context = await fs.readJson(contextFile);
        return context;
      }
      return null;
    } catch (error) {
      console.error("Context injection hatası:", error.message);
      return null;
    }
  }
}

module.exports = ContextInjectionManager;
`
  );
}

/**
 * Script dosyalarını oluşturur
 */
async function createScriptFiles(multiAgentPath) {
  const scriptsPath = path.join(multiAgentPath, "scripts");

  // Status script
  await fs.writeFile(
    path.join(scriptsPath, "status.js"),
    `#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

async function showStatus() {
  try {
    console.log(chalk.cyan("🤖 Multi-Agent System Durumu\\n"));
    
    const logsPath = path.join(__dirname, "../shared/logs");
    const tasksPath = path.join(__dirname, "../shared/tasks");
    
    // Log dosyalarını kontrol et
    const logFiles = await fs.readdir(logsPath);
    console.log(chalk.blue("📋 Log Dosyaları:"));
    for (const file of logFiles) {
      const stats = await fs.stat(path.join(logsPath, file));
      console.log(chalk.white(\`   \${file} - \${stats.size} bytes\`));
    }
    
    // Task dosyalarını kontrol et
    const taskFiles = await fs.readdir(tasksPath);
    console.log(chalk.blue("\\n📝 Task Dosyaları:"));
    if (taskFiles.length === 0) {
      console.log(chalk.yellow("   Henüz task oluşturulmamış"));
    } else {
      for (const file of taskFiles) {
        const stats = await fs.stat(path.join(tasksPath, file));
        console.log(chalk.white(\`   \${file} - \${stats.size} bytes\`));
      }
    }
    
    console.log(chalk.green("\\n✅ Sistem durumu kontrol edildi"));
    
  } catch (error) {
    console.error(chalk.red("❌ Status hatası:"), error.message);
  }
}

showStatus();
`
  );

  // Create task script
  await fs.writeFile(
    path.join(scriptsPath, "create-task.js"),
    `#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

async function createTask(taskName, description) {
  try {
    const taskId = \`TASK-\${new Date().getFullYear()}-\${Math.floor(Math.random() * 9000) + 1000}\`;
    const taskPath = path.join(__dirname, "../shared/tasks", \`\${taskId}.context7.json\`);
    
    const taskData = {
      id: taskId,
      name: taskName,
      description: description,
      status: "pending",
      created_at: new Date().toISOString(),
      assigned_agent: null,
      priority: "medium",
      requirements: [],
      progress: 0
    };
    
    await fs.writeJson(taskPath, taskData, { spaces: 2 });
    console.log(chalk.green(\`✅ Task oluşturuldu: \${taskId}\`));
    console.log(chalk.cyan(\`📁 Dosya: \${taskPath}\`));
    
  } catch (error) {
    console.error(chalk.red("❌ Task oluşturma hatası:"), error.message);
  }
}

// Command line arguments
const taskName = process.argv[2] || "Yeni Task";
const description = process.argv[3] || "Task açıklaması";

createTask(taskName, description);
`
  );

  // Logs script
  await fs.writeFile(
    path.join(scriptsPath, "logs.js"),
    `#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

async function showLogs(agentName = "system") {
  try {
    const logPath = path.join(__dirname, "../shared/logs", \`\${agentName}.log\`);
    
    if (await fs.pathExists(logPath)) {
      const content = await fs.readFile(logPath, "utf8");
      console.log(chalk.cyan(\`📋 \${agentName} Logları:\\n\`));
      console.log(content);
    } else {
      console.log(chalk.yellow(\`⚠️  \${agentName} log dosyası bulunamadı\`));
    }
    
  } catch (error) {
    console.error(chalk.red("❌ Log okuma hatası:"), error.message);
  }
}

// Command line arguments
const agentName = process.argv[2] || "system";

showLogs(agentName);
`
  );
}

/**
 * Ana context dosyasını oluşturur
 */
async function createMainContext(multiAgentPath) {
  const mainContextPath = path.join(multiAgentPath, "main.context7.json");

  await fs.writeJson(
    mainContextPath,
    {
      name: "Multi-Agent System",
      version: "1.0.0",
      description: "Sıfır Multi-Agent Sistemi - Temel Yapı",
      type: "system",
      created_at: new Date().toISOString(),
      system_config: {
        agents: ["manager", "analyst", "developer", "backend"],
        workflow: "sequential",
        communication: "shared_logs",
        context_injection: true,
        atomic_design: true,
        story_generation: true,
      },
      file_structure: {
        "agents/": "Agent konfigürasyonları",
        "shared/tasks/": "Task dosyaları",
        "shared/logs/": "Log dosyaları",
        "shared/context-injection/": "Context injection dosyaları",
        "orchestrator/": "Sistem orkestrasyonu",
        "scripts/": "Sistem scriptleri",
      },
      rules: {
        communication: "Tüm ajanlar Türkçe cevap vermeli",
        code_quality: "Modern JavaScript/TypeScript kullanılmalı",
        atomic_design: "Atomic design kurallarına uyulmalı",
        story_generation: "Her component için story dosyası oluşturulmalı",
        context_injection: "Agent'lar context injection ile çalışmalı",
      },
    },
    { spaces: 2 }
  );
}

/**
 * Package.json oluşturur
 */
async function createPackageJson(projectPath, projectName) {
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "Multi-Agent System Projesi",
    main: "index.js",
    scripts: {
      start: "node index.js",
      "agent-status": "node multi-agent/scripts/status.js",
      "agent-create-task": "node multi-agent/scripts/create-task.js",
      "agent-logs": "node multi-agent/scripts/logs.js",
      setup: "node scripts/setup.js",
    },
    dependencies: {
      chalk: "^4.1.2",
      "fs-extra": "^10.1.0",
    },
    devDependencies: {
      "@types/node": "^18.0.0",
    },
    keywords: ["multi-agent", "ai", "automation"],
    author: "Multi-Agent System",
    license: "MIT",
  };

  await fs.writeJson(path.join(projectPath, "package.json"), packageJson, {
    spaces: 2,
  });
}

/**
 * README oluşturur
 */
async function createReadme(projectPath, projectName) {
  const readmeContent = `# ${projectName}

Multi-Agent System Projesi

## 🚀 Kurulum

\`\`\`bash
npm install
\`\`\`

## 📋 Kullanım

### Sistem Durumu
\`\`\`bash
npm run agent-status
\`\`\`

### Task Oluşturma
\`\`\`bash
npm run agent-create-task "Task Adı" "Task Açıklaması"
\`\`\`

### Logları Görüntüleme
\`\`\`bash
npm run agent-logs [agent-name]
\`\`\`

## 📁 Proje Yapısı

\`\`\`
${projectName}/
├── multi-agent/
│   ├── agents/           # Agent konfigürasyonları
│   ├── shared/
│   │   ├── tasks/        # Task dosyaları
│   │   ├── logs/         # Log dosyaları
│   │   └── context-injection/  # Context injection
│   ├── orchestrator/     # Sistem orkestrasyonu
│   └── scripts/          # Sistem scriptleri
├── package.json
└── README.md
\`\`\`

## 🤖 Agent'lar

- **Manager Agent**: Task yönetimi ve koordinasyon
- **Analyst Agent**: Task analizi ve oluşturma
- **Developer Agent**: Frontend geliştirme
- **Backend Agent**: Backend geliştirme

## 📝 Lisans

MIT
`;

  await fs.writeFile(path.join(projectPath, "README.md"), readmeContent);
}

/**
 * Package.json'u günceller
 */
async function updatePackageJson(projectPath) {
  const packagePath = path.join(projectPath, "package.json");

  if (await fs.pathExists(packagePath)) {
    const packageJson = await fs.readJson(packagePath);

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Multi-agent scriptlerini ekle
    packageJson.scripts["agent-status"] = "node multi-agent/scripts/status.js";
    packageJson.scripts["agent-create-task"] =
      "node multi-agent/scripts/create-task.js";
    packageJson.scripts["agent-logs"] = "node multi-agent/scripts/logs.js";

    await fs.writeJson(packagePath, packageJson, { spaces: 2 });
    console.log(chalk.green("📦 package.json güncellendi"));
  }
}

// Command line arguments
const command = process.argv[2];
const projectName = process.argv[3];

if (command === "create" && projectName) {
  create(projectName);
} else if (command === "init") {
  init();
} else {
  console.log(chalk.cyan("🔧 Multi-Agent System Setup"));
  console.log(chalk.white("\n📋 Kullanım:"));
  console.log(
    chalk.white(
      "   node scripts/setup.js create <proje-adı>  # Yeni proje oluştur"
    )
  );
  console.log(
    chalk.white(
      "   node scripts/setup.js init                 # Mevcut projeye ekle"
    )
  );
  console.log(chalk.white("\n💡 Örnek:"));
  console.log(chalk.white("   node scripts/setup.js create my-project"));
  console.log(chalk.white("   node scripts/setup.js init"));
}
