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

// Config
const requiredFields = [
  'manifest_version',
  'name',
  'version',
  'description',
  'action',
  'permissions',
  'icons'
];

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
    
    // Check for missing required fields
    const missingFields = requiredFields.filter(field => !manifest[field]);
    if (missingFields.length > 0) {
      console.warn(`⚠️ Manifest is missing the following fields: ${missingFields.join(', ')}`);
      console.log('Adding missing fields with default values...');
      
      // Add defaults for missing fields
      if (!manifest.manifest_version) manifest.manifest_version = 3;
      if (!manifest.name) manifest.name = "DealHavenAI";
      if (!manifest.version) manifest.version = "1.0.0";
      if (!manifest.description) manifest.description = "Smart tools for buyers with price checks, negotiation assistance, auction sniping and more";
      
      if (!manifest.action) {
        manifest.action = {
          "default_popup": "index.html",
          "default_icon": {
            "16": "icon-16.png",
            "48": "icon-48.png",
            "128": "icon-128.png"
          }
        };
      }
      
      if (!manifest.icons) {
        manifest.icons = {
          "16": "icon-16.png",
          "48": "icon-48.png",
          "128": "icon-128.png"
        };
      }
      
      if (!manifest.permissions) {
        manifest.permissions = ["activeTab", "storage"];
      }
      
      // Write updated manifest back to public directory
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log('✅ Updated manifest.json with missing fields');
    }
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
const iconFiles = [
  { name: 'icon-16.png', size: 16 },
  { name: 'icon-48.png', size: 48 },
  { name: 'icon-128.png', size: 128 },
  { name: 'icon-16-active.png', size: 16, isRequired: false },
  { name: 'icon-48-active.png', size: 48, isRequired: false },
  { name: 'icon-128-active.png', size: 128, isRequired: false }
];

let missingIcons = [];

iconFiles.forEach(icon => {
  const iconPath = path.join(publicDir, icon.name);
  const distIconPath = path.join(distDir, icon.name);
  
  if (!fs.existsSync(iconPath)) {
    if (icon.isRequired === false) {
      console.log(`⚠️ Optional icon ${icon.name} not found`);
    } else {
      missingIcons.push(icon);
    }
  } else {
    // Copy to dist directory
    fs.copyFileSync(iconPath, distIconPath);
    console.log(`✅ Copied ${icon.name} to dist directory`);
  }
});

// Generate any missing icons
if (missingIcons.length > 0) {
  console.log(`\n⚠️ Missing required icons detected: ${missingIcons.map(i => i.name).join(', ')}`);
  console.log('Generating simple placeholder icons...');
  
  // Create a super simple icon generator using Node.js
  missingIcons.forEach(icon => {
    // Create a placeholder icon (very basic)
    const iconPath = path.join(publicDir, icon.name);
    const distIconPath = path.join(distDir, icon.name);
    
    // This is a minimal PNG header - not fully functional but serves as placeholder
    // For real icons, use the icon-generator.html in your browser
    const header = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00
    ]);
    
    // Add width (2 bytes)
    const width = Buffer.alloc(2);
    width.writeUInt16BE(icon.size, 0);
    
    // Add height (2 bytes)
    const height = Buffer.alloc(2);
    height.writeUInt16BE(icon.size, 0);
    
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
    
    console.log(`✅ Created placeholder for ${icon.name}`);
  });
  
  console.log('\n⚠️ Generated placeholder icons are not proper icons. Please use the Extension Icon Generator to create real icons.');
}

// Check for critical script files
console.log('\nChecking for critical script files...');
const criticalFiles = [
  { name: 'browser-polyfill.min.js', isRequired: true },
  { name: 'content.js', isRequired: true },
  { name: 'background.js', isRequired: true },
  { name: 'mercari-content.js', isRequired: true },
  { name: 'placeholder.svg', isRequired: false },
  { name: 'favicon.ico', isRequired: false }
];

