import EventEmitter from "events";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AgentCommunicationSystem extends EventEmitter {
  constructor() {
    super();

    this.basePath = path.join(__dirname, "..");
    this.sharedPath = path.join(this.basePath, "shared");
    this.logsPath = path.join(this.sharedPath, "logs");
    this.messagesPath = path.join(this.sharedPath, "messages");

    this.agents = new Map();
    this.messageQueue = [];
    this.messageHistory = [];
    this.activeConversations = new Map();
    this.performanceMetrics = new Map();
    this.securityAudit = [];

    this.ensureDirectories();
    this.initializeAgents();
  }

  /**
   * Gerekli dizinleri oluşturur
   */
  ensureDirectories() {
    const directories = [this.messagesPath];

    directories.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Agent'ları başlatır
   */
  initializeAgents() {
    const agentTypes = [
      "manager",
      "analyst",
      "developer",
      "task_manager",
      "system_monitor",
    ];

    agentTypes.forEach((agentType) => {
      this.agents.set(agentType, {
        id: agentType,
        status: "idle",
        lastActivity: null,
        messageCount: 0,
        performance: {
          responseTime: [],
          messageSize: [],
          errorCount: 0,
        },
      });
    });
  }

  /**
   * Agent'a mesaj gönderir
   */
  async sendMessage(
    fromAgent,
    toAgent,
    messageType,
    payload,
    priority = "normal"
  ) {
    const startTime = Date.now();

    try {
      // Mesaj doğrulaması
      this.validateMessage(fromAgent, toAgent, messageType, payload);

      // Mesaj oluştur
      const message = this.createMessage(
        fromAgent,
        toAgent,
        messageType,
        payload,
        priority
      );

      // Mesajı kuyruğa ekle
      this.messageQueue.push(message);

      // Mesaj geçmişine ekle
      this.messageHistory.push(message);

      // Agent durumunu güncelle
      this.updateAgentStatus(toAgent, "receiving");

      // Mesajı işle
      const response = await this.processMessage(message);

      // Performance metric kaydet
      const responseTime = Date.now() - startTime;
      this.recordPerformanceMetric(toAgent, "message_processing", responseTime);

      // Mesajı dosyaya kaydet
      await this.saveMessageToFile(message);

      // Event emit et
      this.emit("message_sent", {
        from: fromAgent,
        to: toAgent,
        messageType: messageType,
        timestamp: message.timestamp,
      });

      return response;
    } catch (error) {
      this.logError("message_send_error", {
        fromAgent,
        toAgent,
        messageType,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Mesaj doğrulaması yapar
   */
  validateMessage(fromAgent, toAgent, messageType, payload) {
    // Agent varlığını kontrol et
    if (!this.agents.has(fromAgent)) {
      throw new Error(`Gönderen agent bulunamadı: ${fromAgent}`);
    }

    if (!this.agents.has(toAgent)) {
      throw new Error(`Alıcı agent bulunamadı: ${toAgent}`);
    }

    // Mesaj tipini kontrol et
    const validMessageTypes = [
      "task_assignment",
      "task_completion",
      "data_request",
      "data_response",
      "status_update",
      "error_notification",
      "performance_report",
      "security_alert",
    ];

    if (!validMessageTypes.includes(messageType)) {
      throw new Error(`Geçersiz mesaj tipi: ${messageType}`);
    }

    // Payload güvenlik kontrolü
    if (payload && !this.validatePayload(payload)) {
      throw new Error("Geçersiz payload içeriği");
    }

    // XSS koruması
    if (payload && !this.validateXSS(payload)) {
      throw new Error("XSS koruması ihlali");
    }
  }

  /**
   * Payload doğrulaması
   */
  validatePayload(payload) {
    if (typeof payload !== "object" || payload === null) {
      return false;
    }

    // Hassas veri kontrolü
    const sensitiveKeys = ["password", "token", "api_key", "secret"];
    const payloadStr = JSON.stringify(payload).toLowerCase();

    for (const key of sensitiveKeys) {
      if (payloadStr.includes(key)) {
        this.securityAudit.push({
          type: "sensitive_data_detected",
          key: key,
          timestamp: new Date().toISOString(),
        });
        return false;
      }
    }

    return true;
  }

  /**
   * XSS doğrulaması
   */
  validateXSS(payload) {
    const payloadStr = JSON.stringify(payload);
    const xssPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i];

    return !xssPatterns.some((pattern) => pattern.test(payloadStr));
  }

  /**
   * Mesaj oluşturur
   */
  createMessage(fromAgent, toAgent, messageType, payload, priority) {
    return {
      id: this.generateMessageId(),
      from: fromAgent,
      to: toAgent,
      type: messageType,
      payload: payload,
      priority: priority,
      timestamp: new Date().toISOString(),
      status: "pending",
      retryCount: 0,
      maxRetries: 3,
    };
  }

  /**
   * Mesaj ID oluşturur
   */
  generateMessageId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `MSG-${timestamp}-${random}`;
  }

  /**
   * Mesajı işler
   */
  async processMessage(message) {
    const startTime = Date.now();

    try {
      // Mesaj durumunu güncelle
      message.status = "processing";

      // Agent'a mesajı gönder
      const response = await this.deliverMessageToAgent(message);

      // Mesaj durumunu güncelle
      message.status = "delivered";
      message.responseTime = Date.now() - startTime;

      // Agent mesaj sayısını artır
      this.incrementAgentMessageCount(message.to);

      // Performance metric kaydet
      this.recordPerformanceMetric(
        message.to,
        "message_delivery",
        message.responseTime
      );

      return response;
    } catch (error) {
      message.status = "failed";
      message.error = error.message;

      // Retry logic
      if (message.retryCount < message.maxRetries) {
        message.retryCount++;
        message.status = "retrying";

        this.logError("message_retry", {
          messageId: message.id,
          retryCount: message.retryCount,
          error: error.message,
        });

        // Retry after delay
        setTimeout(() => {
          this.processMessage(message);
        }, 1000 * message.retryCount);
      } else {
        this.logError("message_failed", {
          messageId: message.id,
          error: error.message,
          maxRetries: message.maxRetries,
        });
      }

      throw error;
    }
  }

  /**
   * Mesajı agent'a teslim eder
   */
  async deliverMessageToAgent(message) {
    // Agent'ın mevcut durumunu kontrol et
    const agent = this.agents.get(message.to);

    if (agent.status === "busy") {
      throw new Error(`Agent meşgul: ${message.to}`);
    }

    // Agent durumunu güncelle
    agent.status = "processing";
    agent.lastActivity = new Date().toISOString();

    // Mesaj tipine göre işlem yap
    switch (message.type) {
      case "task_assignment":
        return await this.handleTaskAssignment(message);
      case "task_completion":
        return await this.handleTaskCompletion(message);
      case "data_request":
        return await this.handleDataRequest(message);
      case "status_update":
        return await this.handleStatusUpdate(message);
      default:
        return { status: "received", messageId: message.id };
    }
  }

  /**
   * Task assignment mesajını işler
   */
  async handleTaskAssignment(message) {
    const { taskId, taskData, requirements } = message.payload;

    // Task context dosyası oluştur
    const taskContext = {
      task_id: taskId,
      assigned_to: message.to,
      assigned_by: message.from,
      assigned_at: new Date().toISOString(),
      task_data: taskData,
      requirements: requirements,
      status: "assigned",
    };

    const taskFile = path.join(this.messagesPath, `${taskId}-assignment.json`);
    fs.writeFileSync(taskFile, JSON.stringify(taskContext, null, 2));

    return {
      status: "task_assigned",
      taskId: taskId,
      assignedTo: message.to,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Task completion mesajını işler
   */
  async handleTaskCompletion(message) {
    const { taskId, result, performance, security } = message.payload;

    // Task context dosyasını güncelle
    const taskFile = path.join(this.messagesPath, `${taskId}-assignment.json`);

    if (fs.existsSync(taskFile)) {
      const taskContext = JSON.parse(fs.readFileSync(taskFile, "utf8"));
      taskContext.status = "completed";
      taskContext.completed_at = new Date().toISOString();
      taskContext.result = result;
      taskContext.performance = performance;
      taskContext.security = security;

      fs.writeFileSync(taskFile, JSON.stringify(taskContext, null, 2));
    }

    return {
      status: "task_completed",
      taskId: taskId,
      completedBy: message.from,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Data request mesajını işler
   */
  async handleDataRequest(message) {
    const { requestType, parameters } = message.payload;

    // Request log'u oluştur
    const requestLog = {
      requestId: this.generateMessageId(),
      requestType: requestType,
      parameters: parameters,
      requestedBy: message.from,
      requestedAt: new Date().toISOString(),
    };

    const requestFile = path.join(
      this.messagesPath,
      `${requestLog.requestId}-request.json`
    );
    fs.writeFileSync(requestFile, JSON.stringify(requestLog, null, 2));

    return {
      status: "data_requested",
      requestId: requestLog.requestId,
      requestType: requestType,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Status update mesajını işler
   */
  async handleStatusUpdate(message) {
    const { status, details } = message.payload;

    // Agent durumunu güncelle
    const agent = this.agents.get(message.from);
    agent.status = status;
    agent.lastActivity = new Date().toISOString();

    // Status log'u oluştur
    const statusLog = {
      agent: message.from,
      status: status,
      details: details,
      timestamp: new Date().toISOString(),
    };

    const statusFile = path.join(
      this.messagesPath,
      `${message.from}-status.json`
    );
    fs.writeFileSync(statusFile, JSON.stringify(statusLog, null, 2));

    return {
      status: "status_updated",
      agent: message.from,
      newStatus: status,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Agent durumunu günceller
   */
  updateAgentStatus(agentId, status) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastActivity = new Date().toISOString();
    }
  }

  /**
   * Agent mesaj sayısını artırır
   */
  incrementAgentMessageCount(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.messageCount++;
    }
  }

  /**
   * Performance metric kaydeder
   */
  recordPerformanceMetric(agentId, operation, duration) {
    const agent = this.agents.get(agentId);
    if (agent) {
      if (!agent.performance[operation]) {
        agent.performance[operation] = [];
      }

      agent.performance[operation].push({
        timestamp: new Date().toISOString(),
        duration: duration,
      });

      // Son 10 metric'i tut
      if (agent.performance[operation].length > 10) {
        agent.performance[operation] = agent.performance[operation].slice(-10);
      }
    }
  }

  /**
   * Mesajı dosyaya kaydeder
   */
  async saveMessageToFile(message) {
    try {
      const messageFile = path.join(this.messagesPath, `${message.id}.json`);
      fs.writeFileSync(messageFile, JSON.stringify(message, null, 2));
    } catch (error) {
      this.logError("message_save_error", {
        messageId: message.id,
        error: error.message,
      });
    }
  }

  /**
   * Broadcast mesaj gönderir
   */
  async broadcastMessage(fromAgent, messageType, payload, excludeAgent = null) {
    const responses = [];

    for (const [agentId, agent] of this.agents) {
      if (agentId !== fromAgent && agentId !== excludeAgent) {
        try {
          const response = await this.sendMessage(
            fromAgent,
            agentId,
            messageType,
            payload
          );
          responses.push({ agent: agentId, response });
        } catch (error) {
          responses.push({ agent: agentId, error: error.message });
        }
      }
    }

    return responses;
  }

  /**
   * Mesaj geçmişini alır
   */
  getMessageHistory(agentId = null, limit = 50) {
    let history = this.messageHistory;

    if (agentId) {
      history = history.filter(
        (msg) => msg.from === agentId || msg.to === agentId
      );
    }

    return history.slice(-limit);
  }

  /**
   * Agent durumlarını alır
   */
  getAgentStatuses() {
    const statuses = {};

    for (const [agentId, agent] of this.agents) {
      statuses[agentId] = {
        status: agent.status,
        lastActivity: agent.lastActivity,
        messageCount: agent.messageCount,
        performance: this.calculateAgentPerformance(agent),
      };
    }

    return statuses;
  }

  /**
   * Agent performance'ını hesaplar
   */
  calculateAgentPerformance(agent) {
    const performance = {};

    for (const [operation, measurements] of Object.entries(agent.performance)) {
      if (measurements.length > 0) {
        const durations = measurements.map((m) => m.duration);
        performance[operation] = {
          average: durations.reduce((a, b) => a + b, 0) / durations.length,
          min: Math.min(...durations),
          max: Math.max(...durations),
          count: durations.length,
        };
      }
    }

    return performance;
  }

  /**
   * Sistem durumunu alır
   */
  getSystemStatus() {
    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(
        (a) => a.status !== "idle"
      ).length,
      messageQueueLength: this.messageQueue.length,
      totalMessages: this.messageHistory.length,
      performanceMetrics: this.getPerformanceReport(),
      securityAudit: this.securityAudit.slice(-10), // Son 10 audit
    };
  }

  /**
   * Performance raporu oluşturur
   */
  getPerformanceReport() {
    const report = {};

    for (const [agentId, agent] of this.agents) {
      report[agentId] = this.calculateAgentPerformance(agent);
    }

    return report;
  }

  /**
   * Error log'u yazar
   */
  logError(event, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event,
      data: data,
      version: "2.0.0",
    };

    this.writeLog("agent-communication-errors.log", logEntry);
  }

  /**
   * Log dosyasına yazar
   */
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
    this.messageQueue = [];
    this.messageHistory = [];
    this.activeConversations.clear();
    this.performanceMetrics.clear();
    this.securityAudit = [];

    // Agent durumlarını sıfırla
    for (const [agentId, agent] of this.agents) {
      agent.status = "idle";
      agent.messageCount = 0;
      agent.performance = {
        responseTime: [],
        messageSize: [],
        errorCount: 0,
      };
    }
  }
}

export default AgentCommunicationSystem;
