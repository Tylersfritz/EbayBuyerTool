
/**
 * Improved Build Extension Script
 * This script implements a proper sequential build process for the extension
 * 1. Run fix-manifest.js to prepare manifest and files
 * 2. Run vite build to build the React app
 * 3. Run build-extension.js to copy all files to dist
 * 4. Validate the extension build
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Running DealHaven Extension Build Sequence...');
console.log('===========================================');

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

// Step 1: Run fix-manifest.js to prepare manifest and files
console.log('\n📝 Step 1: Preparing manifest and files...');
if (!runStep(1, `node ${path.join(__dirname, 'fix-manifest.js')}`, 'Failed to prepare manifest')) {
  process.exit(1);
}

// Step 2: Run vite build to build the React app
console.log('\n🛠️ Step 2: Building React application with Vite...');
if (!runStep(2, 'npx vite build', 'Failed to build React application')) {
  process.exit(1);
}

// Step 3: Run build-extension.js to copy all files to dist
console.log('\n📦 Step 3: Copying extension files to dist...');
if (!runStep(3, `node ${path.join(__dirname, 'build-extension.js')}`, 'Failed to copy extension files')) {
  process.exit(1);
}

// Step 4: Validate the extension build
console.log('\n🔍 Step 4: Validating extension build...');
if (!runStep(4, `node ${path.join(__dirname, 'extension-validation.js')}`, 'Extension validation failed')) {
  process.exit(1);
}

console.log('\n🎉 Extension build completed successfully!');
console.log('\nNext steps:');
console.log('1. Open Chrome and navigate to chrome://extensions/');
console.log('2. Enable "Developer mode" in the top right corner');
console.log('3. Click "Load unpacked" and select the "dist" directory');
console.log(`   (${path.resolve(distDir)})`);
