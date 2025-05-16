
import React from 'react';
import { Button } from "@/components/ui/button";
import { ShareIcon, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";

interface ActionButtonsProps {
  loading: boolean;
  onCheckPrice: () => void;
  productTitle?: string;
  itemId?: string;
  hasReachedLimit?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  loading, 
  onCheckPrice,
  productTitle,
  itemId,
  hasReachedLimit = false,
}) => {
  const handleShare = () => {
    if (!productTitle) {
      toast.error("No product data available to share");
      return;
    }
    
    const shareText = `Check out this deal I found on ${productTitle?.substring(0, 50)}${productTitle && productTitle.length > 50 ? '...' : ''}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'DealHaven Price Check',
        text: shareText,
        url: window.location.href,
      })
      .then(() => toast.success("Shared successfully"))
      .catch((error) => {
        console.error('Error sharing:', error);
        toast.error("Failed to share");
      });
    } else {
      // Fallback for browsers that don't support the Share API
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`)
        .then(() => toast.success("Link copied to clipboard"))
        .catch(() => toast.error("Failed to copy link"));
    }
  };
  
  return (
    <div className="grid grid-cols-2 gap-2 mt-1">
      <Button 
        type="button"
        disabled={loading || hasReachedLimit}
        onClick={onCheckPrice}
        className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-xs py-1 h-9 flex justify-center items-center"
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 mr-1" />
        )}
        {loading ? "Checking..." : "Check Price"}
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={handleShare}
        disabled={!productTitle}
        className="text-xs py-1 h-9 flex justify-center items-center"
      >
        <ShareIcon className="h-4 w-4 mr-1" />
        Share
      </Button>
    </div>
  );
};

export default ActionButtons;
