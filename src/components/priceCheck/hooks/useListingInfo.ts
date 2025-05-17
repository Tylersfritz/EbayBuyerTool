
// src/components/priceCheck/hooks/useListingInfo.ts
import { useState, useCallback } from 'react';
import { getCurrentListing } from '@/utils/listing/listingUtils';
import { ListingInfo, PriceCheckState } from '../types/priceCheckTypes';
import { toast } from '@/components/ui/sonner';
import { mockAuctionListingInfo, mockListingInfo } from '../utils/mockData';

/**
 * Hook for fetching and managing listing information
 */
export function useListingInfo(
  setState: React.Dispatch<React.SetStateAction<PriceCheckState>>
) {
  // Fetch listing information from the current page
  const fetchListingInfo = useCallback(async (isAuctionMode: boolean) => {
    console.log('fetchListingInfo called');
    setState(prev => ({ ...prev, loadingListingInfo: true }));
    try {
      const listingData = await getCurrentListing();
      console.log('Raw listing data from getCurrentListing:', JSON.stringify(listingData, null, 2));
      
      if (listingData && listingData.title && (listingData.currentPrice !== undefined || listingData.price !== undefined)) {
        console.log('Listing data valid, testMode: false');
        // Handle both currentPrice and legacy price field
        const price = listingData.currentPrice !== undefined 
          ? listingData.currentPrice 
          : (typeof listingData.price === 'number' ? listingData.price : 0);
        const safePrice = Math.max(price || 0, 0.01);
        const listingInfo: ListingInfo = {
          title: listingData.title || '',
          currentPrice: safePrice,
          price: safePrice, // Add legacy price field for backward compatibility
          buyItNowPrice: listingData.buyItNowPrice,
          seller: listingData.seller,
          condition: listingData.condition,
          shipping: listingData.shipping,
          timeRemaining: listingData.timeRemaining || (listingData.listingType?.endTime),
          bids: listingData.bids || listingData.listingType?.bidsCount,
          isAuction: listingData.isAuction || (listingData.listingType?.isAuction),
          itemSpecifics: listingData.itemSpecifics,
          itemId: listingData.itemId,
          platform: listingData.platform,
          itemUrl: listingData.itemUrl,
          // Ensure we include both new and legacy fields for backward compatibility
          listingType: {
            isAuction: listingData.isAuction || (listingData.listingType?.isAuction),
            bidsCount: listingData.bids || (listingData.listingType?.bidsCount),
            endTime: listingData.timeRemaining || (listingData.listingType?.endTime),
            hasBuyItNow: listingData.buyItNowPrice !== undefined
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
        setMockListingData(isAuctionMode, setState);
      }
    } catch (error) {
      console.error('Error fetching listing info:', error);
      setMockListingData(isAuctionMode, setState);
      
      // Show a toast error with the actual error message
      toast.error(`Failed to get listing information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [setState]);

  return { fetchListingInfo };
}

// Helper function to set mock listing data when real data is unavailable
function setMockListingData(isAuctionMode: boolean, setState: React.Dispatch<React.SetStateAction<PriceCheckState>>) {
  const mockData = isAuctionMode ? mockAuctionListingInfo : mockListingInfo;
  // Ensure all numeric fields are actually numbers
  const currentPrice = typeof mockData.currentPrice === 'number' ? mockData.currentPrice : parseFloat(String(mockData.currentPrice)) || 0.01;
  const safeMockData: ListingInfo = {
    ...mockData,
    currentPrice: Math.max(currentPrice, 0.01),
    price: Math.max(currentPrice, 0.01), // Legacy field
    listingType: {
      isAuction: mockData.isAuction,
      bidsCount: mockData.bids,
      endTime: mockData.timeRemaining,
      hasBuyItNow: mockData.buyItNowPrice !== undefined
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
