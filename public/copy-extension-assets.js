
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

// List of files to copy from public to dist
const filesToCopy = [
  'manifest.json',
  'manifest.edge.json',
  'manifest.firefox.json',
  'browser-polyfill.min.js',
  'icon-16.png',
  'icon-48.png',
  'icon-128.png',
  'icon-16-active.png',
  'icon-48-active.png',
  'icon-128-active.png',
  'favicon.ico',
  'placeholder.svg'
];

// Copy each file
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

// Also copy content.js, background.js, and mercari-content.js if they aren't being bundled correctly
['content.js', 'background.js', 'mercari-content.js'].forEach(file => {
  const sourcePath = path.join('./public', file);
  const destPath = path.join('./dist', file);
  
  // Only copy if source exists and destination doesn't
  if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${file} to dist folder`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error copying ${file}:`, error);
      warningCount++;
    }
  }
});

console.log(`\n📦 Done copying extension assets: ${successCount} files copied, ${warningCount} warnings`);
console.log('Run the validation script next to verify the build is complete and valid.');
