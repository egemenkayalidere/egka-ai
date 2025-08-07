#!/usr/bin/env node

import MainSystemController from "../orchestrator/main-system-controller.js";

class MultiAgentSystemTest {
  constructor() {
    this.systemController = new MainSystemController();
    this.testResults = [];
  }

  /**
   * Tüm testleri çalıştırır
   */
  async runAllTests() {
    console.log("🧪 Multi-Agent Sistem Testleri Başlatılıyor...\n");

    try {
      // Test 1: Sistem Başlatma
      await this.testSystemInitialization();

      // Test 2: Sistem Durumu Kontrolü
      await this.testSystemStatus();

      // Test 3: Kullanıcı İsteği İşleme
      await this.testUserRequestProcessing();

      // Test 4: Task Oluşturma ve Atama
      await this.testTaskCreationAndAssignment();

      // Test 5: Sistem Sağlığı Kontrolü
      await this.testSystemHealth();

      // Test 6: Sistem Durdurma
      await this.testSystemShutdown();

      // Test Sonuçlarını Göster
      this.displayTestResults();
    } catch (error) {
      console.error("❌ Test Hatası:", error.message);
      this.testResults.push({
        test: "General",
        status: "FAILED",
        error: error.message,
      });
    }
  }

  /**
   * Test 1: Sistem Başlatma
   */
  async testSystemInitialization() {
    console.log("📋 Test 1: Sistem Başlatma");

    try {
      const result = await this.systemController.initializeSystem();

      if (result.success) {
        console.log("✅ Sistem başarıyla başlatıldı");
        this.testResults.push({
          test: "System Initialization",
          status: "PASSED",
          details: {
            session_id: result.session_id,
            version: result.version,
          },
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.log("❌ Sistem başlatma hatası:", error.message);
      this.testResults.push({
        test: "System Initialization",
        status: "FAILED",
        error: error.message,
      });
    }

    console.log("");
  }

  /**
   * Test 2: Sistem Durumu Kontrolü
   */
  async testSystemStatus() {
    console.log("📋 Test 2: Sistem Durumu Kontrolü");

    try {
      const status = this.systemController.getSystemStatus();

      // Temel kontroller
      const checks = [
        {
          name: "Sistem Başlatılma",
          value: status.system_info.is_initialized,
          expected: true,
        },
        {
          name: "Sistem Çalışma",
          value: status.system_info.is_running,
          expected: true,
        },
        {
          name: "Versiyon Kontrolü",
          value: status.system_info.version,
          expected: "2.0.0",
        },
        {
          name: "Workflow Engine",
          value: status.subsystems.workflow_engine.current_step >= 0,
          expected: true,
        },
        {
          name: "Communication System",
          value: status.subsystems.communication_system.totalAgents > 0,
          expected: true,
        },
        {
          name: "Task Manager",
          value: status.subsystems.task_manager.totalActiveTasks >= 0,
          expected: true,
        },
      ];

      let passedChecks = 0;

      checks.forEach((check) => {
        if (check.value === check.expected) {
          console.log(`✅ ${check.name}: ${check.value}`);
          passedChecks++;
        } else {
          console.log(
            `❌ ${check.name}: ${check.value} (beklenen: ${check.expected})`
          );
        }
      });

      if (passedChecks === checks.length) {
        this.testResults.push({
          test: "System Status",
          status: "PASSED",
          details: {
            passed_checks: passedChecks,
            total_checks: checks.length,
          },
        });
      } else {
        throw new Error(`${passedChecks}/${checks.length} kontrol başarılı`);
      }
    } catch (error) {
      console.log("❌ Sistem durumu kontrolü hatası:", error.message);
      this.testResults.push({
        test: "System Status",
        status: "FAILED",
        error: error.message,
      });
    }

    console.log("");
  }

  /**
   * Test 3: Kullanıcı İsteği İşleme
   */
  async testUserRequestProcessing() {
    console.log("📋 Test 3: Kullanıcı İsteği İşleme");

    try {
      const testRequest =
        "React component geliştirme isteği - UserCard component'i oluştur";

      const result = await this.systemController.processUserRequest(
        testRequest
      );

      if (result.success) {
        console.log("✅ Kullanıcı isteği başarıyla işlendi");
        console.log(`⏱️  İşlem süresi: ${result.processing_time}ms`);

        this.testResults.push({
          test: "User Request Processing",
          status: "PASSED",
          details: {
            processing_time: result.processing_time,
            workflow_result: result.result,
          },
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.log("❌ Kullanıcı isteği işleme hatası:", error.message);
      this.testResults.push({
        test: "User Request Processing",
        status: "FAILED",
        error: error.message,
      });
    }

    console.log("");
  }

  /**
   * Test 4: Task Oluşturma ve Atama
   */
  async testTaskCreationAndAssignment() {
    console.log("📋 Test 4: Task Oluşturma ve Atama");

    try {
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

      const result = await this.systemController.createAndAssignTask(
        taskData,
        "high"
      );

      if (result.success) {
        console.log("✅ Task başarıyla oluşturuldu ve atandı");
        console.log(`🆔 Task ID: ${result.task_id}`);
        console.log(`👤 Atanan Agent: ${result.assigned_agent}`);
        console.log(`⚡ Öncelik: ${result.priority}`);

        this.testResults.push({
          test: "Task Creation and Assignment",
          status: "PASSED",
          details: {
            task_id: result.task_id,
            assigned_agent: result.assigned_agent,
            priority: result.priority,
            assignment_time: result.assignment_time,
          },
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.log("❌ Task oluşturma hatası:", error.message);
      this.testResults.push({
        test: "Task Creation and Assignment",
        status: "FAILED",
        error: error.message,
      });
    }

    console.log("");
  }

  /**
   * Test 5: Sistem Sağlığı Kontrolü
   */
  async testSystemHealth() {
    console.log("📋 Test 5: Sistem Sağlığı Kontrolü");

    try {
      const health = await this.systemController.checkSystemHealth();

      console.log(`🏥 Sistem Sağlığı: ${health.status}`);
      console.log(
        `📅 Son Kontrol: ${new Date(health.last_check).toLocaleString("tr-TR")}`
      );

      if (health.issues.length > 0) {
        console.log("⚠️  Tespit Edilen Sorunlar:");
        health.issues.forEach((issue) => {
          console.log(`   - ${issue}`);
        });
      } else {
        console.log("✅ Hiçbir sorun tespit edilmedi");
      }

      if (health.status === "healthy" || health.status === "warning") {
        this.testResults.push({
          test: "System Health",
          status: "PASSED",
          details: {
            health_status: health.status,
            issues_count: health.issues.length,
          },
        });
      } else {
        throw new Error(`Sistem sağlığı: ${health.status}`);
      }
    } catch (error) {
      console.log("❌ Sistem sağlığı kontrolü hatası:", error.message);
      this.testResults.push({
        test: "System Health",
        status: "FAILED",
        error: error.message,
      });
    }

    console.log("");
  }

  /**
   * Test 6: Sistem Durdurma
   */
  async testSystemShutdown() {
    console.log("📋 Test 6: Sistem Durdurma");

    try {
      const result = await this.systemController.shutdownSystem();

      if (result.success) {
        console.log("✅ Sistem başarıyla durduruldu");
        console.log(
          `⏱️  Toplam çalışma süresi: ${this.formatUptime(result.uptime)}`
        );

        this.testResults.push({
          test: "System Shutdown",
          status: "PASSED",
          details: {
            uptime: result.uptime,
            formatted_uptime: this.formatUptime(result.uptime),
          },
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.log("❌ Sistem durdurma hatası:", error.message);
      this.testResults.push({
        test: "System Shutdown",
        status: "FAILED",
        error: error.message,
      });
    }

    console.log("");
  }

  /**
   * Test sonuçlarını gösterir
   */
  displayTestResults() {
    console.log("📊 TEST SONUÇLARI");
    console.log("==================");

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(
      (r) => r.status === "PASSED"
    ).length;
    const failedTests = this.testResults.filter(
      (r) => r.status === "FAILED"
    ).length;

    console.log(`\n📈 Genel Durum:`);
    console.log(`   Toplam Test: ${totalTests}`);
    console.log(`   Başarılı: ${passedTests} ✅`);
    console.log(`   Başarısız: ${failedTests} ❌`);
    console.log(
      `   Başarı Oranı: ${((passedTests / totalTests) * 100).toFixed(1)}%`
    );

    console.log(`\n📋 Detaylı Sonuçlar:`);
    this.testResults.forEach((result, index) => {
      const statusIcon = result.status === "PASSED" ? "✅" : "❌";
      console.log(
        `   ${index + 1}. ${statusIcon} ${result.test}: ${result.status}`
      );

      if (result.error) {
        console.log(`      Hata: ${result.error}`);
      }

      if (result.details) {
        console.log(
          `      Detaylar: ${JSON.stringify(result.details, null, 2)}`
        );
      }
    });

    console.log(`\n🎯 Test Tamamlandı!`);

    if (failedTests === 0) {
      console.log("🎉 Tüm testler başarıyla geçti! Sistem hazır.");
    } else {
      console.log(
        "⚠️  Bazı testler başarısız oldu. Lütfen hataları kontrol edin."
      );
    }
  }

  /**
   * Uptime'ı formatlar
   */
  formatUptime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours} saat, ${minutes % 60} dakika, ${seconds % 60} saniye`;
    } else if (minutes > 0) {
      return `${minutes} dakika, ${seconds % 60} saniye`;
    } else {
      return `${seconds} saniye`;
    }
  }
}

// Test script'ini çalıştır
if (import.meta.url === `file://${process.argv[1]}`) {
  const testRunner = new MultiAgentSystemTest();
  testRunner.runAllTests().catch(console.error);
}

export default MultiAgentSystemTest;
