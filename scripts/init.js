#!/usr/bin/env node

const chalk = require("chalk");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");

console.log(chalk.cyan("🚀 Multi-Agent System Proje Oluşturucu\n"));

// Güvenilir timestamp fonksiyonu
function getReliableTimestamp() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 0-based olduğu için +1

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

  // ISO string formatında döndür
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
  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Proje adını girin:",
        default: "my-project",
      },
      {
        type: "input",
        name: "projectDescription",
        message: "Proje açıklaması:",
        default: "Multi-Agent System ile geliştirilen proje",
      },
    ]);

    // Varsayılan değerleri ekle
    answers.projectType = "agent-only";
    answers.includeGit = false;

    await createProject(answers);
  } catch (error) {
    console.error(chalk.red("❌ Hata oluştu:"), error.message);
    process.exit(1);
  }
}

async function createProject(config) {
  // Mevcut dizini kullan
  const projectPath = process.cwd();

  console.log(chalk.green(`\n📁 Kurulum dizini: ${projectPath}`));

  // Multi-Agent V2 System dosyalarını kopyala
  const templatePath = path.join(__dirname, "../multi-agent-v2");
  const targetPath = path.join(projectPath, "multi-agent-v2");

  if (await fs.pathExists(templatePath)) {
    await fs.copy(templatePath, targetPath);
    console.log(chalk.green("🤖 Multi-Agent V2 System dosyaları kopyalandı"));
  } else {
    // V2 sistem yoksa temel yapıyı oluştur
    await createBasicMultiAgentV2(targetPath, config);
  }

  // .cursor/rules klasörünü oluştur
  const cursorRulesPath = path.join(projectPath, ".cursor", "rules");
  await fs.ensureDir(cursorRulesPath);

  // V2 Multi-agent rules dosyasını oluştur
  await createMultiAgentV2Rules(cursorRulesPath, config);

  // V2 .mdc dosyasını oluştur
  await createMDCFile(projectPath, config);

  console.log(chalk.green("\n✅ Multi-Agent V2 System başarıyla oluşturuldu!"));
  console.log(chalk.cyan(`\n📂 Kurulum dizini: ${projectPath}`));
  console.log(chalk.cyan("📁 Oluşturulan dosyalar:"));
  console.log(chalk.white("   • multi-agent-v2/"));
  console.log(chalk.white("   • .cursor/rules/multi-agent-v2-rules.mdc"));
  console.log(chalk.white("   • .mdc (Cursor Auto Tasks)"));
  console.log(chalk.cyan("\n🚀 V2 Kullanım:"));
  console.log(chalk.white("   npm run status"));
  console.log(chalk.white("   npm run test"));
  console.log(chalk.white("   node multi-agent-v2/main.js demo"));
}

