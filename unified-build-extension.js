
#!/usr/bin/env node

/**
 * Universal extension build script that avoids modifying package.json
 * Works in both ESM and CommonJS environments
 */

// Determine if we're in ESM or CJS mode
const isESM = typeof require === 'undefined';

// ESM mode
if (isESM) {
  console.log('📦 Running in ESM mode');
  
  import('./public/run-build-extension.js')
    .then(() => {
      console.log('✅ Build completed successfully via ESM import');
    })
    .catch(error => {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    });
}
// CommonJS mode
else {
  console.log('📦 Running in CommonJS mode');
  
  try {
    require('./public/run-build-extension.js');
    console.log('✅ Build completed successfully via CommonJS require');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}
