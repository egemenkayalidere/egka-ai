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

  // Multi-Agent System dosyalarını kopyala
  const templatePath = path.join(__dirname, "../templates/multi-agent");
  const targetPath = path.join(projectPath, "multi-agent");

  if (await fs.pathExists(templatePath)) {
    await fs.copy(templatePath, targetPath);
    console.log(chalk.green("🤖 Multi-Agent System dosyaları kopyalandı"));
  }

  // .cursor/rules klasörünü oluştur
  const cursorRulesPath = path.join(projectPath, ".cursor", "rules");
  await fs.ensureDir(cursorRulesPath);

  // Multi-agent rules dosyasını oluştur
  await createMultiAgentRules(cursorRulesPath, config);

  console.log(chalk.green("\n✅ Multi-Agent System başarıyla oluşturuldu!"));
  console.log(chalk.cyan(`\n📂 Kurulum dizini: ${projectPath}`));
  console.log(chalk.cyan("📁 Oluşturulan dosyalar:"));
  console.log(chalk.white("   • multi-agent/"));
  console.log(chalk.white("   • .cursor/rules/multi-agent-rules.mdc"));
  console.log(chalk.cyan("\n🚀 Kullanım:"));
  console.log(chalk.white("   egka-ai status"));
  console.log(chalk.white("   egka-ai task --create"));
}

async function createMultiAgentRules(cursorRulesPath, config) {
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

## Response Mode

- **Short Mode (Default):** "Görev Tamamlandı!"
- **Detailed Mode:** "detay ver" komutuyla aktif
- **Cost Optimization:** %90 token tasarrufu

## Commands

- \`egka-ai status\` - Sistem durumu

- \`egka-ai task --create\` - Task oluştur
- \`egka-ai log --system\` - Logları görüntüle
- \`egka-ai test-communication\` - İletişim testi

## Project Info

- **Name:** ${config.projectName}
- **Description:** ${config.projectDescription}
- **Created:** ${formatDateForDisplay(new Date())}
- **Version:** 1.0.0

---

**Bu dosya otomatik olarak oluşturulmuştur ve "always" seçili olmalıdır.**
`;

  await fs.writeFile(
    path.join(cursorRulesPath, "multi-agent-rules.mdc"),
    rulesContent
  );
  console.log(
    chalk.green("📝 .cursor/rules/multi-agent-rules.mdc oluşturuldu")
  );
}

init();
