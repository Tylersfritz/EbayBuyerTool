
import React from 'react';
import { ArbitrageOpportunity } from '@/utils/marketplaceAdapters/types';
import ArbitrageOpportunityCard from './ArbitrageOpportunityCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InboxIcon, BookmarkCheck, AlertCircle, Package, History } from 'lucide-react';

interface SavedArbitrageListProps {
  opportunities: ArbitrageOpportunity[];
  isLoading: boolean;
  onMarkAsSold: (id: string) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  isPremium: boolean;
}

const SavedArbitrageList: React.FC<SavedArbitrageListProps> = ({
  opportunities,
  isLoading,
  onMarkAsSold,
  onDelete,
  isUpdating,
  isDeleting,
  isPremium
}) => {
  if (!isPremium) {
    return (
      <Alert variant="premium" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Premium Feature</AlertTitle>
        <AlertDescription>
          Saved arbitrage opportunities is a premium feature. Please upgrade to access it.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isLoading) {
    return (
      <div className="text-center p-8 border rounded-md bg-gray-50">
        <BookmarkCheck className="h-8 w-8 mx-auto mb-2 text-blue-500 animate-pulse" />
        <p className="text-lg font-semibold">Loading saved opportunities...</p>
      </div>
    );
  }
  
  if (opportunities.length === 0) {
    return (
      <Alert className="mb-4">
        <InboxIcon className="h-4 w-4" />
        <AlertTitle>No saved opportunities</AlertTitle>
        <AlertDescription>
          Search for arbitrage opportunities and save them to see them here.
        </AlertDescription>
      </Alert>
    );
  }
  
  const activeOpportunities = opportunities.filter(o => o.status === 'active');
  const soldOpportunities = opportunities.filter(o => o.status === 'sold');
  
  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="active" className="flex-1">
          <Package className="h-4 w-4 mr-1" /> 
          Active ({activeOpportunities.length})
        </TabsTrigger>
        <TabsTrigger value="sold" className="flex-1">
          <History className="h-4 w-4 mr-1" /> 
          Sold ({soldOpportunities.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="active">
        {activeOpportunities.length === 0 ? (
          <Alert>
            <InboxIcon className="h-4 w-4" />
            <AlertTitle>No active opportunities</AlertTitle>
            <AlertDescription>
              You don't have any active arbitrage opportunities.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOpportunities.map((opportunity) => (
              <ArbitrageOpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                isSaved={true}
                onMarkAsSold={onMarkAsSold}
                onDelete={onDelete}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="sold">
        {soldOpportunities.length === 0 ? (
          <Alert>
            <InboxIcon className="h-4 w-4" />
            <AlertTitle>No sold opportunities</AlertTitle>
            <AlertDescription>
              You haven't marked any opportunities as sold yet.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {soldOpportunities.map((opportunity) => (
              <ArbitrageOpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                isSaved={true}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default SavedArbitrageList;
