
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { useModeContext } from '@/context/ModeContext';
import { getPriceCheckUsageCount, hasReachedPriceCheckLimit } from '@/utils/premium/premiumUtils';

interface PromotionAlertProps {
  isPremium: boolean;
  displayInline?: boolean;
}

const FREE_TIER_PRICE_CHECK_LIMIT = 5;

/**
 * Shows usage information for price checks
 */
const PromotionAlert: React.FC<PromotionAlertProps> = ({ 
  isPremium,
  displayInline = false
}) => {
  const [usageCount, setUsageCount] = React.useState<number>(0);
  const [limitReached, setLimitReached] = React.useState<boolean>(false);
  const { isAuctionMode } = useModeContext();

  // Load usage information
  React.useEffect(() => {
    const loadUsageData = async () => {
      if (!isPremium) {
        try {
          const count = await getPriceCheckUsageCount();
          setUsageCount(count);
          
          const hasReachedLimit = await hasReachedPriceCheckLimit();
          setLimitReached(hasReachedLimit);
        } catch (error) {
          console.error('Error loading usage data:', error);
          // Set default values if there's an error
          setUsageCount(0);
          setLimitReached(false);
        }
      }
    };
    
    loadUsageData();
  }, [isPremium]);

  // Don't show anything for premium users
  if (isPremium) {
    return null;
  }

  // Display inline version (for compact UI)
  if (displayInline) {
    return (
      <div className="flex items-center text-xs text-muted-foreground">
        <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
        {limitReached ? (
          <span className="text-amber-600 font-medium">Limit reached. Upgrade for unlimited checks.</span>
        ) : (
          <span>{usageCount} of {FREE_TIER_PRICE_CHECK_LIMIT} free checks used this month</span>
        )}
      </div>
    );
  }

  // Display full alert version
  return (
    <Alert variant="premium" className="py-1 px-2 mb-2">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          <AlertDescription className="text-xs">
            {limitReached ? (
              <span className="text-amber-600 font-medium">
                Monthly limit reached. Upgrade for unlimited checks.
              </span>
            ) : (
              <span>
                {usageCount} of {FREE_TIER_PRICE_CHECK_LIMIT} free price checks used this month
              </span>
            )}
          </AlertDescription>
        </div>
        {limitReached && (
          <Badge variant="premium" className="ml-1 text-[0.6rem] h-4">UPGRADE</Badge>
        )}
      </div>
    </Alert>
  );
};

export default PromotionAlert;
