
#!/usr/bin/env node

/**
 * DealHaven Extension Build Script (CommonJS)
 * This script handles copying essential files and verification of the build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 DealHavenAI Extension Build Script (CJS version)');
console.log('================================================');

// Clean build environment
console.log('\n🧹 Cleaning build environment...');
try {
  console.log('Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Npm cache cleared');
  
  console.log('Removing dist directory if it exists...');
  if (fs.existsSync('./dist')) {
    if (process.platform === "win32") {
      execSync('rmdir /s /q dist', { stdio: 'inherit' });
    } else {
      execSync('rm -rf dist', { stdio: 'inherit' });
    }
  }
  console.log('✅ Dist directory removed');
} catch (error) {
  console.warn(`⚠️ Clean environment warning: ${error.message}`);
  console.log('Continuing with build process...');
}

// Define critical paths
const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');
const srcDir = path.join(rootDir, 'src');
const lovableDevSrcDir = path.join(rootDir, 'lovable.dev', 'src');

// Step 1: Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  console.log('📁 Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
}

// Step 2: Copy essential files from public/ to dist/
const essentialFiles = ['manifest.json', 'content.js', 'background.js', 'browser-polyfill.min.js', 'mercari-content.js'];
console.log('\n📋 Copying essential files from public/ to dist/...');

for (const file of essentialFiles) {
  const srcFile = path.join(publicDir, file);
  const destFile = path.join(distDir, file);
  
  if (fs.existsSync(srcFile)) {
    try {
      fs.copyFileSync(srcFile, destFile);
      console.log(`✅ Copied ${file} to dist/`);
    } catch (error) {
      console.error(`❌ Error copying ${file}: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.error(`❌ Required file not found: ${srcFile}`);
    process.exit(1);
  }
}

// Step 3: Copy icon files
const iconFiles = ['icon-16.png', 'icon-48.png', 'icon-128.png',
                  'icon-16-active.png', 'icon-48-active.png', 'icon-128-active.png'];
console.log('\n📋 Copying icon files...');

for (const file of iconFiles) {
  const srcFile = path.join(publicDir, file);
  const destFile = path.join(distDir, file);
  
  if (fs.existsSync(srcFile)) {
    try {
      fs.copyFileSync(srcFile, destFile);
      console.log(`✅ Copied ${file} to dist/`);
    } catch (error) {
      console.warn(`⚠️ Could not copy icon ${file}: ${error.message}`);
      // Don't exit for missing icons
    }
  } else {
    console.warn(`⚠️ Icon file not found: ${srcFile}`);
  }
}

// Step 4: Copy web accessible resources
const resourceFiles = ['price-check.png', 'negotiation-assistance.png', 'auction-bidedge.png', 'auction-sniping.png', 'arbitrage-search.png', 'placeholder.svg', 'favicon.ico'];
console.log('\n📋 Copying web accessible resources...');

for (const file of resourceFiles) {
  const srcFile = path.join(publicDir, file);
  const destFile = path.join(distDir, file);
  
  if (fs.existsSync(srcFile)) {
    try {
      fs.copyFileSync(srcFile, destFile);
      console.log(`✅ Copied ${file} to dist/`);
    } catch (error) {
      console.warn(`⚠️ Could not copy resource ${file}: ${error.message}`);
    }
  } else {
    console.warn(`⚠️ Resource file not found: ${srcFile}`);
  }
}

// Step 5: Copy lovable.dev/src/ to src/ if it exists
if (fs.existsSync(lovableDevSrcDir)) {
  console.log('\n📋 Found lovable.dev/src directory - copying files to src/...');

  /**
   * Copy directory recursively
   */
  function copyDirRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDirRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${srcPath} to ${destPath}`);
      }
    }
  }
  
  try {
    copyDirRecursive(lovableDevSrcDir, srcDir);
    console.log('✅ Successfully copied lovable.dev/src to src/');
  } catch (error) {
    console.error(`❌ Error copying lovable.dev files: ${error.message}`);
  }
} else {
  console.log('\n⚠️ lovable.dev/src not found - skipping this step');
}

// Step 6: Verify critical components are included in the build
console.log('\n🔍 Verifying critical components in the build...');

// Check for ArbitragePrompt.tsx and VisualScanner.tsx source files
const arbitragePromptPath = path.join(srcDir, 'components', 'arbitrage', 'ArbitragePrompt.tsx');
const visualScannerPath = path.join(srcDir, 'components', 'visualScanner', 'VisualScanner.tsx');

if (!fs.existsSync(arbitragePromptPath)) {
  console.error('❌ Critical component missing: ArbitragePrompt.tsx');
  console.error(`   Expected at: ${arbitragePromptPath}`);
  process.exit(1);
} else {
  console.log('✅ Found ArbitragePrompt.tsx source file');
}

if (!fs.existsSync(visualScannerPath)) {
  console.error('❌ Critical component missing: VisualScanner.tsx');
  console.error(`   Expected at: ${visualScannerPath}`);
  process.exit(1);
} else {
  console.log('✅ Found VisualScanner.tsx source file');
}

// Verify Vite built output includes our components
const assetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  console.error('❌ No assets directory found in dist/');
  console.error('   This suggests the Vite build failed or was not executed');
  
  // Try to run the Vite build
  console.log('\n🛠️ Attempting to run Vite build...');
  try {
    execSync('npx vite build', { stdio: 'inherit' });
    console.log('✅ Vite build completed successfully');
  } catch (error) {
    console.error('❌ Vite build failed:', error.message);
    process.exit(1);
  }
}

if (fs.existsSync(assetsDir)) {
  console.log('\n🔍 Checking for compiled JavaScript files...');
  const jsFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.js'));
  
  if (jsFiles.length === 0) {
    console.error('❌ No JavaScript files found in dist/assets/');
    process.exit(1);
  }
  
  // Check content of compiled files for our component names
  let foundArbitragePrompt = false;
  let foundVisualScanner = false;
  
  for (const file of jsFiles) {
    const filePath = path.join(assetsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('ArbitragePrompt') || content.includes('arbitragePrompt')) {
      foundArbitragePrompt = true;
      console.log(`✅ Found ArbitragePrompt in ${file}`);
    }
    
    if (content.includes('VisualScanner') || content.includes('visualScanner')) {
      foundVisualScanner = true;
      console.log(`✅ Found VisualScanner in ${file}`);
    }
    
    if (foundArbitragePrompt && foundVisualScanner) {
      break;
    }
  }
  
  if (!foundArbitragePrompt) {
    console.error('❌ ArbitragePrompt component not found in compiled JS');
    process.exit(1);
  }
  
  if (!foundVisualScanner) {
    console.error('❌ VisualScanner component not found in compiled JS');
    process.exit(1);
  }
}

// Verify index.html exists
if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('❌ index.html missing from dist/');
  process.exit(1);
} else {
  console.log('✅ Found index.html in dist/');
}

// Final verification
console.log('\n🔍 Final verification...');
const requiredDistFiles = [
  'manifest.json',
  'index.html',
  'background.js',
  'content.js',
  'browser-polyfill.min.js'
];

const missingFiles = requiredDistFiles.filter(file => !fs.existsSync(path.join(distDir, file)));

if (missingFiles.length > 0) {
  console.error('❌ Missing required files in dist/:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
} else {
  console.log('✅ All required files present in dist/');
}

console.log('\n🎉 Build verification completed successfully!');
console.log('\nYou can now:');
console.log('1. Test the extension by loading it in Chrome from the dist directory');
console.log(`   (${path.resolve(distDir)})`);
console.log('2. Package the extension for Chrome Web Store submission:');
console.log('   zip -r extension.zip dist');
