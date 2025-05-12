import React from 'react';
import EnhancedAffiliateButton from './priceCheck/EnhancedAffiliateButton';

interface AffiliateButtonProps {
  productName: string;
  buttonText?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const AffiliateButton: React.FC<AffiliateButtonProps> = (props) => {
  // Simply use our enhanced button but keep backward compatibility
  return <EnhancedAffiliateButton {...props} />;
};

export default AffiliateButton;
