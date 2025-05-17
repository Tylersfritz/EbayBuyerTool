
/**
 * CommonJS Extension Build Script
 * This script serves as the entry point for extension builds
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 DealHavenAI Extension Build Script');
console.log('==================================');

// Get the project directory
const projectDir = path.resolve('.');
console.log(`Working directory: ${projectDir}`);

// Define paths to components we need to verify
const arbitragePromptPath = path.join(projectDir, 'src', 'components', 'arbitrage', 'ArbitragePrompt.tsx');
const visualScannerPath = path.join(projectDir, 'src', 'components', 'visualScanner', 'VisualScanner.tsx');

// Verify critical components exist
console.log('Verifying critical components...');
if (fs.existsSync(arbitragePromptPath)) {
  console.log(`✅ ArbitragePrompt.tsx found at ${arbitragePromptPath}`);
} else {
  console.error(`❌ ArbitragePrompt.tsx not found at ${arbitragePromptPath}`);
}

if (fs.existsSync(visualScannerPath)) {
  console.log(`✅ VisualScanner.tsx found at ${visualScannerPath}`);
} else {
  console.error(`❌ VisualScanner.tsx not found at ${visualScannerPath}`);
}

// Check if the React import exists in main.tsx
const mainTsxPath = path.join(projectDir, 'src', 'main.tsx');
console.log(`Checking React import in ${mainTsxPath}...`);
if (fs.existsSync(mainTsxPath)) {
  try {
    const mainContent = fs.readFileSync(mainTsxPath, 'utf8');
    if (mainContent.includes('import React from')) {
      console.log('✅ React import found in main.tsx');
    } else {
      console.warn('⚠️ No React import found in main.tsx, adding it now...');
      const newContent = `import React from 'react'\n${mainContent}`;
      fs.writeFileSync(mainTsxPath, newContent, 'utf8');
      console.log('✅ Added React import to main.tsx');
    }
  } catch (error) {
    console.error(`❌ Error checking main.tsx: ${error.message}`);
  }
} else {
  console.error(`❌ main.tsx not found at ${mainTsxPath}`);
}

// Define the path to the safe rebuild script
const safeRebuildPath = path.join(projectDir, 'public', 'safe-rebuild-extension.js');

// First check if the script exists
if (!fs.existsSync(safeRebuildPath)) {
  console.error(`❌ Could not find build script at: ${safeRebuildPath}`);
  
  // Try the CJS version
  const cjsVersionPath = path.join(projectDir, 'public', 'safe-rebuild-extension.cjs');
  if (fs.existsSync(cjsVersionPath)) {
    console.log(`Found CJS version at ${cjsVersionPath}, using it...`);
    
    try {
      execSync(`node "${cjsVersionPath}"`, { stdio: 'inherit' });
      console.log('✅ Extension build completed successfully!');
    } catch (error) {
      console.error('❌ Build process failed:', error.message);
      process.exit(1);
    }
  } else {
    // Create a simplified version if none exists
    console.log('Creating simplified build script...');
    const simpleBuildScript = `
      const { execSync } = require('child_process');
      const fs = require('fs');
      const path = require('path');

      // Ensure dist directory exists
      const distDir = path.join(__dirname, '..', 'dist');
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      // Run Vite build with explicit React settings
      console.log('Running Vite build...');
      execSync('npx vite build --force', { stdio: 'inherit' });

      // Copy manifest and other files
      console.log('Copying extension files...');
      const filesToCopy = ['manifest.json', 'browser-polyfill.min.js', 'content.js', 'background.js', 'mercari-content.js'];
      
      filesToCopy.forEach(file => {
        const src = path.join(__dirname, file);
        const dest = path.join(distDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log(\`Copied \${file}\`);
        }
      });

      console.log('Build complete!');
    `;
    
    fs.writeFileSync(safeRebuildPath, simpleBuildScript);
    console.log(`✅ Created simplified build script at ${safeRebuildPath}`);
    
    try {
      execSync(`node "${safeRebuildPath}"`, { stdio: 'inherit' });
      console.log('✅ Extension build completed successfully!');
    } catch (error) {
      console.error('❌ Build process failed:', error.message);
      process.exit(1);
    }
  }
} else {
  // Run the safe rebuild script
  try {
    console.log(`\n🛠️ Running build script: ${safeRebuildPath}`);
    execSync(`node "${safeRebuildPath}"`, { stdio: 'inherit' });
    console.log('✅ Extension build completed successfully!');
  } catch (error) {
    console.error('❌ Build process failed:', error.message);
    process.exit(1);
  }
}

// Verify the build
try {
  const distDir = path.join(projectDir, 'dist');
  const manifestPath = path.join(distDir, 'manifest.json');
  
  if (fs.existsSync(manifestPath)) {
    console.log('✅ Build verification: manifest.json exists in dist folder');
    
    // Check for other critical files
    const criticalFiles = [
      'index.html',
      'background.js',
      'content.js'
    ];
    
    const missingFiles = criticalFiles.filter(file => !fs.existsSync(path.join(distDir, file)));
    
    if (missingFiles.length === 0) {
      console.log('✅ All critical files are present in the dist folder');
    } else {
      console.warn(`⚠️ Missing some files in dist: ${missingFiles.join(', ')}`);
    }
  } else {
    console.error('❌ Build verification failed: manifest.json not found in dist folder');
  }
} catch (error) {
  console.error('❌ Error during build verification:', error.message);
}

console.log('\n🎉 Build process complete!');
console.log('\nTo load your extension in Chrome:');
console.log('1. Go to chrome://extensions/');
console.log('2. Enable "Developer mode" in the top right corner');
console.log('3. Click "Load unpacked" and select the dist folder:');
console.log(`   ${path.resolve(path.join(projectDir, 'dist'))}`);
console.log('\nTo package the extension for Chrome Web Store submission:');
console.log('   zip -r extension.zip dist');