criticalFiles.forEach(file => {
  const filePath = path.join(publicDir, file.name);
  const distFilePath = path.join(distDir, file.name);
  
  if (fs.existsSync(filePath)) {
    // Copy to dist directory
    fs.copyFileSync(filePath, distFilePath);
    console.log(`✅ Copied ${file.name} to dist directory`);
  } else if (file.name === 'browser-polyfill.min.js') {
    // Special handling for browser-polyfill
    console.log(`❌ ${file.name} not found. Checking node_modules...`);
    
    const polyfillPath = path.join(__dirname, '..', 'node_modules', 'webextension-polyfill', 'dist', 'browser-polyfill.min.js');
    if (fs.existsSync(polyfillPath)) {
      fs.copyFileSync(polyfillPath, distFilePath);
      fs.copyFileSync(polyfillPath, filePath);
      console.log(`✅ Copied ${file.name} from node_modules`);
    } else {
      console.error(`❌ Could not find ${file.name} in node_modules`);
      // Create empty placeholder
      fs.writeFileSync(distFilePath, '// Placeholder for browser-polyfill.min.js');
      fs.writeFileSync(filePath, '// Placeholder for browser-polyfill.min.js');
      console.log(`⚠️ Created empty placeholder for ${file.name}`);
    }
  } else if (file.isRequired) {
    // Create placeholder files for missing required scripts
    console.log(`❌ ${file.name} not found. Creating placeholder...`);
    
    // Create different content for each type of file
    let fileContent = '// Placeholder file\n';
    
    if (file.name === 'content.js') {
      fileContent = `// DealHavenAI Content Script
console.log("DealHavenAI content script loaded for eBay");

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  if (message.action === "testModeGetListingInfo") {
    // This function is called by the deployment readiness checker
    sendResponse({ success: true, message: "Content script is working" });
    return true;
  }
  
  if (message.action === "getListingData") {
    // Extract listing data from the page (simple example)
    const title = document.querySelector('h1')?.textContent || 'Unknown Item';
    const priceElement = document.querySelector('[itemprop="price"]');
    const price = priceElement ? priceElement.getAttribute('content') || priceElement.textContent : 'Unknown';
    
    sendResponse({
      title,
      price,
      url: window.location.href
    });
    return true;
  }
});

// Placeholder for content script functionality
console.log("DealHavenAI content script ready");
`;
    } else if (file.name === 'background.js') {
      fileContent = `// DealHavenAI Background Script
console.log("DealHavenAI background script loaded");

// Listen for installation event
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details.reason);
  
  // Initialize storage with default values
  chrome.storage.local.set({
    installDate: new Date().toISOString(),
    settings: {
      autoCheckPrices: true,
      showNotifications: true
    }
  });
});

// Listen for tab updates to show icon on relevant pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if we're on a supported site
    const isEbayItem = tab.url.match(/ebay\\.com\\/itm\\//);
    const isMercariItem = tab.url.match(/mercari\\.com\\/item\\//);
    
    if (isEbayItem || isMercariItem) {
      // We're on a product page - could update icon here
      console.log("On a supported product page:", tab.url);
    }
  }
});

// Placeholder for background functionality
console.log("DealHavenAI background script ready");
`;
    } else if (file.name === 'mercari-content.js') {
      fileContent = `// DealHavenAI Mercari Content Script
console.log("DealHavenAI Mercari content script loaded");

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Mercari content script received message:", message);
  
  if (message.action === "testModeGetListingInfo") {
    // This function is called by the deployment readiness checker
    sendResponse({ success: true, message: "Mercari content script is working" });
    return true;
  }
  
  if (message.action === "getListingData") {
    // Extract listing data from the page (simple example)
    const title = document.querySelector('h1')?.textContent || 'Unknown Item';
    const price = document.querySelector('[data-testid="price"]')?.textContent || 'Unknown';
    
    sendResponse({
      title,
      price,
      url: window.location.href
    });
    return true;
  }
});

// Placeholder for Mercari content script functionality
console.log("DealHavenAI Mercari content script ready");
`;
    } else if (file.name === 'placeholder.svg') {
      fileContent = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#f0f0f0" />
  <text x="50" y="50" font-family="Arial" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="#666">
    Placeholder
  </text>
</svg>`;
    }
    
    fs.writeFileSync(distFilePath, fileContent);
    fs.writeFileSync(filePath, fileContent);
    console.log(`⚠️ Created placeholder for ${file.name}`);
  } else {
    // Non-required files that are missing
    console.log(`⚠️ Non-critical file ${file.name} not found, skipping`);
  }
});

// Check and create bundle.js if missing (for older browsers compatibility)
const bundleDistPath = path.join(distDir, 'bundle.js');
if (!fs.existsSync(bundleDistPath)) {
  console.log('\nCreating backward compatibility bundle.js...');
  const bundleContent = `
// Backward compatibility bundle for older browsers
console.log("DealHaven compatibility bundle loaded");
document.addEventListener('DOMContentLoaded', function() {
  // This bundle helps with older browsers that might not support modern JS
  console.log("DealHaven running in compatibility mode");
});
`;
  fs.writeFileSync(bundleDistPath, bundleContent);
  console.log('✅ Created bundle.js for backward compatibility');
}

console.log('\n✅ Manifest and critical files fixed and copied to dist directory');
console.log('\nNext steps:');
console.log('1. Use the Extension Icon Generator to create proper icons');
console.log('2. Run npm run build to rebuild the extension with all files');
console.log('3. Load the extension from the dist directory in Chrome');

// Log the path to the dist directory for convenience
console.log(`\nYour extension files are in: ${path.resolve(distDir)}`);
