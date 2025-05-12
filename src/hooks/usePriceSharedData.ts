
import { useState, useEffect } from 'react';
import { getFromStorage, saveToStorage } from '@/utils/storage/storageUtils';
import { PriceCheckResponse } from '@/api/priceApiService';
import { ListingInfo } from '@/components/priceCheck/types/priceCheckTypes';
import { useModeContext } from '@/context/ModeContext';

export interface SharedPriceData {
  priceData: PriceCheckResponse | null;
  listingInfo: ListingInfo;
  lastChecked: string; // ISO timestamp
}

export function usePriceSharedData() {
  const [sharedData, setSharedData] = useState<SharedPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchesRemaining, setSearchesRemaining] = useState<number>(10);
  const { isAuctionMode } = useModeContext();
  
  // Load the shared price data and search count
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Get the shared price data
        const data = await getFromStorage<SharedPriceData>('sharedPriceData');
        setSharedData(data);
        
        // Get search count for free searches tracking
        const searchCount = await getFromStorage<number>('priceCheckSearchCount') || 0;
        const FREE_SEARCH_LIMIT = 10;
        setSearchesRemaining(Math.max(0, FREE_SEARCH_LIMIT - searchCount));
      } catch (error) {
        console.error('Error loading shared price data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isAuctionMode]); // Reload data when mode changes
  
  // Save updated price data
  const savePriceData = async (data: SharedPriceData) => {
    try {
      await saveToStorage('sharedPriceData', data);
      setSharedData(data);
    } catch (error) {
      console.error('Error saving shared price data:', error);
    }
  };
  
  // Check if price data is recent (within the last hour)
  const isPriceDataRecent = (): boolean => {
    if (!sharedData?.lastChecked) return false;
    
    const lastCheckedTime = new Date(sharedData.lastChecked).getTime();
    const currentTime = new Date().getTime();
    const oneHourMs = 60 * 60 * 1000;
    
    return (currentTime - lastCheckedTime) < oneHourMs;
  };
  
  return {
    sharedData,
    savePriceData,
    loading,
    searchesRemaining,
    isPriceDataRecent
  };
}
