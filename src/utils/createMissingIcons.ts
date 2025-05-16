
/**
 * Utility for creating missing icon files
 * This is used to ensure all required icon files exist in the public directory
 */

import fs from 'fs';
import path from 'path';

export function createMissingIcons(): void {
  const publicDir = path.resolve('./public');
  
  // Check if icon-16-active.png exists
  const icon16ActivePath = path.join(publicDir, 'icon-16-active.png');
  const icon16Path = path.join(publicDir, 'icon-16.png');
  
  if (!fs.existsSync(icon16ActivePath) && fs.existsSync(icon16Path)) {
    console.log('Creating missing icon-16-active.png from icon-16.png...');
    fs.copyFileSync(icon16Path, icon16ActivePath);
    console.log('✅ Created icon-16-active.png');
  }
  
  // Verify all critical files exist
  const criticalFiles = [
    'manifest.json',
    'browser-polyfill.min.js',
    'content.js',
    'background.js',
    'mercari-content.js',
    'placeholder.svg',
    'icon-16.png',
    'icon-48.png',
    'icon-128.png',
    'icon-16-active.png', // We just created this if missing
    'icon-48-active.png',
    'icon-128-active.png',
    'favicon.ico'
  ];
  
  const missingFiles: string[] = [];
  
  criticalFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing critical files:', missingFiles.join(', '));
  } else {
    console.log('✅ All critical files exist in public directory');
  }
}
