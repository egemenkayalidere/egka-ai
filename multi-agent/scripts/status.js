#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

async function showStatus() {
  try {
    console.log(chalk.cyan("🤖 Multi-Agent System Durumu\n"));
    
    const logsPath = path.join(__dirname, "../shared/logs");
    const tasksPath = path.join(__dirname, "../shared/tasks");
    
    // Log dosyalarını kontrol et
    const logFiles = await fs.readdir(logsPath);
    console.log(chalk.blue("📋 Log Dosyaları:"));
    for (const file of logFiles) {
      const stats = await fs.stat(path.join(logsPath, file));
      console.log(chalk.white(`   ${file} - ${stats.size} bytes`));
    }
    
    // Task dosyalarını kontrol et
    const taskFiles = await fs.readdir(tasksPath);
    console.log(chalk.blue("\n📝 Task Dosyaları:"));
    if (taskFiles.length === 0) {
      console.log(chalk.yellow("   Henüz task oluşturulmamış"));
    } else {
      for (const file of taskFiles) {
        const stats = await fs.stat(path.join(tasksPath, file));
        console.log(chalk.white(`   ${file} - ${stats.size} bytes`));
      }
    }
    
    console.log(chalk.green("\n✅ Sistem durumu kontrol edildi"));
    
  } catch (error) {
    console.error(chalk.red("❌ Status hatası:"), error.message);
  }
}

showStatus();
