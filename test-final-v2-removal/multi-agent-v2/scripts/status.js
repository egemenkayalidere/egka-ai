#!/usr/bin/env node

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
  console.log(`📁 Agents: ${agents.length} active`);
  agents.forEach(agent => {
    console.log(`   • ${agent.replace(".context7.json", "")}`);
  });
}

// Task durumlarını kontrol et
const tasksPath = path.join(sharedPath, "tasks");
if (fs.existsSync(tasksPath)) {
  const tasks = fs.readdirSync(tasksPath).filter(file => file.endsWith(".context7.json"));
  console.log(`📋 Tasks: ${tasks.length} active`);
}

// Log durumlarını kontrol et
const logsPath = path.join(sharedPath, "logs");
if (fs.existsSync(logsPath)) {
  const logs = fs.readdirSync(logsPath).filter(file => file.endsWith(".log"));
  console.log(`📝 Logs: ${logs.length} files`);
}

console.log("✅ Multi-Agent V2 System is running");
