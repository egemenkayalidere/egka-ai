#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MultiAgentStatus {
  constructor() {
    this.basePath = path.join(__dirname, "..");
    this.agentsPath = path.join(this.basePath, "agents");
    this.orchestratorPath = path.join(this.basePath, "orchestrator");
    this.sharedPath = path.join(this.basePath, "shared");
    this.logsPath = path.join(this.sharedPath, "logs");
    this.tasksPath = path.join(this.sharedPath, "tasks");
  }

  /**
   * Sistem durumunu kontrol eder
   */
  async checkSystemStatus() {
    console.log("🔍 Multi-Agent Sistem Durumu Kontrol Ediliyor...\n");

    const status = {
      system: await this.checkSystemFiles(),
      agents: await this.checkAgents(),
      orchestrator: await this.checkOrchestrator(),
      shared: await this.checkSharedResources(),
      performance: await this.checkPerformanceMetrics(),
      security: await this.checkSecurityStatus(),
    };

    this.displayStatus(status);
    return status;
  }

  /**
   * Sistem dosyalarını kontrol eder
   */
  async checkSystemFiles() {
    const mainContext = path.join(this.basePath, "main.context7.json");
    const mainExists = fs.existsSync(mainContext);

    if (mainExists) {
      const mainData = JSON.parse(fs.readFileSync(mainContext, "utf8"));
      return {
        status: "✅ Aktif",
        version: mainData.version,
        description: mainData.description,
        active_agents: mainData.active_agents,
        system_features: mainData.system_features,
      };
    }

    return {
      status: "❌ Bulunamadı",
      version: "N/A",
      description: "N/A",
      active_agents: 0,
      system_features: {},
    };
  }

  /**
   * Agent'ları kontrol eder
   */
  async checkAgents() {
    const agents = ["manager", "analyst", "developer"];
    const agentStatus = {};

    for (const agent of agents) {
      const agentFile = path.join(
        this.agentsPath,
        `${agent}Agent.context7.json`
      );
      const exists = fs.existsSync(agentFile);

      if (exists) {
        const agentData = JSON.parse(fs.readFileSync(agentFile, "utf8"));
        agentStatus[agent] = {
          status: "✅ Aktif",
          version: agentData.version,
          capabilities: agentData.capabilities.length,
          performance_monitoring:
            agentData.configuration?.performance_monitoring || false,
          security_validation:
            agentData.configuration?.security_validation || false,
        };
      } else {
        agentStatus[agent] = {
          status: "❌ Bulunamadı",
          version: "N/A",
          capabilities: 0,
          performance_monitoring: false,
          security_validation: false,
        };
      }
    }

    return agentStatus;
  }

  /**
   * Orchestrator'ı kontrol eder
   */
  async checkOrchestrator() {
    const workflowFile = path.join(
      this.orchestratorPath,
      "workflow.context7.json"
    );
    const injectionFile = path.join(
      this.orchestratorPath,
      "context-injection-manager.js"
    );

    const workflowExists = fs.existsSync(workflowFile);
    const injectionExists = fs.existsSync(injectionFile);

    let workflowData = null;
    if (workflowExists) {
      workflowData = JSON.parse(fs.readFileSync(workflowFile, "utf8"));
    }

    return {
      workflow: {
        status: workflowExists ? "✅ Aktif" : "❌ Bulunamadı",
        version: workflowData?.version || "N/A",
        steps: workflowData?.steps?.length || 0,
        performance_optimization:
          workflowData?.performance_optimization || false,
        security_features: workflowData?.security_features || false,
      },
      context_injection: {
        status: injectionExists ? "✅ Aktif" : "❌ Bulunamadı",
        version: "2.0.0",
      },
    };
  }

  /**
   * Shared resources'ları kontrol eder
   */
  async checkSharedResources() {
    const logsExists = fs.existsSync(this.logsPath);
    const tasksExists = fs.existsSync(this.tasksPath);

    let logFiles = [];
    let taskFiles = [];

    if (logsExists) {
      logFiles = fs
        .readdirSync(this.logsPath)
        .filter((file) => file.endsWith(".log"));
    }

    if (tasksExists) {
      taskFiles = fs
        .readdirSync(this.tasksPath)
        .filter((file) => file.includes("TASK-"));
    }

    return {
      logs: {
        status: logsExists ? "✅ Aktif" : "❌ Bulunamadı",
        log_files: logFiles.length,
        log_types: logFiles,
      },
      tasks: {
        status: tasksExists ? "✅ Aktif" : "❌ Bulunamadı",
        task_files: taskFiles.length,
        task_types: taskFiles.slice(0, 5), // İlk 5 task'ı göster
      },
    };
  }

  /**
   * Performance metrics'leri kontrol eder
   */
  async checkPerformanceMetrics() {
    const performanceLog = path.join(this.logsPath, "performance.log");
    const exists = fs.existsSync(performanceLog);

    if (exists) {
      const logContent = fs.readFileSync(performanceLog, "utf8");
      const lines = logContent.trim().split("\n");
      const recentMetrics = lines.slice(-5); // Son 5 metric

      return {
        status: "✅ Aktif",
        recent_metrics: recentMetrics.length,
        log_size: `${(fs.statSync(performanceLog).size / 1024).toFixed(2)} KB`,
      };
    }

    return {
      status: "❌ Bulunamadı",
      recent_metrics: 0,
      log_size: "N/A",
    };
  }

  /**
   * Security status'ü kontrol eder
   */
  async checkSecurityStatus() {
    const securityLog = path.join(this.logsPath, "security-audit.log");
    const exists = fs.existsSync(securityLog);

    if (exists) {
      const logContent = fs.readFileSync(securityLog, "utf8");
      const lines = logContent.trim().split("\n");
      const recentAudits = lines.slice(-5); // Son 5 audit

      return {
        status: "✅ Aktif",
        recent_audits: recentAudits.length,
        log_size: `${(fs.statSync(securityLog).size / 1024).toFixed(2)} KB`,
      };
    }

    return {
      status: "❌ Bulunamadı",
      recent_audits: 0,
      log_size: "N/A",
    };
  }

  /**
   * Status'ü görsel olarak gösterir
   */
  displayStatus(status) {
    console.log("📊 SİSTEM DURUMU");
    console.log("================");

    // System Status
    console.log(`\n🏗️  Sistem: ${status.system.status}`);
    console.log(`   Versiyon: ${status.system.version}`);
    console.log(`   Açıklama: ${status.system.description}`);
    console.log(`   Aktif Agent'lar: ${status.system.active_agents}`);
    console.log(
      `   Sistem Özellikleri: ${
        Object.keys(status.system.system_features).length
      } özellik`
    );

    // Agents Status
    console.log("\n🤖 AGENT DURUMLARI");
    console.log("==================");
    for (const [agent, info] of Object.entries(status.agents)) {
      console.log(`\n   ${agent.toUpperCase()} Agent:`);
      console.log(`     Durum: ${info.status}`);
      console.log(`     Versiyon: ${info.version}`);
      console.log(`     Yetenekler: ${info.capabilities}`);
      console.log(
        `     Performance Monitoring: ${
          info.performance_monitoring ? "✅" : "❌"
        }`
      );
      console.log(
        `     Security Validation: ${info.security_validation ? "✅" : "❌"}`
      );
    }

    // Orchestrator Status
    console.log("\n🎭 ORCHESTRATOR DURUMU");
    console.log("======================");
    console.log(`   Workflow: ${status.orchestrator.workflow.status}`);
    console.log(
      `   Workflow Versiyon: ${status.orchestrator.workflow.version}`
    );
    console.log(`   Workflow Adımları: ${status.orchestrator.workflow.steps}`);
    console.log(
      `   Performance Optimization: ${
        status.orchestrator.workflow.performance_optimization ? "✅" : "❌"
      }`
    );
    console.log(
      `   Security Features: ${
        status.orchestrator.workflow.security_features ? "✅" : "❌"
      }`
    );
    console.log(
      `   Context Injection: ${status.orchestrator.context_injection.status}`
    );

    // Shared Resources Status
    console.log("\n📁 PAYLAŞILAN KAYNAKLAR");
    console.log("========================");
    console.log(
      `   Logs: ${status.shared.logs.status} (${status.shared.logs.log_files} dosya)`
    );
    console.log(
      `   Tasks: ${status.shared.tasks.status} (${status.shared.tasks.task_files} dosya)`
    );

    // Performance Status
    console.log("\n⚡ PERFORMANCE METRICS");
    console.log("======================");
    console.log(`   Durum: ${status.performance.status}`);
    console.log(`   Son Metrikler: ${status.performance.recent_metrics}`);
    console.log(`   Log Boyutu: ${status.performance.log_size}`);

    // Security Status
    console.log("\n🔒 SECURITY STATUS");
    console.log("==================");
    console.log(`   Durum: ${status.security.status}`);
    console.log(`   Son Audit'ler: ${status.security.recent_audits}`);
    console.log(`   Log Boyutu: ${status.security.log_size}`);

    console.log("\n✨ Multi-Agent Sistem Durumu Kontrol Tamamlandı!");
  }
}

// Script çalıştırma
if (import.meta.url === `file://${process.argv[1]}`) {
  const statusChecker = new MultiAgentStatus();
  statusChecker.checkSystemStatus().catch(console.error);
}

export default MultiAgentStatus;
