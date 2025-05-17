
// Enhanced build extension script with improved file path checking
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 DealHaven Extension Builder');
console.log('============================');

// Ensure dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('✅ Created dist directory');
}

// Check if a manifest.json exists in dist (might be created by Vite)
const distManifestPath = path.join(distDir, 'manifest.json');
const publicManifestPath = path.join(__dirname, 'manifest.json');

// If both exist, check which is more recent
if (fs.existsSync(distManifestPath) && fs.existsSync(publicManifestPath)) {
  const distManifestStats = fs.statSync(distManifestPath);
  const publicManifestStats = fs.statSync(publicManifestPath);
  
  if (publicManifestStats.mtimeMs > distManifestStats.mtimeMs) {
    console.log('ℹ️ Public manifest.json is newer than dist version - will copy from public');
  } else {
    console.log('ℹ️ Dist manifest.json is up-to-date - will preserve it');
  }
}

// Critical files that must be present for the extension to work
const criticalFiles = [
  { src: path.join(__dirname, 'manifest.json'), dest: path.join(distDir, 'manifest.json') },
  { src: path.join(__dirname, 'icon-16.png'), dest: path.join(distDir, 'icon-16.png') },
  { src: path.join(__dirname, 'icon-48.png'), dest: path.join(distDir, 'icon-48.png') },
  { src: path.join(__dirname, 'icon-128.png'), dest: path.join(distDir, 'icon-128.png') },
  { src: path.join(__dirname, 'browser-polyfill.min.js'), dest: path.join(distDir, 'browser-polyfill.min.js') },
  { src: path.join(__dirname, 'content.js'), dest: path.join(distDir, 'content.js') },
  { src: path.join(__dirname, 'background.js'), dest: path.join(distDir, 'background.js') },
  { src: path.join(__dirname, 'mercari-content.js'), dest: path.join(distDir, 'mercari-content.js') }
];

// Optional files to include if they exist
const optionalFiles = [
  { src: path.join(__dirname, 'icon-16-active.png'), dest: path.join(distDir, 'icon-16-active.png') },
  { src: path.join(__dirname, 'icon-48-active.png'), dest: path.join(distDir, 'icon-48-active.png') },
  { src: path.join(__dirname, 'icon-128-active.png'), dest: path.join(distDir, 'icon-128-active.png') },
  { src: path.join(__dirname, 'placeholder.svg'), dest: path.join(distDir, 'placeholder.svg') },
  { src: path.join(__dirname, 'favicon.ico'), dest: path.join(distDir, 'favicon.ico') },
  { src: path.join(__dirname, 'manifest.firefox.json'), dest: path.join(distDir, 'manifest.firefox.json') },
  { src: path.join(__dirname, 'manifest.edge.json'), dest: path.join(distDir, 'manifest.edge.json') }
];

// Get the sizes of all critical files
const fileSizes = {};
for (const file of criticalFiles) {
  try {
    if (fs.existsSync(file.src)) {
      const stats = fs.statSync(file.src);
      fileSizes[path.basename(file.src)] = stats.size;
    }
  } catch (e) {
    console.log(`⚠️ Error getting size for ${path.basename(file.src)}: ${e.message}`);
  }
}

console.log('\n📋 Critical files status:');
let allFilesCopied = true;
let criticalErrors = false;

// Copy critical files first
for (const file of criticalFiles) {
  if (fs.existsSync(file.src)) {
    // Check if the file has content
    const stats = fs.statSync(file.src);
    if (stats.size === 0) {
      console.error(`❌ CRITICAL: ${path.basename(file.src)} exists but is empty (0 bytes)`);
      criticalErrors = true;
    }
    
    // Copy the file
    fs.copyFileSync(file.src, file.dest);
    console.log(`✅ Copied ${path.basename(file.src)} to dist (${stats.size} bytes)`);
    
    // Verify copy was successful
    if (fs.existsSync(file.dest)) {
      const destStats = fs.statSync(file.dest);
      if (destStats.size !== stats.size) {
        console.error(`❌ File size mismatch for ${path.basename(file.src)}: source=${stats.size}, dest=${destStats.size}`);
        criticalErrors = true;
      }
    } else {
      console.error(`❌ Failed to copy ${path.basename(file.src)} to dist`);
      criticalErrors = true;
    }
  } else {
    console.error(`❌ CRITICAL: ${path.basename(file.src)} not found!`);
    criticalErrors = true;
    allFilesCopied = false;
  }
}

console.log('\n📋 Optional files status:');
// Copy optional files if they exist
for (const file of optionalFiles) {
  if (fs.existsSync(file.src)) {
    const stats = fs.statSync(file.src);
    fs.copyFileSync(file.src, file.dest);
    console.log(`✅ Copied ${path.basename(file.src)} to dist (${stats.size} bytes)`);
  } else {
    console.log(`ℹ️ Optional file ${path.basename(file.src)} not found - skipping`);
  }
}

