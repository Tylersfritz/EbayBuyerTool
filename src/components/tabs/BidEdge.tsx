
import React, { useState } from 'react';
import { useAuctionMonitors } from '@/hooks/useAuctionMonitors';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import AuctionAssistForm from '../bidedge/AuctionAssistForm';
import AuctionMonitorList from '../bidedge/AuctionMonitorList';
import PremiumOnlyLock from '../premium/PremiumOnlyLock';
import { Award, ChevronRight, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BidEdgeProps {
  isPremium: boolean;
}

const BidEdge: React.FC<BidEdgeProps> = ({ isPremium }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const { isPremium: authIsPremium } = useAuth(); // A fallback check from auth context
  const premiumEnabled = isPremium || authIsPremium;
  
  // Mock auction data for the preview behind the blur
  const mockAuctionData = {
    title: "Vintage camera with original case",
    currentPrice: 78.50,
    marketValue: 120.00,
    timeLeft: "1d 4h",
    bidders: 6,
  };
  
  const premiumBenefits = [
    {
      icon: <TrendingUp className="h-4 w-4" />,
      title: "Real-time Market Rate Analysis",
      description: "See if auctions are above or below market value"
    },
    {
      icon: <Clock className="h-4 w-4" />,
      title: "Smart Bid Timing",
      description: "Get notified at the perfect time to place your bid"
    },
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      title: "Price Drop Alerts",
      description: "Be the first to know when prices fall below your target"
    }
  ];
  
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
          title="BidEdge Auction Assistant" 
          description="Win more auctions while paying less with our premium auction tools."
          showPreview={true}
          ctaText="Upgrade to Win More Auctions"
          previewData={mockAuctionData}
          premiumBenefits={premiumBenefits}
          successMetric="Premium users win auctions at 15% below market value on average"
          icon={<Award className="h-8 w-8 text-primary" strokeWidth={1.5} />}
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
