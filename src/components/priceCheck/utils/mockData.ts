
/**
 * Mock data for price check components for testing and development
 */

import { PriceCheckResponse } from "@/api/priceApiService";
import { ListingInfo } from "../types/priceCheckTypes";

// Mock price check API response
export const mockPriceCheckData: PriceCheckResponse = {
  averagePrice: 389.99,
  itemCount: 24,
  timestamp: new Date().toISOString()
};

// Mock listing information (fixed price)
export const mockListingInfo: ListingInfo = {
  title: "Apple iPhone 12 128GB - Very Good Condition - Unlocked",
  currentPrice: 349.99,
  seller: "phone_deals_store",
  condition: "Used - Very Good",
  shipping: "Free Shipping",
  timeRemaining: null, // Fixed price listings don't have a time ending
  bids: 0,
  isAuction: false,
  itemSpecifics: {
    "Brand": "Apple",
    "Model": "iPhone 12",
    "Storage": "128GB",
    "Color": "Blue",
    "Condition": "Used - Very Good",
    "Network": "Unlocked"
  },
  itemId: "123456789",
  quantityAvailable: 3, // Add quantity for fixed price listings
  returnPolicy: "30-day returns accepted",
  sellerFeedbackScore: 1498,
  sellerPositivePercentage: 99.7
};

// Mock listing information (auction)
export const mockAuctionListingInfo: ListingInfo = {
  title: "Apple iPhone 12 128GB - Very Good Condition - Unlocked (AUCTION)",
  currentPrice: 289.99, // Below market value (389.99) - typical for active auctions
  buyItNowPrice: 419.99, // Above market value
  seller: "tech_auction_deals",
  condition: "Used - Very Good",
  shipping: "Free Shipping",
  timeRemaining: "1d 14h 23m", // Auction-specific
  bids: 8, // Active bidding
  isAuction: true, // This is the key field that changes the UI behavior
  itemSpecifics: {
    "Brand": "Apple",
    "Model": "iPhone 12",
    "Storage": "128GB",
    "Color": "Blue",
    "Condition": "Used - Very Good",
    "Network": "Unlocked"
  },
  itemId: "987654321",
  bidderCount: 5, // Add separate bidder count
  firstBidTime: "2023-05-01T12:00:00Z", // When bidding started
  sellerFeedbackScore: 543,
  sellerPositivePercentage: 98.2,
  watchers: 24 // Auction-specific watchers count
};

// Mock auction ending soon
export const mockAuctionEndingSoonInfo: ListingInfo = {
  title: "Apple iPhone 12 128GB - Blue - Unlocked (ENDING SOON)",
  currentPrice: 352.99, // Closer to market as auction nears end
  buyItNowPrice: 429.99,
  seller: "quick_tech_sales",
  condition: "Used - Very Good",
  shipping: "Free Shipping",
  timeRemaining: "1h 15m", // Ending very soon
  bids: 15, // More bids as it's ending soon
  isAuction: true,
  itemSpecifics: {
    "Brand": "Apple",
    "Model": "iPhone 12",
    "Storage": "128GB",
    "Color": "Blue",
    "Condition": "Used - Very Good",
    "Network": "Unlocked"
  },
  itemId: "987654322",
  bidderCount: 8,
  firstBidTime: "2023-05-04T10:00:00Z",
  sellerFeedbackScore: 218,
  sellerPositivePercentage: 99.1,
  watchers: 42 // Higher watchers for ending auctions
};

// Mock fixed price with discount
export const mockDiscountFixedPriceInfo: ListingInfo = {
  title: "Apple iPhone 12 128GB - SALE - Refurbished - Unlocked",
  currentPrice: 329.99, // Discounted price
  originalPrice: 399.99, // Original price before discount
  seller: "certified_tech_deals",
  condition: "Refurbished",
  shipping: "Free Shipping",
  timeRemaining: null,
  bids: 0,
  isAuction: false,
  itemSpecifics: {
    "Brand": "Apple",
    "Model": "iPhone 12",
    "Storage": "128GB",
    "Color": "Black",
    "Condition": "Refurbished",
    "Network": "Unlocked",
    "Warranty": "90 Day Seller Warranty"
  },
  itemId: "123456790",
  quantityAvailable: 7,
  returnPolicy: "14-day returns accepted",
  sellerFeedbackScore: 4328,
  sellerPositivePercentage: 99.8,
  discountPercentage: 17.5 // Show discount percentage
};

