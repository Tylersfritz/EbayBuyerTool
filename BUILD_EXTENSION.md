
# Building the DealHaven Extension

Since `package.json` is marked as a read-only file in this environment, we've created standalone scripts to build the extension without modifying it.

## Quick Build Instructions

### Option 1: Using Node directly

1. Run the build extension script:
   ```
   node public/run-build-extension.js
   ```

2. The built extension will be in the `dist` directory.

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right corner)
   - Click "Load unpacked" and select the `dist` directory

### Option 2: Using NPX (if you have issues with the first method)

1. First, run the fix-manifest script:
   ```
   node public/fix-manifest.js
   ```

2. Then build using Vite:
   ```
   npx vite build
   ```

3. Ensure all critical files are copied to the dist directory:
   ```
   node public/build-extension.js
   ```

## Troubleshooting

If you encounter any issues:

1. Check that all critical files exist in the `public` directory:
   - `manifest.json`
   - `icon-16.png`, `icon-48.png`, `icon-128.png`
   - `browser-polyfill.min.js`
   - `content.js`, `background.js`, `mercari-content.js`

2. Look for error messages in the build output.

3. If the extension doesn't load in Chrome, check the console in Chrome DevTools for error messages.

4. You can generate missing icons using the Extension Icon Generator in the deployment dashboard.

## Manual Verification

After building, verify that these files are present in the `dist` directory:
- `manifest.json`
- `index.html`
- Icon files: `icon-16.png`, `icon-48.png`, `icon-128.png`
- Extension scripts: `content.js`, `background.js`, `mercari-content.js`
- Browser polyfill: `browser-polyfill.min.js`
