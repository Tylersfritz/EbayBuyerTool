
/**
 * Utility functions for affiliate links
 */
import { getFromStorage, saveToStorage } from "../storage/storageUtils";

// Generate affiliate URL for a product
export async function generateAffiliateUrl(productName: string, affiliateId?: string): Promise<string> {
  // Get the marketplace and affiliate ID
  if (!affiliateId) {
    affiliateId = await getAffiliateId('amazon');
  }
  
  // Create search term that's optimized for affiliate links
  const searchTerm = productName
    .replace(/Used|Refurbished|Pre-owned|Like New|Very Good|Good|Acceptable/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Get the affiliate URL template from storage or use default
  let urlTemplate = "https://amazon.com/s?k={productName}&tag={affiliateId}";
  
  // Replace placeholders with actual values
  let url = urlTemplate
    .replace('{productName}', encodeURIComponent(searchTerm))
    .replace('{affiliateId}', encodeURIComponent(affiliateId));
    
  return url;
}

// Get affiliate ID for a specific marketplace
export async function getAffiliateId(marketplace: string = 'amazon'): Promise<string> {
  const defaultIds = {
    amazon: 'dealhaven-20',
    walmart: 'dealhaven',
    ebay: 'dealhaven'
  };
  
  try {
    const savedIds = await getFromStorage<Record<string, string>>('affiliateIds');
    if (savedIds && savedIds[marketplace]) {
      return savedIds[marketplace];
    }
  } catch (error) {
    console.error('Error getting affiliate ID:', error);
  }
  
  // Return default if not found in storage
  return defaultIds[marketplace as keyof typeof defaultIds] || 'default';
}

// Save affiliate IDs to storage
export async function saveAffiliateIds(ids: Record<string, string>): Promise<void> {
  return saveToStorage('affiliateIds', ids);
}
