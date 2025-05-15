
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
  price?: number; // Added for backward compatibility
  buyItNowPrice?: number;
  seller?: string;
  condition?: string;
  shipping?: string;
  timeRemaining?: string;
  bids?: number;
  isAuction?: boolean;
  itemSpecifics?: Record<string, string>;
  itemId?: string;
  itemUrl?: string; // Added to fix SnipeForm error
  quantityAvailable?: number;
  returnPolicy?: string;
  sellerFeedbackScore?: number;
  sellerPositivePercentage?: number;
  bidderCount?: number;
  firstBidTime?: string;
  watchers?: number;
  originalPrice?: number;
  discountPercentage?: number;
  // Added for backward compatibility with older code
  listingType?: {
    isAuction?: boolean;
    bidsCount?: number;
    endTime?: string;
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
