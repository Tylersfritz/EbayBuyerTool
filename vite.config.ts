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

  // Handle browser polyfill copy
  const browserPolyfillPath = path.resolve('./node_modules/webextension-polyfill/dist/browser-polyfill.min.js');
  if (fs.existsSync(browserPolyfillPath)) {
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
          console.log('🔍 Checking for public/manifest.json at:', path.resolve('./public/manifest.json'));
          console.log('🔍 Does public/manifest.json exist?', fs.existsSync('./public/manifest.json'));

          if (!fs.existsSync('./dist')) {
            fs.mkdirSync('./dist', { recursive: true });
          }

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
            } catch (err: Error) {
              console.error(`❌ Error copying ${src}:`, err.message);
            }
          }
        },
        closeBundle() {
          console.log('🔍 Final check for public/manifest.json at:', path.resolve('./public/manifest.json'));
          console.log('🔍 Does public/manifest.json exist?', fs.existsSync('./public/manifest.json'));

          if (!fs.existsSync('./dist')) {
            fs.mkdirSync('./dist', { recursive: true });
          }

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
            } catch (err: Error) {
              console.error(`Error copying ${src}:`, err.message);
              if (critical) criticalError = true;
            }
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