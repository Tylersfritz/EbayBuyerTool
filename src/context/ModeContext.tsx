
import React, { createContext, useContext, useState, useEffect } from 'react';
import { shouldUseAuctionMockData, toggleMockListingType } from '@/utils/mock/mockModeUtils';
import { toast } from "@/components/ui/sonner";

interface ModeContextType {
  isAuctionMode: boolean;
  toggleMode: () => void;
  isLoading: boolean;
  modeName: string;
  modeDescription: string;
}

const ModeContext = createContext<ModeContextType>({
  isAuctionMode: false,
  toggleMode: () => {},
  isLoading: false,
  modeName: "Fixed Price",
  modeDescription: "Testing with fixed price listings"
});

export const useModeContext = () => useContext(ModeContext);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuctionMode, setIsAuctionMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load auction mode preference on mount
  useEffect(() => {
    try {
      const useAuctionMock = shouldUseAuctionMockData();
      setIsAuctionMode(useAuctionMock);
    } catch (error) {
      console.error('Error loading auction mode preference:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleMode = () => {
    try {
      setIsLoading(true);
      // Use the existing utility but intercept the value
      const newValue = toggleMockListingType();
      setIsAuctionMode(newValue);
      
      // Show toast notification about the mode change
      toast.success(`Switched to ${newValue ? 'Auction' : 'Fixed Price'} test mode`);
    } catch (error) {
      console.error('Error toggling mode:', error);
      toast.error('Failed to toggle mode. Please try again.');
    } finally {
      // Short timeout to allow state updates to propagate
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  // Generate descriptive names and descriptions based on the current mode
  const modeName = isAuctionMode ? "Auction" : "Fixed Price";
  const modeDescription = isAuctionMode 
    ? "Testing with auction listings with bids and time remaining" 
    : "Testing with fixed price buy-it-now listings";

  return (
    <ModeContext.Provider value={{ 
      isAuctionMode, 
      toggleMode, 
      isLoading,
      modeName,
      modeDescription
    }}>
      {children}
    </ModeContext.Provider>
  );
};
