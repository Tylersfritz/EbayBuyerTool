
/**
 * CommonJS Extension Build Script
 * This script serves as the entry point for extension builds
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 DealHavenAI Extension Build Script');
console.log('==================================');

// Get the project directory
const projectDir = path.resolve('.');
console.log(`Working directory: ${projectDir}`);

// Define the path to the safe rebuild script
const safeRebuildPath = path.join(projectDir, 'public', 'safe-rebuild-extension.cjs');

// First check if the script exists
if (!fs.existsSync(safeRebuildPath)) {
  console.error(`❌ Could not find build script at: ${safeRebuildPath}`);
  
  // Check if the JS version exists (which we can copy)
  const jsVersionPath = path.join(projectDir, 'public', 'safe-rebuild-extension.js');
  if (fs.existsSync(jsVersionPath)) {
    console.log(`Found JS version at ${jsVersionPath}, copying to CJS version...`);
    
    try {
      const content = fs.readFileSync(jsVersionPath, 'utf8');
      fs.writeFileSync(safeRebuildPath, content);
      console.log(`✅ Created ${safeRebuildPath} from JS version`);
    } catch (error) {
      console.error(`❌ Error copying script: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.error('❌ Could not find any build script to use. Check your installation.');
    process.exit(1);
  }
}

// Run the safe rebuild script
try {
  console.log(`\n🛠️ Running build script: ${safeRebuildPath}`);
  execSync(`node "${safeRebuildPath}"`, { stdio: 'inherit' });
  console.log('✅ Extension build completed successfully!');
} catch (error) {
  console.error('❌ Build process failed:', error.message);
  process.exit(1);
}

// Verify the build
try {
  const distDir = path.join(projectDir, 'dist');
  const manifestPath = path.join(distDir, 'manifest.json');
  
  if (fs.existsSync(manifestPath)) {
    console.log('✅ Build verification: manifest.json exists in dist folder');
    
    // Check for other critical files
    const criticalFiles = [
      'index.html',
      'background.js',
      'content.js'
    ];
    
    const missingFiles = criticalFiles.filter(file => !fs.existsSync(path.join(distDir, file)));
    
    if (missingFiles.length === 0) {
      console.log('✅ All critical files are present in the dist folder');
    } else {
      console.warn(`⚠️ Missing some files in dist: ${missingFiles.join(', ')}`);
    }
  } else {
    console.error('❌ Build verification failed: manifest.json not found in dist folder');
  }
} catch (error) {
  console.error('❌ Error during build verification:', error.message);
}

console.log('\n🎉 Build process complete!');
console.log('\nTo load your extension in Chrome:');
console.log('1. Go to chrome://extensions/');
console.log('2. Enable "Developer mode" in the top right corner');
console.log('3. Click "Load unpacked" and select the dist folder:');
console.log(`   ${path.resolve(path.join(projectDir, 'dist'))}`);
