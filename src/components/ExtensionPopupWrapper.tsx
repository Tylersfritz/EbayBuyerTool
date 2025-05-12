
import React from 'react';
import ExtensionPopup from './ExtensionPopup';
import ApiHealthCheck from '@/api/ApiHealthCheck';
import ApiStatsDashboard from './ApiStatsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ErrorBoundary from './ErrorBoundary';
import ApiHealthChecker from './ApiHealthChecker';
import { Link } from 'react-router-dom';
import { Package, Activity, LineChart, PanelLeft } from 'lucide-react';
import { ModeProvider } from '@/context/ModeContext';

const ExtensionPopupWrapper: React.FC = () => {
  return (
    <ErrorBoundary>
      <ModeProvider>
        <div className="p-3 h-full flex flex-col bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <Tabs defaultValue="extension" className="flex-1">
              <TabsList className="w-full bg-gray-100/80 p-1 h-9">
                <TabsTrigger value="extension" className="flex items-center gap-1.5 text-xs h-7 data-[state=active]:shadow-sm">
                  <PanelLeft className="h-3.5 w-3.5" />
                  <span>Extension</span>
                </TabsTrigger>
                <TabsTrigger value="status" className="flex items-center gap-1.5 text-xs h-7 data-[state=active]:shadow-sm">
                  <Activity className="h-3.5 w-3.5" />
                  <span>API Status</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-1.5 text-xs h-7 data-[state=active]:shadow-sm">
                  <LineChart className="h-3.5 w-3.5" />
                  <span>API Stats</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Link to="/deploy" className="ml-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1.5 h-9 px-3 shadow-sm border-gray-200 hover:bg-gray-50"
              >
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Deploy</span>
              </Button>
            </Link>
          </div>
          
          <Tabs defaultValue="extension" className="flex-1 flex flex-col">
            <TabsContent value="extension" className="flex-1 overflow-hidden m-0 p-0 border rounded-lg shadow-sm bg-white data-[state=active]:animate-[fade-in_0.2s_ease-out]">
              <ExtensionPopup />
            </TabsContent>
            
            <TabsContent value="status" className="flex-1 overflow-y-auto m-0 p-0 data-[state=active]:animate-[fade-in_0.2s_ease-out]">
              <Card className="shadow-sm">
                <CardContent className="pt-6 px-4 space-y-5">
                  <ApiHealthChecker />
                  <ApiHealthCheck />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats" className="flex-1 overflow-y-auto m-0 p-0 data-[state=active]:animate-[fade-in_0.2s_ease-out]">
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <ApiStatsDashboard />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ModeProvider>
    </ErrorBoundary>
  );
};

export default ExtensionPopupWrapper;
