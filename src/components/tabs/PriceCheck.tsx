
import React, { useState, useEffect } from 'react';
import CurrentListingCard from "@/components/priceCheck/CurrentListingCard";
import PriceAnalysisCard from "@/components/priceCheck/PriceAnalysisCard";
import PremiumFeaturesCard from "@/components/priceCheck/PremiumFeaturesCard";
import PriceHistoryChart from "@/components/priceCheck/PriceHistoryChart";
import ConditionValueAnalysis from "@/components/priceCheck/ConditionValueAnalysis";
import ActionButtons from "@/components/priceCheck/ActionButtons";
import EnhancedAffiliateButton from "@/components/priceCheck/EnhancedAffiliateButton";
import BidEdgePromo from "@/components/priceCheck/BidEdgePromo";
import ArbitrageAlertPromo from "@/components/priceCheck/ArbitrageAlertPromo";
import { usePriceCheck } from "@/components/priceCheck/hooks/usePriceCheck";
import ErrorBoundary from "@/components/ErrorBoundary";
import { toast } from "@/components/ui/sonner";
import { calculatePriceDifference } from "@/utils/pricing/pricingUtils";
import { usePriceSharedData } from "@/hooks/usePriceSharedData";
import { mockPriceHistoryData, mockAuctionPriceHistoryData, mockConditionData } from "@/components/priceCheck/utils/mockData";
import { useModeContext } from '@/context/ModeContext';
import PremiumVisualScanner from "../visualScanner/PremiumVisualScanner";
import { ScanResult } from "../visualScanner/VisualScanner";
import PromotionAlert from "../priceCheck/PromotionAlert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, Share } from "lucide-react";

interface PriceCheckProps {
  isPremium: boolean;
  onTabChange?: (tabName: string) => void; // New prop for tab navigation
}

const PriceCheckContent: React.FC<PriceCheckProps> = ({ isPremium, onTabChange }) => {
  
  const {
    loading,
    priceData,
    listingInfo,
    loadingListingInfo,
    handleCheckPrice,
    error,
    testMode,
    hasReachedLimit
  } = usePriceCheck(isPremium);
  
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

  // Navigate to other tabs
  const handleNavigateToBidEdge = () => {
    if (onTabChange) {
      onTabChange("bidedge");
      toast.info("Opening auction in BidEdge...");
    }
  };

  const handleNavigateToArbitrage = () => {
    if (onTabChange) {
      onTabChange("arbitrage");
      toast.info("Opening Arbitrage Finder...");
    }
  };
  
  return (
    <div className="flex flex-col space-y-1">
      {/* Combine usage indicator and scanner button in one row */}
      <div className="flex items-center justify-between mb-1">
        {!isPremium && (
          <div className="flex-grow mr-2">
            <PromotionAlert isPremium={isPremium} displayInline={true} />
          </div>
        )}
        
        <Button
          size="sm"
          variant={isPremium ? "premium" : "outline"}
          className="text-xs flex items-center whitespace-nowrap"
          onClick={() => setIsVisualScannerOpen(true)}
        >
          <Scan className="h-3.5 w-3.5 mr-1" />
          Image Scanner
          {!isPremium && <Badge variant="premium" className="ml-1 text-[0.6rem] h-4">PRO</Badge>}
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
      
      {/* Premium Feature: Price History Chart with reduced margin */}
      {isPremium && (
        <PriceHistoryChart
          data={getMockHistoryData()}
          loading={loading}
          isPremium={isPremium}
          currentPrice={listingInfo.currentPrice || 0.01}
        />
      )}
      
      {/* Price Analysis Card with reduced margin */}
      <PriceAnalysisCard
        loading={loading}
        priceData={priceData}
        listingPrice={listingInfo.currentPrice || 0.01}
        onCheckPrice={handleCheckPrice}
        error={error}
        isAuction={listingInfo.isAuction}
        bids={listingInfo.bids}
        timeRemaining={listingInfo.timeRemaining}
      />

      {/* Promo cards in a compact layout */}
      <div className="space-y-1">
        {/* BidEdge Promo Component - only for auctions */}
        {listingInfo.isAuction && (
          <BidEdgePromo
            isPremium={isPremium}
            isAuction={listingInfo.isAuction}
            bids={listingInfo.bids}
            timeRemaining={listingInfo.timeRemaining}
            onButtonClick={handleNavigateToBidEdge}
          />
        )}
        
        {/* Arbitrage Alert Promo - only when there's price data showing potential profit */}
        {priceData && priceData.averagePrice > 0 && !loading && (
          <ArbitrageAlertPromo
            isPremium={isPremium}
            currentPrice={listingInfo.currentPrice || 0}
            averagePrice={priceData.averagePrice}
            onButtonClick={handleNavigateToArbitrage}
          />
        )}
      </div>
      
      {/* Data sharing notification for successfully checked prices - more compact */}
      {priceData && priceData.averagePrice > 0 && !loading && (
        <div className="text-xs text-blue-600 flex items-center">
          <Share className="h-3 w-3 mr-1" />
          <span>Price data available in Negotiator tab</span>
        </div>
      )}
      
      {/* Condition Value Analysis */}
      {priceData && priceData.averagePrice > 0 && !loading && (
        <ConditionValueAnalysis
          loading={loading}
          currentCondition={listingInfo.condition || 'Used'}
          currentPrice={listingInfo.currentPrice || 0.01}
          conditionData={mockConditionData}
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
        currentPrice={listingInfo.currentPrice || 0.01}
        suggestedNewPrice={getEstimatedNewPrice()}
        condition={listingInfo.condition}
        className="bg-blue-600 hover:bg-blue-700 text-xs py-1 h-9 font-medium"
      />
      
      {/* Action Buttons */}
      <ActionButtons
        loading={loading}
        onCheckPrice={handleCheckPrice}
        productTitle={listingInfo.title}
        itemId={listingInfo.itemId}
        hasReachedLimit={hasReachedLimit && !isPremium}
      />
    </div>
  );
};

const PriceCheck: React.FC<PriceCheckProps> = (props) => {
  return (
    <ErrorBoundary>
      <PriceCheckContent {...props} />
    </ErrorBoundary>
  );
};

export default PriceCheck;
