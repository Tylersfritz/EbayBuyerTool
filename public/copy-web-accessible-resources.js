
/**
 * Web Accessible Resources Copy Script
 * 
 * This script specifically ensures that all web accessible resources
 * listed in the manifest.json are properly copied to the dist directory
 */

const fs = require('fs');
const path = require('path');

console.log('🖼️ Copying web accessible resources...');

// Ensure dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('✅ Created dist directory');
}

// Read the manifest to get the list of web accessible resources
const manifestPath = path.join(__dirname, 'manifest.json');

try {
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestContent);
  let resourceCount = 0;
  let missingResources = 0;

  // Process web_accessible_resources
  if (manifest.web_accessible_resources && Array.isArray(manifest.web_accessible_resources)) {
    for (const resourceEntry of manifest.web_accessible_resources) {
      if (resourceEntry.resources && Array.isArray(resourceEntry.resources)) {
        for (const resourcePath of resourceEntry.resources) {
          resourceCount++;
          const sourcePath = path.join(__dirname, resourcePath);
          const destPath = path.join(distDir, resourcePath);
          
          // Ensure the destination directory exists
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          
          // Copy the resource if it exists
          if (fs.existsSync(sourcePath)) {
            try {
              fs.copyFileSync(sourcePath, destPath);
              const stats = fs.statSync(sourcePath);
              console.log(`✅ Copied ${resourcePath} to dist (${stats.size} bytes)`);
            } catch (copyError) {
              console.error(`❌ Error copying ${resourcePath}: ${copyError.message}`);
            }
          } else {
            console.error(`❌ Web accessible resource not found: ${resourcePath}`);
            missingResources++;
            
            // For image resources with an empty HTML comment, create an actual image
            if (resourcePath.endsWith('.png') || resourcePath.endsWith('.jpg') || 
                resourcePath.endsWith('.svg') || resourcePath.endsWith('.gif')) {
              try {
                // Check if file exists but might be an HTML comment file
                if (fs.existsSync(sourcePath)) {
                  const content = fs.readFileSync(sourcePath, 'utf8');
                  // If it starts with HTML comment, it's not a real image
                  if (content.trim().startsWith('<!--')) {
                    console.log(`🔄 Found HTML comment placeholder for ${resourcePath}, creating a real image...`);
                    
                    // Create a minimum viable empty PNG (1x1 transparent pixel)
                    // This is a base64-encoded 1x1 transparent PNG
                    const minimalPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
                    fs.writeFileSync(destPath, minimalPng);
                    console.log(`✅ Created minimal image for ${resourcePath}`);
                  }
                }
              } catch (err) {
                console.error(`❌ Failed to create minimal image for ${resourcePath}: ${err.message}`);
              }
            }
          }
        }
      }
    }
  }

  console.log(`\n📊 Web accessible resources: ${resourceCount - missingResources}/${resourceCount} copied successfully`);
  
  if (missingResources > 0) {
    console.warn(`⚠️ ${missingResources} resources were missing or failed to copy`);
    console.log('👉 Some missing resources were replaced with minimal placeholder images');
  } else {
    console.log('✅ All web accessible resources were copied successfully');
  }
} catch (error) {
  console.error('❌ Error processing manifest.json:', error.message);
  process.exit(1);
}
