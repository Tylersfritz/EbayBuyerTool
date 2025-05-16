// Marketplace Adapters and Types

// Generic interface for marketplace listing data
export interface MarketplaceListingData {
  marketplace: string;
  itemId: string;
  title: string;
  itemUrl: string;
  imageUrl?: string;
  currentPrice?: number;
  originalPrice?: number;
  discountPercentage?: number;
  seller?: string;
  quantityAvailable?: number;
  isAuction?: boolean;
  auctionEndTime?: Date;
  category?: string;
}

// Abstract class for marketplace adapters
export abstract class MarketplaceAdapter {
  abstract marketplace: string;

  abstract extractListingData(document: Document): MarketplaceListingData;

  static getAdapter(url: string): MarketplaceAdapter | null {
    if (url.includes('ebay.com')) {
      return new EbayAdapter();
    } else if (url.includes('mercari.com')) {
      return new MercariAdapter();
    }
    return null;
  }
}

// Ebay Adapter
class EbayAdapter extends MarketplaceAdapter {
  marketplace = 'eBay';

  extractListingData(document: any): MarketplaceListingData {
    const title = document.title || '';
    const itemId = document.querySelector('[itemprop="productID"]')?.content || '';
    const itemUrl = document.URL || '';
    const currentPriceText = document.querySelector('[itemprop="price"]')?.content || '';
    const currentPrice = parseFloat(currentPriceText);
    const seller = document.querySelector('[itemprop="seller"]')?.textContent || '';
    const isAuction = document.querySelector('#bidBtn_btn') !== null;
    const auctionEndTimeText = document.querySelector('#vi-cdown_timeLeft')?.textContent || '';
    const auctionEndTime = this.parseEbayAuctionEndTime(auctionEndTimeText);

    return {
      marketplace: this.marketplace,
      itemId,
      title,
      itemUrl,
      currentPrice,
      seller,
      isAuction,
      auctionEndTime
    };
  }

  private parseEbayAuctionEndTime(timeText: string): Date | undefined {
    // Example: "4d 12h left"
    const timeRegex = /(\d+)d\s*(\d+)h/;
    const match = timeText.match(timeRegex);

    if (match) {
      const days = parseInt(match[1], 10);
      const hours = parseInt(match[2], 10);

      const now = new Date();
      const endTime = new Date(now.getTime() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000);
      return endTime;
    }

    return undefined;
  }
}

// Mercari Adapter
class MercariAdapter extends MarketplaceAdapter {
  marketplace = 'Mercari';

  extractListingData(document: any): MarketplaceListingData {
    const title = document.title || '';
    const itemId = document.querySelector('meta[name="item_id"]')?.content || '';
    const itemUrl = document.URL || '';
    const currentPriceText = document.querySelector('.item-price')?.textContent || '';
    const currentPrice = parseFloat(currentPriceText.replace(/[^0-9.]/g, '')); // Remove non-numeric chars
    const seller = document.querySelector('.seller-name')?.textContent || '';

    return {
      marketplace: this.marketplace,
      itemId,
      title,
      itemUrl,
      currentPrice,
      seller
    };
  }
}

// Helper function to get the appropriate adapter for a URL
export function getAdapterForUrl(url: string): MarketplaceAdapter | null {
  if (url.includes('ebay.com')) {
    return new EbayAdapter();
  } else if (url.includes('mercari.com')) {
    return new MercariAdapter();
  }
  return null;
}

// Function to get supported marketplaces
export function getSupportedMarketplaces(): string[] {
  return ['eBay', 'Mercari'];
}

// Auction Monitor types that replace the previous Snipe types
export interface AuctionMonitorRequest {
  itemId: string;
  itemUrl: string;
  itemTitle: string;
  currentPrice: number;
  targetPrice: number; // Price the user is willing to bid up to
  notificationTime: number; // Time before auction end to notify user (in seconds)
  auctionEndTime: Date;
  marketplace: string;
  marketplaceMetadata?: Record<string, any>;
}

export interface AuctionMonitorData {
  id: string;
  userId: string;
  itemId: string;
  itemUrl: string;
  itemTitle: string;
  currentPrice: number;
  targetPrice: number;
  notificationTime: number;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  auctionEndTime: Date;
  marketplace: string;
  marketplaceMetadata?: Record<string, any>;
  marketRate?: number;
}

// Keeping the previous SnipeData and SnipeRequest types for backward compatibility
export interface SnipeRequest {
  itemId: string;
  itemUrl: string;
  itemTitle: string;
  currentPrice: number;
  maxBidAmount: number;
  snipeTime: number;
  auctionEndTime: Date;
  marketplace: string;
  marketplaceMetadata?: Record<string, any>;
}

export interface SnipeData {
  id: string;
  userId: string;
  itemId: string;
  itemUrl: string;
  itemTitle: string;
  currentPrice: number;
  maxBidAmount: number;
  snipeTime: number;
  status: 'pending' | 'scheduled' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  auctionEndTime: Date;
  marketplace: string;
  marketplaceMetadata?: Record<string, any>;
}
