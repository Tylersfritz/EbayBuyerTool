
/**
 * Type definitions for price check components
 */

export interface ListingInfo {
  title: string;
  currentPrice: number;
  buyItNowPrice?: number;
  originalPrice?: number;
  seller?: string;
  condition?: string;
  shipping?: string;
  timeRemaining?: string | null;
  bids?: number;
  bidderCount?: number;
  isAuction?: boolean;
  image?: string;
  itemSpecifics?: Record<string, string>;
  itemId?: string;
  quantityAvailable?: number;
  returnPolicy?: string;
  sellerFeedbackScore?: number;
  sellerPositivePercentage?: number;
  discountPercentage?: number;
  watchers?: number;
  firstBidTime?: string;
}

export interface PriceCheckState {
  loading: boolean;
  priceData: {
    averagePrice: number;
    itemCount: number;
    timestamp: string;
    error?: string;
  } | null;
  listingInfo: ListingInfo;
  loadingListingInfo: boolean;
  retryCount: number;
  testMode: boolean;
  error: string | null;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export interface ConditionItem {
  condition: string;
  averagePrice: number;
  itemCount: number;
}

export interface DealScore {
  score: number;
  text: string;
  color: string;
}

// Listing type options
export type ListingType = 'auction' | 'fixedPrice';

// Auction listing state options
export type AuctionState = 'early' | 'active' | 'ending' | 'endingSoon';

// Fixed price listing state options
export type FixedPriceState = 'default' | 'discount' | 'clearance' | 'overpriced';

// Combined state for more specific displays
export interface ListingState {
  type: ListingType;
  state: AuctionState | FixedPriceState;
}

// Deal assessment result
export interface DealAssessment {
  score: number; // 0-100
  percentDifference: number; // percentage above/below market
  dealText: string; // Text description
  dealColor: string; // Color for UI
  advice: string; // Advice to the user
  severity: 'success' | 'warning' | 'info' | 'error';
}