async function createMultiAgentV2Rules(cursorRulesPath, config) {
  const rulesContent = `---
alwaysApply: true
---

# EGKA AI AGENTS - Multi-Agent V2 Rules

## Multi-Agent V2 System Rules

### Agent Activation Rules

Her yeni chat başlangıcında aşağıdaki multi-agent V2 sistemi otomatik olarak devreye girer:

#### 1. Manager Agent V2 Activation
- **Trigger:** Kullanıcı herhangi bir komut girdiğinde
- **Action:** "Merhaba! Multi-Agent V2 Sistemine hoş geldiniz. Geliştirilmiş AI destekli geliştirme sistemi ile görevinizi analiz ediyorum."
- **Next Step:** Görevi analyst agent'a aktarır ve proje kapsamını belirler
- **Performance Monitoring:** Response time tracking ve memory optimization
- **Security Validation:** Input validation ve XSS protection

#### 2. Analyst Agent V2 Activation
- **Trigger:** Manager'dan gelen görev
- **Action:**
  - Auto increment ID ile task oluşturur (TASK-2025-1000 formatında)
  - Task context dosyası oluşturur: \`multi-agent-v2/shared/tasks/TASK-XXXX-XXXX.context7.json\`
  - Performance requirements ekler (React.memo, useCallback, useMemo)
  - Security requirements ekler (XSS protection, input validation)
  - Atomic design level belirler (atoms|molecules|organisms|templates|pages)
  - Storybook requirements ekler
- **Performance Optimization:** Task priority optimization ve resource allocation
- **Security Validation:** Security risk assessment

#### 3. Developer Agent V2 Activation
- **Trigger:** Frontend/UI ile ilgili task'lar
- **Action:**
  - Task context dosyasını okur
  - Atomic design kurallarına uygun component geliştirme
  - React.memo, useCallback, useMemo kullanımı zorunlu
  - TypeScript strict mode kullanımı
  - Material UI entegrasyonu
  - Otomatik story generation
  - Performance optimization
  - Security validation
  - Shared log'a yazar
  - Task durumunu günceller

## File Structure

\`\`\`
multi-agent-v2/
├── agents/
│   ├── managerAgent.context7.json
│   ├── analystAgent.context7.json
│   └── developerAgent.context7.json
├── orchestrator/
│   ├── workflow.context7.json
│   └── context-injection-manager.js
├── shared/
│   ├── tasks/          # Task context dosyaları
│   └── logs/           # Shared log dosyaları
└── scripts/
    └── status.js
\`\`\`

## Project Structure

\`\`\`
${config.projectName}/
├── mobile-app/         # React Native mobile app
├── admin-panel/        # React admin dashboard
├── web-app/           # Next.js web application
└── backend-api/        # Node.js Express API
\`\`\`

## Workflow V2

1. User Input → Manager Agent V2 (Greeting + Project Identification + Performance Monitoring)
2. Manager V2 → Analyst Agent V2 (Task Creation + Context File + Performance/Security Requirements)
3. Analyst V2 → Shared Tasks (TASK-XXXX-XXXX.context7.json with V2 requirements)
4. Developer Agent V2 → Reads Task → Executes with V2 rules → Logs → Updates Status

## Logging V2

- Tüm aktiviteler \`multi-agent-v2/shared/logs/\` klasöründe loglanır
- Task durumları \`multi-agent-v2/shared/tasks/\` klasöründe takip edilir
- Performance metrics kaydedilir
- Security audit logları tutulur
- Her agent'ın kendi log dosyası vardır:
  - \`manager-agent.log\`
  - \`analyst-agent.log\`
  - \`developer-agent.log\`
  - \`system.log\`
  - \`performance.log\`
  - \`security-audit.log\`
  - \`atomic-design.log\`
  - \`story-generation.log\`

## Performance Requirements V2

### React Optimization Rules
- **React.memo**: Tüm component'lerde kullanım zorunlu
- **useCallback**: Prop olarak fonksiyon gönderiliyorsa kullanım zorunlu
- **useMemo**: Hesaplama maliyeti yüksek işlemlerde kullanım zorunlu
- **Arrow function**: Tüm fonksiyonlar arrow function şeklinde tanımlanmalı
- **Explicit return**: Mümkünse return kullanılarak açık şekilde değer dönülmeli

### Memory Optimization
- Gereksiz re-render'lar engellenmeli
- Bundle size optimization yapılmalı
- Caching stratejileri uygulanmalı

## Security Requirements V2

### Frontend Security
- **XSS Protection**: Content-Security-Policy uygulanmalı
- **CSRF Protection**: SameSite cookies kullanılmalı
- **Input Validation**: Tüm kullanıcı girdileri doğrulanmalı
- **API Security**: Hassas veriler backend'de tutulmalı

### Code Security
- Environment variables kullanılmalı
- API anahtarları güvenli şekilde saklanmalı
- Code signing uygulanmalı
- Audit logging yapılmalı

## Atomic Design V2 Rules

### Component Levels
- **Atoms**: Temel UI bileşenleri (Button, Input, Icon, Typography, Avatar)
- **Molecules**: İki veya daha fazla atomun birleşimi (FormField, Card, SearchBar)
- **Organisms**: Sayfa parçalarını temsil eden büyük bileşenler (Header, Sidebar, Footer)
- **Templates**: Layout ve şablonlar (MasterPage, DashboardLayout)
- **Pages**: Tam sayfalar (HomePage, LoginPage, DashboardPage)

### Naming Conventions
- **Components**: PascalCase (MyButton, UserCard)
- **Files**: PascalCase.tsx (MyButton.tsx, UserCard.tsx)
- **Folders**: kebab-case (user-profile, product-list)

### Story Generation
- Her atomic design componenti için story dosyası zorunlu
- Otomatik story generation
- Tüm varyantlar için story exports
- HTML preview creation

## Modern React Practices V2

### TypeScript Usage
- TypeScript strict mode kullanılmalı
- Proper interface tanımlamaları yapılmalı
- Type safety sağlanmalı

### Component Structure
- Material UI kullanımı tercih edilmeli
- Props interface tanımlanmalı
- Error boundary kullanılmalı
- Accessibility standartları uygulanmalı

## Communication Rules

- Ajanlar, her zaman Türkçe cevaplar vermeli
- Kod yorumları Türkçe olmalı
- Değişken ve fonksiyon isimleri İngilizce olmalı
- Dosya isimleri İngilizce olmalı

## Code Quality Rules V2

- ESLint kurallarına uyulmalı
- Prettier ile kod formatlanmalı
- TypeScript strict mode kullanılmalı
- Modern JavaScript/TypeScript özellikleri kullanılmalı
- Accessibility (a11y) standartlarına uyulmalı
- Performance optimizasyonları yapılmalı
- Atomic design kurallarına uyulmalı

## UI Consistency Rules

- JSX yapısı korunmalı
- Tasarım sistemi tutarlılığı sağlanmalı
- Erişilebilirlik standartları uygulanmalı
- Modern UI/UX pratikleri kullanılmalı

## Monitoring V2

### Performance Metrics
- Task completion rate
- Average execution time
- Memory usage tracking
- Bundle size analysis
- Render count monitoring

### Security Metrics
- Authentication success rate
- Authorization failures
- Security violations
- Audit compliance

### Quality Metrics
- Code quality scores
- Atomic design compliance rate
- Story generation success rate
- Security compliance rate

## Commands V2

- \`npm run status\` - Sistem durumu
- \`npm run test\` - Test çalıştır
- \`node multi-agent-v2/main.js demo\` - Demo çalıştır
- \`node multi-agent-v2/scripts/status.js\` - Detaylı durum

## Project Info

- **Name:** ${config.projectName}
- **Description:** ${config.projectDescription}
- **Created:** ${formatDateForDisplay(new Date())}
- **Version:** 2.0.0

---

**Bu dosya Multi-Agent V2 sistemi için otomatik olarak oluşturulmuştur ve "always" seçili olmalıdır.**
`;

  await fs.writeFile(
    path.join(cursorRulesPath, "multi-agent-v2-rules.mdc"),
    rulesContent
  );
  console.log(
    chalk.green("📝 .cursor/rules/multi-agent-v2-rules.mdc oluşturuldu")
  );
}

