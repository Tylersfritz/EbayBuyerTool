
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Clock, AlertCircle, Timer } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SellerAnalyticsProps {
  sellerName: string;
  isAuction?: boolean;
  timeRemaining?: string;
}

// Note: In a real implementation, this would fetch data from an API or database
// For now, we're using deterministic mock data based on the seller name

const SellerAnalytics: React.FC<SellerAnalyticsProps> = ({ sellerName, isAuction = false, timeRemaining }) => {
  if (!sellerName) return null;
  
  // Generate consistent analytics based on seller name
  const getSellerHash = (name: string): number => {
    return name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  };
  
  const hash = Math.abs(getSellerHash(sellerName));
  
  // Generate ratings between 60-95%
  const responseRate = (hash % 35) + 60;
  
  // Generate acceptance rate between 40-85%
  const acceptanceRate = (hash % 45) + 40;
  
  // Response time options
  const responseTimeOptions = [
    "Usually responds within 1 hour",
    "Usually responds within 2 hours",
    "Usually responds within 4 hours",
    "Usually responds same day",
    "Usually responds within 24 hours"
  ];
  const responseTimeIndex = hash % responseTimeOptions.length;
  
  // Offer success rate text
  const getSuccessRateText = (): string => {
    if (isAuction) {
      // For auctions, provide bidding-specific insights
      if (acceptanceRate > 75) return "High competition for this seller's items";
      if (acceptanceRate > 60) return "Moderate bidding activity on listings";
      if (acceptanceRate > 45) return "Auctions often end below market value";
      return "Potential for good deals at auction end";
    } else {
      // For fixed-price listings
      if (acceptanceRate > 75) return "High chance of accepting offers";
      if (acceptanceRate > 60) return "Moderate chance of accepting offers";
      if (acceptanceRate > 45) return "May consider reasonable offers";
      return "Rarely accepts offers";
    }
  };
  
  // Rating color
  const getRatingColor = (rating: number): string => {
    if (rating > 80) return "text-green-600";
    if (rating > 65) return "text-blue-600";
    if (rating > 50) return "text-amber-600";
    return "text-red-600";
  };
  
  return (
    <Card className="border-blue-100 mb-3">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium flex items-center">
            <MessageSquare className="h-3 w-3 mr-1 text-blue-500" />
            Seller Analytics
          </span>
          <Badge variant="premium" className="text-[0.65rem]">
            Premium
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Response Rate:</span>
              <span className={getRatingColor(responseRate)}>{responseRate}%</span>
            </div>
            <Progress value={responseRate} className="h-1" />
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>{isAuction ? "Auction Competition:" : "Offer Acceptance:"}</span>
              <span className={getRatingColor(acceptanceRate)}>{acceptanceRate}%</span>
            </div>
            <Progress value={acceptanceRate} className="h-1" />
          </div>
          
          {/* Show time remaining for auctions */}
          {isAuction && timeRemaining && (
            <div className="flex items-center text-xs mt-1 text-amber-600 font-medium">
              <Timer className="h-3 w-3 mr-1" />
              <span>Time remaining: {timeRemaining}</span>
            </div>
          )}
          
          {/* Show response time for fixed-price listings */}
          {!isAuction && (
            <div className="flex items-center text-xs mt-1 text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{responseTimeOptions[responseTimeIndex]}</span>
            </div>
          )}
          
          <div className="flex items-center text-xs mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center cursor-help">
                    <AlertCircle className="h-3 w-3 mr-1 text-blue-500" />
                    <span className="text-blue-700">{getSuccessRateText()}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Based on seller history and similar items</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerAnalytics;
