
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PriceCheck from "./tabs/PriceCheck";
import Negotiate from "./tabs/Negotiate";
import BidEdge from "./tabs/BidEdge";
import Arbitrage from "./tabs/Arbitrage";
import { saveToStorage, getFromStorage } from "@/utils/extensionUtils";
import { Settings, RefreshCcw, ShieldCheck, AlertCircle, KeyRound, Package, TrendingUp, Tag } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { getApiConfig } from '@/api/apiConfig';
import { useApiHealth } from '@/context/ApiHealthContext';
import { useAuth } from '@/context/AuthContext';
import { useModeContext } from '@/context/ModeContext';
import { Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

const ExtensionPopup: React.FC = () => {
  const [activeTab, setActiveTab] = useState("priceCheck");
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");
  const { healthState, checkHealth, isLoading: isHealthLoading } = useApiHealth();
  const { isPremium } = useAuth();
  const { isAuctionMode, toggleMode, isLoading: isModeLoading } = useModeContext();
  
  useEffect(() => {
    // Load API configuration
    const initializeApi = async () => {
      const config = await getApiConfig();
      setApiBaseUrl(config.baseUrl);
    };
    
    // Initialize affiliate IDs if they don't exist
    const initializeAffiliateIds = async () => {
      const existingIds = await getFromStorage<Record<string, string>>('affiliateIds');
      if (!existingIds) {
        const defaultIds = {
          amazon: 'dealhaven-20',
          walmart: 'dealhaven',
          ebay: 'dealhaven'
        };
        await saveToStorage('affiliateIds', defaultIds);
      }
    };
    
    initializeAffiliateIds();
    initializeApi();
    
    // Debug log to confirm the component is mounting
    console.log("ExtensionPopup mounted");
  }, []);
  
  const refreshData = async () => {
    const result = await checkHealth();
    
    if (result) {
      toast.success("Connection successful! Data refreshed.");
    } else {
      // Check if it's specifically an eBay authentication issue
      const hasAuthIssue = healthState.services?.ebay?.status === 'error' && 
                         healthState.services?.ebay?.message?.toLowerCase().includes('auth');
      
      if (hasAuthIssue) {
        toast.error("eBay API authentication issue detected. Please check API credentials.");
      } else {
        toast.warning("API connection issue detected.");
      }
    }
  };
  
  // Toggle between auction and fixed-price mock data
  const handleToggleAuctionMode = () => {
    toggleMode();
    toast.info(`Test mode: ${!isAuctionMode ? 'Auction' : 'Fixed-price'} listing`);
  };
  
  // Check if there's a specific eBay authentication issue
  const hasEbayAuthIssue = healthState.services?.ebay?.status === 'error' && 
                          healthState.services?.ebay?.message?.toLowerCase().includes('auth');
  
  // Only show dev tools in development mode
  const isDevelopmentMode = import.meta.env.DEV;

  // Handle tab change from promos
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm">
        <div className="flex items-center">
          <ShieldCheck className="w-5 h-5 text-primary mr-2" />
          <h1 className="text-lg font-semibold text-secondary">DealHavenAI</h1>
        </div>
        <div className="flex items-center gap-2">
          {healthState.status === 'error' && (
            <div className={`${hasEbayAuthIssue ? 'text-amber-500' : 'text-red-500'}`}>
              {hasEbayAuthIssue 
                ? <KeyRound className="h-4 w-4" /> 
                : <AlertCircle className="h-4 w-4" />}
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100 rounded-full"
            onClick={refreshData}
            disabled={isHealthLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${isHealthLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant={isPremium ? "premium" : "outline"}
            size="sm" 
            className={`text-xs py-1 px-3 h-7 rounded-full ${isPremium ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
          >
            {isPremium ? 'Premium' : 'Free'}
          </Button>
          <Link to="/deploy">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100 rounded-full"
              title="Extension Deployment"
            >
              <Package className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>
      
      {healthState.status === 'error' && (
        <div className={`px-4 py-2 ${hasEbayAuthIssue ? 'bg-amber-50 text-amber-800 border-b border-amber-100' : 'bg-red-50 text-red-800 border-b border-red-100'} text-xs flex items-center justify-between`}>
          <span className="flex items-center">
            {hasEbayAuthIssue 
              ? <KeyRound className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> 
              : <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />}
            <span>
              {hasEbayAuthIssue 
                ? 'eBay API authentication issue detected' 
                : 'API connection issue detected'}
            </span>
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshData} 
            className={`h-6 px-2 py-0 text-xs rounded-md ${hasEbayAuthIssue ? 'text-amber-900 hover:bg-amber-100' : 'text-red-900 hover:bg-red-100'}`}
          >
            Retry
          </Button>
        </div>
      )}
      
      {/* Dev mode toggle for auction/fixed-price mock data */}
      {isDevelopmentMode && (
        <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-gray-700 flex items-center cursor-help">
                  {isAuctionMode ? (
                    <>
                      <TrendingUp className="h-4 w-4 mr-1.5 text-amber-500" />
                      Test Auction Mode
                    </>
                  ) : (
                    <>
                      <Tag className="h-4 w-4 mr-1.5 text-blue-500" />
                      Test Fixed-Price Mode
                    </>
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px] text-xs p-2">
                <p>
                  Toggle between auction and fixed-price mock data for testing. This switch is only visible in development mode.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center">
            {isModeLoading && <Spinner className="h-3 w-3 mr-2" />}
            <Switch 
              checked={isAuctionMode}
              onCheckedChange={handleToggleAuctionMode}
              disabled={isModeLoading}
            />
          </div>
        </div>
      )}
      
      <Tabs 
        defaultValue="priceCheck" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="bg-white border-b px-2 pt-3 pb-2">
          <TabsList className="grid grid-cols-4 gap-2 h-auto bg-gray-100/80 p-1 rounded-md">
            <TabsTrigger 
              value="priceCheck" 
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-white data-[state=active]:shadow-sm space-y-1 h-[56px]"
            >
              <span className="text-xs">Price</span>
              <Badge variant="secondary" className="text-[0.65rem] px-1 py-0 bg-gray-200 text-gray-700">Free*</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="negotiate" 
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-white data-[state=active]:shadow-sm space-y-1 h-[56px]"
            >
              <span className="text-xs">Negotiate</span>
              <Badge variant="secondary" className="text-[0.65rem] px-1 py-0 bg-gray-200 text-gray-700">Free</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="bidedge" 
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-white data-[state=active]:shadow-sm space-y-1 h-[56px]"
            >
              <span className="text-xs">BidEdge</span>
              <Badge variant="premium" className="text-[0.65rem] px-1 py-0 bg-blue-500 text-white">Premium</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="arbitrage" 
              className="flex flex-col items-center justify-center py-2 px-1 data-[state=active]:bg-white data-[state=active]:shadow-sm space-y-1 h-[56px]"
            >
              <span className="text-xs">Arbitrage</span>
              <Badge variant="premium" className="text-[0.65rem] px-1 py-0 bg-blue-500 text-white">Premium</Badge>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="priceCheck" className="flex-1 px-4 py-3 overflow-y-auto m-0 data-[state=active]:animate-[fade-in_0.2s_ease-out]">
          <PriceCheck isPremium={isPremium} onTabChange={handleTabChange} />
        </TabsContent>
        
        <TabsContent value="negotiate" className="flex-1 px-4 py-3 overflow-y-auto m-0 data-[state=active]:animate-[fade-in_0.2s_ease-out]">
          <Negotiate isPremium={isPremium} />
        </TabsContent>
        
        <TabsContent value="bidedge" className="flex-1 px-4 py-3 overflow-y-auto m-0 data-[state=active]:animate-[fade-in_0.2s_ease-out]">
          <BidEdge isPremium={isPremium} />
        </TabsContent>
        
        <TabsContent value="arbitrage" className="flex-1 px-4 py-3 overflow-y-auto m-0 data-[state=active]:animate-[fade-in_0.2s_ease-out]">
          <Arbitrage isPremium={isPremium} />
        </TabsContent>
      </Tabs>
      
      {/* Loading overlay that shows when toggling modes */}
      {isModeLoading && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
            <Spinner className="h-10 w-10 text-primary mb-3" />
            <p className="text-sm font-medium text-gray-700">Changing mode...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtensionPopup;
