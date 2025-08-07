const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const ContextInjectionManager = require("./context-injection-manager.js");

class WorkflowExecutionEngine extends EventEmitter {
  constructor() {
    super();
    this.basePath = path.join(__dirname, "..");
    this.workflowPath = path.join(
      this.basePath,
      "orchestrator",
      "workflow.context7.json"
    );
    this.agentsPath = path.join(this.basePath, "agents");
    this.sharedPath = path.join(this.basePath, "shared");
    this.logsPath = path.join(this.sharedPath, "logs");
    this.tasksPath = path.join(this.sharedPath, "tasks");

    this.contextManager = new ContextInjectionManager();
    this.currentStep = 0;
    this.workflowData = null;
    this.executionHistory = [];
    this.performanceMetrics = new Map();
    this.securityAudit = [];

    this.loadWorkflow();
  }

  /**
   * Workflow verilerini yükler
   */
  async loadWorkflow() {
    try {
      if (fs.existsSync(this.workflowPath)) {
        this.workflowData = JSON.parse(
          fs.readFileSync(this.workflowPath, "utf8")
        );
        this.logExecution("workflow_loaded", {
          version: this.workflowData.version,
          steps: this.workflowData.steps.length,
          description: this.workflowData.description,
        });
      } else {
        throw new Error("Workflow dosyası bulunamadı");
      }
    } catch (error) {
      this.logError("workflow_load_error", error);
      throw error;
    }
  }

  /**
   * Workflow'u başlatır
   */
  async startWorkflow(userRequest) {
    const startTime = Date.now();

    try {
      this.logExecution("workflow_started", {
        user_request: userRequest,
        timestamp: new Date().toISOString(),
      });

      // Event emit
      this.emit("workflow_started", {
        user_request: userRequest,
        timestamp: new Date().toISOString(),
      });

      // Manager Agent'ı tetikle
      await this.triggerManagerAgent(userRequest);

      const executionTime = Date.now() - startTime;
      this.recordPerformanceMetric("workflow_execution", executionTime);

      this.logExecution("workflow_completed", {
        total_steps: this.currentStep,
        execution_time: executionTime,
        success: true,
      });

      // Event emit
      this.emit("workflow_completed", {
        total_steps: this.currentStep,
        execution_time: executionTime,
        success: true,
      });

      return {
        success: true,
        steps_completed: this.currentStep,
        execution_time: executionTime,
        final_result: this.executionHistory[this.executionHistory.length - 1],
      };
    } catch (error) {
      this.logError("workflow_execution_error", error);
      return {
        success: false,
        error: error.message,
        steps_completed: this.currentStep,
        execution_time: Date.now() - startTime,
      };
    }
  }

  /**
   * Manager Agent'ı tetikler
   */
  async triggerManagerAgent(userRequest) {
    const stepStartTime = Date.now();

    try {
      this.currentStep = 1;
      const step = this.workflowData.steps.find((s) => s.step === 1);

      this.logExecution("manager_agent_triggered", {
        step: 1,
        agent: step.agent,
        action: step.action,
        user_request: userRequest,
      });

      // Manager Agent context'ini yükle
      await this.contextManager.loadContextInjection("manager");
      await this.contextManager.mergeContextWithInjection("manager");

      // Manager Agent'ın çıktısını simüle et (gerçek implementasyonda agent çağrılır)
      const managerOutput = await this.executeManagerAgent(userRequest);

      // Performance ve security validation
      this.validateStepPerformance(step, Date.now() - stepStartTime);
      this.validateStepSecurity(step, managerOutput);

      this.executionHistory.push({
        step: 1,
        agent: "manager",
        output: managerOutput,
        timestamp: new Date().toISOString(),
      });

      // Analyst Agent'a geç
      await this.triggerAnalystAgent(managerOutput);
    } catch (error) {
      this.logError("manager_agent_error", error);
      throw error;
    }
  }

