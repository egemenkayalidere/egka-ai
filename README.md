# EGKA AI AGENTS

Multi-Agent System with Context Injection, Atomic Design, and Storybook Integration for automated task management and development.

## ✨ New Features in v1.2.0

- **Context Injection Mechanism**: Developer agent automatically loads UI architecture rules
- **Atomic Design System**: Hierarchical component structure (Atoms, Molecules, Organisms, Templates, Pages)
- **Storybook Integration**: Automatic story generation and setup
- **Component Library**: Automated component creation with Material UI
- **Multi-Project Support**: React, Next.js with consistent architecture
- **Enhanced Developer Agent**: Atomic design implementation and story generation

## 🚀 Installation

```bash
# Install globally
npm install -g @egka/egka-ai-agents

# Or use directly
npx @egka/egka-ai-agents
```

## 📦 Quick Start

```bash
# Create a new project
egka-ai create my-project

# Initialize in existing project
egka-ai init

# Check system status
egka-ai status
```

## 🛠️ Usage

### Create New Project

```bash
# Create a new project with interactive wizard
egka-ai create my-project

# Create with defaults
egka-ai create my-project --yes
```

### Initialize in Existing Project

```bash
# Initialize multi-agent system in current directory
egka-ai init
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

# Workflow management
egka-ai workflow --status
egka-ai workflow --reset

## 🤖 Multi-Agent System

This project uses a Multi-Agent System with the following agents:

- **Manager Agent**: User greeting and task delegation
- **Analyst Agent**: Task analysis and requirements gathering
- **Developer Agent**: Code development with Context Injection, Atomic Design, and Storybook integration

### Context Injection Mechanism

Developer agent automatically loads UI architecture rules from `multi-agent/shared/context-injection/developer-injection.context7.json`:

```bash
# Developer agent startup with context injection
node multi-agent/scripts/developer-agent-startup.cjs

# Test context injection mechanism
node multi-agent/scripts/test-context-injection.cjs
```

### Atomic Design & Storybook Integration

- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
- **Storybook Integration**: Automatic story generation and setup
- **Component Library**: Automated component creation with Material UI
- **Story Generation**: Automatic story file creation for all components

## 📁 Project Structure

```
project/
├── multi-agent/                    # Multi-agent system
│   ├── agents/                     # Agent configurations
│   ├── shared/                     # Tasks and logs
│   │   ├── context-injection/      # Context injection files
│   │   ├── tasks/                  # Task context files
│   │   └── logs/                   # System logs
│   ├── orchestrator/               # Workflow management
│   └── scripts/                    # Agent scripts
├── src/
│   └── components/                 # Atomic design components
│       ├── atoms/                  # Basic components
│       ├── molecules/              # Component combinations
│       ├── organisms/              # Page sections
│       ├── templates/              # Layout templates
│       └── pages/                  # Full pages
├── .storybook/                     # Storybook configuration
└── .cursor/rules/
    └── multi-agent-rules.mdc       # Cursor rules
```

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/egemenkayalidere/egka-ai-agents.git

# Install dependencies
npm install

# Run tests
npm test

# Publish to npm
npm publish
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is a private package. For issues and contributions, please contact the maintainer.

---

**Made with ❤️ by EgKaSoft**
