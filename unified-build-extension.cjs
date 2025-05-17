const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname);
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');

function unifiedBuild() {
  console.log('Running unified extension build...');

  // Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // Run Vite build
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: projectRoot });
    console.log('Unified build completed.');
  } catch (error) {
    console.error('Unified build failed:', error.message);
    process.exit(1);
  }

  // Verify critical files
  const criticalFiles = ['manifest.json', 'background.js', 'content.js'];
  criticalFiles.forEach(file => {
    const dest = path.join(distDir, file);
    if (!fs.existsSync(dest)) {
      console.error(`Error: ${file} not found in dist/`);
      process.exit(1);
    }
  });

  console.log('Unified build verified.');
}

if (require.main === module) {
  unifiedBuild();
}

module.exports = { unifiedBuild };
