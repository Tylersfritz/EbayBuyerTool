
import React, { useState, useEffect } from 'react';
import { useAuctionSnipes } from '@/hooks/useAuctionSnipes';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, AlertCircle, Check, X, Trash } from "lucide-react";
import { formatPrice } from '@/utils/extensionUtils';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SnipeData } from '@/utils/marketplaceAdapters';
import SnipeTimer from './SnipeTimer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SnipeList: React.FC = () => {
  const { 
    snipes, 
    isLoadingSnipes, 
    snipesError, 
    refetchSnipes,
    cancelSnipe,
    isCancellingSnipe,
    deleteSnipe,
    isDeletingSnipe
  } = useAuctionSnipes();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSnipeId, setSelectedSnipeId] = useState<string | null>(null);

  useEffect(() => {
    // Refresh data every 30 seconds to update timers
    const interval = setInterval(() => {
      refetchSnipes();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refetchSnipes]);

  const handleCancelSnipe = (id: string) => {
    cancelSnipe(id);
  };

  const confirmDeleteSnipe = (id: string) => {
    setSelectedSnipeId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSnipe = () => {
    if (selectedSnipeId) {
      deleteSnipe(selectedSnipeId);
      setDeleteDialogOpen(false);
      setSelectedSnipeId(null);
    }
  };

  const getStatusBadge = (status: SnipeData['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoadingSnipes) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading your snipes...</p>
      </div>
    );
  }

  if (snipesError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading snipes: {snipesError.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (snipes.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Auction Snipes</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          You haven't set up any auction snipes yet.
        </p>
        <Button variant="outline" onClick={() => refetchSnipes()}>
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {snipes.map((snipe) => (
        <Card key={snipe.id} className="overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium flex-1 mr-2">{snipe.itemTitle}</CardTitle>
              {getStatusBadge(snipe.status)}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 pb-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Current Price:</span>
                <span className="font-medium ml-1">{formatPrice(snipe.currentPrice)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Max Bid:</span>
                <span className="font-medium ml-1">{formatPrice(snipe.maxBidAmount)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Marketplace:</span>
                <span className="font-medium ml-1">{snipe.marketplace}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Snipe Time:</span>
                <span className="font-medium ml-1">{snipe.snipeTime}s before end</span>
              </div>
            </div>

            {/* Show timer only for pending/scheduled snipes */}
            {(snipe.status === 'pending' || snipe.status === 'scheduled') && (
              <div className="mt-2">
                <SnipeTimer endTime={snipe.auctionEndTime} snipeTime={snipe.snipeTime} />
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-2 flex justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <a href={snipe.itemUrl} target="_blank" rel="noopener noreferrer">
                View Item
              </a>
            </Button>
            <div className="flex space-x-2">
              {(snipe.status === 'pending' || snipe.status === 'scheduled') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelSnipe(snipe.id)}
                  disabled={isCancellingSnipe}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => confirmDeleteSnipe(snipe.id)}
                disabled={isDeletingSnipe}
                className="text-red-500 hover:text-red-700"
              >
                <Trash className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Auction Snipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this auction snipe? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSnipe} disabled={isDeletingSnipe}>
              {isDeletingSnipe ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SnipeList;
