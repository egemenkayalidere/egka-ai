#!/usr/bin/env node

const MainSystemControllerV2 = require("./orchestrator/main-system-controller.js");

class MultiAgentV2Main {
  constructor() {
    this.systemController = new MainSystemControllerV2();
    this.isRunning = false;
  }

  /**
   * Sistemi başlatır
   */
  async start() {
    try {
      console.log("🚀 Multi-Agent V2 Sistemi Başlatılıyor...");
      console.log("==========================================");

      // Sistemi başlat
      const result = await this.systemController.initializeSystem();

      if (result.success) {
        this.isRunning = true;

        console.log("\n✅ SİSTEM BAŞARILI ŞEKİLDE BAŞLATILDI!");
        console.log("==========================================");
        console.log(`📊 Session ID: ${result.session_id}`);
        console.log(`🔧 Versiyon: ${result.version}`);
        console.log("🎯 Sistem Hazır - Kullanıcı İsteklerini Bekliyor...");

        // Sistem durumunu göster
        this.systemController.displaySystemStatus();

        // Örnek kullanım
        this.showUsageExamples();

        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("❌ Sistem Başlatma Hatası:", error.message);
      return false;
    }
  }

  /**
   * Sistemi durdurur
   */
  async stop() {
    try {
      console.log("\n🛑 Multi-Agent V2 Sistemi Durduruluyor...");

      const result = await this.systemController.shutdownSystem();

      if (result.success) {
        this.isRunning = false;

        console.log("✅ SİSTEM BAŞARILI ŞEKİLDE DURDURULDU!");
        console.log("==========================================");
        console.log(
          `⏱️  Toplam Çalışma Süresi: ${this.formatUptime(result.uptime)}`
        );

        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("❌ Sistem Durdurma Hatası:", error.message);
      return false;
    }
  }

  /**
   * Kullanıcı isteğini işler
   */
  async processRequest(request) {
    if (!this.isRunning) {
      console.error("❌ Sistem çalışmıyor. Önce sistemi başlatın.");
      return false;
    }

    try {
      console.log("\n📝 Kullanıcı İsteği İşleniyor...");
      console.log("==================================");

      const result = await this.systemController.processUserRequest(request);

      if (result.success) {
        console.log("✅ İSTEK BAŞARILI ŞEKİLDE İŞLENDİ!");
        console.log("====================================");
        console.log(`⏱️  İşlem Süresi: ${result.processing_time}ms`);
        console.log(`📋 Sonuç: ${JSON.stringify(result.result, null, 2)}`);

        return true;
      } else {
        console.error("❌ İstek İşleme Hatası:", result.error);
        return false;
      }
    } catch (error) {
      console.error("❌ İstek İşleme Hatası:", error.message);
      return false;
    }
  }

  /**
   * Task oluşturur
   */
  async createTask(taskData, priority = "normal") {
    if (!this.isRunning) {
      console.error("❌ Sistem çalışmıyor. Önce sistemi başlatın.");
      return false;
    }

    try {
      console.log("\n📋 Task Oluşturuluyor...");
      console.log("=========================");

      const result = await this.systemController.createAndAssignTask(
        taskData,
        priority
      );

      if (result.success) {
        console.log("✅ TASK BAŞARILI ŞEKİLDE OLUŞTURULDU!");
        console.log("======================================");
        console.log(`🆔 Task ID: ${result.task_id}`);
        console.log(`👤 Atanan Agent: ${result.assigned_agent}`);
        console.log(`⚡ Öncelik: ${result.priority}`);
        console.log(`⏱️  Atama Süresi: ${result.assignment_time}ms`);

        return true;
      } else {
        console.error("❌ Task Oluşturma Hatası:", result.error);
        return false;
      }
    } catch (error) {
      console.error("❌ Task Oluşturma Hatası:", error.message);
      return false;
    }
  }

  /**
   * Sistem durumunu gösterir
   */
  showStatus() {
    if (!this.isRunning) {
      console.log("❌ Sistem çalışmıyor.");
      return;
    }

    this.systemController.displaySystemStatus();
  }

  /**
   * Kullanım örneklerini gösterir
   */
  showUsageExamples() {
    console.log("\n📚 KULLANIM ÖRNEKLERİ");
    console.log("=====================");

    console.log("\n1️⃣ Kullanıcı İsteği İşleme:");
    console.log(
      "   await main.processRequest('React component geliştirme isteği')"
    );

    console.log("\n2️⃣ Task Oluşturma:");
    console.log("   const taskData = {");
    console.log("     type: 'component_development',");
    console.log("     description: 'UserCard component geliştir',");
    console.log(
      "     requirements: ['React.memo', 'TypeScript', 'Material UI']"
    );
    console.log("   };");
    console.log("   await main.createTask(taskData, 'high');");

    console.log("\n3️⃣ Sistem Durumu:");
    console.log("   main.showStatus();");

    console.log("\n4️⃣ Sistem Durdurma:");
    console.log("   await main.stop();");

    console.log("\n🎯 Sistem Hazır! Yukarıdaki örnekleri kullanabilirsiniz.");
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
   * Demo çalıştırır
   */
  async runDemo() {
    console.log("\n🎬 DEMO BAŞLATILIYOR...");
    console.log("=======================");

    try {
      // Demo 1: Kullanıcı isteği
      console.log("\n📝 Demo 1: Kullanıcı İsteği İşleme");
      await this.processRequest(
        "React component geliştirme isteği - UserCard component'i oluştur"
      );

      // Demo 2: Task oluşturma
      console.log("\n📋 Demo 2: Task Oluşturma");
      const taskData = {
        type: "component_development",
        description: "UserCard component'i geliştir",
        requirements: [
          "React.memo kullanımı zorunlu",
          "TypeScript ile yazılmalı",
          "Material UI kullanılmalı",
          "Storybook story'si oluşturulmalı",
        ],
        complexity: "medium",
        urgency: "normal",
        estimated_duration: "2 hours",
      };

      await this.createTask(taskData, "high");

      // Demo 3: Sistem durumu
      console.log("\n📊 Demo 3: Sistem Durumu");
      this.showStatus();

      console.log("\n🎉 DEMO TAMAMLANDI!");
    } catch (error) {
      console.error("❌ Demo Hatası:", error.message);
    }
  }
}

// Ana giriş noktası
if (require.main === module) {
  const main = new MultiAgentV2Main();

  // Command line arguments
  const args = process.argv.slice(2);
  const command = args[0];

  async function run() {
    try {
      switch (command) {
        case "start":
          await main.start();
          break;

        case "stop":
          await main.stop();
          break;

        case "demo":
          await main.start();
          if (main.isRunning) {
            await main.runDemo();
            await main.stop();
          }
          break;

        case "status":
          await main.start();
          if (main.isRunning) {
            main.showStatus();
            await main.stop();
          }
          break;

        default:
          console.log("🚀 Multi-Agent V2 Sistemi");
          console.log("=========================");
          console.log("\n📋 Kullanım:");
          console.log("   node main.js start    - Sistemi başlat");
          console.log("   node main.js stop     - Sistemi durdur");
          console.log("   node main.js demo     - Demo çalıştır");
          console.log("   node main.js status   - Sistem durumunu göster");
          console.log("\n🎯 Örnek: node main.js demo");
      }
    } catch (error) {
      console.error("❌ Hata:", error.message);
      process.exit(1);
    }
  }

  run();
}

module.exports = MultiAgentV2Main;
