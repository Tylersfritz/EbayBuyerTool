
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { ArbitrageSearchParams } from '@/utils/marketplaceAdapters/types';
import { getSupportedMarketplaces, getArbitrageTargets } from '@/utils/marketplaceAdapters';
import { SearchIcon, Loader2 } from 'lucide-react';

interface ArbitrageSearchFormProps {
  onSearch: (params: ArbitrageSearchParams) => Promise<void>;
  isSearching: boolean;
  isPremium: boolean;
}

const ArbitrageSearchForm: React.FC<ArbitrageSearchFormProps> = ({
  onSearch,
  isSearching,
  isPremium
}) => {
  const [sourceMarketplace, setSourceMarketplace] = useState<string>('ebay');
  const [targetMarketplace, setTargetMarketplace] = useState<string>('mercari');
  const [query, setQuery] = useState<string>('');
  const [minProfitMargin, setMinProfitMargin] = useState<number>(20);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [includeUsed, setIncludeUsed] = useState<boolean>(true);
  const [includeFees, setIncludeFees] = useState<boolean>(true);
  
  const marketplaces = getSupportedMarketplaces();
  const targetMarketplaces = getArbitrageTargets(sourceMarketplace);
  
  const handleSourceMarketplaceChange = (value: string) => {
    setSourceMarketplace(value);
    // Reset target marketplace if it's not in the list of supported targets
    const newTargets = getArbitrageTargets(value);
    if (newTargets.length > 0 && !newTargets.includes(targetMarketplace)) {
      setTargetMarketplace(newTargets[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    const params: ArbitrageSearchParams = {
      sourceMarketplace,
      targetMarketplace,
      query: query.trim(),
      minProfitMargin,
      maxPrice,
      includeUsed,
      includeFees
    };
    
    await onSearch(params);
  };
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceMarketplace">Source Marketplace</Label>
              <Select
                value={sourceMarketplace}
                onValueChange={handleSourceMarketplaceChange}
                disabled={isSearching}
              >
                <SelectTrigger id="sourceMarketplace">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {marketplaces.map(marketplace => (
                    <SelectItem key={marketplace.name} value={marketplace.name.toLowerCase()}>
                      {marketplace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetMarketplace">Target Marketplace</Label>
              <Select
                value={targetMarketplace}
                onValueChange={setTargetMarketplace}
                disabled={isSearching || targetMarketplaces.length === 0}
              >
                <SelectTrigger id="targetMarketplace">
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  {targetMarketplaces.map(marketplace => (
                    <SelectItem key={marketplace} value={marketplace}>
                      {marketplace.charAt(0).toUpperCase() + marketplace.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="query">Search Query</Label>
            <Input
              id="query"
              placeholder="e.g., iPhone 12 Pro, PlayStation 5"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minProfitMargin">
              Minimum Profit Margin: {minProfitMargin}%
            </Label>
            <Slider
              id="minProfitMargin"
              value={[minProfitMargin]}
              onValueChange={(values) => setMinProfitMargin(values[0])}
              min={5}
              max={100}
              step={5}
              disabled={isSearching}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxPrice">
              Maximum Source Price: ${maxPrice}
            </Label>
            <Slider
              id="maxPrice"
              value={[maxPrice]}
              onValueChange={(values) => setMaxPrice(values[0])}
              min={50}
              max={2000}
              step={50}
              disabled={isSearching}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="includeUsed"
              checked={includeUsed}
              onCheckedChange={setIncludeUsed}
              disabled={isSearching}
            />
            <Label htmlFor="includeUsed">Include used items</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="includeFees"
              checked={includeFees}
              onCheckedChange={setIncludeFees}
              disabled={isSearching}
            />
            <Label htmlFor="includeFees">Calculate with marketplace fees</Label>
          </div>
          
          <Button type="submit" disabled={isSearching || !query.trim() || !isPremium} className="w-full">
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <SearchIcon className="mr-2 h-4 w-4" />
                Find Arbitrage Opportunities
              </>
            )}
          </Button>
          
          {!isPremium && (
            <p className="text-xs text-amber-600 text-center">
              Arbitrage search is a premium feature. Please upgrade to access it.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ArbitrageSearchForm;
