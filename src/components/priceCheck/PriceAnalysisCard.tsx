// src/components/priceCheck/PriceAnalysisCard.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader, AlertCircle, CheckCircle, Search, RefreshCw, Gavel, Timer, Tag, DollarSign, Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PriceCheckResponse } from "@/components/priceCheck/types/priceCheckTypes";

interface PriceAnalysisCardProps {
  loading: boolean;
  priceData: PriceCheckResponse | null;
  listingPrice: number;
  onCheckPrice: () => void;
  error?: string | null;
  isAuction?: boolean;
  bids?: number;
  timeRemaining?: string;
}

const PriceAnalysisCard: React.FC<PriceAnalysisCardProps> = ({
  loading,
  priceData,
  listingPrice,
  onCheckPrice,
  error,
  isAuction = false,
  bids = 0,
  timeRemaining
}) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const getPriceDifferencePercentage = (): number => {
    if (!priceData || priceData.averagePrice <= 0 || listingPrice <= 0) return 0;
    return ((listingPrice - priceData.averagePrice) / priceData.averagePrice) * 100;
  };

  const getDealScore = (): number => {
    const diff = getPriceDifferencePercentage();
    if (isAuction) {
      if (diff <= -30) return 100;
      if (diff >= 30) return 0;
      return Math.round(50 - (diff * (50/30)));
    }
    if (diff <= -30) return 100;
    if (diff >= 30) return 0;
    return Math.round(50 - (diff * (50/30)));
  };

  const getAuctionMessage = (): { text: string, severity: 'success' | 'warning' | 'info' } | null => {
    if (!priceData || !priceData.averagePrice || !isAuction) return null;
    const diff = getPriceDifferencePercentage();
    const isEndingSoon = timeRemaining && timeRemaining.includes('h') && parseInt(timeRemaining.split('h')[0]) < 12;
    const isEndingVeryShortly = timeRemaining && timeRemaining.includes('m') && !timeRemaining.includes('h') && !timeRemaining.includes('d');
    const hasHighBidActivity = bids && bids > 10;
    if (isEndingVeryShortly) {
      if (diff <= -15) {
        return {
          text: `Ending within the hour! Current bid is ${Math.abs(Math.round(diff))}% below market value - excellent deal potential!`,
          severity: 'success'
        };
      } else if (diff <= 0) {
        return {
          text: "Auction ending very soon! Current bid is slightly below market value. Set your maximum bid now if interested.",
          severity: 'success'
        };
      } else {
        return {
          text: "Auction ending very soon with bid already above market value. Consider if the item is worth the premium.",
          severity: 'warning'
        };
      }
    }
    if (isEndingSoon) {
      if (diff <= -20) {
        return {
          text: `Auction ending soon with bid ${Math.abs(Math.round(diff))}% below market value - excellent potential deal!`,
          severity: 'success'
        };
      } else if (diff <= -5) {
        return {
          text: "Auction ending soon with bid below market value - good deal potential!",
          severity: 'success'
        };
      } else if (diff <= 5) {
        return {
          text: "Auction ending soon with bid at market value. Consider your maximum bid carefully.",
          severity: 'info'
        };
      } else {
        return {
          text: `Auction ending soon with bid ${Math.round(diff)}% above market value. Consider looking for other options.`,
          severity: 'warning'
        };
      }
    } else {
      if (diff <= -30) {
        return {
          text: hasHighBidActivity
            ? "Current bid is well below market value, but high bid activity suggests the price will increase substantially."
            : "Current bid is significantly below market value, typical for auctions with plenty of time remaining.",
          severity: 'info'
        };
      } else if (diff <= -15) {
        return {
          text: "Current bid is below market value. Set a maximum bid and monitor the auction as it progresses.",
          severity: 'info'
        };
      } else {
        return {
          text: "Current bid is already approaching market value with plenty of time remaining. Consider finding a fixed-price alternative.",
          severity: 'warning'
        };
      }
    }
  };

  const getFixedPriceMessage = (): { text: string, severity: 'success' | 'warning' | 'info' } | null => {
    if (!priceData || !priceData.averagePrice || isAuction) return null;
    const diff = getPriceDifferencePercentage();
    if (diff <= -20) {
      return { text: `Price is ${Math.abs(Math.round(diff))}% below market average - excellent deal!`, severity: 'success' };
    } else if (diff <= -10) {
      return { text: `Price is ${Math.abs(Math.round(diff))}% below market average - good deal!`, severity: 'success' };
    } else if (diff <= 0) {
      return { text: "Price is at or slightly below market average - fair deal.", severity: 'info' };
    } else if (diff <= 10) {
      return { text: `Price is ${Math.round(diff)}% above market average - consider negotiating.`, severity: 'info' };
    } else {
      return { text: `Price is ${Math.round(diff)}% above market average - overpriced, consider alternatives or try to negotiate.`, severity: 'warning' };
    }
  };

  const auctionMessage = getAuctionMessage ? getAuctionMessage() : null;
  const fixedPriceMessage = getFixedPriceMessage ? getFixedPriceMessage() : null;

  const getDealScoreColor = (score: number): string => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-green-400";
    if (score >= 40) return "bg-amber-400";
    if (score >= 20) return "bg-orange-400";
    return "bg-red-500";
  };

  const getDealScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="h-3 w-3" />;
    if (score >= 40) return <Info className="h-3 w-3" />;
    return <AlertCircle className="h-3 w-3" />;
  };

  const getConfidenceColor = (confidence?: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className={`mb-1 ${isAuction ? 'border-l-amber-400' : 'border-l-blue-400'}`}>
      <CardContent className="p-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium flex items-center">
            {isAuction ? (
              <>
                <Gavel className="h-3 w-3 mr-1 text-amber-500" />
                Auction Market Value:
              </>
            ) : (
              <>
                <Tag className="h-3 w-3 mr-1 text-blue-500" />
                Market Average:
              </>
            )}
          </span>
          {loading ? (
            <div className="flex items-center gap-1">
              <Loader className="h-3 w-3 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Checking...</span>
            </div>
          ) : (
            priceData && priceData.averagePrice > 0 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-xs bg-[#28A745] text-white font-bold rounded-[4px] shadow-sm">
                      {formatPrice(priceData.averagePrice)}
                      {priceData.dataQuality && (
                        <span className={`ml-1 ${getConfidenceColor(priceData.dataQuality.confidence)}`}>
                          •
                        </span>
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Based on {priceData.itemCount} sold items</p>
                    <p className="text-xs">Price range: {priceData.priceRange ? `${formatPrice(priceData.priceRange.min)} - ${formatPrice(priceData.priceRange.max)}` : 'N/A'}</p>
                    
                    {priceData.dataQuality && (
                      <>
                        <div className="mt-2 mb-1 border-t border-gray-200 pt-1">
                          <p className="text-xs font-semibold flex items-center">
                            <span className={`mr-1 ${getConfidenceColor(priceData.dataQuality.confidence)}`}>●</span>
                            Data Confidence: {priceData.dataQuality.confidence}
                          </p>
                        </div>
                        
                        <p className="text-xs font-semibold mt-1">Sources:</p>
                        {priceData.dataQuality.sources.map((source, i) => (
                          <p key={i} className="text-xs">{source}</p>
                        ))}
                        
                        {priceData.dataQuality.warning && (
                          <p className="text-xs text-yellow-600 mt-1">{priceData.dataQuality.warning}</p>
                        )}
                        
                        {priceData.dataQuality.itemSpecifics && (
                          <>
                            <p className="text-xs font-semibold mt-1">Detected Item Details:</p>
                            {priceData.dataQuality.itemSpecifics.make && (
                              <p className="text-xs">Brand/Make: {priceData.dataQuality.itemSpecifics.make}</p>
                            )}
                            {priceData.dataQuality.itemSpecifics.model && (
                              <p className="text-xs">Model: {priceData.dataQuality.itemSpecifics.model}</p>
                            )}
                          </>
                        )}
                      </>
                    )}
                    
                    {priceData.warning && (
                      <p className="text-xs text-yellow-600">{priceData.warning}</p>
                    )}
                    {priceData.conditionAnalysis && priceData.conditionAnalysis.length > 0 && (
                      <>
                        <p className="text-xs font-semibold mt-1">Condition Analysis:</p>
                        {priceData.conditionAnalysis.map((cond) => (
                          <p key={cond.condition} className="text-xs">
                            {cond.condition}: {formatPrice(cond.averagePrice)} ({cond.itemCount} items)
                          </p>
                        ))}
                      </>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('Check Market Rate button clicked, priceData:', priceData);
                  onCheckPrice();
                }}
                className="h-6 px-2 py-0 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <Search className="h-3 w-3 mr-1" />
                Check market value
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceAnalysisCard;
