
// public/background.js

// Initialize browser API
const api = typeof browser !== 'undefined' ? browser : chrome;

// Listen for messages from content scripts or popup
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'onEbayListing') {
    // Change the icon to active when on eBay listing
    api.action.setIcon({
      path: {
        16: "icon-16-active.png",
        48: "icon-48-active.png",
        128: "icon-128-active.png"
      },
      tabId: sender.tab?.id
    });
    
    sendResponse({ success: true });
  }
  
  return true; // Keep the messaging channel open for async responses
});

// Reset icon when navigating away from eBay listing
api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    // Check if URL is not an eBay listing
    if (!changeInfo.url.includes('ebay.com/itm/')) {
      api.action.setIcon({
        path: {
          16: "icon-16.png",
          48: "icon-48.png",
          128: "icon-128.png"
        },
        tabId: tabId
      });
    }
  }
});

console.log('DealHavenAI background script loaded');
