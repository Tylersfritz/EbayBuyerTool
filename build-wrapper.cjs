
/**
 * CommonJS Build Wrapper
 * This script acts as a CommonJS wrapper around the ES module build script
 * to resolve module system conflicts without requiring package.json modifications
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 DealHaven Build Wrapper Starting...');
console.log('=====================================');

// Define paths
const publicDir = path.join(__dirname, 'public');
const buildScriptPath = path.join(publicDir, 'run-build-extension.js');

// Check if build script exists
if (!fs.existsSync(buildScriptPath)) {
  console.error(`❌ Error: Build script not found at ${buildScriptPath}`);
  process.exit(1);
}

// Execute the build script with node directly
try {
  console.log(`📦 Executing build script: ${buildScriptPath}`);
  // Use --no-warnings to suppress ES module warnings
  execSync(`node --no-warnings ${buildScriptPath}`, { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
