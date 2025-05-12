
# DealHavenAI Extension Testing Guide

This guide outlines the steps to test the DealHavenAI Chrome extension in developer mode.

## Prerequisites

1. **Chrome Browser**: Latest version of Google Chrome
2. **eBay API Credentials**: Already integrated in the code
3. **API Deployment**: The backend API is deployed at `https://ebay-buyer-tool-zp52.vercel.app/api`
4. **Extension Icons**: Generated and placed in the `/public` directory

## Build & Installation Steps

### 1. Build the Extension

```bash
# Install dependencies
npm install

# Build the extension
npm run build
```

The built extension will be in the `dist` directory.

### 2. Load in Chrome Developer Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `dist` directory
4. The extension should now be installed and visible in your toolbar

## Testing Flows

### 1. Basic Extension Functionality

- [ ] Extension icon appears in the toolbar
- [ ] Clicking the icon opens the popup
- [ ] All tabs (Extension, API Status, API Stats) are accessible
- [ ] Premium toggle works correctly

### 2. API Health Check

- [ ] Go to the "API Status" tab
- [ ] Click "Check Now" to verify API connectivity
- [ ] Verify eBay API credentials are working
- [ ] Check that all services show as "Operational"

### 3. Live eBay Listing Testing

- [ ] Navigate to an eBay product listing (URL containing `ebay.com/itm/`)
- [ ] The extension icon should become active (color change)
- [ ] Open the extension popup
- [ ] Verify that listing details are correctly extracted:
  - [ ] Title
  - [ ] Price
  - [ ] Seller
  - [ ] Condition
  - [ ] Shipping information
  
- [ ] Click "Check Price" to perform a price analysis
- [ ] Verify the price comparison is displayed
- [ ] Check if the deal score is calculated correctly

### 4. API Performance Testing

- [ ] Make multiple price checks on different items
- [ ] Go to the "API Stats" tab to monitor:
  - [ ] Cache hit rate
  - [ ] Request pooling stats
  - [ ] Rate limiting effectiveness

### 5. Error Handling

- [ ] Test with incorrect eBay URLs
- [ ] Test with eBay URLs that have unusual formats
- [ ] Check error messages are displayed properly
- [ ] Verify the extension recovers gracefully from errors

## Troubleshooting

### Common Issues and Solutions

1. **Extension Not Loading**:
   - Check the Chrome console for errors
   - Verify all files are properly built and included in the dist directory

2. **API Connection Failures**:
   - Verify the API server is running
   - Check that your network allows connections to the API endpoints
   - Verify the API credentials are properly set on the server

3. **Content Script Not Working**:
   - Check that content.js is properly included in the build
   - Verify the manifest.json has correct content script configuration
   - Look for errors in the console when on eBay listing pages

## Debugging Tips

- Use `chrome.storage.local.get(null, console.log)` in the Chrome console to view all stored extension data
- Check the background page console for background.js errors
- Monitor network requests to verify API calls
- Use the API Stats dashboard to identify performance bottlenecks

## Expected Testing Results

When properly configured, the extension should:
1. Correctly identify and extract data from eBay listings
2. Provide accurate price comparisons
3. Display meaningful deal scores
4. Cache repeated requests for better performance
5. Handle errors gracefully and provide helpful error messages
