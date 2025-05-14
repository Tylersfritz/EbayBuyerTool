
// src/api/priceApiService.ts
// Service to interact with the price-check API endpoint for DealHavenAI

// Import the type from the central types file
import { PriceCheckResponse } from '@/components/priceCheck/types/priceCheckTypes';

// Type definition for the parameters sent to the price-check endpoint
export interface PriceCheckParams {
  itemName: string;
  model?: string;
  brand?: string;
  condition?: string;
  premium: boolean;
}

// Re-export the PriceCheckResponse type for backward compatibility
export type { PriceCheckResponse };

/**
 * Fetches price check data from the price-check API endpoint
 * @param params - Parameters for the price check (itemName, model, brand, condition, premium)
 * @returns Promise resolving to the PriceCheckResponse
 * @throws Error if the API request fails
 */
export async function getPriceCheck(params: PriceCheckParams): Promise<PriceCheckResponse> {
  console.log('getPriceCheck params:', params);
  
  try {
    const response = await fetch('https://ebay-buyer-tool-3rowffqph-tyler-fritzs-projects.vercel.app/api/price-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: PriceCheckResponse = await response.json();
    console.log('getPriceCheck raw response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching price check data:', error);
    throw error;
  }
}
