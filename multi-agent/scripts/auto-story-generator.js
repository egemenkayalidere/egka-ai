#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const StoryGenerator = require("./generate-story.js");

/**
 * Multi-Agent Sistemi için Otomatik Story Oluşturucu
 *
 * Bu script, Developer Agent tarafından oluşturulan
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

      if (!(await fs.pathExists(componentPath))) {
        console.log(`⚠️ Component dosyası bulunamadı: ${componentPath}`);
        return;
      }

      const storyPath = this.storyGenerator.getStoryPath(componentPath);
      if (await fs.pathExists(storyPath)) {
        console.log(`ℹ️ Story dosyası zaten mevcut: ${storyPath}`);
        return;
      }

      await this.storyGenerator.generateStory(componentPath);
      console.log(`✅ Story dosyası otomatik oluşturuldu: ${storyPath}`);

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

      if (!(await fs.pathExists(storyPath))) {
        await this.generateStoryForNewComponent(componentPath);
        return;
      }

      await this.storyGenerator.generateStory(componentPath);
      console.log(`✅ Story dosyası güncellendi: ${storyPath}`);

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

      const files = await fs.readdir(dirPath);
      const componentFiles = files.filter(
        (file) => file.endsWith(".tsx") || file.endsWith(".jsx")
      );

      console.log(`📊 ${componentFiles.length} component bulundu`);

      for (const file of componentFiles) {
        const componentPath = path.join(dirPath, file);
        await this.generateStoryForNewComponent(componentPath);
      }

      console.log(`✅ Tüm story dosyaları oluşturuldu`);
    } catch (error) {
      console.error(`❌ Klasör story oluşturma hatası:`, error.message);
    }
  }

  /**
   * Tüm watched path'lerdeki story'leri oluştur
   */
  async generateAllStories() {
    console.log(`🚀 Tüm story dosyaları oluşturuluyor...`);

    for (const watchedPath of this.watchedPaths) {
      if (await fs.pathExists(watchedPath)) {
        await this.generateStoriesForDirectory(watchedPath);
      }
    }

    console.log(`✅ Tüm story dosyaları oluşturuldu`);
  }

  /**
   * Story generation log dosyasına kaydet
   */
  async logStoryGeneration(componentPath, storyPath) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        event: "story_generated",
        component_path: componentPath,
        story_path: storyPath,
        agent: "auto-story-generator",
      };

      const logPath = path.join(
        __dirname,
        "../shared/logs/story-generation.log"
      );
      await fs.appendFile(logPath, JSON.stringify(logEntry) + "\n");
    } catch (error) {
      console.error("Log yazma hatası:", error.message);
    }
  }

  /**
   * Story update log dosyasına kaydet
   */
  async logStoryUpdate(componentPath, storyPath) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        event: "story_updated",
        component_path: componentPath,
        story_path: storyPath,
        agent: "auto-story-generator",
      };

      const logPath = path.join(
        __dirname,
        "../shared/logs/story-generation.log"
      );
      await fs.appendFile(logPath, JSON.stringify(logEntry) + "\n");
    } catch (error) {
      console.error("Log yazma hatası:", error.message);
    }
  }

  /**
   * Component oluşturulduğunda çağrılır
   */
  async onComponentCreated(componentPath) {
    await this.generateStoryForNewComponent(componentPath);
  }

  /**
   * Component güncellendiğinde çağrılır
   */
  async onComponentUpdated(componentPath) {
    await this.updateStoryForComponent(componentPath);
  }
}

// CLI kullanımı
if (require.main === module) {
  const generator = new AutoStoryGenerator();
  const args = process.argv.slice(2);

  if (args.includes("--all")) {
    generator.generateAllStories();
  } else if (
    args.includes("--component") &&
    args[args.indexOf("--component") + 1]
  ) {
    const componentPath = args[args.indexOf("--component") + 1];
    generator.generateStoryForNewComponent(componentPath);
  } else if (args.includes("--update") && args[args.indexOf("--update") + 1]) {
    const componentPath = args[args.indexOf("--update") + 1];
    generator.updateStoryForComponent(componentPath);
  } else {
    console.log("Kullanım:");
    console.log(
      "  node auto-story-generator.js --all                    # Tüm story'leri oluştur"
    );
    console.log(
      "  node auto-story-generator.js --component <path>       # Tek component için story oluştur"
    );
    console.log(
      "  node auto-story-generator.js --update <path>          # Story güncelle"
    );
  }
}

module.exports = AutoStoryGenerator;
