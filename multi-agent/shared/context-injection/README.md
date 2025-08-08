# Context Injection Mekanizması

Bu mekanizma, developer agent'ın her çalışmaya başladığında belirli bir context7 dosyasını otomatik olarak okumasını ve uygulamasını sağlar.

## 🎯 Amaç

Developer agent'ın her işe başlarken:

- Belirli context7 verilerini otomatik olarak yüklemesi
- Bu verileri mevcut context ile birleştirmesi
- Global ayarları uygulaması
- Proje konfigürasyonlarını hazır tutması

## 📁 Dosya Yapısı

```
multi-agent/
├── shared/
│   └── context-injection/
│       ├── developer-injection.context7.json    # Developer agent injection
│       └── README.md                            # Bu dosya
├── orchestrator/
│   └── context-injection-manager.js             # Injection yöneticisi
└── scripts/
    ├── developer-agent-startup.js               # Startup script'i
    └── test-context-injection.js                # Test script'i
```

## 🚀 Kullanım

### 1. Developer Agent'ı Başlatma

```bash
# Developer agent'ı context injection ile başlat
node multi-agent/scripts/developer-agent-startup.js
```

### 2. Context Injection Test Etme

```bash
# Tüm injection testlerini çalıştır
node multi-agent/scripts/test-context-injection.js
```

### 3. Injection Dosyasını Güncelleme

```javascript
const DeveloperAgentStartup = require("./multi-agent/scripts/developer-agent-startup");

const startup = new DeveloperAgentStartup();

// Yeni context verilerini ekle
await startup.updateInjection({
  global_settings: {
    new_setting: "value",
  },
  project_configs: {
    new_project: {
      framework: "new_framework",
    },
  },
});
```

## 📋 Injection Dosya Formatı

```json
{
  "name": "Developer Agent Context Injection",
  "version": "1.0.0",
  "description": "Context injection mechanism for Developer Agent",
  "type": "context_injection",
  "injection_config": {
    "target_agent": "developer_agent",
    "auto_load": true,
    "priority": "high",
    "load_order": 1,
    "persistent": true,
    "refresh_interval": 0
  },
  "context_data": {
    "global_settings": {
      "default_language": "typescript",
      "code_style": "prettier",
      "linting_rules": "eslint"
    },
    "project_configs": {
      "mobile_app": {
        "framework": "react_native",
        "expo_version": "latest"
      }
    },
    "development_workflow": {
      "code_generation": {
        "template_based": true,
        "best_practices": true
      }
    },
    "shared_resources": {
      "component_library": {
        "location": "shared/components"
      }
    },
    "quality_standards": {
      "code_quality": {
        "eslint_rules": "strict",
        "typescript_strict": true
      }
    }
  }
}
```

## 🔧 Konfigürasyon Seçenekleri

### injection_config

| Parametre          | Açıklama              | Varsayılan        |
| ------------------ | --------------------- | ----------------- |
| `target_agent`     | Hedef agent adı       | `developer_agent` |
| `auto_load`        | Otomatik yükleme      | `true`            |
| `priority`         | Yükleme önceliği      | `high`            |
| `load_order`       | Yükleme sırası        | `1`               |
| `persistent`       | Kalıcı saklama        | `true`            |
| `refresh_interval` | Yenileme aralığı (ms) | `0` (devre dışı)  |

### context_data Bölümleri

#### global_settings

- `default_language`: Varsayılan programlama dili
- `code_style`: Kod formatlama aracı
- `linting_rules`: Linting kuralları
- `testing_framework`: Test framework'ü
- `documentation_format`: Dokümantasyon formatı

#### project_configs

Her proje için özel konfigürasyonlar:

- `framework`: Kullanılan framework
- `typescript`: TypeScript kullanımı
- `state_management`: State yönetimi
- `deployment`: Deployment stratejisi

#### development_workflow

Geliştirme süreç ayarları:

- `code_generation`: Kod üretimi ayarları
- `testing_strategy`: Test stratejisi
- `code_review`: Kod inceleme ayarları
- `deployment`: Deployment ayarları

#### shared_resources

Paylaşılan kaynaklar:

- `component_library`: Bileşen kütüphanesi
- `utility_functions`: Yardımcı fonksiyonlar
- `api_clients`: API istemcileri

#### quality_standards

Kalite standartları:

- `code_quality`: Kod kalitesi ayarları
- `performance`: Performans hedefleri
- `security`: Güvenlik gereksinimleri

## 🔄 Çalışma Sırası

1. **Context Injection Yükleme**

   - Injection dosyası okunur
   - Veri doğrulaması yapılır
   - Cache'e yüklenir

2. **Context Birleştirme**

   - Agent'ın mevcut context'i alınır
   - Injection verileri birleştirilir
   - Çakışma çözümlemesi yapılır

3. **Global Ayarlar Uygulama**

   - Global ayarlar agent'a uygulanır
   - Proje konfigürasyonları hazırlanır
   - Kalite standartları belirlenir

4. **Durum Kaydetme**
   - Başlangıç durumu kaydedilir
   - Log dosyaları oluşturulur
   - Agent hazır duruma getirilir

## 📊 Monitoring

### Log Dosyaları

- `context-injection.log`: Genel injection logları
- `context-injection-errors.log`: Hata logları
- `developer-agent-startup.log`: Startup logları
- `developer-agent-startup.json`: Startup durumu

### Metrikler

- `load_time`: Yükleme süresi
- `context_size`: Context boyutu
- `merge_conflicts`: Birleştirme çakışmaları
- `validation_errors`: Doğrulama hataları

## 🛠️ Geliştirme

### Yeni Injection Dosyası Ekleme

1. `shared/context-injection/` klasörüne yeni dosya ekle
2. Dosya adı: `{agent-name}-injection.context7.json`
3. Gerekli alanları doldur
4. Test script'ini çalıştır

### Injection Manager Genişletme

```javascript
// Yeni injection tipi ekleme
class CustomInjectionManager extends ContextInjectionManager {
  async loadCustomInjection(agentName) {
    // Özel yükleme mantığı
  }
}
```

## 🧪 Test Etme

### Manuel Test

```bash
# Startup test'i
node multi-agent/scripts/developer-agent-startup.js

# Kapsamlı test
node multi-agent/scripts/test-context-injection.js
```

### Otomatik Test

```javascript
const ContextInjectionTester = require("./multi-agent/scripts/test-context-injection");

const tester = new ContextInjectionTester();
await tester.runAllTests();
```

## 🔍 Sorun Giderme

### Yaygın Hatalar

1. **Injection dosyası bulunamadı**

   - Dosya yolunu kontrol et
   - Dosya adının doğru olduğundan emin ol

2. **Geçersiz injection formatı**

   - JSON formatını kontrol et
   - Gerekli alanların mevcut olduğunu doğrula

3. **Context birleştirme hatası**
   - Agent dosyasının mevcut olduğunu kontrol et
   - JSON formatını doğrula

### Debug Modu

```javascript
// Debug loglarını etkinleştir
process.env.DEBUG = "context-injection:*";
```

## 📈 Performans

- **Yükleme süresi**: ~50ms
- **Bellek kullanımı**: ~2MB
- **Dosya boyutu**: ~10KB
- **Cache boyutu**: ~5MB

## 🔐 Güvenlik

- Dosya okuma izinleri kontrol edilir
- JSON injection koruması
- Dosya boyutu sınırlaması
- Güvenli dosya yolları

## 📝 Lisans

Bu mekanizma EgKaSoft projesi kapsamında geliştirilmiştir.
