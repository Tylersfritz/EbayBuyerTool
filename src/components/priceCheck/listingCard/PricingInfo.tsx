
import React from 'react';
import { cn } from "@/lib/utils";
import { DollarSign, TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PricingInfoProps {
  isAuction: boolean;
  currentPrice: number;
  originalPrice?: number;
  buyItNowPrice?: number | string;
  discountPercentage?: number;
}

const PricingInfo: React.FC<PricingInfoProps> = ({
  isAuction,
  currentPrice,
  originalPrice,
  buyItNowPrice,
  discountPercentage
}) => {
  const formatPrice = (price: number | string): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericPrice);
  };
  
  const isOnSale = !isAuction && 
                 !!originalPrice && 
                 currentPrice < originalPrice;
                 
  const isPriceBelowMarket = buyItNowPrice && 
                           currentPrice < (typeof buyItNowPrice === 'string' ? 
                                           parseFloat(buyItNowPrice) : buyItNowPrice);

  return (
    <div>
      {!isAuction && (
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
          
          {isOnSale && originalPrice && (
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600">Original:</span>
              <div className="flex items-center">
                <span className="text-xs line-through text-gray-500 mr-1">
                  {formatPrice(originalPrice)}
                </span>
                <Badge variant="success" className="text-xs px-1 py-0 bg-green-100 text-green-800">
                  -{Math.round(discountPercentage || 
                    ((originalPrice - currentPrice) / originalPrice * 100))}%
                </Badge>
              </div>
            </div>
          )}
        </>
      )}

      {isAuction && (
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
          
          {buyItNowPrice && (
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600 flex items-center">
                <TagIcon className="h-3 w-3 mr-1 text-blue-500" />
                Buy It Now:
              </span>
              <span className="text-xs font-medium">
                {formatPrice(buyItNowPrice)}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PricingInfo;
