
// Validation script for extension build
// This script checks if all required files are present in the dist directory without modifying package.json

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating extension build...');

// Check if dist directory exists
if (!fs.existsSync('./dist')) {
  console.error('❌ dist directory not found! Build may have failed.');
  process.exit(1);
}

// Required files for a Chrome extension
const requiredFiles = [
  'manifest.json',
  'index.html',
  'browser-polyfill.min.js',
  'icon-16.png',
  'icon-48.png',
  'icon-128.png',
  'content.js',
  'background.js'
];

// Check for each required file
const missingFiles = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join('./dist', file))) {
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.error('❌ Missing required files in dist directory:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  console.error('\nPlease check your build configuration and try again.');
  process.exit(1);
} else {
  console.log('✅ All required files are present in the dist directory');
}

// Validate manifest.json
try {
  const manifestPath = path.join('./dist', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Check for required manifest fields
  const requiredFields = ['name', 'version', 'manifest_version', 'icons', 'action', 'background', 'content_scripts'];
  const missingFields = requiredFields.filter(field => !manifest[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ manifest.json is missing required fields:', missingFields.join(', '));
    process.exit(1);
  }
  
  // Check content scripts configuration
  if (!manifest.content_scripts || !Array.isArray(manifest.content_scripts) || manifest.content_scripts.length === 0) {
    console.error('❌ manifest.json has invalid content_scripts configuration');
    process.exit(1);
  }
  
  // Check web_accessible_resources
  if (!manifest.web_accessible_resources || !Array.isArray(manifest.web_accessible_resources) || manifest.web_accessible_resources.length === 0) {
    console.error('❌ manifest.json has invalid web_accessible_resources configuration');
    process.exit(1);
  }
  
  console.log('✅ manifest.json validation passed');
} catch (error) {
  console.error('❌ Failed to validate manifest.json:', error.message);
  process.exit(1);
}

// Check if browser-polyfill.min.js is properly referenced in HTML file
try {
  const htmlPath = path.join('./dist', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  if (!htmlContent.includes('browser-polyfill.min.js')) {
    console.error('❌ browser-polyfill.min.js is not properly referenced in index.html');
    process.exit(1);
  }
  
  console.log('✅ Browser polyfill reference check passed');
} catch (error) {
  console.error('❌ Failed to check HTML for browser polyfill reference:', error.message);
  process.exit(1);
}

console.log('✅ Extension build validation completed successfully');
