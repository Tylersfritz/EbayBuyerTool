// src/components/priceCheck/types/priceCheckTypes.ts

export interface DataQuality {
  confidence: 'high' | 'medium' | 'low';
  sources: string[];
  warning?: string | null;
  itemSpecifics?: {
    make?: string | null;
    model?: string | null;
    category?: string | null;
    [key: string]: any;
  };
}

export interface PriceCheckResponse {
  averagePrice: number;
  marketRate?: number; // Added to fix type errors
  itemCount: number;
  priceRange: { min: number; max: number };
  priceHistory?: { date: string; price: number }[];
  sampleSize?: number;
  dateRange?: string;
  source?: string;
  timestamp: string;
  conditionAnalysis?: { condition: string; averagePrice: number; itemCount: number }[];
  error?: string;
  warning?: string;
  dataQuality?: DataQuality;
}

export interface ListingInfo {
  title: string;
  currentPrice: number;
  seller?: string;
  condition?: string;
  shipping?: number | string;
  isAuction?: boolean;
  bids?: number;
  timeRemaining?: string;
  buyItNowPrice?: number | string;
  itemId?: string;
  itemSpecifics?: Record<string, string>;
  platform?: 'ebay' | 'mercari' | string; // Add platform property
  quantityAvailable?: number;
  returnPolicy?: string;
  sellerFeedbackScore?: number;
  sellerPositivePercentage?: number;
  bidderCount?: number;
  firstBidTime?: string;
  watchers?: number;
  originalPrice?: number;
  discountPercentage?: number;
  itemUrl?: string; // Add itemUrl property for the SnipeForm component
  // Legacy fields - these will be removed in a future version but keep for compatibility
  price?: number;
  listingType?: {
    isAuction?: boolean;
    bidsCount?: number;
    endTime?: string;
    hasBuyItNow?: boolean;
  };
}

export interface PriceCheckState {
  loading: boolean;
  priceData: PriceCheckResponse | null;
  listingInfo: ListingInfo;
  loadingListingInfo: boolean;
  retryCount: number;
  testMode: boolean;
  error: string | null;
}
