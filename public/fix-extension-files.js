
/**
 * Script to fix common extension file issues
 * - Creates missing icon-16-active.png
 * - Validates manifest.json and critical files
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 DealHavenAI Extension File Fixer');
console.log('=================================');

const publicDir = path.resolve('./public');

// Check if public directory exists
if (!fs.existsSync(publicDir)) {
  console.error('❌ Error: public directory not found!');
  process.exit(1);
}

// 1. Create missing icon-16-active.png from icon-16.png if needed
console.log('\n1️⃣ Checking icon-16-active.png...');

const icon16Path = path.join(publicDir, 'icon-16.png');
const icon16ActivePath = path.join(publicDir, 'icon-16-active.png');

if (!fs.existsSync(icon16Path)) {
  console.error('❌ Error: icon-16.png not found! Cannot create active version.');
} else {
  console.log('✅ Found icon-16.png');
  
  if (!fs.existsSync(icon16ActivePath)) {
    try {
      fs.copyFileSync(icon16Path, icon16ActivePath);
      console.log('✅ Successfully created icon-16-active.png');
    } catch (error) {
      console.error('❌ Error creating icon-16-active.png:', error.message);
    }
  } else {
    console.log('✅ icon-16-active.png already exists');
  }
}

// 2. Check for other required files
console.log('\n2️⃣ Checking other required extension files...');

const requiredFiles = [
  'manifest.json',
  'browser-polyfill.min.js',
  'content.js',
  'background.js',
  'mercari-content.js', 
  'icon-16.png',
  'icon-48.png',
  'icon-128.png'
];

const missingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
    console.error(`❌ Missing: ${file}`);
  } else {
    try {
      const stats = fs.statSync(filePath);
      console.log(`✅ Found: ${file} (${stats.size} bytes)`);
    } catch (err) {
      console.log(`✅ Found: ${file} (couldn't get size)`);
    }
  }
});

if (missingFiles.length > 0) {
  console.error('\n⚠️ Warning: Some required files are missing!');
  console.error('Missing files:', missingFiles.join(', '));
} else {
  console.log('\n✅ All required files are present!');
}

// 3. Validate manifest.json if it exists
console.log('\n3️⃣ Validating manifest.json...');

const manifestPath = path.join(publicDir, 'manifest.json');

if (fs.existsSync(manifestPath)) {
  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    
    try {
      const manifest = JSON.parse(manifestContent);
      console.log('✅ manifest.json is valid JSON');
      
      // Check for required fields
      const requiredFields = ['name', 'version', 'manifest_version', 'action', 'icons'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length > 0) {
        console.error('⚠️ manifest.json is missing these fields:', missingFields.join(', '));
      } else {
        console.log('✅ manifest.json contains all required fields');
      }
    } catch (error) {
      console.error('❌ Error: manifest.json contains invalid JSON!', error.message);
    }
  } catch (error) {
    console.error('❌ Error reading manifest.json:', error.message);
  }
} else {
  console.error('❌ Error: manifest.json not found!');
}

console.log('\n✅ File check and fix process completed!');
console.log('\nNext step: Run "npm run build" to rebuild your extension');
