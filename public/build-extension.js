
// Standalone build extension script
// This script can be run directly without modifying package.json
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 DealHaven Extension Builder');
console.log('============================');

const runCommand = (command, errorMessage) => {
  try {
    console.log(`> Running: ${command}`);
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    console.error(`❌ ${errorMessage}:`);
    console.error(error.message);
    return { success: false, error };
  }
};

// 1. First run fix-manifest.js to prepare necessary files
console.log('\n📝 Step 1: Running fix-manifest.js to prepare files...');
const fixManifestPath = path.join(__dirname, 'fix-manifest.js');

if (!fs.existsSync(fixManifestPath)) {
  console.error('❌ Error: fix-manifest.js not found in public directory!');
  process.exit(1);
}

const fixResult = runCommand(`node "${fixManifestPath}"`, 'Error running fix-manifest.js');
if (!fixResult.success) {
  process.exit(1);
}

// 2. Run the vite build
console.log('\n🔨 Step 2: Running Vite build...');
const buildResult = runCommand('npx vite build', 'Error during build process');
if (!buildResult.success) {
  process.exit(1);
}

// 3. Verify and fix dist directory
console.log('\n🔍 Step 3: Verifying dist directory...');

// Ensure dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('✅ Created dist directory');
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

let allFilesCopied = true;

// Copy critical files first
for (const file of criticalFiles) {
  if (fs.existsSync(file.src)) {
    fs.copyFileSync(file.src, file.dest);
    console.log(`✅ Copied ${path.basename(file.src)} to dist folder`);
  } else {
    console.error(`❌ CRITICAL: ${path.basename(file.src)} not found! Extension will not work!`);
    allFilesCopied = false;
  }
}

// Copy optional files if they exist
for (const file of optionalFiles) {
  if (fs.existsSync(file.src)) {
    fs.copyFileSync(file.src, file.dest);
    console.log(`✅ Copied ${path.basename(file.src)} to dist folder`);
  } else {
    console.log(`ℹ️ Optional file ${path.basename(file.src)} not found - skipping`);
  }
}

// Check if manifest.json was copied successfully
if (fs.existsSync(path.join(distDir, 'manifest.json'))) {
  try {
    const manifestContent = fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8');
    const manifest = JSON.parse(manifestContent);
    console.log('✅ manifest.json is valid JSON');
    
    // Validate manifest fields
    const requiredFields = ['manifest_version', 'name', 'version', 'description', 'action', 'icons'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      console.warn(`⚠️ Manifest is missing fields: ${missingFields.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Error reading or parsing manifest.json:', error.message);
    allFilesCopied = false;
  }
}

// Summary and next steps
console.log('\n📋 Build Summary:');
if (allFilesCopied) {
  console.log('✅ All critical files copied successfully.');
  console.log('\n🎉 Extension build completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Open Chrome and navigate to chrome://extensions/');
  console.log('2. Enable "Developer mode" in the top right corner');
  console.log('3. Click "Load unpacked" and select the "dist" directory');
  console.log(`   (${path.resolve(distDir)})`);
} else {
  console.error('\n❌ Build completed with errors. Please check the messages above.');
}
