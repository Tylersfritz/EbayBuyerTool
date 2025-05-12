
import { MarketplaceAdapter, MarketplaceListingData } from './types';

export const ebayAdapter: MarketplaceAdapter = {
  name: 'eBay',
  icon: 'ebay-icon', // CSS class name

  detectListing: (url: string): boolean => {
    return url.includes('ebay.com/itm/');
  },

  extractListingData: (data: any): MarketplaceListingData => {
    // Extract and normalize eBay listing data
    const endTimeStr = data.listingType?.endTime || '';
    let auctionEndTime: Date | null = null;

    if (endTimeStr && data.listingType?.isAuction) {
      try {
        // Try to parse the end time
        auctionEndTime = new Date(endTimeStr);
      } catch (e) {
        console.error('Error parsing eBay auction end time:', e);
      }
    }

    return {
      itemId: data.itemId || '',
      title: data.title || 'Unnamed eBay Item',
      currentPrice: data.price || 0,
      auctionEndTime,
      seller: data.seller || 'Unknown Seller',
      itemUrl: data.itemUrl || window.location.href,
      marketplace: 'ebay',
      isAuction: !!data.listingType?.isAuction
    };
  },

  formatBidUrl: (itemId: string): string => {
    return `https://offer.ebay.com/ws/eBayISAPI.dll?MakeBid&item=${itemId}`;
  },
  
  searchUrl: (query: string): string => {
    const encodedQuery = encodeURIComponent(query);
    return `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}&_sop=15`; // Sorted by price + shipping: lowest first
  },
  
  supportedArbitrageTargets: ['mercari']
};
