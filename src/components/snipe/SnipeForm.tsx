
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuctionSnipes } from '@/hooks/useAuctionSnipes';
import { getCurrentListing } from '@/utils/extensionUtils';
import { getAdapterForUrl, getSupportedMarketplaces, MarketplaceListingData } from '@/utils/marketplaceAdapters';
import { formatPrice } from '@/utils/extensionUtils';
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SnipeForm: React.FC = () => {
  const { toast } = useToast();
  const { createSnipe, isCreatingSnipe } = useAuctionSnipes();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listingData, setListingData] = useState<MarketplaceListingData | null>(null);
  const [maxBidAmount, setMaxBidAmount] = useState<number>(0);
  const [snipeTime, setSnipeTime] = useState<number>(10); // Default 10 seconds before end
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
  const supportedMarketplaces = getSupportedMarketplaces();

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
        
        // Extract normalized listing data
        const data = adapter.extractListingData(currentListing);
        setListingData(data);
        setSelectedMarketplace(data.marketplace);
        
        // Set initial max bid amount to current price + 10%
        if (data.currentPrice) {
          const initialBid = Math.ceil(data.currentPrice * 1.1);
          setMaxBidAmount(initialBid);
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

  const handleCreateSnipe = () => {
    if (!listingData || !listingData.auctionEndTime) {
      toast({
        title: "Error",
        description: "Cannot create snipe: No valid auction detected or missing end time.",
        variant: "destructive"
      });
      return;
    }
    
    if (maxBidAmount <= (listingData.currentPrice || 0)) {
      toast({
        title: "Invalid Bid Amount",
        description: "Your maximum bid must be higher than the current price.",
        variant: "destructive" 
      });
      return;
    }
    
    createSnipe({
      itemId: listingData.itemId,
      itemUrl: listingData.itemUrl,
      itemTitle: listingData.title,
      currentPrice: listingData.currentPrice || 0,
      maxBidAmount: maxBidAmount,
      snipeTime: snipeTime,
      auctionEndTime: listingData.auctionEndTime,
      marketplace: listingData.marketplace,
      marketplaceMetadata: {
        seller: listingData.seller
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

      <div className="space-y-4 pt-4">
        <div>
          <Label htmlFor="maxBid">Maximum Bid Amount</Label>
          <div className="flex items-center mt-1 space-x-2">
            <Input
              id="maxBid"
              type="number"
              min={listingData.currentPrice || 0}
              step={0.01}
              value={maxBidAmount}
              onChange={(e) => setMaxBidAmount(parseFloat(e.target.value))}
              className="flex-1"
            />
          </div>
          {maxBidAmount <= (listingData.currentPrice || 0) && (
            <p className="text-xs text-red-500 mt-1">
              Maximum bid must be higher than current price.
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="snipeTime">Snipe Time Before End</Label>
            <span className="text-sm">{snipeTime} seconds</span>
          </div>
          <Slider
            id="snipeTime"
            min={5}
            max={30}
            step={1}
            value={[snipeTime]}
            onValueChange={(value) => setSnipeTime(value[0])}
          />
          <p className="text-xs text-muted-foreground mt-1">
            The bid will be placed {snipeTime} seconds before the auction ends.
          </p>
        </div>

        <Button 
          onClick={handleCreateSnipe} 
          disabled={isCreatingSnipe || maxBidAmount <= (listingData.currentPrice || 0)}
          className="w-full"
        >
          {isCreatingSnipe ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting Up Snipe...
            </>
          ) : (
            <>Set Up Auction Snipe</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SnipeForm;
