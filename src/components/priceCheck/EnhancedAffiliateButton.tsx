
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart, ChevronRight, ArrowRight, ExternalLink } from "lucide-react";
import { generateAffiliateUrl, getAffiliateId } from "@/utils/affiliate/affiliateUtils";
import { toast } from "@/components/ui/sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EnhancedAffiliateButtonProps {
  productName: string;
  currentPrice?: number;
  suggestedNewPrice?: number;
  condition?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const EnhancedAffiliateButton: React.FC<EnhancedAffiliateButtonProps> = ({ 
  productName, 
  currentPrice,
  suggestedNewPrice,
  condition,
  className = "", 
  variant = "default"
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate potential savings if we have both prices
  const hasSavings = currentPrice && suggestedNewPrice && suggestedNewPrice > currentPrice;
  const savingsAmount = hasSavings ? suggestedNewPrice - currentPrice : 0;
  const savingsPercent = hasSavings ? Math.round((savingsAmount / suggestedNewPrice) * 100) : 0;
  
  // Determine if it's a used item
  const isUsed = condition && !/new|sealed/i.test(condition);
  
  const handleClick = async () => {
    setIsLoading(true);
    
    try {
      // Get affiliate ID for the marketplace
      const affiliateId = await getAffiliateId('amazon');
      
      // Generate the affiliate URL
      const affiliateUrl = await generateAffiliateUrl(productName, affiliateId);
      console.log("Opening affiliate URL:", affiliateUrl);
      
      // Track the click if in extension environment
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          action: "trackAffiliateClick",
          data: { 
            productName, 
            affiliateUrl,
            marketplace: 'amazon',
            currentPrice,
            condition,
            timestamp: new Date().toISOString(),
            source: 'enhancedAffiliate'
          }
        });
      }
      
      // Open the URL in a new tab
      window.open(affiliateUrl, '_blank');
      toast.success("Opening Amazon in a new tab");
    } catch (error) {
      console.error("Error handling affiliate link:", error);
      toast.error("Could not open affiliate link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Button text based on condition
  const getButtonText = () => {
    if (isUsed) {
      return "Buy New on Amazon";
    } else {
      return "Compare on Amazon";
    }
  };
  
  return (
    <div className="space-y-1.5">
      {hasSavings && isUsed && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-green-50 rounded-md p-2 text-xs text-green-800 flex items-center justify-center border border-green-100 cursor-help">
                <span className="font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Potential savings: {savingsPercent}% ({new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD' 
                  }).format(savingsAmount)})
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="p-2 max-w-[250px]">
              <p className="text-xs">
                Buying this used item instead of new could save you money!
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <div className="flex flex-col space-y-1">
        <Button 
          className={`w-full font-medium flex items-center justify-center h-10 ${className} ${isExpanded ? 'rounded-b-none' : ''}`}
          variant={variant}
          onClick={handleClick}
          disabled={isLoading}
        >
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
          <span className="text-xs">{isLoading ? 'Loading...' : getButtonText()}</span>
        </Button>
        
        {isExpanded && (
          <div className="bg-muted p-3 text-xs border border-t-0 rounded-b-md">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="font-medium text-gray-700">Current Price:</div>
              <div className="text-right">
                {currentPrice ? new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'USD' 
                }).format(currentPrice) : 'N/A'}
              </div>
              <div className="font-medium text-gray-700">Condition:</div>
              <div className="text-right">{condition || 'N/A'}</div>
            </div>
            
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs w-full justify-end text-blue-600"
              onClick={handleClick}
            >
              <span>View on Amazon</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs justify-center p-0 text-gray-500 hover:text-gray-700 hover:bg-transparent"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>{isExpanded ? "Less details" : "More details"}</span>
          <ChevronRight className={`ml-1 h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default EnhancedAffiliateButton;
