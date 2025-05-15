
/**
 * Safe Extension Rebuild Script
 * This script checks for critical issues before building and fixes them if possible
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔎 DealHavenAI Pre-build Safety Checks');
console.log('=====================================');

// 1. Check for merge conflicts in index.html
console.log('\n1️⃣ Checking for merge conflicts in index.html...');
const indexPath = path.join(__dirname, '..', 'index.html');

if (fs.existsSync(indexPath)) {
  try {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Check for merge conflict markers
    const hasConflictMarkers = 
      indexContent.includes('<<<<<<<') || 
      indexContent.includes('=======') || 
      indexContent.includes('>>>>>>>');
    
    if (hasConflictMarkers) {
      console.error('❌ ERROR: Merge conflicts detected in index.html!');
      console.error('Please resolve conflicts before building.');
      process.exit(1);
    } else {
      console.log('✅ No merge conflicts found in index.html');
    }
  } catch (err) {
    console.error('❌ Error reading index.html:', err.message);
    process.exit(1);
  }
} else {
  console.error('❌ index.html not found!');
  process.exit(1);
}

// 2. Check for critical files in public directory
console.log('\n2️⃣ Checking for critical files in public directory...');

const publicDir = path.join(__dirname);
const criticalFiles = [
  'manifest.json',
  'browser-polyfill.min.js',
  'content.js',
  'background.js'
];

const missingCritical = [];

criticalFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (!fs.existsSync(filePath)) {
    missingCritical.push(file);
  }
});

if (missingCritical.length > 0) {
  console.error(`❌ Missing critical files: ${missingCritical.join(', ')}`);
  process.exit(1);
} else {
  console.log('✅ All critical files exist');
}

// 3. Check for icon-16-active.png and create it if missing
console.log('\n3️⃣ Checking icon files...');

const icon16Path = path.join(publicDir, 'icon-16.png');
const icon16ActivePath = path.join(publicDir, 'icon-16-active.png');

if (!fs.existsSync(icon16Path)) {
  console.error('❌ icon-16.png is missing! Cannot proceed.');
  process.exit(1);
}

if (!fs.existsSync(icon16ActivePath)) {
  console.log('⚠️ icon-16-active.png is missing. Creating from icon-16.png...');
  try {
    fs.copyFileSync(icon16Path, icon16ActivePath);
    console.log('✅ Created icon-16-active.png successfully');
  } catch (err) {
    console.error('❌ Failed to create icon-16-active.png:', err.message);
    process.exit(1);
  }
} else {
  console.log('✅ icon-16-active.png exists');
}

// 4. Validate manifest.json content
console.log('\n4️⃣ Validating manifest.json...');

const manifestPath = path.join(publicDir, 'manifest.json');
try {
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  
  try {
    const manifest = JSON.parse(manifestContent);
    console.log('✅ manifest.json is valid JSON');
    
    // Check for minimum required manifest fields
    const requiredFields = ['manifest_version', 'name', 'version'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      console.error(`❌ manifest.json is missing required fields: ${missingFields.join(', ')}`);
    } else {
      console.log('✅ manifest.json contains required fields');
    }
  } catch (err) {
    console.error('❌ manifest.json contains invalid JSON:', err.message);
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Error reading manifest.json:', err.message);
  process.exit(1);
}

console.log('\n✅ All pre-build checks passed successfully!');
console.log('\n🚀 Starting extension build...');

try {
  // Remove dist directory if it exists
  const distDir = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distDir)) {
    console.log('Cleaning dist directory...');
    if (process.platform === 'win32') {
      execSync(`rmdir /s /q "${distDir}"`, { stdio: 'ignore' });
    } else {
      execSync(`rm -rf "${distDir}"`, { stdio: 'ignore' });
    }
  }
  
  // Run the build
  console.log('Running npm run build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ Build completed successfully!');
  
  // Verify manifest.json in dist
  const distManifestPath = path.join(distDir, 'manifest.json');
  if (fs.existsSync(distManifestPath)) {
    console.log('✅ manifest.json was successfully copied to dist directory');
  } else {
    console.error('❌ manifest.json is missing from dist directory after build!');
    process.exit(1);
  }
  
  console.log('\n🎉 Extension is ready! Load it in Chrome from the dist directory:');
  console.log('   1. Open Chrome and go to chrome://extensions/');
  console.log('   2. Enable "Developer mode" at the top right');
  console.log('   3. Click "Load unpacked" and select the dist directory:');
  console.log(`      ${path.resolve(distDir)}`);
} catch (err) {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
}
