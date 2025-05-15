
// This script can be used to manually copy extension assets if the build process fails to do so

const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
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
filesToCopy.forEach(file => {
  const sourcePath = path.join('./public', file);
  const destPath = path.join('./dist', file);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${file} to dist folder`);
    } else {
      console.warn(`⚠️ Could not find ${file} in public folder`);
    }
  } catch (error) {
    console.error(`Error copying ${file}:`, error);
  }
});

console.log('Done copying extension assets');
