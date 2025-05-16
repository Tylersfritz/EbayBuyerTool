
/**
 * Script to check and create missing extension files
 * Run this script with: node public/check-extension-files.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for critical extension files...');

const publicDir = path.resolve('./public');

// Check if icon-16-active.png exists
const icon16ActivePath = path.join(publicDir, 'icon-16-active.png');
const icon16Path = path.join(publicDir, 'icon-16.png');

if (!fs.existsSync(icon16ActivePath) && fs.existsSync(icon16Path)) {
  console.log('Creating missing icon-16-active.png from icon-16.png...');
  fs.copyFileSync(icon16Path, icon16ActivePath);
  console.log('✅ Created icon-16-active.png');
}

// Verify all critical files exist
const criticalFiles = [
  'manifest.json',
  'browser-polyfill.min.js',
  'content.js',
  'background.js',
  'mercari-content.js',
  'placeholder.svg',
  'icon-16.png',
  'icon-48.png',
  'icon-128.png',
  'icon-16-active.png', // We just created this if missing
  'icon-48-active.png',
  'icon-128-active.png',
  'favicon.ico'
];

const missingFiles = [];

criticalFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  } else {
    try {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${file} exists (${stats.size} bytes)`);
    } catch (err) {
      console.log(`⚠️ ${file} exists but couldn't get file size: ${err.message}`);
    }
  }
});

if (missingFiles.length > 0) {
  console.error('❌ Missing critical files:', missingFiles.join(', '));
} else {
  console.log('✅ All critical files exist in public directory');
}

// Validate manifest.json
const manifestPath = path.join(publicDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    console.log(`📊 manifest.json size: ${manifestContent.length} bytes`);
    try {
      JSON.parse(manifestContent);
      console.log('✅ manifest.json is valid JSON');
    } catch (jsonError) {
      console.error('❌ manifest.json is NOT valid JSON:', jsonError.message);
    }
  } catch (err) {
    console.error('❌ Error reading manifest.json:', err.message);
  }
} else {
  console.error('❌ manifest.json is missing in public directory!');
}
