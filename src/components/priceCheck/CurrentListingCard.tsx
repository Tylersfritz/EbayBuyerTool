// src/components/priceCheck/CurrentListingCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, Gavel, TagIcon, DollarSign, Users, Eye, Info, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface ListingInfo {
  title: string;
  currentPrice: number;
  buyItNowPrice?: number;
  originalPrice?: number;
  seller?: string;
  condition?: string;
  shipping?: string;
  timeRemaining?: string;
  bids?: number;
  bidderCount?: number;
  isAuction?: boolean;
  image?: string;
  itemSpecifics?: Record<string, string>;
  itemId?: string;
  quantityAvailable?: number;
  returnPolicy?: string;
  sellerFeedbackScore?: number;
  sellerPositivePercentage?: number;
  discountPercentage?: number;
  watchers?: number;
  firstBidTime?: string;
}

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

  useEffect(() => {
    // Function to extract Item Specifics from the DOM
    const extractItemSpecificsFromDOM = (): Record<string, string> => {
      const specifics: Record<string, string> = {};
      try {
        console.log('Attempting to extract Item Specifics from DOM...');
        // Try multiple selectors for eBay's Item Specifics section
        const specificsSection = document.querySelector('#viTabs_0_is .section') || 
                                document.querySelector('.ux-layout-section__item--table-view') ||
                                document.querySelector('.itemAttr') ||
                                document.querySelector('.ux-labels-values');
        console.log('Specifics Section Element:', specificsSection ? specificsSection.outerHTML : 'Not found');

        if (specificsSection) {
          const rows = specificsSection.querySelectorAll('tr') || 
                      specificsSection.querySelectorAll('.ux-labels-values__row') ||
                      specificsSection.querySelectorAll('div');
          console.log(`Found ${rows.length} rows in specifics section`);

          rows.forEach((row, index) => {
            const labelElement = row.querySelector('.attrLabels, .ux-labels-values__labels');
            const valueElement = row.querySelector('td:not(.attrLabels), .ux-labels-values__values');
            const label = labelElement?.textContent?.trim().replace(':', '');
            const value = valueElement?.textContent?.trim();
            console.log(`Row ${index}: Label=${label}, Value=${value}`);
            if (label && value) {
              specifics[label] = value;
            }
          });
        } else {
          console.log('No specifics section found with any selector');
        }
      } catch (error) {
        console.error('Error extracting Item Specifics from DOM:', error);
      }
      return specifics;
    };

    // Use MutationObserver to watch for DOM changes if specifics are not immediately available
    const observeDOMForSpecifics = (callback: () => void) => {
      const targetNode = document.body;
      const observer = new MutationObserver((mutations, observer) => {
        console.log('DOM changed, checking for specifics section...');
        const specificsSection = document.querySelector('#viTabs_0_is .section') || 
                                document.querySelector('.ux-layout-section__item--table-view') ||
                                document.querySelector('.itemAttr') ||
                                document.querySelector('.ux-labels-values');
        if (specificsSection) {
          console.log('Specifics section detected via MutationObserver');
          observer.disconnect(); // Stop observing once found
          callback();
        }
      });

      observer.observe(targetNode, { childList: true, subtree: true });
      return observer;
    };

    // Extract and cache Item Specifics with retry logic
    const attemptExtraction = async (maxAttempts = 5, retryDelay = 500) => {
      let attempts = 0;
      let extractedSpecifics: Record<string, string> = {};

      while (attempts < maxAttempts) {
        console.log(`Extraction attempt ${attempts + 1}/${maxAttempts}`);
        extractedSpecifics = extractItemSpecificsFromDOM();
        if (Object.keys(extractedSpecifics).length > 0) {
          break; // Exit loop if specifics are found
        }
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }

      if (Object.keys(extractedSpecifics).length === 0) {
        console.log('No specifics found after retries, setting up MutationObserver...');
        observeDOMForSpecifics(() => {
          const finalSpecifics = extractItemSpecificsFromDOM();
          setCachedSpecifics(finalSpecifics);
          console.log('Captured Item Specifics via MutationObserver:', finalSpecifics);
          proceedWithPriceCheck(finalSpecifics);
        });
      } else {
        setCachedSpecifics(extractedSpecifics);
        console.log('Captured Item Specifics from DOM:', extractedSpecifics);
        proceedWithPriceCheck(extractedSpecifics);
      }
    };

    // Process the extracted specifics and fetch the market rate
    const proceedWithPriceCheck = (extractedSpecifics: Record<string, string>) => {
      console.log('Listing Info from getCurrentListing:', listingInfo);

      // Extract relevant specifics for the API call
      let make = extractedSpecifics['Brand'] || extractedSpecifics['Make'] || listingInfo.itemSpecifics?.['Brand'] || listingInfo.itemSpecifics?.['Make'] || '';
      let model = extractedSpecifics['Model'] || listingInfo.itemSpecifics?.['Model'] || '';
      let condition = listingInfo.condition || 'USED'; // Default to USED if not provided
      const itemName = listingInfo.title || '';

      // Clean condition value (remove duplication like "UsedUsed")
      condition = condition.replace(/UsedUsed/, 'USED');

      // Fallback: Derive make and model from title if not found in specifics
      if (!make || !model) {
        const titleWords = itemName.toLowerCase().split(/\s+/);
        if (titleWords.includes('apple')) {
          make = 'Apple';
          if (titleWords.includes('watch') && titleWords.includes('series')) {
            const seriesIndex = titleWords.indexOf('series');
            model = `Series ${titleWords[seriesIndex + 1]}`; // e.g., "Series 7"
          }
        } else if (titleWords.includes('fitbit')) {
          make = 'Fitbit';
          if (titleWords.includes('charge')) {
            const chargeIndex = titleWords.indexOf('charge');
            model = `Charge ${titleWords[chargeIndex + 1]}`; // e.g., "Charge 5"
          }
        } else if (titleWords.includes('pokemon')) {
          make = 'Pokemon';
          model = 'Card';
        }
      }

      // Log the derived specifics for confirmation
      console.log('Derived Specifics for API Call:', { itemName, make, model, condition });

      // Call the /api/price-check endpoint with the extracted specifics
      const fetchMarketRate = async () => {
        try {
          const response = await fetch(
            `/api/price-check?itemName=${encodeURIComponent(itemName)}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&condition=${encodeURIComponent(condition)}&premium=false`
          );
          const data = await response.json();
          if (data.error) {
            throw new Error(data.error);
          }
          setMarketRate(data.marketRate);
        } catch (error) {
          console.error('Error fetching market rate:', error.message);
          setMarketRate(null);
        }
      };

      fetchMarketRate();
    };

    // Start the extraction process
    attemptExtraction();
  }, [listingInfo]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const isPriceBelowMarket = listingInfo.currentPrice < (listingInfo.buyItNowPrice || 0);
  const isOnSale = !listingInfo.isAuction && 
                 !!listingInfo.originalPrice && 
                 listingInfo.currentPrice < listingInfo.originalPrice;
  
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
        <CardContent className="p-3 space-y-2">
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

  return (
    <Card className={`mb-2 ${cardBorderClass}`}>
      <CardContent className="p-3">
        <div className="mb-2 flex items-center justify-between">
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
        
        <p className="text-sm font-semibold line-clamp-2">{listingInfo.title}</p>

        <div className="grid grid-cols-2 gap-4 mb-2 mt-2">
          <div className="space-y-2">
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
                    {formatPrice(listingInfo.currentPrice)}
                  </span>
                </div>
                
                {isOnSale && listingInfo.originalPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Original:</span>
                    <div className="flex items-center">
                      <span className="text-xs line-through text-gray-500 mr-1">
                        {formatPrice(listingInfo.originalPrice)}
                      </span>
                      <Badge variant="success" className="text-xs px-1 py-0 bg-green-100 text-green-800">
                        -{Math.round(listingInfo.discountPercentage || 
                          ((listingInfo.originalPrice - listingInfo.currentPrice) / listingInfo.originalPrice * 100))}%
                      </Badge>
                    </div>
                  </div>
                )}
                
                {listingInfo.quantityAvailable && listingInfo.quantityAvailable > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Quantity:</span>
                    <span className="text-xs font-medium">
                      {listingInfo.quantityAvailable} available
                    </span>
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
                    {formatPrice(listingInfo.currentPrice)}
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
                
                {listingInfo.timeRemaining && (
                  <>
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
                    <div className="mt-1">
                      <Progress 
                        value={calculateTimeProgress()} 
                        className="h-1" 
                        indicatorClassName={calculateTimeProgress() > 80 ? "bg-red-500" : 
                                          calculateTimeProgress() > 60 ? "bg-amber-500" : 
                                          "bg-blue-500"}
                      />
                    </div>
                  </>
                )}
                
                {listingInfo.watchers && listingInfo.watchers > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600 flex items-center">
                      <Eye className="h-3 w-3 mr-1 text-blue-500" />
                      Watchers:
                    </span>
                    <span className="text-xs font-medium">
                      {listingInfo.watchers}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
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
            {listingInfo.returnPolicy && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-600">Returns:</span>
                <span className="text-xs">{listingInfo.returnPolicy}</span>
              </div>
            )}
            {listingInfo.isAuction && listingInfo.firstBidTime && (
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-600">First bid:</span>
                <span className="text-xs">
                  {new Date(listingInfo.firstBidTime).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {!listingInfo.isAuction && isOnSale && (
          <div className="mt-1 bg-green-50 px-2 py-1 rounded-sm border border-green-100">
            <p className="text-xs text-green-800 font-medium">
              This item is on sale! Save {formatPrice(
                (listingInfo.originalPrice || 0) - listingInfo.currentPrice
              )} off the original price.
            </p>
          </div>
        )}
        
        {listingInfo.isAuction && listingInfo.bids && listingInfo.bids > 0 && (
          <div className="mt-1 bg-amber-50 px-2 py-1 rounded-sm border border-amber-100">
            <p className="text-xs text-amber-800 font-medium flex items-center">
              <Clock className="h-3 w-3 mr-1 text-amber-600" />
              {listingInfo.bids > 5 
                ? `Active auction with ${listingInfo.bids} bids - consider setting a maximum bid` 
                : "Auction has few bids - potential opportunity"}
            </p>
          </div>
        )}

        {marketRate && (
          <div className="mt-2 bg-blue-50 px-2 py-1 rounded-sm border border-blue-100">
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