  /**
   * Analyst Agent'ı tetikler
   */
  async triggerAnalystAgent(managerOutput) {
    const stepStartTime = Date.now();

    try {
      this.currentStep = 2;
      const step = this.workflowData.steps.find((s) => s.step === 2);

      this.logExecution("analyst_agent_triggered", {
        step: 2,
        agent: step.agent,
        action: step.action,
        manager_output: managerOutput,
      });

      // Analyst Agent context'ini yükle
      await this.contextManager.loadContextInjection("analyst");
      await this.contextManager.mergeContextWithInjection("analyst");

      // Task oluştur
      const taskId = this.generateTaskId();
      const analystOutput = await this.executeAnalystAgent(
        managerOutput,
        taskId
      );

      // Task context dosyası oluştur
      await this.createTaskContext(taskId, analystOutput);

      // Performance ve security validation
      this.validateStepPerformance(step, Date.now() - stepStartTime);
      this.validateStepSecurity(step, analystOutput);

      this.executionHistory.push({
        step: 2,
        agent: "analyst",
        task_id: taskId,
        output: analystOutput,
        timestamp: new Date().toISOString(),
      });

      // Developer Agent'a geç
      await this.triggerDeveloperAgent(taskId, analystOutput);
    } catch (error) {
      this.logError("analyst_agent_error", error);
      throw error;
    }
  }

  /**
   * Developer Agent'ı tetikler
   */
  async triggerDeveloperAgent(taskId, analystOutput) {
    const stepStartTime = Date.now();

    try {
      this.currentStep = 3;
      const step = this.workflowData.steps.find((s) => s.step === 3);

      this.logExecution("developer_agent_triggered", {
        step: 3,
        agent: step.agent,
        action: step.action,
        task_id: taskId,
        analyst_output: analystOutput,
      });

      // Developer Agent context'ini yükle
      await this.contextManager.loadContextInjection("developer");
      await this.contextManager.mergeContextWithInjection("developer");

      // Task context'ini oku
      const taskContext = await this.readTaskContext(taskId);

      // Developer Agent'ı çalıştır
      const developerOutput = await this.executeDeveloperAgent(taskContext);

      // Task'ı güncelle
      await this.updateTaskStatus(taskId, "completed", developerOutput);

      // Performance ve security validation
      this.validateStepPerformance(step, Date.now() - stepStartTime);
      this.validateStepSecurity(step, developerOutput);

      this.executionHistory.push({
        step: 3,
        agent: "developer",
        task_id: taskId,
        output: developerOutput,
        timestamp: new Date().toISOString(),
      });

      // Final log ve rapor oluştur
      await this.createFinalReport(taskId, developerOutput);
    } catch (error) {
      this.logError("developer_agent_error", error);
      throw error;
    }
  }

  /**
   * Manager Agent'ı çalıştırır (simülasyon)
   */
  async executeManagerAgent(userRequest) {
    return {
      project_scope: "frontend_development",
      requirements: {
        performance: true,
        security: true,
        atomic_design: true,
        storybook: true,
      },
      priority: "high",
      estimated_complexity: "medium",
    };
  }

  /**
   * Analyst Agent'ı çalıştırır (simülasyon)
   */
  async executeAnalystAgent(managerOutput, taskId) {
    return {
      task_id: taskId,
      task_type: "component_development",
      atomic_design_level: "molecules",
      performance_requirements: [
        "React.memo kullanımı zorunlu",
        "useCallback ile fonksiyon optimizasyonu",
        "useMemo ile hesaplama optimizasyonu",
      ],
      security_requirements: [
        "XSS protection",
        "Input validation",
        "TypeScript strict mode",
      ],
      storybook_requirements: [
        "Component story oluşturma",
        "Variant'lar için story exports",
        "HTML preview generation",
      ],
      estimated_duration: "30 minutes",
      complexity_score: 7,
    };
  }

