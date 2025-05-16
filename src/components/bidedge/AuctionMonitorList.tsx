
import React, { useState, useEffect } from 'react';
import { useAuctionMonitors } from '@/hooks/useAuctionMonitors';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, AlertCircle, Check, X, Trash, TrendingUp, Bell, ExternalLink } from "lucide-react";
import { formatPrice } from '@/utils/extensionUtils';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuctionMonitorData } from '@/utils/marketplaceAdapters';
import AuctionTimer from './AuctionTimer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AuctionMonitorList: React.FC = () => {
  const { 
    monitors, 
    isLoadingMonitors, 
    monitorsError, 
    refetchMonitors,
    cancelMonitor,
    isCancellingMonitor,
    deleteMonitor,
    isDeletingMonitor
  } = useAuctionMonitors();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMonitorId, setSelectedMonitorId] = useState<string | null>(null);

  useEffect(() => {
    // Refresh data every 30 seconds to update timers
    const interval = setInterval(() => {
      refetchMonitors();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refetchMonitors]);

  const handleCancelMonitor = (id: string) => {
    cancelMonitor(id);
  };

  const confirmDeleteMonitor = (id: string) => {
    setSelectedMonitorId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteMonitor = () => {
    if (selectedMonitorId) {
      deleteMonitor(selectedMonitorId);
      setDeleteDialogOpen(false);
      setSelectedMonitorId(null);
    }
  };

  const getStatusBadge = (status: AuctionMonitorData['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Active</Badge>;
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

  const getMarketRateComparison = (monitor: AuctionMonitorData) => {
    if (!monitor.marketRate || !monitor.currentPrice) return null;
    
    const difference = ((monitor.currentPrice / monitor.marketRate) - 1) * 100;
    
    if (difference <= -10) {
      return <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
        {Math.abs(Math.round(difference))}% below market
      </Badge>;
    } else if (difference >= 10) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        {Math.round(difference)}% above market
      </Badge>;
    } else {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Near market rate
      </Badge>;
    }
  };

  if (isLoadingMonitors) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading your auctions...</p>
      </div>
    );
  }

  if (monitorsError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading auctions: {monitorsError.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (monitors.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Monitored Auctions</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          You haven't set up any auction monitors yet.
        </p>
        <Button variant="outline" onClick={() => refetchMonitors()}>
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {monitors.map((monitor) => (
        <Card key={monitor.id} className="overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium flex-1 mr-2">{monitor.itemTitle}</CardTitle>
              {getStatusBadge(monitor.status)}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 pb-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Current Price:</span>
                <span className="font-medium ml-1">{formatPrice(monitor.currentPrice)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Your Target:</span>
                <span className="font-medium ml-1">{formatPrice(monitor.targetPrice)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Marketplace:</span>
                <span className="font-medium ml-1">{monitor.marketplace}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Notification:</span>
                <span className="font-medium ml-1">{formatNotificationTime(monitor.notificationTime)}</span>
              </div>
            </div>
            
            {monitor.marketplaceMetadata?.marketRate && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Market Rate:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">
                    {formatPrice(monitor.marketplaceMetadata.marketRate)}
                  </span>
                  {getMarketRateComparison(monitor)}
                </div>
              </div>
            )}

            {/* Show timer only for pending/active monitors */}
            {(monitor.status === 'pending' || monitor.status === 'active') && (
              <div className="mt-2">
                <AuctionTimer endTime={monitor.auctionEndTime} notificationTime={monitor.notificationTime} />
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-2 flex justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <a href={monitor.itemUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Bid Now
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Go to the auction page to place your bid</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex space-x-2">
              {(monitor.status === 'pending' || monitor.status === 'active') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelMonitor(monitor.id)}
                  disabled={isCancellingMonitor}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => confirmDeleteMonitor(monitor.id)}
                disabled={isDeletingMonitor}
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
            <DialogTitle>Delete Auction Monitor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this auction monitor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMonitor} disabled={isDeletingMonitor}>
              {isDeletingMonitor ? (
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

// Helper function to format notification time in a readable way
const formatNotificationTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
  return `${Math.floor(seconds / 3600)} hours ${Math.floor((seconds % 3600) / 60)} min`;
};

export default AuctionMonitorList;
