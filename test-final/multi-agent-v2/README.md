# Multi-Agent V2 System

Geliştirilmiş AI destekli multi-agent geliştirme sistemi.

## 🚀 Yeni Özellikler

### Performance Optimization

- React.memo, useCallback, useMemo kullanımı zorunlu
- Gereksiz re-render'lar engellenir
- Memory optimization ve caching
- Bundle size optimization

### Security Enhancement

- XSS ve CSRF koruması
- Input validation zorunlu
- Code signing ve audit logging
- Hassas veriler backend'e taşınır

### Modern React Practices

- TypeScript strict mode
- Arrow function kullanımı
- Explicit return tercih edilir
- Material UI entegrasyonu

### Atomic Design V2

- Geliştirilmiş atomic design kuralları
- Otomatik story generation
- Storybook entegrasyonu
- Component library yönetimi

## 🏗️ Sistem Mimarisi

### Agent'lar

1. **Manager Agent V2** - Gelişmiş kullanıcı karşılama ve görev delegasyonu
2. **Analyst Agent V2** - Gelişmiş görev analizi ve task oluşturma
3. **Developer Agent V2** - Gelişmiş kod geliştirme, Atomic Design implementasyonu ve Storybook entegrasyonu

### Workflow

```
User Input → Manager Agent V2 → Analyst Agent V2 → Task Creation → Developer Agent V2 → Execution → Logging
```

## 📁 Dosya Yapısı

```
multi-agent-v2/
├── main.context7.json          # Proje hikayesi ve genel bilgiler
├── agents/
│   ├── managerAgent.context7.json
│   ├── analystAgent.context7.json
│   └── developerAgent.context7.json
├── orchestrator/               # Agent koordinasyonu
│   ├── workflow.context7.json
│   ├── context-injection-manager.js
│   └── README.md
├── shared/
│   ├── tasks/                  # Task context dosyaları
│   │   └── README.md
│   └── logs/                   # Shared log dosyaları
│       └── README.md
├── scripts/                    # Sistem scriptleri
│   └── status.js
└── README.md
```

## 🚀 Kullanım

### Agent Aktivasyonu

Her yeni chat başlangıcında sistem otomatik olarak devreye girer:

1. **Manager Agent V2**: Kullanıcıyı karşılar ve görevi alır
2. **Analyst Agent V2**: Görevi analiz eder ve task oluşturur
3. **Developer Agent V2**: Task'ı okur ve işlemi gerçekleştirir

### Dosya Erişim Yetkileri

Her agent'ın kendi yetki alanında dosya okuma ve yazma yetkileri vardır:

- **Manager Agent V2**: Kendi log'ları ve sistem log'ları
- **Analyst Agent V2**: Task context dosyaları, kendi log'ları, main context
- **Developer Agent V2**: Task context dosyaları, kendi log'ları, task raporları, atomic design logları, storybook logları, main context, component dosyaları

### Task Yönetimi

- Task'lar `TASK-{YEAR}-{SEQUENTIAL}` formatında oluşturulur
- Her task için context dosyası oluşturulur
- Task durumları takip edilir ve loglanır
- Performance metrics kaydedilir

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
- **atomic-design.log**: Atomic design component oluşturma logları
- **storybook-setup.log**: Storybook kurulum logları
- **story-generation.log**: Story oluşturma logları
- **task-reports.md**: Detaylı task raporları
- **performance.log**: Performance metrics
- **security-audit.log**: Security audit logları

## 🔧 Konfigürasyon

### Task Durumları

- **pending**: Bekleyen task
- **in_progress**: Devam eden task
- **completed**: Tamamlanan task
- **failed**: Başarısız task

### Performance Requirements

- **React.memo**: Tüm component'lerde kullanım zorunlu
- **useCallback**: Prop olarak fonksiyon gönderiliyorsa kullanım zorunlu
- **useMemo**: Hesaplama maliyeti yüksek işlemlerde kullanım zorunlu
- **Arrow function**: Tüm fonksiyonlar arrow function şeklinde tanımlanmalı
- **Explicit return**: Mümkünse return kullanılarak açık şekilde değer dönülmeli

### Security Requirements

- **XSS Protection**: Content-Security-Policy uygulanmalı
- **CSRF Protection**: SameSite cookies kullanılmalı
- **Input Validation**: Tüm kullanıcı girdileri doğrulanmalı
- **API Security**: Hassas veriler backend'de tutulmalı

## 📈 Monitoring

- Task completion rate
- Agent utilization
- Error tracking
- Performance metrics
- File access monitoring
- Context awareness tracking
- Atomic design compliance
- Story generation success rate
- Storybook integration status
- Security compliance rate

## 📝 Dokümantasyon

- [Tasks README](shared/tasks/README.md)
- [Logs README](shared/logs/README.md)
- [Orchestrator README](orchestrator/README.md)
- [Agent Configurations](agents/)
- [Main Context](main.context7.json)

## 🚀 Hızlı Başlangıç

### Sistem Durumu Kontrolü

```bash
node multi-agent-v2/scripts/status.js
```

### Context Injection Test

```bash
node multi-agent-v2/scripts/test-context-injection.js
```

### Story Generation

```bash
node multi-agent-v2/scripts/auto-story-generator.js
```

## 🔄 Versiyon Geçişi

### V1'den V2'ye Geçiş

1. **Performance Optimization**: Tüm component'ler React.memo ile optimize edildi
2. **Security Enhancement**: XSS ve CSRF koruması eklendi
3. **Modern React**: TypeScript strict mode ve arrow function kullanımı
4. **Atomic Design V2**: Geliştirilmiş atomic design kuralları
5. **Monitoring**: Performance ve security metrics eklendi

### Breaking Changes

- Context injection formatı güncellendi
- Agent konfigürasyonları genişletildi
- Log formatları değiştirildi
- Performance requirements eklendi

---

**Son Güncelleme:** 2025-01-27
**Versiyon:** 3.0.0
**Sistem Durumu:** Geliştirilmiş ve optimize edilmiş
