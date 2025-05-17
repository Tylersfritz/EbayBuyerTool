
import React from 'react';
import { TrendingUp } from 'lucide-react';
import PromoFeatureCard from './PromoFeatureCard';

interface BidEdgePromoProps {
  isPremium: boolean;
  isAuction: boolean;
  bids?: number;
  timeRemaining?: string;
  onButtonClick: () => void;
}

const BidEdgePromo: React.FC<BidEdgePromoProps> = ({
  isPremium,
  isAuction,
  bids = 0,
  timeRemaining = '',
  onButtonClick
}) => {
  // Only show for auction listings
  if (!isAuction) return null;
  
  // Create dynamic content based on auction state
  let description = "Monitor this auction in real-time and get smart bidding advice to win at the best price.";
  
  // Enhance description based on auction details
  if (bids > 5) {
    description = `Popular auction with ${bids} bids! Monitor it in BidEdge to time your perfect bid and win.`;
  } else if (timeRemaining && timeRemaining.includes('hour')) {
    description = `Auction ending soon! Track it in BidEdge to get winning bid strategies and timing advice.`;
  }

  return (
    <PromoFeatureCard
      icon={TrendingUp}
      title="Monitor this Auction on BidEdge"
      description={description}
      buttonText="Open in BidEdge"
      onButtonClick={onButtonClick}
      isPremium={isPremium}
      variant="premium"
    />
  );
};

export default BidEdgePromo;
