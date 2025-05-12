
export type OfferType = 'lowball' | 'fair' | 'sweetspot';
export type ToneType = 'friendly' | 'firm' | 'curious';

export interface ListingInfo {
  title: string;
  currentPrice: number;
  seller?: string;
  isAuction: boolean;
}

export interface MarketData {
  averagePrice: number;
  itemCount: number;
}

export interface SavedOffer {
  id: string;
  timestamp: string;
  itemTitle: string;
  itemPrice: number;
  marketPrice: number;
  offerType: OfferType;
  tone: ToneType;
  offerPrice: number;
  message: string;
  seller?: string;
  isAuction?: boolean;
  bidPercentToMarket?: number;
}

export interface PremiumOfferGeneratorProps {
  listingInfo: ListingInfo;
  marketData: MarketData | null;
  discountPercentage: number[];
}
