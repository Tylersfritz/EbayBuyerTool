
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Clipboard, CheckCircle } from "lucide-react";

interface OfferMessageCardProps {
  message: string;
  copyToClipboard: () => void;
  isCopied: boolean;
  offerPrice: number;
  marketPrice: number;
  listingPrice: number;
}

const OfferMessageCard: React.FC<OfferMessageCardProps> = ({
  message,
  copyToClipboard,
  isCopied,
  offerPrice,
  marketPrice,
  listingPrice
}) => {
  if (!message) return null;
  
  const marketDifference = marketPrice > 0 ? ((offerPrice - marketPrice) / marketPrice) * 100 : 0;
  const listingDifference = listingPrice > 0 ? ((offerPrice - listingPrice) / listingPrice) * 100 : 0;
  
  return (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex space-x-2">
            <div className="text-xs">
              <span className="text-muted-foreground">Market: </span>
              <span className={`font-medium ${marketDifference < 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {marketDifference.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Listing: </span>
              <span className={`font-medium ${listingDifference < 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {listingDifference.toFixed(1)}%
              </span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyToClipboard}
            className="h-7 px-2"
          >
            {isCopied ? 
              <CheckCircle className="h-4 w-4 text-green-500" /> : 
              <Clipboard className="h-4 w-4" />
            }
          </Button>
        </div>
        <Textarea 
          value={message} 
          readOnly 
          className="min-h-[100px] text-sm"
        />
      </CardContent>
    </Card>
  );
};

export default OfferMessageCard;
