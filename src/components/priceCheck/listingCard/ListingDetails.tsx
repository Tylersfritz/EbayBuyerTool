
import React from 'react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ListingDetailsProps {
  condition?: string;
  shipping?: number | string;
  seller?: string;
  sellerFeedbackScore?: number;
  sellerPositivePercentage?: number;
  returnPolicy?: string;
  quantityAvailable?: number;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({
  condition,
  shipping,
  seller,
  sellerFeedbackScore,
  sellerPositivePercentage,
  returnPolicy,
  quantityAvailable
}) => {
  return (
    <div className="space-y-1">
      {/* Condition + Shipping on same row */}
      <div className="grid grid-cols-2 gap-1">
        {condition && (
          <div className="flex justify-between">
            <span className="text-xs font-medium text-gray-600">Condition:</span>
            <span className="text-xs">{condition}</span>
          </div>
        )}
        {shipping && (
          <div className="flex justify-between">
            <span className="text-xs font-medium text-gray-600">Shipping:</span>
            <span className="text-xs">{shipping}</span>
          </div>
        )}
      </div>
      
      {/* Seller info */}
      {seller && (
        <div className="flex justify-between">
          <span className="text-xs font-medium text-gray-600">Seller:</span>
          <div className="flex items-center">
            <span className="text-xs truncate ml-1 max-w-[60px]">{seller}</span>
            {sellerFeedbackScore && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="ml-1 text-[0.65rem] px-1 py-0 h-4">
                      {sellerPositivePercentage}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Feedback score: {sellerFeedbackScore}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      )}
      
      {/* Returns policy */}
      {returnPolicy && (
        <div className="flex justify-between">
          <span className="text-xs font-medium text-gray-600">Returns:</span>
          <span className="text-xs">{returnPolicy}</span>
        </div>
      )}
      
      {/* Quantity available for fixed price listings */}
      {quantityAvailable && quantityAvailable > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600">Quantity:</span>
          <span className="text-xs font-medium">
            {quantityAvailable} available
          </span>
        </div>
      )}
    </div>
  );
};

export default ListingDetails;