// Check if manifest.json was copied successfully and is valid
if (fs.existsSync(path.join(distDir, 'manifest.json'))) {
  console.log('\n🧪 Validating manifest.json:');
  try {
    const manifestContent = fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8');
    const manifest = JSON.parse(manifestContent);
    console.log('✅ manifest.json is valid JSON');
    
    // Validate manifest fields
    const requiredFields = ['manifest_version', 'name', 'version', 'description', 'action', 'icons'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      console.warn(`⚠️ Manifest is missing fields: ${missingFields.join(', ')}`);
    } else {
      console.log('✅ Manifest contains all required fields');
    }
    
    // Check that icon paths in the manifest actually exist in the dist directory
    if (manifest.icons) {
      console.log('\n🔍 Checking icon paths:');
      let allIconsExist = true;
      
      for (const [size, iconPath] of Object.entries(manifest.icons)) {
        const fullPath = path.join(distDir, iconPath);
        if (fs.existsSync(fullPath)) {
          console.log(`✅ Icon ${size}: ${iconPath} exists`);
        } else {
          console.error(`❌ Icon ${size}: ${iconPath} referenced in manifest but file not found!`);
          allIconsExist = false;
        }
      }
      
      if (!allIconsExist) {
        criticalErrors = true;
      }
    }
    
    // Check for content_scripts
    if (manifest.content_scripts && Array.isArray(manifest.content_scripts)) {
      console.log('\n🔍 Checking content script paths:');
      
      for (const contentScript of manifest.content_scripts) {
        if (contentScript.js && Array.isArray(contentScript.js)) {
          for (const scriptPath of contentScript.js) {
            const fullPath = path.join(distDir, scriptPath);
            if (fs.existsSync(fullPath)) {
              console.log(`✅ Content script: ${scriptPath} exists`);
            } else {
              console.error(`❌ Content script: ${scriptPath} referenced in manifest but file not found!`);
              criticalErrors = true;
            }
          }
        }
      }
    }
    
    // Check background script
    if (manifest.background && manifest.background.service_worker) {
      const workerPath = manifest.background.service_worker;
      const fullPath = path.join(distDir, workerPath);
      
      console.log('\n🔍 Checking background service worker:');
      if (fs.existsSync(fullPath)) {
        console.log(`✅ Service worker: ${workerPath} exists`);
      } else {
        console.error(`❌ Service worker: ${workerPath} referenced in manifest but file not found!`);
        criticalErrors = true;
      }
    }
  } catch (error) {
    console.error('❌ Error reading or parsing manifest.json:', error.message);
    criticalErrors = true;
  }
} else {
  console.error('❌ CRITICAL: manifest.json was not copied to dist directory!');
  criticalErrors = true;
}

// Verify that index.html exists and has correct contents
const indexHtmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  console.log('\n🔍 Checking index.html:');
  try {
    const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Check for browser-polyfill.min.js reference
    if (htmlContent.includes('browser-polyfill.min.js')) {
      console.log('✅ index.html contains reference to browser-polyfill.min.js');
    } else {
      console.warn('⚠️ index.html does not contain reference to browser-polyfill.min.js');
    }
    
    // Check for base href tag (should be removed)
    if (htmlContent.includes('<base href="/">')) {
      console.error('❌ index.html contains <base href="/"> tag which can cause path issues in extensions!');
      
      // Attempt to fix the issue
      console.log('🔧 Attempting to remove base href tag...');
      const fixedHtml = htmlContent.replace(/<base href="\/"[^>]*>/g, '');
      fs.writeFileSync(indexHtmlPath, fixedHtml);
      console.log('✅ Removed base href tag from index.html');
    } else {
      console.log('✅ index.html does not contain base href tag (good)');
    }
  } catch (error) {
    console.error('❌ Error reading or parsing index.html:', error.message);
  }
} else {
  console.error('❌ CRITICAL: index.html not found in dist directory!');
  criticalErrors = true;
}

// Summary and next steps
console.log('\n📋 Build Summary:');
if (allFilesCopied && !criticalErrors) {
  console.log('✅ All critical files copied successfully.');
  console.log('\n🎉 Extension build completed successfully!');
  
  if (criticalErrors) {
    console.warn('⚠️ Some potential issues were detected that might affect extension functionality.');
  }
  
  console.log('\nNext steps:');
  console.log('1. Open Chrome and navigate to chrome://extensions/');
  console.log('2. Enable "Developer mode" in the top right corner');
  console.log('3. Click "Load unpacked" and select the "dist" directory');
  console.log(`   (${path.resolve(distDir)})`);
} else {
  console.error('\n❌ Build completed with critical errors. Please check the messages above.');
  process.exit(1);
}
