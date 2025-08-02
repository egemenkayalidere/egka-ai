# 📦 GitHub Packages Yayınlama Rehberi

Bu rehber, EGKA AI AGENTS projesini GitHub Packages'ta private bir npm paketi olarak yayınlamak için gerekli adımları içerir.

## 🚀 Adım 1: GitHub Repository Oluşturma

1. GitHub'da yeni bir private repository oluşturun:

   - Repository adı: `egka-ai-agents`
   - Private seçin
   - README dosyası ekleyin

2. Repository'yi klonlayın:

```bash
git clone https://github.com/egkasoft/egka-ai-agents.git
cd egka-ai-agents
```

## 🔑 Adım 2: GitHub Personal Access Token Oluşturma

1. GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "Generate new token (classic)"
3. Token'a isim verin: `egka-ai-agents-package`
4. Aşağıdaki izinleri seçin:

   - ✅ `repo` (Full control of private repositories)
   - ✅ `write:packages` (Upload packages to GitHub Package Registry)
   - ✅ `read:packages` (Download packages from GitHub Package Registry)
   - ✅ `delete:packages` (Delete packages from GitHub Package Registry)

5. Token'ı kopyalayın ve güvenli bir yere kaydedin

## ⚙️ Adım 3: NPM Konfigürasyonu

1. Global `.npmrc` dosyası oluşturun:

```bash
echo "@egkasoft:registry=https://npm.pkg.github.com" > ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```

2. `YOUR_GITHUB_TOKEN` yerine gerçek token'ınızı yazın

## 📁 Adım 4: Proje Dosyalarını Yükleme

1. Tüm proje dosyalarını repository'ye kopyalayın
2. Commit ve push yapın:

```bash
git add .
git commit -m "Initial commit: EGKA AI AGENTS package"
git push origin main
```

## 📦 Adım 5: Paketi Yayınlama

1. Paketi yayınlayın:

```bash
npm publish
```

2. Yayınlama başarılı olursa şu mesajı göreceksiniz:

```
+ @egkasoft/egka-ai-agents@1.0.0
```

## 🔍 Adım 6: Paketi Kontrol Etme

1. GitHub repository'nizde "Packages" sekmesine gidin
2. `@egkasoft/egka-ai-agents` paketini göreceksiniz

## 📥 Adım 7: Paketi Kullanma

Başka bir projede paketi kullanmak için:

1. `.npmrc` dosyası oluşturun (proje kökünde):

```bash
echo "@egkasoft:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc
```

2. Paketi yükleyin:

```bash
npm install @egkasoft/egka-ai-agents
```

3. Global olarak yüklemek için:

```bash
npm install -g @egkasoft/egka-ai-agents
```

## 🔄 Adım 8: Güncelleme

Paketi güncellemek için:

1. `package.json`'da versiyonu artırın
2. Commit ve push yapın
3. Yeniden yayınlayın:

```bash
npm publish
```

## 🛠️ Geliştirme İpuçları

### Versiyon Yönetimi

```bash
# Patch version (1.0.0 → 1.0.1)
npm version patch

# Minor version (1.0.0 → 1.1.0)
npm version minor

# Major version (1.0.0 → 2.0.0)
npm version major
```

### Test Etme

```bash
# Paketi test etmek için
npm pack
npm install ./egkasoft-egka-ai-agents-1.0.0.tgz
```

### Güvenlik

- Token'ınızı asla public repository'lere commit etmeyin
- `.npmrc` dosyasını `.gitignore`'a ekleyin
- Token'ı düzenli olarak yenileyin

## 🚨 Sorun Giderme

### "401 Unauthorized" Hatası

- Token'ın doğru olduğundan emin olun
- Token'ın gerekli izinlere sahip olduğunu kontrol edin

### "404 Not Found" Hatası

- Repository'nin private olduğundan emin olun
- Package name'in doğru olduğunu kontrol edin

### "403 Forbidden" Hatası

- Token'ın `write:packages` iznine sahip olduğunu kontrol edin

## 📞 Destek

Sorun yaşarsanız:

1. GitHub repository issues bölümünü kontrol edin
2. NPM ve GitHub Packages dokümantasyonunu inceleyin
3. Token izinlerini yeniden kontrol edin

---

**Not:** Bu rehber private paketler için hazırlanmıştır. Public paket yapmak isterseniz `"private": false` yapın.