// Mock price history data points
export const mockPriceHistoryData = [
  { date: "2023-04-01", price: 429.99 },
  { date: "2023-04-05", price: 424.99 },
  { date: "2023-04-10", price: 419.99 },
  { date: "2023-04-15", price: 409.99 },
  { date: "2023-04-20", price: 399.99 },
  { date: "2023-04-25", price: 394.99 },
  { date: "2023-04-30", price: 389.99 }
];

// Mock auction price history (typically more volatility)
export const mockAuctionPriceHistoryData = [
  { date: "2023-04-01", price: 310.50 },
  { date: "2023-04-05", price: 342.25 },
  { date: "2023-04-10", price: 325.75 },
  { date: "2023-04-15", price: 358.50 },
  { date: "2023-04-20", price: 378.25 },
  { date: "2023-04-25", price: 349.99 },
  { date: "2023-04-30", price: 372.50 }
];

// Mock condition comparison data
export const mockConditionData = [
  {
    condition: "New",
    averagePrice: 699.99,
    itemCount: 8
  },
  {
    condition: "Like New",
    averagePrice: 549.99,
    itemCount: 12
  },
  {
    condition: "Very Good",
    averagePrice: 389.99,
    itemCount: 24
  },
  {
    condition: "Good",
    averagePrice: 349.99,
    itemCount: 18
  },
  {
    condition: "Acceptable",
    averagePrice: 299.99,
    itemCount: 6
  }
];

// Generate deal feedback based on price and condition
export function getMockDealFeedback(
  currentPrice: number,
  condition: string,
  averagePrice: number
): string {
  const priceDiff = ((currentPrice - averagePrice) / averagePrice) * 100;
  
  if (priceDiff <= -15) {
    return "This is an excellent deal! The price is significantly below the average for similar items in this condition.";
  } else if (priceDiff <= -5) {
    return "This is a good deal. You're paying less than average for this condition.";
  } else if (priceDiff <= 5) {
    return "This is priced fairly for its condition based on recent sales.";
  } else if (priceDiff <= 15) {
    return "This item is slightly overpriced compared to similar items in this condition.";
  } else {
    return "This item is overpriced compared to similar items in this condition. Consider negotiating or looking for alternatives.";
  }
}

// Generate auction-specific feedback based on current bid and market value
export function getMockAuctionFeedback(
  currentBid: number,
  averagePrice: number,
  timeRemaining: string,
  bidsCount: number = 0
): string {
  const priceDiff = ((currentBid - averagePrice) / averagePrice) * 100;
  const isEndingSoon = timeRemaining && (
    timeRemaining.includes("h") && parseInt(timeRemaining.split("h")[0]) < 12
  );
  const hasHighBidActivity = bidsCount > 10;
  
  if (isEndingSoon) {
    // Auction ending soon scenarios
    if (priceDiff <= -20) {
      return "This auction is ending soon with a bid significantly below market value - excellent potential deal!";
    } else if (priceDiff <= -5) {
      return "This auction is ending soon with a bid below market value - good potential deal!";
    } else if (priceDiff <= 5) {
      return "This auction is ending soon with a bid at market value. Consider setting a maximum bid that reflects the item's value to you.";
    } else {
      return "This auction is ending soon with a bid above market value. Consider looking for other options or set a lower maximum bid.";
    }
  } else {
    // Auction with plenty of time left
    if (priceDiff <= -30) {
      return hasHighBidActivity 
        ? "Current bid is well below market value, but high bid activity suggests the price will increase substantially."
        : "Current bid is significantly below market value, which is typical for auctions with plenty of time remaining.";
    } else if (priceDiff <= -15) {
      return "Current bid is below market value. Set a maximum bid and monitor the auction as it progresses.";
    } else {
      return "Current bid is approaching or exceeds market value with time remaining. Consider finding a fixed-price alternative or set a strict maximum bid.";
    }
  }
}

// Get the appropriate mock data based on listing type and state
export function getMockDataForMode(mode: 'auction' | 'fixedPrice', state: 'default' | 'ending' | 'discount' = 'default'): ListingInfo {
  if (mode === 'auction') {
    return state === 'ending' ? mockAuctionEndingSoonInfo : mockAuctionListingInfo;
  } else {
    return state === 'discount' ? mockDiscountFixedPriceInfo : mockListingInfo;
  }
}
