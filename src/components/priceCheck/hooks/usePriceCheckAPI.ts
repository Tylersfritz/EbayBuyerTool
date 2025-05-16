
// src/components/priceCheck/hooks/usePriceCheckAPI.ts
import { useCallback } from 'react';
import { PriceCheckState, PriceCheckResponse } from '../types/priceCheckTypes';
import { getPriceCheck } from '@/api/priceApiService';
import { extractItemSearchParams } from '@/api/priceApiClient';
import { toast } from '@/components/ui/sonner';
import { mockPriceCheckData } from '../utils/mockData';
import { trackPriceCheckUsage } from '@/utils/premium/premiumUtils';

const MAX_RETRIES = 2;
const API_TIMEOUT_MS = 8000; // 8 seconds

/**
 * Hook for handling API calls to price check service
 */
export function usePriceCheckAPI(
  isPremium: boolean,
  state: PriceCheckState,
  setState: React.Dispatch<React.SetStateAction<PriceCheckState>>,
  setHasReachedLimit: React.Dispatch<React.SetStateAction<boolean>>
) {
  // Perform the price check API call
  const performPriceCheck = useCallback(async () => {
    console.log('performPriceCheck invoked');
    if (state.loading) {
      console.log('performPriceCheck aborted: already loading');
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('performPriceCheck called, testMode:', state.testMode);
      console.log('Current state:', JSON.stringify(state, null, 2));
      
      // For free tier users, check usage limits
      if (!isPremium) {
        const usageResult = await trackPriceCheckUsage(state.listingInfo.title, state.listingInfo.currentPrice);
        if (!usageResult.success) {
          setHasReachedLimit(true);
          setState(prev => ({ 
            ...prev, 
            loading: false,
            error: usageResult.message || "Monthly price check limit reached"
          }));
          
          toast.error(usageResult.message || "Monthly price check limit reached", {
            description: "Upgrade to premium for unlimited price checks.",
            duration: 7000
          });
          return;
        }
      }
      
      if (state.testMode) {
        console.log('Test mode: Using mock price data');
        toast.info("Using test data for price analysis", { 
          description: "This is sample data for demonstration purposes.",
          duration: 5000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        const listingPrice = Math.max(state.listingInfo.currentPrice, 0.01);
        const isAuctionMode = !!state.listingInfo.isAuction;
        
        const mockDataAdjusted: PriceCheckResponse = {
          ...mockPriceCheckData,
          averagePrice: isAuctionMode ? listingPrice * 1.15 : listingPrice * 0.95,
          sampleSize: 10,
          dateRange: '2025-05-01 - 2025-05-12',
          source: 'Mock Data (Test Mode)',
          itemCount: 10,
          timestamp: new Date().toISOString(),
          priceHistory: [{ date: '2025-05-10', price: listingPrice * 0.95 }],
          priceRange: { min: listingPrice * 0.8, max: listingPrice * 1.2 },
          dataQuality: {
            confidence: 'low',
            sources: ['Mock Data'],
            warning: 'This is test data and does not reflect actual market values'
          }
        };
        console.log('Mock price data:', JSON.stringify(mockDataAdjusted, null, 2));
        setState(prev => ({
          ...prev,
          loading: false,
          priceData: mockDataAdjusted
        }));
        return mockDataAdjusted;
      }
      
      // Set up a timeout for the API call
      let timeoutId: number | undefined;
      const timeoutPromise = new Promise<PriceCheckResponse>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('API request timed out after ' + API_TIMEOUT_MS/1000 + ' seconds'));
        }, API_TIMEOUT_MS) as unknown as number;
      });

      // For real API calls (not test mode)
      const { title, itemSpecifics, condition, itemId } = state.listingInfo;
      const { searchTerm, model, brand } = extractItemSearchParams({ itemName: title, itemSpecifics, condition });
      console.log('Checking price with parameters:', JSON.stringify({ searchTerm, model, brand, condition, isPremium, itemId }, null, 2));
      
      try {
        // Race the API call against the timeout
        const apiPromise = getPriceCheck({
          itemName: searchTerm,
          model,
          brand,
          condition,
          premium: isPremium,
          itemId
        });
        
        const priceData = await Promise.race([apiPromise, timeoutPromise]);
        
        // Clear the timeout since we got a response
        if (timeoutId) clearTimeout(timeoutId);
        
        console.log('Price check response:', JSON.stringify(priceData, null, 2));

        // Show warning about data sources if needed
        if (priceData.dataQuality?.confidence === 'low' || priceData.dataQuality?.warning) {
          toast.warning(priceData.dataQuality?.warning || "Limited data available", {
            description: "The price analysis may not be fully accurate.",
            duration: 7000
          });
        }

        setState(prev => ({
          ...prev,
          loading: false,
          priceData,
          error: priceData.error || (priceData.itemCount === 0 ? 'No items found for the given criteria' : null),
          retryCount: priceData.error || priceData.itemCount === 0 ? prev.retryCount + 1 : 0
        }));

        if ((priceData.error || priceData.itemCount === 0) && state.retryCount < MAX_RETRIES) {
          console.log(`Retry ${state.retryCount + 1}/${MAX_RETRIES}: Simplifying search terms`);
          toast.info("Retrying with simpler search terms...");
          setTimeout(() => { performPriceCheck(); }, 1000);
        }
        
        return priceData;
      } catch (error) {
        // Clear the timeout if there was an error
        if (timeoutId) clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('Error in price check:', error);
      
      // Log detailed error info
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error(`Price check error details: ${errorMessage}`);
      
      // Show error toast
      toast.error("Price check failed", {
        description: errorMessage
      });
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        retryCount: prev.retryCount + 1
      }));
    }
  }, [isPremium, state, setState, setHasReachedLimit]);

  return { performPriceCheck };
}
