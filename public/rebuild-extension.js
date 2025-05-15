
/**
 * Extension Rebuild Script
 * Cleans the dist directory and rebuilds the extension
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Cleaning extension build...');

const distDir = path.join(__dirname, '..', 'dist');

// Clear dist directory
if (fs.existsSync(distDir)) {
  console.log('Removing existing dist directory...');
  
  // On Windows, we need a different approach to handle permission errors
  try {
    if (process.platform === "win32") {
      execSync(`rmdir /s /q "${distDir}"`, { stdio: 'ignore' });
    } else {
      execSync(`rm -rf "${distDir}"`, { stdio: 'ignore' });
    }
    console.log('✅ Removed old dist directory');
  } catch (error) {
    console.error('❌ Error removing dist directory:', error.message);
    console.log('Continuing with build anyway...');
  }
}

// Create fresh dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('✅ Created fresh dist directory');
}

// Run the build script
console.log('\n🚀 Starting fresh extension build...');
try {
  execSync('node ' + path.join(__dirname, 'run-build-extension.js'), { 
    stdio: 'inherit' 
  });
  console.log('✅ Extension successfully rebuilt!');
} catch (error) {
  console.error('❌ Error rebuilding extension:', error.message);
  process.exit(1);
}
