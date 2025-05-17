
#!/usr/bin/env node

/**
 * Clean and Build Script
 * This script clears npm cache, removes dist directory, then runs the unified build extension
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting clean and build process...');

// Step 1: Clear npm cache
console.log('\n1️⃣ Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Npm cache cleared successfully');
} catch (error) {
  console.error(`❌ Error clearing npm cache: ${error.message}`);
  console.log('Continuing with build process...');
}

// Step 2: Remove node_modules/.vite to clear Vite's optimization cache
console.log('\n2️⃣ Clearing Vite cache...');
const viteCacheDir = path.join(process.cwd(), 'node_modules', '.vite');
if (fs.existsSync(viteCacheDir)) {
  try {
    if (process.platform === "win32") {
      execSync('rmdir /s /q "node_modules\\.vite"', { stdio: 'inherit' });
    } else {
      execSync('rm -rf node_modules/.vite', { stdio: 'inherit' });
    }
    console.log('✅ Removed Vite cache successfully');
  } catch (error) {
    console.error(`❌ Error removing Vite cache: ${error.message}`);
    console.log('Continuing with build process...');
  }
}

// Step 3: Remove dist directory
console.log('\n3️⃣ Removing dist directory...');
const distDir = path.join(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  try {
    if (process.platform === "win32") {
      execSync('rmdir /s /q dist', { stdio: 'inherit' });
    } else {
      execSync('rm -rf dist', { stdio: 'inherit' });
    }
    console.log('✅ Removed dist directory successfully');
  } catch (error) {
    console.error(`❌ Error removing dist directory: ${error.message}`);
    console.log('Continuing with build process...');
  }
} else {
  console.log('✅ Dist directory does not exist, nothing to remove');
}

// Step 4: Run unified build extension script
console.log('\n4️⃣ Running unified build extension script...');
try {
  execSync('node unified-build-extension.cjs', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error(`❌ Build failed: ${error.message}`);
  process.exit(1);
}

console.log('\n🎉 Clean and build process completed!');
console.log('\nYou can now load your extension in Chrome from the dist directory:');
console.log(`${path.resolve(distDir)}`);
