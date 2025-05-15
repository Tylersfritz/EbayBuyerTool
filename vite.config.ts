
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from "lovable-tagger";
import fs from 'fs';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  const browserPolyfillPath = path.resolve(
    './node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
  );
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
  }
  if (fs.existsSync(browserPolyfillPath)) {
    fs.copyFileSync(
      browserPolyfillPath,
      './public/browser-polyfill.min.js'
    );
    console.log('✅ Copied browser-polyfill.min.js to public folder');
  } else {
    console.warn('⚠️ Could not find browser-polyfill.min.js in node_modules');
  }

  return {
    base: './',
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      {
        name: 'copy-manifest-files',
        buildEnd() {
          // Ensure dist directory exists
          if (!fs.existsSync('./dist')) {
            fs.mkdirSync('./dist');
          }
          
          // Copy manifest files
          console.log('Copying manifest files to dist directory...');
          
          try {
            // Copy main manifest
            if (fs.existsSync('./public/manifest.json')) {
              fs.copyFileSync('./public/manifest.json', './dist/manifest.json');
              console.log('✅ Copied manifest.json to dist folder');
            } else {
              console.warn('⚠️ Could not find manifest.json in public folder');
            }
            
            // Copy browser-specific manifests
            if (fs.existsSync('./public/manifest.edge.json')) {
              fs.copyFileSync('./public/manifest.edge.json', './dist/manifest.edge.json');
              console.log('✅ Copied manifest.edge.json to dist folder');
            }
            
            if (fs.existsSync('./public/manifest.firefox.json')) {
              fs.copyFileSync('./public/manifest.firefox.json', './dist/manifest.firefox.json');
              console.log('✅ Copied manifest.firefox.json to dist folder');
            }
          } catch (error) {
            console.error('Error copying manifest files:', error);
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
          index: path.resolve(__dirname, 'index.html'),
          content: path.resolve(__dirname, 'public/content.js'),
          background: path.resolve(__dirname, 'public/background.js'),
          mercari: path.resolve(__dirname, 'public/mercari-content.js'),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (['content', 'background', 'mercari'].includes(chunkInfo.name)) {
              return '[name].js';
            }
            return 'assets/[name]-[hash].js';
          }
        },
        external: ['webextension-polyfill']
      },
      assetsInlineLimit: 0,
      copyPublicDir: true
    }
  };
});
