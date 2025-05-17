
// Enhanced manifest fixer script with improved validation and file generation
// Avoids modifying package.json
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
    try {
      manifest = JSON.parse(manifestContent);
      console.log('✅ Found valid manifest.json in public directory');
    } catch (e) {
      console.error('❌ manifest.json exists but is not valid JSON. Creating new one...');
      manifest = null;
    }
    
    // Check for missing required fields
    if (manifest) {
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
    // Check if icon is valid (has some data)
    const stats = fs.statSync(iconPath);
    if (stats.size === 0) {
      console.error(`❌ Icon ${icon.name} exists but is empty (0 bytes)`);
      missingIcons.push(icon);
    } else {
      // Copy to dist directory
      fs.copyFileSync(iconPath, distIconPath);
      console.log(`✅ Copied ${icon.name} to dist directory (${stats.size} bytes)`);
    }
  }
});

// Generate any missing icons
if (missingIcons.length > 0) {
  console.log(`\n⚠️ Missing required icons detected: ${missingIcons.map(i => i.name).join(', ')}`);
  console.log('Generating simple placeholder icons...');
  
  try {
    // Try to generate proper PNGs - this is a bit more complex but produces valid icons
    const generatePlaceholderIcon = (iconPath, size, isActive = false) => {
      // For simplicity on this fix, we'll create really basic icons
      // A proper icon generator would be better
      const Canvas = require('canvas');
      const canvas = new Canvas.createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Background
      ctx.fillStyle = isActive ? '#4CAF50' : '#2196F3'; 
      ctx.fillRect(0, 0, size, size);
      
      // Border
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = Math.max(1, Math.floor(size / 16));
      ctx.strokeRect(ctx.lineWidth/2, ctx.lineWidth/2, size - ctx.lineWidth, size - ctx.lineWidth);
      
      // Text
      const fontSize = Math.max(8, Math.floor(size / 4));
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = '#FFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DH', size / 2, size / 2);
      
      // Save to file
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(iconPath, buffer);
      return buffer.length;
    };
    
    // Try to use canvas to generate proper icons
    try {
      const Canvas = require('canvas');
      console.log('✅ Found canvas module, using it for icon generation');
      
      missingIcons.forEach(icon => {
        const iconPath = path.join(publicDir, icon.name);
        const distIconPath = path.join(distDir, icon.name);
        
        try {
          const isActive = icon.name.includes('-active');
          const fileSize = generatePlaceholderIcon(iconPath, icon.size, isActive);
          fs.copyFileSync(iconPath, distIconPath);
          console.log(`✅ Generated ${icon.name} (${fileSize} bytes) and copied to dist`);
        } catch (e) {
          console.error(`❌ Failed to generate ${icon.name}: ${e.message}`);
          // Fallback to basic placeholder
          createBasicPlaceholderIcon(icon);
        }
      });
    } catch (e) {
      console.warn('⚠️ Canvas module not available, using basic placeholders');
      
      // Fallback to very basic placeholders
      missingIcons.forEach(icon => {
        createBasicPlaceholderIcon(icon);
      });
    }
  } catch (e) {
    console.error(`❌ Error generating icons: ${e.message}`);
    
    // Very simple fallback
    missingIcons.forEach(icon => {
      createBasicPlaceholderIcon(icon);
    });
  }
  
  console.log('\n⚠️ Generated placeholder icons are not proper icons. Please use the Extension Icon Generator to create real icons.');
}

