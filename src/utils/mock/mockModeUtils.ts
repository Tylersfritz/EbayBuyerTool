
/**
 * Utility functions for mock data mode
 */
import { saveToStorage, getFromStorage } from "../storage/storageUtils";
import { 
  mockListingInfo, 
  mockAuctionListingInfo,
  mockAuctionEndingSoonInfo,
  mockDiscountFixedPriceInfo,
  getMockDataForMode
} from "@/components/priceCheck/utils/mockData";

// Toggle between auction and fixed-price mock data types
export function toggleMockListingType(): boolean {
  try {
    // Get current preference from storage
    const useAuctionMock = localStorage.getItem('useAuctionMockData') === 'true';
    
    // Toggle the preference
    const newValue = !useAuctionMock;
    localStorage.setItem('useAuctionMockData', String(newValue));
    
    // Log the mode change for debugging
    console.log(`Toggled mock listing type to: ${newValue ? 'Auction' : 'Fixed Price'}`);
    
    return newValue;
  } catch (error) {
    console.error('Error toggling mock listing type:', error);
    return false;
  }
}

// Check if we should use auction mock data
export function shouldUseAuctionMockData(): boolean {
  try {
    return localStorage.getItem('useAuctionMockData') === 'true';
  } catch (error) {
    console.error('Error checking mock data type:', error);
    return false;
  }
}

// Get the appropriate mock listing data based on the current mode
export function getMockListingData() {
  try {
    const useAuctionMock = shouldUseAuctionMockData();
    
    // For auction mode, randomly select between regular auction and ending soon auction
    if (useAuctionMock) {
      // 30% chance of getting an "ending soon" auction
      const useEndingSoon = Math.random() < 0.3;
      return useEndingSoon ? mockAuctionEndingSoonInfo : mockAuctionListingInfo;
    }
    
    // For fixed price mode, randomly select between regular fixed price and discount
    const useDiscount = Math.random() < 0.3;
    return useDiscount ? mockDiscountFixedPriceInfo : mockListingInfo;
  } catch (error) {
    console.error('Error getting mock listing data:', error);
    // Fall back to standard fixed price mock data
    return mockListingInfo;
  }
}
