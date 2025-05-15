
# Building the DealHaven Extension

This document provides detailed instructions for building the DealHaven Chrome extension.

## Quick Build Instructions

### One-Step Build Process (Recommended)

Simply run the full build script:
```
node public/run-build-extension.js
```

This script will:
1. Prepare all required files using fix-manifest.js
2. Build the React application using Vite
3. Copy all extension files to the dist directory
4. Validate the build to ensure all required files are present

The built extension will be in the `dist` directory.

### Manual Build Process (Step by Step)

If you prefer to run each step individually:

1. First, ensure all required files exist:
   ```
   node public/fix-manifest.js
   ```

2. Then build using Vite:
   ```
   npx vite build
   ```

3. Copy all extension files to dist:
   ```
   node public/build-extension.js
   ```

4. Validate the build:
   ```
   node public/extension-validation.js
   ```

## Loading the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right corner)
3. Click "Load unpacked" and select the `dist` directory

## Troubleshooting

If the extension doesn't load properly:

1. Check for errors in the Chrome Extensions page
2. Run the validation script to see if any files are missing:
   ```
   node public/extension-validation.js
   ```

3. Common issues:
   - Missing icon files
   - Invalid manifest.json
   - Missing content scripts or background scripts
   - Path issues with resources in the manifest

4. For file path issues:
   - Make sure there's no `<base href="/">` tag in index.html
   - Ensure all paths in manifest.json are relative to the extension root
   - Check that all referenced files actually exist in the dist folder

## Icon Generation

If you need to generate proper extension icons:

1. Use the Extension Icon Generator in the deployment dashboard
2. Or manually create icon files in the following sizes:
   - 16x16: icon-16.png
   - 48x48: icon-48.png
   - 128x128: icon-128.png

## Build Verification

After building, verify that these files are present in the `dist` directory:
- `manifest.json`
- `index.html`
- Icon files: `icon-16.png`, `icon-48.png`, `icon-128.png`
- Extension scripts: `content.js`, `background.js`, `mercari-content.js`
- Browser polyfill: `browser-polyfill.min.js`

You can run the validation script to check for all required files:
```
node public/extension-validation.js
```

Happy building!
