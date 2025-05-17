// unified-build.cjs
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('DealHaven Unified Build Process');
console.log('=================================');

const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found');
  process.exit(1);
}

console.log('\nStep 1: Running Vite build...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Vite build completed successfully');
} catch (error) {
  console.error('Vite build failed:', error.message);
  process.exit(1);
}

console.log('\nStep 2: Running extension build process...');
try {
  execSync('node unified-build-extension.cjs', { stdio: 'inherit' });
  console.log('Extension build completed successfully');
} catch (error) {
  console.error('Extension build failed:', error.message);
  process.exit(1);
}

console.log('\nBuild process completed!');
console.log('\nLoad extension from:', path.resolve(path.join(__dirname, 'dist')));