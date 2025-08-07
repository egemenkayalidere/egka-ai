const fs = require("fs");
const path = require("path");

class ContextInjectionManagerV2 {
  constructor() {
    this.injectionPath = path.join(__dirname, "../shared/context-injection");
    this.agentPath = path.join(__dirname, "../agents");
    this.logPath = path.join(__dirname, "../shared/logs");

    // Injection dosyalarını yönetmek için
    this.injectionFiles = new Map();
    this.loadedContexts = new Map();
    this.performanceMetrics = new Map();
  }

  /**
   * Context injection dosyasını yükler ve doğrular
   */
  async loadContextInjection(agentName) {
    const startTime = Date.now();

    try {
      const injectionFile = path.join(
        this.injectionPath,
        `${agentName}-injection.context7.json`
      );

      if (!fs.existsSync(injectionFile)) {
        console.log(`Injection dosyası bulunamadı: ${injectionFile}`);
        return null;
      }

      const injectionData = JSON.parse(fs.readFileSync(injectionFile, "utf8"));

      // Injection verilerini doğrula
      if (!this.validateInjectionData(injectionData)) {
        throw new Error(`Geçersiz injection verisi: ${agentName}`);
      }

      this.injectionFiles.set(agentName, injectionData);
      this.logInjectionLoad(agentName, injectionData);

      // Performance metric'i kaydet
      const loadTime = Date.now() - startTime;
      this.recordPerformanceMetric(agentName, "injection_load", loadTime);

      return injectionData;
    } catch (error) {
      console.error(
        `Context injection yükleme hatası (${agentName}):`,
        error.message
      );
      this.logError(agentName, error);
      return null;
    }
  }

  /**
   * Injection verilerini doğrular
   */
  validateInjectionData(data) {
    const requiredFields = ["name", "type", "injection_config", "context_data"];

    for (const field of requiredFields) {
      if (!data[field]) {
        console.error(`Eksik alan: ${field}`);
        return false;
      }
    }

    if (data.type !== "context_injection") {
      console.error("Geçersiz injection tipi");
      return false;
    }

    // Security validation
    if (data.context_data && typeof data.context_data === "object") {
      if (!this.validateSecurityContext(data.context_data)) {
        console.error("Güvenlik doğrulaması başarısız");
        return false;
      }
    }

    return true;
  }

  /**
   * Güvenlik context'ini doğrular
   */
  validateSecurityContext(contextData) {
    // XSS koruması kontrolü
    if (contextData.security_rules) {
      const hasXSSProtection = contextData.security_rules.some(
        (rule) => rule.includes("XSS") || rule.includes("xss")
      );
      if (!hasXSSProtection) {
        console.warn("XSS koruması eksik");
      }
    }

    // Input validation kontrolü
    if (contextData.performance_rules) {
      const hasInputValidation = contextData.performance_rules.some(
        (rule) => rule.includes("input") || rule.includes("validation")
      );
      if (!hasInputValidation) {
        console.warn("Input validation eksik");
      }
    }

    return true;
  }

  /**
   * Agent'ın mevcut context'ini injection ile birleştirir
   */
  async mergeContextWithInjection(agentName) {
    const startTime = Date.now();

    try {
      const injectionData = this.injectionFiles.get(agentName);
      if (!injectionData) {
        console.log(`Injection verisi bulunamadı: ${agentName}`);
        return false;
      }

      const agentFile = path.join(
        this.agentPath,
        `${agentName}Agent.context7.json`
      );
      if (!fs.existsSync(agentFile)) {
        console.error(`Agent dosyası bulunamadı: ${agentFile}`);
        return false;
      }

      const agentData = JSON.parse(fs.readFileSync(agentFile, "utf8"));

      // Injection context'ini agent context'ine birleştir
      const mergedContext = this.mergeContextData(agentData, injectionData);

      // Birleştirilmiş context'i geçici olarak sakla
      this.loadedContexts.set(agentName, mergedContext);

      this.logContextMerge(agentName, injectionData.context_data);

      // Performance metric'i kaydet
      const mergeTime = Date.now() - startTime;
      this.recordPerformanceMetric(agentName, "context_merge", mergeTime);

      return true;
    } catch (error) {
      console.error(
        `Context birleştirme hatası (${agentName}):`,
        error.message
      );
      this.logError(agentName, error);
      return false;
    }
  }

