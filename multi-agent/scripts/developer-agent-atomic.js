#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const AutoStoryGenerator = require("./auto-story-generator.js");
const StorybookSetup = require("./setup-storybook.js");

/**
 * Developer Agent Atomic Design ve Storybook Entegrasyon Script'i
 *
 * Bu script, Developer Agent tarafından çağrılarak:
 * 1. Atomic design kurallarına uygun component oluşturur
 * 2. Otomatik story dosyası oluşturur
 * 3. Storybook'u kurar ve yapılandırır
 */

class DeveloperAgentAtomic {
  constructor() {
    this.projectRoot = process.cwd();
    this.storyGenerator = new AutoStoryGenerator();
    this.storybookSetup = new StorybookSetup();
  }

  /**
   * Component'in atomic design seviyesini belirle
   */
  determineAtomicLevel(componentName, componentType) {
    const atomicLevels = {
      atoms: ["Button", "TextField", "Icon", "Typography", "Avatar", "Badge", "Chip"],
      molecules: ["InputWithLabel", "SearchBar", "Card", "Modal", "Dropdown", "Tabs"],
      organisms: ["Header", "Footer", "Sidebar", "Navigation", "Form", "Table"],
      templates: ["Layout", "Dashboard", "PageTemplate", "MasterPage"],
      pages: ["HomePage", "AboutPage", "ContactPage", "ProfilePage"]
    };

    // Component type'a göre belirle
    if (componentType) {
      for (const [level, components] of Object.entries(atomicLevels)) {
        if (components.some(comp => componentType.toLowerCase().includes(comp.toLowerCase()))) {
          return level;
        }
      }
    }

    // Component name'e göre belirle
    for (const [level, components] of Object.entries(atomicLevels)) {
      if (components.some(comp => componentName.toLowerCase().includes(comp.toLowerCase()))) {
        return level;
      }
    }

    // Varsayılan olarak atom
    return "atoms";
  }

