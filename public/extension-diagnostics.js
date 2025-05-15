
// Extension Diagnostics Script
// Run this from the browser console in the extension page to diagnose issues

console.log("🔍 Running DealHaven extension diagnostics...");

// Check for critical extension files
async function checkForFile(path) {
  try {
    const response = await fetch(path);
    return {
      exists: response.ok,
      status: response.status,
      contentType: response.headers.get('content-type'),
    };
  } catch (e) {
    return {
      exists: false, 
      error: e.message
    };
  }
}

async function runDiagnostics() {
  console.log("📋 Checking critical files...");
  
  const criticalFiles = [
    'manifest.json',
    'icon-16.png',
    'icon-48.png', 
    'icon-128.png',
    'browser-polyfill.min.js',
    'content.js',
    'background.js'
  ];
  
  const results = {};
  
  for (const file of criticalFiles) {
    results[file] = await checkForFile(file);
    console.log(`${file}: ${results[file].exists ? '✅ Found' : '❌ Missing'}`);
  }
  
  // Check manifest.json content if it exists
  if (results['manifest.json'].exists) {
    try {
      const manifestResponse = await fetch('manifest.json');
      const manifest = await manifestResponse.json();
      console.log("✅ manifest.json is valid JSON");
      
      // Check required fields
      const requiredFields = ['name', 'version', 'manifest_version', 'action', 'icons'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length > 0) {
        console.error(`❌ Manifest missing required fields: ${missingFields.join(', ')}`);
      } else {
        console.log("✅ Manifest has all required fields");
        
        // Check icons specifically
        if (manifest.icons) {
          console.log("Icon paths in manifest:");
          console.log(JSON.stringify(manifest.icons, null, 2));
        }
        
        // Check action icon
        if (manifest.action && manifest.action.default_icon) {
          console.log("Action icon paths in manifest:");
          console.log(JSON.stringify(manifest.action.default_icon, null, 2));
        }
      }
    } catch (e) {
      console.error("❌ Error parsing manifest.json:", e);
    }
  }
  
  console.log("\n📊 Extension Environment:");
  console.log(`Extension ID: ${chrome.runtime.id || 'Not available'}`);
  console.log(`Loading from: ${location.href}`);
  console.log(`Chrome Version: ${/Chrome\/([0-9.]+)/.exec(navigator.userAgent)?.[1] || 'Unknown'}`);
  
  console.log("\n🔧 Suggestions:");
  if (!results['manifest.json'].exists) {
    console.log("- manifest.json is missing. Check your build process.");
  }
  
  const missingIcons = ['icon-16.png', 'icon-48.png', 'icon-128.png'].filter(icon => !results[icon].exists);
  if (missingIcons.length > 0) {
    console.log(`- Missing icons: ${missingIcons.join(', ')}. Generate them using the IconGenerator component.`);
  }
  
  if (!results['browser-polyfill.min.js'].exists) {
    console.log("- browser-polyfill.min.js is missing. Check your build process or reinstall webextension-polyfill.");
  }
  
  console.log("\n✅ Diagnostics complete. Check the logs above for issues and suggestions.");
}

// Run the diagnostics
runDiagnostics();

// Export it to make it available in the console
window.runExtensionDiagnostics = runDiagnostics;
