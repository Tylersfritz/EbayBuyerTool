
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';

const DEV_PREMIUM_KEY = 'dealHavenAI_devPremium';

export const DevToolbar: React.FC = () => {
  const location = useLocation();
  const { overridePremium } = useAuth();
  const [isPremiumEnabled, setIsPremiumEnabled] = useState(false);
  
  useEffect(() => {
    // Check if premium override is enabled in localStorage
    const storedValue = localStorage.getItem(DEV_PREMIUM_KEY);
    const premiumEnabled = storedValue === 'true';
    setIsPremiumEnabled(premiumEnabled);
    
    // Apply the stored override
    overridePremium(premiumEnabled);
  }, [overridePremium]);
  
  const handlePremiumToggle = (checked: boolean) => {
    setIsPremiumEnabled(checked);
    localStorage.setItem(DEV_PREMIUM_KEY, checked.toString());
    overridePremium(checked);
  };
  
  const currentPathname = location.pathname;
  const isExtensionPath = currentPathname === '/extension';
  const isMarketingPath = currentPathname === '/' || currentPathname === '/app';
  
  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800 text-white p-2 flex justify-between items-center text-sm">
      <div className="flex items-center">
        <span className="mr-2">View Mode:</span>
        <Link 
          to="/" 
          className={`px-3 py-1 rounded mr-2 ${isMarketingPath ? 'bg-blue-500' : 'bg-slate-600 hover:bg-slate-700'}`}
        >
          Marketing Site
        </Link>
        <Link 
          to="/extension" 
          className={`px-3 py-1 rounded ${isExtensionPath ? 'bg-blue-500' : 'bg-slate-600 hover:bg-slate-700'}`}
        >
          Extension Popup
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="premium-mode" 
            checked={isPremiumEnabled}
            onCheckedChange={handlePremiumToggle}
          />
          <Label htmlFor="premium-mode" className="text-white cursor-pointer">
            Premium Mode
          </Label>
        </div>
      </div>
    </div>
  );
};

export default DevToolbar;
