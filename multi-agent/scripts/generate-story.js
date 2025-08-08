#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

/**
 * Atomic Design Componentleri için Otomatik Story Dosyası Oluşturucu
 *
 * Kullanım:
 * node generate-story.js <component-path>
 *
 * Örnek:
 * node generate-story.js src/components/atoms/MyButton.tsx
 */

class StoryGenerator {
  constructor() {
    this.atomicLevels = [
      "atoms",
      "molecules",
      "organisms",
      "templates",
      "pages",
    ];
  }

  /**
   * Component dosyasından story dosyası oluştur
   */
  async generateStory(componentPath) {
    try {
      console.log(`📝 Story dosyası oluşturuluyor: ${componentPath}`);

      const componentInfo = this.analyzeComponent(componentPath);
      const storyContent = this.createStoryContent(componentInfo);
      const storyPath = this.getStoryPath(componentPath);

      await fs.writeFile(storyPath, storyContent);
      console.log(`✅ Story dosyası oluşturuldu: ${storyPath}`);

      return storyPath;
    } catch (error) {
      console.error(`❌ Story oluşturma hatası:`, error.message);
      throw error;
    }
  }

  /**
   * Component dosyasını analiz et
   */
  analyzeComponent(componentPath) {
    const fileName = path.basename(componentPath, path.extname(componentPath));
    const dirName = path.dirname(componentPath);
    const atomicLevel = this.getAtomicLevel(dirName);

    return {
      fileName,
      componentName: this.toPascalCase(fileName),
      atomicLevel,
      dirPath: dirName,
      fullPath: componentPath,
    };
  }

  /**
   * Atomic design seviyesini belirle
   */
  getAtomicLevel(dirPath) {
    const pathParts = dirPath.split(path.sep);

    for (const level of this.atomicLevels) {
      if (pathParts.includes(level)) {
        return level;
      }
    }

    return "atoms"; // Varsayılan
  }

  /**
   * Story dosyası içeriğini oluştur
   */
  createStoryContent(componentInfo) {
    const { componentName, atomicLevel, fileName } = componentInfo;

    return `import React from 'react';
import { ${componentName} } from './${fileName}';

export default {
  title: '${this.toTitleCase(atomicLevel)}/${componentName}',
  component: ${componentName},
  parameters: {
    docs: {
      description: {
        component: '${componentName} componenti - ${atomicLevel} seviyesinde'
      }
    }
  },
  argTypes: {
    // Component props'ları buraya eklenebilir
  }
};

// Default story
export const Default = {
  args: {
    // Default props
  }
};

// Primary variant
export const Primary = {
  args: {
    // Primary props
  }
};

// Secondary variant
export const Secondary = {
  args: {
    // Secondary props
  }
};

// Disabled variant
export const Disabled = {
  args: {
    disabled: true
  }
};

// Small variant
export const Small = {
  args: {
    size: 'small'
  }
};

// Large variant
export const Large = {
  args: {
    size: 'large'
  }
};

// HTML Preview
export const HTMLPreview = {
  parameters: {
    docs: {
      source: {
        type: 'code',
        language: 'html'
      }
    }
  },
  render: (args) => {
    return \`<div class="${componentName.toLowerCase()}">${componentName} Component</div>\`;
  }
};
`;
  }

  /**
   * Story dosyası yolunu al
   */
  getStoryPath(componentPath) {
    const dirName = path.dirname(componentPath);
    const fileName = path.basename(componentPath, path.extname(componentPath));
    return path.join(dirName, `${fileName}.stories.tsx`);
  }

  /**
   * String'i PascalCase'e çevir
   */
  toPascalCase(str) {
    return str
      .split(/[-_\s]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }

  /**
   * String'i TitleCase'e çevir
   */
  toTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
        await this.generateStory(componentPath);
      }

      console.log(`✅ Tüm story dosyaları oluşturuldu`);
    } catch (error) {
      console.error(`❌ Klasör story oluşturma hatası:`, error.message);
    }
  }
}

// CLI kullanımı
if (require.main === module) {
  const generator = new StoryGenerator();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Kullanım:");
    console.log("  node generate-story.js <component-path>");
    console.log("");
    console.log("Örnek:");
    console.log("  node generate-story.js src/components/atoms/MyButton.tsx");
    process.exit(1);
  }

  const componentPath = args[0];
  generator.generateStory(componentPath).catch(console.error);
}

module.exports = StoryGenerator;
