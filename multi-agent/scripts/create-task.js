#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

async function createTask(taskName, description) {
  try {
    const taskId = `TASK-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
    const taskPath = path.join(__dirname, "../shared/tasks", `${taskId}.context7.json`);
    
    const taskData = {
      id: taskId,
      name: taskName,
      description: description,
      status: "pending",
      created_at: new Date().toISOString(),
      assigned_agent: null,
      priority: "medium",
      requirements: [],
      progress: 0
    };
    
    await fs.writeJson(taskPath, taskData, { spaces: 2 });
    console.log(chalk.green(`✅ Task oluşturuldu: ${taskId}`));
    console.log(chalk.cyan(`📁 Dosya: ${taskPath}`));
    
  } catch (error) {
    console.error(chalk.red("❌ Task oluşturma hatası:"), error.message);
  }
}

// Command line arguments
const taskName = process.argv[2] || "Yeni Task";
const description = process.argv[3] || "Task açıklaması";

createTask(taskName, description);
