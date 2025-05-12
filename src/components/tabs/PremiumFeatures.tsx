
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AffiliateButton from "@/components/AffiliateButton";

interface PremiumFeaturesProps {
  isPremium: boolean;
  onUpgrade?: () => void;
}

const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({ isPremium, onUpgrade }) => {
  const handleUpgrade = () => {
    console.log("Upgrade to premium clicked");
    // Call the onUpgrade prop if provided
    if (onUpgrade) {
      onUpgrade();
    }
    // In a real extension, this would navigate to a payment page
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Premium Features</h2>
        <p className="text-sm text-muted-foreground">
          Unlock advanced features to save money and win more auctions.
        </p>
      </div>
      
      <Card className="mb-4 relative overflow-hidden">
        <CardContent className="p-4">
          <h3 className="text-base font-medium mb-2">Auction Sniping</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Automatically bid in the last seconds of an auction to increase your chances of winning.
          </p>
          {!isPremium && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <Lock className="h-5 w-5 mb-1 text-muted-foreground" />
                <span className="text-sm font-medium">Premium Only</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-4 relative overflow-hidden">
        <CardContent className="p-4">
          <h3 className="text-base font-medium mb-2">Arbitrage Search</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Find items that can be resold for profit on other marketplaces.
          </p>
          {!isPremium && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <Lock className="h-5 w-5 mb-1 text-muted-foreground" />
                <span className="text-sm font-medium">Premium Only</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {!isPremium ? (
        <Button 
          className="mb-6 bg-green-500 hover:bg-green-600 font-semibold"
          onClick={handleUpgrade}
        >
          Upgrade for $7/month
        </Button>
      ) : (
        <div className="text-center mb-6">
          <Badge className="bg-green-500">Active Subscription</Badge>
        </div>
      )}
      
      <AffiliateButton 
        productName="Electronics Deals"
        className="mt-auto bg-orange-500 hover:bg-orange-600"
        buttonText="Buy New Now"
      />
    </div>
  );
};

export default PremiumFeatures;