  /**
   * Atomic design kurallarına uygun component oluştur
   */
  async createAtomicComponent(componentName, componentType, props = {}) {
    try {
      console.log(`🏗️ Atomic design component oluşturuluyor: ${componentName}`);

      // Atomic seviyeyi belirle
      const atomicLevel = this.determineAtomicLevel(componentName, componentType);
      console.log(`📊 Atomic seviye: ${atomicLevel}`);

      // Component klasörünü oluştur
      const componentDir = path.join(this.projectRoot, "src", "components", atomicLevel);
      await fs.ensureDir(componentDir);

      // Component dosya yolunu belirle
      const componentPath = path.join(componentDir, `${componentName}.tsx`);
      
      // Component içeriğini oluştur
      const componentContent = this.generateComponentContent(componentName, atomicLevel, props);
      
      // Component dosyasını oluştur
      await fs.writeFile(componentPath, componentContent);

      console.log(`✅ Component oluşturuldu: ${componentPath}`);

      // Storybook kurulu mu kontrol et
      const isStorybookInstalled = await this.storybookSetup.isStorybookInstalled();
      if (!isStorybookInstalled) {
        console.log("📚 Storybook kurulu değil, otomatik kurulum başlatılıyor...");
        await this.storybookSetup.setup();
      }

      // Story dosyası oluştur
      await this.storyGenerator.generateStoryForNewComponent(componentPath);

      // Log dosyasına kaydet
      await this.logComponentCreation(componentName, atomicLevel, componentPath);

      return {
        success: true,
        componentPath,
        atomicLevel,
        storyPath: this.storyGenerator.getStoryPath(componentPath)
      };

    } catch (error) {
      console.error(`❌ Component oluşturma hatası:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Component içeriğini oluştur
   */
  generateComponentContent(componentName, atomicLevel, props) {
    const propsInterface = Object.keys(props).length > 0 
      ? `interface ${componentName}Props {
  ${Object.entries(props).map(([key, type]) => `  ${key}?: ${type};`).join('\n  ')}
}`
      : `interface ${componentName}Props {
  children?: React.ReactNode;
}`;

    const propsDestructuring = Object.keys(props).length > 0 
      ? `{ ${Object.keys(props).join(', ')}, ...rest }: ${componentName}Props`
      : `{ children, ...rest }: ${componentName}Props`;

    const componentContent = `import React from 'react';
import { Box, Typography } from '@mui/material';

${propsInterface}

/**
 * ${componentName} - ${atomicLevel.charAt(0).toUpperCase() + atomicLevel.slice(1)} Component
 * 
 * Atomic Design Level: ${atomicLevel}
 * Description: ${this.getAtomicLevelDescription(atomicLevel)}
 */
export const ${componentName}: React.FC<${componentName}Props> = (${propsDestructuring}) => {
  return (
    <Box component="div" {...rest}>
      <Typography variant="body1">
        ${componentName} Component
      </Typography>
      {children}
    </Box>
  );
};

export default ${componentName};
`;

    return componentContent;
  }

  /**
   * Atomic seviye açıklamasını al
   */
  getAtomicLevelDescription(atomicLevel) {
    const descriptions = {
      atoms: "En küçük bileşenler - Button, TextField, Icon",
      molecules: "İki veya daha fazla atomun birleşimi",
      organisms: "Sayfa parçalarını temsil eden büyük bileşenler",
      templates: "Layout ve şablonlar",
      pages: "Tam sayfa bileşenleri"
    };
    return descriptions[atomicLevel] || "Component";
  }

  /**
   * Mevcut component'i atomic design kurallarına göre güncelle
   */
  async updateComponentToAtomic(componentPath) {
    try {
      console.log(`🔄 Component atomic design kurallarına göre güncelleniyor: ${componentPath}`);

      // Component dosyasını oku
      const componentContent = await fs.readFile(componentPath, 'utf8');
      
      // Component name'i çıkar
      const componentName = path.basename(componentPath, '.tsx');
      
      // Atomic seviyeyi belirle
      const atomicLevel = this.determineAtomicLevel(componentName);
      
      // Yeni içeriği oluştur
      const updatedContent = this.generateComponentContent(componentName, atomicLevel);
      
      // Dosyayı güncelle
      await fs.writeFile(componentPath, updatedContent);
      
      // Story dosyasını güncelle
      await this.storyGenerator.updateStoryForComponent(componentPath);

      console.log(`✅ Component güncellendi: ${componentPath}`);

      return { success: true, componentPath, atomicLevel };

    } catch (error) {
      console.error(`❌ Component güncelleme hatası:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Tüm atomic design componentlerini tara ve story oluştur
   */
  async generateStoriesForAllComponents() {
    try {
      console.log("📚 Tüm atomic design componentleri için story oluşturuluyor...");

      // Storybook kurulu mu kontrol et
      const isStorybookInstalled = await this.storybookSetup.isStorybookInstalled();
      if (!isStorybookInstalled) {
        console.log("📚 Storybook kurulu değil, otomatik kurulum başlatılıyor...");
        await this.storybookSetup.setup();
      }

      // Tüm story'leri oluştur
      await this.storyGenerator.generateAllStories();

      console.log("✅ Tüm story'ler oluşturuldu!");

      return { success: true };

    } catch (error) {
      console.error(`❌ Story oluşturma hatası:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Component oluşturma işlemini logla
   */
  async logComponentCreation(componentName, atomicLevel, componentPath) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: "atomic_component_created",
      componentName,
      atomicLevel,
      componentPath,
      agent: "developer-agent",
      status: "completed"
    };

    const logPath = path.join(
      __dirname,
      "..",
      "shared",
      "logs",
      "atomic-design.log"
    );
    await fs.ensureDir(path.dirname(logPath));

    await fs.appendFile(logPath, JSON.stringify(logEntry) + "\n");
  }

  /**
   * Developer Agent workflow hook'u
   */
  async onTaskCompleted(taskData) {
    console.log(`🤖 Developer Agent: Task tamamlandı - ${taskData.taskId}`);
    
    // Task'ta component oluşturma varsa story oluştur
    if (taskData.componentCreated) {
      await this.generateStoriesForAllComponents();
    }
  }
}

// CLI kullanımı
if (require.main === module) {
  const atomic = new DeveloperAgentAtomic();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Kullanım:");
    console.log("  node developer-agent-atomic.js --create <name> [type] [props]  # Component oluştur");
    console.log("  node developer-agent-atomic.js --update <path>                # Component güncelle");
    console.log("  node developer-agent-atomic.js --stories                      # Tüm story'leri oluştur");
    process.exit(1);
  }

  const command = args[0];

  switch (command) {
    case "--create":
      if (args[1]) {
        const componentName = args[1];
        const componentType = args[2] || "";
        const props = args[3] ? JSON.parse(args[3]) : {};
        atomic.createAtomicComponent(componentName, componentType, props);
      } else {
        console.log("❌ Component name gerekli");
      }
      break;

    case "--update":
      if (args[1]) {
        atomic.updateComponentToAtomic(args[1]);
      } else {
        console.log("❌ Component path gerekli");
      }
      break;

    case "--stories":
      atomic.generateStoriesForAllComponents();
      break;

    default:
      console.log("❌ Bilinmeyen komut");
      break;
  }
}

module.exports = DeveloperAgentAtomic; 