
// DealHavenAI - Background Script
// Cross-browser compatible version

// Import the polyfill
try {
  importScripts('browser-polyfill.min.js');
} catch (e) {
  console.error('Failed to import browser-polyfill:', e);
}

// Use browser API with fallback to chrome for compatibility
const api = typeof browser !== 'undefined' ? browser : chrome;

// Handle extension installation
api.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("DealHavenAI Extension installed!");
    
    // Initialize storage with default values
    api.storage.local.set({
      dealHavenAIFirstUse: 'pending',
      dealHavenAIPremium: 'inactive',
      priceCheckHistory: [],
      affiliateClicks: [],
      affiliateIds: {
        amazon: 'dealhaven-20',
        ebay: 'dealhaven',
        walmart: 'dealhaven',
        mercari: 'dealhaven'
      },
      apiSettings: {
        baseUrl: 'https://ebay-buyer-tool-zp52.vercel.app/api' // Updated to production Vercel deployment URL
      }
    });
    
    // Open onboarding page
    api.tabs.create({
      url: "index.html"
    });
  } else if (details.reason === "update") {
    console.log("DealHavenAI Extension updated!");
  }
});

// Listen for messages from content scripts
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Active icon for eBay listings
  if (message.action === "onEbayListing") {
    // Enable the extension icon when on an eBay listing page
    try {
      api.action.setIcon({
        path: {
          "16": "icon-16-active.png",
          "48": "icon-48-active.png",
          "128": "icon-128-active.png"
        },
        tabId: sender.tab.id
      });
    } catch (e) {
      // Fallback for browsers that don't support action API
      if (api.browserAction) {
        api.browserAction.setIcon({
          path: {
            "16": "icon-16-active.png",
            "48": "icon-48-active.png",
            "128": "icon-128-active.png"
          },
          tabId: sender.tab.id
        });
      }
    }
  }
  
  // Active icon for Mercari listings
  if (message.action === "onMercariListing") {
    // Enable the extension icon when on a Mercari listing page
    try {
      api.action.setIcon({
        path: {
          "16": "icon-16-active.png",
          "48": "icon-48-active.png",
          "128": "icon-128-active.png"
        },
        tabId: sender.tab.id
      });
    } catch (e) {
      // Fallback for browsers that don't support action API
      if (api.browserAction) {
        api.browserAction.setIcon({
          path: {
            "16": "icon-16-active.png",
            "48": "icon-48-active.png",
            "128": "icon-128-active.png"
          },
          tabId: sender.tab.id
        });
      }
    }
  }
  
  // Track auction snipes
  if (message.action === "trackSnipe") {
    api.storage.local.get(['auctionSnipes'], (result) => {
      const snipes = result.auctionSnipes || [];
      
      // Add analytics data to the snipe event
      const snipeData = {
        ...message.data,
        timestamp: new Date().toISOString()
      };
      
      snipes.push(snipeData);
      
      // Keep only the most recent 50 snipes
      if (snipes.length > 50) {
        snipes.shift();
      }
      
      api.storage.local.set({ auctionSnipes: snipes });
      console.log('Auction snipe tracked:', snipeData);
    });
    
    // Always send a response to prevent connection errors
    sendResponse({ success: true });
    return true;
  }
  
  // Track affiliate link clicks
  if (message.action === "trackAffiliateClick") {
    api.storage.local.get(['affiliateClicks'], (result) => {
      const clicks = result.affiliateClicks || [];
      
      // Add analytics data to the click event
      const clickData = {
        ...message.data,
        timestamp: new Date().toISOString(),
        url: sender?.tab?.url || 'unknown',
        referrer: sender?.tab?.title || 'unknown'
      };
      
      clicks.push(clickData);
      
      // Keep only the most recent 50 clicks
      if (clicks.length > 50) {
        clicks.shift();
      }
      
      api.storage.local.set({ affiliateClicks: clicks });
      console.log('Affiliate click tracked:', clickData);
    });
    
    // Always send a response to prevent connection errors
    sendResponse({ success: true });
    return true;
  }
  
  // Track price check history
  if (message.action === "savePriceCheck") {
    api.storage.local.get(['priceCheckHistory'], (result) => {
      const history = result.priceCheckHistory || [];
      
      // Add new price check to history
      const priceCheckData = {
        ...message.data,
        timestamp: new Date().toISOString()
      };
      
      history.push(priceCheckData);
      
      // Keep only the most recent 50 checks
      if (history.length > 50) {
        history.shift();
      }
      
      // Save to both priceCheckHistory and the shared data context
      api.storage.local.set({ 
        priceCheckHistory: history,
        sharedPriceData: {
          priceData: priceCheckData.result,
          listingInfo: {
            title: priceCheckData.itemName,
            currentPrice: priceCheckData.searchParameters?.currentPrice || 0,
            ...priceCheckData.searchParameters
          },
          lastChecked: priceCheckData.timestamp
        }
      });
      
      console.log('Price check history and shared data updated');
    });
    
    // Always send a response to prevent connection errors
    sendResponse({ success: true });
    return true;
  }
  
  // Get shared price data for tabs
  if (message.action === "getSharedPriceData") {
    api.storage.local.get(['sharedPriceData'], (result) => {
      sendResponse({ data: result.sharedPriceData || null });
    });
    return true;
  }
  
  // For test mode - simulate content script responses when in test mode
  if (message.action === "testModeGetListingInfo") {
    const testData = message.testData;
    
    // Simulate response delay
    setTimeout(() => {
      sendResponse({
        success: true,
        data: testData
      });
    }, 500);
    
    // Return true to indicate async response
    return true;
  }
});

// Reset icon when navigating away from a marketplace listing
api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isMarketplaceListing = 
      tab.url.includes('ebay.com/itm/') || 
      tab.url.includes('mercari.com/item/');
    
    if (!isMarketplaceListing) {
      try {
        // For Chrome and Edge
        api.action.setIcon({
          path: {
            "16": "icon-16.png",
            "48": "icon-48.png",
            "128": "icon-128.png"
          },
          tabId: tabId
        });
      } catch (e) {
        // Fallback for Firefox
        if (api.browserAction) {
          api.browserAction.setIcon({
            path: {
              "16": "icon-16.png",
              "48": "icon-48.png",
              "128": "icon-128.png"
            },
            tabId: tabId
          });
        }
      }
    }
  }
});
