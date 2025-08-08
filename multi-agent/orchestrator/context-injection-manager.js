#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

/**
 * Context injection manager
 * Agent'lara context injection uygular
 */
class ContextInjectionManager {
  constructor() {
    this.contextPath = path.join(__dirname, "../shared/context-injection");
  }
  
  async injectContext(agentName) {
    try {
      const contextFile = path.join(this.contextPath, `${agentName}-injection.context7.json`);
      if (await fs.pathExists(contextFile)) {
        const context = await fs.readJson(contextFile);
        return context;
      }
      return null;
    } catch (error) {
      console.error("Context injection hatası:", error.message);
      return null;
    }
  }
}

module.exports = ContextInjectionManager;
