
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface PromoFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  isPremium: boolean;
  showPremiumBadge?: boolean;
  variant?: "default" | "premium" | "arbitrage";
}

const PromoFeatureCard: React.FC<PromoFeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onButtonClick,
  isPremium,
  showPremiumBadge = true,
  variant = "default"
}) => {
  // Determine button variant based on the card variant
  const buttonVariant = variant === "premium" ? "premium" : 
                        variant === "arbitrage" ? "warning" : 
                        "default";

  // Determine background color based on variant                      
  const bgColor = variant === "premium" ? "bg-blue-50 border-blue-100" :
                  variant === "arbitrage" ? "bg-amber-50 border-amber-100" :
                  "bg-gray-50 border-gray-200";

  return (
    <Card className={`mb-1 py-2 px-3 shadow-sm ${bgColor}`}>
      <div className="flex items-start">
        <div className={`p-1.5 rounded-full mr-2 flex-shrink-0
          ${variant === "premium" ? "bg-blue-100 text-blue-600" : 
            variant === "arbitrage" ? "bg-amber-100 text-amber-600" : 
            "bg-gray-100 text-gray-600"}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="text-sm font-medium">{title}</h3>
            {!isPremium && showPremiumBadge && (
              <Badge variant={variant === "arbitrage" ? "warning" : "premium"} className="text-xs ml-1">
                Premium
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mb-1.5">
            {description}
          </p>
          
          <Button
            variant={buttonVariant}
            size="sm"
            className="w-full text-xs py-0.5 h-7"
            onClick={onButtonClick}
            disabled={!isPremium}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PromoFeatureCard;
