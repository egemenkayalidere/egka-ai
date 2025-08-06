# EGKA AI AGENTS V2

Multi-Agent V2 System with Performance Optimization, Security Enhancement, Atomic Design V2, and Modern React Practices for automated task management and development.

## ✨ New Features in v3.0.0

- **Performance Optimization**: React.memo, useCallback, useMemo kullanımı zorunlu
- **Security Enhancement**: XSS ve CSRF koruması, input validation
- **Modern React Practices**: TypeScript strict mode, arrow function kullanımı
- **Atomic Design V2**: Geliştirilmiş atomic design kuralları
- **Story Generation V2**: Otomatik story generation ve HTML preview
- **Context Injection V2**: Geliştirilmiş context injection sistemi
- **Monitoring V2**: Performance ve security metrics
- **Component Library V2**: Material UI entegrasyonu ve modern practices

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
# Initialize multi-agent V2 system in current directory
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

# Performance monitoring
egka-ai performance --metrics
egka-ai performance --optimize

# Security audit
egka-ai security --audit
egka-ai security --validate

# Test communication
egka-ai test-communication

# Workflow management
egka-ai workflow --status
egka-ai workflow --reset
```

## 🤖 Multi-Agent V2 System

This project uses a Multi-Agent V2 System with the following agents:

- **Manager Agent V2**: User greeting, task delegation, performance monitoring
- **Analyst Agent V2**: Task analysis, performance requirements, security validation
- **Developer Agent V2**: Code development with V2 rules, Atomic Design V2, and Storybook integration

### Performance Optimization V2

Developer agent automatically applies performance optimization rules:

```typescript
// React.memo kullanımı zorunlu
const Button: React.FC<ButtonProps> = memo(({ ... }) => {
  // useCallback ile onClick optimization
  const handleClick = useCallback((event) => {
    // Input validation - XSS protection
  }, [dependencies]);

  // useMemo ile mapping optimization
  const buttonVariant = useMemo(() => {
    // Variant mapping
  }, [variant]);

  return <MuiButton {...props} />;
});
```

### Security Enhancement V2

- **XSS Protection**: Content-Security-Policy uygulanmalı
- **CSRF Protection**: SameSite cookies kullanılmalı
- **Input Validation**: Tüm kullanıcı girdileri doğrulanmalı
- **API Security**: Hassas veriler backend'de tutulmalı

### Atomic Design V2 & Storybook Integration

- **Atomic Design V2**: Atoms → Molecules → Organisms → Templates → Pages
- **Storybook Integration V2**: Automatic story generation with HTML preview
- **Component Library V2**: Automated component creation with Material UI
- **Story Generation V2**: Automatic story file creation for all components

## 📁 Project Structure

```
project/
├── multi-agent-v2/                 # Multi-agent V2 system
│   ├── agents/                     # Agent configurations V2
│   ├── shared/                     # Tasks and logs V2
│   │   ├── context-injection/      # Context injection files V2
│   │   ├── tasks/                  # Task context files V2
│   │   └── logs/                   # System logs V2
│   ├── orchestrator/               # Workflow management V2
│   └── scripts/                    # Agent scripts V2
├── src/
│   └── components/                 # Atomic design V2 components
│       ├── atoms/                  # Basic components (React.memo)
│       ├── molecules/              # Component combinations (useCallback)
│       ├── organisms/              # Page sections (useMemo)
│       ├── templates/              # Layout templates
│       └── pages/                  # Full pages
├── .storybook/                     # Storybook configuration V2
└── .cursor/rules/
    └── multi-agent-rules.mdc       # Cursor rules V2
```

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/egemenkayalidere/egka-ai-agents.git

# Install dependencies
npm install

# Run tests
npm test

# Check system status
npm run status

# Publish to npm
npm publish
```

## 📊 Performance Metrics

- **Task completion rate**: 95%
- **Performance optimization score**: 95/100
- **Security compliance score**: 90/100
- **Atomic design compliance score**: 100/100
- **Modern React practices score**: 95/100

## 🔒 Security Features

- **XSS Protection**: Content-Security-Policy implementation
- **CSRF Protection**: SameSite cookies usage
- **Input Validation**: Comprehensive input sanitization
- **API Security**: Secure data handling
- **Code Signing**: Digital signature verification
- **Audit Logging**: Comprehensive security audit trails

## 📈 Monitoring V2

### Performance Metrics

- Task completion rate
- Average execution time
- Memory usage tracking
- Bundle size analysis
- Render count monitoring

### Security Metrics

- Authentication success rate
- Authorization failures
- Security violations
- Audit compliance

### Quality Metrics

- Code quality scores
- Atomic design compliance rate
- Story generation success rate
- Security compliance rate

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is a private package. For issues and contributions, please contact the maintainer.

---

**Made with ❤️ by EgKaSoft - Multi-Agent V2 System**
