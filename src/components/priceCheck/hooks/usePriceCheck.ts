
// src/components/priceCheck/hooks/usePriceCheck.ts
import { useState, useEffect } from 'react';
import { ListingInfo, PriceCheckState, PriceCheckResponse } from '../types/priceCheckTypes';
import { useModeContext } from '@/context/ModeContext';
import { toast } from '@/components/ui/sonner';
import { usePriceCheckAPI } from './usePriceCheckAPI';
import { useListingInfo } from './useListingInfo';
import { hasReachedPriceCheckLimit } from '@/utils/premium/premiumUtils';

/**
 * Main hook for the Price Check feature
 */
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
  const [hasReachedLimit, setHasReachedLimit] = useState<boolean>(false);
  
  const { isAuctionMode } = useModeContext();
  const { fetchListingInfo } = useListingInfo(setState);
  const { performPriceCheck } = usePriceCheckAPI(isPremium, state, setState, setHasReachedLimit);
  
  // Check usage limits on load
  useEffect(() => {
    const checkUsageLimit = async () => {
      if (!isPremium) {
        const limitReached = await hasReachedPriceCheckLimit();
        setHasReachedLimit(limitReached);
        if (limitReached) {
          console.log('User has reached the free tier price check limit');
        }
      }
    };
    
    checkUsageLimit();
  }, [isPremium]);

  // Fetch listing information when component mounts or auction mode changes
  useEffect(() => {
    console.log('usePriceCheck useEffect triggered, isAuctionMode:', isAuctionMode);
    fetchListingInfo(isAuctionMode);
  }, [isAuctionMode, fetchListingInfo]);

  // Handler for checking prices
  const handleCheckPrice = async () => {
    if (hasReachedLimit && !isPremium) {
      toast.error("Monthly price check limit reached", {
        description: "Upgrade to premium for unlimited price checks.",
        duration: 7000
      });
      return;
    }
    
    return performPriceCheck();
  };

  return {
    loading: state.loading,
    priceData: state.priceData,
    listingInfo: state.listingInfo,
    loadingListingInfo: state.loadingListingInfo,
    error: state.error,
    handleCheckPrice,
    testMode: state.testMode,
    hasReachedLimit
  };
}
