
/**
 * Utility functions for pricing calculations
 */

// Format price with currency symbol
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency 
  }).format(price);
}

// Calculate percentage difference between two prices
export function calculatePriceDifference(currentPrice: number, averagePrice: number): number {
  if (!averagePrice || averagePrice <= 0) return 0;
  return ((currentPrice - averagePrice) / averagePrice) * 100;
}

// Get a deal score based on price difference (0-100 where higher is better)
export function getDealScore(priceDifference: number): number {
  // Convert the price difference to a score
  // -30% or better = 100 score
  // +30% or worse = 0 score
  // Scale linearly between those values
  if (priceDifference <= -30) return 100;
  if (priceDifference >= 30) return 0;
  
  // Linear scale from 0-100 for price differences between +30% and -30%
  return Math.round(50 - (priceDifference * (50/30)));
}

// Get a color based on deal score
export function getDealColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-green-500';
  if (score >= 40) return 'text-amber-500';
  if (score >= 20) return 'text-orange-500';
  return 'text-red-500';
}

// Get a descriptive text for the deal score
export function getDealText(score: number): string {
  if (score >= 80) return 'Excellent Deal';
  if (score >= 60) return 'Good Deal';
  if (score >= 40) return 'Fair Price';
  if (score >= 20) return 'Slightly Overpriced';
  return 'Overpriced';
}
