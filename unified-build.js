
#!/usr/bin/env node

/**
 * Universal entry point for the DealHaven extension build process
 * Works in both ESM and CommonJS environments
 */

// Determine if we're in ESM or CJS mode
const isESM = typeof require === 'undefined';

console.log('🚀 DealHaven Unified Build Starting...');
console.log('=====================================');

// ESM mode
if (isESM) {
  console.log('📦 Running in ESM mode');
  
  import('./build-wrapper.cjs')
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
    require('./build-wrapper.cjs');
    console.log('✅ Build completed successfully via CommonJS require');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}
