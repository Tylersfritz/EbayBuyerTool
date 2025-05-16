
/**
 * Build Verification Script
 * This script runs after the build to verify that all required files exist in the dist directory
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying DealHaven Extension Build...');
console.log('=========================================');

// Check if dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ CRITICAL ERROR: dist directory not found! Build failed.');
  process.exit(1);
}

// Essential files that must be present
const essentialFiles = [
  'manifest.json',
  'index.html',
  'browser-polyfill.min.js',
  'content.js',
  'background.js',
  'mercari-content.js',
  'icon-16.png',
  'icon-48.png',
  'icon-128.png'
];

// Check for each essential file
const missingFiles = [];
essentialFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
    console.error(`❌ Missing essential file: ${file}`);
  } else {
    const stats = fs.statSync(filePath);
    console.log(`✅ Found ${file} (${stats.size} bytes)`);
  }
});

// Check HTML for asset references
try {
  const htmlPath = path.join(distDir, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Check for essential script references
  if (!htmlContent.includes('browser-polyfill.min.js')) {
    console.error('❌ index.html is missing reference to browser-polyfill.min.js');
  }
  
  // Check for base href tag that could cause issues
  if (htmlContent.includes('<base href="/"')) {
    console.error('❌ index.html contains <base href="/"> tag which can cause path issues');
  }
  
  console.log('✅ Completed HTML verification checks');
} catch (error) {
  console.error(`❌ Error checking index.html: ${error.message}`);
}

// Summary
if (missingFiles.length === 0) {
  console.log('\n✅ All essential files are present in the dist directory!');
  console.log('✅ Extension build verification passed.');
} else {
  console.error(`\n❌ Missing ${missingFiles.length} essential files from dist directory.`);
  console.error('The build process did not complete successfully.');
  process.exit(1);
}

// Additional info for users
console.log('\nNext steps:');
console.log('1. Test the extension by loading it in Chrome from the dist directory');
console.log('2. If issues persist, run "node public/fix-manifest.js" followed by "node public/run-build-extension.js"');
console.log('3. Check for detailed logs in the console during the build process');
