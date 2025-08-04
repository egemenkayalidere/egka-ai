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

      // Component bilgilerini analiz et
      const componentInfo = this.analyzeComponent(componentPath);

      // Story dosyası içeriğini oluştur
      const storyContent = this.createStoryContent(componentInfo);

      // Story dosyasını yaz
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
    // Component props'ları buraya otomatik eklenebilir
  }
};

// Varsayılan hikaye
export const Default = (args) => <${componentName} {...args} />;
Default.args = {
  // Varsayılan props'lar
};

// Primary varyantı
export const Primary = (args) => <${componentName} {...args} />;
Primary.args = {
  variant: 'primary',
  // Diğer props'lar
};

// Secondary varyantı
export const Secondary = (args) => <${componentName} {...args} />;
Secondary.args = {
  variant: 'secondary',
  // Diğer props'lar
};

// Disabled durumu
export const Disabled = (args) => <${componentName} {...args} />;
Disabled.args = {
  disabled: true,
  // Diğer props'lar
};

// Farklı boyutlar
export const Small = (args) => <${componentName} {...args} />;
Small.args = {
  size: 'small',
  // Diğer props'lar
};

export const Large = (args) => <${componentName} {...args} />;
Large.args = {
  size: 'large',
  // Diğer props'lar
};

// HTML Preview için özel hikaye
export const HTMLPreview = () => {
  return (
    <div>
      <h3>HTML Çıktısı:</h3>
      <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
        <${componentName} variant="primary">Primary Button</${componentName}>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
        <${componentName} variant="secondary">Secondary Button</${componentName}>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
        <${componentName} disabled>Disabled Button</${componentName}>
      </div>
    </div>
  );
};
HTMLPreview.parameters = {
  docs: {
    description: {
      story: 'Componentin HTML çıktısı ve farklı varyantları'
    }
  }
};
`;
  }

  /**
   * Story dosyası path'ini oluştur
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
      .split(/[-_]/)
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

      const files = await fs.readdir(dirPath);
      const componentFiles = files.filter(
        (file) =>
          file.endsWith(".tsx") ||
          file.endsWith(".jsx") ||
          file.endsWith(".ts") ||
          file.endsWith(".js")
      );

      for (const file of componentFiles) {
        const componentPath = path.join(dirPath, file);
        await this.generateStory(componentPath);
      }

      console.log(
        `✅ ${componentFiles.length} component için story dosyaları oluşturuldu`
      );
    } catch (error) {
      console.error(`❌ Klasör tarama hatası:`, error.message);
      throw error;
    }
  }
}

// CLI kullanımı
if (require.main === module) {
  const storyGenerator = new StoryGenerator();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Kullanım: node generate-story.js <component-path>");
    console.log(
      "Örnek: node generate-story.js src/components/atoms/MyButton.tsx"
    );
    process.exit(1);
  }

  const componentPath = args[0];

  if (fs.statSync(componentPath).isDirectory()) {
    storyGenerator.generateStoriesForDirectory(componentPath);
  } else {
    storyGenerator.generateStory(componentPath);
  }
}

module.exports = StoryGenerator;
