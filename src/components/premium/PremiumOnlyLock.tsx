
import React, { ReactNode } from 'react';
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PremiumOnlyLockProps {
  title: string;
  description?: string;
  children?: ReactNode;
  showPreview?: boolean;
}

const PremiumOnlyLock: React.FC<PremiumOnlyLockProps> = ({
  title,
  description = "This feature is available for Premium users only.",
  children,
  showPreview = true
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
            className="absolute top-4 right-4 text-xs font-medium"
          >
            Sneak Peek
          </Badge>
        </div>
      )}
      
      <div className="text-center z-10 bg-white/80 dark:bg-gray-900/80 p-6 rounded-lg backdrop-blur-sm shadow-md">
        <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          {description}
        </p>
        <Button variant="premium" className="mb-2">
          Upgrade to Premium
        </Button>
      </div>
    </div>
  );
};

export default PremiumOnlyLock;
