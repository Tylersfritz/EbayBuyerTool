// src/components/priceCheck/usePriceCheck.ts
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

  useEffect(() => {
    async function fetchListingInfo() {
      setState(prev => ({ ...prev, loadingListingInfo: true }));

      try {
        const listingData = await getCurrentListing();

        if (listingData && listingData.title && listingData.price !== undefined) {
          console.log('Listing data received:', listingData);

          const safePrice = Math.max(listingData.price || 0, 0.01);

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
            testMode: false
          }));
        } else {
          console.log('No listing data available, entering test mode');

          const mockData = isAuctionMode ? mockAuctionListingInfo : mockListingInfo;

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

        const mockData = isAuctionMode ? mockAuctionListingInfo : mockListingInfo;

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
  }, [isAuctionMode]);

  const handleCheckPrice = async () => {
    if (state.loading) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (state.testMode) {
        console.log('Test mode: Using mock price data');
        await new Promise(resolve => setTimeout(resolve, 1500));
        const listingPrice = Math.max(state.listingInfo.currentPrice, 0.01);
        const mockDataAdjusted = {
          ...mockPriceCheckData,
          averagePrice: isAuctionMode ? listingPrice * 1.15 : listingPrice * 0.95,
          sampleSize: 10,
          dateRange: '2025-05-01 - 2025-05-12',
          source: 'Mock Data',
          itemCount: 10,
          timestamp: new Date().toISOString(),
          priceHistory: [{ date: '2025-05-10', price: listingPrice * 0.95 }]
        };
        console.log('Mock price data:', mockDataAdjusted);
        setState(prev => ({
          ...prev,
          loading: false,
          priceData: mockDataAdjusted
        }));
        return mockDataAdjusted;
      }

      const { title, itemSpecifics, condition } = state.listingInfo;
      const { searchTerm, model, brand } = extractItemSearchParams({ itemName: title, itemSpecifics, condition });

      console.log('Checking price with parameters:', {
        searchTerm, model, brand, condition, isPremium
      });

      const priceData = await getPriceCheck({
        itemName: searchTerm,
        model,
        brand,
        condition,
        premium: isPremium
      });

      setState(prev => ({
        ...prev,
        loading: false,
        priceData,
        error: priceData.error || (priceData.itemCount === 0 ? 'No items found for the given criteria' : null),
        retryCount: priceData.error || priceData.itemCount === 0 ? prev.retryCount + 1 : 0
      }));

      if (priceData.error && state.retryCount < MAX_RETRIES) {
        console.log(`Retry ${state.retryCount + 1}/${MAX_RETRIES}: Simplifying search terms`);
        setTimeout(() => { handleCheckPrice(); }, 1000);
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