import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

export default defineConfig(({ mode }) => {
  console.log('≡ƒÜÇ Starting Vite config with mode:', mode);
  console.log('≡ƒôé Current working directory:', process.cwd());

  // Create public directory if it doesn't exist
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
    console.log('Γ£à Created missing public directory');
  } else {
    console.log('Γ£à Public directory exists');
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
      console.log('Γ£à Copied browser-polyfill.min.js to public folder');
    } else {
      console.log('Γ£à browser-polyfill.min.js already exists in public folder');
    }
  } else {
    console.warn('ΓÜá∩╕Å Could not find browser-polyfill.min.js in node_modules');
  }

  return {
    base: './',
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      {
        name: 'copy-extension-files-early',
        buildStart() {
          console.log('≡ƒÜÇ Copying critical extension files early in the build process...');

          // Enhanced manifest debugging
          console.log('≡ƒöì PUBLIC DIRECTORY CONTENTS:');
          try {
            const files = fs.readdirSync('./public');
            files.forEach(file => {
              try {
                const stats = fs.statSync(path.join('./public', file));
                console.log(`   - ${file} (${stats.size} bytes)`);
              } catch (err) {
                console.log(`   - ${file} (error getting size: ${err.message})`);
              }
            });
          } catch (err) {
            console.error('Γ¥î Error reading public directory:', err.message);
          }

          // Debug logs to check if manifest.json exists
          console.log('≡ƒöì Checking for public/manifest.json at:', path.resolve('./public/manifest.json'));
          console.log('≡ƒöì Does public/manifest.json exist?', fs.existsSync('./public/manifest.json'));

          // Check the content of manifest.json if it exists
          if (fs.existsSync('./public/manifest.json')) {
            try {
              const manifestContent = fs.readFileSync('./public/manifest.json', 'utf8');
              console.log('≡ƒô¥ First few characters of manifest.json:', manifestContent.substring(0, 50) + '...');
              console.log('≡ƒôè manifest.json size:', manifestContent.length, 'bytes');

              // Validate JSON format
              try {
                JSON.parse(manifestContent);
                console.log('Γ£à manifest.json is valid JSON');
              } catch (jsonError) {
                console.error('Γ¥î manifest.json is NOT valid JSON:', jsonError.message);
              }
            } catch (err) {
              console.error('Γ¥î Error reading manifest.json:', err.message);
            }
          } else {
            console.error('Γ¥î CRITICAL ERROR: public/manifest.json NOT FOUND!');
          }

          // Ensure dist directory exists
          if (!fs.existsSync('./dist')) {
            fs.mkdirSync('./dist', { recursive: true });
            console.log('Γ£à Created dist directory');
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
                console.log(`Γ£à Early copy: ${path.basename(src)} -> dist`);
              } else {
                console.error(`Γ¥î CRITICAL ERROR: ${src} not found!`);
              }
            } catch (err) {
              console.error(`Γ¥î Error copying ${src}:`, err.message);
            }
          }
        },
        // Also use closeBundle to ensure files are copied at the end of build
        closeBundle() {
          // Debug logs for closeBundle
          console.log('≡ƒöì Final check for public/manifest.json at:', path.resolve('./public/manifest.json'));
          console.log('≡ƒöì Does public/manifest.json exist?', fs.existsSync('./public/manifest.json'));

          if (fs.existsSync('./public/manifest.json')) {
            console.log('≡ƒôü Manifest file stats:', fs.statSync('./public/manifest.json'));
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
                console.log(`Γ£à Copied ${path.basename(src)} to dist folder`);
              } else {
                const message = `Could not find ${src}`;
                if (critical) {
                  console.error(`Γ¥î CRITICAL: ${message} - Extension will not work!`);
                  criticalError = true;
                } else {
                  console.warn(`ΓÜá∩╕Å ${message}`);
                }
              }
            } catch (err) {
              console.error(`Error copying ${src}:`, err.message);
              if (critical) criticalError = true;
            }
          }

          // Verify manifest.json was properly copied to dist
          if (fs.existsSync('./dist/manifest.json')) {
            console.log('Γ£à Verified manifest.json exists in dist folder');
            try {
              const manifestSize = fs.statSync('./dist/manifest.json').size;
              console.log(`≡ƒôè manifest.json in dist is ${manifestSize} bytes`);

              // Validate the copied manifest
              try {
                const manifestContent = fs.readFileSync('./dist/manifest.json', 'utf8');
                JSON.parse(manifestContent);
                console.log('Γ£à manifest.json in dist is valid JSON');
              } catch (jsonError) {
                console.error('Γ¥î manifest.json in dist is NOT valid JSON:', jsonError.message);
              }
            } catch (err) {
              console.error('Γ¥î Error verifying manifest.json in dist:', err.message);
            }
          } else {
            console.error('Γ¥î CRITICAL: manifest.json NOT found in dist folder!');
            criticalError = true;
          }

          if (criticalError) {
            console.error('Γ¥î CRITICAL ERRORS detected! Extension may not load properly.');
          } else {
            console.log('Γ£à All critical extension files copied successfully.');
          }
        }
      }
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@lovable': path.resolve(__dirname, 'lovable.dev/src'),
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
      assetsInlineLimit: 0,
      copyPublicDir: true,
      minify: false, // Disable minification to preserve identifiers
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'index.html')
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: {
            vendor: ['react', 'react-dom'],
            arbitrage: [
              './src/components/arbitrage/ArbitragePrompt',
              './src/components/visualScanner/VisualScanner'
            ],
          },
          // Log chunk contents for debugging
          chunkFileNames: (chunkInfo) => {
            console.log('Chunk:', chunkInfo.name, 'Modules:', chunkInfo.moduleIds);
            return 'assets/[name]-[hash].js';
          }
        },
        external: ['webextension-polyfill']
      },
    }
  };
});