
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

## Extension Requirements

The following files are required for the extension to work:
- `manifest.json` - Defines extension metadata and permissions
- `browser-polyfill.min.js` - Browser compatibility layer
- `content.js` and `background.js` - Core extension scripts
- Icon files (`icon-16.png`, `icon-48.png`, `icon-128.png`)
- `index.html` - Main extension popup HTML

## Building From Scratch

If you need to completely rebuild the extension from scratch:
1. Run `node public/fix-extension-files.js` to ensure all files exist
2. Delete the `dist` directory if it exists
3. Run `npm run build` to build the extension
4. Verify all required files are in the `dist` directory

