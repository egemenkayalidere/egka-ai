const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const WorkflowExecutionEngine = require("./workflow-execution-engine.js");
const AgentCommunicationSystem = require("./agent-communication-system.js");
const TaskAssignmentManager = require("./task-assignment-manager.js");

class AutomaticTriggeringSystem extends EventEmitter {
  constructor() {
    super();

    this.basePath = path.join(__dirname, "..");
    this.sharedPath = path.join(this.basePath, "shared");
    this.logsPath = path.join(this.sharedPath, "logs");

    // Alt sistemleri başlat
    this.workflowEngine = new WorkflowExecutionEngine();
    this.communicationSystem = new AgentCommunicationSystem();
    this.taskManager = new TaskAssignmentManager();

    // Sistem durumu
    this.isActive = false;
    this.currentSession = null;
    this.sessionHistory = [];
    this.triggerRules = new Map();
    this.performanceMetrics = new Map();
    this.securityAudit = [];
    this.errorCount = 0;
    this.successCount = 0;

    // Event listeners
    this.setupEventListeners();
    this.initializeTriggerRules();
  }

  /**
   * Event listener'ları kurar
   */
  setupEventListeners() {
    // Workflow events
    this.workflowEngine.on("workflow_started", (data) => {
      this.logTrigger("workflow_started", data);
      this.emit("system_workflow_started", data);
    });

    this.workflowEngine.on("workflow_completed", (data) => {
      this.logTrigger("workflow_completed", data);
      this.emit("system_workflow_completed", data);
    });

    // Communication events
    this.communicationSystem.on("message_sent", (data) => {
      this.logTrigger("message_sent", data);
      this.emit("system_message_sent", data);
    });

    // Task events
    this.taskManager.on("task_assigned", (data) => {
      this.logTrigger("task_assigned", data);
      this.emit("system_task_assigned", data);
    });

    // Error handling
    this.on("error", (error) => {
      this.handleSystemError(error);
    });
  }

  /**
   * Trigger kurallarını başlatır
   */
  initializeTriggerRules() {
    // Kullanıcı isteği trigger'ı
    this.triggerRules.set("user_request", {
      condition: (input) =>
        input && typeof input === "string" && input.length > 0,
      action: async (input) => {
        return await this.handleUserRequest(input);
      },
      priority: "high",
      retryCount: 0,
      maxRetries: 3,
    });

    // Task completion trigger'ı
    this.triggerRules.set("task_completion", {
      condition: (data) => data && data.status === "completed",
      action: async (data) => {
        return await this.handleTaskCompletion(data);
      },
      priority: "normal",
      retryCount: 0,
      maxRetries: 2,
    });

    // Agent status change trigger'ı
    this.triggerRules.set("agent_status_change", {
      condition: (data) => data && data.agent && data.status,
      action: async (data) => {
        return await this.handleAgentStatusChange(data);
      },
      priority: "low",
      retryCount: 0,
      maxRetries: 1,
    });

    // Performance alert trigger'ı
    this.triggerRules.set("performance_alert", {
      condition: (data) => data && data.performance_score < 0.7,
      action: async (data) => {
        return await this.handlePerformanceAlert(data);
      },
      priority: "high",
      retryCount: 0,
      maxRetries: 2,
    });

    // Security alert trigger'ı
    this.triggerRules.set("security_alert", {
      condition: (data) => data && data.security_violation,
      action: async (data) => {
        return await this.handleSecurityAlert(data);
      },
      priority: "critical",
      retryCount: 0,
      maxRetries: 1,
    });
  }

