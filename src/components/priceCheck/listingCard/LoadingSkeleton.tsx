
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton: React.FC = () => {
  return (
    <Card className="mb-2">
      <CardContent className="p-2.5 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex space-x-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingSkeleton;
