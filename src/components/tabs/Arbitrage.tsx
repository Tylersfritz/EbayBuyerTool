import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Search, BookmarkCheck, Scan } from 'lucide-react';
import ArbitrageSearchForm from '@/components/arbitrage/ArbitrageSearchForm';
import ArbitrageResults from '@/components/arbitrage/ArbitrageResults';
import SavedArbitrageList from '@/components/arbitrage/SavedArbitrageList';
import { ArbitrageOpportunity, ArbitrageSearchParams } from '@/utils/marketplaceAdapters/types';
import { useArbitrage } from '@/hooks/useArbitrage';
import PremiumOnlyLock from '../premium/PremiumOnlyLock';
import PremiumVisualScanner from '../visualScanner/PremiumVisualScanner';
import { ScanResult } from '../visualScanner/VisualScanner';
import { toast } from '@/components/ui/sonner';
import ArbitragePrompt from '../arbitrage/ArbitragePrompt';

interface ArbitrageProps {
  isPremium: boolean;
}

const Arbitrage: React.FC<ArbitrageProps> = ({ isPremium }) => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchResults, setSearchResults] = useState<ArbitrageOpportunity[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isVisualScannerOpen, setIsVisualScannerOpen] = useState(false);
  
  const {
    savedOpportunities,
    isLoadingSaved,
    isSearching,
    search,
    saveOpportunity,
    isSaving,
    updateStatus,
    isUpdating,
    deleteOpportunity,
    isDeleting
  } = useArbitrage();
  
  const handleSearch = async (params: ArbitrageSearchParams) => {
    const results = await search(params);
    if (results) {
      setSearchResults(results);
      setHasSearched(true);
    }
  };
  
  const handleSaveOpportunity = (opportunity: ArbitrageOpportunity) => {
    saveOpportunity(opportunity);
  };
  
  const handleMarkAsSold = (id: string) => {
    updateStatus({ id, status: 'sold' });
  };
  
  const handleDelete = (id: string) => {
    deleteOpportunity(id);
  };

  const handleScanComplete = (scanResult: ScanResult) => {
    toast.success("Image scanned successfully!");
    console.log("Scan result for arbitrage:", scanResult);
    
    // Close the scanner
    setIsVisualScannerOpen(false);
    
    // In a real implementation, you would use the scan data to trigger an arbitrage search
    // For now, we'll just show a toast with the mock data
    setTimeout(() => {
      toast.info(`Searching for arbitrage opportunities for: ${scanResult.title}`);
      
      // Simulate a search with the scanned product name
      if (scanResult.title) {
        handleSearch({
          sourceMarketplace: 'ebay',
          targetMarketplace: 'mercari',
          query: scanResult.title,
          minProfitMargin: 20,
          maxPrice: 500,
          includeUsed: true,
          includeFees: true
        });
      }
    }, 500);
  };
  
  const handleScan = () => {
    setIsVisualScannerOpen(true);
  };

  const handleExploreMovers = (categoryId: string) => {
    toast.info(`Exploring movers for category ID: ${categoryId}`);
    // In a real implementation, this would navigate to a page showing trending items in this category
  };

  const handleSetAlert = () => {
    toast.info("Setting up deal alert");
    // In a real implementation, this would open a form to set parameters for deal alerts
  };
  
  if (!isPremium) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Arbitrage Finder</h2>
        </div>
        
        <PremiumOnlyLock 
          title="Premium Feature: Arbitrage Finder" 
          description="Find profitable reselling opportunities across different marketplaces."
          showPreview={true}
        >
          <Tabs value="search" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="search" className="text-xs">Find Opportunities</TabsTrigger>
              <TabsTrigger value="visual" className="text-xs">Visual Scanner</TabsTrigger>
              <TabsTrigger value="saved" className="text-xs">Saved Items</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4">
              <ArbitrageSearchForm
                onSearch={(params: ArbitrageSearchParams) => Promise.resolve()}
                isSearching={false}
                isPremium={true}
              />
              
              <div className="text-center p-8 border rounded-md bg-gray-50">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-lg font-semibold">Search for Arbitrage Opportunities</p>
                <p className="text-sm text-gray-500">
                  Enter a search query and select your marketplaces to find profitable deals
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </PremiumOnlyLock>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Arbitrage Finder</h2>
      </div>
      
      {/* New ArbitragePrompt component */}
      <ArbitragePrompt 
        onScan={handleScan}
        onSearch={() => setActiveTab('search')}
        onExploreMovers={handleExploreMovers}
        onSetAlert={handleSetAlert}
        isPremium={isPremium}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="search" className="flex flex-col items-center px-1 py-1.5 h-auto">
            <Search className="h-3.5 w-3.5 mb-0.5" />
            <span className="text-[10px]">Find</span>
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex flex-col items-center px-1 py-1.5 h-auto">
            <Scan className="h-3.5 w-3.5 mb-0.5" />
            <span className="text-[10px]">Scanner</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex flex-col items-center px-1 py-1.5 h-auto">
            <BookmarkCheck className="h-3.5 w-3.5 mb-0.5" />
            <span className="text-[10px]">Saved</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-4">
          <ArbitrageSearchForm
            onSearch={handleSearch}
            isSearching={isSearching}
            isPremium={isPremium}
          />
          
          <ArbitrageResults
            opportunities={searchResults}
            onSaveOpportunity={handleSaveOpportunity}
            isSaving={isSaving}
            isSearching={isSearching}
            hasSearched={hasSearched}
            isPremium={isPremium}
          />
          
          <div className="lovable-components mt-4">
            <ArbitragePrompt
              onScan={() => console.log('Scan clicked')}
              onSearch={() => console.log('Search clicked')}
              onExploreMovers={(category) => console.log('Explore Movers:', category)}
              onSetAlert={() => console.log('Set Alert clicked')}
            />
          </div>
        </TabsContent>

        <TabsContent value="visual" className="space-y-4">
          <Alert className="mb-4">
            <AlertDescription className="text-sm">
              Use the Visual Scanner to find arbitrage opportunities from product images
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <button 
              onClick={() => setIsVisualScannerOpen(true)} 
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Scan className="h-4 w-4 mr-2" /> Open Image Scanner
            </button>
          </div>

          {isVisualScannerOpen && (
            <PremiumVisualScanner
              isPremium={isPremium}
              onScanComplete={handleScanComplete}
              onClose={() => setIsVisualScannerOpen(false)}
              isOpen={isVisualScannerOpen}
            />
          )}

          {hasSearched && searchResults.length > 0 && (
            <>
              <Separator className="my-4" />
              <h3 className="text-md font-medium mb-3">Scan Results</h3>
              <ArbitrageResults
                opportunities={searchResults}
                onSaveOpportunity={handleSaveOpportunity}
                isSaving={isSaving}
                isSearching={false}
                hasSearched={true}
                isPremium={isPremium}
              />
            </>
          )}
        </TabsContent>
        
        <TabsContent value="saved">
          <SavedArbitrageList
            opportunities={savedOpportunities}
            isLoading={isLoadingSaved}
            onMarkAsSold={handleMarkAsSold}
            onDelete={handleDelete}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            isPremium={isPremium}
          />
        </TabsContent>
      </Tabs>

      {/* Visual Scanner Modal (when opened from elsewhere) */}
      {isVisualScannerOpen && activeTab !== 'visual' && (
        <PremiumVisualScanner
          isPremium={isPremium}
          onScanComplete={handleScanComplete}
          onClose={() => setIsVisualScannerOpen(false)}
          isOpen={isVisualScannerOpen}
        />
      )}
    </div>
  );
};

export default Arbitrage;