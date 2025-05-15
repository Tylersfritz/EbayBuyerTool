
// Fix manifest and generate missing files script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 DealHaven Extension Manifest Fixer');
console.log('-----------------------------------');

// Paths
const publicDir = path.join(__dirname);
const distDir = path.join(__dirname, '..', 'dist');
const manifestPath = path.join(publicDir, 'manifest.json');
const distManifestPath = path.join(distDir, 'manifest.json');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('✅ Created dist directory');
}

// Check and fix manifest.json
console.log('Checking manifest.json...');
let manifest;

try {
  if (fs.existsSync(manifestPath)) {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(manifestContent);
    console.log('✅ Found valid manifest.json in public directory');
  } else {
    console.log('❌ manifest.json not found in public directory, creating default...');
    
    // Create default manifest
    manifest = {
      "manifest_version": 3,
      "name": "DealHavenAI",
      "version": "1.0.0",
      "description": "Smart tools for buyers with price checks, negotiation assistance, auction sniping and more",
      "action": {
        "default_popup": "index.html",
        "default_icon": {
          "16": "icon-16.png",
          "48": "icon-48.png",
          "128": "icon-128.png"
        }
      },
      "icons": {
        "16": "icon-16.png",
        "48": "icon-48.png",
        "128": "icon-128.png"
      },
      "background": {
        "service_worker": "background.js"
      },
      "permissions": [
        "activeTab",
        "storage"
      ],
      "host_permissions": [
        "https://*.ebay.com/*",
        "https://*.mercari.com/*",
        "https://*.vercel.app/*"
      ],
      "content_scripts": [
        {
          "matches": ["https://*.ebay.com/itm/*"],
          "js": ["browser-polyfill.min.js", "content.js"]
        },
        {
          "matches": ["https://*.mercari.com/item/*"],
          "js": ["browser-polyfill.min.js", "mercari-content.js"]
        }
      ],
      "web_accessible_resources": [
        {
          "resources": [
            "placeholder.svg",
            "icon-16.png",
            "icon-48.png",
            "icon-128.png",
            "icon-16-active.png",
            "icon-48-active.png",
            "icon-128-active.png",
            "favicon.ico",
            "browser-polyfill.min.js"
          ],
          "matches": ["<all_urls>"]
        }
      ]
    };
    
    // Write to public directory
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Created new manifest.json in public directory');
  }
  
  // Copy manifest to dist directory
  fs.writeFileSync(distManifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Copied manifest.json to dist directory');
} catch (error) {
  console.error('❌ Error processing manifest.json:', error.message);
  process.exit(1);
}

// Generate missing icons
console.log('\nChecking for required icons...');
const iconSizes = [16, 48, 128];
let missingIcons = [];

iconSizes.forEach(size => {
  const iconPath = path.join(publicDir, `icon-${size}.png`);
  const distIconPath = path.join(distDir, `icon-${size}.png`);
  
  if (!fs.existsSync(iconPath)) {
    missingIcons.push(size);
  } else {
    // Copy to dist directory
    fs.copyFileSync(iconPath, distIconPath);
    console.log(`✅ Copied icon-${size}.png to dist directory`);
  }
});

// Generate any missing icons
if (missingIcons.length > 0) {
  console.log(`\n⚠️ Missing icons detected: ${missingIcons.map(s => `icon-${s}.png`).join(', ')}`);
  console.log('Generating simple placeholder icons...');
  
  // Create a super simple icon generator using Node.js
  missingIcons.forEach(size => {
    // Create a placeholder icon (very basic)
    const iconPath = path.join(publicDir, `icon-${size}.png`);
    const distIconPath = path.join(distDir, `icon-${size}.png`);
    
    // This is a minimal PNG header - not fully functional but serves as placeholder
    // For real icons, use the icon-generator.html in your browser
    const header = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00
    ]);
    
    // Add width (2 bytes)
    const width = Buffer.alloc(2);
    width.writeUInt16BE(size, 0);
    
    // Add height (2 bytes)
    const height = Buffer.alloc(2);
    height.writeUInt16BE(size, 0);
    
    // Color type etc (very simplified)
    const colorInfo = Buffer.from([
      0x08, 0x06, 0x00, 0x00, 0x00
    ]);
    
    // For a real icon, you'd need much more data here
    // This is just a placeholder to ensure files exist
    const iconData = Buffer.concat([header, width, height, colorInfo]);
    
    // Write files to both locations
    fs.writeFileSync(iconPath, iconData);
    fs.writeFileSync(distIconPath, iconData);
    
    console.log(`✅ Created placeholder for icon-${size}.png`);
  });
  
  console.log('\n⚠️ Generated placeholder icons are not proper icons. Please use icon-generator.html to create real icons.');
}

// Check for critical script files
console.log('\nChecking for critical script files...');
const criticalFiles = [
  'browser-polyfill.min.js', 
  'content.js', 
  'background.js', 
  'mercari-content.js'
];

criticalFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  const distFilePath = path.join(distDir, file);
  
  if (fs.existsSync(filePath)) {
    // Copy to dist directory
    fs.copyFileSync(filePath, distFilePath);
    console.log(`✅ Copied ${file} to dist directory`);
  } else if (file === 'browser-polyfill.min.js') {
    // Special handling for browser-polyfill
    console.log(`❌ ${file} not found. Checking node_modules...`);
    
    const polyfillPath = path.join(__dirname, '..', 'node_modules', 'webextension-polyfill', 'dist', 'browser-polyfill.min.js');
    if (fs.existsSync(polyfillPath)) {
      fs.copyFileSync(polyfillPath, distFilePath);
      fs.copyFileSync(polyfillPath, filePath);
      console.log(`✅ Copied ${file} from node_modules`);
    } else {
      console.error(`❌ Could not find ${file} in node_modules`);
      // Create empty placeholder
      fs.writeFileSync(distFilePath, '// Placeholder for browser-polyfill.min.js');
      fs.writeFileSync(filePath, '// Placeholder for browser-polyfill.min.js');
      console.log(`⚠️ Created empty placeholder for ${file}`);
    }
  } else {
    // Create empty placeholder files for missing scripts
    console.log(`❌ ${file} not found. Creating placeholder...`);
    
    // Create different content for each type of file
    let fileContent = '// Placeholder file\n';
    
    if (file === 'content.js') {
      fileContent = `// DealHavenAI Content Script
console.log("DealHavenAI content script loaded");
// Placeholder for content script functionality
`;
    } else if (file === 'background.js') {
      fileContent = `// DealHavenAI Background Script
console.log("DealHavenAI background script loaded");
// Placeholder for background script functionality
`;
    } else if (file === 'mercari-content.js') {
      fileContent = `// DealHavenAI Mercari Content Script
console.log("DealHavenAI Mercari content script loaded");
// Placeholder for Mercari content script functionality
`;
    }
    
    fs.writeFileSync(distFilePath, fileContent);
    fs.writeFileSync(filePath, fileContent);
    console.log(`⚠️ Created placeholder for ${file}`);
  }
});

console.log('\n✅ Manifest and critical files fixed and copied to dist directory');
console.log('\nNext steps:');
console.log('1. Use icon-generator.html in your browser to generate proper icons');
console.log('2. Run npm run build to rebuild the extension with all files');
console.log('3. Load the extension from the dist directory in Chrome');

