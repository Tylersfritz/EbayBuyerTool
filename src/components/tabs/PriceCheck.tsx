import React, { useState, useEffect } from 'react';
import CurrentListingCard from "@/components/priceCheck/CurrentListingCard";
import PriceAnalysisCard from "@/components/priceCheck/PriceAnalysisCard";
import PremiumFeaturesCard from "@/components/priceCheck/PremiumFeaturesCard";
import PriceHistoryChart from "@/components/priceCheck/PriceHistoryChart";
import ConditionValueAnalysis from "@/components/priceCheck/ConditionValueAnalysis";
import ActionButtons from "@/components/priceCheck/ActionButtons";
import EnhancedAffiliateButton from "@/components/priceCheck/EnhancedAffiliateButton";
import { usePriceCheck } from "@/components/priceCheck/usePriceCheck";
import ErrorBoundary from "@/components/ErrorBoundary";
import { toast } from "@/components/ui/sonner";
import { calculatePriceDifference } from "@/utils/pricing/pricingUtils";
import { saveToStorage, getFromStorage } from "@/utils/storage/storageUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Share, Scan } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePriceSharedData } from "@/hooks/usePriceSharedData";
import { mockPriceHistoryData, mockAuctionPriceHistoryData, mockConditionData } from "@/components/priceCheck/utils/mockData";
import { useModeContext } from '@/context/ModeContext';
import PremiumVisualScanner from "../visualScanner/PremiumVisualScanner";
import { ScanResult } from "../visualScanner/VisualScanner";

interface PriceCheckProps {
  isPremium: boolean;
}

const FREE_SEARCH_LIMIT = 10;

