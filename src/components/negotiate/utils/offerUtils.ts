
import { OfferType, ToneType } from "../types/offerTypes";
import { calculatePriceDifference } from "@/utils/extensionUtils";

// Calculate offer prices for different strategies
export const getOfferPrice = (
  type: OfferType,
  isAuction: boolean,
  listingPrice: number,
  marketPrice: number,
  sliderPercentage: number
): number => {
  if (!marketPrice) return 0;
  
  let basePercentage = sliderPercentage;
  
  if (isAuction) {
    // For auctions, interpret slider value as percentage to market
    switch (type) {
      case 'lowball':
        return marketPrice * (1 + (basePercentage - 5) / 100); // More aggressive
      case 'fair':
        return marketPrice * (1 + (basePercentage + 0) / 100); // At slider value
      case 'sweetspot':
        return marketPrice * (1 + (basePercentage - 2) / 100); // Slightly more aggressive
      default:
        return marketPrice * (1 + basePercentage / 100);
    }
  } else {
    // For fixed-price, interpret slider value as discount percentage
    switch (type) {
      case 'lowball':
        return listingPrice * (1 - (basePercentage + 5) / 100); // More aggressive
      case 'fair':
        return listingPrice * (1 - (basePercentage - 2) / 100); // Less aggressive
      case 'sweetspot':
        return listingPrice * (1 - basePercentage / 100); // At slider value
      default:
        return listingPrice * (1 - basePercentage / 100);
    }
  }
};

// Get success probability for each offer type
export const getSuccessProbability = (
  type: OfferType,
  listingPrice: number,
  marketPrice: number
): number => {
  if (!marketPrice || !listingPrice) return 50;
  
  // Calculate how far the listing is from market rate
  const priceDifference = calculatePriceDifference(listingPrice, marketPrice);
  
  // Adjust probability based on offer type and price difference
  switch (type) {
    case 'lowball':
      // Lower chance of success, but higher if item is overpriced
      return Math.min(80, Math.max(20, 30 + (priceDifference / 2)));
    case 'fair':
      // Good chance of success, better if item is overpriced
      return Math.min(90, Math.max(50, 65 + (priceDifference / 3)));
    case 'sweetspot':
      // Highest chance of success
      return Math.min(95, Math.max(60, 75 + (priceDifference / 4)));
    default:
      return 50;
  }
};

// Get market context information
export const getMarketContext = (
  type: OfferType,
  listingPrice: number,
  marketPrice: number,
  offerPrice: number
): string => {
  if (!marketPrice) return '';
  
  const priceDiff = calculatePriceDifference(listingPrice, marketPrice);
  
  if (priceDiff > 15) {
    return `Similar items typically sell for around $${marketPrice.toFixed(2)}, which is ${Math.abs(Math.round(priceDiff))}% lower than your current price.`;
  } else if (priceDiff < -5) {
    return `Market data shows similar items selling at around $${marketPrice.toFixed(2)}, so you're already offering a competitive price.`;
  } else {
    return `Recent market data shows similar items selling for around $${marketPrice.toFixed(2)}.`;
  }
};

// Generate message templates based on tone and offer type
export const getMessageTemplate = (type: OfferType, toneType: ToneType): string => {
  const templates: Record<OfferType, Record<ToneType, string>> = {
    lowball: {
      friendly: "Hi {seller}, I've been browsing for a {title} and your listing caught my eye! Based on some research I've done, would you consider accepting ${offerPrice}? I'm ready to complete the purchase right away. Thanks for considering!",
      firm: "Hello {seller}, I'm interested in your {title}. Market data indicates similar items selling for around ${marketPrice}. I'd like to offer ${offerPrice} for an immediate purchase. Please let me know if this works for you.",
      curious: "Hi {seller}, I'm curious if you'd consider an offer of ${offerPrice} for your {title}? I've been tracking market prices for this item and noticed similar ones selling in this range. What are your thoughts?"
    },
    fair: {
      friendly: "Hello {seller}, I'm very interested in your {title} listing! Based on current market values, would you accept ${offerPrice}? I'd be happy to complete the purchase immediately. Thanks for your consideration!",
      firm: "Hello {seller}, I'd like to purchase your {title}. Market data shows the average price for this item is ${marketPrice}. I'm prepared to pay ${offerPrice}, which is a fair market value. I can complete the transaction immediately.",
      curious: "Hi {seller}, I've been researching prices for {title} and noticed the market average is around ${marketPrice}. Would you be open to ${offerPrice}? I'm genuinely interested in your item and would appreciate your thoughts."
    },
    sweetspot: {
      friendly: "Hi {seller}! I'm really excited about your {title} and would love to purchase it today. Would you consider ${offerPrice}? This is a great offer based on current market trends, and I can pay immediately. Looking forward to hearing from you!",
      firm: "Hello {seller}, I'm ready to purchase your {title} today for ${offerPrice}. This offer is based on recent sales data and represents good value for both of us. I can complete payment immediately upon your acceptance.",
      curious: "Hello {seller}, I'm very interested in your {title} and wondering if you might consider ${offerPrice}? I've been watching the market closely and believe this represents a fair value that works for both of us. What do you think?"
    }
  };
  
  return templates[type][toneType];
};

// Helper for seller analytics (mock data for now)
export const getSellerResponseRate = (sellerName?: string): number => {
  if (!sellerName) return 75;
  
  // Generate a consistent number based on seller name
  const hash = sellerName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Generate a number between 60 and 95
  return Math.abs(hash % 35) + 60;
};

export const getSellerResponseTime = (sellerName?: string): string => {
  const times = ["1 hour", "2 hours", "3 hours", "same day", "within 24 hours"];
  if (!sellerName) return times[2];
  
  const hash = sellerName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return times[Math.abs(hash) % times.length];
};

// Format timestamp for history display
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};
