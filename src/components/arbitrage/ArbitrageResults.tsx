
import React from 'react';
import { ArbitrageOpportunity } from '@/utils/marketplaceAdapters/types';
import ArbitrageOpportunityCard from './ArbitrageOpportunityCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Search, ScanSearch } from 'lucide-react';

interface ArbitrageResultsProps {
  opportunities: ArbitrageOpportunity[];
  onSaveOpportunity: (opportunity: ArbitrageOpportunity) => void;
  isSaving: boolean;
  isSearching: boolean;
  hasSearched: boolean;
  isPremium: boolean;
}

const ArbitrageResults: React.FC<ArbitrageResultsProps> = ({
  opportunities,
  onSaveOpportunity,
  isSaving,
  isSearching,
  hasSearched,
  isPremium
}) => {
  if (!isPremium) {
    return (
      <Alert variant="premium" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Premium Feature</AlertTitle>
        <AlertDescription>
          Arbitrage search is a premium feature. Please upgrade to access it.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isSearching) {
    return (
      <div className="text-center p-8 border rounded-md bg-gray-50">
        <ScanSearch className="h-8 w-8 mx-auto mb-2 text-blue-500 animate-pulse" />
        <p className="text-lg font-semibold">Searching marketplaces...</p>
        <p className="text-sm text-gray-500">This may take a few moments</p>
      </div>
    );
  }
  
  if (hasSearched && opportunities.length === 0) {
    return (
      <Alert className="mb-4">
        <Search className="h-4 w-4" />
        <AlertTitle>No opportunities found</AlertTitle>
        <AlertDescription>
          Try adjusting your search criteria or check different marketplaces.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!hasSearched) {
    return (
      <div className="text-center p-8 border rounded-md bg-gray-50">
        <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-lg font-semibold">Search for Arbitrage Opportunities</p>
        <p className="text-sm text-gray-500">
          Enter a search query and select your marketplaces to find profitable deals
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {opportunities.map((opportunity, index) => (
        <ArbitrageOpportunityCard
          key={opportunity.id || `opportunity-${index}`}
          opportunity={opportunity}
          onSave={onSaveOpportunity}
          isSaving={isSaving}
        />
      ))}
    </div>
  );
};

export default ArbitrageResults;
