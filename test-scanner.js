const { ComponentScanner, defaultScannerConfig } = require('./utils/componentScanner.ts');

async function testScanner() {
  console.log('🧪 Component Scanner Test Başlıyor...');
  
  const scanner = new ComponentScanner(defaultScannerConfig);
  
  try {
    console.log('📂 Componentler taranıyor...');
    const components = await scanner.scanAllComponents();
    
    console.log(`✅ ${components.length} component bulundu:`);
    
    components.forEach(component => {
      console.log(`  - ${component.name} (${component.category})`);
      console.log(`    Path: ${component.path}`);
      console.log(`    Props:`, component.props);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Scanner hatası:', error);
  }
}

testScanner(); 