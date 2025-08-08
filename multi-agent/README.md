# Multi-Agent System

Sıfır Multi-Agent Sistemi - Temel Yapı

## 🏗️ Sistem Yapısı

```
multi-agent/
├── main.context7.json              # Ana sistem konfigürasyonu
├── agents/                         # Agent konfigürasyonları
│   ├── managerAgent.context7.json  # Manager Agent
│   ├── analystAgent.context7.json  # Analyst Agent
│   └── developerAgent.context7.json # Developer Agent
├── shared/                         # Paylaşılan dosyalar
│   ├── tasks/                      # Task dosyaları
│   ├── logs/                       # Log dosyaları
│   └── context-injection/          # Context injection dosyaları
├── orchestrator/                   # Sistem orkestrasyonu
│   └── context-injection-manager.js # Context injection yöneticisi
└── scripts/                        # Sistem scriptleri
    ├── auto-story-generator.js     # Otomatik story oluşturucu
    └── generate-story.js           # Manuel story oluşturucu
```

## 🤖 Agent'lar

### **Manager Agent**

- **Görev:** Task yönetimi ve agent koordinasyonu
- **Capabilities:** Task management, agent coordination, workflow orchestration
- **Bağımlılıklar:** Yok

### **Analyst Agent**

- **Görev:** Task analizi ve gereksinim anlama
- **Capabilities:** Task analysis, requirement understanding, complexity assessment
- **Bağımlılıklar:** Manager Agent

### **Developer Agent**

- **Görev:** Kod geliştirme ve atomic design implementasyonu
- **Capabilities:** Code generation, atomic design implementation, story generation
- **Bağımlılıklar:** Analyst Agent

## 🔄 Context Injection

Sistem, agent'ların çalışma zamanında dinamik context yüklemesi için context injection mekanizması kullanır.

### **Özellikler:**

- Otomatik context yükleme
- Veri doğrulama
- Context birleştirme
- Hata yönetimi

### **Kullanım:**

```javascript
const ContextInjectionManager = require("./orchestrator/context-injection-manager");
const manager = new ContextInjectionManager();

// Context injection yükle
await manager.loadContextInjection("developer");

// Context birleştir
await manager.mergeContextWithInjection("developer");

// Birleştirilmiş context'i al
const context = manager.getInjectedContext("developer");
```

## 🎨 Story Generation

Sistem, atomic design componentleri için otomatik story dosyası oluşturma özelliğine sahiptir.

### **Kullanım:**

```bash
# Tek component için story oluştur
node scripts/generate-story.js src/components/atoms/MyButton.tsx

# Otomatik story generation
node scripts/auto-story-generator.js --component src/components/molecules/MyCard.tsx
```

## 📊 Logging

Sistem, tüm aktiviteleri loglamak için kapsamlı bir logging sistemi kullanır.

### **Log Dosyaları:**

- `system.log` - Sistem geneli logları
- `manager-agent.log` - Manager agent logları
- `analyst-agent.log` - Analyst agent logları
- `developer-agent.log` - Developer agent logları

## 🧩 Atomic Design

Sistem, atomic design metodolojisine uygun component geliştirme destekler.

### **Seviyeler:**

- **Atoms:** Temel UI bileşenleri (Button, Input, Icon)
- **Molecules:** Atom birleşimleri (FormField, Card, SearchBar)
- **Organisms:** Sayfa parçaları (Header, Sidebar, Footer)
- **Templates:** Layout ve şablonlar (MasterPage, DashboardLayout)
- **Pages:** Tam sayfalar (HomePage, LoginPage)

## 🚀 Kullanım

### **Sistem Başlatma:**

```javascript
// Context injection yükle
const manager = new ContextInjectionManager();
await manager.loadContextInjection("developer");

// Agent'ları başlat
// Manager -> Analyst -> Developer workflow'u
```

### **Task Oluşturma:**

```javascript
// Analyst agent task oluşturur
const task = {
  id: "TASK-2025-1001",
  title: "Component Oluşturma",
  description: "Atomic design kurallarına uygun component oluştur",
  assigned_agent: "developer",
  status: "pending",
};
```

### **Component Geliştirme:**

```javascript
// Developer agent component oluşturur
// Otomatik story generation tetiklenir
await storyGenerator.generateStoryForNewComponent(componentPath);
```

## 📋 Kurallar

1. **İletişim:** Tüm agent'lar Türkçe cevap vermeli
2. **Kod Kalitesi:** Modern JavaScript/TypeScript kullanılmalı
3. **Atomic Design:** Atomic design kurallarına uyulmalı
4. **Story Generation:** Her component için story dosyası oluşturulmalı
5. **Context Injection:** Agent'lar context injection ile çalışmalı

## 🔧 Geliştirme

### **Yeni Agent Ekleme:**

1. `agents/` klasörüne agent konfigürasyonu ekle
2. `shared/context-injection/` klasörüne injection dosyası ekle
3. `orchestrator/context-injection-manager.js` dosyasını güncelle

### **Yeni Script Ekleme:**

1. `scripts/` klasörüne script dosyası ekle
2. Agent konfigürasyonlarında script path'ini güncelle

## 📝 Notlar

- Sistem %100 context injection ile çalışır
- Tüm agent'lar shared logging kullanır
- Atomic design kuralları zorunludur
- Story generation otomatiktir
- Sistem modüler ve genişletilebilir yapıdadır
