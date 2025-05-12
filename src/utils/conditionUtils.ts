
/**
 * Utility functions for working with item conditions
 */

// Standard condition values ordered from best to worst
export const standardConditions = [
  'New/Sealed',
  'New',
  'Like New',
  'Refurbished',
  'Very Good',
  'Good',
  'Acceptable',
  'For Parts'
];

// Map arbitrary condition text to standardized values
export function standardizeCondition(condition: string): string {
  if (!condition) return 'Used';
  
  const normalizedCondition = condition.toLowerCase();
  
  if (normalizedCondition.includes('new') && normalizedCondition.includes('seal')) {
    return 'New/Sealed';
  } else if (normalizedCondition.includes('new')) {
    return 'New';
  } else if (normalizedCondition.includes('like new') || normalizedCondition.includes('excellent')) {
    return 'Like New';
  } else if (normalizedCondition.includes('very good')) {
    return 'Very Good';
  } else if (normalizedCondition.includes('good')) {
    return 'Good';
  } else if (normalizedCondition.includes('acceptable')) {
    return 'Acceptable';
  } else if (normalizedCondition.includes('refurb')) {
    return 'Refurbished';
  } else if (normalizedCondition.includes('parts') || normalizedCondition.includes('not working')) {
    return 'For Parts';
  } else if (normalizedCondition.includes('used') || normalizedCondition.includes('pre-owned')) {
    return 'Used';
  }
  
  return 'Used';
}

// Map condition to relative value (lower number = better condition)
export function getConditionRank(condition: string): number {
  const standardCondition = standardizeCondition(condition);
  const index = standardConditions.indexOf(standardCondition);
  
  // If found in our standard list, use the index
  if (index >= 0) {
    return index + 1;
  }
  
  // Default rank for unrecognized conditions (close to "Good")
  return 6;
}

// Get condition premium percentage (how much more a better condition is worth)
export function getConditionPremium(
  baseCondition: string, 
  targetCondition: string
): number {
  const baseRank = getConditionRank(baseCondition);
  const targetRank = getConditionRank(targetCondition);
  const rankDifference = baseRank - targetRank;
  
  // Each rank improvement is worth ~15% more
  return rankDifference * 0.15;
}

// Estimate the value of an item in a different condition
export function estimateValueInCondition(
  currentPrice: number,
  currentCondition: string,
  targetCondition: string
): number {
  const premium = getConditionPremium(currentCondition, targetCondition);
  return currentPrice * (1 + premium);
}

// Get text description of condition value
export function getConditionValueDescription(
  price: number,
  averagePrice: number,
  condition: string
): string {
  const priceDiff = ((price - averagePrice) / averagePrice) * 100;
  const standardCondition = standardizeCondition(condition);
  
  if (priceDiff <= -15) {
    return `Excellent value for ${standardCondition} condition`;
  } else if (priceDiff <= -5) {
    return `Good value for ${standardCondition} condition`;
  } else if (priceDiff <= 5) {
    return `Fair market value for ${standardCondition} condition`;
  } else if (priceDiff <= 15) {
    return `Slightly overpriced for ${standardCondition} condition`;
  } else {
    return `Overpriced for ${standardCondition} condition`;
  }
}

// Get a more precise deal score based on condition and price
export function getConditionAdjustedDealScore(
  price: number,
  averagePrice: number,
  condition: string,
  averageCondition: string = 'Used'
): number {
  // Start with basic price difference
  const priceDiff = ((price - averagePrice) / averagePrice) * 100;
  
  // Adjust for condition difference
  const conditionAdjustment = getConditionPremium(averageCondition, condition) * 100;
  const adjustedDiff = priceDiff - conditionAdjustment;
  
  // Convert to score (0-100 where higher is better)
  if (adjustedDiff <= -30) return 100;
  if (adjustedDiff >= 30) return 0;
  
  // Linear scale from 0-100 for adjusted differences between +30% and -30%
  return Math.round(50 - (adjustedDiff * (50/30)));
}
