
export interface MarketplaceAdapter {
  name: string;
  icon: string;
  detectListing: (url: string) => boolean;
  extractListingData: (data: any) => MarketplaceListingData;
  formatBidUrl: (itemId: string) => string;
  searchUrl?: (query: string) => string;
  supportedArbitrageTargets?: string[];
}

export interface MarketplaceListingData {
  itemId: string;
  title: string;
  currentPrice: number;
  auctionEndTime: Date | null;
  seller: string;
  itemUrl: string;
  marketplace: string;
  isAuction: boolean;
}

export interface SnipeRequest {
  itemId: string;
  itemUrl: string;
  itemTitle: string;
  currentPrice: number;
  maxBidAmount: number;
  snipeTime: number; // seconds before end of auction
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

export interface ArbitrageOpportunity {
  id?: string;
  userId?: string;
  sourceMarketplace: string;
  sourceItemId: string;
  sourceItemUrl: string;
  sourceItemTitle: string;
  sourcePrice: number;
  targetMarketplace: string;
  targetPrice: number;
  priceDifference: number;
  profitMargin: number;
  status?: 'active' | 'sold' | 'expired' | 'hidden';
  createdAt?: Date;
  updatedAt?: Date;
  sourceListingData?: any; // Changed from Record<string, any> to any to handle Json type
  targetListingData?: any; // Changed from Record<string, any> to any to handle Json type
}

export interface ArbitrageSearchParams {
  sourceMarketplace: string;
  targetMarketplace: string;
  query: string;
  minProfitMargin?: number;
  maxPrice?: number;
  includeUsed?: boolean;
  includeFees?: boolean;
}
