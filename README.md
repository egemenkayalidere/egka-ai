# EGKA AI AGENTS

Multi-Agent System for automated task management and development.

## 🚀 Installation

```bash
# Install from GitHub Packages
npm install @egkasoft/egka-ai-agents

# Or install globally
npm install -g @egkasoft/egka-ai-agents
```

## 📦 Setup

First, you need to configure npm to use GitHub Packages:

1. Create a GitHub Personal Access Token with `read:packages` scope
2. Create `.npmrc` file in your home directory:

```bash
echo "@egkasoft:registry=https://npm.pkg.github.com" > ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```

## 🛠️ Usage

### Initialize Multi-Agent System

```bash
# Initialize in current directory
egka-ai init

# Follow the prompts to set up your project
```

### Available Commands

```bash
# Show system status
egka-ai status

# Task management
egka-ai task --create
egka-ai task --list
egka-ai task --status TASK-2025-1001

# Agent management
egka-ai agent --list
egka-ai agent --status managerAgent

# Log management
egka-ai log --system
egka-ai log --agent managerAgent

# Test communication
egka-ai test-communication
```

## 🤖 Multi-Agent System

This project uses a Multi-Agent System with the following agents:

- **Manager Agent**: User greeting and task delegation
- **Analyst Agent**: Task analysis and requirements gathering
- **Developer Agent**: Code development and implementation
- **Backend Agent**: API and database operations

## 📁 Project Structure

```
project/
├── multi-agent/                    # Multi-agent system
│   ├── agents/                     # Agent configurations
│   ├── shared/                     # Tasks and logs
│   └── orchestrator/               # Workflow management
└── .cursor/rules/
    └── multi-agent-rules.mdc       # Cursor rules
```

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/egkasoft/egka-ai-agents.git

# Install dependencies
npm install

# Run tests
npm test

# Publish to GitHub Packages
npm publish
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is a private package. For issues and contributions, please contact the maintainer.

---

**Made with ❤️ by EgKaSoft**
