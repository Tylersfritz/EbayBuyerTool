
/**
 * Main utility exports for DealHavenAI extension
 * This file re-exports utility functions from specialized modules
 */

// Re-export pricing utilities
export {
  formatPrice,
  calculatePriceDifference,
  getDealScore,
  getDealColor,
  getDealText
} from './pricing/pricingUtils';

// Re-export storage utilities
export {
  saveToStorage,
  getFromStorage
} from './storage/storageUtils';

// Re-export affiliate utilities
export {
  generateAffiliateUrl,
  getAffiliateId,
  saveAffiliateIds
} from './affiliate/affiliateUtils';

// Re-export mock mode utilities
export {
  toggleMockListingType,
  shouldUseAuctionMockData,
  getMockListingData
} from './mock/mockModeUtils';

// Re-export listing utilities
export {
  getCurrentListing
} from './listing/listingUtils';

// Re-export premium utilities
export {
  checkPremiumStatus
} from './premium/premiumUtils';