  /**
   * Sistemi başlatır
   */
  async startSystem() {
    try {
      this.isActive = true;
      this.currentSession = this.createSession();

      this.logTrigger("system_started", {
        session_id: this.currentSession.id,
        timestamp: new Date().toISOString(),
      });

      // Alt sistemleri başlat
      await this.initializeSubsystems();

      this.emit("system_started", {
        session_id: this.currentSession.id,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        session_id: this.currentSession.id,
        message: "Multi-Agent sistemi başarıyla başlatıldı",
      };
    } catch (error) {
      this.handleSystemError(error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sistemi durdurur
   */
  async stopSystem() {
    try {
      this.isActive = false;

      // Mevcut session'ı tamamla
      if (this.currentSession) {
        this.currentSession.end_time = new Date().toISOString();
        this.sessionHistory.push(this.currentSession);
        this.currentSession = null;
      }

      this.logTrigger("system_stopped", {
        timestamp: new Date().toISOString(),
      });

      this.emit("system_stopped", {
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: "Multi-Agent sistemi durduruldu",
      };
    } catch (error) {
      this.handleSystemError(error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Alt sistemleri başlatır
   */
  async initializeSubsystems() {
    // Communication system'i başlat
    await this.communicationSystem.ensureDirectories();

    // Task manager'ı başlat
    await this.taskManager.ensureDirectories();

    // Workflow engine'i başlat
    await this.workflowEngine.loadWorkflow();
  }

  /**
   * Session oluşturur
   */
  createSession() {
    return {
      id: this.generateSessionId(),
      start_time: new Date().toISOString(),
      end_time: null,
      status: "active",
      triggers_executed: 0,
      errors_encountered: 0,
      performance_metrics: {},
      security_audit: [],
    };
  }

  /**
   * Session ID oluşturur
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `SESSION-${timestamp}-${random}`;
  }

  /**
   * Kullanıcı isteğini işler
   */
  async handleUserRequest(userRequest) {
    const startTime = Date.now();

    try {
      // Input doğrulaması
      this.validateUserInput(userRequest);

      // Workflow'u başlat
      const workflowResult = await this.workflowEngine.startWorkflow(
        userRequest
      );

      // Performance metric kaydet
      const processingTime = Date.now() - startTime;
      this.recordPerformanceMetric("user_request_processing", processingTime);

      // Başarı sayacını artır
      this.successCount++;

      this.logTrigger("user_request_processed", {
        user_request: userRequest,
        workflow_result: workflowResult,
        processing_time: processingTime,
      });

      return {
        success: true,
        workflow_result: workflowResult,
        processing_time: processingTime,
      };
    } catch (error) {
      this.handleSystemError(error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Task completion'ı işler
   */
  async handleTaskCompletion(taskData) {
    try {
      // Task durumunu güncelle
      await this.taskManager.updateTaskStatus(taskData.taskId, "completed", {
        result: taskData.result,
        performance: taskData.performance,
        security: taskData.security,
      });

      // Completion mesajı gönder
      await this.communicationSystem.sendMessage(
        "task_manager",
        taskData.assignedAgent,
        "task_completion",
        {
          taskId: taskData.taskId,
          result: taskData.result,
          performance: taskData.performance,
          security: taskData.security,
        }
      );

      this.logTrigger("task_completion_processed", {
        task_id: taskData.taskId,
        assigned_agent: taskData.assignedAgent,
      });

      return { success: true };
    } catch (error) {
      this.handleSystemError(error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Agent status change'i işler
   */
  async handleAgentStatusChange(statusData) {
    try {
      // Status update mesajı gönder
      await this.communicationSystem.sendMessage(
        "system_monitor",
        statusData.agent,
        "status_update",
        {
          status: statusData.status,
          details: statusData.details,
        }
      );

      this.logTrigger("agent_status_change_processed", {
        agent: statusData.agent,
        status: statusData.status,
      });

      return { success: true };
    } catch (error) {
      this.handleSystemError(error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Performance alert'i işler
   */
  async handlePerformanceAlert(alertData) {
    try {
      // Performance optimization mesajı gönder
      await this.communicationSystem.broadcastMessage(
        "system_monitor",
        "performance_alert",
        {
          alert_type: "performance_degradation",
          performance_score: alertData.performance_score,
          recommendations: alertData.recommendations,
        }
      );

      this.logTrigger("performance_alert_processed", {
        performance_score: alertData.performance_score,
        alert_type: "performance_degradation",
      });

      return { success: true };
    } catch (error) {
      this.handleSystemError(error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Security alert'i işler
   */
  async handleSecurityAlert(alertData) {
    try {
      // Security alert mesajı gönder
      await this.communicationSystem.broadcastMessage(
        "system_monitor",
        "security_alert",
        {
          alert_type: "security_violation",
          violation_type: alertData.violation_type,
          severity: alertData.severity,
          action_required: alertData.action_required,
        }
      );

      // Security audit'e ekle
      this.securityAudit.push({
        type: "security_alert",
        violation_type: alertData.violation_type,
        severity: alertData.severity,
        timestamp: new Date().toISOString(),
      });

      this.logTrigger("security_alert_processed", {
        violation_type: alertData.violation_type,
        severity: alertData.severity,
      });

      return { success: true };
    } catch (error) {
      this.handleSystemError(error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger'ı çalıştırır
   */
  async executeTrigger(triggerType, input) {
    const startTime = Date.now();

    try {
      const rule = this.triggerRules.get(triggerType);

      if (!rule) {
        throw new Error(`Bilinmeyen trigger tipi: ${triggerType}`);
      }

      // Koşul kontrolü
      if (!rule.condition(input)) {
        return {
          success: false,
          reason: "condition_not_met",
          trigger_type: triggerType,
        };
      }

      // Action'ı çalıştır
      const result = await rule.action(input);

      // Performance metric kaydet
      const executionTime = Date.now() - startTime;
      this.recordPerformanceMetric(`trigger_${triggerType}`, executionTime);

      // Session'a ekle
      if (this.currentSession) {
        this.currentSession.triggers_executed++;
      }

      this.logTrigger("trigger_executed", {
        trigger_type: triggerType,
        input: input,
        result: result,
        execution_time: executionTime,
      });

      return {
        success: true,
        trigger_type: triggerType,
        result: result,
        execution_time: executionTime,
      };
    } catch (error) {
      this.handleSystemError(error);

      // Retry logic
      const rule = this.triggerRules.get(triggerType);
      if (rule && rule.retryCount < rule.maxRetries) {
        rule.retryCount++;

        this.logTrigger("trigger_retry", {
          trigger_type: triggerType,
          retry_count: rule.retryCount,
          error: error.message,
        });

        // Retry after delay
        setTimeout(() => {
          this.executeTrigger(triggerType, input);
        }, 1000 * rule.retryCount);
      }

      return {
        success: false,
        trigger_type: triggerType,
        error: error.message,
      };
    }
  }

  /**
   * Kullanıcı input'unu doğrular
   */
  validateUserInput(input) {
    if (!input || typeof input !== "string") {
      throw new Error("Geçersiz kullanıcı input'u");
    }

    if (input.length < 3) {
      throw new Error("Kullanıcı input'u çok kısa");
    }

    if (input.length > 10000) {
      throw new Error("Kullanıcı input'u çok uzun");
    }

    // XSS kontrolü
    if (!this.validateXSS(input)) {
      throw new Error("XSS koruması ihlali");
    }
  }

  /**
   * XSS doğrulaması
   */
  validateXSS(input) {
    const xssPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i];
    return !xssPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Sistem hatasını işler
   */
  handleSystemError(error) {
    this.errorCount++;

    if (this.currentSession) {
      this.currentSession.errors_encountered++;
    }

    this.logError("system_error", {
      error: error.message,
      stack: error.stack,
      error_count: this.errorCount,
    });

    this.emit("system_error", {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
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
   * Sistem durumunu alır
   */
  getSystemStatus() {
    return {
      is_active: this.isActive,
      current_session: this.currentSession,
      total_sessions: this.sessionHistory.length,
      success_count: this.successCount,
      error_count: this.errorCount,
      success_rate:
        this.successCount / (this.successCount + this.errorCount) || 0,
      performance_metrics: this.getPerformanceReport(),
      security_audit: this.securityAudit.slice(-10),
      subsystems: {
        workflow_engine: this.workflowEngine.getWorkflowStatus(),
        communication_system: this.communicationSystem.getSystemStatus(),
        task_manager: this.taskManager.getSystemStatus(),
      },
    };
  }

  /**
   * Session geçmişini alır
   */
  getSessionHistory(limit = 10) {
    return this.sessionHistory.slice(-limit);
  }

  /**
   * Trigger kurallarını alır
   */
  getTriggerRules() {
    const rules = {};

    for (const [triggerType, rule] of this.triggerRules) {
      rules[triggerType] = {
        priority: rule.priority,
        retryCount: rule.retryCount,
        maxRetries: rule.maxRetries,
      };
    }

    return rules;
  }

  /**
   * Logging fonksiyonları
   */
  logTrigger(event, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event,
      data: data,
      session_id: this.currentSession?.id,
      version: "2.0.0",
    };

    this.writeLog("automatic-triggering.log", logEntry);
  }

  logError(event, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event,
      data: data,
      session_id: this.currentSession?.id,
      version: "2.0.0",
    };

    this.writeLog("automatic-triggering-errors.log", logEntry);
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
    this.isActive = false;
    this.currentSession = null;
    this.sessionHistory = [];
    this.performanceMetrics.clear();
    this.securityAudit = [];
    this.errorCount = 0;
    this.successCount = 0;

    // Alt sistemleri temizle
    this.communicationSystem.cleanup();
  }
}

module.exports = AutomaticTriggeringSystem;
