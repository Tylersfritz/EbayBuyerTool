
# Building the DealHaven Extension

This document explains how to build the extension without modifying package.json.

## Prerequisites

- Node.js 18 or later
- NPM 7 or later

## Building the Extension

To build the extension, run:

```bash
node unified-build.js
```

This script will:

1. Run the Vite build process
2. Run the extension build process to copy necessary files to the dist directory

## Troubleshooting

If you encounter any issues:

1. Clear the dist directory: `rm -rf dist`
2. Clear npm cache: `npm cache clean --force`
3. Reinstall dependencies: `npm ci`
4. Try the build again: `node unified-build.js`

## Loading the Extension

To load the extension in Chrome:

1. Go to chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` directory

## Packaging the Extension

To package the extension for distribution:

1. Build the extension: `node unified-build.js`
2. Zip the dist directory: `zip -r extension.zip dist`

The extension.zip file can then be uploaded to the Chrome Web Store.
