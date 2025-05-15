
/**
 * Simple wrapper script to run build-extension.js
 * This is needed because we can't modify package.json to add new scripts
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Running Extension Build Script...');

const buildExtensionPath = path.join(__dirname, 'build-extension.js');

if (!fs.existsSync(buildExtensionPath)) {
  console.error('❌ Error: build-extension.js not found in public directory!');
  process.exit(1);
}

try {
  // Execute the build extension script
  const output = execSync(`node ${buildExtensionPath}`, { 
    encoding: 'utf8',
    stdio: 'inherit' // This will show the output in real-time
  });
  
  console.log('✅ Extension build completed successfully');
} catch (error) {
  console.error('❌ Error running build-extension.js:', error.message);
  process.exit(1);
}
