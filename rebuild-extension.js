
#!/usr/bin/env node

/**
 * Wrapper script to run the safe-rebuild-extension.cjs file
 * This addresses module system conflicts by explicitly using the CJS version
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name in ESM context
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 DealHavenAI Extension Build Wrapper');
console.log('====================================');

// Check if the CJS script exists
const cjsScriptPath = path.join(__dirname, 'public', 'safe-rebuild-extension.cjs');
if (!fs.existsSync(cjsScriptPath)) {
  console.error(`❌ ERROR: Could not find ${cjsScriptPath}`);
  console.log('Creating the script now...');
  
  // We'll ensure the script exists by copying the content
  const jsScriptPath = path.join(__dirname, 'public', 'safe-rebuild-extension.js');
  
  if (fs.existsSync(jsScriptPath)) {
    const scriptContent = fs.readFileSync(jsScriptPath, { encoding: 'utf8', flag: 'r' });
    fs.writeFileSync(cjsScriptPath, scriptContent);
    console.log(`✅ Created ${cjsScriptPath} from safe-rebuild-extension.js`);
  } else {
    console.error(`❌ ERROR: Could not find source file at ${jsScriptPath}`);
    console.log('Attempting to create a minimal build script...');
    
    // Create a minimal build script
    const minimalScript = `
/**
 * Minimal Safe Extension Rebuild Script
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔎 DealHavenAI Minimal Build Process');
console.log('=================================');

// Get the project directory
const projectDir = path.resolve('.');
console.log(\`Working directory: \${projectDir}\`);

// Clean dist directory
console.log('\\n🧹 Cleaning dist directory...');
const distDir = path.join(projectDir, 'dist');

if (fs.existsSync(distDir)) {
  try {
    if (process.platform === "win32") {
      execSync(\`rmdir /s /q "\${distDir}"\`, { stdio: 'ignore' });
    } else {
      execSync(\`rm -rf "\${distDir}"\`, { stdio: 'ignore' });
    }
    console.log('✅ Removed old dist directory');
  } catch (error) {
    console.error('❌ Error removing dist directory:', error.message);
  }
}

// Create fresh dist directory
fs.mkdirSync(distDir, { recursive: true });
console.log('✅ Created fresh dist directory');

// Run the build
console.log('\\n🛠️ Building extension...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Copy critical files
console.log('\\n📋 Copying critical extension files...');
const publicDir = path.join(projectDir, 'public');
const criticalFiles = [
  'manifest.json',
  'browser-polyfill.min.js',
  'content.js',
  'background.js',
  'icon-16.png',
  'icon-48.png',
  'icon-128.png'
];

criticalFiles.forEach(file => {
  const sourcePath = path.join(publicDir, file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(\`✅ Copied \${file} to dist folder\`);
    } catch (error) {
      console.error(\`❌ Error copying \${file}:\`, error.message);
    }
  } else {
    console.error(\`❌ Could not find \${file} in public folder\`);
  }
});

console.log('\\n🎉 Extension rebuild process completed!');
`;
    
    fs.writeFileSync(cjsScriptPath, minimalScript);
    console.log(`✅ Created minimal build script at ${cjsScriptPath}`);
  }
}

// Execute the CJS build script
try {
  console.log(`Running safe-rebuild-extension.cjs from ${cjsScriptPath}...`);
  execSync(`node "${cjsScriptPath}"`, { stdio: 'inherit' });
  console.log('✅ Build process completed!');
} catch (error) {
  console.error('❌ Build process failed:', error.message);
  console.error('\nTrying fallback build method...');
  
  try {
    // Fallback to using build-extension.cjs
    const fallbackPath = path.join(__dirname, 'build-extension.cjs');
    console.log(`Running fallback build from ${fallbackPath}...`);
    
    if (fs.existsSync(fallbackPath)) {
      execSync(`node "${fallbackPath}"`, { stdio: 'inherit' });
      console.log('✅ Fallback build process completed!');
    } else {
      console.error(`❌ Fallback script not found at ${fallbackPath}`);
      process.exit(1);
    }
  } catch (fallbackError) {
    console.error('❌ Fallback build process failed:', fallbackError.message);
    process.exit(1);
  }
}
