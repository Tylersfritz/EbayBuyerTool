
import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { SavedOffer, OfferType } from "./types/offerTypes";
import { formatTimestamp } from "./utils/offerUtils";

interface OfferHistoryProps {
  history: SavedOffer[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  onSelectOffer: (offer: SavedOffer) => void;
}

const OfferHistory: React.FC<OfferHistoryProps> = ({
  history,
  showHistory,
  setShowHistory,
  onSelectOffer
}) => {
  return (
    <Dialog open={showHistory} onOpenChange={setShowHistory}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          disabled={history.length === 0}
        >
          <History className="h-3.5 w-3.5" />
          <span className="text-xs">History</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Offer History</DialogTitle>
          <DialogDescription>
            Your previous offers. Click on any to reuse.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No history yet</p>
          ) : (
            history.map(offer => (
              <Card key={offer.id} className="cursor-pointer hover:border-blue-300" onClick={() => onSelectOffer(offer)}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs font-medium truncate max-w-[200px]">{offer.itemTitle}</div>
                    <Badge variant={getBadgeVariant(offer.offerType)}>
                      {offer.offerType}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {formatTimestamp(offer.timestamp)}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Listing: ${offer.itemPrice.toFixed(2)}</span>
                    <span className="text-blue-600">Offer: ${offer.offerPrice.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to get badge variant based on offer type
const getBadgeVariant = (offerType: OfferType): "outline" | "secondary" | "premium" => {
  switch (offerType) {
    case 'lowball':
      return 'outline';
    case 'fair':
      return 'secondary';
    case 'sweetspot':
      return 'premium';
    default:
      return 'outline';
  }
};

export default OfferHistory;
