
import React from 'react';
import { BadgePercent } from 'lucide-react';
import PromoFeatureCard from './PromoFeatureCard';

interface ArbitrageAlertPromoProps {
  isPremium: boolean;
  currentPrice: number;
  averagePrice: number;
  onButtonClick: () => void;
}

const ArbitrageAlertPromo: React.FC<ArbitrageAlertPromoProps> = ({
  isPremium,
  currentPrice,
  averagePrice,
  onButtonClick
}) => {
  // Calculate potential profit percentage
  const potentialProfit = averagePrice > 0 ? ((averagePrice - currentPrice) / currentPrice * 100) : 0;
  
  // Lower threshold from 15% to 10% to show more often
  if (potentialProfit < 10) return null;
  
  // Format the profit percentage
  const profitPercentFormatted = Math.round(potentialProfit);
  
  // Calculate absolute profit
  const absoluteProfit = averagePrice - currentPrice;
  const profitFormatted = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(absoluteProfit);

  return (
    <PromoFeatureCard
      icon={BadgePercent}
      title="Arbitrage Opportunity Detected!"
      description={`This item has ~${profitPercentFormatted}% profit potential (${profitFormatted}). Find similar flipping deals in our Arbitrage Finder.`}
      buttonText="Find Flipping Deals"
      onButtonClick={onButtonClick}
      isPremium={isPremium}
      variant="arbitrage"
    />
  );
};

export default ArbitrageAlertPromo;
