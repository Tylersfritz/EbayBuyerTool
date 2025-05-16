
import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Scan } from 'lucide-react';
import { usePriceCheck } from '@/components/priceCheck/usePriceCheck';
import CurrentListingCard from '@/components/priceCheck/CurrentListingCard';
import VisualScanner from '@/components/visualScanner/VisualScanner';
import { ScanResult } from '@/components/visualScanner/VisualScanner';
import PremiumOnlyLock from '../premium/PremiumOnlyLock';

interface PriceCheckProps {
  isPremium: boolean;
  onTabChange?: (tabName: string) => void;
}

const PriceCheck: React.FC<PriceCheckProps> = ({ isPremium, onTabChange }) => {
  const [itemId, setItemId] = useState('');
  const [isManual, setIsManual] = useState(false);
  const [isVisualScannerOpen, setIsVisualScannerOpen] = useState(false);
  const { 
    listingInfo, 
    loadingListingInfo, 
    error, 
    handleCheckPrice: fetchListingInfo,
    testMode,
    hasReachedLimit
  } = usePriceCheck(isPremium);

  // Navigate to arbitrage tab
  const handleNavigateToArbitrage = () => {
    if (isPremium) {
      // Find the arbitrage tab element and click it
      const arbitrageTab = document.querySelector('[data-value="arbitrage"]');
      if (arbitrageTab instanceof HTMLElement) {
        arbitrageTab.click();
      } else if (onTabChange) {
        // Use the onTabChange prop if available
        onTabChange('arbitrage');
      } else {
        toast.error("Couldn't find the arbitrage tab. Please navigate manually.");
      }
    } else {
      // For non-premium users, show the premium upgrade prompt
      toast("Arbitrage is a premium feature", {
        description: "Upgrade to DealHaven Premium to access arbitrage features",
        action: {
          label: "Upgrade",
          onClick: () => {
            const premiumTab = document.querySelector('[data-value="premium"]');
            if (premiumTab instanceof HTMLElement) {
              premiumTab.click();
            } else if (onTabChange) {
              onTabChange('premium');
            }
          }
        },
      });
    }
  };

  const handleItemCheck = () => {
    if (itemId.trim() !== '') {
      fetchListingInfo();
    } else {
      toast.error('Please enter a valid eBay item ID.');
    }
  };

  const handleScanComplete = (scanResult: ScanResult) => {
    toast.success("Image scanned successfully!");
    console.log("Scan result for price check:", scanResult);
    
    // Close the scanner
    setIsVisualScannerOpen(false);
    
    // In a real implementation, you would use the scan data to trigger a price check
    // For now, we'll just show a toast with the mock data
    setTimeout(() => {
      toast.info(`Performing price check for: ${scanResult.title}`);
      
      // Check if scanResult has a title to use for searching
      if (scanResult.title) {
        setItemId(scanResult.title);
        fetchListingInfo();
      }
    }, 500);
  };

  const handleReset = () => {
    setItemId('');
  };

  useEffect(() => {
    // Automatically fetch listing info if itemId is present on mount
    if (itemId) {
      fetchListingInfo();
    }
  }, [itemId, fetchListingInfo]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Price Check</h2>
        {!isPremium && (
          <Badge variant="outline" className="text-xs">
            5 checks/month
          </Badge>
        )}
      </div>
      
      <Card className="w-full">
        <div className="flex flex-col space-y-1.5 p-4">
          <div className="flex items-center space-x-2">
            <Input 
              type="text" 
              placeholder="Enter eBay Item ID" 
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              disabled={hasReachedLimit && !isPremium}
            />
            <Button 
              variant="premium" 
              size="sm" 
              onClick={handleItemCheck} 
              disabled={loadingListingInfo || (hasReachedLimit && !isPremium)}
            >
              Check Price
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsVisualScannerOpen(true)} 
              disabled={hasReachedLimit && !isPremium}
            >
              <Scan className="h-4 w-4" />
            </Button>
          </div>
          
          {hasReachedLimit && !isPremium && (
            <div className="text-sm text-amber-600 mt-2 p-2 bg-amber-50 rounded border border-amber-100">
              You've reached your monthly limit of 5 price checks. 
              <Button 
                variant="link" 
                className="p-0 h-auto ml-1 text-sm text-blue-600"
                onClick={() => {
                  if (onTabChange) {
                    onTabChange('premium');
                  } else {
                    const premiumTab = document.querySelector('[data-value="premium"]');
                    if (premiumTab instanceof HTMLElement) {
                      premiumTab.click();
                    }
                  }
                }}
              >
                Upgrade to Premium
              </Button>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch id="manual-switch" checked={isManual} onCheckedChange={setIsManual} />
            <label htmlFor="manual-switch" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed" >
              Manual Input
            </label>
          </div>
        </div>
      </Card>
      
      {error && (
        <Card className="w-full">
          <div className="flex flex-col space-y-1.5 p-4">
            <p className="text-sm text-red-500">Error: {error}</p>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </Card>
      )}
      
      {isVisualScannerOpen && (
        <VisualScanner
          isPremium={isPremium}
          onScanComplete={handleScanComplete}
          onCancel={() => setIsVisualScannerOpen(false)}
        />
      )}
      
      <CurrentListingCard
        listingInfo={listingInfo}
        loadingListingInfo={loadingListingInfo}
        onArbitrageClick={handleNavigateToArbitrage}
      />
    </div>
  );
};

export default PriceCheck;
