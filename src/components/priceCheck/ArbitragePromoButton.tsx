
import React from 'react';
import { Button } from '@/components/ui/button';
import { BadgePercent } from 'lucide-react';

interface ArbitragePromoButtonProps {
  onClick: () => void;
  className?: string;
}

const ArbitragePromoButton: React.FC<ArbitragePromoButtonProps> = ({ onClick, className }) => {
  return (
    <Button
      variant="warning"
      size="sm"
      className={`w-full text-xs py-0.5 mt-1 h-6 ${className || ''}`}
      onClick={onClick}
    >
      <BadgePercent className="h-3.5 w-3.5 mr-1.5" />
      Find Flipping Deals
    </Button>
  );
};

export default ArbitragePromoButton;
