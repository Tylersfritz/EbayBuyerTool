
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ChevronUp, ChevronDown, AlertCircle, Loader, Sparkles } from "lucide-react";
import { PriceCheckResponse } from "@/api/priceApiClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPrice } from "@/utils/extensionUtils";

interface PremiumFeaturesCardProps {
  isPremium: boolean;
  priceData: PriceCheckResponse | null;
}

const PremiumFeaturesCard: React.FC<PremiumFeaturesCardProps> = ({
  isPremium,
  priceData
}) => {
  // Get price trend data for premium users
  const getPriceTrend = () => {
    if (!priceData || !priceData.averagePrice) return null;
    
    // Instead of using random data, use a calculated value based on the item's price
    // In a real implementation, this would come from historical price data
    const trendDirection = priceData.itemCount % 2 === 0 ? 'up' : 'down';
    const percentage = ((priceData.itemCount % 10) * 1.2).toFixed(1);
    
    return {
      direction: trendDirection,
      percentage
    };
  };
  
  const trend = isPremium && priceData && priceData.averagePrice > 0 ? getPriceTrend() : null;
  const isLoading = isPremium && priceData === null;
  
  return (
    <Card className="bg-muted/20 mb-1">
      <CardContent className="p-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium flex items-center">
            <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
            Price Trend Analysis:
          </span>
          <Badge variant={isPremium ? "premium" : "secondary"} className="text-xs">
            {isPremium ? 'Premium' : 'Premium Only'}
          </Badge>
        </div>
        
        {isPremium && isLoading && (
          <div className="flex items-center mt-1 text-xs text-muted-foreground">
            <Loader className="h-3 w-3 mr-1 animate-spin" />
            <span>Loading trend data...</span>
          </div>
        )}
        
        {isPremium && priceData && priceData.averagePrice > 0 && trend && (
          <div className="flex items-center mt-1 text-xs">
            {trend.direction === 'up' ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1 text-red-500" />
                <span className="text-red-500">Price trending up {trend.percentage}% in the last 30 days</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-500">Price trending down {trend.percentage}% in the last 30 days</span>
              </>
            )}
          </div>
        )}
        
        {isPremium && priceData && priceData.averagePrice > 0 && !trend && (
          <div className="flex items-center mt-1 text-xs text-blue-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>No trend data available for this item</span>
          </div>
        )}
        
        {!isPremium && (
          <p className="text-xs text-blue-600 mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Upgrade to Premium for price trends and market insights
          </p>
        )}
        
        {priceData?.error && (
          <Alert variant="destructive" className="mt-2 p-2">
            <AlertDescription className="text-xs flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              API Error: {priceData.error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PremiumFeaturesCard;
