
// src/api/priceApiService.ts
// Service to interact with the price-check API endpoint for DealHavenAI

import { PriceCheckResponse, ListingInfo } from '@/components/priceCheck/types/priceCheckTypes';
import { toast } from "@/components/ui/sonner";
import { mockPriceCheckApi } from './priceApiClient';

// Type definition for the parameters sent to the price-check endpoint
export interface PriceCheckParams {
  itemName: string;
  model?: string;
  brand?: string;
  category?: string;
  condition?: string;
  premium: boolean;
  itemId?: string;
  itemSpecifics?: Record<string, string>;
}

// Re-export the PriceCheckResponse type for backward compatibility
export type { PriceCheckResponse };

// Config for API environments
const API_CONFIG = {
  useMockData: false,
  mockDataFallbackDelay: 5000, // 5 seconds before falling back to mock
  debugLogging: true,
  ebay: {
    browseApiEnvironment: 'production' as const,
    marketInsightsApiEnvironment: 'sandbox' as const
  }
};

/**
 * Fetches price check data from the price-check API endpoint
 * Enhanced to better utilize item specifics data from the Browse API
 * 
 * @param params - Parameters for the price check 
 * @returns Promise resolving to the PriceCheckResponse
 * @throws Error if the API request fails
 */
export async function getPriceCheck(params: PriceCheckParams): Promise<PriceCheckResponse> {
  console.log('getPriceCheck params:', params);
  
  try {
    // Include the API environment configuration as a header
    const apiConfig = {
      browseApi: API_CONFIG.ebay.browseApiEnvironment,
      marketInsightsApi: API_CONFIG.ebay.marketInsightsApiEnvironment
    };
    
    // For preview/web environment, use the special preview endpoint
    const isExtension = !!window.chrome?.runtime || !!window.browser?.runtime;
    const apiBaseUrl = isExtension 
      ? 'https://ebay-buyer-tool-3rowffqph-tyler-fritzs-projects.vercel.app'
      : '/api'; // Use relative path for preview environment
      
    // Enhance logging to track item specifics being used
    if (API_CONFIG.debugLogging) {
      console.log('Using item specifics in API call:', params.itemSpecifics);
      console.log('API environments:', apiConfig);
    }
      
    const response = await fetch(`${apiBaseUrl}/api/price-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Config': JSON.stringify(apiConfig)
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}, Text: ${await response.text()}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: PriceCheckResponse = await response.json();
    console.log('getPriceCheck raw response:', data);
    
    // Validate the response data to ensure it has the expected structure
    if (!data || typeof data.averagePrice !== 'number') {
      console.error('Invalid price check response:', data);
      throw new Error('Invalid price check response format');
    }
    
    // Add data source information to help with transparency
    const enhancedData: PriceCheckResponse = {
      ...data,
      source: data.source || `${apiConfig.browseApi} Browse API + ${apiConfig.marketInsightsApi} Market Insights`,
      dataQuality: data.dataQuality || {
        confidence: determineDataQuality(params, data).confidence,
        sources: ['eBay Browse API (Production)', 'eBay Market Insights API (Sandbox)'],
        itemSpecifics: extractUsedItemSpecifics(params)
      }
    };
    
    return enhancedData;
  } catch (error) {
    console.error('Error fetching price check data:', error);
    
    // Don't fall back to mock data immediately - explicitly throw the error
    throw error;
  }
}

/**
 * Determines the data quality based on the parameters used and the response
 */
function determineDataQuality(params: PriceCheckParams, data: PriceCheckResponse): { confidence: 'high' | 'medium' | 'low' } {
  // Direct item lookup = high confidence
  if (params.itemId) {
    return { confidence: 'high' };
  }
  
  // Item specifics with brand/model = high confidence
  if (params.brand && params.model) {
    return { confidence: 'high' };
  }
  
  // Item specifics with only brand or model = medium confidence
  if (params.brand || params.model || (params.itemSpecifics && Object.keys(params.itemSpecifics).length > 0)) {
    return { confidence: 'medium' };
  }
  
  // Just title search = low confidence
  return { confidence: 'low' };
}

/**
 * Extracts the item specifics that were actually used in the API call
 */
function extractUsedItemSpecifics(params: PriceCheckParams): { make?: string; model?: string; category?: string; } {
  return {
    make: params.brand || null,
    model: params.model || null,
    category: params.category || null
  };
}
