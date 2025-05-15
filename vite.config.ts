
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
        name: 'copy-manifest-files',
        // Change to closeBundle to ensure it runs at the end of the build process
        closeBundle() {
          // Ensure dist directory exists
          if (!fs.existsSync('./dist')) {
            fs.mkdirSync('./dist', { recursive: true });
          }
          
          // Copy manifest files
          console.log('Copying manifest files to dist directory...');
          
          const filesToCopy = [
            { src: './public/manifest.json', dest: './dist/manifest.json' },
            { src: './public/manifest.edge.json', dest: './dist/manifest.edge.json' },
            { src: './public/manifest.firefox.json', dest: './dist/manifest.firefox.json' },
            { src: './public/browser-polyfill.min.js', dest: './dist/browser-polyfill.min.js' },
            { src: './public/icon-16.png', dest: './dist/icon-16.png' },
            { src: './public/icon-48.png', dest: './dist/icon-48.png' },
            { src: './public/icon-128.png', dest: './dist/icon-128.png' },
            { src: './public/icon-16-active.png', dest: './dist/icon-16-active.png' },
            { src: './public/icon-48-active.png', dest: './dist/icon-48-active.png' },
            { src: './public/icon-128-active.png', dest: './dist/icon-128-active.png' },
            { src: './public/favicon.ico', dest: './dist/favicon.ico' },
            { src: './public/placeholder.svg', dest: './dist/placeholder.svg' },
            { src: './public/content.js', dest: './dist/content.js' },
            { src: './public/background.js', dest: './dist/background.js' },
            { src: './public/mercari-content.js', dest: './dist/mercari-content.js' },
          ];
          
          // Copy each file if it exists
          for (const { src, dest } of filesToCopy) {
            try {
              if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                console.log(`✅ Copied ${path.basename(src)} to dist folder`);
              } else {
                console.warn(`⚠️ Could not find ${src}`);
              }
            } catch (error) {
              console.error(`Error copying ${src}:`, error);
            }
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
