/**
 * Improved Build Extension Script
 * This script implements a proper sequential build process for the extension
 * 1. Run fix-manifest.cjs to prepare manifest and files
 * 2. Run vite build to build the React app
 * 3. Run build-extension.cjs to copy all files to dist
 * 4. Run copy-web-accessible-resources.js to ensure all web resources are copied
 * 5. Validate the extension build with verify-build.js
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Running DealHaven Extension Build Sequence...');
console.log('===========================================');

// First make sure dist directory is clean
console.log('🧹 Cleaning dist directory...');
if (fs.existsSync(path.join(__dirname, '..', 'dist'))) {
  try {
    if (process.platform === "win32") {
      execSync(`rmdir /s /q "${path.join(__dirname, '..', 'dist')}"`, { stdio: 'ignore' });
    } else {
      execSync(`rm -rf "${path.join(__dirname, '..', 'dist')}"`, { stdio: 'ignore' });
    }
    console.log('✅ Removed old dist directory');
  } catch (error) {
    console.error(`❌ Error cleaning dist directory: ${error.message}`);
  }
}

// Helper to run a command with proper error handling
function runStep(step, command, errorMessage) {
  console.log(`\n📋 Step ${step}: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Step ${step} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Step ${step} failed: ${errorMessage}`);
    console.error(error.message);
    return false;
  }
}

// Ensure dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('✅ Created dist directory');
}

// Step 1: Run fix-manifest.cjs to prepare manifest and files
console.log('\n📝 Step 1: Preparing manifest and files...');
if (!runStep(1, `node ${path.join(__dirname, 'fix-manifest.cjs')}`, 'Failed to prepare manifest')) {
  process.exit(1);
}

// Step 2: Run vite build to build the React app
console.log('\n🛠️ Step 2: Building React application with Vite...');
if (!runStep(2, 'npx vite build', 'Failed to build React application')) {
  process.exit(1);
}

// Step 3: Run build-extension.cjs to copy all files to dist
console.log('\n📦 Step 3: Copying extension files to dist...');
if (!runStep(3, `node ${path.join(__dirname, 'build-extension.cjs')}`, 'Failed to copy extension files')) {
  process.exit(1);
}

// Step 4: Run copy-web-accessible-resources.js to ensure all web resources are copied
console.log('\n🖼️ Step 4: Copying web accessible resources...');
if (!runStep(4, `node ${path.join(__dirname, 'copy-web-accessible-resources.js')}`, 'Failed to copy web accessible resources')) {
  process.exit(1);
}

// Step 5: Validate the extension build
console.log('\n🔍 Step 5: Validating extension build...');
if (!runStep(5, `node ${path.join(__dirname, 'verify-build.js')}`, 'Extension validation failed')) {
  process.exit(1);
}

// Verify that ArbitragePrompt.tsx and VisualScanner.tsx components are included
console.log('\n🔍 Checking for critical components...');
const componentsToCheck = [
  { componentName: 'ArbitragePrompt', path: '../src/components/arbitrage/ArbitragePrompt.tsx' },
  { componentName: 'VisualScanner', path: '../src/components/visualScanner/VisualScanner.tsx' }
];

componentsToCheck.forEach(component => {
  const componentPath = path.join(__dirname, component.path);
  if (fs.existsSync(componentPath)) {
    console.log(`✅ Found ${component.componentName} component at ${componentPath}`);
  } else {
    console.error(`❌ Could not find ${component.componentName} component at ${componentPath}`);
  }
});

console.log('\n🎉 Extension build completed successfully!');
console.log('\nNext steps:');
console.log('1. Open Chrome and navigate to chrome://extensions/');
console.log('2. Enable "Developer mode" in the top right corner');
console.log('3. Click "Load unpacked" and select the "dist" directory');
console.log(`   (${path.resolve(distDir)})`);
console.log('\nTo package the extension for Chrome Web Store submission:');
console.log('   zip -r extension.zip dist');