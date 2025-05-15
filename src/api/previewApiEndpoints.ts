
/**
 * API endpoints for the preview environment
 * These functions provide real API functionality when running in the web preview
 */

import { PriceCheckParams, PriceCheckResponse } from './priceApiService';
import { mockPriceCheckApi } from './mockApiEndpoints';

/**
 * Handles price-check API requests in the preview environment
 * This acts as a serverless function equivalent when running in the web preview
 */
export async function handlePriceCheckRequest(params: PriceCheckParams): Promise<PriceCheckResponse> {
  console.log('Preview price-check API called with:', params);
  
  try {
    // First try to call the actual serverless function for real data
    const apiUrl = 'https://ebay-buyer-tool-3rowffqph-tyler-fritzs-projects.vercel.app/api/price-check';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Add preview environment indicator
    return {
      ...data,
      source: data.source ? `${data.source} (via Preview Environment)` : 'API (Preview Environment)'
    };
  } catch (error) {
    console.error('Error calling real API from preview:', error);
    console.log('Falling back to mock API implementation');
    
    // If the real API call fails, fall back to the mock implementation
    return mockPriceCheckApi(params);
  }
}

// Setup routes to intercept API calls in the preview environment
export function setupPreviewApiRoutes() {
  if (typeof window === 'undefined') return;
  
  // This is a simple way to intercept fetch calls in the preview environment
  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.url;
    
    // Check if this is a call to our API endpoints
    if (url.includes('/api/price-check')) {
      console.log('Intercepted API call in preview environment:', url);
      
      try {
        const params = init?.body ? JSON.parse(init.body as string) as PriceCheckParams : {} as PriceCheckParams;
        const result = await handlePriceCheckRequest(params);
        
        // Create a mock Response object
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Error in preview API handler:', error);
        return new Response(JSON.stringify({ error: 'Preview API error' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    // For all other requests, use the original fetch
    return originalFetch.apply(window, [input, init]);
  };
  
  console.log('Preview API routes set up successfully');
}
