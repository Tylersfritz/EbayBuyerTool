
import { isExtensionEnvironment } from '@/api/apiConfig';
import { ListingInfo } from '../types/priceCheckTypes';

// Get price difference percentage
export const getPriceDifferencePercentage = (averagePrice: number, currentPrice: number): number => {
  if (averagePrice <= 0 || currentPrice <= 0) return 0;
  return ((currentPrice - averagePrice) / averagePrice) * 100;
};

// Fetch listing info from the current tab (Chrome extension functionality)
export const fetchListingInfoFromTab = (
  setListingInfo: (info: ListingInfo) => void,
  setLoadingListingInfo: (loading: boolean) => void
): void => {
  // Only attempt to fetch if we're in the extension environment
  if (!isExtensionEnvironment()) {
    console.log("Chrome API not available, using default data");
    return;
  }
  
  setLoadingListingInfo(true);
  
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        console.log("No active tab found, using default data");
        setLoadingListingInfo(false);
        return;
      }
      
      try {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "getListingInfo" },
          (response) => {
            // Handle possible error with chrome.runtime.lastError
            const chromeError = chrome.runtime?.lastError;
            if (chromeError) {
              console.log("Error getting listing info:", chromeError.message || "Unknown error");
              setLoadingListingInfo(false);
              return;
            }
            
            if (response && response.title) {
              setListingInfo({
                title: response.title,
                currentPrice: response.price || 0,
                seller: response.seller,
                condition: response.condition,
                shipping: response.shipping,
                itemSpecifics: response.itemSpecifics || {}
              });
              console.log("Successfully retrieved listing info:", response);
            } else {
              console.log("No valid response from content script, using default data");
            }
            
            setLoadingListingInfo(false);
          }
        );
      } catch (err) {
        console.error("Error sending tab message:", err);
        setLoadingListingInfo(false);
      }
    });
  } catch (err) {
    console.error("Chrome API error:", err);
    setLoadingListingInfo(false);
  }
};