const PriceCheckContent: React.FC<PriceCheckProps> = ({ isPremium }) => {
  
  const {
    loading,
    priceData,
    listingInfo,
    loadingListingInfo,
    handleCheckPrice,
    error,
    testMode
  } = usePriceCheck(isPremium);
  
  const [searchesRemaining, setSearchesRemaining] = useState<number>(FREE_SEARCH_LIMIT);
  const { savePriceData } = usePriceSharedData();
  const { isAuctionMode } = useModeContext();
  const [isVisualScannerOpen, setIsVisualScannerOpen] = useState(false);
  
  useEffect(() => {
    if (priceData && listingInfo.title) {
      // Save the data to the shared context for other tabs to use
      savePriceData({
        priceData,
        listingInfo,
        lastChecked: new Date().toISOString()
      });
    }
  }, [priceData, listingInfo, savePriceData]);
  
  useEffect(() => {
    // Load the number of searches used
    const loadSearchCount = async () => {
      if (!isPremium) {
        const searchCount = await getFromStorage<number>('priceCheckSearchCount') || 0;
        setSearchesRemaining(Math.max(0, FREE_SEARCH_LIMIT - searchCount));
      }
    };
    
    loadSearchCount();
  }, [isPremium]);
  
  // Override the handleCheckPrice function to track usage for free users
  const handleCheckPriceWithLimit = async () => {
    if (!isPremium && searchesRemaining <= 0) {
      toast.error("You've reached your free search limit. Upgrade to Premium for unlimited searches.");
      return;
    }
    
    const result = await handleCheckPrice();
    
    // If search was successful and user is not premium, update the search count
    if (!isPremium && result !== undefined) {
      const currentCount = await getFromStorage<number>('priceCheckSearchCount') || 0;
      const newCount = currentCount + 1;
      await saveToStorage('priceCheckSearchCount', newCount);
      setSearchesRemaining(Math.max(0, FREE_SEARCH_LIMIT - newCount));
    }
    
    return result;
  };

  // Handle scan completion
  const handleScanComplete = (scanResult: ScanResult) => {
    // Here we would use the scan result to search for the product
    toast.success("Image scanned successfully!");
    console.log("Scan result:", scanResult);
    
    // Close the scanner
    setIsVisualScannerOpen(false);
    
    // In a real implementation, you would use the scan data to trigger a price check
    // For now, we'll just show a toast with the mock data
    setTimeout(() => {
      toast.info(`Found product: ${scanResult.title}`);
    }, 500);
  };
  
  // Show a toast if there's an authentication error
  React.useEffect(() => {
    if (error && /auth|token|credentials|unauthorized/i.test(error)) {
      toast.error("API authentication failed. Please check eBay API credentials in the server settings.");
    }
  }, [error]);
  
  // Calculate estimated new price for the item
  const getEstimatedNewPrice = () => {
    if (!priceData || priceData.averagePrice <= 0) return undefined;
    
    // Start with the average price 
    let newPriceEstimate = priceData.averagePrice;
    
    // Add premium for new condition (25-40% higher than used average)
    const isUsedItem = listingInfo.condition && 
                       /used|pre-owned|refurbished/i.test(listingInfo.condition);
    
    if (isUsedItem) {
      newPriceEstimate = newPriceEstimate * 1.35; // 35% premium for new vs used
    }
    
    return newPriceEstimate;
  };
  
  // Select the appropriate mock data based on auction mode
  const getMockHistoryData = () => {
    return isAuctionMode ? mockAuctionPriceHistoryData : mockPriceHistoryData;
  };
  
  // Add CSS class based on listing type
  const getTabContentClass = () => {
    return `flex-1 p-3 py-2 overflow-y-auto ${listingInfo.isAuction ? 'auction-tab-content' : 'fixed-price-tab-content'}`;
  };
  
  return (
    <div className="flex flex-col space-y-2">
      {/* Free user search limit indicator */}
      {!isPremium && (
        <Alert variant="premium" className="mb-1 py-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              <AlertDescription className="text-xs">
                Free version limited to {FREE_SEARCH_LIMIT} searches
              </AlertDescription>
            </div>
            <Badge variant="premium" className="ml-2">
              {searchesRemaining} left
            </Badge>
          </div>
        </Alert>
      )}

      {/* Visual Scanner Button */}
      <div className="flex justify-end mb-1">
        <Button
          size="sm"
          variant={isPremium ? "premium" : "outline"}
          className="text-xs flex items-center"
          onClick={() => setIsVisualScannerOpen(true)}
        >
          <Scan className="h-3.5 w-3.5 mr-1.5" />
          Image Scanner
          {!isPremium && <Badge variant="premium" className="ml-1.5 text-[0.6rem] h-4">PRO</Badge>}
        </Button>
      </div>

      {/* Visual Scanner Modal */}
      <PremiumVisualScanner
        isPremium={isPremium}
        onScanComplete={handleScanComplete}
        onClose={() => setIsVisualScannerOpen(false)}
        isOpen={isVisualScannerOpen}
      />
      
      {/* Current Listing Card */}
      <CurrentListingCard
        listingInfo={listingInfo}
        loadingListingInfo={loadingListingInfo}
      />
      
      {/* Premium Feature: Price History Chart */}
      {isPremium && (
        <PriceHistoryChart
          data={getMockHistoryData()} // Pass the appropriate mock data based on mode
          loading={loading}
          isPremium={isPremium}
          currentPrice={listingInfo.currentPrice || 0.01} // Ensure there's always a valid price
        />
      )}
      
      {/* Price Analysis Card */}
      <PriceAnalysisCard
        loading={loading}
        priceData={priceData}
        listingPrice={listingInfo.currentPrice || 0.01} // Ensure there's always a valid price
        onCheckPrice={handleCheckPriceWithLimit}
        error={error}
        isAuction={listingInfo.isAuction}
        bids={listingInfo.bids}
        timeRemaining={listingInfo.timeRemaining}
      />
      
      {/* Data sharing notification for successfully checked prices */}
      {priceData && priceData.averagePrice > 0 && !loading && (
        <div className="text-xs text-blue-600 flex items-center p-1">
          <Share className="h-3 w-3 mr-1" />
          <span>Price data available in Negotiator tab</span>
        </div>
      )}
      
      {/* Condition Value Analysis */}
      {priceData && priceData.averagePrice > 0 && !loading && (
        <ConditionValueAnalysis
          loading={loading}
          currentCondition={listingInfo.condition || 'Used'}
          currentPrice={listingInfo.currentPrice || 0.01} // Ensure there's always a valid price
          conditionData={mockConditionData} // Pass the mock condition data
        />
      )}
      
      {/* Premium Features Card */}
      <PremiumFeaturesCard
        isPremium={isPremium}
        priceData={priceData}
      />
      
      {/* Enhanced Affiliate Button */}
      <EnhancedAffiliateButton
        productName={listingInfo.title}
        currentPrice={listingInfo.currentPrice || 0.01} // Ensure there's always a valid price
        suggestedNewPrice={getEstimatedNewPrice()}
        condition={listingInfo.condition}
        className="bg-blue-600 hover:bg-blue-700 text-xs py-1 h-9 font-medium"
      />
      
      {/* Action Buttons */}
      <ActionButtons
        loading={loading}
        onCheckPrice={handleCheckPriceWithLimit}
        productTitle={listingInfo.title}
        itemId={listingInfo.itemId}
        searchesRemaining={!isPremium ? searchesRemaining : undefined}
      />
    </div>
  );
};

const PriceCheck: React.FC<PriceCheckProps> = ({ isPremium }) => {
  return (
    <ErrorBoundary>
      <PriceCheckContent isPremium={isPremium} />
    </ErrorBoundary>
  );
};

export default PriceCheck;
