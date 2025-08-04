#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const StoryGenerator = require("./generate-story.js");

/**
 * Multi-Agent Sistemi için Otomatik Story Oluşturucu
 *
 * Bu script, Developer Agent veya UI Agent tarafından oluşturulan
 * atomic design componentleri için otomatik olarak story dosyaları oluşturur.
 */

class AutoStoryGenerator {
  constructor() {
    this.storyGenerator = new StoryGenerator();
    this.watchedPaths = [
      "src/components/atoms",
      "src/components/molecules",
      "src/components/organisms",
      "src/components/templates",
      "src/components/pages",
      "components/atoms",
      "components/molecules",
      "components/organisms",
      "components/templates",
      "components/pages",
    ];
  }

  /**
   * Yeni oluşturulan component için story dosyası oluştur
   */
  async generateStoryForNewComponent(componentPath) {
    try {
      console.log(`🎯 Yeni component algılandı: ${componentPath}`);

      // Component dosyasının var olduğunu kontrol et
      if (!(await fs.pathExists(componentPath))) {
        console.log(`⚠️ Component dosyası bulunamadı: ${componentPath}`);
        return;
      }

      // Story dosyası zaten var mı kontrol et
      const storyPath = this.storyGenerator.getStoryPath(componentPath);
      if (await fs.pathExists(storyPath)) {
        console.log(`ℹ️ Story dosyası zaten mevcut: ${storyPath}`);
        return;
      }

      // Story dosyası oluştur
      await this.storyGenerator.generateStory(componentPath);

      console.log(`✅ Story dosyası otomatik oluşturuldu: ${storyPath}`);

      // Log dosyasına kaydet
      await this.logStoryGeneration(componentPath, storyPath);
    } catch (error) {
      console.error(`❌ Otomatik story oluşturma hatası:`, error.message);
    }
  }

  /**
   * Güncellenen component için story dosyasını güncelle
   */
  async updateStoryForComponent(componentPath) {
    try {
      console.log(`🔄 Component güncellendi: ${componentPath}`);

      const storyPath = this.storyGenerator.getStoryPath(componentPath);

      // Story dosyası var mı kontrol et
      if (!(await fs.pathExists(storyPath))) {
        // Yoksa yeni oluştur
        await this.generateStoryForNewComponent(componentPath);
        return;
      }

      // Story dosyasını yeniden oluştur (güncelle)
      await this.storyGenerator.generateStory(componentPath);

      console.log(`✅ Story dosyası güncellendi: ${storyPath}`);

      // Log dosyasına kaydet
      await this.logStoryUpdate(componentPath, storyPath);
    } catch (error) {
      console.error(`❌ Story güncelleme hatası:`, error.message);
    }
  }

  /**
   * Klasördeki tüm componentler için story oluştur
   */
  async generateStoriesForDirectory(dirPath) {
    try {
      console.log(`📁 Klasör taranıyor: ${dirPath}`);

      if (!(await fs.pathExists(dirPath))) {
        console.log(`⚠️ Klasör bulunamadı: ${dirPath}`);
        return;
      }

      await this.storyGenerator.generateStoriesForDirectory(dirPath);
    } catch (error) {
      console.error(`❌ Klasör tarama hatası:`, error.message);
    }
  }

  /**
   * Tüm atomic design klasörlerini tara ve story oluştur
   */
  async generateAllStories() {
    try {
      console.log(
        `🚀 Tüm atomic design componentleri için story dosyaları oluşturuluyor...`
      );

      for (const watchedPath of this.watchedPaths) {
        if (await fs.pathExists(watchedPath)) {
          await this.generateStoriesForDirectory(watchedPath);
        }
      }

      console.log(`✅ Tüm story dosyaları oluşturuldu!`);
    } catch (error) {
      console.error(`❌ Genel story oluşturma hatası:`, error.message);
    }
  }

  /**
   * Story oluşturma işlemini logla
   */
  async logStoryGeneration(componentPath, storyPath) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: "story_generated",
      componentPath,
      storyPath,
      agent: "auto-story-generator",
    };

    const logPath = path.join(
      __dirname,
      "..",
      "shared",
      "logs",
      "story-generation.log"
    );
    await fs.ensureDir(path.dirname(logPath));

    await fs.appendFile(logPath, JSON.stringify(logEntry) + "\n");
  }

  /**
   * Story güncelleme işlemini logla
   */
  async logStoryUpdate(componentPath, storyPath) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: "story_updated",
      componentPath,
      storyPath,
      agent: "auto-story-generator",
    };

    const logPath = path.join(
      __dirname,
      "..",
      "shared",
      "logs",
      "story-generation.log"
    );
    await fs.ensureDir(path.dirname(logPath));

    await fs.appendFile(logPath, JSON.stringify(logEntry) + "\n");
  }

  /**
   * Agent workflow'u için hook fonksiyonu
   * Bu fonksiyon, Developer Agent veya UI Agent tarafından çağrılır
   */
  async onComponentCreated(componentPath) {
    console.log(`🤖 Agent workflow: Component oluşturuldu - ${componentPath}`);
    await this.generateStoryForNewComponent(componentPath);
  }

  /**
   * Agent workflow'u için hook fonksiyonu
   * Bu fonksiyon, Developer Agent veya UI Agent tarafından çağrılır
   */
  async onComponentUpdated(componentPath) {
    console.log(`🤖 Agent workflow: Component güncellendi - ${componentPath}`);
    await this.updateStoryForComponent(componentPath);
  }
}

// CLI kullanımı
if (require.main === module) {
  const autoGenerator = new AutoStoryGenerator();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Kullanım:");
    console.log(
      "  node auto-story-generator.js --all                    # Tüm componentler için story oluştur"
    );
    console.log(
      "  node auto-story-generator.js --component <path>       # Tek component için story oluştur"
    );
    console.log(
      "  node auto-story-generator.js --update <path>          # Component için story güncelle"
    );
    console.log(
      "  node auto-story-generator.js --directory <path>       # Klasör için story oluştur"
    );
    process.exit(1);
  }

  const command = args[0];

  switch (command) {
    case "--all":
      autoGenerator.generateAllStories();
      break;

    case "--component":
      if (args[1]) {
        autoGenerator.generateStoryForNewComponent(args[1]);
      } else {
        console.log("❌ Component path gerekli");
      }
      break;

    case "--update":
      if (args[1]) {
        autoGenerator.updateStoryForComponent(args[1]);
      } else {
        console.log("❌ Component path gerekli");
      }
      break;

    case "--directory":
      if (args[1]) {
        autoGenerator.generateStoriesForDirectory(args[1]);
      } else {
        console.log("❌ Directory path gerekli");
      }
      break;

    default:
      console.log("❌ Bilinmeyen komut");
      break;
  }
}

module.exports = AutoStoryGenerator;