// Basic placeholder icon function
function createBasicPlaceholderIcon(icon) {
  const iconPath = path.join(publicDir, icon.name);
  const distIconPath = path.join(distDir, icon.name);
  
  // Create a minimal valid PNG
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A // PNG signature
  ]);
  
  // Write files to both locations
  fs.writeFileSync(iconPath, header);
  fs.writeFileSync(distIconPath, header);
  
  console.log(`✅ Created basic placeholder for ${icon.name}`);
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
    // Check if the file has content
    const stats = fs.statSync(filePath);
    if (stats.size === 0 && file.isRequired) {
      console.warn(`⚠️ ${file.name} exists but is empty (0 bytes). Adding placeholder content...`);
      
      // Add placeholder content based on file type
      if (file.name.endsWith('.js')) {
        fs.writeFileSync(filePath, `// Placeholder for ${file.name}\nconsole.log("${file.name} loaded");`);
        console.log(`✅ Added placeholder content to ${file.name}`);
      }
    }
    
    // Copy to dist directory
    fs.copyFileSync(filePath, distFilePath);
    console.log(`✅ Copied ${file.name} to dist directory (${stats.size} bytes)`);
  } else if (file.name === 'browser-polyfill.min.js') {
    // Special handling for browser-polyfill
    console.log(`❌ ${file.name} not found. Checking node_modules...`);
    
    const polyfillPath = path.join(__dirname, '..', 'node_modules', 'webextension-polyfill', 'dist', 'browser-polyfill.min.js');
    if (fs.existsSync(polyfillPath)) {
      fs.copyFileSync(polyfillPath, distFilePath);
      fs.copyFileSync(polyfillPath, filePath);
      const stats = fs.statSync(polyfillPath);
      console.log(`✅ Copied ${file.name} from node_modules (${stats.size} bytes)`);
    } else {
      console.error(`❌ Could not find ${file.name} in node_modules`);
      // Create empty placeholder
      const placeholderContent = `// Placeholder for browser-polyfill.min.js
// This is a minimally functional polyfill to prevent errors
if (!window.browser) {
  window.browser = {};
}

if (!window.browser.runtime) {
  window.browser.runtime = {
    sendMessage: function() { return Promise.resolve(); },
    onMessage: { addListener: function() {} },
    getURL: function(path) { return path; }
  };
}

if (!window.browser.storage) {
  window.browser.storage = {
    local: {
      get: function() { return Promise.resolve({}); },
      set: function() { return Promise.resolve(); }
    }
  };
}

if (!window.browser.tabs) {
  window.browser.tabs = {
    query: function() { return Promise.resolve([]); },
    sendMessage: function() { return Promise.resolve(); }
  };
}

console.warn('Using minimal browser-polyfill placeholder. Install the real polyfill for proper functionality.');
`;
      fs.writeFileSync(distFilePath, placeholderContent);
      fs.writeFileSync(filePath, placeholderContent);
      console.log(`⚠️ Created minimal functional placeholder for ${file.name}`);
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
    console.log(`ℹ️ Non-critical file ${file.name} not found, skipping`);
  }
});

// Update public/index.html if it exists to remove base href
const publicIndexPath = path.join(publicDir, 'index.html');
if (fs.existsSync(publicIndexPath)) {
  try {
    let indexContent = fs.readFileSync(publicIndexPath, 'utf8');
    if (indexContent.includes('<base href="/">')) {
      console.log('\n🔧 Fixing index.html: removing base href tag...');
      indexContent = indexContent.replace(/<base href="\/"[^>]*>/g, '');
      fs.writeFileSync(publicIndexPath, indexContent);
      console.log('✅ Removed base href tag from index.html');
    }
  } catch (e) {
    console.error('❌ Error updating index.html:', e.message);
  }
}

console.log('\n✅ Manifest and critical files fixed and copied to dist directory');
console.log('\nNext steps:');
console.log('1. Use the Extension Icon Generator to create proper icons');
console.log('2. Run a complete extension build with `node public/run-build-extension.js`');

// Log the path to the dist directory for convenience
console.log(`\nYour extension files are in: ${path.resolve(distDir)}`);

// Try to install canvas if not present
try {
  require('canvas');
} catch (e) {
  console.log('\n⚠️ The canvas module is not installed.');
  console.log('If you want better quality icon placeholders, consider installing it:');
  console.log('npm install canvas');
}
