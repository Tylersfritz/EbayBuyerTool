
import React, { useState } from 'react';
import { Camera, Search, ArrowRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Category {
  name: string;
  id: string;
}

interface ArbitragePromptProps {
  onScan: () => void;
  onSearch: () => void;
  onExploreMovers: (categoryId: string) => void;
  onSetAlert: () => void;
  isPremium: boolean;
}

const ArbitragePrompt: React.FC<ArbitragePromptProps> = ({ 
  onScan, 
  onSearch, 
  onExploreMovers, 
  onSetAlert,
  isPremium
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories: Category[] = [
    { name: 'Electronics', id: '9355,171814' },
    { name: 'Video Games', id: '1249' },
    { name: 'Classic Toys', id: '220' },
    { name: 'Cameras & Photo', id: '625' },
    { name: 'Sporting Goods', id: '888' },
    { name: 'Collectibles', id: '1' },
    { name: 'Fashion', id: '11450' },
    { name: 'Home & Garden', id: '11700' },
    { name: 'Jewelry & Watches', id: '281' },
    { name: 'Health & Beauty', id: '26395' }
  ];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    if (e.target.value) {
      onExploreMovers(e.target.value); // Navigate to movers for selected category
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-100 to-green-100 p-4 rounded-lg shadow-md flex items-center gap-4 mb-4">
      <div className="flex-1">
        <h3 className="text-sm font-bold text-blue-800">Point, Click, Profit with DealHavenAI! 🚀</h3>
        <p className="text-xs text-gray-700 mt-1">
          Resellers, start your flip adventure! <span className="font-semibold">Scan items</span> at garage sales with your phone to uncover <span className="font-semibold">hot arbitrage deals</span>—from iPhones to Pokémon cards to vintage jewelry. Real eBay sold data powers profits up to 30% ROI on Amazon.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            onClick={onScan}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white text-xs h-7"
          >
            <Camera className="h-3.5 w-3.5 mr-1" />
            Scan Now
          </Button>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="border border-gray-300 rounded px-2 py-1 text-xs h-7 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <Button
            onClick={onSearch}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs h-7"
          >
            <Search className="h-3.5 w-3.5 mr-1" />
            Search Now
          </Button>
          <Button
            onClick={() => onExploreMovers(selectedCategory || categories[0].id)}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white text-xs h-7"
          >
            <ArrowRight className="h-3.5 w-3.5 mr-1" />
            Explore Movers
          </Button>
          <Button
            onClick={onSetAlert}
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs h-7"
          >
            <Bell className="h-3.5 w-3.5 mr-1" />
            Set Deal Alert
          </Button>
        </div>
      </div>
      <div className="hidden md:block">
        <div className="bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center">
          <span className="font-bold text-xs">Deal Hunter</span>
        </div>
      </div>
    </div>
  );
};

export default ArbitragePrompt;