async function createBasicMultiAgentV2(targetPath, config) {
  console.log(chalk.yellow("📝 Temel Multi-Agent V2 yapısı oluşturuluyor..."));

  // Temel dizin yapısını oluştur
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

  await createDirectoryStructure(targetPath, structure);

  // Temel agent dosyalarını oluştur
  await createBasicAgentFiles(targetPath, config);

  // Temel orchestrator dosyalarını oluştur
  await createBasicOrchestratorFiles(targetPath, config);

  // Temel script dosyalarını oluştur
  await createBasicScriptFiles(targetPath, config);

  console.log(chalk.green("✅ Temel Multi-Agent V2 yapısı oluşturuldu"));
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

async function createBasicAgentFiles(targetPath, config) {
  const agentsPath = path.join(targetPath, "agents");

  // Manager Agent
  const managerAgent = {
    id: "manager",
    name: "Manager Agent V2",
    version: "2.0.0",
    capabilities: [
      "project_analysis",
      "workflow_orchestration",
      "resource_allocation",
    ],
    performance_requirements: {
      response_time: 1000,
      memory_usage: "50MB",
      cpu_usage: "10%",
    },
    security_requirements: {
      input_validation: true,
      xss_protection: true,
      data_encryption: false,
    },
  };

  await fs.writeJson(
    path.join(agentsPath, "managerAgent.context7.json"),
    managerAgent,
    { spaces: 2 }
  );

  // Analyst Agent
  const analystAgent = {
    id: "analyst",
    name: "Analyst Agent V2",
    version: "2.0.0",
    capabilities: [
      "requirements_analysis",
      "task_planning",
      "complexity_assessment",
    ],
    performance_requirements: {
      response_time: 2000,
      memory_usage: "75MB",
      cpu_usage: "15%",
    },
    security_requirements: {
      input_validation: true,
      xss_protection: true,
      data_encryption: false,
    },
  };

  await fs.writeJson(
    path.join(agentsPath, "analystAgent.context7.json"),
    analystAgent,
    { spaces: 2 }
  );

  // Developer Agent
  const developerAgent = {
    id: "developer",
    name: "Developer Agent V2",
    version: "2.0.0",
    capabilities: [
      "frontend_development",
      "component_creation",
      "performance_optimization",
    ],
    performance_requirements: {
      response_time: 5000,
      memory_usage: "100MB",
      cpu_usage: "25%",
    },
    security_requirements: {
      input_validation: true,
      xss_protection: true,
      data_encryption: false,
    },
  };

  await fs.writeJson(
    path.join(agentsPath, "developerAgent.context7.json"),
    developerAgent,
    { spaces: 2 }
  );
}

async function createBasicOrchestratorFiles(targetPath, config) {
  const orchestratorPath = path.join(targetPath, "orchestrator");

  // Workflow context
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
          memory_limit: "100MB",
        },
        security_validation: {
          input_validation: true,
          xss_protection: true,
        },
      },
      {
        step: 2,
        agent: "analyst",
        action: "task_creation",
        performance_requirements: {
          timeout: 45000,
          memory_limit: "150MB",
        },
        security_validation: {
          input_validation: true,
          xss_protection: true,
        },
      },
      {
        step: 3,
        agent: "developer",
        action: "code_development",
        performance_requirements: {
          timeout: 120000,
          memory_limit: "200MB",
        },
        security_validation: {
          input_validation: true,
          xss_protection: true,
        },
      },
    ],
    global_performance_optimization: {
      enable_caching: true,
      enable_compression: true,
      enable_minification: true,
    },
    global_security_features: {
      enable_audit_logging: true,
      enable_performance_monitoring: true,
      enable_error_tracking: true,
    },
  };

  await fs.writeJson(
    path.join(orchestratorPath, "workflow.context7.json"),
    workflowContext,
    { spaces: 2 }
  );
}

async function createBasicScriptFiles(targetPath, config) {
  const scriptsPath = path.join(targetPath, "scripts");

  // Status script
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

init();
