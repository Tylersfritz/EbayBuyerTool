
import React, { ReactNode } from 'react';
import { Lock, Diamond, Star, TrendingUp, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PremiumOnlyLockProps {
  title: string;
  description?: string;
  children?: ReactNode;
  showPreview?: boolean;
  ctaText?: string;
  previewData?: any;
  premiumBenefits?: Array<{
    icon: ReactNode;
    title: string;
    description: string;
  }>;
  successMetric?: string;
  icon?: ReactNode;
  onClose?: () => void; // Added onClose prop
}

const PremiumOnlyLock: React.FC<PremiumOnlyLockProps> = ({
  title,
  description = "This feature is available for Premium users only.",
  children,
  showPreview = true,
  ctaText = "Upgrade to Premium",
  previewData,
  premiumBenefits,
  successMetric,
  icon,
  onClose // Added onClose to component props
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      {showPreview && children && (
        <div className="w-full h-full absolute inset-0 overflow-hidden">
          <div className="w-full h-full blur-[6px] opacity-30 pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50" />
          <Badge 
            variant="premium" 
            className="absolute top-4 right-4 text-xs font-medium animate-pulse"
          >
            Sneak Peek
          </Badge>
          
          {/* Show auction data preview if available */}
          {previewData && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Card className="w-64 bg-blue-50/80 border border-blue-200 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-center opacity-70">
                    <TrendingUp className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium text-blue-700 mb-1 text-sm">Market Analysis Preview</p>
                    <p className="text-xs text-blue-600 mb-3">Unlock to view full details</p>
                    
                    <div className="space-y-1 text-left">
                      {previewData.title && (
                        <p className="text-xs text-blue-800 truncate">Item: {previewData.title}</p>
                      )}
                      {previewData.currentPrice && (
                        <div className="flex justify-between">
                          <span className="text-xs">Current price:</span>
                          <span className="text-xs font-medium">${previewData.currentPrice.toFixed(2)}</span>
                        </div>
                      )}
                      {previewData.marketValue && (
                        <div className="flex justify-between">
                          <span className="text-xs">Market value:</span>
                          <span className="text-xs font-medium">${previewData.marketValue.toFixed(2)}</span>
                        </div>
                      )}
                      {previewData.timeLeft && (
                        <div className="flex justify-between">
                          <span className="text-xs">Time left:</span>
                          <span className="text-xs font-medium">{previewData.timeLeft}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
      
      <div className="text-center z-10 bg-white/80 dark:bg-gray-900/80 p-6 rounded-lg backdrop-blur-sm shadow-md max-w-md">
        <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 animate-scale-in">
          {icon || <Diamond className="h-8 w-8 text-primary" strokeWidth={1.5} />}
        </div>
        
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>

        {successMetric && (
          <div className="bg-green-50 border border-green-100 rounded-md p-2 mb-4">
            <p className="text-sm text-green-800 flex items-center justify-center">
              <Star className="h-3.5 w-3.5 mr-1.5 text-green-600" />
              {successMetric}
            </p>
          </div>
        )}
        
        {premiumBenefits && (
          <div className="mt-4 mb-6 space-y-3">
            <p className="text-sm font-medium">Premium Features:</p>
            {premiumBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-blue-100 p-1.5 rounded-full mr-3 mt-0.5">
                  {benefit.icon}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium">{benefit.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          variant="premium" 
          className="mb-2 w-full relative overflow-hidden hover:scale-105 transition-transform duration-200"
          onClick={onClose} // Use onClose if provided
        >
          {ctaText}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Access all premium features with a subscription
        </p>
      </div>
    </div>
  );
};

export default PremiumOnlyLock;
