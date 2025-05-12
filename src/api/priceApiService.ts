// src/api/priceApiService.ts
// Service to interact with the price-check API endpoint for DealHavenAI

// Type definition for the API response, matching the /api/price-check output
export interface PriceCheckResponse {
  averagePrice: number;
  priceHistory: Array<{ date: string; price: number }>;
  sampleSize: number;
  dateRange: string;
  source: string;
  itemCount: number;
  timestamp: string;
  error?: string;
}

// Type definition for the parameters sent to the price-check endpoint
export interface PriceCheckParams {
  itemName: string;
  model?: string;
  brand?: string;
  condition?: string;
  premium: boolean;
}

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
