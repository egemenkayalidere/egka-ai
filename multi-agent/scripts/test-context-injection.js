const DeveloperAgentStartup = require("./developer-agent-startup");
const ContextInjectionManager = require("../orchestrator/context-injection-manager");
const fs = require("fs");
const path = require("path");

class ContextInjectionTester {
  constructor() {
    this.startup = new DeveloperAgentStartup();
    this.injectionManager = new ContextInjectionManager();
  }

  /**
   * Tüm context injection testlerini çalıştırır
   */
  async runAllTests() {
    console.log("🧪 Context Injection Testleri Başlatılıyor...\n");

    const tests = [
      {
        name: "Injection Dosyası Kontrolü",
        test: () => this.testInjectionFileExists(),
      },
      {
        name: "Injection Veri Doğrulama",
        test: () => this.testInjectionDataValidation(),
      },
      { name: "Context Birleştirme", test: () => this.testContextMerging() },
      { name: "Startup Sırası", test: () => this.testStartupSequence() },
      {
        name: "Global Ayarlar Uygulama",
        test: () => this.testGlobalSettingsApplication(),
      },
      { name: "Logging Mekanizması", test: () => this.testLoggingMechanism() },
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      console.log(`📋 Test: ${test.name}`);

      try {
        const result = await test.test();
        if (result) {
          console.log(`✅ ${test.name} - BAŞARILI\n`);
          passedTests++;
        } else {
          console.log(`❌ ${test.name} - BAŞARISIZ\n`);
        }
      } catch (error) {
        console.log(`💥 ${test.name} - HATA: ${error.message}\n`);
      }
    }

    console.log(`📊 Test Sonuçları: ${passedTests}/${totalTests} başarılı`);

    if (passedTests === totalTests) {
      console.log(
        "🎉 Tüm testler başarılı! Context injection mekanizması hazır."
      );
    } else {
      console.log("⚠️ Bazı testler başarısız. Lütfen hataları kontrol edin.");
    }

    return passedTests === totalTests;
  }

  /**
   * Injection dosyasının varlığını test eder
   */
  async testInjectionFileExists() {
    const injectionFile = path.join(
      __dirname,
      "../shared/context-injection/developer-injection.context7.json"
    );

    if (!fs.existsSync(injectionFile)) {
      throw new Error("Injection dosyası bulunamadı");
    }

    const data = JSON.parse(fs.readFileSync(injectionFile, "utf8"));

    if (!data.name || !data.type || data.type !== "context_injection") {
      throw new Error("Geçersiz injection dosya formatı");
    }

    console.log(`   📁 Dosya bulundu: ${injectionFile}`);
    console.log(`   📄 Dosya boyutu: ${fs.statSync(injectionFile).size} bytes`);
    console.log(`   🏷️ Injection adı: ${data.name}`);

    return true;
  }

  /**
   * Injection veri doğrulamasını test eder
   */
  async testInjectionDataValidation() {
    const injectionData = await this.injectionManager.loadContextInjection(
      "developer"
    );

    if (!injectionData) {
      throw new Error("Injection verisi yüklenemedi");
    }

    // Gerekli alanları kontrol et
    const requiredSections = [
      "global_settings",
      "project_configs",
      "development_workflow",
    ];

    for (const section of requiredSections) {
      if (!injectionData.context_data[section]) {
        throw new Error(`Eksik context bölümü: ${section}`);
      }
    }

    console.log(`   ✅ Veri doğrulama başarılı`);
    console.log(
      `   📊 Context bölümleri: ${Object.keys(injectionData.context_data).join(
        ", "
      )}`
    );

    return true;
  }

  /**
   * Context birleştirme işlemini test eder
   */
  async testContextMerging() {
    const success = await this.injectionManager.mergeContextWithInjection(
      "developer"
    );

    if (!success) {
      throw new Error("Context birleştirme başarısız");
    }

    const mergedContext = this.injectionManager.getInjectedContext("developer");

    if (!mergedContext) {
      throw new Error("Birleştirilmiş context bulunamadı");
    }

    // Birleştirilmiş context'te injection verilerinin olup olmadığını kontrol et
    const hasInjectionData =
      mergedContext.global_settings &&
      mergedContext.project_configs &&
      mergedContext.development_workflow;

    if (!hasInjectionData) {
      throw new Error("Injection verileri context'e birleştirilmemiş");
    }

    console.log(`   ✅ Context birleştirme başarılı`);
    console.log(
      `   🔗 Birleştirilmiş context boyutu: ${
        JSON.stringify(mergedContext).length
      } bytes`
    );

    return true;
  }

