
import React from 'react';
import { Gavel, Users, Timer, Clock, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface AuctionDetailsProps {
  isAuction: boolean;
  bids?: number;
  bidderCount?: number;
  timeRemaining?: string;
  watchers?: number;
  firstBidTime?: string;
}

const AuctionDetails: React.FC<AuctionDetailsProps> = ({
  isAuction,
  bids = 0,
  bidderCount = 0,
  timeRemaining,
  watchers = 0,
  firstBidTime
}) => {
  if (!isAuction) return null;
  
  const calculateTimeProgress = (): number => {
    if (!timeRemaining) return 0;
    
    const daysMatch = timeRemaining.match(/(\d+)d/);
    const hoursMatch = timeRemaining.match(/(\d+)h/);
    
    const days = daysMatch ? parseInt(daysMatch[1]) : 0;
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    
    const totalHours = days * 24 + hours;
    const maxHours = 7 * 24;
    
    return Math.min(100, Math.max(0, 100 - (totalHours / maxHours) * 100));
  };
  
  const getTimeColor = (): string => {
    if (!timeRemaining) return "text-gray-500";
    
    const progress = calculateTimeProgress();
    if (progress > 90) return "text-red-600";
    if (progress > 80) return "text-red-500";
    if (progress > 60) return "text-amber-500";
    return "text-blue-500";
  };
  
  const getTimeTooltip = (): string => {
    if (!timeRemaining) return "";
    
    const progress = calculateTimeProgress();
    if (progress > 90) return "Auction ending very soon! Make your decision quickly.";
    if (progress > 80) return "Auction ending soon. Prepare your maximum bid now.";
    if (progress > 60) return "Auction in final stages. Monitor price changes closely.";
    if (progress > 30) return "Auction in progress. Current bid may increase significantly.";
    return "Auction in early stages. Bid may be below true market value.";
  };
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-gray-600 flex items-center">
          <Users className="h-3 w-3 mr-1 text-blue-500" />
          Bids:
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <span className="text-xs font-medium">
                  {bids || 0}
                </span>
                {bidderCount > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({bidderCount} bidders)
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">
                {bids && bids > 5 
                  ? "Active auction with multiple bidders" 
                  : "Low bid count - may be a good opportunity"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Time remaining for auctions */}
      {timeRemaining && (
        <div className="mt-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600 flex items-center">
              <Timer className="h-3 w-3 mr-1 text-amber-500" /> 
              Time left:
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`text-xs font-medium ${getTimeColor()}`}>
                    {timeRemaining}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">{getTimeTooltip()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="mt-0.5">
            <Progress 
              value={calculateTimeProgress()} 
              className="h-1" 
              indicatorClassName={calculateTimeProgress() > 80 ? "bg-red-500" : 
                                   calculateTimeProgress() > 60 ? "bg-amber-500" : 
                                   "bg-blue-500"}
            />
          </div>
        </div>
      )}
      
      {/* First bid time */}
      {firstBidTime && (
        <div className="flex justify-between">
          <span className="text-xs font-medium text-gray-600">First bid:</span>
          <span className="text-xs">
            {new Date(firstBidTime).toLocaleDateString()}
          </span>
        </div>
      )}
      
      {/* Watchers count */}
      {watchers > 0 && (
        <div className="flex justify-between">
          <span className="text-xs font-medium text-gray-600 flex items-center">
            <Eye className="h-3 w-3 mr-1 text-blue-500" />
            Watchers:
          </span>
          <span className="text-xs font-medium">
            {watchers}
          </span>
        </div>
      )}
      
      {/* Alert for active auctions */}
      {bids && bids > 0 && (
        <div className="mt-1 px-2 py-0.5 rounded-sm border text-xs bg-amber-50 border-amber-100 text-amber-800">
          <p className="font-medium flex items-center">
            <Clock className="h-3 w-3 mr-1 text-amber-600" />
            {bids > 5 
              ? `Active auction with ${bids} bids` 
              : "Few bids - potential opportunity"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AuctionDetails;
