
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Bookmark, Check, Trash2, AlertTriangle, Loader } from "lucide-react";
import { ArbitrageOpportunity } from '@/utils/marketplaceAdapters/types';
import { formatPrice } from '@/utils/extensionUtils';

interface ArbitrageOpportunityCardProps {
  opportunity: ArbitrageOpportunity;
  onSave?: (opportunity: ArbitrageOpportunity) => void;
  isSaved?: boolean;
  isSaving?: boolean;
  onMarkAsSold?: (id: string) => void;
  onDelete?: (id: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const ArbitrageOpportunityCard: React.FC<ArbitrageOpportunityCardProps> = ({
  opportunity,
  onSave,
  isSaved = false,
  isSaving = false,
  onMarkAsSold,
  onDelete,
  isUpdating = false,
  isDeleting = false
}) => {
  const truncateTitle = (title: string, maxLength: number = 60) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };
  
  const formatMarketplace = (marketplace: string) => {
    return marketplace.charAt(0).toUpperCase() + marketplace.slice(1);
  };
  
  const getProfitClass = (profitMargin: number) => {
    if (profitMargin >= 30) return 'text-green-600';
    if (profitMargin >= 20) return 'text-green-500';
    if (profitMargin >= 10) return 'text-blue-500';
    return 'text-amber-500';
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(opportunity);
    }
  };
  
  const handleMarkAsSold = () => {
    if (onMarkAsSold && opportunity.id) {
      onMarkAsSold(opportunity.id);
    }
  };
  
  const handleDelete = () => {
    if (onDelete && opportunity.id) {
      onDelete(opportunity.id);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-4 pb-2 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-semibold bg-gray-100 px-1.5 py-0.5 rounded">
              {formatMarketplace(opportunity.sourceMarketplace)} → {formatMarketplace(opportunity.targetMarketplace)}
            </span>
            
            {opportunity.status === 'sold' && (
              <Badge variant="premium" className="ml-2">Sold</Badge>
            )}
          </div>
          
          <Badge 
            variant={opportunity.profitMargin >= 20 ? 'premium' : 'secondary'} 
            className={`${getProfitClass(opportunity.profitMargin)}`}
          >
            {opportunity.profitMargin.toFixed(0)}% profit
          </Badge>
        </div>
        
        <h3 className="text-sm font-medium mb-2 line-clamp-2">
          {truncateTitle(opportunity.sourceItemTitle)}
        </h3>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 p-2 rounded text-center">
            <div className="text-xs text-gray-500 mb-1">Buy Price</div>
            <div className="font-bold text-sm">${formatPrice(opportunity.sourcePrice)}</div>
          </div>
          
          <div className="bg-gray-50 p-2 rounded text-center">
            <div className="text-xs text-gray-500 mb-1">Sell Price</div>
            <div className="font-bold text-sm">${formatPrice(opportunity.targetPrice)}</div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-2 rounded text-center mb-2">
          <div className="text-xs text-blue-600 mb-1">Potential Profit</div>
          <div className="font-bold text-blue-700">
            ${formatPrice(opportunity.priceDifference)}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col pt-0 pb-3 px-4">
        <div className="flex gap-2 w-full mb-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => window.open(opportunity.sourceItemUrl, '_blank')}
          >
            View Item <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
          
          {!isSaved && onSave && (
            <Button
              size="sm"
              variant="premium"
              className="w-full"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader className="h-3 w-3 animate-spin" />
              ) : (
                <Bookmark className="h-3 w-3" />
              )}
            </Button>
          )}
          
          {isSaved && onDelete && (
            <Button
              size="sm"
              variant="destructive"
              className="w-8"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
        
        {isSaved && opportunity.status !== 'sold' && onMarkAsSold && (
          <Button
            size="sm"
            variant="premium" 
            className="w-full mt-1"
            onClick={handleMarkAsSold}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Check className="h-3 w-3 mr-1" />
            )}
            Mark as Sold
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ArbitrageOpportunityCard;
