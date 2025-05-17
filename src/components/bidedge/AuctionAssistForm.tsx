import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuctionMonitors } from '@/hooks/useAuctionMonitors';
import { getCurrentListing } from '@/utils/extensionUtils';
import { getAdapterForUrl, getSupportedMarketplaces, MarketplaceListingData } from '@/utils/marketplaceAdapters';
import { formatPrice } from '@/utils/extensionUtils';
import { Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card as ComparableCard, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AuctionAssistForm: React.FC = () => {
  const { createMonitor, isCreatingMonitor, findComparableItems, isLoadingComparables } = useAuctionMonitors();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listingData, setListingData] = useState<MarketplaceListingData | null>(null);
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [notificationTime, setNotificationTime] = useState<number>(300); // Default 5 minutes (300 seconds) before end
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
  const [comparables, setComparables] = useState<any>(null);
  
  useEffect(() => {
    const loadCurrentListing = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get the current listing from the extension
        const currentListing = await getCurrentListing();
        
        if (!currentListing) {
          setError('No auction listing detected on the current page.');
          setIsLoading(false);
          return;
        }
        
        // Try to identify the marketplace from the URL
        const currentUrl = currentListing.itemUrl || window.location.href;
        const adapter = getAdapterForUrl(currentUrl);
        
        if (!adapter) {
          setError('The current page is not from a supported marketplace.');
          setIsLoading(false);
          return;
        }
        
        // Extract normalized listing data - pass the currentListing object directly
        const data = adapter.extractListingData(currentListing);
        setListingData(data);
        setSelectedMarketplace(data.marketplace);
        
        // Set initial target price to current price + 10%
        if (data.currentPrice) {
          const initialTarget = Math.ceil(data.currentPrice * 1.1);
          setTargetPrice(initialTarget);
        }

        // Find comparable items
        if (data.itemId && data.title) {
          const comparablesData = await findComparableItems(data.itemId, data.title, data.category);
          if (comparablesData) {
            setComparables(comparablesData);
            
            // If we have a market rate, adjust the target price suggestion
            if (comparablesData.marketRate) {
              // Suggest a price that's slightly below market rate as a good target
              const suggestedTarget = Math.round(comparablesData.marketRate * 0.95);
              setTargetPrice(suggestedTarget);
            }
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading listing data:', err);
        setError('Failed to load auction details. Please try again.');
        setIsLoading(false);
      }
    };
    
    loadCurrentListing();
  }, []);

  const handleCreateMonitor = () => {
    if (!listingData || !listingData.auctionEndTime) {
      toast.error("Cannot monitor auction: No valid auction detected or missing end time.");
      return;
    }
    
    if (targetPrice <= 0) {
      toast.error("Please set a valid target price.");
      return;
    }
    
    createMonitor({
      itemId: listingData.itemId,
      itemUrl: listingData.itemUrl,
      itemTitle: listingData.title,
      currentPrice: listingData.currentPrice || 0,
      targetPrice: targetPrice,
      notificationTime: notificationTime,
      auctionEndTime: listingData.auctionEndTime,
      marketplace: listingData.marketplace,
      marketplaceMetadata: {
        seller: listingData.seller,
        marketRate: comparables?.marketRate
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading auction details...</p>
      </div>
    );
  }

  if (error || !listingData) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || "No auction found. Please navigate to an auction listing."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!listingData.isAuction || !listingData.auctionEndTime) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This listing is not an auction or has no end time.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2 text-primary truncate">{listingData.title}</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Current Price:</span>
          <span className="font-medium">{formatPrice(listingData.currentPrice || 0)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Marketplace:</span>
          <span className="font-medium">{listingData.marketplace}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Seller:</span>
          <span className="font-medium">{listingData.seller}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Auction Ends:</span>
          <span className="font-medium">
            {listingData.auctionEndTime?.toLocaleString()}
          </span>
        </div>
      </div>

      {comparables && (
        <ComparableCard className="bg-blue-50 border border-blue-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-blue-800 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />
                Market Insights
              </h4>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                {comparables.itemCount} items
              </Badge>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-blue-700">Market Rate:</span>
                <span className="font-medium text-blue-800">{formatPrice(comparables.marketRate)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-700">Price Range:</span>
                <span className="font-medium text-blue-800">
                  {formatPrice(comparables.priceRange?.min)} - {formatPrice(comparables.priceRange?.max)}
                </span>
              </div>
              {comparables.dateRange && (
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">Date Range:</span>
                  <span className="font-medium text-blue-800">{comparables.dateRange}</span>
                </div>
              )}
              <div className="mt-2 text-xs text-blue-600">
                {compareToMarketRate(listingData.currentPrice || 0, comparables.marketRate)}
              </div>
            </div>
          </CardContent>
        </ComparableCard>
      )}

      <div className="space-y-4 pt-4">
        <div>
          <Label htmlFor="targetPrice">Your Target Price</Label>
          <div className="flex items-center mt-1 space-x-2">
            <Input
              id="targetPrice"
              type="number"
              min={1}
              step={0.01}
              value={targetPrice}
              onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
              className="flex-1"
            />
          </div>
          {comparables?.marketRate && targetPrice > comparables.marketRate * 1.1 && (
            <p className="text-xs text-amber-500 mt-1">
              Your target price is {Math.round((targetPrice / comparables.marketRate - 1) * 100)}% above market rate.
            </p>
          )}
          {comparables?.marketRate && targetPrice < comparables.marketRate * 0.9 && (
            <p className="text-xs text-green-500 mt-1">
              Great value! Your target price is {Math.round((1 - targetPrice / comparables.marketRate) * 100)}% below market rate.
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="notificationTime">Notification Time Before End</Label>
            <span className="text-sm">{formatNotificationTime(notificationTime)}</span>
          </div>
          <Slider
            id="notificationTime"
            min={60}
            max={3600}
            step={60}
            value={[notificationTime]}
            onValueChange={(value) => setNotificationTime(value[0])}
          />
          <p className="text-xs text-muted-foreground mt-1">
            You'll receive a notification {formatNotificationTime(notificationTime)} before the auction ends.
          </p>
        </div>

        <Button 
          onClick={handleCreateMonitor} 
          disabled={isCreatingMonitor || targetPrice <= 0}
          className="w-full"
        >
          {isCreatingMonitor ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting Up Monitor...
            </>
          ) : (
            <>Monitor This Auction</>
          )}
        </Button>
      </div>
    </div>
  );
};

// Helper function to format notification time in a readable way
const formatNotificationTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
  return `${Math.floor(seconds / 3600)} hours ${Math.floor((seconds % 3600) / 60)} minutes`;
};

// Helper function to compare current price to market rate
const compareToMarketRate = (currentPrice: number, marketRate: number): string => {
  if (!marketRate) return "";
  
  const difference = ((currentPrice / marketRate) - 1) * 100;
  
  if (difference <= -15) {
    return `This auction is currently ${Math.abs(Math.round(difference))}% below market rate - exceptional value!`;
  } else if (difference <= -5) {
    return `This auction is currently ${Math.abs(Math.round(difference))}% below market rate - good value!`;
  } else if (difference >= 15) {
    return `This auction is currently ${Math.round(difference)}% above market rate - consider finding alternatives.`;
  } else if (difference >= 5) {
    return `This auction is currently ${Math.round(difference)}% above market rate - monitor closely.`;
  } else {
    return `This auction is currently priced around market rate.`;
  }
};

export default AuctionAssistForm;
