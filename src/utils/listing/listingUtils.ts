
/**
 * Utility functions for getting listing information
 */
import { browserAPI } from "../browserUtils";
import { getMockListingData } from "../mock/mockModeUtils";

// Get current listing information
export async function getCurrentListing(): Promise<any> {
  if (browserAPI.isExtensionEnvironment()) {
    try {
      const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      
      if (tabs[0]?.id) {
        return browserAPI.tabs.sendMessage<any>(
          tabs[0].id,
          { action: "getListingInfo" }
        );
      }
    } catch (e) {
      console.error("Error getting current listing:", e);
    }
    return null;
  } else {
    // For development without browser API
    // Return mock data based on the current mode
    try {
      const mockData = getMockListingData();
      console.log(`Development mode: Using ${mockData.isAuction ? 'auction' : 'fixed-price'} mock data`, mockData);
      
      return Promise.resolve(mockData);
    } catch (error) {
      console.error("Error loading mock data:", error);
      return Promise.resolve(null); // Return null instead of fallback to trigger proper error handling
    }
  }
}
