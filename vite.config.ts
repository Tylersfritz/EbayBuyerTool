
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

export default defineConfig(({ mode }) => {
  // Create public directory if it doesn't exist
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
  }

  // Handle browser polyfill copy without modifying package.json
  const browserPolyfillPath = path.resolve(
    './node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
  );
  
  if (fs.existsSync(browserPolyfillPath)) {
    // Only copy if the destination doesn't exist
    const destPath = './public/browser-polyfill.min.js';
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(browserPolyfillPath, destPath);
      console.log('✅ Copied browser-polyfill.min.js to public folder');
    }
  } else {
    console.warn('⚠️ Could not find browser-polyfill.min.js in node_modules');
  }

  return {
    base: './',
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      {
        name: 'copy-extension-files-early',
        buildStart() {
          console.log('🚀 Copying critical extension files early in the build process...');
          
          // Debug logs to check if manifest.json exists
          console.log('🔍 Checking for public/manifest.json at:', path.resolve('./public/manifest.json'));
          console.log('🔍 Does public/manifest.json exist?', fs.existsSync('./public/manifest.json'));
          
          // Check the content of manifest.json if it exists
          if (fs.existsSync('./public/manifest.json')) {
            try {
              const manifestContent = fs.readFileSync('./public/manifest.json', 'utf8');
              console.log('📝 First few characters of manifest.json:', manifestContent.substring(0, 50) + '...');
              
              // Validate JSON format
              try {
                JSON.parse(manifestContent);
                console.log('✅ manifest.json is valid JSON');
              } catch (jsonError: any) {
                console.error('❌ manifest.json is NOT valid JSON:', jsonError.message);
              }
            } catch (err) {
              console.error('❌ Error reading manifest.json:', err);
            }
          }
          
          // Ensure dist directory exists
          if (!fs.existsSync('./dist')) {
            fs.mkdirSync('./dist', { recursive: true });
          }
          
          // Critical files that must be copied early
          const criticalFiles = [
            { src: './public/manifest.json', dest: './dist/manifest.json' },
            { src: './public/icon-16.png', dest: './dist/icon-16.png' },
            { src: './public/icon-48.png', dest: './dist/icon-48.png' },
            { src: './public/icon-128.png', dest: './dist/icon-128.png' },
            { src: './public/browser-polyfill.min.js', dest: './dist/browser-polyfill.min.js' }
          ];
          
          for (const { src, dest } of criticalFiles) {
            try {
              if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                console.log(`✅ Early copy: ${path.basename(src)} -> dist`);
              } else {
                console.error(`❌ CRITICAL ERROR: ${src} not found!`);
              }
            } catch (error) {
              console.error(`❌ Error copying ${src}:`, error);
            }
          }
        },
        // Also use closeBundle to ensure files are copied at the end of build
        closeBundle() {
          // Debug logs for closeBundle
          console.log('🔍 Final check for public/manifest.json at:', path.resolve('./public/manifest.json'));
          console.log('🔍 Does public/manifest.json exist?', fs.existsSync('./public/manifest.json'));
          
          if (fs.existsSync('./public/manifest.json')) {
            console.log('📁 Manifest file stats:', fs.statSync('./public/manifest.json'));
          }
          
          // Ensure dist directory exists
          if (!fs.existsSync('./dist')) {
            fs.mkdirSync('./dist', { recursive: true });
          }
          
          // Copy all extension files
          console.log('Copying extension files to dist directory...');
          
          const filesToCopy = [
            { src: './public/manifest.json', dest: './dist/manifest.json', critical: true },
            { src: './public/manifest.edge.json', dest: './dist/manifest.edge.json', critical: false },
            { src: './public/manifest.firefox.json', dest: './dist/manifest.firefox.json', critical: false },
            { src: './public/browser-polyfill.min.js', dest: './dist/browser-polyfill.min.js', critical: true },
            { src: './public/icon-16.png', dest: './dist/icon-16.png', critical: true },
            { src: './public/icon-48.png', dest: './dist/icon-48.png', critical: true },
            { src: './public/icon-128.png', dest: './dist/icon-128.png', critical: true },
            { src: './public/icon-16-active.png', dest: './dist/icon-16-active.png', critical: false },
            { src: './public/icon-48-active.png', dest: './dist/icon-48-active.png', critical: false },
            { src: './public/icon-128-active.png', dest: './dist/icon-128-active.png', critical: false },
            { src: './public/favicon.ico', dest: './dist/favicon.ico', critical: false },
            { src: './public/placeholder.svg', dest: './dist/placeholder.svg', critical: false },
            { src: './public/content.js', dest: './dist/content.js', critical: true },
            { src: './public/background.js', dest: './dist/background.js', critical: true },
            { src: './public/mercari-content.js', dest: './dist/mercari-content.js', critical: true },
          ];
          
          // Copy each file if it exists
          let criticalError = false;
          for (const { src, dest, critical } of filesToCopy) {
            try {
              if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                console.log(`✅ Copied ${path.basename(src)} to dist folder`);
              } else {
                const message = `Could not find ${src}`;
                if (critical) {
                  console.error(`❌ CRITICAL: ${message} - Extension will not work!`);
                  criticalError = true;
                } else {
                  console.warn(`⚠️ ${message}`);
                }
              }
            } catch (error) {
              console.error(`Error copying ${src}:`, error);
              if (critical) criticalError = true;
            }
          }
          
          // Verify manifest.json was properly copied to dist
          if (fs.existsSync('./dist/manifest.json')) {
            console.log('✅ Verified manifest.json exists in dist folder');
            try {
              const manifestSize = fs.statSync('./dist/manifest.json').size;
              console.log(`📊 manifest.json in dist is ${manifestSize} bytes`);
              
              // Validate the copied manifest
              try {
                const manifestContent = fs.readFileSync('./dist/manifest.json', 'utf8');
                JSON.parse(manifestContent);
                console.log('✅ manifest.json in dist is valid JSON');
              } catch (jsonError: any) {
                console.error('❌ manifest.json in dist is NOT valid JSON:', jsonError.message);
              }
            } catch (err) {
              console.error('❌ Error verifying manifest.json in dist:', err);
            }
          } else {
            console.error('❌ CRITICAL: manifest.json NOT found in dist folder!');
            criticalError = true;
          }
          
          if (criticalError) {
            console.error('❌ CRITICAL ERRORS detected! Extension may not load properly.');
          } else {
            console.log('✅ All critical extension files copied successfully.');
          }
        }
      }
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 8080,
      host: "::"
    },
    optimizeDeps: {
      exclude: ['webextension-polyfill'],
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'index.html')
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        },
        external: ['webextension-polyfill']
      },
      assetsInlineLimit: 0,
      copyPublicDir: true
    }
  };
});

