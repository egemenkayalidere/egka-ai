# Shared Tasks - Multi-Agent V2

Bu dizin, multi-agent sistemindeki tüm task'ların context dosyalarını içerir.

## 📁 Dizin Yapısı

```
shared/tasks/
├── README.md                    # Bu dosya
├── TASK-2025-1001-ui.log.md    # Task log dosyaları
├── TASK-2025-1002-ui.log.md
└── *.context7.json             # Task context dosyaları
```

## 📋 Task Formatı

### Task ID Formatı

```
TASK-{YEAR}-{SEQUENTIAL}
Örnek: TASK-2025-1001
```

### Context Dosya Formatı

```json
{
  "task_id": "TASK-2025-1001",
  "title": "Task Başlığı",
  "description": "Task açıklaması",
  "priority": "high|medium|low",
  "assigned_agent": "developer_agent",
  "created_at": "2025-01-27T10:00:00.000Z",
  "status": "pending|in_progress|completed|failed",
  "performance_requirements": "React.memo, useCallback kullanımı",
  "security_requirements": "XSS koruması, input validation",
  "atomic_design_level": "atoms|molecules|organisms|templates|pages",
  "storybook_requirements": "Story dosyası otomatik oluşturma"
}
```

## 🔄 Task Durumları

- **pending**: Bekleyen task
- **in_progress**: Devam eden task
- **completed**: Tamamlanan task
- **failed**: Başarısız task

## 📊 Task Yönetimi

### Otomatik Task Oluşturma

Analyst Agent tarafından otomatik olarak oluşturulur.

### Task Takibi

- Her task için detaylı log tutulur
- Performance metrics kaydedilir
- Security validation yapılır

### Task Tamamlama

Developer Agent tarafından tamamlanır ve sonuçlar loglanır.

## 🔍 Task Arama

Task'ları aramak için:

- Task ID ile arama
- Status ile filtreleme
- Priority ile sıralama
- Date range ile filtreleme

## 📈 Performance Monitoring

Her task için performance metrics:

- Execution time
- Memory usage
- CPU usage
- Bundle size (component için)

## 🔒 Security Compliance

Her task için security validation:

- Input validation
- XSS protection
- CSRF protection
- Code signing

---

**Son Güncelleme:** 2025-01-27
**Versiyon:** 2.0.0
