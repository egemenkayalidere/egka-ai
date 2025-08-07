import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import AutomaticTriggeringSystem from "./automatic-triggering-system.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MainSystemController {
  constructor() {
    this.basePath = path.join(__dirname, "..");
    this.sharedPath = path.join(this.basePath, "shared");
    this.logsPath = path.join(this.sharedPath, "logs");

    // Ana sistem
    this.triggeringSystem = new AutomaticTriggeringSystem();

    // Sistem durumu
    this.isInitialized = false;
    this.isRunning = false;
    this.systemVersion = "2.0.0";
    this.startTime = null;
    this.uptime = 0;

    // Monitoring
    this.performanceMetrics = new Map();
    this.systemHealth = {
      status: "unknown",
      lastCheck: null,
      issues: [],
    };

    // Event listeners
    this.setupEventListeners();
  }

  /**
   * Event listener'ları kurar
   */
  setupEventListeners() {
    // System events
    this.triggeringSystem.on("system_started", (data) => {
      this.logSystem("system_started", data);
      this.isRunning = true;
      this.startTime = new Date();
    });

    this.triggeringSystem.on("system_stopped", (data) => {
      this.logSystem("system_stopped", data);
      this.isRunning = false;
      this.calculateUptime();
    });

    this.triggeringSystem.on("system_workflow_started", (data) => {
      this.logSystem("workflow_started", data);
    });

    this.triggeringSystem.on("system_workflow_completed", (data) => {
      this.logSystem("workflow_completed", data);
    });

    this.triggeringSystem.on("system_message_sent", (data) => {
      this.logSystem("message_sent", data);
    });

    this.triggeringSystem.on("system_task_assigned", (data) => {
      this.logSystem("task_assigned", data);
    });

    this.triggeringSystem.on("system_error", (data) => {
      this.logSystem("system_error", data);
      this.updateSystemHealth("error", data.error);
    });
  }

  /**
   * Sistemi başlatır
   */
  async initializeSystem() {
    try {
      console.log("🚀 Multi-Agent Sistemi Başlatılıyor...");

      // Gerekli dizinleri oluştur
      this.ensureDirectories();

      // Alt sistemleri başlat
      const result = await this.triggeringSystem.startSystem();

      if (result.success) {
        this.isInitialized = true;
        this.updateSystemHealth("healthy", "Sistem başarıyla başlatıldı");

        console.log("✅ Multi-Agent Sistemi Başarıyla Başlatıldı!");
        console.log(`📊 Session ID: ${result.session_id}`);
        console.log("🎯 Sistem Hazır - Kullanıcı İsteklerini Bekliyor...");

        return {
          success: true,
          message: "Multi-Agent sistemi başarıyla başlatıldı",
          session_id: result.session_id,
          version: this.systemVersion,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      this.updateSystemHealth("error", error.message);
      console.error("❌ Sistem Başlatma Hatası:", error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sistemi durdurur
   */
  async shutdownSystem() {
    try {
      console.log("🛑 Multi-Agent Sistemi Durduruluyor...");

      const result = await this.triggeringSystem.stopSystem();

      if (result.success) {
        this.isRunning = false;
        this.calculateUptime();
        this.updateSystemHealth("stopped", "Sistem durduruldu");

        console.log("✅ Multi-Agent Sistemi Başarıyla Durduruldu!");
        console.log(
          `⏱️  Toplam Çalışma Süresi: ${this.formatUptime(this.uptime)}`
        );

        return {
          success: true,
          message: "Sistem başarıyla durduruldu",
          uptime: this.uptime,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("❌ Sistem Durdurma Hatası:", error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Kullanıcı isteğini işler
   */
  async processUserRequest(userRequest) {
    try {
      if (!this.isRunning) {
        throw new Error("Sistem çalışmıyor. Önce sistemi başlatın.");
      }

      console.log(
        "📝 Kullanıcı İsteği Alındı:",
        userRequest.substring(0, 100) + "..."
      );

      // Trigger'ı çalıştır
      const result = await this.triggeringSystem.executeTrigger(
        "user_request",
        userRequest
      );

      if (result.success) {
        console.log("✅ İstek Başarıyla İşlendi!");
        console.log(`⏱️  İşlem Süresi: ${result.execution_time}ms`);

        return {
          success: true,
          result: result.result,
          processing_time: result.execution_time,
          message: "İstek başarıyla işlendi",
        };
      } else {
        throw new Error(result.error || "İstek işlenemedi");
      }
    } catch (error) {
      console.error("❌ İstek İşleme Hatası:", error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Task oluşturur ve atar
   */
  async createAndAssignTask(taskData, priority = "normal") {
    try {
      if (!this.isRunning) {
        throw new Error("Sistem çalışmıyor. Önce sistemi başlatın.");
      }

      console.log("📋 Yeni Task Oluşturuluyor:", taskData.type);

      const result =
        await this.triggeringSystem.taskManager.createAndAssignTask(
          taskData,
          priority
        );

      if (result.taskId) {
        console.log("✅ Task Başarıyla Oluşturuldu ve Atandı!");
        console.log(`🆔 Task ID: ${result.taskId}`);
        console.log(`👤 Atanan Agent: ${result.assignedAgent}`);
        console.log(`⚡ Öncelik: ${result.priority}`);

        return {
          success: true,
          task_id: result.taskId,
          assigned_agent: result.assignedAgent,
          priority: result.priority,
          assignment_time: result.assignmentTime,
        };
      } else {
        throw new Error("Task oluşturulamadı");
      }
    } catch (error) {
      console.error("❌ Task Oluşturma Hatası:", error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sistem durumunu alır
   */
  getSystemStatus() {
    const status = this.triggeringSystem.getSystemStatus();

    return {
      system_info: {
        version: this.systemVersion,
        is_initialized: this.isInitialized,
        is_running: this.isRunning,
        start_time: this.startTime,
        uptime: this.uptime,
        formatted_uptime: this.formatUptime(this.uptime),
      },
      system_health: this.systemHealth,
      performance_metrics: this.getPerformanceReport(),
      subsystems: status.subsystems,
      session_info: {
        current_session: status.current_session,
        total_sessions: status.total_sessions,
        success_rate: status.success_rate,
      },
    };
  }

  /**
   * Sistem sağlığını kontrol eder
   */
  async checkSystemHealth() {
    try {
      const status = this.getSystemStatus();
      const issues = [];

      // Temel kontroller
      if (!this.isInitialized) {
        issues.push("Sistem başlatılmamış");
      }

      if (!this.isRunning) {
        issues.push("Sistem çalışmıyor");
      }

      // Alt sistem kontrolleri
      if (status.subsystems.workflow_engine.current_step === 0) {
        issues.push("Workflow engine aktif değil");
      }

      if (status.subsystems.communication_system.totalAgents === 0) {
        issues.push("Communication system agent'ları bulunamadı");
      }

      if (
        status.subsystems.task_manager.totalActiveTasks === 0 &&
        this.isRunning
      ) {
        issues.push("Aktif task bulunamadı");
      }

      // Performance kontrolleri
      if (status.session_info.success_rate < 0.8) {
        issues.push("Düşük başarı oranı");
      }

      // Health status'ü güncelle
      if (issues.length === 0) {
        this.updateSystemHealth("healthy", "Tüm sistemler normal çalışıyor");
      } else {
        this.updateSystemHealth(
          "warning",
          `Sistem sorunları: ${issues.join(", ")}`
        );
      }

      this.systemHealth.issues = issues;
      this.systemHealth.lastCheck = new Date().toISOString();

      return {
        status: this.systemHealth.status,
        issues: issues,
        last_check: this.systemHealth.lastCheck,
      };
    } catch (error) {
      this.updateSystemHealth("error", error.message);
      return {
        status: "error",
        issues: [error.message],
        last_check: new Date().toISOString(),
      };
    }
  }

  /**
   * Performance raporu oluşturur
   */
  getPerformanceReport() {
    const report = {};

    for (const [operation, measurements] of this.performanceMetrics) {
      const durations = measurements.map((m) => m.duration);
      report[operation] = {
        average_duration:
          durations.reduce((a, b) => a + b, 0) / durations.length,
        min_duration: Math.min(...durations),
        max_duration: Math.max(...durations),
        total_operations: durations.length,
      };
    }

    return report;
  }

  /**
   * Sistem durumunu görsel olarak gösterir
   */
  displaySystemStatus() {
    const status = this.getSystemStatus();

    console.log("\n📊 MULTI-AGENT SİSTEM DURUMU");
    console.log("==================================");

    // Sistem Bilgileri
    console.log(`\n🏗️  Sistem Bilgileri:`);
    console.log(`   Versiyon: ${status.system_info.version}`);
    console.log(
      `   Durum: ${status.system_info.is_running ? "🟢 Çalışıyor" : "🔴 Durdu"}`
    );
    console.log(
      `   Başlatılma: ${
        status.system_info.is_initialized ? "✅ Evet" : "❌ Hayır"
      }`
    );
    console.log(`   Çalışma Süresi: ${status.system_info.formatted_uptime}`);

    // Sistem Sağlığı
    console.log(`\n💚 Sistem Sağlığı:`);
    console.log(
      `   Durum: ${this.getHealthStatusIcon(status.system_health.status)} ${
        status.system_health.status
      }`
    );
    console.log(
      `   Son Kontrol: ${
        status.system_health.lastCheck
          ? new Date(status.system_health.lastCheck).toLocaleString("tr-TR")
          : "Kontrol edilmedi"
      }`
    );

    if (status.system_health.issues.length > 0) {
      console.log(`   Sorunlar: ${status.system_health.issues.join(", ")}`);
    }

    // Session Bilgileri
    console.log(`\n📈 Session Bilgileri:`);
    console.log(`   Toplam Session: ${status.session_info.total_sessions}`);
    console.log(
      `   Başarı Oranı: ${(status.session_info.success_rate * 100).toFixed(1)}%`
    );

    if (status.session_info.current_session) {
      console.log(
        `   Aktif Session: ${status.session_info.current_session.id}`
      );
      console.log(
        `   Başlangıç: ${new Date(
          status.session_info.current_session.start_time
        ).toLocaleString("tr-TR")}`
      );
    }

    // Alt Sistemler
    console.log(`\n🤖 Alt Sistemler:`);
    console.log(
      `   Workflow Engine: ${
        status.subsystems.workflow_engine.is_active ? "🟢 Aktif" : "🔴 Pasif"
      }`
    );
    console.log(
      `   Communication System: ${status.subsystems.communication_system.totalAgents} agent aktif`
    );
    console.log(
      `   Task Manager: ${status.subsystems.task_manager.totalActiveTasks} aktif task`
    );

    console.log("\n✨ Sistem Durumu Kontrol Tamamlandı!");
  }

  /**
   * Health status icon'u döndürür
   */
  getHealthStatusIcon(status) {
    const icons = {
      healthy: "🟢",
      warning: "🟡",
      error: "🔴",
      stopped: "⚫",
      unknown: "⚪",
    };

    return icons[status] || "⚪";
  }

  /**
   * Gerekli dizinleri oluşturur
   */
  ensureDirectories() {
    const directories = [this.logsPath];

    directories.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Sistem sağlığını günceller
   */
  updateSystemHealth(status, message) {
    this.systemHealth.status = status;
    this.systemHealth.message = message;
    this.systemHealth.lastCheck = new Date().toISOString();
  }

  /**
   * Uptime hesaplar
   */
  calculateUptime() {
    if (this.startTime) {
      this.uptime = Date.now() - this.startTime.getTime();
    }
  }

  /**
   * Uptime'ı formatlar
   */
  formatUptime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} gün, ${hours % 24} saat, ${minutes % 60} dakika`;
    } else if (hours > 0) {
      return `${hours} saat, ${minutes % 60} dakika, ${seconds % 60} saniye`;
    } else if (minutes > 0) {
      return `${minutes} dakika, ${seconds % 60} saniye`;
    } else {
      return `${seconds} saniye`;
    }
  }

  /**
   * Performance metric kaydeder
   */
  recordPerformanceMetric(operation, duration) {
    if (!this.performanceMetrics.has(operation)) {
      this.performanceMetrics.set(operation, []);
    }

    this.performanceMetrics.get(operation).push({
      timestamp: new Date().toISOString(),
      duration: duration,
    });
  }

  /**
   * Logging fonksiyonları
   */
  logSystem(event, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event,
      data: data,
      system_version: this.systemVersion,
      is_running: this.isRunning,
    };

    this.writeLog("main-system.log", logEntry);
  }

  writeLog(filename, data) {
    try {
      const logFile = path.join(this.logsPath, filename);
      const logEntry = JSON.stringify(data) + "\n";

      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error("Log yazma hatası:", error.message);
    }
  }

  /**
   * Sistemi temizler
   */
  cleanup() {
    this.isInitialized = false;
    this.isRunning = false;
    this.startTime = null;
    this.uptime = 0;
    this.performanceMetrics.clear();
    this.systemHealth = {
      status: "unknown",
      lastCheck: null,
      issues: [],
    };

    this.triggeringSystem.cleanup();
  }
}

export default MainSystemController;
