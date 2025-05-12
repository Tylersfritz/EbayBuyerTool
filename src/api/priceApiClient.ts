import { toast } from "@/components/ui/sonner";

export interface PriceCheckResponse {
  averagePrice: number;
  itemCount: number;
  timestamp: string;
  error?: string;
}

// Use the actual Vercel deployment URL
const VERCEL_DEPLOYMENT_URL = "https://ebay-buyer-tool-zp52.vercel.app";

// API base URL derived from the deployment URL - use a single consistent path
const API_BASE_URL = `${VERCEL_DEPLOYMENT_URL}/api/price-check`;

// Check if the API server is available
async function checkApiHealth() {
  try {
    const response = await fetch(`${VERCEL_DEPLOYMENT_URL}/api/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('API server is healthy:', data);
      return true;
    }
    return false;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

// Function to simplify item names for better API search results
function simplifyItemName(itemName: string): string {
  return itemName
    .replace(/used|refurbished|very good|good|like new|excellent|condition|pre-owned|certified/gi, '')
    .replace(/[^\w\s-]/g, ' ') // Remove special characters
    .replace(/\s+/g, ' ')      // Replace multiple spaces with a single space
    .trim();
}

/**
 * Maps condition values to standardized format for the eBay Buy API
 * @param {string} condition - The condition value
 * @returns {string} Standardized condition value
 */
function standardizeConditionValue(condition?: string): string {
  if (!condition) return '';
  
  // Convert to uppercase for consistent matching
  const upperCondition = condition.toUpperCase();
  
  // Map common condition description patterns
  if (upperCondition.includes('NEW') && upperCondition.includes('SEAL')) {
    return 'NEW';
  } else if (upperCondition.includes('NEW')) {
    return 'NEW';
  } else if (upperCondition.includes('LIKE NEW') || upperCondition.includes('EXCELLENT')) {
    return 'USED_EXCELLENT';
  } else if (upperCondition.includes('VERY GOOD')) {
    return 'USED_VERY_GOOD';
  } else if (upperCondition.includes('GOOD')) {
    return 'USED_GOOD';
  } else if (upperCondition.includes('ACCEPTABLE')) {
    return 'USED_ACCEPTABLE';
  } else if (upperCondition.includes('REFURB') && upperCondition.includes('CERTIFIED')) {
    return 'CERTIFIED_REFURBISHED';
  } else if (upperCondition.includes('REFURB') && upperCondition.includes('MANUFACTURER')) {
    return 'MANUFACTURER_REFURBISHED';
  } else if (upperCondition.includes('REFURB') && upperCondition.includes('SELLER')) {
    return 'SELLER_REFURBISHED';
  } else if (upperCondition.includes('REFURB')) {
    return 'REFURBISHED';
  } else if (upperCondition.includes('PARTS') || upperCondition.includes('NOT WORKING')) {
    return 'FOR_PARTS_OR_NOT_WORKING';
  } else if (upperCondition.includes('USED')) {
    return 'USED';
  }
  
  // Default to the original value if no match is found
  return upperCondition;
}

// Temporary simplified export for testing
export function extractItemSearchParams(options: any): any {
  return { model: '', brand: '', condition: '', searchTerm: '' };
}

// Comment out the original export and interface for testing
/*
interface PriceCheckApiOptions {
  itemName: string;
  itemSpecifics?: Record<string, string>;
  condition?: string;
}

export function extractItemSearchParams(options: PriceCheckApiOptions): {
  model: string;
  brand: string;
  condition: string;
  searchTerm: string;
} {
  const specs = options.itemSpecifics || {};
  let model = specs['Model'] || '';
  let brand = specs['Brand'] || '';
  let condition = options.condition || specs['Condition'] || '';
  
  // Standardize condition for API compatibility
  condition = standardizeConditionValue(condition);
  
  // If model isn't found in the itemSpecifics, try to extract it from the title
  if (!model && options.itemName) {
    // Try to identify model from title based on common patterns
    const modelPatterns = [
      /\b(iphone \d+(?:\s?(?:pro|plus|max|mini))?)\b/i,  // iPhone models
      /\b(galaxy (?:s|note|a|z)?\d+(?:\s?(?:ultra|plus|fe))?)\b/i,  // Samsung Galaxy models
      /\b(macbook (?:pro|air)?\s?\d+(?:\.\d+)?(?:\s?inch)?)\b/i,  // MacBook models
      /\b(ps\d+|playstation\s?\d+)\b/i,  // PlayStation
      /\b(xbox\s?(?:one|series\s?[xs])?)\b/i  // Xbox models
    ];
    
    for (const pattern of modelPatterns) {
      const match = options.itemName.match(pattern);
      if (match && match[1]) {
        model = match[1];
        break;
      }
    }
  }
  
  // Extract brand from title if not in specs
  if (!brand && options.itemName) {
    const commonBrands = [
      'Apple', 'Samsung', 'Sony', 'Microsoft', 'Google', 'LG', 
      'Lenovo', 'Dell', 'HP', 'Asus', 'Acer', 'Toshiba', 'Huawei',
      'Nintendo', 'Dyson', 'Bose', 'JBL', 'Logitech', 'Canon', 'Nikon'
    ];
    
    for (const brandName of commonBrands) {
      if (options.itemName.toLowerCase().includes(brandName.toLowerCase())) {
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
    searchTerm = brand + ' ' + options.itemName.split(' ').slice(0, 3).join(' ');
  } else {
    searchTerm = options.itemName;
  }
  
  return {
    model,
    brand,
    condition,
    searchTerm: searchTerm.trim()
  };
}
*/

export async function getPriceCheck(options: PriceCheckApiOptions): Promise<PriceCheckResponse> {
  try {
    // Check API health first
    const isHealthy = await checkApiHealth();
    if (!isHealthy) {
      console.warn('API server health check failed. Attempting to proceed anyway.');
    }
    
    console.log('Calling live eBay API via Vercel serverless function');
    console.log('Options:', options);
    
    // Extract key search parameters from item specifics
    const { model, brand, condition, searchTerm } = extractItemSearchParams(options);
    console.log('Using search parameters:', { model, brand, condition, searchTerm });
    
    // Call API using the primary endpoint
    const response = await callPriceCheckApi(searchTerm, {
      model,
      brand,
      condition,
      itemSpecifics: options.itemSpecifics
    });
    
    // If no response, try with original item name
    if (!response && searchTerm !== options.itemName && options.itemName.length > 10) {
      console.log('Model-specific search failed, trying with original item name');
      toast.info("Trying with full item description...");
      return await callPriceCheckApi(options.itemName, {
        model,
        brand, 
        condition,
        itemSpecifics: options.itemSpecifics
      }) || createErrorResponse("No matching items found");
    }
    
    return response || createErrorResponse("No matching items found");
  } catch (error) {
    console.error("Price check API error:", error);
    toast.error("Failed to check price. Please try again later.");
    return createErrorResponse(error instanceof Error ? error.message : "Unknown error occurred");
  }
}

// Helper function to create a standardized error response
function createErrorResponse(errorMessage: string): PriceCheckResponse {
  return {
    averagePrice: 0,
    itemCount: 0,
    timestamp: new Date().toISOString(),
    error: errorMessage
  };
}

// Core API calling function using a single endpoint
async function callPriceCheckApi(
  searchTerm: string, 
  specs: {
    model?: string;
    brand?: string;
    condition?: string;
    itemSpecifics?: Record<string, string>;
  }
): Promise<PriceCheckResponse | null> {
  try {
    // Build the URL with search parameters
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    let url = `${API_BASE_URL}?itemName=${encodedSearchTerm}`;
    
    // Add specification parameters if available
    if (specs.model) url += `&model=${encodeURIComponent(specs.model)}`;
    if (specs.brand) url += `&brand=${encodeURIComponent(specs.brand)}`;
    if (specs.condition) url += `&condition=${encodeURIComponent(specs.condition)}`;
    
    console.log('Making API call to:', url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Get the response text for better error logging
    const text = await response.text();
    let responseData = null;
    
    try {
      responseData = text ? JSON.parse(text) : null;
    } catch (e) {
      console.error('Failed to parse API response:', text);
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }

    // Check for errors
    if (!response.ok) {
      console.error(`API error (${response.status}):`, text);
      
      // Check for authentication-related errors
      const isAuthError = response.status === 401 || 
                        (responseData && responseData.error && 
                          /auth|token|credentials|unauthorized/i.test(responseData.error));
      
      if (isAuthError) {
        console.error('Authentication error detected');
        toast.error("API authentication failed. Please check your eBay API credentials.");
      }
      
      throw new Error(`API error: ${response.status} - ${responseData?.error || text}`);
    }
    
    if (!responseData) {
      console.error('Empty response from API');
      throw new Error('Empty response received from API');
    }
    
    console.log('API response received successfully:', responseData);
    
    // Track this API call if in extension environment
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: "savePriceCheck",
        data: {
          itemName: searchTerm,
          searchParameters: { ...specs },
          result: responseData
        }
      });
    }
    
    return responseData;
  } catch (error) {
    console.error(`API call failed:`, error);
    throw error;
  }
}

// Usage tracking functions
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