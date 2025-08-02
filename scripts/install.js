#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

console.log(chalk.cyan("🔧 Multi-Agent System Kurulumu Başlatılıyor...\n"));

async function install() {
  try {
    // Gerekli klasörleri oluştur
    const dirs = ["templates", "bin", "scripts"];

    for (const dir of dirs) {
      await fs.ensureDir(dir);
      console.log(chalk.green(`📁 ${dir} klasörü oluşturuldu`));
    }

    // Multi-agent template'ini kopyala
    const sourcePath = path.join(__dirname, "../multi-agent");
    const targetPath = path.join(__dirname, "../templates/multi-agent");

    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, targetPath);
      console.log(chalk.green("🤖 Multi-Agent template kopyalandı"));
    }

    // CLI dosyasını executable yap
    const cliPath = path.join(__dirname, "../bin/lovable-cursor.js");
    if (await fs.pathExists(cliPath)) {
      await fs.chmod(cliPath, "755");
      console.log(chalk.green("🔧 CLI dosyası executable yapıldı"));
    }

    console.log(chalk.green("\n✅ Kurulum tamamlandı!"));
    console.log(chalk.cyan("\n🚀 Kullanım:"));
    console.log(chalk.white("   npm link"));
    console.log(chalk.white("   lovable-cursor init"));
  } catch (error) {
    console.error(chalk.red("❌ Kurulum hatası:"), error.message);
    process.exit(1);
  }
}

install();
