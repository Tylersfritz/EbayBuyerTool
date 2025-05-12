
import { apiRequest } from './apiClient';
import { toast } from '@/components/ui/sonner';

export interface PriceCheckResponse {
  averagePrice: number;
  itemCount: number;
  timestamp: string;
  error?: string;
}

export interface PriceCheckParams {
  itemName: string;
  model?: string;
  brand?: string;
  condition?: string;
  premium?: boolean; // Add premium flag
}

/**
 * Simplified version of the price check API call
 */
export async function getPriceCheck(params: PriceCheckParams): Promise<PriceCheckResponse> {
  console.log('Getting price check data with params:', params);
  
  // Extract key parameters from the request
  const queryParams: Record<string, string> = {
    itemName: params.itemName
  };
  
  // Add optional parameters if present
  if (params.model) queryParams.model = params.model;
  if (params.brand) queryParams.brand = params.brand;
  // The condition will be mapped to the proper eBay condition ID in the server-side API
  if (params.condition) queryParams.condition = params.condition;
  
  // Add premium flag if the user has premium status
  if (params.premium) queryParams.premium = 'true';
  
  const { data, error } = await apiRequest<PriceCheckResponse>('priceCheck', {
    params: queryParams,
    retries: 2,
    showToast: false // We'll handle toasts separately
  });
  
  if (error) {
    console.error('Price check API error:', error);
    
    // Create a standardized error response
    return {
      averagePrice: 0,
      itemCount: 0,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
  
  if (!data) {
    return {
      averagePrice: 0,
      itemCount: 0,
      timestamp: new Date().toISOString(),
      error: 'No price data received'
    };
  }
  
  return data;
}

// Usage tracking functions (keeping the existing logic)
export function incrementUsageCount(): number {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const storageKey = `dealHavenAI_priceChecks_${today}`;
  
  let currentCount = 0;
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(storageKey);
    currentCount = stored ? parseInt(stored, 10) : 0;
    currentCount += 1;
    localStorage.setItem(storageKey, currentCount.toString());
  } else if (typeof chrome !== 'undefined' && chrome.storage) {
    // For Chrome extension environment
    chrome.storage.local.get([storageKey], (result: Record<string, unknown>) => {
      currentCount = typeof result[storageKey] === 'number' ? result[storageKey] as number : 0;
      currentCount += 1;
      chrome.storage.local.set({ [storageKey]: currentCount });
    });
  }
  
  return currentCount;
}

export function getUsageCount(): Promise<number> {
  return new Promise((resolve) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const storageKey = `dealHavenAI_priceChecks_${today}`;
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      resolve(stored ? parseInt(stored, 10) : 0);
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
      // For Chrome extension environment
      chrome.storage.local.get([storageKey], (result: Record<string, unknown>) => {
        resolve(typeof result[storageKey] === 'number' ? result[storageKey] as number : 0);
      });
    } else {
      resolve(0);
    }
  });
}

export function hasReachedFreeLimit(): Promise<boolean> {
  const FREE_LIMIT = 10;
  return getUsageCount().then(count => count >= FREE_LIMIT);
}

// Function to extract key item information for API search
export function extractItemSearchParams(
  itemName: string,
  itemSpecifics?: Record<string, string>
): {
  model: string;
  brand: string;
  searchTerm: string;
} {
  const specs = itemSpecifics || {};
  let model = specs['Model'] || '';
  let brand = specs['Brand'] || '';
  
  // If model isn't found in the itemSpecifics, try to extract it from the title
  if (!model && itemName) {
    // Try to identify model from title based on common patterns
    const modelPatterns = [
      /\b(iphone \d+(?:\s?(?:pro|plus|max|mini))?)\b/i,  // iPhone models
      /\b(galaxy (?:s|note|a|z)?\d+(?:\s?(?:ultra|plus|fe))?)\b/i,  // Samsung Galaxy models
      /\b(macbook (?:pro|air)?\s?\d+(?:\.\d+)?(?:\s?inch)?)\b/i,  // MacBook models
      /\b(ps\d+|playstation\s?\d+)\b/i,  // PlayStation
      /\b(xbox\s?(?:one|series\s?[xs])?)\b/i  // Xbox models
    ];
    
    for (const pattern of modelPatterns) {
      const match = itemName.match(pattern);
      if (match && match[1]) {
        model = match[1];
        break;
      }
    }
  }
  
  // Extract brand from title if not in specs
  if (!brand && itemName) {
    const commonBrands = [
      'Apple', 'Samsung', 'Sony', 'Microsoft', 'Google', 'LG', 
      'Lenovo', 'Dell', 'HP', 'Asus', 'Acer', 'Toshiba', 'Huawei',
      'Nintendo', 'Dyson', 'Bose', 'JBL', 'Logitech', 'Canon', 'Nikon'
    ];
    
    for (const brandName of commonBrands) {
      if (itemName.toLowerCase().includes(brandName.toLowerCase())) {
        brand = brandName;
        break;
      }
    }
  }
  
  // Build a search term that emphasizes model and brand
  let searchTerm = '';
  
  if (brand && model) {
    searchTerm = `${brand} ${model}`;
  } else if (model) {
    searchTerm = model;
  } else if (brand) {
    searchTerm = brand + ' ' + itemName.split(' ').slice(0, 3).join(' ');
  } else {
    searchTerm = itemName;
  }
  
  return {
    model,
    brand,
    searchTerm: searchTerm.trim()
  };
}
