
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
  'icon-128.png',
  // Web accessible resources
  'price-check.png',
  'negotiation-assistance.png',
  'auction-bidedge.png',
  'auction-sniping.png',
  'arbitrage-search.png'
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
    
    // For image files, do additional checks to ensure they're valid
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.svg')) {
      try {
        const buffer = Buffer.alloc(8);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, 8, 0);
        fs.closeSync(fd);
        
        // Check if it's a valid PNG file (starts with PNG header)
        if (file.endsWith('.png') && buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
          console.warn(`⚠️ ${file} may not be a valid PNG image`);
        }
      } catch (err) {
        console.warn(`⚠️ Could not verify if ${file} is a valid image: ${err.message}`);
      }
    }
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
  if (htmlContent.includes('<base href="/">')) {
    console.error('❌ index.html contains <base href="/"> tag which can cause path issues in extensions!');
    
    // Attempt to fix the issue
    console.log('🔧 Attempting to remove base href tag...');
    const fixedHtml = htmlContent.replace(/<base href="\/"[^>]*>/g, '');
    fs.writeFileSync(htmlPath, fixedHtml);
    console.log('✅ Removed base href tag from index.html');
  } else {
    console.log('✅ index.html does not contain base href tag (good)');
  }
} catch (error) {
  console.error(`❌ Error checking index.html: ${error.message}`);
}

// Check manifest for proper web_accessible_resources
try {
  const manifestPath = path.join(distDir, 'manifest.json');
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestContent);
  
  if (manifest.web_accessible_resources && Array.isArray(manifest.web_accessible_resources)) {
    console.log('\n🔍 Checking web_accessible_resources in manifest:');
    
    for (const resourceGroup of manifest.web_accessible_resources) {
      if (resourceGroup.resources && Array.isArray(resourceGroup.resources)) {
        for (const resource of resourceGroup.resources) {
          const resourcePath = path.join(distDir, resource);
          if (fs.existsSync(resourcePath)) {
            const stats = fs.statSync(resourcePath);
            console.log(`✅ Web accessible resource ${resource} exists (${stats.size} bytes)`);
          } else {
            console.error(`❌ Web accessible resource ${resource} is missing!`);
          }
        }
      } else {
        console.warn('⚠️ web_accessible_resources entry missing "resources" array');
      }
    }
  } else {
    console.warn('⚠️ No web_accessible_resources found in manifest.json');
  }
} catch (error) {
  console.error(`❌ Error checking manifest.json: ${error.message}`);
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
console.log('2. If issues persist, run "npm run create-images" followed by "npm run build"');
console.log('3. Check for detailed logs in the console during the build process');
