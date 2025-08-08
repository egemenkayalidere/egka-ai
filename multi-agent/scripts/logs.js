#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

async function showLogs(agentName = "system") {
  try {
    const logPath = path.join(__dirname, "../shared/logs", `${agentName}.log`);
    
    if (await fs.pathExists(logPath)) {
      const content = await fs.readFile(logPath, "utf8");
      console.log(chalk.cyan(`📋 ${agentName} Logları:\n`));
      console.log(content);
    } else {
      console.log(chalk.yellow(`⚠️  ${agentName} log dosyası bulunamadı`));
    }
    
  } catch (error) {
    console.error(chalk.red("❌ Log okuma hatası:"), error.message);
  }
}

// Command line arguments
const agentName = process.argv[2] || "system";

showLogs(agentName);
