#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

console.log(chalk.cyan("🔧 Multi-Agent System Setup Başlatılıyor...\n"));

async function setup() {
  try {
    const projectPath = process.cwd();

    // Multi-Agent System dosyalarını kopyala
    const templatePath = path.join(__dirname, "../templates/multi-agent");
    const targetPath = path.join(projectPath, "multi-agent");

    if (await fs.pathExists(templatePath)) {
      await fs.copy(templatePath, targetPath);
      console.log(chalk.green("🤖 Multi-Agent System dosyaları kopyalandı"));
    } else {
      console.log(
        chalk.yellow("⚠️  Template bulunamadı, manuel kurulum gerekli")
      );
    }

    // Package.json'a script ekle
    const packagePath = path.join(projectPath, "package.json");
    if (await fs.pathExists(packagePath)) {
      const packageJson = await fs.readJson(packagePath);

      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      packageJson.scripts["agent-status"] =
        "node multi-agent/scripts/status.js";

      await fs.writeJson(packagePath, packageJson, { spaces: 2 });
      console.log(chalk.green("📦 package.json güncellendi"));
    }

    console.log(chalk.green("\n✅ Setup tamamlandı!"));
    console.log(chalk.cyan("\n🚀 Kullanım:"));
    console.log(chalk.white("   npm run agent-status"));
  } catch (error) {
    console.error(chalk.red("❌ Setup hatası:"), error.message);
    process.exit(1);
  }
}

setup();
