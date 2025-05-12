
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Clipboard, CheckCircle, AlertTriangle, Sparkles, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import AffiliateButton from "@/components/AffiliateButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculatePriceDifference, getDealScore, getDealText } from "@/utils/extensionUtils";
import { usePriceSharedData } from "@/hooks/usePriceSharedData";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PremiumOfferGenerator from "@/components/negotiate/PremiumOfferGenerator";
import NegotiationSlider from "@/components/negotiate/NegotiationSlider";
import SellerAnalytics from "@/components/negotiate/SellerAnalytics";
import { saveOfferToHistory } from "@/utils/offerHistoryUtils";

interface NegotiateProps {
  isPremium: boolean;
}

interface ListingInfo {
  title: string;
  currentPrice: number;
  seller?: string;
  isAuction: boolean; // Changed from optional to required
  timeRemaining?: string;
  bids?: number;
}

const FREE_SEARCH_LIMIT = 10;

const Negotiate: React.FC<NegotiateProps> = ({ isPremium }) => {
  const { sharedData, loading: loadingSharedData, searchesRemaining } = usePriceSharedData();
  const [sliderValue, setSliderValue] = useState<number[]>([5]);
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [listingInfo, setListingInfo] = useState<ListingInfo>({ 
    title: '', 
    currentPrice: 0,
    isAuction: false
  });
  const [loadingListingInfo, setLoadingListingInfo] = useState(true);
  const [hasMarketData, setHasMarketData] = useState(false);
  
  // Template messages for different contexts
  const messageTemplates = {
    // Fixed-price templates
    fixedPrice: {
      low: "Hello {seller}, I'm interested in your \"{title}\" listing. Would you consider {discount}% off for a quick sale? Thank you for considering my offer.",
      medium: "Hi {seller}, I've been looking at your \"{title}\" and I'm very interested. Would you consider accepting ${targetPrice} instead of ${price}? Thanks for your consideration.",
      high: "Hello {seller}, I'm ready to purchase your \"{title}\" right away if we can agree on a price of ${targetPrice}. I notice similar items have sold for this amount recently. Please let me know if this works for you. Thanks!"
    },
    // Auction templates
    auction: {
      low: "Hello {seller}, I'm watching your \"{title}\" auction. If it doesn't reach my target price by auction end, would you consider a second chance offer of ${targetPrice}? Thanks for considering.",
      medium: "Hi {seller}, I'm following your \"{title}\" auction. I'd like to submit a max bid of ${targetPrice}, which I believe is fair based on recent sales data. Looking forward to possibly winning this item!",
      high: "Hello {seller}, I'm very interested in your \"{title}\" auction. Based on the market value, I've set my maximum bid at ${targetPrice}. I hope to win this auction, but would also consider a buy-it-now if you'd offer one. Thanks!"
    }
  };
  
  // Premium templates with more persuasive language
  const premiumTemplates = {
    // Fixed-price templates
    fixedPrice: {
      low: "Hello {seller}, I've been searching for a \"{title}\" and your listing caught my eye. Would a {discount}% discount be possible for an immediate purchase? I can complete payment right away. Thank you for your consideration.",
      medium: "Hi {seller}, I'm very interested in your \"{title}\" listing. Based on recent sales data, would you consider ${targetPrice} instead of ${price}? I'm ready to purchase immediately at this price point. Looking forward to your response.",
      high: "Hello {seller}, I'm ready to buy your \"{title}\" today. Market research shows similar items selling for around ${marketPrice}, and I can complete the purchase immediately at ${targetPrice}, saving us both time. Would this work for you? Thanks for considering my offer."
    },
    // Auction templates
    auction: {
      low: "Hello {seller}, I'm following your \"{title}\" auction closely. Market analysis shows similar items typically sell for around ${marketPrice}, and I've set my maximum bid at ${targetPrice}. If the auction doesn't reach my target, would you consider a second chance offer? Thanks!",
      medium: "Hi {seller}, I'm very interested in your \"{title}\" auction. Based on extensive market research of comparable sales (averaging ${marketPrice}), I'm prepared to bid up to ${targetPrice}. I'll be watching this auction closely and hope to be the winning bidder!",
      high: "Hello {seller}, I've been tracking your \"{title}\" auction and comparing it with recent market data. Similar items have averaged ${marketPrice}, and I've determined a fair maximum bid of ${targetPrice}. I'm a serious buyer looking to add this to my collection. Would you consider offering a Buy It Now option at this price point?"
    }
  };
  
  useEffect(() => {
    // Check if we have price data from shared state
    if (sharedData && sharedData.priceData && sharedData.priceData.averagePrice > 0) {
      setHasMarketData(true);
    } else {
      setHasMarketData(false);
    }
    
    // If we have shared listing info, use it
    if (sharedData && sharedData.listingInfo.title) {
      setListingInfo({
        title: sharedData.listingInfo.title,
        currentPrice: sharedData.listingInfo.currentPrice,
        seller: sharedData.listingInfo.seller,
        isAuction: sharedData.listingInfo.isAuction || false,
        timeRemaining: sharedData.listingInfo.timeRemaining,
        bids: sharedData.listingInfo.bids
      });
      setLoadingListingInfo(false);
      
      // Set default slider value based on listing type
      if (sharedData.listingInfo.isAuction) {
        setSliderValue([-5]); // Default for auctions: 5% below market
      } else {
        setSliderValue([5]); // Default for fixed-price: 5% discount
      }
    } else {
      // Get current listing information from the page
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        setLoadingListingInfo(true);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              { action: "getListingInfo" },
              (response) => {
                if (response && response.title) {
                  setListingInfo({
                    title: response.title,
                    currentPrice: response.price || 0,
                    seller: response.seller || 'seller',
                    isAuction: response.isAuction || false,
                    timeRemaining: response.timeRemaining,
                    bids: response.bids
                  });
                  
                  // Set default slider value based on listing type
                  if (response.isAuction) {
                    setSliderValue([-5]); // Default for auctions
                  } else {
                    setSliderValue([5]); // Default for fixed-price
                  }
                } else {
                  // If no response or error, set default demo data
                  setListingInfo({
                    title: 'Apple iPhone 12 Pro 128GB Unlocked Smartphone - Very Good Condition',
                    currentPrice: 499.99,
                    seller: 'tech_deals_store',
                    isAuction: false
                  });
                }
                setLoadingListingInfo(false);
              }
            );
          } else {
            // For development without chrome API or valid tab
            setListingInfo({
              title: 'Apple iPhone 12 Pro 128GB Unlocked Smartphone - Very Good Condition',
              currentPrice: 499.99,
              seller: 'tech_deals_store',
              isAuction: false
            });
            setLoadingListingInfo(false);
          }
        });
      } else {
        // For development without chrome API
        setListingInfo({
          title: 'Apple iPhone 12 Pro 128GB Unlocked Smartphone - Very Good Condition',
          currentPrice: 499.99,
          seller: 'tech_deals_store',
          isAuction: false
        });
        setLoadingListingInfo(false);
      }
    }
  }, [sharedData]);

  // Get the market context for offer generation
  const getMarketContext = (): string => {
    if (!hasMarketData || !sharedData?.priceData) return '';
    
    const marketAverage = sharedData.priceData.averagePrice;
    const currentPrice = listingInfo.currentPrice;
    const priceDifference = calculatePriceDifference(currentPrice, marketAverage);
    
    if (listingInfo.isAuction) {
      // Context for auction listings
      if (priceDifference < -20) {
        return "This auction is currently well below market value, but will likely increase as the auction progresses.";
      } else if (priceDifference < -5) {
        return "This auction is currently below market value, which is typical for auctions in progress.";
      } else if (priceDifference < 5) {
        return "The current bid is near market value. Consider your maximum bid carefully.";
      } else {
        return "The current bid is above market value. You may want to look for other options.";
      }
    } else {
      // Context for fixed-price listings
      if (priceDifference < -5) {
        return "Based on recent sales data, you're already offering a competitive price.";
      } else if (priceDifference >= 15) {
        return `Similar items typically sell for around $${marketAverage.toFixed(2)}, which is ${Math.abs(Math.round(priceDifference))}% lower than your current price.`;
      } else {
        return `Recent market data shows similar items selling for around $${marketAverage.toFixed(2)}.`;
      }
    }
  };

  const handleGenerateOffer = () => {
    setIsGenerating(true);
    
    // Get marketplace price data
    const marketPrice = hasMarketData && sharedData?.priceData ? sharedData.priceData.averagePrice : 0;
    
    // Calculate target price based on listing type
    let targetPrice: number;
    let percentValue: number = sliderValue[0];
    
    if (listingInfo.isAuction) {
      // For auctions, calculate relative to market value
      targetPrice = marketPrice > 0 
        ? marketPrice * (1 + percentValue / 100) 
        : listingInfo.currentPrice * (1 + percentValue / 100);
    } else {
      // For fixed-price, calculate as discount from listing price
      targetPrice = listingInfo.currentPrice * (1 - percentValue / 100);
    }
    
    // Select template based on context and premium status
    let templates = isPremium 
      ? (listingInfo.isAuction ? premiumTemplates.auction : premiumTemplates.fixedPrice)
      : (listingInfo.isAuction ? messageTemplates.auction : messageTemplates.fixedPrice);
    
    let template: string;
    let offerType: 'lowball' | 'fair' | 'sweetspot' | 'basic' = 'basic';
    
    if (listingInfo.isAuction) {
      // Select template based on bid position relative to market
      if (percentValue < -10) {
        template = templates.low;
        offerType = 'lowball';
      } else if (percentValue < 0) {
        template = templates.medium;
        offerType = 'sweetspot';
      } else {
        template = templates.high;
        offerType = 'fair';
      }
    } else {
      // Select template based on discount percentage
      if (percentValue > 10) {
        template = templates.high;
        offerType = 'lowball';
      } else if (percentValue > 5) {
        template = templates.medium;
        offerType = 'sweetspot';
      } else {
        template = templates.low;
        offerType = 'fair';
      }
    }
    
    // Replace placeholders in template
    let message = template
      .replace('{seller}', listingInfo.seller || 'seller')
      .replace('{title}', listingInfo.title)
      .replace('{discount}', percentValue.toString())
      .replace('${price}', listingInfo.currentPrice.toFixed(2))
      .replace(/\${targetPrice}/g, targetPrice.toFixed(2))
      .replace(/\${marketPrice}/g, marketPrice.toFixed(2));
      
    // Add market data if available
    const marketContext = getMarketContext();
    if (marketContext && isPremium) {
      // Insert market context into the message for premium users
      message = message.replace('Thanks for your consideration.', `${marketContext} Thanks for your consideration.`);
    }
    
    // Calculate bid percentage relative to market (for auctions)
    let bidPercentToMarket: number | undefined;
    if (listingInfo.isAuction && marketPrice > 0) {
      bidPercentToMarket = ((targetPrice / marketPrice) - 1) * 100;
    }
    
    // Save to offer history
    const offerData = {
      itemTitle: listingInfo.title,
      itemPrice: listingInfo.currentPrice,
      marketPrice,
      offerPrice: targetPrice,
      offerType,
      message,
      seller: listingInfo.seller,
      isAuction: listingInfo.isAuction,
      bidPercentToMarket
    };
    
    // Simulate message generation delay
    setTimeout(() => {
      setGeneratedMessage(message);
      setIsGenerating(false);
      
      // Save to history in the background
      saveOfferToHistory(offerData)
        .then(() => console.log('Offer saved to history'))
        .catch(err => console.error('Error saving offer:', err));
        
      toast.success("Negotiation message generated");
    }, 800);
  };
  
  const copyToClipboard = () => {
    if (generatedMessage) {
      navigator.clipboard.writeText(generatedMessage).then(() => {
        setIsCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };
  
  // Calculate target price to display
  const getTargetPrice = (): string => {
    if (!listingInfo.currentPrice) return '0.00';
    
    const marketPrice = hasMarketData && sharedData?.priceData ? sharedData.priceData.averagePrice : 0;
    const percentValue = sliderValue[0];
    
    if (listingInfo.isAuction && marketPrice > 0) {
      // For auctions, calculate relative to market value
      return (marketPrice * (1 + percentValue / 100)).toFixed(2);
    } else if (listingInfo.isAuction) {
      // Fallback for auctions without market data
      return (listingInfo.currentPrice * (1 + percentValue / 100)).toFixed(2);
    } else {
      // For fixed-price, calculate as discount
      return (listingInfo.currentPrice * (1 - percentValue / 100)).toFixed(2);
    }
  };
  
  // Determine whether to show free mode or premium mode
  const showFreeMode = !isPremium;
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">
          {listingInfo.isAuction ? 'Auction Strategy' : 'Negotiate Price'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {listingInfo.isAuction 
            ? 'Generate a bidding strategy or message for this auction.' 
            : 'Generate a polite negotiation message to send to the seller.'}
        </p>
      </div>
      
      {/* Free user search limit indicator */}
      {!isPremium && (
        <Alert variant="premium" className="mb-3 py-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
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
      
      {isPremium && (
        <Alert variant="premium" className="mb-3">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs">
            Premium enabled: {listingInfo.isAuction 
              ? 'Advanced auction strategy with market insights' 
              : 'Enhanced negotiation with market data insights'}
          </AlertDescription>
        </Alert>
      )}
      
      {hasMarketData && (
        <Card className="mb-3 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                Market Data Available
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-xs">
                      ${sharedData?.priceData?.averagePrice.toFixed(2)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Market average from {sharedData?.priceData?.itemCount} items</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="text-xs text-blue-800">
              {listingInfo.isAuction 
                ? 'Market data is being used to suggest optimal bidding strategy.' 
                : 'Market data is being used to suggest an optimal discount.'}
            </div>
            
            {isPremium && (
              <div className="text-xs mt-2 flex items-center text-blue-600">
                <Sparkles className="h-3 w-3 mr-1" />
                <span>Premium: {listingInfo.isAuction 
                  ? 'Advanced auction strategy templates'
                  : 'Advanced market-based negotiation templates'}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Show seller analytics for premium users */}
      {isPremium && listingInfo.seller && (
        <SellerAnalytics 
          sellerName={listingInfo.seller} 
          isAuction={listingInfo.isAuction}
          timeRemaining={listingInfo.timeRemaining}
        />
      )}
      
      {/* Negotiation Slider - shown for BOTH premium and free users */}
      <Card className="mb-4">
        <CardContent className="p-4">
          {/* Adaptive Slider Component */}
          <NegotiationSlider
            isAuction={listingInfo.isAuction || false}
            listingInfo={listingInfo}
            marketData={hasMarketData ? sharedData?.priceData || null : null}
            value={sliderValue}
            onValueChange={setSliderValue}
            isPremium={isPremium}
          />
          
          <div className="text-sm mt-4">
            <div className="flex justify-between mb-1">
              <span>Current {listingInfo.isAuction ? 'Bid' : 'Price'}:</span>
              <span className="font-medium">
                ${listingInfo.currentPrice > 0 ? listingInfo.currentPrice.toFixed(2) : 'XX.XX'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{listingInfo.isAuction ? 'Target Bid' : 'Target Price'}:</span>
              <span className="font-medium text-primary">${getTargetPrice()}</span>
            </div>
            {hasMarketData && (
              <div className="flex justify-between mt-1">
                <span>Market Average:</span>
                <span className="font-medium text-blue-600">
                  ${sharedData?.priceData?.averagePrice.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Premium offer generator - for premium users only */}
      {isPremium && hasMarketData ? (
        <PremiumOfferGenerator
          listingInfo={listingInfo}
          marketData={sharedData?.priceData || null}
          discountPercentage={sliderValue}
        />
      ) : (
        // Free version offer generator
        <>
          <Button 
            className="mb-6"
            onClick={handleGenerateOffer}
            disabled={isGenerating || (!isPremium && searchesRemaining <= 0)}
            variant={isPremium ? "premium" : "default"}
          >
            {isGenerating ? 'Generating...' : `Generate ${listingInfo.isAuction ? 'Auction' : 'Offer'} Message`}
          </Button>
          
          {generatedMessage && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">
                    {listingInfo.isAuction ? 'Auction Message:' : 'Offer Message:'}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="h-8 px-2"
                  >
                    {isCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                  </Button>
                </div>
                <Textarea 
                  value={generatedMessage} 
                  readOnly 
                  className="min-h-[120px] text-sm"
                />
                
                {!isPremium && (
                  <div className="mt-2 text-xs text-blue-600 flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    <span>Upgrade to Premium for market data-enhanced {listingInfo.isAuction ? 'auction' : 'negotiation'} templates</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      <div className="mt-auto flex flex-col gap-2">
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() => window.open(`https://www.amazon.com/s?k=${encodeURIComponent(listingInfo.title)}`, '_blank')}
        >
          Check Alternatives
        </Button>
        
        <AffiliateButton 
          productName={listingInfo.title}
          className="bg-blue-600 hover:bg-blue-700"
          buttonText="Buy New Now"
        />
      </div>
    </div>
  );
};

export default Negotiate;
