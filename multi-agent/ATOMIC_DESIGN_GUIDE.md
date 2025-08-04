# Developer Agent Atomic Design & Storybook Rehberi

## 🎯 Genel Bakış

Developer Agent artık atomic design kurallarına uygun component oluşturma ve otomatik storybook entegrasyonu yapabilir. Her component oluşturulduğunda otomatik olarak story dosyası oluşturulur ve storybook'a eklenir.

## 🏗️ Atomic Design Kuralları

### Atoms (Atomlar)
- **Açıklama**: En küçük bileşenler - Button, TextField, Icon, Typography, Avatar, Badge, Chip
- **Kurallar**:
  - Tek bir işlevi olmalı
  - Material UI veya HTML elementlerinden türetilmeli
  - Yeniden kullanılabilir olmalı
  - Props interface'i tanımlanmalı

### Molecules (Moleküller)
- **Açıklama**: İki veya daha fazla atomun birleşimi
- **Örnekler**: InputWithLabel, SearchBar, Card, Modal, Dropdown, Tabs
- **Kurallar**:
  - İki veya daha fazla atom içermeli
  - Tek bir amaca hizmet etmeli
  - Kendi state'i olmamalı
  - Props interface'i tanımlanmalı

### Organisms (Organizmalar)
- **Açıklama**: Sayfa parçalarını temsil eden büyük bileşenler
- **Örnekler**: Header, Footer, Sidebar, Navigation, Form, Table
- **Kurallar**:
  - Birden fazla molecule ve atom içermeli
  - Sayfa parçasını temsil etmeli
  - Store bağlantısı olabilir ancak kendi store'unu üretmemeli
  - İş mantığı içermemeli

### Templates (Şablonlar)
- **Açıklama**: Layout ve şablonlar
- **Örnekler**: Layout, Dashboard, PageTemplate, MasterPage
- **Kurallar**:
  - Layout ve şablonları ifade etmeli
  - Organizmaları birleştirmeli
  - Sayfa düzeyinde yapı oluşturmalı

### Pages (Sayfalar)
- **Açıklama**: Tam sayfa bileşenleri
- **Örnekler**: HomePage, AboutPage, ContactPage, ProfilePage
- **Kurallar**:
  - Template'leri kullanmalı
  - Route bağlantısı olmalı
  - Sayfa seviyesinde state yönetimi yapabilir

## 📚 Storybook Entegrasyonu

### Otomatik Kurulum
Developer Agent, storybook'un kurulu olup olmadığını kontrol eder ve gerekirse otomatik olarak kurar:

```bash
# Storybook kurulum kontrolü
node multi-agent/scripts/setup-storybook.js
```

### Otomatik Story Oluşturma
Her component oluşturulduğunda otomatik olarak story dosyası oluşturulur:

```bash
# Tek component için story oluştur
node multi-agent/scripts/auto-story-generator.js --component src/components/atoms/Button.tsx

# Tüm componentler için story oluştur
node multi-agent/scripts/auto-story-generator.js --all
```

### Story Variantları
Her component için aşağıdaki variantlar otomatik oluşturulur:
- Default
- Primary
- Secondary
- Disabled
- Small
- Large
- Error
- Success
- Warning

## 🛠️ Developer Agent Komutları

### Component Oluşturma
```bash
# Atomic design kurallarına uygun component oluştur
node multi-agent/scripts/developer-agent-atomic.js --create Button button

# Props ile component oluştur
node multi-agent/scripts/developer-agent-atomic.js --create SearchBar search '{"placeholder": "string", "onSearch": "function"}'
```

### Component Güncelleme
```bash
# Mevcut component'i atomic design kurallarına göre güncelle
node multi-agent/scripts/developer-agent-atomic.js --update src/components/Button.tsx
```

### Story Oluşturma
```bash
# Tüm componentler için story oluştur
node multi-agent/scripts/developer-agent-atomic.js --stories
```

## 📁 Dosya Yapısı

```
src/
├── components/
│   ├── atoms/           # En küçük bileşenler
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   ├── molecules/       # Atom kombinasyonları
│   │   ├── SearchBar.tsx
│   │   ├── SearchBar.stories.tsx
│   │   └── index.ts
│   ├── organisms/       # Sayfa parçaları
│   │   ├── Header.tsx
│   │   ├── Header.stories.tsx
│   │   └── index.ts
│   ├── templates/       # Layout şablonları
│   │   ├── Layout.tsx
│   │   ├── Layout.stories.tsx
│   │   └── index.ts
│   └── pages/          # Tam sayfalar
│       ├── HomePage.tsx
│       ├── HomePage.stories.tsx
│       └── index.ts
.storybook/
├── main.js             # Storybook konfigürasyonu
└── preview.js          # Preview ayarları
```

## 🔄 Workflow

1. **Component Oluşturma**: Developer Agent atomic design kurallarına uygun component oluşturur
2. **Atomic Seviye Belirleme**: Component adına ve tipine göre atomic seviye otomatik belirlenir
3. **Storybook Kontrolü**: Storybook kurulu mu kontrol edilir
4. **Storybook Kurulumu**: Gerekirse otomatik kurulum yapılır
5. **Story Oluşturma**: Component için otomatik story dosyası oluşturulur
6. **Loglama**: Tüm işlemler loglanır

## 📊 Log Dosyaları

- **atomic-design.log**: Component oluşturma logları
- **storybook-setup.log**: Storybook kurulum logları
- **story-generation.log**: Story oluşturma logları

## 🎨 Storybook Kullanımı

```bash
# Storybook'u başlat
npm run storybook

# Storybook build
npm run build-storybook

# Tüm story'leri yeniden oluştur
npm run story:generate
```

## ✅ Başarı Kriterleri

- [x] Atomic design kurallarına uygun component oluşturma
- [x] Otomatik atomic seviye belirleme
- [x] Otomatik storybook kurulumu
- [x] Otomatik story dosyası oluşturma
- [x] Story variantları oluşturma
- [x] Detaylı loglama
- [x] Workflow entegrasyonu

## 🚀 Gelecek Özellikler

- [ ] Component dependency analizi
- [ ] Otomatik test dosyası oluşturma
- [ ] Component documentation generation
- [ ] Design system integration
- [ ] Component library export

---

**Son Güncelleme**: 2025-01-27  
**Versiyon**: 1.0.0  
**Developer Agent**: Atomic Design & Storybook Ready ✅ 