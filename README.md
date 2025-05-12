
# DealHavenAI Chrome Extension

Smart tools for buyers with price checks, negotiation assistance, and more. This extension helps you make smarter purchasing decisions on eBay and other marketplaces.

## Features

- **Price Check**: Compare current listing prices with market averages
- **Negotiation Assistant**: Get tips on making offers based on real market data
- **Premium Features**: Advanced analytics and insights
- **API Statistics Dashboard**: Monitor cache, request pooling, and rate limiting

## Development Setup

### Prerequisites

- Node.js 18 or higher
- Chrome browser

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   cd api
   npm install
   cd ..
   npm install
   ```

3. Set up eBay API credentials:
   - Create a `.env` file in the `/api` directory
   - Add your eBay credentials:
     ```
     EBAY_CLIENT_ID=your_client_id
     EBAY_CLIENT_SECRET=your_client_secret
     ```

### Running the Development Server

To run the extension in development mode:

```
npm run dev
```

### Building the Extension

To build the extension for Chrome:

```
npm run build
```

The built extension will be in the `dist` directory.

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `dist` directory
4. The extension should now be installed and visible in your toolbar

## Testing with Live eBay Listings

1. Navigate to any eBay product listing (URL containing `ebay.com/itm/`)
2. The extension icon should become active
3. Click the extension icon to open the popup
4. You should see the listing details automatically extracted
5. Click "Check Price" to perform a price analysis
6. Monitor the "API Stats" tab to see how the caching, pooling, and rate limiting are working

### Debugging

If you encounter any issues:

1. Check the browser console for content script errors
2. Verify the API health status in the "API Status" tab
3. Monitor the API stats in the "API Stats" tab
4. Ensure your eBay API credentials are correctly set up

## Testing Checklist

- [ ] Extension loads correctly in Chrome
- [ ] Extension icon becomes active on eBay listing pages
- [ ] Listing details are correctly extracted
- [ ] Price check returns valid data
- [ ] Cache system works (check API Stats)
- [ ] Request pooling functions correctly
- [ ] Rate limiting prevents excessive API calls
- [ ] Premium features are accessible to premium users

