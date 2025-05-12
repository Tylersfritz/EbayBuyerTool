
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, MessageSquare } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Progress } from "@/components/ui/progress";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { saveToStorage, getFromStorage } from "@/utils/extensionUtils";
import { calculatePriceDifference } from "@/utils/extensionUtils";
import { OfferType, ToneType, SavedOffer, PremiumOfferGeneratorProps } from './types/offerTypes';
import OfferMessageCard from './OfferMessageCard';
import OfferHistory from './OfferHistory';
import ToneSelector from './ToneSelector';
import { 
  getOfferPrice, 
  getSuccessProbability, 
  getMarketContext, 
  getMessageTemplate,
  getSellerResponseRate,
  getSellerResponseTime 
} from './utils/offerUtils';

const PremiumOfferGenerator: React.FC<PremiumOfferGeneratorProps> = ({
  listingInfo,
  marketData,
  discountPercentage
}) => {
  const [activeOfferType, setActiveOfferType] = useState<OfferType>('fair');
  const [tone, setTone] = useState<ToneType>('friendly');
  const [generatedMessages, setGeneratedMessages] = useState<Record<OfferType, string>>({
    lowball: '',
    fair: '',
    sweetspot: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [offerHistory, setOfferHistory] = useState<SavedOffer[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const marketPrice = marketData?.averagePrice || 0;
  
  // Use slider value in price calculations
  useEffect(() => {
    // When the discount percentage changes from the slider, adjust offer prices accordingly
    if (discountPercentage.length > 0) {
      // Update calculations based on new slider values if needed
      console.log("Slider value updated:", discountPercentage[0]);
    }
  }, [discountPercentage]);
  
  // Load offer history on component mount
  useEffect(() => {
    const loadOfferHistory = async () => {
      const history = await getFromStorage<SavedOffer[]>('offerHistory') || [];
      setOfferHistory(history);
    };
    
    loadOfferHistory();
  }, []);
  
  // Generate all offer messages, now using the slider value
  const handleGenerateOffers = () => {
    setIsGenerating(true);
    
    // Generate messages for all offer types
    const messages: Record<OfferType, string> = {
      lowball: '',
      fair: '',
      sweetspot: ''
    };
    
    // Process each offer type
    const offerTypes: OfferType[] = ['lowball', 'fair', 'sweetspot'];
    
    offerTypes.forEach(type => {
      const offerPrice = getOfferPrice(
        type, 
        listingInfo.isAuction, 
        listingInfo.currentPrice, 
        marketPrice, 
        discountPercentage[0]
      );
      
      const marketContext = getMarketContext(
        type, 
        listingInfo.currentPrice, 
        marketPrice, 
        offerPrice
      );
      
      // Get template based on tone and offer type
      let template = getMessageTemplate(type, tone);
      
      // Replace placeholders in template
      let message = template
        .replace('{seller}', listingInfo.seller || 'seller')
        .replace('{title}', listingInfo.title)
        .replace(/\${offerPrice}/g, offerPrice.toFixed(2))
        .replace(/\${marketPrice}/g, marketPrice.toFixed(2));
        
      // Add market context if available
      if (marketContext) {
        // Insert market context into the message
        message = message.replace('Thanks for', `${marketContext} Thanks for`);
      }
      
      messages[type] = message;
    });
    
    // Simulate message generation delay
    setTimeout(() => {
      setGeneratedMessages(messages);
      setIsGenerating(false);
      toast.success("Premium offers generated!");
    }, 800);
  };
  
  // Copy the selected message to clipboard
  const copyToClipboard = (message: string) => {
    if (message) {
      navigator.clipboard.writeText(message).then(() => {
        setIsCopied(true);
        toast.success("Copied to clipboard!");
        
        // Save to offer history
        saveOfferToHistory(message);
        
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };
  
  // Save the current offer to history
  const saveOfferToHistory = async (message: string) => {
    const newOffer: SavedOffer = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      itemTitle: listingInfo.title,
      itemPrice: listingInfo.currentPrice,
      marketPrice: marketPrice,
      offerType: activeOfferType,
      tone: tone,
      offerPrice: getOfferPrice(
        activeOfferType, 
        listingInfo.isAuction, 
        listingInfo.currentPrice, 
        marketPrice, 
        discountPercentage[0]
      ),
      message: message,
      seller: listingInfo.seller,
      isAuction: listingInfo.isAuction
    };
    
    const updatedHistory = [newOffer, ...offerHistory].slice(0, 20); // Keep last 20 offers
    setOfferHistory(updatedHistory);
    
    // Save to storage
    await saveToStorage('offerHistory', updatedHistory);
  };
  
  // Use a previous offer from history
  const useHistoricalOffer = (offer: SavedOffer) => {
    setActiveOfferType(offer.offerType);
    setTone(offer.tone);
    
    // Set the generated messages to include the historical one
    const updatedMessages = { ...generatedMessages };
    updatedMessages[offer.offerType] = offer.message;
    setGeneratedMessages(updatedMessages);
    
    setShowHistory(false);
    toast.success("Historical offer loaded!");
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center">
          <Sparkles className="h-4 w-4 mr-1 text-blue-500" />
          Premium Offer Generator
        </h3>
        
        <OfferHistory 
          history={offerHistory}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          onSelectOffer={useHistoricalOffer}
        />
      </div>
      
      <Card className="border-blue-100">
        <CardContent className="p-3">
          <ToneSelector value={tone} onChange={setTone} />
          
          {marketData && marketData.averagePrice > 0 && (
            <div className="mb-2 text-xs">
              <div className="flex justify-between mb-1">
                <span>Market Average:</span>
                <span className="font-medium text-blue-600">${marketData.averagePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Current Price:</span>
                <span className="font-medium">${listingInfo.currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Price Difference:</span>
                <span className={`font-medium ${calculatePriceDifference(listingInfo.currentPrice, marketData.averagePrice) > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {calculatePriceDifference(listingInfo.currentPrice, marketData.averagePrice) > 0 ? '+' : ''}
                  {Math.round(calculatePriceDifference(listingInfo.currentPrice, marketData.averagePrice))}%
                </span>
              </div>
            </div>
          )}
          
          {/* Target Price Information */}
          {discountPercentage.length > 0 && (
            <div className="mt-2 border-t border-blue-50 pt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>{listingInfo.isAuction ? 'Target Bid:' : 'Target Offer:'}</span>
                <span className="font-medium text-primary">
                  ${getOfferPrice('sweetspot', listingInfo.isAuction, listingInfo.currentPrice, marketPrice, discountPercentage[0]).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Calculated From:</span>
                <span className="font-medium">
                  {listingInfo.isAuction 
                    ? `${discountPercentage[0] > 0 ? '+' : ''}${discountPercentage[0]}% to market` 
                    : `${discountPercentage[0]}% discount`}
                </span>
              </div>
            </div>
          )}
          
          {/* Seller analytics section */}
          {listingInfo.seller && (
            <div className="mt-3 border-t border-blue-50 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Seller Analytics:
                </span>
                <Badge variant="outline" className="h-5 text-[0.65rem]">
                  Premium
                </Badge>
              </div>
              
              <div className="mt-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>Response Rate:</span>
                  <span className="font-medium">{getSellerResponseRate(listingInfo.seller)}%</span>
                </div>
                <Progress value={getSellerResponseRate(listingInfo.seller)} className="h-1" />
                
                <div className="text-xs mt-1 text-muted-foreground">
                  Typically responds within {getSellerResponseTime(listingInfo.seller)}
                </div>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleGenerateOffers}
            disabled={isGenerating || !marketData}
            variant="premium"
            className="w-full mt-3"
            size="sm"
          >
            {isGenerating ? 'Generating...' : 'Generate Premium Offers'}
          </Button>
        </CardContent>
      </Card>
      
      {Object.values(generatedMessages).some(msg => !!msg) && (
        <Tabs value={activeOfferType} onValueChange={(v) => setActiveOfferType(v as OfferType)} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-2">
            <TabsTrigger value="lowball" className="text-xs h-8">
              Lowball
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="ml-1 text-[0.6rem]">
                      {Math.round(getSuccessProbability('lowball', listingInfo.currentPrice, marketPrice))}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Success probability</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsTrigger>
            <TabsTrigger value="fair" className="text-xs h-8">
              Fair Market
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="ml-1 text-[0.6rem]">
                      {Math.round(getSuccessProbability('fair', listingInfo.currentPrice, marketPrice))}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Success probability</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsTrigger>
            <TabsTrigger value="sweetspot" className="text-xs h-8">
              Sweet Spot
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="ml-1 text-[0.6rem]">
                      {Math.round(getSuccessProbability('sweetspot', listingInfo.currentPrice, marketPrice))}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Success probability</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="lowball" className="mt-0">
            <OfferMessageCard 
              message={generatedMessages.lowball}
              copyToClipboard={() => copyToClipboard(generatedMessages.lowball)}
              isCopied={isCopied}
              offerPrice={getOfferPrice('lowball', listingInfo.isAuction, listingInfo.currentPrice, marketPrice, discountPercentage[0])}
              marketPrice={marketPrice}
              listingPrice={listingInfo.currentPrice}
            />
          </TabsContent>
          
          <TabsContent value="fair" className="mt-0">
            <OfferMessageCard 
              message={generatedMessages.fair}
              copyToClipboard={() => copyToClipboard(generatedMessages.fair)}
              isCopied={isCopied}
              offerPrice={getOfferPrice('fair', listingInfo.isAuction, listingInfo.currentPrice, marketPrice, discountPercentage[0])}
              marketPrice={marketPrice}
              listingPrice={listingInfo.currentPrice}
            />
          </TabsContent>
          
          <TabsContent value="sweetspot" className="mt-0">
            <OfferMessageCard 
              message={generatedMessages.sweetspot}
              copyToClipboard={() => copyToClipboard(generatedMessages.sweetspot)}
              isCopied={isCopied}
              offerPrice={getOfferPrice('sweetspot', listingInfo.isAuction, listingInfo.currentPrice, marketPrice, discountPercentage[0])}
              marketPrice={marketPrice}
              listingPrice={listingInfo.currentPrice}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PremiumOfferGenerator;
