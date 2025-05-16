
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ListingInfo } from '@/components/priceCheck/types/priceCheckTypes';
import ListingHeader from './listingCard/ListingHeader';
import PricingInfo from './listingCard/PricingInfo';
import AuctionDetails from './listingCard/AuctionDetails';
import ListingDetails from './listingCard/ListingDetails';
import PromotionAlert from './listingCard/PromotionAlert';
import LoadingSkeleton from './listingCard/LoadingSkeleton';

interface CurrentListingCardProps {
  listingInfo: ListingInfo;
  loadingListingInfo: boolean;
  onArbitrageClick?: () => void; // New prop for handling arbitrage button clicks
}

const CurrentListingCard: React.FC<CurrentListingCardProps> = ({ 
  listingInfo, 
  loadingListingInfo,
  onArbitrageClick
}) => {
  const [marketRate, setMarketRate] = useState<number | null>(null);

  // Helper function to safely convert price values
  const safePrice = (price?: number | string): number => {
    if (price === undefined) return 0.01;
    return typeof price === 'string' ? parseFloat(price) || 0.01 : price;
  };
  
  const currentPrice = safePrice(listingInfo.currentPrice);
  const buyItNowPrice = listingInfo.buyItNowPrice ? safePrice(listingInfo.buyItNowPrice) : 0;
  const originalPrice = listingInfo.originalPrice ? safePrice(listingInfo.originalPrice) : 0;
  
  // Check if the item is on sale
  const isOnSale = !listingInfo.isAuction && 
                 !!listingInfo.originalPrice && 
                 currentPrice < originalPrice;

  if (loadingListingInfo) {
    return <LoadingSkeleton />;
  }

  const cardBorderClass = listingInfo.isAuction 
    ? "border-l-4 border-l-amber-500" 
    : "border-l-4 border-l-blue-500";

  return (
    <Card className={`mb-2 ${cardBorderClass}`}>
      <CardContent className="p-2.5">
        {/* Header Section */}
        <ListingHeader
          itemId={listingInfo.itemId}
          isAuction={!!listingInfo.isAuction}
          title={listingInfo.title}
        />
        
        {/* Main content area - using grid layout for efficient space usage */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-1">
          {/* Left column - Price and auction info */}
          <div>
            <PricingInfo
              isAuction={!!listingInfo.isAuction}
              currentPrice={currentPrice}
              originalPrice={originalPrice}
              buyItNowPrice={listingInfo.buyItNowPrice}
              discountPercentage={listingInfo.discountPercentage}
            />
            
            <AuctionDetails
              isAuction={!!listingInfo.isAuction}
              bids={listingInfo.bids}
              bidderCount={listingInfo.bidderCount}
              timeRemaining={listingInfo.timeRemaining}
              watchers={listingInfo.watchers}
              firstBidTime={listingInfo.firstBidTime}
            />
          </div>
          
          {/* Right column - Listing details */}
          <ListingDetails
            condition={listingInfo.condition}
            shipping={listingInfo.shipping}
            seller={listingInfo.seller}
            sellerFeedbackScore={listingInfo.sellerFeedbackScore}
            sellerPositivePercentage={listingInfo.sellerPositivePercentage}
            returnPolicy={listingInfo.returnPolicy}
            quantityAvailable={listingInfo.quantityAvailable}
          />
        </div>
        
        {/* Promotional alerts section */}
        <PromotionAlert
          isAuction={!!listingInfo.isAuction}
          isOnSale={isOnSale}
          originalPrice={originalPrice}
          currentPrice={currentPrice}
          marketRate={marketRate}
          onArbitrageClick={onArbitrageClick}
        />
      </CardContent>
    </Card>
  );
};

export default CurrentListingCard;
