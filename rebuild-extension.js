
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
  const scriptContent = fs.readFileSync(
    path.join(__dirname, 'public', 'safe-rebuild-extension.js'), 
    { encoding: 'utf8', flag: 'r' }
  );
  
  fs.writeFileSync(cjsScriptPath, scriptContent);
  console.log(`✅ Created ${cjsScriptPath}`);
}

// Execute the CJS build script
try {
  console.log('Running safe-rebuild-extension.cjs...');
  execSync(`node "${cjsScriptPath}"`, { stdio: 'inherit' });
  console.log('✅ Build process completed!');
} catch (error) {
  console.error('❌ Build process failed:', error.message);
  process.exit(1);
}
