
import { getBrowserAPI, isExtensionEnvironment } from '../browserUtils';
import { ListingInfo } from '@/components/priceCheck/types/priceCheckTypes';
import { toast } from '@/components/ui/sonner';

/**
 * Get information about the current listing from the active tab
 */
export async function getCurrentListing(): Promise<ListingInfo | null> {
  try {
    // Only attempt to get listing info in extension environment
    if (!isExtensionEnvironment()) {
      console.log('Not in extension environment, cannot get listing info');
      return null;
    }
    
    const browser = getBrowserAPI();
    
    // Query for active tab
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      console.error('No active tab found');
      return null;
    }
    
    const activeTab = tabs[0];
    const activeTabId = activeTab.id;
    
    if (!activeTabId) {
      console.error('Active tab has no ID');
      return null;
    }
    
    // Check if the active tab is on eBay or Mercari
    const url = activeTab.url || '';
    if (!url) {
      console.error('Active tab has no URL');
      return null;
    }
    
    console.log('Checking URL:', url);
    
    // Test Content Script accessibility first
    try {
      await testContentScriptAccess(activeTabId);
    } catch (error) {
      console.warn('Content script may not be accessible:', error);
      // Continue anyway, as the specific marketplace script might work
    }
    
    // Determine which content script to use based on the URL
    if (url.includes('ebay.com/itm/') || url.match(/ebay\..+\/itm\//)) {
      console.log('eBay listing URL detected');
      return await getEbayListingInfo(activeTabId);
    } else if (url.includes('mercari.com/item/') || url.match(/mercari\..+\/item\//)) {
      console.log('Mercari listing URL detected');
      return await getMercariListingInfo(activeTabId);
    } else {
      console.log('Active tab is not on a supported marketplace listing page');
      toast.warning('Not on a supported marketplace listing page', {
        description: 'Please navigate to an eBay or Mercari listing to use this feature.'
      });
      return null;
    }
  } catch (error) {
    console.error('Error getting current listing:', error);
    toast.error('Error getting listing information', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Test if the content script is accessible
 */
async function testContentScriptAccess(tabId: number): Promise<boolean> {
  try {
    const browser = getBrowserAPI();
    
    // Send test message to content script
    const response = await browser.tabs.sendMessage(tabId, { action: 'testModeGetListingInfo' });
    
    if (response && response.testMode) {
      console.log('Content script accessible:', response.status);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error testing content script access:', error);
    throw error;
  }
}

/**
 * Get listing information from eBay
 */
async function getEbayListingInfo(tabId: number): Promise<ListingInfo> {
  try {
    const browser = getBrowserAPI();
    
    // Send message to content script
    const response = await browser.tabs.sendMessage(tabId, { action: 'getListingInfo' });
    
    if (!response) {
      throw new Error('No response from content script');
    }
    
    // Check if there was an error in the content script
    if (response.error) {
      console.error('Content script error:', response.error);
      throw new Error(response.error);
    }
    
    const { title, price, seller, condition, shipping, listingType, itemId, itemSpecifics } = response;
    
    console.log('Received listing info from content script:', response);
    
    return {
      title,
      currentPrice: price,
      seller,
      condition,
      shipping,
      isAuction: listingType?.isAuction || false,
      bids: listingType?.bidsCount,
      timeRemaining: listingType?.endTime,
      buyItNowPrice: listingType?.hasBuyItNow ? price : undefined,
      itemId,
      itemSpecifics,
      platform: 'ebay'
    };
  } catch (error) {
    console.error('Error getting eBay listing info:', error);
    toast.error('Error getting eBay listing info', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Get listing information from Mercari
 */
async function getMercariListingInfo(tabId: number): Promise<ListingInfo> {
  try {
    const browser = getBrowserAPI();
    
    // Send message to content script
    const response = await browser.tabs.sendMessage(tabId, { action: 'getListingInfo' });
    
    if (!response) {
      throw new Error('No response from content script');
    }
    
    // Check if there was an error in the content script
    if (response.error) {
      console.error('Content script error:', response.error);
      throw new Error(response.error);
    }
    
    const { title, price, seller, condition, shipping, itemId } = response;
    
    return {
      title,
      currentPrice: price,
      seller,
      condition,
      shipping,
      isAuction: false, // Mercari doesn't have auctions
      itemId,
      platform: 'mercari'
    };
  } catch (error) {
    console.error('Error getting Mercari listing info:', error);
    toast.error('Error getting Mercari listing info', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}
