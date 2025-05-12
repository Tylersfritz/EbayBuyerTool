
import React, { useState } from 'react';
import { useAuctionSnipes } from '@/hooks/useAuctionSnipes';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import SnipeForm from '../snipe/SnipeForm';
import SnipeList from '../snipe/SnipeList';
import PremiumOnlyLock from '../premium/PremiumOnlyLock';

interface AuctionSnipeProps {
  isPremium: boolean;
}

const AuctionSnipe: React.FC<AuctionSnipeProps> = ({ isPremium }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const { isPremium: authIsPremium } = useAuth(); // A fallback check from auth context
  const premiumEnabled = isPremium || authIsPremium;
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Auction Sniper</h2>
        <p className="text-sm text-muted-foreground">
          Automatically bid in the last seconds of an auction to increase your chances of winning.
        </p>
      </div>
      
      {!premiumEnabled ? (
        <PremiumOnlyLock 
          title="Premium Feature: Auction Sniper" 
          description="Automatically bid in the last seconds of auctions to increase your chances of winning."
          showPreview={true}
        >
          <div className="p-4">
            <Card>
              <CardContent className="pt-4">
                <SnipeForm />
              </CardContent>
            </Card>
          </div>
        </PremiumOnlyLock>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create' | 'manage')} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="create">Create Snipe</TabsTrigger>
              <TabsTrigger value="manage">Manage Snipes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="flex-1 overflow-y-auto">
              <Card>
                <CardContent className="pt-4">
                  <SnipeForm />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manage" className="flex-1 overflow-y-auto">
              <SnipeList />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default AuctionSnipe;
