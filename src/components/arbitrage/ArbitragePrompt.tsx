import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { usePriceCheck } from '../priceCheck/hooks/usePriceCheck';
import './ArbitragePrompt.css';

interface ArbitragePromptProps {
  onSearch: (results: any) => void;
}

const ArbitragePrompt: React.FC<ArbitragePromptProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const { searchListings } = usePriceCheck();

  const handleSearch = async () => {
    try {
      const results = await searchListings(query);
      onSearch(results);
    } catch (error) {
      console.error('Arbitrage search failed:', error);
    }
  };

  return (
    <div className="arbitrage-prompt">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter product name or keywords"
      />
      <Button onClick={handleSearch}>Search for Arbitrage</Button>
    </div>
  );
};

export default ArbitragePrompt;
