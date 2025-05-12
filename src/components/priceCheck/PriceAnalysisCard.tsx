
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader, AlertCircle, CheckCircle, Search, RefreshCw, Gavel, Timer, Tag, DollarSign, Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PriceCheckResponse } from "@/api/priceApiService";

interface PriceAnalysisCardProps {
  loading: boolean;
  priceData: PriceCheckResponse | null;
  listingPrice: number;
  onCheckPrice: () => void;
  error?: string | null;
  isAuction?: boolean; // New prop to identify auction listings
  bids?: number; // Number of bids for auction context
  timeRemaining?: string; // Time remaining for auction context
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
    // Score from 0-100 where higher is better
    const diff = getPriceDifferencePercentage();
    
    // For auctions, adjust the score based on auction dynamics
    if (isAuction) {
      // Auctions typically end higher, so we adjust expectations
      // Current bid 30%+ below market is excellent (score 100)
      // Current bid at market value is average (score 50)
      // Current bid 30%+ above market is poor (score 0)
      if (diff <= -30) return 100;
      if (diff >= 30) return 0;
      
      // Linear scale adjusted for auction context
      return Math.round(50 - (diff * (50/30)));
    }
    
    // For fixed price listings, use standard scoring
    if (diff <= -30) return 100;
    if (diff >= 30) return 0;
    
