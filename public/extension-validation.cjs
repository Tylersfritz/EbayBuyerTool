
// Extension build validation script
// This script checks if all required files are present in the dist directory

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating DealHaven Extension Build...');
console.log('=======================================');

// Check if dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ CRITICAL ERROR: dist directory not found! Build failed.');
  process.exit(1);
}

// Check for manifest.json
const manifestPath = path.join(distDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ CRITICAL ERROR: manifest.json not found in dist directory!');
  process.exit(1);
}

// Load and parse manifest.json
let manifest;
try {
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  manifest = JSON.parse(manifestContent);
  console.log('✅ manifest.json found and parsed successfully');
} catch (error) {
  console.error('❌ CRITICAL ERROR: Failed to parse manifest.json:', error.message);
  process.exit(1);
}

// Required files for any Chrome extension
const requiredFiles = [
  'manifest.json',
  'index.html',
  'browser-polyfill.min.js'
];

// Add icon files from manifest
if (manifest.icons) {
  Object.values(manifest.icons).forEach(iconPath => {
    requiredFiles.push(iconPath);
  });
}

// Add content script files from manifest
if (manifest.content_scripts && Array.isArray(manifest.content_scripts)) {
  manifest.content_scripts.forEach(contentScript => {
    if (contentScript.js && Array.isArray(contentScript.js)) {
      contentScript.js.forEach(scriptFile => {
        requiredFiles.push(scriptFile);
      });
    }
  });
}

// Add background script
if (manifest.background && manifest.background.service_worker) {
  requiredFiles.push(manifest.background.service_worker);
}

// Add web accessible resources
if (manifest.web_accessible_resources && Array.isArray(manifest.web_accessible_resources)) {
  manifest.web_accessible_resources.forEach(resource => {
    if (resource.resources && Array.isArray(resource.resources)) {
      resource.resources.forEach(file => {
        // Only add if not already in the list
        if (!requiredFiles.includes(file)) {
          requiredFiles.push(file);
        }
      });
    }
  });
}

console.log('\nChecking for required files based on manifest.json:');

// Check if all required files exist
let missingFiles = [];
for (const file of requiredFiles) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
    console.error(`❌ Missing: ${file}`);
  } else {
    console.log(`✅ Found: ${file}`);
  }
}

// Check for CSS and JS assets in index.html
try {
  const htmlPath = path.join(distDir, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Extract script and link tags from HTML
  const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/g;
  const linkRegex = /<link[^>]*href=["']([^"']+)["'][^>]*>/g;
  
  let match;
  const assetFiles = [];
  
  // Find all script sources
  while ((match = scriptRegex.exec(htmlContent)) !== null) {
    assetFiles.push(match[1]);
  }
  
  // Find all CSS links
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    // Only include CSS files
    if (match[1].endsWith('.css')) {
      assetFiles.push(match[1]);
    }
  }
  
  console.log('\nChecking for referenced assets in HTML:');
  for (const asset of assetFiles) {
    // Skip external URLs
    if (asset.startsWith('http') || asset.startsWith('//')) {
      console.log(`⚠️ External asset: ${asset} (not checked)`);
      continue;
    }
    
    // Handle relative paths
    const assetPath = path.join(distDir, asset.startsWith('/') ? asset.substring(1) : asset);
    if (!fs.existsSync(assetPath)) {
      console.error(`❌ Missing asset: ${asset}`);
      missingFiles.push(asset);
    } else {
      console.log(`✅ Found asset: ${asset}`);
    }
  }
} catch (error) {
  console.error('❌ Failed to check HTML for asset references:', error.message);
}

// Summary
console.log('\n📋 Validation Summary:');
if (missingFiles.length === 0) {
  console.log('✅ All required files are present in the dist directory!');
  console.log('✅ Extension should load correctly in Chrome.');
} else {
  console.error(`❌ Missing ${missingFiles.length} required file(s):`);
  missingFiles.forEach(file => console.error(` - ${file}`));
  console.error('\n❌ Extension may not load correctly without these files.');
  console.error('Please fix the missing files and try again.');
  process.exit(1);
}
