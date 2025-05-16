
import React from 'react';

interface PromotionAlertProps {
  isAuction: boolean;
  isOnSale: boolean;
  originalPrice?: number;
  currentPrice: number;
  marketRate?: number | null;
}

const PromotionAlert: React.FC<PromotionAlertProps> = ({
  isAuction,
  isOnSale,
  originalPrice,
  currentPrice,
  marketRate
}) => {
  // Format the profit amount
  const formatPrice = (price: number | string): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericPrice);
  };
  
  return (
    <>
      {/* Sale notifications */}
      {!isAuction && isOnSale && originalPrice && (
        <div className="mt-1 px-2 py-0.5 rounded-sm border text-xs bg-green-50 border-green-100 text-green-800">
          <p className="font-medium">
            Save {formatPrice((originalPrice || 0) - currentPrice)} off original price!
          </p>
        </div>
      )}
      
      {/* Market rate info (if available) */}
      {marketRate && (
        <div className="mt-1 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100">
          <p className="text-xs text-blue-800 font-medium">
            {isAuction ? "Auction Market Rate" : "Market Rate"}: {formatPrice(marketRate)}
          </p>
        </div>
      )}
    </>
  );
};

export default PromotionAlert;
