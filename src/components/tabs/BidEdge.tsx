
import React, { useState } from 'react';
import { useAuctionMonitors } from '@/hooks/useAuctionMonitors';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import AuctionAssistForm from '../bidedge/AuctionAssistForm';
import AuctionMonitorList from '../bidedge/AuctionMonitorList';
import PremiumOnlyLock from '../premium/PremiumOnlyLock';

interface BidEdgeProps {
  isPremium: boolean;
}

const BidEdge: React.FC<BidEdgeProps> = ({ isPremium }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const { isPremium: authIsPremium } = useAuth(); // A fallback check from auth context
  const premiumEnabled = isPremium || authIsPremium;
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">BidEdge Auction Assistant</h2>
        <p className="text-sm text-muted-foreground">
          Monitor auctions, analyze market rates, and get timely notifications for better bidding decisions.
        </p>
      </div>
      
      {!premiumEnabled ? (
        <PremiumOnlyLock 
          title="Premium Feature: BidEdge Auction Assistant" 
          description="Monitor auction prices, find comparable listings, and receive notifications to make smarter bidding decisions."
          showPreview={true}
        >
          <div className="p-4">
            <Card>
              <CardContent className="pt-4">
                <AuctionAssistForm />
              </CardContent>
            </Card>
          </div>
        </PremiumOnlyLock>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create' | 'manage')} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="create">Monitor Auction</TabsTrigger>
              <TabsTrigger value="manage">My Auctions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="flex-1 overflow-y-auto">
              <Card>
                <CardContent className="pt-4">
                  <AuctionAssistForm />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manage" className="flex-1 overflow-y-auto">
              <AuctionMonitorList />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default BidEdge;
