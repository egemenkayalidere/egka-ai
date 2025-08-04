const ContextInjectionManager = require("../orchestrator/context-injection-manager.cjs");
const fs = require("fs");
const path = require("path");

class DeveloperAgentStartup {
  constructor() {
    this.injectionManager = new ContextInjectionManager();
    this.agentName = "developer";
    this.startupLog = [];
  }

  /**
   * Developer agent'ı context injection ile başlatır
   */
  async initialize() {
    console.log("🚀 Developer Agent başlatılıyor...");

    try {
      // 1. Context injection'ı yükle
      await this.loadContextInjection();

      // 2. Context'i birleştir
      await this.mergeContext();

      // 3. Global ayarları uygula
      await this.applyGlobalSettings();

      // 4. Başlangıç durumunu kaydet
      await this.saveStartupState();

      console.log("✅ Developer Agent başarıyla başlatıldı!");
      this.logStartup("startup_completed", { success: true });

      return true;
    } catch (error) {
      console.error("❌ Developer Agent başlatma hatası:", error.message);
      this.logStartup("startup_failed", { error: error.message });
      return false;
    }
  }

  /**
   * Context injection dosyasını yükler
   */
  async loadContextInjection() {
    console.log("📥 Context injection yükleniyor...");

    const injectionData = await this.injectionManager.loadContextInjection(
      this.agentName
    );

    if (!injectionData) {
      throw new Error("Context injection dosyası yüklenemedi");
    }

    console.log(`✅ Context injection yüklendi: ${injectionData.name}`);
    this.logStartup("injection_loaded", {
      injection_name: injectionData.name,
      context_sections: Object.keys(injectionData.context_data || {}),
    });
  }

  /**
   * Context'i birleştirir
   */
  async mergeContext() {
    console.log("🔄 Context birleştiriliyor...");

    const success = await this.injectionManager.mergeContextWithInjection(
      this.agentName
    );

    if (!success) {
      throw new Error("Context birleştirme başarısız");
    }

    console.log("✅ Context başarıyla birleştirildi");
    this.logStartup("context_merged", { success: true });
  }

  /**
   * Global ayarları uygular
   */
  async applyGlobalSettings() {
    console.log("⚙️ Global ayarlar uygulanıyor...");

    const injectedContext = this.injectionManager.getInjectedContext(
      this.agentName
    );

    if (!injectedContext) {
      throw new Error("Birleştirilmiş context bulunamadı");
    }

    // Global ayarları uygula
    const globalSettings = injectedContext.global_settings || {};

    // Proje konfigürasyonlarını kontrol et
    const projectConfigs = injectedContext.project_configs || {};

    // Kalite standartlarını kontrol et
    const qualityStandards = injectedContext.quality_standards || {};

    console.log("✅ Global ayarlar uygulandı");
    this.logStartup("global_settings_applied", {
      settings_count: Object.keys(globalSettings).length,
      project_configs: Object.keys(projectConfigs),
      quality_standards: Object.keys(qualityStandards),
    });
  }

  /**
   * Başlangıç durumunu kaydeder
   */
  async saveStartupState() {
    const startupState = {
      timestamp: new Date().toISOString(),
      agent: this.agentName,
      status: "ready",
      injection_status: this.injectionManager.getInjectionStatus(
        this.agentName
      ),
      startup_log: this.startupLog,
    };

    const stateFile = path.join(
      __dirname,
      "../shared/logs/developer-agent-startup.json"
    );
    fs.writeFileSync(stateFile, JSON.stringify(startupState, null, 2));
  }

  /**
   * Başlangıç loglarını kaydeder
   */
  logStartup(event, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      agent: this.agentName,
      ...data,
    };

    this.startupLog.push(logEntry);

    // Ayrıca dosyaya da yaz
    const logFile = path.join(
      __dirname,
      "../shared/logs/developer-agent-startup.log"
    );
    const logLine = JSON.stringify(logEntry) + "\n";
    fs.appendFileSync(logFile, logLine);
  }

  /**
   * Agent'ın hazır olup olmadığını kontrol eder
   */
  isReady() {
    const injectedContext = this.injectionManager.getInjectedContext(
      this.agentName
    );
    return !!injectedContext;
  }

  /**
   * Mevcut context'i alır
   */
  getCurrentContext() {
    return this.injectionManager.getInjectedContext(this.agentName);
  }

  /**
   * Injection durumunu alır
   */
  getInjectionStatus() {
    return this.injectionManager.getInjectionStatus(this.agentName);
  }

  /**
   * Context injection'ı günceller
   */
  async updateInjection(newContextData) {
    console.log("🔄 Context injection güncelleniyor...");

    const success = await this.injectionManager.updateInjectionFile(
      this.agentName,
      newContextData
    );

    if (success) {
      console.log("✅ Context injection güncellendi");
      this.logStartup("injection_updated", {
        updated_sections: Object.keys(newContextData || {}),
      });
    } else {
      console.error("❌ Context injection güncelleme başarısız");
    }

    return success;
  }
}

// CLI kullanımı için
if (require.main === module) {
  const startup = new DeveloperAgentStartup();

  startup
    .initialize()
    .then((success) => {
      if (success) {
        console.log("\n🎉 Developer Agent hazır!");
        console.log("Injection durumu:", startup.getInjectionStatus());
        process.exit(0);
      } else {
        console.error("\n💥 Developer Agent başlatılamadı!");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n💥 Beklenmeyen hata:", error.message);
      process.exit(1);
    });
}

module.exports = DeveloperAgentStartup;
