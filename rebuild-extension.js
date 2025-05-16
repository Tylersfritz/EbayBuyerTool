
/**
 * Wrapper script to run the safe-rebuild-extension.cjs file
 * This addresses module system conflicts by explicitly using the CJS version
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM context
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 DealHavenAI Extension Build Wrapper');
console.log('====================================');

// Execute the CJS build script
try {
  console.log('Running safe-rebuild-extension.cjs...');
  execSync('node ./public/safe-rebuild-extension.cjs', { stdio: 'inherit' });
  console.log('✅ Build process completed!');
} catch (error) {
  console.error('❌ Build process failed:', error.message);
  process.exit(1);
}
