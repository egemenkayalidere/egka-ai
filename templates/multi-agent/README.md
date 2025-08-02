# Multi-Agent System

Otomatik görev yönetimi ve geliştirme için multi-agent sistemi.

## 🏗️ Sistem Mimarisi

### Agent'lar

1. **Manager Agent** - Kullanıcı karşılama ve görev delegasyonu
2. **Analyst Agent** - Görev analizi ve task oluşturma
3. **Developer Agent** - Kod geliştirme ve implementasyon

### Workflow

```
User Input → Manager Agent → Analyst Agent → Task Creation → Developer Agent → Execution → Logging
```

## 📁 Dosya Yapısı

```
multi-agent/
├── main.context7.json          # Proje hikayesi ve genel bilgiler
├── agents/
│   ├── managerAgent.context7.json
│   ├── analystAgent.context7.json
│   └── developerAgent.context7.json
├── orchestrator/               # Agent koordinasyonu
│   ├── workflow.context7.json
│   └── README.md
├── shared/
│   ├── tasks/                  # Task context dosyaları
│   │   └── README.md
│   └── logs/                   # Shared log dosyaları
│       ├── README.md
│       └── task-reports.md     # Detaylı task raporları
└── README.md
```

## 🚀 Kullanım

### Agent Aktivasyonu

Her yeni chat başlangıcında sistem otomatik olarak devreye girer:

1. **Manager Agent**: Kullanıcıyı karşılar ve görevi alır
2. **Analyst Agent**: Görevi analiz eder ve task oluşturur
3. **Developer Agent**: Task'ı okur ve işlemi gerçekleştirir

### Dosya Erişim Yetkileri

Her agent'ın kendi yetki alanında dosya okuma ve yazma yetkileri vardır:

- **Manager Agent**: Kendi log'ları ve sistem log'ları
- **Analyst Agent**: Task context dosyaları, kendi log'ları, main context
- **Developer Agent**: Task context dosyaları, kendi log'ları, task raporları, main context

### Task Yönetimi

- Task'lar `TASK-{YEAR}-{SEQUENTIAL}` formatında oluşturulur
- Her task için context dosyası oluşturulur
- Task durumları takip edilir ve loglanır

## 📊 Task Yönetimi

### Task ID Formatı

```
TASK-{YEAR}-{SEQUENTIAL}
Örnek: TASK-2025-1000
```

### Context Dosyaları

- **main.context7.json**: Proje hikayesi ve sistem kuralları
- **TASK-XXXX-XXXX.context7.json**: Her task için detaylı context
- **workflow.context7.json**: Workflow durumları ve geçişler

### Log Formatı

- **system.log**: Sistem geneli aktiviteler
- **manager-agent.log**: Manager agent aktiviteleri
- **analyst-agent.log**: Analyst agent aktiviteleri
- **developer-agent.log**: Developer agent aktiviteleri
- **task-reports.md**: Detaylı task raporları

## 🔧 Konfigürasyon

### Task Durumları

- **pending**: Bekleyen task
- **in_progress**: Devam eden task
- **completed**: Tamamlanan task
- **failed**: Başarısız task

## 📈 Monitoring

- Task completion rate
- Agent utilization
- Error tracking
- Performance metrics
- File access monitoring
- Context awareness tracking

## 📝 Dokümantasyon

- [Tasks README](shared/tasks/README.md)
- [Logs README](shared/logs/README.md)
- [Orchestrator README](orchestrator/README.md)
- [Agent Configurations](agents/)
- [Main Context](main.context7.json)

---

**Son Güncelleme:** 2025-01-27
**Versiyon:** 3.0.0
**Sistem Durumu:** Güçlendirilmiş ve genişletilmiş
