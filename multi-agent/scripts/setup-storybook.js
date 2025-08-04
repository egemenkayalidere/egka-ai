#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Multi-Agent Sistemi için Storybook Otomatik Kurulum Script'i
 *
 * Bu script, Developer Agent tarafından çağrılarak storybook'u otomatik olarak kurar ve yapılandırır.
 */

class StorybookSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.storybookPath = path.join(this.projectRoot, ".storybook");
    this.packageJsonPath = path.join(this.projectRoot, "package.json");
  }

  /**
   * Storybook'un kurulu olup olmadığını kontrol et
   */
  async isStorybookInstalled() {
    try {
      const packageJson = await fs.readJson(this.packageJsonPath);
      return packageJson.devDependencies && (
        packageJson.devDependencies["@storybook/react"] ||
        packageJson.devDependencies["@storybook/react-vite"] ||
        packageJson.devDependencies["@storybook/nextjs"]
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Storybook'u kur
   */
  async installStorybook() {
    try {
      console.log("📚 Storybook kuruluyor...");

      // Storybook'u kur
      execSync("npx storybook@latest init --yes", { 
        stdio: "inherit",
        cwd: this.projectRoot 
      });

      console.log("✅ Storybook başarıyla kuruldu!");
      return true;
    } catch (error) {
      console.error("❌ Storybook kurulum hatası:", error.message);
      return false;
    }
  }

  /**
   * Storybook konfigürasyonunu güncelle
   */
  async updateStorybookConfig() {
    try {
      console.log("⚙️ Storybook konfigürasyonu güncelleniyor...");

      // .storybook/main.js dosyasını güncelle
      const mainConfigPath = path.join(this.storybookPath, "main.js");
      const mainConfig = `/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
    "@storybook/addon-docs",
    "@storybook/addon-controls",
    "@storybook/addon-actions"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
  },
};
export default config;`;

      await fs.writeFile(mainConfigPath, mainConfig);

      // .storybook/preview.js dosyasını güncelle
      const previewConfigPath = path.join(this.storybookPath, "preview.js");
      const previewConfig = `/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
  },
};

export default preview;`;

      await fs.writeFile(previewConfigPath, previewConfig);

      console.log("✅ Storybook konfigürasyonu güncellendi!");
      return true;
    } catch (error) {
      console.error("❌ Konfigürasyon güncelleme hatası:", error.message);
      return false;
    }
  }

  /**
   * Atomic design klasör yapısını oluştur
   */
  async createAtomicDesignStructure() {
    try {
      console.log("🏗️ Atomic design klasör yapısı oluşturuluyor...");

      const atomicDirs = [
        "src/components/atoms",
        "src/components/molecules", 
        "src/components/organisms",
        "src/components/templates",
        "src/components/pages"
      ];

      for (const dir of atomicDirs) {
        const dirPath = path.join(this.projectRoot, dir);
        await fs.ensureDir(dirPath);
        
        // Her klasöre index.ts dosyası oluştur
        const indexPath = path.join(dirPath, "index.ts");
        if (!(await fs.pathExists(indexPath))) {
          await fs.writeFile(indexPath, "// Atomic design components\n");
        }
      }

      console.log("✅ Atomic design klasör yapısı oluşturuldu!");
      return true;
    } catch (error) {
      console.error("❌ Klasör yapısı oluşturma hatası:", error.message);
      return false;
    }
  }

  /**
   * Storybook script'lerini package.json'a ekle
   */
  async addStorybookScripts() {
    try {
      console.log("📝 Package.json script'leri güncelleniyor...");

      const packageJson = await fs.readJson(this.packageJsonPath);
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      // Storybook script'lerini ekle
      packageJson.scripts["storybook"] = "storybook dev -p 6006";
      packageJson.scripts["build-storybook"] = "storybook build";
      packageJson.scripts["story:generate"] = "node multi-agent/scripts/auto-story-generator.js --all";

      await fs.writeJson(this.packageJsonPath, packageJson, { spaces: 2 });

      console.log("✅ Package.json script'leri güncellendi!");
      return true;
    } catch (error) {
      console.error("❌ Script ekleme hatası:", error.message);
      return false;
    }
  }

  /**
   * Ana kurulum fonksiyonu
   */
  async setup() {
    try {
      console.log("🚀 Storybook otomatik kurulum başlatılıyor...");

      // Storybook kurulu mu kontrol et
      const isInstalled = await this.isStorybookInstalled();
      
      if (!isInstalled) {
        const installSuccess = await this.installStorybook();
        if (!installSuccess) {
          throw new Error("Storybook kurulumu başarısız");
        }
      } else {
        console.log("ℹ️ Storybook zaten kurulu");
      }

      // Konfigürasyonu güncelle
      await this.updateStorybookConfig();

      // Atomic design yapısını oluştur
      await this.createAtomicDesignStructure();

      // Script'leri ekle
      await this.addStorybookScripts();

      // Log dosyasına kaydet
      await this.logSetup();

      console.log("🎉 Storybook kurulumu tamamlandı!");
      console.log("📖 Storybook'u başlatmak için: npm run storybook");
      
      return true;
    } catch (error) {
      console.error("❌ Storybook kurulum hatası:", error.message);
      return false;
    }
  }

  /**
   * Kurulum işlemini logla
   */
  async logSetup() {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: "storybook_setup",
      projectRoot: this.projectRoot,
      storybookPath: this.storybookPath,
      agent: "developer-agent",
      status: "completed"
    };

    const logPath = path.join(
      __dirname,
      "..",
      "shared",
      "logs",
      "storybook-setup.log"
    );
    await fs.ensureDir(path.dirname(logPath));

    await fs.appendFile(logPath, JSON.stringify(logEntry) + "\n");
  }

  /**
   * Developer Agent için hook fonksiyonu
   */
  async onComponentCreated(componentPath) {
    console.log(`🤖 Developer Agent: Component oluşturuldu - ${componentPath}`);
    
    // Storybook kurulu mu kontrol et
    const isInstalled = await this.isStorybookInstalled();
    if (!isInstalled) {
      console.log("📚 Storybook kurulu değil, otomatik kurulum başlatılıyor...");
      await this.setup();
    }
  }
}

// CLI kullanımı
if (require.main === module) {
  const setup = new StorybookSetup();
  setup.setup();
}

module.exports = StorybookSetup; 