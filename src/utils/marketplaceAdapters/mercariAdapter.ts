
import { MarketplaceAdapter, MarketplaceListingData } from './types';

export const mercariAdapter: MarketplaceAdapter = {
  name: 'Mercari',
  icon: 'mercari-icon', // CSS class name

  detectListing: (url: string): boolean => {
    return url.includes('mercari.com/item/');
  },

  extractListingData: (data: any): MarketplaceListingData => {
    // Extract and normalize Mercari listing data
    const endTimeStr = data.endTime || data.deadlineTime || '';
    let auctionEndTime: Date | null = null;

    if (endTimeStr && data.isAuction) {
      try {
        auctionEndTime = new Date(endTimeStr);
      } catch (e) {
        console.error('Error parsing Mercari auction end time:', e);
      }
    }

    return {
      itemId: data.itemId || '',
      title: data.title || 'Unnamed Mercari Item',
      currentPrice: data.price || 0,
      auctionEndTime,
      seller: data.seller || 'Unknown Seller',
      itemUrl: data.itemUrl || window.location.href,
      marketplace: 'mercari',
      isAuction: !!data.isAuction
    };
  },

  formatBidUrl: (itemId: string): string => {
    return `https://www.mercari.com/offer/${itemId}/`;
  },
  
  searchUrl: (query: string): string => {
    const encodedQuery = encodeURIComponent(query);
    return `https://www.mercari.com/search/?keyword=${encodedQuery}&sortBy=price_asc`; // Sorted by price: lowest first
  },
  
  supportedArbitrageTargets: ['ebay']
};
