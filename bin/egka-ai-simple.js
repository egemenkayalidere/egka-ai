#!/usr/bin/env node

const { program } = require("commander");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");

// Welcome message
function showWelcome() {
  console.log(
    chalk.cyan(`
${chalk.bold("🚀 Welcome to EGKA AI AGENTS!")}
${chalk.gray("Your intelligent development companion")}

${chalk.yellow("Available Commands:")}
  ${chalk.white("create")}     - Create a new project with interactive wizard
  ${chalk.white("init")}       - Initialize multi-agent system

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
// CREATE KOMUTU - Yeni proje oluşturma
// ============================================================================
program
  .command("create")
  .description("Create a new project with Multi-Agent System")
  .option("-t, --template <template>", "Use specific template")
  .option("-y, --yes", "Skip prompts and use defaults")
  .action(async (options) => {
    console.log(chalk.blue.bold("🚀 EGKA AI Project Creator"));
    console.log(chalk.gray("─────────────────────────────────"));

    try {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "Proje adını girin:",
          default: "my-egka-project",
          validate: (input) => {
            if (input.trim() === "") return "Proje adı boş olamaz";
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
            { name: "Vanilla JavaScript", value: "vanilla" },
          ],
          default: "nextjs",
        },
        {
          type: "list",
          name: "language",
          message: "Programlama dili seçin:",
          choices: [
            { name: "TypeScript", value: "typescript" },
            { name: "JavaScript", value: "javascript" },
          ],
          default: "typescript",
        },
        {
          type: "list",
          name: "cssFramework",
          message: "CSS Framework seçin:",
          choices: [
            { name: "Tailwind CSS", value: "tailwind" },
            { name: "CSS (Vanilla)", value: "css" },
          ],
          default: "tailwind",
        },
        {
          type: "confirm",
          name: "includeMultiAgent",
          message: "Multi-Agent sistemi otomatik kurulsun mu?",
          default: true,
        },
      ]);

      await createProject(answers);
    } catch (error) {
      console.error(chalk.red("Error creating project:"), error.message);
    }
  });

// ============================================================================
// INIT KOMUTU - Sistem başlatma
// ============================================================================
program
  .command("init")
  .description("Initialize the Multi-Agent system")
  .option("-f, --force", "Force reinitialization")
  .action(async (options) => {
    console.log(chalk.blue.bold("🚀 Initializing EGKA AI AGENTS..."));

    try {
      const setupScript = path.join(__dirname, "..", "scripts", "setup.js");
      if (await fs.pathExists(setupScript)) {
        // Setup script'ini çalıştır
        const { spawn } = require("child_process");
        const setup = spawn("node", [setupScript, "init"], {
          stdio: "inherit",
        });

        setup.on("close", (code) => {
          if (code === 0) {
            console.log(chalk.green("✅ Multi-Agent system initialized successfully!"));
          } else {
            console.error(chalk.red("❌ Setup failed"));
          }
        });
      } else {
        console.log(chalk.yellow("⚠️  Setup script not found"));
      }
    } catch (error) {
      console.error(chalk.red("Error during initialization:"), error.message);
    }
  });

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

async function createProject(config) {
  const projectPath = path.join(process.cwd(), config.projectName);

  console.log(chalk.blue(`\n🚀 ${config.projectName} projesi oluşturuluyor...`));

  try {
    // Proje klasörünü oluştur
    await fs.ensureDir(projectPath);

    // Package.json oluştur
    await createPackageJson(projectPath, config);

    // README oluştur
    await createReadme(projectPath, config);

    // Multi-Agent sistemi oluştur
    if (config.includeMultiAgent) {
      await createMultiAgentSystem(projectPath, config);
    }

    console.log(chalk.green("\n✅ Proje başarıyla oluşturuldu!"));
    console.log(chalk.cyan(`\n📂 Proje klasörü: ${projectPath}`));
    console.log(chalk.cyan("\n🚀 Kullanım:"));
    console.log(chalk.white(`   cd ${config.projectName}`));
    console.log(chalk.white("   npm install"));
    console.log(chalk.white("   npm run dev"));

  } catch (error) {
    console.error(chalk.red("Error creating project:"), error.message);
  }
}

async function createPackageJson(projectPath, config) {
  const packageData = {
    name: config.projectName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      next: "^14.0.0",
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    },
    devDependencies: {
      "@types/node": "^18.0.0",
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      typescript: "^5.0.0",
      eslint: "^8.0.0",
      "eslint-config-next": "^14.0.0",
    },
  };

  await fs.writeJson(path.join(projectPath, "package.json"), packageData, {
    spaces: 2,
  });
}

async function createReadme(projectPath, config) {
  const readmeContent = `# ${config.projectName}

Bu proje EGKA AI AGENTS ile oluşturulmuştur.

## 🚀 Kurulum

\`\`\`bash
npm install
\`\`\`

## 📋 Kullanım

\`\`\`bash
npm run dev
\`\`\`

## 📁 Proje Yapısı

\`\`\`
${config.projectName}/
├── pages/           # Next.js sayfaları
├── components/      # React component'ları
├── styles/         # CSS dosyaları
├── public/         # Statik dosyalar
└── multi-agent/    # Multi-Agent sistemi
\`\`\`

## 🤖 Multi-Agent Sistemi

Bu proje Multi-Agent sistemi ile geliştirilmiştir:

- **Manager Agent**: Task yönetimi ve koordinasyon
- **Analyst Agent**: Task analizi ve oluşturma
- **Developer Agent**: Frontend geliştirme
- **Backend Agent**: Backend geliştirme

## 📝 Lisans

MIT
`;

  await fs.writeFile(path.join(projectPath, "README.md"), readmeContent);
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

  console.log(chalk.green("✅ Multi-Agent system created"));
}

// Parse arguments
program.parse();
