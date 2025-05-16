
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader, Search, ExternalLink } from "lucide-react";
import AffiliateButton from "@/components/AffiliateButton";
import { Badge } from "@/components/ui/badge";

interface ActionButtonsProps {
  loading: boolean;
  onCheckPrice: () => void;
  productTitle: string;
  itemId?: string;
  searchesRemaining?: number;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  loading,
  onCheckPrice,
  productTitle,
  itemId,
  searchesRemaining
}) => {
  const openOnEbay = () => {
    if (itemId) {
      window.open(`https://www.ebay.com/itm/${itemId}`, '_blank');
    } else {
      window.open(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(productTitle)}`, '_blank');
    }
  };
  
  return (
    <div className="space-y-2 mt-1">
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="default"
          className="text-xs font-medium h-9 w-full relative flex items-center justify-center"
          onClick={onCheckPrice}
          disabled={loading || (searchesRemaining !== undefined && searchesRemaining <= 0)}
        >
          {loading ? (
            <>
              <Loader className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <>
              <Search className="mr-1.5 h-3.5 w-3.5" />
              <span>Check Price</span>
              {searchesRemaining !== undefined && searchesRemaining <= 3 && searchesRemaining > 0 && (
                <Badge variant="premium" className="absolute -top-2 -right-2 scale-75 bg-blue-500">
                  {searchesRemaining} left
                </Badge>
              )}
            </>
          )}
        </Button>
        
        <Button 
          variant="secondary"
          className="text-xs font-medium h-9 w-full flex items-center justify-center" 
          onClick={openOnEbay}
        >
          <span>{itemId ? 'View on eBay' : 'Search on eBay'}</span>
          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
      
      <AffiliateButton 
        productName={productTitle}
        buttonText="Buy New on Amazon"
        className="bg-blue-600 hover:bg-blue-700 w-full text-xs font-medium h-9 flex items-center justify-center"
      />
    </div>
  );
};

export default ActionButtons;
