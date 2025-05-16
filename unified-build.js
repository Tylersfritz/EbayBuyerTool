
#!/usr/bin/env node

/**
 * Unified Build Script
 * This script runs the build process without modifying package.json
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 DealHaven Unified Build Process');
console.log('=================================');

// Check for package.json existence without attempting to modify it
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found');
  process.exit(1);
}

// First run vite build
console.log('\n📦 Step 1: Running Vite build...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Vite build completed successfully');
} catch (error) {
  console.error('❌ Vite build failed:', error.message);
  process.exit(1);
}

// Then run the extension build script
console.log('\n📦 Step 2: Running extension build process...');
try {
  execSync('node unified-build-extension.js', { stdio: 'inherit' });
  console.log('✅ Extension build completed successfully');
} catch (error) {
  console.error('❌ Extension build failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 Unified build process completed!');
console.log('\nYou can now load your extension from the dist directory:');
console.log(`  ${path.resolve(path.join(__dirname, 'dist'))}`);