  /**
   * Context verilerini akıllıca birleştirir
   */
  mergeContextData(agentData, injectionData) {
    const merged = { ...agentData };

    // Global ayarları uygula
    if (injectionData.context_data.global_settings) {
      merged.global_settings = {
        ...merged.global_settings,
        ...injectionData.context_data.global_settings,
      };
    }

    // Proje konfigürasyonlarını ekle
    if (injectionData.context_data.project_configs) {
      merged.project_configs = injectionData.context_data.project_configs;
    }

    // Geliştirme workflow'unu ekle
    if (injectionData.context_data.development_workflow) {
      merged.development_workflow =
        injectionData.context_data.development_workflow;
    }

    // Paylaşılan kaynakları ekle
    if (injectionData.context_data.shared_resources) {
      merged.shared_resources = injectionData.context_data.shared_resources;
    }

    // Kalite standartlarını ekle
    if (injectionData.context_data.quality_standards) {
      merged.quality_standards = injectionData.context_data.quality_standards;
    }

    // Performance optimization kurallarını ekle
    if (injectionData.context_data.performance_rules) {
      merged.performance_rules = injectionData.context_data.performance_rules;
    }

    // Security kurallarını ekle
    if (injectionData.context_data.security_rules) {
      merged.security_rules = injectionData.context_data.security_rules;
    }

    // UI consistency kurallarını ekle
    if (injectionData.context_data.ui_consistency) {
      merged.ui_consistency = injectionData.context_data.ui_consistency;
    }

    return merged;
  }

  /**
   * Agent'ın injection context'ini alır
   */
  getInjectedContext(agentName) {
    return this.loadedContexts.get(agentName) || null;
  }

  /**
   * Injection durumunu kontrol eder
   */
  getInjectionStatus(agentName) {
    const injectionData = this.injectionFiles.get(agentName);
    const loadedContext = this.loadedContexts.get(agentName);
    const performanceMetrics = this.performanceMetrics.get(agentName);

    return {
      agent: agentName,
      injection_loaded: !!injectionData,
      context_merged: !!loadedContext,
      injection_config: injectionData?.injection_config || null,
      last_updated: injectionData ? new Date().toISOString() : null,
      performance_metrics: performanceMetrics || {},
      security_validated: injectionData
        ? this.validateSecurityContext(injectionData.context_data)
        : false,
    };
  }

  /**
   * Injection dosyasını günceller
   */
  async updateInjectionFile(agentName, newContextData) {
    const startTime = Date.now();

    try {
      const injectionFile = path.join(
        this.injectionPath,
        `${agentName}-injection.context7.json`
      );

      // Mevcut injection verisini oku
      let currentData = {};
      if (fs.existsSync(injectionFile)) {
        currentData = JSON.parse(fs.readFileSync(injectionFile, "utf8"));
      }

      // Yeni context verilerini güncelle
      const updatedData = {
        ...currentData,
        context_data: {
          ...currentData.context_data,
          ...newContextData,
        },
        last_updated: new Date().toISOString(),
        version: "2.0.0",
      };

      // Dosyayı güncelle
      fs.writeFileSync(injectionFile, JSON.stringify(updatedData, null, 2));

      // Injection cache'ini güncelle
      this.injectionFiles.set(agentName, updatedData);

      this.logInjectionUpdate(agentName, newContextData);

      // Performance metric'i kaydet
      const updateTime = Date.now() - startTime;
      this.recordPerformanceMetric(agentName, "injection_update", updateTime);

      return true;
    } catch (error) {
      console.error(
        `Injection güncelleme hatası (${agentName}):`,
        error.message
      );
      this.logError(agentName, error);
      return false;
    }
  }

  /**
   * Performance metric'lerini kaydeder
   */
  recordPerformanceMetric(agentName, operation, duration) {
    if (!this.performanceMetrics.has(agentName)) {
      this.performanceMetrics.set(agentName, {});
    }

    const metrics = this.performanceMetrics.get(agentName);
    if (!metrics[operation]) {
      metrics[operation] = [];
    }

    metrics[operation].push({
      timestamp: new Date().toISOString(),
      duration: duration,
    });

    // Son 10 metric'i tut
    if (metrics[operation].length > 10) {
      metrics[operation] = metrics[operation].slice(-10);
    }
  }

  /**
   * Performance raporu oluşturur
   */
  getPerformanceReport(agentName) {
    const metrics = this.performanceMetrics.get(agentName);
    if (!metrics) return null;

    const report = {};
    for (const [operation, measurements] of Object.entries(metrics)) {
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
   * Logging fonksiyonları
   */
  logInjectionLoad(agentName, injectionData) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: "injection_loaded",
      agent: agentName,
      injection_size: JSON.stringify(injectionData).length,
      context_keys: Object.keys(injectionData.context_data || {}),
      version: "2.0.0",
    };

    this.writeLog("context-injection.log", logEntry);
  }

  logContextMerge(agentName, contextData) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: "context_merged",
      agent: agentName,
      merged_sections: Object.keys(contextData || {}),
      version: "2.0.0",
    };

    this.writeLog("context-injection.log", logEntry);
  }

  logInjectionUpdate(agentName, newData) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: "injection_updated",
      agent: agentName,
      updated_sections: Object.keys(newData || {}),
      version: "2.0.0",
    };

    this.writeLog("context-injection.log", logEntry);
  }

  logError(agentName, error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: "injection_error",
      agent: agentName,
      error: error.message,
      stack: error.stack,
      version: "2.0.0",
    };

    this.writeLog("context-injection-errors.log", logEntry);
  }

  writeLog(filename, data) {
    try {
      const logFile = path.join(this.logPath, filename);
      const logEntry = JSON.stringify(data) + "\n";

      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error("Log yazma hatası:", error.message);
    }
  }
}

module.exports = ContextInjectionManagerV2;
