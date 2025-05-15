
// src/components/priceCheck/usePriceCheck.ts
import { useState, useEffect } from 'react';
import { getCurrentListing } from '@/utils/listing/listingUtils';
import { getPriceCheck } from '@/api/priceApiService';
import { ListingInfo, PriceCheckState, PriceCheckResponse } from './types/priceCheckTypes';
import { extractItemSearchParams } from '../../api/priceApiClient';
import {
  mockPriceCheckData,
  mockListingInfo,
  mockAuctionListingInfo,
  getMockDataForMode
} from './utils/mockData';
import { useModeContext } from '@/context/ModeContext';
import { toast } from '@/components/ui/sonner';

const MAX_RETRIES = 2;
const API_TIMEOUT_MS = 8000; // 8 seconds

export function usePriceCheck(isPremium: boolean) {
  const [state, setState] = useState<PriceCheckState>({
    loading: false,
    priceData: null,
    listingInfo: { title: '', currentPrice: 0 },
    loadingListingInfo: true,
    retryCount: 0,
    testMode: false,
    error: null
  });

  const { isAuctionMode } = useModeContext();

  useEffect(() => {
    console.log('usePriceCheck useEffect triggered, isAuctionMode:', isAuctionMode);
    async function fetchListingInfo() {
      console.log('fetchListingInfo called');
      setState(prev => ({ ...prev, loadingListingInfo: true }));
      try {
        const listingData = await getCurrentListing();
        console.log('Raw listing data from getCurrentListing:', JSON.stringify(listingData, null, 2));
        if (listingData && listingData.title && (listingData.price !== undefined || listingData.currentPrice !== undefined)) {
          console.log('Listing data valid, testMode: false');
          const currentPrice = listingData.currentPrice !== undefined ? listingData.currentPrice : listingData.price;
          const safePrice = Math.max(currentPrice || 0, 0.01);
          const listingInfo: ListingInfo = {
            title: listingData.title || '',
            currentPrice: safePrice,
            buyItNowPrice: listingData.buyItNowPrice,
            seller: listingData.seller,
            condition: listingData.condition,
            shipping: listingData.shipping,
            timeRemaining: listingData.timeRemaining || (listingData.listingType?.endTime),
            bids: listingData.bids || listingData.listingType?.bidsCount,
            isAuction: listingData.isAuction || (listingData.listingType?.isAuction),
            itemSpecifics: listingData.itemSpecifics,
            itemId: listingData.itemId,
            // Ensure we include both new and legacy fields for backward compatibility
            price: safePrice,
            listingType: {
              isAuction: listingData.isAuction || (listingData.listingType?.isAuction),
              bidsCount: listingData.bids || (listingData.listingType?.bidsCount),
              endTime: listingData.timeRemaining || (listingData.listingType?.endTime)
            }
          };
          setState(prev => ({
            ...prev,
            listingInfo,
            loadingListingInfo: false,
            testMode: false
          }));
        } else {
          console.log('No valid listing data, entering test mode');
          const mockData = isAuctionMode ? mockAuctionListingInfo : mockListingInfo;
          const safeMockData = {
            ...mockData,
            currentPrice: Math.max(mockData.currentPrice, 0.01),
            // Add legacy fields
            price: Math.max(mockData.currentPrice, 0.01),
            listingType: {
              isAuction: mockData.isAuction,
              bidsCount: mockData.bids,
              endTime: mockData.timeRemaining
            }
          };
          setState(prev => ({
            ...prev,
            listingInfo: safeMockData,
            loadingListingInfo: false,
            testMode: true
          }));
          
          // Only show this warning when we couldn't get real listing data
          toast.warning("No eBay listing detected. Using test mode with sample data.", {
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error fetching listing info:', error);
        const mockData = isAuctionMode ? mockAuctionListingInfo : mockListingInfo;
        const safeMockData = {
          ...mockData,
          currentPrice: Math.max(mockData.currentPrice, 0.01),
          // Add legacy fields
          price: Math.max(mockData.currentPrice, 0.01),
          listingType: {
            isAuction: mockData.isAuction,
            bidsCount: mockData.bids,
            endTime: mockData.timeRemaining
          }
        };
        setState(prev => ({
          ...prev,
          listingInfo: safeMockData,
          loadingListingInfo: false,
          testMode: true,
          error: error instanceof Error ? error.message : 'Failed to get listing information'
        }));
        
        // Show a toast error with the actual error message
        toast.error(`Failed to get listing information: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    fetchListingInfo();
  }, [isAuctionMode]);

  const handleCheckPrice = async () => {
    console.log('handleCheckPrice invoked');
    if (state.loading) {
      console.log('handleCheckPrice aborted: already loading');
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('handleCheckPrice called, testMode:', state.testMode);
      console.log('Current state:', JSON.stringify(state, null, 2));
      
      if (state.testMode) {
        console.log('Test mode: Using mock price data');
        toast.info("Using test data for price analysis", { 
          description: "This is sample data for demonstration purposes.",
          duration: 5000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        const listingPrice = Math.max(state.listingInfo.currentPrice, 0.01);
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
          setTimeout(() => { handleCheckPrice(); }, 1000);
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
      
      // NO automatic fallback to mock data - we want to be explicit about failures
      // The user can always try again or manually switch to test mode
    }
  };

  return {
    loading: state.loading,
    priceData: state.priceData,
    listingInfo: state.listingInfo,
    loadingListingInfo: state.loadingListingInfo,
    error: state.error,
    handleCheckPrice,
    testMode: state.testMode
  };
}
