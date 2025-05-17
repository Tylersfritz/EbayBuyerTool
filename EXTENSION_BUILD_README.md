
# DealHavenAI Chrome Extension Build Guide

This guide will help you build and troubleshoot the DealHavenAI Chrome extension.

## Quick Build Steps

1. Fix any extension file issues:
   ```
   node public/fix-extension-files.js
   ```

2. Safely rebuild the extension:
   ```
   node public/safe-rebuild-extension.js
   ```

3. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `dist` folder

## Common Issues & Solutions

### Working Directory Issues

Make sure you're running commands from the project root directory, not from inside the public folder or any other subdirectory.

### Missing Files

If you see warnings about missing files, the `fix-extension-files.js` script will:
- Create `icon-16-active.png` from `icon-16.png` if missing
- Check for other required files and report any issues

### Merge Conflicts

The `safe-rebuild-extension.js` script checks for merge conflicts in `index.html` before building.
If conflicts are found, you'll need to manually resolve them by removing the conflict markers:
```
<<<<<<< HEAD
// Your local changes
=======
// Changes from another branch
>>>>>>>
```

### Build Failures

If builds are failing, try these troubleshooting steps:
1. Verify that all required files exist in the `public` directory
2. Check that `manifest.json` is valid JSON
3. Make sure `index.html` doesn't have merge conflicts
4. If specific files are missing from the `dist` directory after building, you may need to manually copy them from the `public` directory

### Windows Path Issues

On Windows, your path may include backslashes that can cause issues. Use forward slashes in paths when possible, or escape backslashes properly.

### OneDrive Issues

If your project is stored in OneDrive, you might encounter issues with file locking or path resolution. Consider moving the project to a local folder outside of OneDrive for development.

## Manual Build Steps (if automated scripts fail)

If the automated scripts aren't working, you can try these manual steps:

1. Clean the `dist` directory:
   ```
   rm -rf dist   # Linux/Mac
   rmdir /s /q dist   # Windows
   ```

2. Create a fresh `dist` directory:
   ```
   mkdir dist
   ```

3. Copy required files from `public` to `dist`:
   ```
   cp public/manifest.json dist/
   cp public/icon-*.png dist/
   cp public/browser-polyfill.min.js dist/
   cp public/content.js dist/
   cp public/background.js dist/
   cp public/mercari-content.js dist/
   ```

4. Run Vite build:
   ```
   npm run build
   ```

5. Verify that `manifest.json` exists in the `dist` folder:
   ```
   cat dist/manifest.json   # Linux/Mac
   type dist\manifest.json   # Windows
   ```

## Extension Requirements

The following files are required for the extension to work:
- `manifest.json` - Defines extension metadata and permissions
- `browser-polyfill.min.js` - Browser compatibility layer
- `content.js` and `background.js` - Core extension scripts
- Icon files (`icon-16.png`, `icon-48.png`, `icon-128.png`)
- `index.html` - Main extension popup HTML

## Final Checklist

Before loading the extension in Chrome, verify:
- `dist/manifest.json` exists and is valid
- All icon files are present in `dist`
- All JavaScript files referenced in manifest.json are in `dist`
- `dist/index.html` exists and references the correct assets
