
/**
 * Mock implementations of API endpoints for the preview environment
 * These functions simulate the behavior of the real API endpoints
 */

import { PriceCheckParams, PriceCheckResponse } from './priceApiService';

/**
 * Mock implementation of the price-check API endpoint
 */
export async function mockPriceCheckApi(params: PriceCheckParams): Promise<PriceCheckResponse> {
  console.log('Mock price-check API called with:', params);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate realistic looking data based on input parameters
  const basePrice = Math.floor(50 + Math.random() * 150);
  const itemName = params.itemName || 'Unknown Item';
  
  const today = new Date();
  const dateMinus30 = new Date();
  dateMinus30.setDate(today.getDate() - 30);
  
  // Generate price history with a realistic pattern
  const priceHistory = Array.from({ length: 8 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i * 4); // Every 4 days back
    
    // Price fluctuates around the base price
    const fluctuation = 0.9 + Math.random() * 0.2; // 90% to 110% of base price
    const price = Math.round(basePrice * fluctuation);
    
    return {
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      price
    };
  }).reverse(); // Oldest to newest
  
  // Calculate price statistics
  const prices = priceHistory.map(entry => entry.price);
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Data quality indicators
  const highQualityData = params.premium || Math.random() > 0.3;
  
  return {
    averagePrice,
    marketRate: averagePrice, // Using average price as market rate
    priceHistory,
    priceRange: {
      min: minPrice,
      max: maxPrice
    },
    itemCount: 8 + Math.floor(Math.random() * 15),
    sampleSize: 8,
    timestamp: new Date().toISOString(),
    dateRange: `${priceHistory[0].date} - ${priceHistory[priceHistory.length - 1].date}`,
    source: 'Mock API (Preview Environment)',
    dataQuality: {
      confidence: highQualityData ? 'medium' : 'low',
      sources: [
        'eBay Browse API (Preview Simulation)', 
        'eBay Market Insights API (Preview Simulation)'
      ],
      warning: highQualityData ? null : 'Limited data available for this item'
    }
  };
}
