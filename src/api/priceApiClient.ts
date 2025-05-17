
// This file is kept in sync with the original in pages/api/price-check.cjs

import { PriceCheckParams, PriceCheckResponse } from './priceApiService';

/**
 * Extracts search parameters from item information
 * Prioritizes item specifics like brand and model for more accurate search results
 */
export function extractItemSearchParams({ 
  itemName, 
  itemSpecifics, 
  condition 
}: { 
  itemName: string, 
  itemSpecifics?: Record<string, string> | null,
  condition?: string
}) {
  // Extract key information from item specifics to improve search
  let brand = '';
  let model = '';
  let category = '';
  
  if (itemSpecifics) {
    // Look for brand with multiple possible key names
    for (const key of ['Brand', 'Marque', 'Marca', 'Make', 'Manufacturer']) {
      if (itemSpecifics[key]) {
        brand = itemSpecifics[key];
        break;
      }
    }
    
    // Look for model with multiple possible key names
    for (const key of ['Model', 'Modèle', 'Modelo', 'MPN', 'Part Number']) {
      if (itemSpecifics[key]) {
        model = itemSpecifics[key];
        break;
      }
    }

    // Look for category with multiple possible key names
    for (const key of ['Category', 'Type', 'Product Type', 'Item Type']) {
      if (itemSpecifics[key]) {
        category = itemSpecifics[key];
        break;
      }
    }
  }
  
  // Construct search term, prioritizing brand and model if available
  const searchTerm = brand && model 
    ? `${brand} ${model}` 
    : itemName.replace(/\b(new|used|refurbished|sealed|mint|box)\b/gi, '').trim();
  
  return {
    searchTerm,
    brand,
    model,
    category
  };
}

// This is a mock implementation of the API endpoint for the preview environment
export async function mockPriceCheckApi(params: PriceCheckParams): Promise<PriceCheckResponse> {
  console.log('Mock API called with:', params);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const date = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  
  // Generate realistic price data based on input parameters
  const basePrice = params.premium ? 150 : 100;
  const multiplier = params.condition === 'NEW' ? 1.3 : 
                    params.condition === 'REFURBISHED' ? 0.9 : 0.7;
  
  // Generate some variance in the price
  const priceVariance = () => 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  const avgPrice = basePrice * multiplier * priceVariance();
  
  // Generate price history data
  const priceHistory = Array.from({ length: 8 }, (_, i) => {
    const pastDate = new Date();
    pastDate.setDate(date.getDate() - (i * 3)); // Every 3 days back
    
    return {
      date: formatDate(pastDate),
      price: avgPrice * (0.9 + Math.random() * 0.2) // +/- 10%
    };
  }).reverse();
  
  return {
    averagePrice: avgPrice,
    marketRate: avgPrice, // Using average price as market rate
    priceRange: {
      min: avgPrice * 0.85,
      max: avgPrice * 1.15
    },
    priceHistory,
    sampleSize: 12,
    itemCount: 12,
    dateRange: `${formatDate(new Date(date.setDate(date.getDate() - 21)))} - ${formatDate(new Date())}`,
    source: 'Mock API for Preview Environment',
    timestamp: new Date().toISOString(),
    dataQuality: {
      confidence: 'low',
      sources: ['Mock API (Preview Environment)'],
      warning: 'This is sample data for preview purposes only',
      itemSpecifics: {
        make: params.brand || null,
        model: params.model || null,
        category: params.category || null
      }
    }
  };
}

/**
 * Enhanced version of the price check API client
 * This implementation prioritizes:
 * 1. Direct item lookup using itemId when available
 * 2. Search by item specifics (brand, model) when available
 * 3. Search by title as a fallback
 */
export async function enhancedPriceCheck(params: PriceCheckParams): Promise<PriceCheckResponse> {
  console.log('Enhanced price check called with params:', params);
  
  // Extract item specifics if available
  let { brand, model } = params;
  
  if (!brand || !model) {
    // Try to extract from itemSpecifics
    if (params.itemSpecifics) {
      const extracted = extractItemSearchParams({
        itemName: params.itemName,
        itemSpecifics: params.itemSpecifics,
        condition: params.condition
      });
      
      brand = brand || extracted.brand;
      model = model || extracted.model;
    }
  }
  
  // Log the enhanced parameters
  console.log('Enhanced search parameters:', { 
    itemId: params.itemId, 
    brand, 
    model, 
    itemName: params.itemName 
  });
  
  // For now, use the mock implementation since the server-side code is out of scope
  return mockPriceCheckApi({
    ...params,
    brand,
    model
  });
}
