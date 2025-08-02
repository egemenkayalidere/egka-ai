# Multi-Agent System - Orchestrator

## Overview

Orchestrator, Multi-Agent System'in kalbi olarak görev yapar ve tüm agent'lar arasındaki koordinasyonu sağlar.

## Components

### workflow.context7.json

Bu dosya, multi-agent workflow'unun tüm durumlarını ve geçişlerini tanımlar:

#### Workflow States

- **initiated**: Kullanıcı girdisi alındı, workflow başlatıldı
- **analyzing**: Task analizi ve oluşturma aşaması
- **pending**: Task oluşturuldu ve yürütme bekliyor
- **executing**: Task yürütme devam ediyor
- **completed**: Task başarıyla tamamlandı
- **failed**: Task yürütme başarısız
- **cancelled**: Task kullanıcı veya sistem tarafından iptal edildi
- **paused**: Task yürütme duraklatıldı
- **retrying**: Task yeniden deneme girişimi

#### Agent Coordination

- **Manager → Analyst**: Kullanıcı girdisini analist'e aktarır
- **Analyst → Developer**: Task context dosyasını oluşturur
- **Developer → System**: Task sonucunu ve log'ları günceller

#### File Monitoring

- **Task Directory**: `shared/tasks/` klasöründeki yeni dosyaları izler
- **Log Directory**: `shared/logs/` klasöründeki log dosyalarını izler

#### Error Handling

- **Agent Failure**: 3 deneme, 5 saniye bekleme
- **File Access Error**: 2 deneme, 1 saniye bekleme
- **Workflow Timeout**: 5 dakika sonra task iptal

#### Performance Metrics

- **Workflow Duration**: Hedef < 5 dakika
- **Agent Response Time**: Hedef < 5 saniye
- **Task Success Rate**: Hedef > %95

## Usage

### Agent Activation Rules

1. **Manager Agent**: Her kullanıcı girdisinde otomatik aktifleşir
2. **Analyst Agent**: Manager'dan gelen görevle aktifleşir
3. **Developer Agent**: Shared tasks klasöründeki pending task'larla aktifleşir

### File Operations

- Agent'lar kendi yetki alanlarındaki dosyaları okuyabilir ve yazabilir
- Her agent'ın erişim yetkileri `main.context7.json` dosyasında tanımlıdır
- Orchestrator, dosya değişikliklerini izler ve gerekli agent'ları tetikler

### Monitoring

- **Log Rotation**: Günlük, maksimum 10MB
- **Task Cleanup**: Haftalık, tamamlanan task'lar 90 gün saklanır
- **System Health Check**: Saatlik, agent erişilebilirliği kontrol edilir

## Integration

Orchestrator, aşağıdaki dosyalarla entegre çalışır:

- `main.context7.json`: Proje genel bilgileri ve kurallar
- `agents/*.context7.json`: Agent konfigürasyonları
- `shared/tasks/*.context7.json`: Task context dosyaları
- `shared/logs/*.log`: Agent ve sistem log'ları

## Maintenance

### Automated Tasks

- **Daily**: Log rotation
- **Weekly**: Task cleanup
- **Hourly**: System health check

### Manual Tasks

- **Monthly**: Performance review
- **Quarterly**: System optimization
- **As needed**: Error investigation

---

_Bu orchestrator, Multi-Agent System'in merkezi koordinasyon birimidir._
