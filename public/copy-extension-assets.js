
// This script can be used to manually copy extension assets if the build process fails to do so
// IMPORTANT: This version DOES NOT modify package.json or any read-only files

const fs = require('fs');
const path = require('path');

console.log('📦 Copying extension assets to dist directory...');

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
  console.log('Created dist directory');
}

// Define critical files that must be present for the extension to work
const criticalFiles = [
  'manifest.json',
  'browser-polyfill.min.js',
  'content.js',
  'background.js',
  'icon-16.png',
  'icon-48.png',
  'icon-128.png'
];

// Copy critical files first
console.log('Copying critical extension files first...');
let criticalErrors = false;

for (const file of criticalFiles) {
  const sourcePath = path.join('./public', file);
  const destPath = path.join('./dist', file);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied critical file ${file} to dist folder`);
    } else {
      console.error(`❌ CRITICAL ERROR: Could not find ${file} in public folder`);
      criticalErrors = true;
    }
  } catch (error) {
    console.error(`❌ CRITICAL ERROR copying ${file}:`, error);
    criticalErrors = true;
  }
}

if (criticalErrors) {
  console.error('❌ Critical errors encountered. Extension will not load properly!');
}

// List of non-critical files to copy from public to dist
const filesToCopy = [
  'manifest.edge.json',
  'manifest.firefox.json',
  'icon-16-active.png',
  'icon-48-active.png',
  'icon-128-active.png',
  'favicon.ico',
  'placeholder.svg',
  'mercari-content.js'
];

// Copy each non-critical file
let successCount = 0;
let warningCount = 0;

filesToCopy.forEach(file => {
  const sourcePath = path.join('./public', file);
  const destPath = path.join('./dist', file);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${file} to dist folder`);
      successCount++;
    } else {
      console.warn(`⚠️ Could not find ${file} in public folder`);
      warningCount++;
    }
  } catch (error) {
    console.error(`❌ Error copying ${file}:`, error);
    warningCount++;
  }
});

// Verify manifest.json is valid if it was copied
try {
  const manifestPath = path.join('./dist', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    JSON.parse(manifestContent); // This will throw if invalid JSON
    console.log('✅ manifest.json is valid JSON');
  }
} catch (error) {
  console.error('❌ manifest.json validation failed:', error.message);
}

console.log(`\n📦 Done copying extension assets: ${successCount} files copied, ${warningCount} warnings`);
console.log('Run the validation script next to verify the build is complete and valid.');
