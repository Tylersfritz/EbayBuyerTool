
import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { calculatePriceDifference } from "@/utils/extensionUtils";
import { Gavel, Tag, AlertTriangle, ThumbsUp, TrendingDown } from "lucide-react";

interface NegotiationSliderProps {
  isAuction: boolean;
  listingInfo: {
    currentPrice: number;
    buyItNowPrice?: number;
  };
  marketData: {
    averagePrice: number;
  } | null;
  value: number[];
  onValueChange: (value: number[]) => void;
  isPremium: boolean;
}

const NegotiationSliderProps: React.FC<NegotiationSliderProps> = ({
  isAuction,
  listingInfo,
  marketData,
  value,
  onValueChange,
  isPremium
}) => {
  const marketPrice = marketData?.averagePrice || 0;
  const currentPrice = listingInfo.currentPrice;
  
  // Calculate the recommended values based on listing type
  const getRecommendedValue = (): number => {
    if (!marketPrice) return isAuction ? -5 : 5; // Default values
    
    if (isAuction) {
      // For auctions, recommend bidding slightly below market value
      return -5;
    } else {
      // For fixed-price listings, calculate based on price difference
      const priceDifference = calculatePriceDifference(currentPrice, marketPrice);
      
      // Already a good deal (below market avg)
      if (priceDifference < -10) return 3; 
      
      // Slightly overpriced (0-15% above market)
      if (priceDifference >= 0 && priceDifference < 15) return 8;
      
      // Significantly overpriced (15%+ above market)
      if (priceDifference >= 15) return 12;
      
      // Default for other cases
      return 5;
    }
  };
  
  // Get the relative position of the current bid to market value (for auctions)
  const getCurrentBidPercentage = (): number => {
    if (!marketPrice) return 0;
    return Math.round((currentPrice / marketPrice - 1) * 100);
  };
  
  // Get color based on value relative to market
  const getValueColor = (percentage: number): string => {
    if (percentage < -10) return "text-green-600"; // Good deal
    if (percentage < 0) return "text-green-500";   // Slightly good
    if (percentage < 5) return "text-amber-500";   // Fair price
    return "text-red-500";                         // Above market
  };
  
  // Calculate actual value based on slider value and listing type
  const calculateActualValue = (): number => {
    if (isAuction) {
      // For auctions, calculate as percentage of market value
      return marketPrice ? marketPrice * (1 + value[0] / 100) : currentPrice;
    } else {
      // For fixed-price, calculate as discount from listing price
      return currentPrice * (1 - value[0] / 100);
    }
  };
  
  // Format the target price for display
  const getTargetPrice = (): string => {
    return calculateActualValue().toFixed(2);
  };
  
  // Calculate percentage relative to market
  const getPercentageToMarket = (): number => {
    if (!marketPrice) return 0;
    const actualValue = calculateActualValue();
    return Math.round(((actualValue / marketPrice) - 1) * 100);
  };
  
  // Get the appropriate label for the slider based on listing type
  const getSliderLabel = (): string => {
    return isAuction ? "Market Value Target:" : "Discount Target:";
  };
  
  // Get the display text for the value
  const getValueDisplay = (): string => {
    if (isAuction) {
      const percentToMarket = getPercentageToMarket();
      const sign = percentToMarket > 0 ? '+' : '';
      return `${sign}${percentToMarket}% of market`;
    } else {
      return `${value[0]}% off`;
    }
  };
  
  // Get target price message
  const getTargetPriceMessage = () => {
    if (!marketPrice) return null;
    
    const percentToMarket = getPercentageToMarket();
    
    if (percentToMarket < -15) {
      return {
        text: "Very aggressive offer",
        color: "text-amber-600",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      };
    } else if (percentToMarket < -5) {
      return {
        text: "Strong offer",
        color: "text-green-600",
        icon: <ThumbsUp className="h-3 w-3 mr-1" />
      };
    } else if (percentToMarket < 5) {
      return {
        text: "Fair market offer",
        color: "text-blue-600",
        icon: <TrendingDown className="h-3 w-3 mr-1" />
      };
    } else {
      return {
        text: "Above market average",
        color: "text-gray-600",
        icon: null
      };
    }
  };
  
  const targetPriceMessage = getTargetPriceMessage();
  const currentBidPercentage = getCurrentBidPercentage();
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium flex items-center">
          {isAuction ? (
            <>
              <Gavel className="h-4 w-4 mr-1 text-amber-500" />
              Auction Bid Strategy:
            </>
          ) : (
            <>
              <Tag className="h-4 w-4 mr-1 text-blue-500" />
              Discount Target:
            </>
          )}
        </span>
        <Badge variant={isPremium ? "premium" : isAuction ? "warning" : "secondary"}>
          {getValueDisplay()}
        </Badge>
      </div>
      
      {marketPrice > 0 && isPremium && (
        <div className="mb-2">
          <div className="text-xs text-muted-foreground mb-1 flex justify-between">
            <span>Recommended: {getRecommendedValue()}% {isAuction ? 'to market' : 'off'}</span>
            {targetPriceMessage && (
              <span className={`${targetPriceMessage.color} flex items-center`}>
                {targetPriceMessage.icon}
                {targetPriceMessage.text}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Custom slider with auction-specific styling */}
      <div className="relative">
        <Slider
          value={value}
          onValueChange={onValueChange}
          max={isAuction ? 5 : 15}
          min={isAuction ? -15 : 0}
          step={1}
          className="z-10"
          auctionMode={isAuction}
        />
        
        {/* Current bid marker (auction only) */}
        {isAuction && marketPrice > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    "absolute top-0 w-1 h-2 bg-blue-500 border border-white",
                    currentBidPercentage < -15 ? "left-0" : 
                    currentBidPercentage > 5 ? "right-0" : 
                    `left-[${((currentBidPercentage + 15) / 20) * 100}%]`
                  )}
                  style={{ 
                    left: `${Math.max(0, Math.min(100, ((currentBidPercentage + 15) / 20) * 100))}%` 
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Current Bid: {currentBidPercentage > 0 ? '+' : ''}{currentBidPercentage}% to market</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Market value marker (100% - auction only) */}
        {isAuction && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="absolute top-0 w-1 h-2 bg-black border border-white"
                  style={{ left: '75%' }} // 100% market value is at -15 + 15 = 0, which is 75% of the way on a -15 to +5 scale
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Market Value (100%)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="flex items-center">
          {isAuction ? (
            <>
              <ThumbsUp className="h-3 w-3 mr-1 text-green-500" />
              -15% (Bargain)
            </>
          ) : (
            "0% (No Discount)"
          )}
        </span>
        <span className="flex items-center">
          {isAuction ? (
            <>
              <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
              +5% (Premium)
            </>
          ) : (
            "15% (Max Discount)"
          )}
        </span>
      </div>
      
      {/* Additional auction context (premium only) */}
      {isAuction && isPremium && marketPrice > 0 && (
        <div className="mt-2 bg-amber-50 p-2 rounded-sm text-xs space-y-1 border border-amber-100">
          <div className="flex justify-between">
            <span>Current bid:</span>
            <span className={getValueColor(currentBidPercentage)}>
              {currentBidPercentage > 0 ? '+' : ''}{currentBidPercentage}% to market
            </span>
          </div>
          <div className="flex justify-between">
            <span>Typical end price:</span>
            <span>~95% of market value</span>
          </div>
          <div className="flex justify-between">
            <span>Recommended max:</span>
            <span className="font-medium">${(marketPrice * 0.95).toFixed(2)}</span>
          </div>
        </div>
      )}
      
      {/* Fixed price context (premium only) */}
      {!isAuction && isPremium && marketPrice > 0 && (
        <div className="mt-2 bg-blue-50 p-2 rounded-sm text-xs space-y-1 border border-blue-100">
          <div className="flex justify-between">
            <span>List price:</span>
            <span className={getValueColor(calculatePriceDifference(currentPrice, marketPrice))}>
              {calculatePriceDifference(currentPrice, marketPrice) > 0 ? '+' : ''}
              {Math.round(calculatePriceDifference(currentPrice, marketPrice))}% to market
            </span>
          </div>
          <div className="flex justify-between">
            <span>Typical accepted offer:</span>
            <span>5-10% below listing</span>
          </div>
          <div className="flex justify-between">
            <span>Your target price:</span>
            <span className="font-medium">${getTargetPrice()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NegotiationSliderProps;
