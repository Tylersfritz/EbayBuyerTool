
import { useState, useEffect } from 'react';
import { getCurrentListing } from '@/utils/listing/listingUtils';
import { shouldUseAuctionMockData } from '@/utils/mock/mockModeUtils';
import { getPriceCheck, PriceCheckResponse } from '@/api/priceApiService';
import { ListingInfo, PriceCheckState } from './types/priceCheckTypes';
import { extractItemSearchParams } from '../../api/priceApiClient'; // Relative path
import {
  mockPriceCheckData,
  mockListingInfo,
  mockAuctionListingInfo,
  getMockDataForMode
} from './utils/mockData';
import { useModeContext } from '@/context/ModeContext';

// Maximum number of automatic retries
const MAX_RETRIES = 2;

export function usePriceCheck(isPremium: boolean) {
  const [state, setState] = useState<PriceCheckState>({
    loading: false,
    priceData: null,
    listingInfo: { 
      title: '',
      currentPrice: 0
    },
    loadingListingInfo: true,
    retryCount: 0,
    testMode: false,
    error: null
  });
  
  const { isAuctionMode } = useModeContext();
  
  // Effect to fetch listing information when component mounts or auction mode changes
  useEffect(() => {
    async function fetchListingInfo() {
      setState(prev => ({ ...prev, loadingListingInfo: true }));
      
      try {
        // Get listing information from the current page via the content script
        const listingData = await getCurrentListing();
        
        if (listingData && listingData.title && listingData.price !== undefined) {
          console.log('Listing data received:', listingData);
          
          // Make sure price is never zero or negative
          const safePrice = Math.max(listingData.price || 0, 0.01);
          
          // Format listing info from the data received
          const listingInfo: ListingInfo = {
            title: listingData.title || '',
            currentPrice: safePrice,
            buyItNowPrice: listingData.buyItNowPrice,
            seller: listingData.seller,
            condition: listingData.condition,
            shipping: listingData.shipping,
            timeRemaining: listingData.listingType?.endTime,
            bids: listingData.listingType?.bidsCount,
            isAuction: listingData.listingType?.isAuction || listingData.isAuction,
            itemSpecifics: listingData.itemSpecifics,
            itemId: listingData.itemId
          };
          
          setState(prev => ({ 
            ...prev, 
            listingInfo,
            loadingListingInfo: false,
            // Set testMode to false when we have real listing data
            testMode: false
          }));
        } else {
          // If no listing data, enter test mode with mock data
          console.log('No listing data available, entering test mode');
          
          // Choose mock data based on auction mode from context
          const mockData = isAuctionMode ? mockAuctionListingInfo : mockListingInfo;
          
          // Ensure the mock data has a valid price (never zero or negative)
          const safeMockData = {
            ...mockData,
            currentPrice: Math.max(mockData.currentPrice, 0.01)
          };
          
          setState(prev => ({ 
            ...prev, 
            listingInfo: safeMockData,
            loadingListingInfo: false,
            testMode: true
          }));
        }
      } catch (error) {
        console.error('Error fetching listing info:', error);
        
        // Enter test mode if we can't get listing info
        // Choose mock data based on auction mode from context
        const mockData = isAuctionMode ? mockAuctionListingInfo : mockListingInfo;
        
        // Ensure the mock data has a valid price (never zero or negative)
        const safeMockData = {
          ...mockData,
          currentPrice: Math.max(mockData.currentPrice, 0.01)
        };
        
        setState(prev => ({ 
          ...prev, 
          listingInfo: safeMockData,
          loadingListingInfo: false,
          testMode: true,
          error: error instanceof Error ? error.message : 'Failed to get listing information'
        }));
      }
    }
    
    fetchListingInfo();
  }, [isAuctionMode]); // Re-fetch when auction mode changes
  
  // Function to check price based on the current listing info
  const handleCheckPrice = async () => {
    if (state.loading) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      if (state.testMode) {
        // In test mode, simulate API delay and return mock data
        console.log('Test mode: Using mock price data');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Ensure the mock price data is scaled relative to the current listing price
        const listingPrice = Math.max(state.listingInfo.currentPrice, 0.01);
        const mockDataAdjusted = {
          ...mockPriceCheckData,
          // Scale the average price to be related to the listing price for more realistic comparisons
          averagePrice: isAuctionMode 
            ? listingPrice * 1.15  // Auctions typically sell below market value
            : listingPrice * 0.95  // Fixed price often slightly above market
        };
        
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          priceData: mockDataAdjusted
        }));
        return mockDataAdjusted;
      }
      
      // Extract parameters from the listing info for the search
      const { title, itemSpecifics, condition } = state.listingInfo;
      const { searchTerm, model, brand } = extractItemSearchParams(title, itemSpecifics);
      
      console.log('Checking price with parameters:', { 
        searchTerm, model, brand, condition,
        isPremium 
      });
      
      // Call the price check API with the extracted parameters
      const priceData = await getPriceCheck({ 
        itemName: searchTerm, 
        model, 
        brand, 
        condition,
        premium: isPremium // Pass the premium flag
      });
      
      // Update state with the price data
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        priceData,
        error: priceData.error || null,
        retryCount: priceData.error ? prev.retryCount + 1 : 0
      }));
      
      // If there was an error and we haven't hit retry limit, try with simpler search
      if (priceData.error && state.retryCount < MAX_RETRIES) {
        console.log(`Retry ${state.retryCount + 1}/${MAX_RETRIES}: Simplifying search terms`);
        
        // Simplified retry logic
        setTimeout(() => {
          handleCheckPrice();
        }, 1000);
      }
      
      return priceData;
    } catch (error) {
      console.error('Error in price check:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        retryCount: prev.retryCount + 1
      }));
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