  /**
   * Startup sırasını test eder
   */
  async testStartupSequence() {
    const success = await this.startup.initialize();

    if (!success) {
      throw new Error("Startup sırası başarısız");
    }

    const isReady = this.startup.isReady();

    if (!isReady) {
      throw new Error("Agent hazır durumda değil");
    }

    const status = this.startup.getInjectionStatus();

    if (!status.injection_loaded || !status.context_merged) {
      throw new Error("Injection durumu geçersiz");
    }

    console.log(`   ✅ Startup sırası başarılı`);
    console.log(
      `   🚀 Agent durumu: ${
        status.injection_loaded ? "Yüklendi" : "Yüklenmedi"
      }`
    );
    console.log(
      `   🔄 Context durumu: ${
        status.context_merged ? "Birleştirildi" : "Birleştirilmedi"
      }`
    );

    return true;
  }

  /**
   * Global ayarların uygulanmasını test eder
   */
  async testGlobalSettingsApplication() {
    const context = this.startup.getCurrentContext();

    if (!context) {
      throw new Error("Mevcut context bulunamadı");
    }

    const globalSettings = context.global_settings;

    if (!globalSettings) {
      throw new Error("Global ayarlar bulunamadı");
    }

    // Temel ayarları kontrol et
    const requiredSettings = [
      "default_language",
      "code_style",
      "linting_rules",
    ];

    for (const setting of requiredSettings) {
      if (!globalSettings[setting]) {
        throw new Error(`Eksik global ayar: ${setting}`);
      }
    }

    console.log(`   ✅ Global ayarlar uygulandı`);
    console.log(`   🌍 Varsayılan dil: ${globalSettings.default_language}`);
    console.log(`   🎨 Kod stili: ${globalSettings.code_style}`);
    console.log(`   🔍 Linting: ${globalSettings.linting_rules}`);

    return true;
  }

  /**
   * Logging mekanizmasını test eder
   */
  async testLoggingMechanism() {
    const logFiles = [
      "../shared/logs/context-injection.log",
      "../shared/logs/context-injection-errors.log",
      "../shared/logs/developer-agent-startup.log",
      "../shared/logs/developer-agent-startup.json",
    ];

    for (const logFile of logFiles) {
      const logPath = path.join(__dirname, logFile);

      if (!fs.existsSync(logPath)) {
        throw new Error(`Log dosyası bulunamadı: ${logFile}`);
      }

      const stats = fs.statSync(logPath);

      if (stats.size === 0) {
        console.log(`   ⚠️ Boş log dosyası: ${logFile}`);
      } else {
        console.log(`   📝 Log dosyası: ${logFile} (${stats.size} bytes)`);
      }
    }

    console.log(`   ✅ Logging mekanizması çalışıyor`);

    return true;
  }

  /**
   * Test sonuçlarını raporlar
   */
  generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      test_name: "Context Injection Test Suite",
      agent: "developer",
      injection_status: this.startup.getInjectionStatus(),
      current_context: this.startup.getCurrentContext()
        ? "loaded"
        : "not_loaded",
    };

    const reportFile = path.join(
      __dirname,
      "../shared/logs/context-injection-test-report.json"
    );
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log(`📋 Test raporu kaydedildi: ${reportFile}`);
  }
}

// CLI kullanımı için
if (require.main === module) {
  const tester = new ContextInjectionTester();

  tester
    .runAllTests()
    .then((success) => {
      tester.generateTestReport();

      if (success) {
        console.log(
          "\n🎉 Context injection mekanizması başarıyla test edildi!"
        );
        process.exit(0);
      } else {
        console.log(
          "\n⚠️ Bazı testler başarısız oldu. Lütfen hataları kontrol edin."
        );
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n💥 Test çalıştırma hatası:", error.message);
      process.exit(1);
    });
}

module.exports = ContextInjectionTester;
