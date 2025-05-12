
console.log('DealHavenAI Mercari Extension loaded');

// Import browser polyfill if available (will be injected by browser)
try {
  if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
    var browser = chrome;
  }
} catch (e) {
  console.error('Browser API initialization error:', e);
}

// Use either browser or chrome API
const api = typeof browser !== 'undefined' ? browser : chrome;

// Check if we're on a Mercari listing page
if (window.location.href.includes('mercari.com/item/')) {
  // Send message to the extension that we're on a valid page
  if (api && api.runtime) {
    api.runtime.sendMessage({ action: 'onMercariListing' });
  }

  // Listen for messages from the extension popup
  if (api && api.runtime) {
    api.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "getListingInfo") {
        try {
          // Extract listing information
          // This is a placeholder for actual implementation
          const itemId = window.location.pathname.split('/item/')[1].split('/')[0];
          
          // Basic extraction using meta tags (would need to be expanded)
          const title = document.querySelector('meta[property="og:title"]')?.content || '';
          const imageUrl = document.querySelector('meta[property="og:image"]')?.content || '';
          
          // Price extraction - would need proper selectors
          let priceText = '';
          const priceElement = document.querySelector('.item-price');
          if (priceElement) {
            priceText = priceElement.textContent.trim();
            // Remove currency symbol and parse
            const price = parseFloat(priceText.replace(/[^\d.-]/g, ''));
            
            // Sample response
            const responseData = {
              itemId,
              title,
              price,
              seller: 'Unknown', // would need extraction logic
              condition: 'Unknown', // would need extraction logic
              isAuction: false, // Mercari items are typically fixed-price
              itemUrl: window.location.href,
              marketplace: 'mercari'
            };
            
            console.log("Extracted Mercari listing data:", responseData);
            sendResponse(responseData);
          } else {
            // Fallback response
            sendResponse({
              itemId,
              title: document.title,
              price: 0,
              seller: 'Unknown',
              condition: 'Unknown',
              isAuction: false,
              itemUrl: window.location.href,
              marketplace: 'mercari'
            });
          }
        } catch (error) {
          console.error("Error extracting Mercari listing information:", error);
          sendResponse({ 
            error: "Failed to extract complete listing information",
            errorDetails: error.message
          });
        }
        
        return true; // Required for async response
      }
    });
  }
}
