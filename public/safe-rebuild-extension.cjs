
/**
 * Safe Extension Rebuild Script
 * This script checks for issues before building and fixes them if possible
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔎 DealHavenAI Safe Rebuild Process');
console.log('==================================');

// Get the absolute path to the project directory
const projectDir = path.resolve('.');
console.log(`Working directory: ${projectDir}`);

// 1. Run the fix-extension-files script if it exists
console.log('\n1️⃣ Fixing extension files...');
if (fs.existsSync(path.join(projectDir, 'public', 'fix-extension-files.js'))) {
  try {
    execSync('node public/fix-extension-files.js', { stdio: 'inherit' });
    console.log('✅ Extension files fixed successfully');
  } catch (error) {
    console.error('❌ Error fixing extension files:', error.message);
    console.error('Continuing with the build process anyway...');
  }
} else {
  console.log('⚠️ fix-extension-files.js not found, skipping this step');
}

// 2. Check for merge conflicts in index.html
console.log('\n2️⃣ Checking for merge conflicts in index.html...');
const indexPath = path.join(projectDir, 'index.html');

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
      console.log('Please fix merge conflicts before building.');
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

// 3. Clean dist directory
console.log('\n3️⃣ Cleaning dist directory...');
const distDir = path.join(projectDir, 'dist');

if (fs.existsSync(distDir)) {
  console.log('Removing existing dist directory...');
  
  try {
    if (process.platform === "win32") {
      execSync(`rmdir /s /q "${distDir}"`, { stdio: 'ignore' });
    } else {
      execSync(`rm -rf "${distDir}"`, { stdio: 'ignore' });
    }
    console.log('✅ Removed old dist directory');
  } catch (error) {
    console.error('❌ Error removing dist directory:', error.message);
    console.log('Continuing with build anyway...');
  }
}

// Create fresh dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('✅ Created fresh dist directory');
}

// 4. Run the build
console.log('\n4️⃣ Building extension...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// 5. Verify critical files in dist
console.log('\n5️⃣ Verifying extension files...');

const criticalFiles = [
  'manifest.json',
  'index.html',
  'browser-polyfill.min.js', 
  'content.js',
  'background.js',
  'icon-16.png',
  'icon-48.png',
  'icon-128.png'
];

const missingCriticalFiles = [];

criticalFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    missingCriticalFiles.push(file);
    console.error(`❌ Missing: ${file}`);
  } else {
    try {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${file} exists in dist folder (${stats.size} bytes)`);
    } catch (err) {
      console.log(`✅ ${file} exists in dist folder`);
    }
  }
});

if (missingCriticalFiles.length > 0) {
  console.error('\n⚠️ Warning: Some critical files are missing from dist:');
  console.error(missingCriticalFiles.join(', '));
  console.log('\nAttempting to copy these from public/ to dist/');

  // 6. Copy any missing files if needed
  console.log('\n6️⃣ Copying missing files from public to dist...');
  
  missingCriticalFiles.forEach(file => {
    const srcPath = path.join(projectDir, 'public', file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file} to dist folder`);
      } catch (error) {
        console.error(`❌ Error copying ${file}:`, error.message);
      }
    } else {
      console.error(`❌ Could not find ${file} in public folder`);
    }
  });
}

// 7. Final check - does manifest.json exist in dist?
if (!fs.existsSync(path.join(distDir, 'manifest.json'))) {
  console.error('\n❌ CRITICAL ERROR: manifest.json is missing from dist directory!');
  console.log('Attempting emergency copy of manifest.json...');
  
  const publicManifestPath = path.join(projectDir, 'public', 'manifest.json');
  const distManifestPath = path.join(distDir, 'manifest.json');
  
  if (fs.existsSync(publicManifestPath)) {
    try {
      fs.copyFileSync(publicManifestPath, distManifestPath);
      console.log('✅ Emergency copy of manifest.json succeeded');
    } catch (err) {
      console.error('❌ Failed to copy manifest.json:', err.message);
      process.exit(1);
    }
  } else {
    console.error('❌ Could not find manifest.json in public directory either!');
    process.exit(1);
  }
}

console.log('\n🎉 Extension rebuild process completed!');
console.log('\nTo load your extension in Chrome:');
console.log('1. Go to chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked" and select the dist folder:');
console.log(`   ${path.resolve(distDir)}`);
