
// src/api/priceApiService.ts
// Service to interact with the price-check API endpoint for DealHavenAI

import { PriceCheckResponse } from '@/components/priceCheck/types/priceCheckTypes';
import { toast } from "@/components/ui/sonner";

// Type definition for the parameters sent to the price-check endpoint
export interface PriceCheckParams {
  itemName: string;
  model?: string;
  brand?: string;
  condition?: string;
  premium: boolean;
  itemId?: string; // Added to support direct item lookup
}

// Re-export the PriceCheckResponse type for backward compatibility
export type { PriceCheckResponse };

// Config for API environments
const API_CONFIG = {
  useMockData: false, // Set to false to prioritize real API calls
  mockDataFallbackDelay: 5000, // 5 seconds before falling back to mock
  debugLogging: true,
  ebay: {
    browseApiEnvironment: 'production' as const,
    marketInsightsApiEnvironment: 'sandbox' as const
  }
};

/**
 * Fetches price check data from the price-check API endpoint
 * @param params - Parameters for the price check (itemName, model, brand, condition, premium)
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
        confidence: 'medium',
        sources: ['eBay Browse API (Production)', 'eBay Market Insights API (Sandbox)']
      }
    };
    
    return enhancedData;
  } catch (error) {
    console.error('Error fetching price check data:', error);
    
    // Don't fall back to mock data immediately - explicitly throw the error
    // This ensures we don't silently use mock data when the API is failing
    throw error;
  }
}
