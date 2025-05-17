// src/components/arbitrage/ArbitragePrompt.tsx
import React, { useState } from 'react';
import './ArbitragePrompt.css';

const ArbitragePrompt = ({ onScan, onSearch, onExploreMovers, onSetAlert }) => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
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

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    if (e.target.value) {
      onExploreMovers(e.target.value);
    }
  };

  return (
    <div className="arbitrage-prompt bg-gradient-to-r from-blue-100 to-green-100 p-4 rounded-lg shadow-md flex items-center space-x-4">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-blue-800">Arbitrage Finder</h3>
        <p className="text-sm text-gray-700 mt-1">
          Scan items at garage sales or search categories like iPhones or Pokémon cards. Use eBay sold data (e.g., $197.50 iPhone avg.) to find 30% ROI flips.
        </p>
        <div className="mt-3 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
          <button onClick={onScan} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition font-semibold">
            Scan Now 📸
          </button>
          <select value={selectedCategory} onChange={handleCategoryChange} className="border border-gray-300 rounded px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select a Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button onClick={onSearch} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
            Search Now
          </button>
          <button onClick={() => onExploreMovers(selectedCategory || categories[0].id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">
            Explore Movers
          </button>
          <button onClick={onSetAlert} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">
            Set Deal Alert
          </button>
        </div>
      </div>
      <div className="hidden md:block">
        <img src="/deal-hunter-badge.png" alt="Deal Hunter" className="w-16 h-16" />
      </div>
    </div>
  );
};

export default ArbitragePrompt;