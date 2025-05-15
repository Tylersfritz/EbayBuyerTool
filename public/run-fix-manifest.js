
/**
 * Simple wrapper script to run fix-manifest.js
 * This makes it easier to run the script from the terminal
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Running Fix Manifest Script...');

const fixManifestPath = path.join(__dirname, 'fix-manifest.js');

if (!fs.existsSync(fixManifestPath)) {
  console.error('❌ Error: fix-manifest.js not found in public directory!');
  process.exit(1);
}

try {
  // Execute the fix manifest script
  const output = execSync(`node ${fixManifestPath}`, { encoding: 'utf8' });
  console.log(output);
  console.log('✅ Fix manifest script completed successfully');
} catch (error) {
  console.error('❌ Error running fix-manifest.js:', error.message);
  process.exit(1);
}
