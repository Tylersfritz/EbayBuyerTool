
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

// Copy critical files first with detailed error handling
console.log('Copying critical extension files first...');
let criticalErrors = false;

for (const file of criticalFiles) {
  const sourcePath = path.join('./public', file);
  const destPath = path.join('./dist', file);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied critical file ${file} to dist folder`);
      
      // Special case for manifest.json - verify its content
      if (file === 'manifest.json') {
        try {
          const manifestContent = fs.readFileSync(destPath, 'utf8');
          JSON.parse(manifestContent); // This will throw if invalid JSON
          console.log('✅ manifest.json is valid JSON');
        } catch (jsonError) {
          console.error(`❌ CRITICAL ERROR: manifest.json is not valid JSON: ${jsonError.message}`);
          criticalErrors = true;
        }
      }
    } else {
      console.error(`❌ CRITICAL ERROR: Could not find ${file} in public folder`);
      criticalErrors = true;
      
      // For icons, try to create them if they don't exist
      if (file.startsWith('icon-')) {
        console.log(`Attempting to generate missing icon: ${file}`);
        
        // If we have the generateIcons utility, try using it
        try {
          require('../src/utils/generateIcons');
          console.log(`Please run the icon generator from the extension popup to create missing icons`);
        } catch (genError) {
          console.log(`Icon generator not available: ${genError.message}`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ CRITICAL ERROR copying ${file}:`, error);
    criticalErrors = true;
  }
}

if (criticalErrors) {
  console.error('❌ Critical errors encountered. Extension will not load properly!');
  console.log('Try running the icon generator component in the extension to create missing icons');
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

// Check if icons actually exist in the dist folder
const requiredIcons = ['icon-16.png', 'icon-48.png', 'icon-128.png'];
const missingIcons = requiredIcons.filter(icon => !fs.existsSync(path.join('./dist', icon)));

if (missingIcons.length > 0) {
  console.error(`❌ CRITICAL: The following icons are missing from dist directory: ${missingIcons.join(', ')}`);
  console.log('Trying to generate missing icons from src/utils/generateIcons.ts utility...');
  
  // Add code to generate default icons if needed
  // This is a simplified version - in practice, Node can't directly use canvas like the browser
  missingIcons.forEach(icon => {
    // Create a simple placeholder icon for testing
    const size = parseInt(icon.match(/\d+/)[0]);
    console.log(`Creating placeholder ${size}x${size} icon...`);
    
    // For now, we'll just copy an existing icon or create a minimal one
    try {
      // Try to find any existing icon to use as fallback
      const icons = fs.readdirSync('./public').filter(f => f.endsWith('.png') && f.includes('icon'));
      if (icons.length > 0) {
        fs.copyFileSync(path.join('./public', icons[0]), path.join('./dist', icon));
        console.log(`✅ Created placeholder icon for ${icon} by copying ${icons[0]}`);
      }
    } catch (e) {
      console.error(`Failed to create placeholder icon: ${e.message}`);
    }
  });
}

console.log(`\n📦 Done copying extension assets: ${successCount} files copied, ${warningCount} warnings`);
console.log('Run the validation script next to verify the build is complete and valid.');
