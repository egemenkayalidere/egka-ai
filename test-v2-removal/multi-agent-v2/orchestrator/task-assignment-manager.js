const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const AgentCommunicationSystemV2 = require("./agent-communication-system.js");

class TaskAssignmentManagerV2 extends EventEmitter {
  constructor() {
    super();
    this.basePath = path.join(__dirname, "..");
    this.sharedPath = path.join(this.basePath, "shared");
    this.tasksPath = path.join(this.sharedPath, "tasks");
    this.logsPath = path.join(this.sharedPath, "logs");

    this.communicationSystem = new AgentCommunicationSystemV2();
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.completedTasks = new Map();
    this.agentWorkloads = new Map();
    this.taskPriorities = new Map();
    this.performanceMetrics = new Map();
    this.securityAudit = [];

    this.ensureDirectories();
    this.initializeAgentWorkloads();
    this.loadExistingTasks();
  }

  /**
   * Gerekli dizinleri oluşturur
   */
  ensureDirectories() {
    const directories = [this.tasksPath];

    directories.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Agent workload'larını başlatır
   */
  initializeAgentWorkloads() {
    const agentTypes = ["manager", "analyst", "developer"];

    agentTypes.forEach((agentType) => {
      this.agentWorkloads.set(agentType, {
        currentTasks: 0,
        maxCapacity: this.getAgentCapacity(agentType),
        specializations: this.getAgentSpecializations(agentType),
        performance: {
          completionRate: 0,
          averageTime: 0,
          successRate: 0,
        },
        availability: true,
      });
    });
  }

  /**
   * Agent kapasitesini belirler
   */
  getAgentCapacity(agentType) {
    const capacities = {
      manager: 5, // Aynı anda 5 task yönetebilir
      analyst: 3, // Aynı anda 3 task analiz edebilir
      developer: 2, // Aynı anda 2 task geliştirebilir
    };

    return capacities[agentType] || 1;
  }

  /**
   * Agent uzmanlık alanlarını belirler
   */
  getAgentSpecializations(agentType) {
    const specializations = {
      manager: [
        "project_management",
        "workflow_orchestration",
        "resource_allocation",
      ],
      analyst: [
        "requirements_analysis",
        "task_planning",
        "complexity_assessment",
      ],
      developer: [
        "frontend_development",
        "component_creation",
        "performance_optimization",
      ],
    };

    return specializations[agentType] || [];
  }

  /**
   * Mevcut task'ları yükler
   */
  loadExistingTasks() {
    try {
      if (fs.existsSync(this.tasksPath)) {
        const taskFiles = fs
          .readdirSync(this.tasksPath)
          .filter((file) => file.endsWith(".context7.json"));

        taskFiles.forEach((file) => {
          const taskData = JSON.parse(
            fs.readFileSync(path.join(this.tasksPath, file), "utf8")
          );
          const taskId = taskData.task_id;

          if (taskData.status === "active" || taskData.status === "assigned") {
            this.activeTasks.set(taskId, taskData);
          } else if (taskData.status === "completed") {
            this.completedTasks.set(taskId, taskData);
          }
        });
      }
    } catch (error) {
      this.logError("load_existing_tasks_error", error);
    }
  }

  /**
   * Yeni task oluşturur ve atar
   */
  async createAndAssignTask(taskData, priority = "normal") {
    const startTime = Date.now();

    try {
      // Task doğrulaması
      this.validateTaskData(taskData);

      // Task ID oluştur
      const taskId = this.generateTaskId();

      // Task önceliğini belirle
      const calculatedPriority = this.calculateTaskPriority(taskData, priority);

      // En uygun agent'ı seç
      const assignedAgent = await this.selectBestAgent(
        taskData,
        calculatedPriority
      );

      // Task context'ini oluştur
      const taskContext = this.createTaskContext(
        taskId,
        taskData,
        assignedAgent,
        calculatedPriority
      );

      // Task'ı kuyruğa ekle
      this.taskQueue.push({
        taskId,
        priority: calculatedPriority,
        timestamp: new Date().toISOString(),
      });

      // Task'ı aktif task'lara ekle
      this.activeTasks.set(taskId, taskContext);

      // Agent workload'unu güncelle
      this.updateAgentWorkload(assignedAgent, 1);

      // Task'ı dosyaya kaydet
      await this.saveTaskToFile(taskId, taskContext);

      // Agent'a task assignment mesajı gönder
      await this.communicationSystem.sendMessage(
        "task_manager",
        assignedAgent,
        "task_assignment",
        {
          taskId: taskId,
          taskData: taskData,
          requirements: taskContext.requirements,
          priority: calculatedPriority,
        },
        calculatedPriority
      );

      // Performance metric kaydet
      const assignmentTime = Date.now() - startTime;
      this.recordPerformanceMetric("task_assignment", assignmentTime);

      this.logTaskAssignment(taskId, assignedAgent, calculatedPriority);

      // Event emit
      this.emit("task_assigned", {
        taskId: taskId,
        assignedAgent: assignedAgent,
        priority: calculatedPriority,
        assignmentTime: assignmentTime,
      });

      return {
        taskId: taskId,
        assignedAgent: assignedAgent,
        priority: calculatedPriority,
        status: "assigned",
        assignmentTime: assignmentTime,
      };
    } catch (error) {
      this.logError("task_assignment_error", {
        taskData: taskData,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Task verilerini doğrular
   */
  validateTaskData(taskData) {
    const requiredFields = ["type", "description", "requirements"];

    for (const field of requiredFields) {
      if (!taskData[field]) {
        throw new Error(`Eksik alan: ${field}`);
      }
    }

    // Task tipini kontrol et
    const validTaskTypes = [
      "component_development",
      "bug_fix",
      "feature_implementation",
      "performance_optimization",
      "security_enhancement",
      "testing",
      "documentation",
    ];

    if (!validTaskTypes.includes(taskData.type)) {
      throw new Error(`Geçersiz task tipi: ${taskData.type}`);
    }

    // Güvenlik kontrolü
    if (!this.validateTaskSecurity(taskData)) {
      throw new Error("Task güvenlik doğrulaması başarısız");
    }
  }

  /**
   * Task güvenlik doğrulaması
   */
  validateTaskSecurity(taskData) {
    const taskStr = JSON.stringify(taskData).toLowerCase();

    // Hassas veri kontrolü
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /api_key/i,
      /secret/i,
      /private_key/i,
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(taskStr)) {
        this.securityAudit.push({
          type: "sensitive_data_in_task",
          pattern: pattern.toString(),
          timestamp: new Date().toISOString(),
        });
        return false;
      }
    }

    return true;
  }

  /**
   * Task önceliğini hesaplar
   */
  calculateTaskPriority(taskData, basePriority) {
    let priority = this.getPriorityScore(basePriority);

    // Task tipine göre öncelik artırımı
    const typePriorities = {
      bug_fix: 2,
      security_enhancement: 3,
      performance_optimization: 1,
      feature_implementation: 0,
      component_development: 0,
      testing: -1,
      documentation: -2,
    };

    priority += typePriorities[taskData.type] || 0;

    // Aciliyet kontrolü
    if (taskData.urgency === "high") {
      priority += 2;
    } else if (taskData.urgency === "medium") {
      priority += 1;
    }

    // Karmaşıklık kontrolü
    if (taskData.complexity === "high") {
      priority += 1;
    }

    return Math.max(1, Math.min(10, priority)); // 1-10 arası
  }

  /**
   * Öncelik skorunu alır
   */
  getPriorityScore(priority) {
    const scores = {
      critical: 8,
      high: 6,
      normal: 4,
      low: 2,
      minimal: 1,
    };

    return scores[priority] || 4;
  }

  /**
   * En uygun agent'ı seçer
   */
  async selectBestAgent(taskData, priority) {
    const availableAgents = [];

    for (const [agentId, workload] of this.agentWorkloads) {
      if (this.isAgentAvailable(agentId, workload)) {
        const score = this.calculateAgentScore(
          agentId,
          workload,
          taskData,
          priority
        );
        availableAgents.push({ agentId, score, workload });
      }
    }

    if (availableAgents.length === 0) {
      throw new Error("Uygun agent bulunamadı");
    }

    // En yüksek skora sahip agent'ı seç
    availableAgents.sort((a, b) => b.score - a.score);

    return availableAgents[0].agentId;
  }

  /**
   * Agent'ın müsait olup olmadığını kontrol eder
   */
  isAgentAvailable(agentId, workload) {
    return (
      workload.availability && workload.currentTasks < workload.maxCapacity
    );
  }

  /**
   * Agent skorunu hesaplar
   */
  calculateAgentScore(agentId, workload, taskData, priority) {
    let score = 0;

    // Uzmanlık uyumu
    const specializationMatch = this.calculateSpecializationMatch(
      agentId,
      taskData
    );
    score += specializationMatch * 3;

    // Workload dengesi
    const workloadBalance =
      (workload.maxCapacity - workload.currentTasks) / workload.maxCapacity;
    score += workloadBalance * 2;

    // Performance geçmişi
    score += workload.performance.successRate * 2;

    // Öncelik uyumu
    if (priority >= 7) {
      // Yüksek öncelikli task'lar için deneyimli agent'ları tercih et
      score += workload.performance.completionRate;
    }

    return score;
  }

  /**
   * Uzmanlık uyumunu hesaplar
   */
  calculateSpecializationMatch(agentId, taskData) {
    const agentSpecializations =
      this.agentWorkloads.get(agentId).specializations;
    const taskKeywords = this.extractTaskKeywords(taskData);

    let matches = 0;

    for (const keyword of taskKeywords) {
      if (agentSpecializations.some((spec) => spec.includes(keyword))) {
        matches++;
      }
    }

    return matches / taskKeywords.length;
  }

  /**
   * Task'tan anahtar kelimeleri çıkarır
   */
  extractTaskKeywords(taskData) {
    const text = `${taskData.description} ${taskData.type}`.toLowerCase();
    const keywords = [];

    const commonKeywords = [
      "component",
      "development",
      "frontend",
      "react",
      "performance",
      "security",
      "bug",
      "fix",
      "feature",
      "testing",
      "documentation",
      "optimization",
      "enhancement",
      "implementation",
    ];

    for (const keyword of commonKeywords) {
      if (text.includes(keyword)) {
        keywords.push(keyword);
      }
    }

    return keywords.length > 0 ? keywords : ["general"];
  }

  /**
   * Task context'ini oluşturur
   */
  createTaskContext(taskId, taskData, assignedAgent, priority) {
    return {
      task_id: taskId,
      created_at: new Date().toISOString(),
      assigned_at: new Date().toISOString(),
      assigned_to: assignedAgent,
      status: "assigned",
      priority: priority,
      type: taskData.type,
      description: taskData.description,
      requirements: taskData.requirements,
      complexity: taskData.complexity || "medium",
      urgency: taskData.urgency || "normal",
      estimated_duration: taskData.estimated_duration || "1 hour",
      actual_duration: null,
      completion_time: null,
      performance_metrics: {},
      security_audit: [],
      progress: 0,
      checkpoints: [],
      dependencies: taskData.dependencies || [],
      tags: taskData.tags || [],
    };
  }

  /**
   * Agent workload'unu günceller
   */
  updateAgentWorkload(agentId, change) {
    const workload = this.agentWorkloads.get(agentId);
    if (workload) {
      workload.currentTasks = Math.max(0, workload.currentTasks + change);
    }
  }

  /**
   * Task'ı dosyaya kaydeder
   */
  async saveTaskToFile(taskId, taskContext) {
    try {
      const taskFile = path.join(this.tasksPath, `${taskId}.context7.json`);
      fs.writeFileSync(taskFile, JSON.stringify(taskContext, null, 2));
    } catch (error) {
      this.logError("task_save_error", {
        taskId: taskId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Task durumunu günceller
   */
  async updateTaskStatus(taskId, status, additionalData = {}) {
    try {
      const taskContext = this.activeTasks.get(taskId);

      if (!taskContext) {
        throw new Error(`Task bulunamadı: ${taskId}`);
      }

      // Durumu güncelle
      taskContext.status = status;
      taskContext.last_updated = new Date().toISOString();

      // Ek verileri ekle
      Object.assign(taskContext, additionalData);

      // Tamamlanma durumunda
      if (status === "completed") {
        taskContext.completion_time = new Date().toISOString();
        taskContext.progress = 100;

        // Aktif task'lardan çıkar, tamamlanan task'lara ekle
        this.activeTasks.delete(taskId);
        this.completedTasks.set(taskId, taskContext);

        // Agent workload'unu güncelle
        this.updateAgentWorkload(taskContext.assigned_to, -1);

        // Performance metric'leri güncelle
        this.updateAgentPerformance(taskContext.assigned_to, taskContext);
      }

      // Dosyayı güncelle
      await this.saveTaskToFile(taskId, taskContext);

      this.logTaskStatusUpdate(taskId, status, additionalData);

      return taskContext;
    } catch (error) {
      this.logError("task_status_update_error", {
        taskId: taskId,
        status: status,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Agent performance'ını günceller
   */
  updateAgentPerformance(agentId, taskContext) {
    const workload = this.agentWorkloads.get(agentId);
    if (workload) {
      // Tamamlanma süresini hesapla
      const startTime = new Date(taskContext.assigned_at);
      const endTime = new Date(taskContext.completion_time);
      const duration = (endTime - startTime) / 1000 / 60; // dakika cinsinden

      // Performance metric'leri güncelle
      if (!workload.performance.completionTimes) {
        workload.performance.completionTimes = [];
      }

      workload.performance.completionTimes.push(duration);

      // Son 10 task'ın ortalamasını al
      if (workload.performance.completionTimes.length > 10) {
        workload.performance.completionTimes =
          workload.performance.completionTimes.slice(-10);
      }

      workload.performance.averageTime =
        workload.performance.completionTimes.reduce((a, b) => a + b, 0) /
        workload.performance.completionTimes.length;
      workload.performance.completionRate =
        workload.performance.completionRate * 0.9 + 0.1; // Başarılı tamamlanma
    }
  }

  /**
   * Task progress'ini günceller
   */
  async updateTaskProgress(taskId, progress, checkpoint = null) {
    try {
      const taskContext = this.activeTasks.get(taskId);

      if (!taskContext) {
        throw new Error(`Task bulunamadı: ${taskId}`);
      }

      taskContext.progress = Math.max(0, Math.min(100, progress));
      taskContext.last_updated = new Date().toISOString();

      if (checkpoint) {
        taskContext.checkpoints.push({
          progress: progress,
          description: checkpoint,
          timestamp: new Date().toISOString(),
        });
      }

      await this.saveTaskToFile(taskId, taskContext);

      this.logTaskProgress(taskId, progress, checkpoint);
    } catch (error) {
      this.logError("task_progress_update_error", {
        taskId: taskId,
        progress: progress,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Task ID oluşturur
   */
  generateTaskId() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `TASK-${year}-${randomNum}`;
  }

  /**
   * Aktif task'ları alır
   */
  getActiveTasks(agentId = null) {
    if (agentId) {
      return Array.from(this.activeTasks.values()).filter(
        (task) => task.assigned_to === agentId
      );
    }

    return Array.from(this.activeTasks.values());
  }

  /**
   * Tamamlanan task'ları alır
   */
  getCompletedTasks(agentId = null, limit = 50) {
    let tasks = Array.from(this.completedTasks.values());

    if (agentId) {
      tasks = tasks.filter((task) => task.assigned_to === agentId);
    }

    return tasks.slice(-limit);
  }

  /**
   * Task kuyruğunu alır
   */
  getTaskQueue() {
    return this.taskQueue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Agent workload'larını alır
   */
  getAgentWorkloads() {
    return Object.fromEntries(this.agentWorkloads);
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
   * Logging fonksiyonları
   */
  logTaskAssignment(taskId, assignedAgent, priority) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: "task_assigned",
      task_id: taskId,
      assigned_agent: assignedAgent,
      priority: priority,
      version: "2.0.0",
    };

    this.writeLog("task-assignment.log", logEntry);
  }

  logTaskStatusUpdate(taskId, status, additionalData) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: "task_status_updated",
      task_id: taskId,
      status: status,
      additional_data: additionalData,
      version: "2.0.0",
    };

    this.writeLog("task-status.log", logEntry);
  }

  logTaskProgress(taskId, progress, checkpoint) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: "task_progress_updated",
      task_id: taskId,
      progress: progress,
      checkpoint: checkpoint,
      version: "2.0.0",
    };

    this.writeLog("task-progress.log", logEntry);
  }

  logError(event, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event,
      data: data,
      version: "2.0.0",
    };

    this.writeLog("task-assignment-errors.log", logEntry);
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
   * Sistem durumunu alır
   */
  getSystemStatus() {
    return {
      totalActiveTasks: this.activeTasks.size,
      totalCompletedTasks: this.completedTasks.size,
      queueLength: this.taskQueue.length,
      agentWorkloads: this.getAgentWorkloads(),
      performanceMetrics: this.getPerformanceReport(),
      securityAudit: this.securityAudit.slice(-10),
    };
  }
}

module.exports = TaskAssignmentManagerV2;
