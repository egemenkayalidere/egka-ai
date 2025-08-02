# Tasks Directory

Bu klasör, multi-agent sistemi tarafından oluşturulan task context dosyalarını içerir.

## 📁 Dosya Yapısı

```
tasks/
├── README.md                    # Bu dosya
├── TASK-{YEAR}-{SEQUENTIAL}.context7.json  # Task context dosyaları
└── ...
```

## 📋 Task Formatı

Her task dosyası aşağıdaki JSON formatında oluşturulur:

```json
{
  "task_id": "TASK-2025-1000",
  "title": "Task Başlığı",
  "description": "Task açıklaması",
  "priority": "high|medium|low",
  "status": "pending|in_progress|completed|failed",
  "assigned_agent": "developer_agent",
  "created_at": "2025-01-27T10:00:00Z",
  "created_by": "analyst_agent",
  "requirements": {
    "user_request": "Kullanıcının orijinal isteği",
    "analysis": "Analist agent'ın analizi",
    "complexity": "low|medium|high",
    "estimated_duration": 30000
  },
  "files_to_create": [
    {
      "path": "dosya/yolu",
      "type": "json|markdown|javascript|typescript|html|css",
      "description": "Dosya açıklaması"
    }
  ],
  "files_to_modify": [
    {
      "path": "mevcut/dosya/yolu",
      "description": "Değişiklik açıklaması"
    }
  ],
  "dependencies": [],
  "tags": ["tag1", "tag2"]
}
```

## 🔄 Task Yaşam Döngüsü

1. **Oluşturma**: Analyst agent tarafından oluşturulur
2. **Atama**: Developer agent'a atanır
3. **İşleme**: Developer agent tarafından işlenir
4. **Tamamlama**: Task durumu güncellenir
5. **Loglama**: Sonuçlar log dosyasına yazılır

## 📊 Task Durumları

- **pending**: Task oluşturuldu, henüz başlanmadı
- **in_progress**: Task devam ediyor
- **completed**: Task başarıyla tamamlandı
- **failed**: Task başarısız oldu

## 🏷️ Task Etiketleri

Task'lar kategorize edilmek için etiketler kullanılır:

- `setup`: Kurulum task'ları
- `development`: Geliştirme task'ları
- `bugfix`: Hata düzeltme task'ları
- `feature`: Yeni özellik task'ları
- `documentation`: Dokümantasyon task'ları

## 📈 Task Takibi

- Task ID'leri otomatik olarak artırılır
- Her task benzersiz bir ID'ye sahiptir
- Task geçmişi korunur
- Performans metrikleri hesaplanır

---

**Son Güncelleme:** 2025-01-27
