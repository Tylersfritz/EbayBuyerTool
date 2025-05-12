
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, BadgeCheck } from "lucide-react";
import { mockConditionData } from './utils/mockData';
import { useModeContext } from '@/context/ModeContext';

interface ConditionItem {
  condition: string;
  averagePrice: number;
  itemCount: number;
}

interface ConditionValueAnalysisProps {
  loading: boolean;
  currentCondition: string;
  currentPrice: number;
  conditionData?: ConditionItem[];
}

const ConditionValueAnalysis: React.FC<ConditionValueAnalysisProps> = ({
  loading,
  currentCondition,
  currentPrice,
  conditionData
}) => {
  const { isAuctionMode } = useModeContext();
  
  // Map condition strings to standardized values for comparison
  const mapCondition = (condition: string): string => {
    const normalizedCondition = condition.toLowerCase();
    
    if (normalizedCondition.includes('new') && normalizedCondition.includes('seal')) {
      return 'New/Sealed';
    } else if (normalizedCondition.includes('new')) {
      return 'New';
    } else if (normalizedCondition.includes('like new') || normalizedCondition.includes('excellent')) {
      return 'Like New';
    } else if (normalizedCondition.includes('very good')) {
      return 'Very Good';
    } else if (normalizedCondition.includes('good')) {
      return 'Good';
    } else if (normalizedCondition.includes('acceptable')) {
      return 'Acceptable';
    } else if (normalizedCondition.includes('refurb')) {
      return 'Refurbished';
    } else if (normalizedCondition.includes('parts') || normalizedCondition.includes('not working')) {
      return 'For Parts';
    } else {
      return 'Used';
    }
  };
  
  // Map condition to relative value (lower is better condition)
  const getConditionRank = (condition: string): number => {
    const rankMap: Record<string, number> = {
      'New/Sealed': 1,
      'New': 2,
      'Like New': 3,
      'Very Good': 4,
      'Good': 5,
      'Acceptable': 6,
      'Refurbished': 3.5, // Between Like New and Very Good
      'Used': 5,
      'For Parts': 7
    };
    
    return rankMap[condition] || 5;
  };
  
  // Format price for display
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };
  
  // Generate mock data if we don't have real data, making sure currentPrice is valid
  const validCurrentPrice = Math.max(currentPrice, 0.01);
  const allConditions = conditionData || 
    mockConditionData.map(item => ({
      ...item,
      // Adjust prices relative to the current price to ensure realistic relationships
      averagePrice: isAuctionMode 
        ? item.averagePrice * (validCurrentPrice / 389.99) // Scale based on the reference price in mockData
        : item.averagePrice
    }));
  
  // Get the current condition's standardized name
  const currentStandardCondition = mapCondition(currentCondition);
  const currentConditionRank = getConditionRank(currentStandardCondition);
  
  // Find the current condition in our data
  const currentConditionData = allConditions.find(c => 
    mapCondition(c.condition) === currentStandardCondition
  );
  
  // Calculate if current price is a good value for the condition
  const isGoodValue = currentConditionData ? 
    validCurrentPrice < currentConditionData.averagePrice :
    false;
  
  // Find better condition with lower price (great deal)
  const betterConditionLowerPrice = allConditions.find(c => {
    const condRank = getConditionRank(mapCondition(c.condition));
    return condRank < currentConditionRank && c.averagePrice <= validCurrentPrice;
  });
  
  return (
    <Card className="mb-2">
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm flex items-center justify-between">
          Condition Value Analysis
          {loading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <Badge variant={isGoodValue ? "success" : "outline"}>
              {isGoodValue ? 'Good Value' : 'Market Value'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        {loading ? (
          <>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </>
        ) : (
          <>
            <div className="text-xs grid grid-cols-3 gap-2 mb-2">
              <div className="bg-muted/20 p-2 rounded">
                <div className="font-medium mb-1 text-muted-foreground">This Item</div>
                <div className="font-semibold">{currentStandardCondition}</div>
                <div>{formatPrice(validCurrentPrice)}</div>
              </div>
              
              {allConditions.slice(0, 2).map((condition, index) => (
                <div key={index} className="bg-muted/20 p-2 rounded">
                  <div className="font-medium mb-1 text-muted-foreground">
                    {mapCondition(condition.condition)}
                  </div>
                  <div>{formatPrice(condition.averagePrice)}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {condition.itemCount} found
                  </div>
                </div>
              ))}
            </div>
            
            {betterConditionLowerPrice && (
              <div className="bg-green-50 p-2 rounded text-xs border border-green-100">
                <div className="flex items-start gap-2">
                  <BadgeCheck className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">Better condition available!</div>
                    <div className="text-green-700">
                      <span className="font-medium">{mapCondition(betterConditionLowerPrice.condition)}</span> condition 
                      items available for {formatPrice(betterConditionLowerPrice.averagePrice)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {isGoodValue && (
              <div className="bg-blue-50 p-2 rounded text-xs border border-blue-100">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800">Good value for condition</div>
                    <div className="text-blue-700">
                      This price is {formatPrice(currentConditionData!.averagePrice - validCurrentPrice)} below 
                      average for {currentStandardCondition} condition.
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!isGoodValue && !betterConditionLowerPrice && (
              <div className="bg-amber-50 p-2 rounded text-xs border border-amber-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-800">Consider other options</div>
                    <div className="text-amber-700">
                      Better value may be available in other conditions or from other sellers.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Generate mock condition data for demo purposes, ensuring non-zero prices
function generateMockConditionData(currentPrice: number, currentCondition: string): ConditionItem[] {
  // Make sure the current price is never zero or negative
  const validPrice = Math.max(currentPrice, 10);
  
  const conditions = [
    'New/Sealed',
    'New',
    'Like New',
    'Very Good',
    'Good',
    'Acceptable',
    'Refurbished',
    'For Parts'
  ];
  
  // Find current condition index
  const currentIndex = conditions.findIndex(c => c === currentCondition);
  const activeIndex = currentIndex >= 0 ? currentIndex : 4; // Default to 'Good' if not found
  
  // Generate price ranges - better condition = higher price
  const basePrice = validPrice * 1.2; // Start above current price
  
  return conditions.map((condition, index) => {
    // Calculate price based on condition - better condition = higher price
    const conditionFactor = 1 - (index * 0.15); // Each step down reduces price by ~15%
    const avgPrice = basePrice * conditionFactor;
    
    // If this is the current condition, make price slightly higher than current price
    const price = condition === currentCondition ? 
      validPrice * 1.1 : // Make average slightly higher for good deal
      avgPrice;
    
    // More common conditions have more items
    const popularityFactor = index === 0 || index === conditions.length - 1 ? 0.5 : 1;
    const count = Math.floor(15 * popularityFactor + Math.random() * 10);
    
    return {
      condition,
      averagePrice: Number(Math.max(price, 1).toFixed(2)), // Ensure no zero or negative prices
      itemCount: count
    };
  });
}

export default ConditionValueAnalysis;
