#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

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

async function init() {
  console.log(chalk.blue.bold("🚀 Initializing EGKA AI AGENTS..."));

  try {
    // Mevcut proje için cursor rules oluştur
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
      includeMultiAgent: true,
    };

    // Multi-Agent sistemini oluştur
    await createMultiAgentSystem(process.cwd(), currentProjectConfig);

    // .cursor/rules dosyasını oluştur
    await createCursorRules(process.cwd(), currentProjectConfig);

    console.log(chalk.green("✅ Multi-Agent system initialized successfully!"));
    console.log(chalk.cyan("📋 Available commands:"));
    console.log(chalk.white("   npm run setup"));
    console.log(chalk.white("   npm run init"));
  } catch (error) {
    console.error(chalk.red("Error during initialization:"), error.message);
  }
}

async function createMultiAgentSystem(projectPath, config) {
  const multiAgentPath = path.join(projectPath, "multi-agent");
  await fs.ensureDir(multiAgentPath);

  // Multi-Agent yapısını oluştur
  const structure = {
    agents: {},
    shared: {
      tasks: {},
      logs: {},
      "context-injection": {},
    },
    orchestrator: {},
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

  // Agent dosyalarını oluştur
  await createBasicAgentFiles(multiAgentPath, config);

  // Orchestrator dosyalarını oluştur
  await createBasicOrchestratorFiles(multiAgentPath, config);

  // Script dosyalarını oluştur
  await createBasicScriptFiles(multiAgentPath, config);

  console.log(chalk.green("✅ Multi-Agent system created"));
}

async function createCursorRules(projectPath, config) {
  const cursorRulesPath = path.join(projectPath, ".cursor", "rules");
  await fs.ensureDir(cursorRulesPath);

  const rulesContent = `---
alwaysApply: true
---

# EGKA AI AGENTS - Multi-Agent Rules

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
test-project-2/
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

### Vanilla Projects

- Use modern JavaScript/TypeScript
- Follow vanilla JS best practices
- Implement modular architecture

### CSS Framework: css

- Use css for styling
- Follow css best practices
- Implement responsive design

## Language Rules

### JavaScript

- Use modern JavaScript (ES6+)
- Use proper variable declarations (const/let)
- Follow JavaScript best practices

## Feature Rules

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
    rulesContent
  );
  console.log(chalk.green("✅ .cursor/rules/multi-agent-rules.mdc created"));
}

async function createBasicAgentFiles(multiAgentPath, config) {
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

async function createBasicOrchestratorFiles(multiAgentPath, config) {
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

async function createBasicScriptFiles(multiAgentPath, config) {
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
}

// Ana fonksiyonu çalıştır
init();
