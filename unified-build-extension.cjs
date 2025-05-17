// unified-build-extension.cjs
const fs = require('fs-extra');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');
const srcDir = path.join(__dirname, 'src');
const lovableDir = path.join(__dirname, 'lovable.dev/src');

fs.ensureDirSync(distDir);

if (fs.existsSync(lovableDir)) {
  fs.copySync(lovableDir, srcDir, { overwrite: true });
}

['manifest.json', 'content.js', 'background.js', 'browser-polyfill.min.js'].forEach(file => {
  const srcPath = path.join(publicDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copySync(srcPath, path.join(distDir, file));
  } else {
    console.error(`Missing file: ${file}`);
    process.exit(1);
  }
});

const assetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(assetsDir) || !fs.readdirSync(assetsDir).some(file => file.includes('index'))) {
  console.error('Arbitrage code not found in dist/assets!');
  process.exit(1);
}

const assetFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.js'));
let foundComponents = false;
for (const file of assetFiles) {
  const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
  if (content.includes('ArbitragePrompt') && content.includes('VisualScanner')) {
    foundComponents = true;
    break;
  }
}
if (!foundComponents) {
  console.error('ArbitragePrompt or VisualScanner not found in bundled assets!');
  process.exit(1);
}

console.log('Extension files copied successfully');