    // Linear scale from 0-100 for price differences between +30% and -30%
    return Math.round(50 - (diff * (50/30)));
  };
  
  // Get a specialized message for auction listings
  const getAuctionMessage = (): { text: string, severity: 'success' | 'warning' | 'info' } | null => {
    if (!priceData || !priceData.averagePrice || !isAuction) return null;
    
    const diff = getPriceDifferencePercentage();
    const isEndingSoon = timeRemaining && timeRemaining.includes('h') && parseInt(timeRemaining.split('h')[0]) < 12;
    const isEndingVeryShortly = timeRemaining && timeRemaining.includes('m') && !timeRemaining.includes('h') && !timeRemaining.includes('d');
    const hasHighBidActivity = bids && bids > 10;
    
    // Auctions ending very soon (minutes only)
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
    
    // Auctions ending soon (hours but less than 12)
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
    } 
    
    // Auctions with plenty of time left
    else {
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
  
  // Get specialized message for fixed price listings
  const getFixedPriceMessage = (): { text: string, severity: 'success' | 'warning' | 'info' } | null => {
    if (!priceData || !priceData.averagePrice || isAuction) return null;
    
    const diff = getPriceDifferencePercentage();
    
    if (diff <= -20) {
      return {
        text: `Price is ${Math.abs(Math.round(diff))}% below market average - excellent deal!`,
        severity: 'success'
      };
    } else if (diff <= -10) {
      return {
        text: `Price is ${Math.abs(Math.round(diff))}% below market average - good deal!`,
        severity: 'success'
      };
    } else if (diff <= 0) {
      return {
        text: "Price is at or slightly below market average - fair deal.",
        severity: 'info'
      };
    } else if (diff <= 10) {
      return {
        text: `Price is ${Math.round(diff)}% above market average - consider negotiating.`,
        severity: 'info'
      };
    } else {
      return {
        text: `Price is ${Math.round(diff)}% above market average - overpriced, consider alternatives or try to negotiate.`,
        severity: 'warning'
      };
    }
  };

  const auctionMessage = getAuctionMessage();
  const fixedPriceMessage = getFixedPriceMessage();
  
  // Color and icon based on deal score
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
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-[#28A745] text-white font-bold rounded-[4px] shadow-sm"
                    >
                      {formatPrice(priceData.averagePrice)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Based on {priceData.itemCount} sold items</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onCheckPrice}
                className="h-6 px-2 py-0 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <Search className="h-3 w-3 mr-1" />
                Check market value
              </Button>
            )
          )}
        </div>
        
        {/* Current price comparison */}
        {priceData && !loading && priceData.averagePrice > 0 && (
          <div className="flex items-center justify-between text-xs mt-1 mb-1">
            <span className="font-medium flex items-center">
              {isAuction ? (
                <>
                  <Timer className="h-3 w-3 mr-1 text-amber-500" />
                  Current Bid:
                </>
              ) : (
                <>
                  <DollarSign className="h-3 w-3 mr-1 text-blue-500" />
                  Current Price:
                </>
              )}
            </span>
            <Badge 
              variant={getPriceDifferencePercentage() <= 0 ? "outline" : "secondary"}
              className={`text-xs ${getPriceDifferencePercentage() <= 0 ? 'text-green-600 border-green-300' : 'text-amber-700 bg-amber-100 border-amber-200'}`}
            >
              {formatPrice(listingPrice)}
              {getPriceDifferencePercentage() !== 0 && (
                <span className="ml-1">
                  ({getPriceDifferencePercentage() <= 0 ? "↓" : "↑"}{Math.abs(Math.round(getPriceDifferencePercentage()))}%)
                </span>
              )}
            </Badge>
          </div>
        )}
        
        {priceData && !loading && priceData.averagePrice > 0 && (
          <div className="mt-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Deal Score:</span>
              <div className="flex items-center">
                <Badge variant="outline" className={`text-xs font-semibold ${getDealScoreColor(getDealScore())} text-white`}>
                  {getDealScoreIcon(getDealScore())}
                  <span className="ml-1">{getDealScore()}/100</span>
                </Badge>
              </div>
            </div>
            <Progress 
              value={getDealScore()} 
              className="h-1" 
              indicatorClassName={getDealScoreColor(getDealScore())}
            />
            
            {/* Display auction-specific context when relevant */}
            {isAuction && auctionMessage && (
              <Alert className={`
                ${auctionMessage.severity === 'success' ? 'bg-green-50 border-green-200' : 
                  auctionMessage.severity === 'warning' ? 'bg-amber-50 border-amber-200' : 
                  'bg-blue-50 border-blue-200'} 
                p-2 mt-1
              `}>
                <Gavel className={`h-3 w-3 
                  ${auctionMessage.severity === 'success' ? 'text-green-500' : 
                    auctionMessage.severity === 'warning' ? 'text-amber-500' : 
                    'text-blue-500'}`} 
                />
                <AlertTitle className={`
                  ${auctionMessage.severity === 'success' ? 'text-green-800' : 
                    auctionMessage.severity === 'warning' ? 'text-amber-800' : 
                    'text-blue-800'} 
                  text-xs font-semibold
                `}>
                  Auction Insight
                </AlertTitle>
                <AlertDescription className={`
                  ${auctionMessage.severity === 'success' ? 'text-green-700' : 
                    auctionMessage.severity === 'warning' ? 'text-amber-700' : 
                    'text-blue-700'} 
                  text-xs
                `}>
                  {auctionMessage.text}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Fixed-price specific messages */}
            {!isAuction && fixedPriceMessage && (
              <Alert className={`
                ${fixedPriceMessage.severity === 'success' ? 'bg-green-50 border-green-200' : 
                  fixedPriceMessage.severity === 'warning' ? 'bg-amber-50 border-amber-200' : 
                  'bg-blue-50 border-blue-200'} 
                p-2 mt-1
              `}>
                <Tag className={`h-3 w-3 
                  ${fixedPriceMessage.severity === 'success' ? 'text-green-500' : 
                    fixedPriceMessage.severity === 'warning' ? 'text-amber-500' : 
                    'text-blue-500'}`} 
                />
                <AlertTitle className={`
                  ${fixedPriceMessage.severity === 'success' ? 'text-green-800' : 
                    fixedPriceMessage.severity === 'warning' ? 'text-amber-800' : 
                    'text-blue-800'} 
                  text-xs font-semibold
                `}>
                  Fixed Price Analysis
                </AlertTitle>
                <AlertDescription className={`
                  ${fixedPriceMessage.severity === 'success' ? 'text-green-700' : 
                    fixedPriceMessage.severity === 'warning' ? 'text-amber-700' : 
                    'text-blue-700'} 
                  text-xs
                `}>
                  {fixedPriceMessage.text}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {priceData && priceData.error && !loading && (
          <Alert className="bg-blue-50 border-blue-200 p-2 mt-1">
            <Search className="h-3 w-3 text-blue-500" />
            <AlertTitle className="text-blue-800 text-xs font-semibold">No Exact Matches</AlertTitle>
            <AlertDescription className="text-blue-700 text-xs flex flex-col gap-2">
              {priceData.error}
              <div className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 text-blue-600" />
                <span>Try with a more generic search term.</span>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Display general API errors */}
        {error && !loading && !priceData?.error && (
          <Alert className="bg-red-50 border-red-200 p-2 mt-1">
            <AlertCircle className="h-3 w-3 text-red-500" />
            <AlertTitle className="text-red-800 text-xs font-semibold">API Error</AlertTitle>
            <AlertDescription className="text-red-700 text-xs">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceAnalysisCard;
