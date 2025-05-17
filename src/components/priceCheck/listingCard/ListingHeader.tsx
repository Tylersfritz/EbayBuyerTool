
import React from 'react';
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Gavel, TagIcon } from "lucide-react";

interface ListingHeaderProps {
  itemId?: string;
  isAuction: boolean;
  title: string;
}

const ListingHeader: React.FC<ListingHeaderProps> = ({ 
  itemId, 
  isAuction,
  title
}) => {
  return (
    <>
      {/* Header with item ID and listing type badge */}
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs text-gray-600 font-medium flex items-center">
          {itemId && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center">
                    <Info className="h-3 w-3 mr-1 text-gray-400" />
                    Item #{itemId.substring(0, 6)}...
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Full ID: {itemId}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </p>
        
        {isAuction ? (
          <Badge variant="warning" className="text-xs px-2 py-0.5 flex items-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-200">
            <Gavel className="h-3 w-3" />
            Auction
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs px-2 py-0.5 flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
            <TagIcon className="h-3 w-3" />
            Fixed Price
          </Badge>
        )}
      </div>
      
      {/* Item title */}
      <p className="text-sm font-semibold line-clamp-2 mb-1.5">{title}</p>
    </>
  );
};

export default ListingHeader;
