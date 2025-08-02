#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

console.log(chalk.cyan("\n📊 Multi-Agent System Durumu\n"));

function showStatus() {
  const projectPath = process.cwd();
  const multiAgentPath = path.join(projectPath, "multi-agent");

  if (fs.existsSync(multiAgentPath)) {
    console.log(chalk.green("✅ Multi-Agent System kurulu"));

    // Agent durumlarını kontrol et
    const agents = ["manager", "analyst", "developer"];
    agents.forEach((agent) => {
      const logPath = path.join(
        multiAgentPath,
        "shared/logs",
        `${agent}-agent.log`
      );
      if (fs.existsSync(logPath)) {
        console.log(chalk.green(`   🤖 ${agent} agent: Aktif`));
      } else {
        console.log(chalk.yellow(`   ⚠️  ${agent} agent: Kurulu değil`));
      }
    });

    // Task sayısını kontrol et
    const tasksPath = path.join(multiAgentPath, "shared/tasks");
    if (fs.existsSync(tasksPath)) {
      const taskFiles = fs
        .readdirSync(tasksPath)
        .filter((file) => file.endsWith(".context7.json"));
      console.log(chalk.blue(`   📋 Toplam task: ${taskFiles.length}`));
    }

    // Son log kayıtlarını göster
    const systemLogPath = path.join(multiAgentPath, "shared/logs/system.log");
    if (fs.existsSync(systemLogPath)) {
      const logContent = fs.readFileSync(systemLogPath, "utf8");
      const lines = logContent.split("\n").filter((line) => line.trim());
      if (lines.length > 0) {
        console.log(
          chalk.blue(`   📝 Son aktivite: ${lines[lines.length - 1]}`)
        );
      }
    }
  } else {
    console.log(chalk.red("❌ Multi-Agent System kurulu değil"));
    console.log(chalk.cyan("\n💡 Kurulum için:"));
    console.log(chalk.white("   lovable-cursor setup"));
  }

  console.log(chalk.cyan("\n🚀 Kullanım:"));
  console.log(chalk.white("   lovable-cursor init    # Yeni proje oluştur"));
  console.log(chalk.white("   lovable-cursor setup   # Mevcut projeye kur"));
  console.log(chalk.white("   lovable-cursor status  # Durum kontrolü"));
}

showStatus();
