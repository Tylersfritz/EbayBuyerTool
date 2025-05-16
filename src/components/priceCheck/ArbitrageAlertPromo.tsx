
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
  
  // Only show if there's a potential profit of at least 15%
  if (potentialProfit < 15) return null;
  
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
