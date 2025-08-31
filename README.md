# EgKa AI Agents

Cursor IDE için AI Agent sistemi. Bu paket, Cursor'da kullanabileceğiniz AI agent yapısını CLI komutu ile projenize kurar.

## İçindekiler

- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Komutlar](#komutlar)
- [Kurulum Notları / Sorun Giderme](#kurulum-notları--sorun-giderme)
- [Özellikler](#özellikler)
- [Lisans](#lisans)
- [Geliştirici](#geliştirici)
- [English](#english)

## Kurulum

```bash
npm install -g @egka/cursor-ai-agents
```

## Kullanım

Kurulum tamamlandıktan sonra, projenizin ana dizininde şu komutu çalıştırın:

```bash
egka-ai init
```

Bu komut projenize aşağıdaki yapıyı kopyalar/oluşturur:

- `.cursor/rules/new-chat-rules.mdc` - Cursor kuralları
- `agents/` - AI agent paket içerikleri
  - `contexts/general-context.md` ve agent dosyaları
  - `docs/`, `logs/`, `prompts/`, `tasks/` klasörleri BOŞ olarak oluşturulur (örnek dosya kopyalanmaz)

## Komutlar

- `egka-ai init` - `.cursor/rules/new-chat-rules.mdc` dosyasını ve `agents` klasörünü kopyalar; `agents/docs`, `agents/logs`, `agents/prompts`, `agents/tasks` klasörlerini (YOKSA) oluşturur, mevcut içerik KORUNUR
- `egka-ai --help` - Yardım menüsünü gösterir
- `egka-ai --version` - Versiyon bilgisini gösterir

Not: Bu paket kapsamındaki `rules` ve `agents` içerikleri geliştirme sürecinde doğrudan depo içinde kullanılmaz; yalnızca paket kurulumu sırasında hedef projeye kopyalanır.

## Kurulum Notları / Sorun Giderme

- Gereksinimler: Node.js >= 16
- Global kurulumda izin (EACCES) hatası alırsanız kullanıcı dizininize global prefix tanımlayıp PATH'e ekleyin:

```bash
npm config set prefix "$HOME/.npm-global"
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
. ~/.zshrc
```

Ardından tekrar kurulum yapın:

```bash
npm install -g @egka/cursor-ai-agents
```

## Özellikler

- 🤖 Multi-agent sistem
- 📝 Otomatik task yönetimi
- 📊 Log sistemi
- 🔄 Context injection
- ⚡ Otomatik kurulum

## Lisans

MIT

## Geliştirici

EgKaSoft — Web: https://egkasoft.com — LinkedIn: https://www.linkedin.com/in/egemenkayalidere/

Depo: https://github.com/egemenkayalidere/egka-ai — Hata bildirimi: https://github.com/egemenkayalidere/egka-ai/issues

---

## English

EgKa AI Agents is an AI Agent system for the Cursor IDE. This package installs a ready-to-use agent setup into your project via a CLI command.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Installation Notes / Troubleshooting](#installation-notes--troubleshooting)
- [Features](#features)
- [License](#license)
- [Developer](#developer)

## Installation

```bash
npm install -g @egka/cursor-ai-agents
```

## Usage

After installation, run the following command in your project root:

```bash
egka-ai init
```

You can also use it via npx without global install:

```bash
npx @egka/cursor-ai-agents@latest egka-ai init --yes
```

This command will copy/create the following structure in your project:

- `.cursor/rules/new-chat-rules.mdc` — Cursor rules
- `agents/` — AI agent package contents
  - `contexts/general-context.md` and agent files
  - `docs/`, `logs/`, `prompts/`, `tasks/` directories are created EMPTY (no example files)

## Commands

- `egka-ai init` — Copies `.cursor/rules/new-chat-rules.mdc` and the `agents` folder; creates `agents/docs`, `agents/logs`, `agents/prompts`, `agents/tasks` directories if MISSING, existing content is PRESERVED
- `egka-ai --help` — Shows the help menu
- `egka-ai --version` — Shows the version

Flags (planned/for reference):

- `--dry-run` — Print planned operations without writing files
- `--agents-only` — Only copy/create `agents` structure
- `--rules-only` — Only copy `.cursor/rules/new-chat-rules.mdc`
- `--overwrite` — Overwrite existing files (otherwise skip/confirm)
- `--verbose` — Verbose output

Note: The `rules` and `agents` included in this package are not used directly within this repository during development; they are only copied into the target project during package setup.

## Installation Notes / Troubleshooting

- Requirements: Node.js >= 16
- If you encounter a permission (EACCES) error on global install, set a user-level global prefix and add it to PATH (zsh example):

```bash
npm config set prefix "$HOME/.npm-global"
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
. ~/.zshrc
```

Then install again:

```bash
npm install -g @egka/cursor-ai-agents
```

## Features

- 🤖 Multi-agent system
- 📝 Automatic task management
- 📊 Log system
- 🔄 Context injection
- ⚡ One-command setup

## License

MIT

## Developer

EgKaSoft — Web: [egkasoft.com](https://egkasoft.com) — LinkedIn: [Egemen Kayalidere](https://www.linkedin.com/in/egemenkayalidere/)

Repository: https://github.com/egemenkayalidere/egka-ai — Issues: https://github.com/egemenkayalidere/egka-ai/issues
