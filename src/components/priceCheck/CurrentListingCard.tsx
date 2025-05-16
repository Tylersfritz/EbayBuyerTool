
// src/components/priceCheck/CurrentListingCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, Gavel, TagIcon, DollarSign, Users, Eye, Info, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { ListingInfo } from '@/components/priceCheck/types/priceCheckTypes';

interface CurrentListingCardProps {
  listingInfo: ListingInfo;
  loadingListingInfo: boolean;
}

const CurrentListingCard: React.FC<CurrentListingCardProps> = ({ 
  listingInfo, 
  loadingListingInfo 
}) => {
  const [marketRate, setMarketRate] = useState<number | null>(null);
  const [cachedSpecifics, setCachedSpecifics] = useState<Record<string, string>>({});

  // Log to confirm the component is rendering
  console.log('CurrentListingCard rendered with props:', { listingInfo, loadingListingInfo });

  // Add a state to force re-run useEffect if listingInfo changes
  const [listingInfoKey, setListingInfoKey] = useState(JSON.stringify(listingInfo));

  useEffect(() => {
    // Update listingInfoKey when listingInfo changes
    const newKey = JSON.stringify(listingInfo);
    if (newKey !== listingInfoKey) {
      setListingInfoKey(newKey);
    }
  }, [listingInfo, listingInfoKey]);

  const formatPrice = (price: number | string): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericPrice);
  };

  // Helper function to convert any price value to a number
  const toNumber = (value: number | string | undefined): number => {
    if (value === undefined) return 0;
    return typeof value === 'string' ? parseFloat(value) || 0 : value;
  };

  const isPriceBelowMarket = toNumber(listingInfo.currentPrice) < toNumber(listingInfo.buyItNowPrice);
  const isOnSale = !listingInfo.isAuction && 
                 !!listingInfo.originalPrice && 
                 toNumber(listingInfo.currentPrice) < toNumber(listingInfo.originalPrice);
  
  const calculateTimeProgress = (): number => {
    if (!listingInfo.timeRemaining) return 0;
    
    const timeStr = listingInfo.timeRemaining;
    const daysMatch = timeStr.match(/(\d+)d/);
    const hoursMatch = timeStr.match(/(\d+)h/);
    
    const days = daysMatch ? parseInt(daysMatch[1]) : 0;
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    
    const totalHours = days * 24 + hours;
    const maxHours = 7 * 24;
    
    return Math.min(100, Math.max(0, 100 - (totalHours / maxHours) * 100));
  };
  
  const getTimeColor = (): string => {
    if (!listingInfo.timeRemaining) return "text-gray-500";
    
    const progress = calculateTimeProgress();
    if (progress > 90) return "text-red-600";
    if (progress > 80) return "text-red-500";
    if (progress > 60) return "text-amber-500";
    return "text-blue-500";
  };
  
  const getTimeTooltip = (): string => {
    if (!listingInfo.timeRemaining) return "";
    
    const progress = calculateTimeProgress();
    if (progress > 90) return "Auction ending very soon! Make your decision quickly.";
    if (progress > 80) return "Auction ending soon. Prepare your maximum bid now.";
    if (progress > 60) return "Auction in final stages. Monitor price changes closely.";
    if (progress > 30) return "Auction in progress. Current bid may increase significantly.";
    return "Auction in early stages. Bid may be below true market value.";
  };

  if (loadingListingInfo) {
    return (
      <Card className="mb-2">
        <CardContent className="p-2.5 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex space-x-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const cardBorderClass = listingInfo.isAuction 
    ? "border-l-4 border-l-amber-500" 
    : "border-l-4 border-l-blue-500";

  // Helper function to safely convert price values
  const safePrice = (price?: number | string): number => {
    if (price === undefined) return 0.01;
    return typeof price === 'string' ? parseFloat(price) || 0.01 : price;
  };
  
  const currentPrice = safePrice(listingInfo.currentPrice);
  const buyItNowPrice = listingInfo.buyItNowPrice ? safePrice(listingInfo.buyItNowPrice) : 0;
  const originalPrice = listingInfo.originalPrice ? safePrice(listingInfo.originalPrice) : 0;

  return (
    <Card className={`mb-2 ${cardBorderClass}`}>
      <CardContent className="p-2.5">
        {/* Header with item ID and listing type badge */}
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs text-gray-600 font-medium flex items-center">
            {listingInfo.itemId && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center">
                      <Info className="h-3 w-3 mr-1 text-gray-400" />
                      Item #{listingInfo.itemId.substring(0, 6)}...
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Full ID: {listingInfo.itemId}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </p>
          
          {listingInfo.isAuction ? (
            <Badge variant="warning" className="text-xs px-2 py-0.5 flex items-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-200">
              <Gavel className="h-3 w-3" />
              Auction
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs px-2 py-0.5 flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
              <TagIcon className="h-3 w-3" />
              Fixed Price
            </Badge>
          )}
        </div>
        
        {/* Item title */}
        <p className="text-sm font-semibold line-clamp-2 mb-1.5">{listingInfo.title}</p>

        {/* Main content area - reformatted to use space better */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-1">
          <div>
            {/* Left column - Price information */}
            {!listingInfo.isAuction && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600 flex items-center">
                    <DollarSign className="h-3 w-3 mr-1 text-blue-500" />
                    Price:
                  </span>
                  <span className={cn(
                    "font-semibold text-sm",
                    isOnSale ? "text-green-600" : "text-gray-900"
                  )}>
                    {formatPrice(currentPrice)}
                  </span>
                </div>
                
                {isOnSale && listingInfo.originalPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Original:</span>
                    <div className="flex items-center">
                      <span className="text-xs line-through text-gray-500 mr-1">
                        {formatPrice(originalPrice)}
                      </span>
                      <Badge variant="success" className="text-xs px-1 py-0 bg-green-100 text-green-800">
                        -{Math.round(listingInfo.discountPercentage || 
                          ((originalPrice - currentPrice) / originalPrice * 100))}%
                      </Badge>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {listingInfo.isAuction && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600 flex items-center">
                    <Gavel className="h-3 w-3 mr-1 text-amber-500" />
                    Current bid:
                  </span>
                  <span className={cn(
                    "font-semibold text-sm",
                    isPriceBelowMarket ? "text-green-600" : "text-gray-900"
                  )}>
                    {formatPrice(currentPrice)}
                  </span>
                </div>
                
                {listingInfo.buyItNowPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600 flex items-center">
                      <TagIcon className="h-3 w-3 mr-1 text-blue-500" />
                      Buy It Now:
                    </span>
                    <span className="text-xs font-medium">
                      {formatPrice(listingInfo.buyItNowPrice)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600 flex items-center">
                    <Users className="h-3 w-3 mr-1 text-blue-500" />
                    Bids:
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <span className="text-xs font-medium">
                            {listingInfo.bids || 0}
                          </span>
                          {listingInfo.bidderCount && listingInfo.bidderCount > 0 && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({listingInfo.bidderCount} bidders)
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-xs">
                          {listingInfo.bids && listingInfo.bids > 5 
                            ? "Active auction with multiple bidders" 
                            : "Low bid count - may be a good opportunity"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            )}

            {/* Quantity info for fixed price listings */}
            {!listingInfo.isAuction && listingInfo.quantityAvailable && listingInfo.quantityAvailable > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-600">Quantity:</span>
                <span className="text-xs font-medium">
                  {listingInfo.quantityAvailable} available
                </span>
              </div>
            )}
            
            {/* Time remaining for auctions */}
            {listingInfo.isAuction && listingInfo.timeRemaining && (
              <div className="mt-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600 flex items-center">
                    <Timer className="h-3 w-3 mr-1 text-amber-500" /> 
                    Time left:
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`text-xs font-medium ${getTimeColor()}`}>
                          {listingInfo.timeRemaining}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-xs">{getTimeTooltip()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="mt-0.5">
                  <Progress 
                    value={calculateTimeProgress()} 
                    className="h-1" 
                    indicatorClassName={calculateTimeProgress() > 80 ? "bg-red-500" : 
                                          calculateTimeProgress() > 60 ? "bg-amber-500" : 
                                          "bg-blue-500"}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Right column - Listing details */}
          <div className="space-y-1">
            {/* Condition + Shipping on same row */}
            <div className="grid grid-cols-2 gap-1">
              {listingInfo.condition && (
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-gray-600">Condition:</span>
                  <span className="text-xs">{listingInfo.condition}</span>
                </div>
              )}
              {listingInfo.shipping && (
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-gray-600">Shipping:</span>
                  <span className="text-xs">{listingInfo.shipping}</span>
                </div>
              )}
            </div>
            
            {/* Seller info */}
            {listingInfo.seller && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-600">Seller:</span>
                <div className="flex items-center">
                  <span className="text-xs truncate ml-1 max-w-[60px]">{listingInfo.seller}</span>
                  {listingInfo.sellerFeedbackScore && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="ml-1 text-[0.65rem] px-1 py-0 h-4">
                            {listingInfo.sellerPositivePercentage}%
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="text-xs">Feedback score: {listingInfo.sellerFeedbackScore}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            )}
            
            {/* Returns policy */}
            {listingInfo.returnPolicy && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-600">Returns:</span>
                <span className="text-xs">{listingInfo.returnPolicy}</span>
              </div>
            )}
            
            {/* First bid time for auctions */}
            {listingInfo.isAuction && listingInfo.firstBidTime && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-600">First bid:</span>
                <span className="text-xs">
                  {new Date(listingInfo.firstBidTime).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {/* Watchers count for auctions */}
            {listingInfo.isAuction && listingInfo.watchers && listingInfo.watchers > 0 && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-600 flex items-center">
                  <Eye className="h-3 w-3 mr-1 text-blue-500" />
                  Watchers:
                </span>
                <span className="text-xs font-medium">
                  {listingInfo.watchers}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Alert/Notification area - condensed */}
        {((!listingInfo.isAuction && isOnSale) || (listingInfo.isAuction && listingInfo.bids && listingInfo.bids > 0)) && (
          <div className={`mt-1 px-2 py-0.5 rounded-sm border text-xs ${
            !listingInfo.isAuction ? 'bg-green-50 border-green-100 text-green-800' : 'bg-amber-50 border-amber-100 text-amber-800'
          }`}>
            {!listingInfo.isAuction && isOnSale ? (
              <p className="font-medium">
                Save {formatPrice((listingInfo.originalPrice || 0) - listingInfo.currentPrice)} off original price!
              </p>
            ) : (
              <p className="font-medium flex items-center">
                <Clock className="h-3 w-3 mr-1 text-amber-600" />
                {listingInfo.bids && listingInfo.bids > 5 
                  ? `Active auction with ${listingInfo.bids} bids` 
                  : "Few bids - potential opportunity"}
              </p>
            )}
          </div>
        )}

        {/* Market rate info (if available) */}
        {marketRate && (
          <div className="mt-1 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100">
            <p className="text-xs text-blue-800 font-medium">
              Auction Market Rate: ${marketRate}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentListingCard;