  /**
   * Developer Agent'ı çalıştırır (simülasyon)
   */
  async executeDeveloperAgent(taskContext) {
    return {
      components_created: [
        "UserCard.tsx",
        "UserCard.stories.tsx",
        "UserCard.test.tsx",
      ],
      performance_optimizations: [
        "React.memo applied",
        "useCallback implemented",
        "useMemo for expensive calculations",
      ],
      security_implementations: [
        "XSS protection added",
        "Input validation implemented",
        "TypeScript strict mode enabled",
      ],
      storybook_generated: true,
      code_quality_score: 9.5,
      completion_time: new Date().toISOString(),
    };
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
   * Task context dosyası oluşturur
   */
  async createTaskContext(taskId, analystOutput) {
    const taskContext = {
      task_id: taskId,
      created_at: new Date().toISOString(),
      status: "assigned",
      analyst_output: analystOutput,
      developer_input: null,
      completion_time: null,
      performance_metrics: {},
      security_audit: [],
    };

    const taskFile = path.join(this.tasksPath, `${taskId}.context7.json`);
    fs.writeFileSync(taskFile, JSON.stringify(taskContext, null, 2));

    this.logExecution("task_context_created", {
      task_id: taskId,
      file_path: taskFile,
    });
  }

  /**
   * Task context dosyasını okur
   */
  async readTaskContext(taskId) {
    const taskFile = path.join(this.tasksPath, `${taskId}.context7.json`);

    if (fs.existsSync(taskFile)) {
      return JSON.parse(fs.readFileSync(taskFile, "utf8"));
    } else {
      throw new Error(`Task context dosyası bulunamadı: ${taskId}`);
    }
  }

  /**
   * Task durumunu günceller
   */
  async updateTaskStatus(taskId, status, output) {
    const taskContext = await this.readTaskContext(taskId);

    taskContext.status = status;
    taskContext.developer_input = output;
    taskContext.completion_time = new Date().toISOString();

    const taskFile = path.join(this.tasksPath, `${taskId}.context7.json`);
    fs.writeFileSync(taskFile, JSON.stringify(taskContext, null, 2));

    this.logExecution("task_status_updated", {
      task_id: taskId,
      status: status,
      completion_time: taskContext.completion_time,
    });
  }

  /**
   * Final rapor oluşturur
   */
  async createFinalReport(taskId, developerOutput) {
    const report = {
      task_id: taskId,
      workflow_completed: true,
      total_steps: this.currentStep,
      execution_history: this.executionHistory,
      final_output: developerOutput,
      performance_metrics: this.getPerformanceReport(),
      security_audit: this.securityAudit,
      completion_time: new Date().toISOString(),
    };

    const reportFile = path.join(this.logsPath, `${taskId}-final-report.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    this.logExecution("final_report_created", {
      task_id: taskId,
      report_file: reportFile,
    });
  }

  /**
   * Step performance'ını doğrular
   */
  validateStepPerformance(step, executionTime) {
    const maxTime = step.performance_requirements?.timeout || 60000;

    if (executionTime > maxTime) {
      this.logError("performance_violation", {
        step: step.step,
        agent: step.agent,
        execution_time: executionTime,
        max_allowed: maxTime,
      });
    }

    this.recordPerformanceMetric(`step_${step.step}`, executionTime);
  }

  /**
   * Step security'ini doğrular
   */
  validateStepSecurity(step, output) {
    const securityRules = step.security_validation || {};

    if (securityRules.input_validation && !this.validateInput(output)) {
      this.securityAudit.push({
        step: step.step,
        agent: step.agent,
        violation: "input_validation_failed",
        timestamp: new Date().toISOString(),
      });
    }

    if (securityRules.xss_protection && !this.validateXSS(output)) {
      this.securityAudit.push({
        step: step.step,
        agent: step.agent,
        violation: "xss_protection_failed",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Input validation
   */
  validateInput(output) {
    return output && typeof output === "object";
  }

  /**
   * XSS protection validation
   */
  validateXSS(output) {
    const outputStr = JSON.stringify(output);
    const xssPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i];

    return !xssPatterns.some((pattern) => pattern.test(outputStr));
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
   * Execution log'u yazar
   */
  logExecution(event, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event,
      data: data,
      workflow_step: this.currentStep,
      version: "2.0.0",
    };

    this.writeLog("workflow-execution.log", logEntry);
  }

  /**
   * Error log'u yazar
   */
  logError(event, error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event,
      error: error.message || error,
      stack: error.stack,
      workflow_step: this.currentStep,
      version: "2.0.0",
    };

    this.writeLog("workflow-errors.log", logEntry);
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
   * Workflow durumunu alır
   */
  getWorkflowStatus() {
    return {
      current_step: this.currentStep,
      total_steps: this.workflowData?.steps?.length || 0,
      execution_history: this.executionHistory,
      performance_metrics: this.getPerformanceReport(),
      security_audit: this.securityAudit,
      is_active: this.currentStep > 0 && this.currentStep < 4,
    };
  }
}

module.exports = WorkflowExecutionEngine;
