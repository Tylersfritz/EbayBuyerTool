
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import BrowserIcon from './BrowserIcon';
import BrowserTestResult from './BrowserTestResult';
import BrowserInfoPanel from './BrowserInfoPanel';
import { useBrowserCompatibility } from '@/hooks/useBrowserCompatibility';
import { isExtensionEnvironment } from '@/utils/browserUtils';

const BrowserCompatibilityChecker: React.FC = () => {
  const { currentBrowser, apiResults, isRunningTests, runCompatibilityTests } = useBrowserCompatibility();
  const isExtension = isExtensionEnvironment();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Browser Compatibility</CardTitle>
            <CardDescription>
              Check compatibility with different browser extension APIs
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 border-green-200 text-green-700 bg-green-50"
          >
            <BrowserIcon browserName={currentBrowser} />
            <span className="capitalize">{currentBrowser} Detected</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isExtension && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Web Environment Detected</AlertTitle>
            <AlertDescription>
              You are currently in a web browser environment, not in a browser extension.
              Compatibility testing will run in simulation mode with limited functionality.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="test">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="test">Compatibility Test</TabsTrigger>
            <TabsTrigger value="info">Browser Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>Run tests to check compatibility with the current browser</div>
                <Button 
                  onClick={runCompatibilityTests} 
                  disabled={isRunningTests}
                >
                  {isRunningTests ? 'Testing...' : 'Run Tests'}
                </Button>
              </div>
              
              {Object.keys(apiResults).length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="font-medium">Test Results</h3>
                  
                  {Object.entries(apiResults).map(([api, result]) => (
                    <BrowserTestResult 
                      key={api} 
                      apiName={api} 
                      result={result}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="info" className="space-y-4 pt-4">
            <BrowserInfoPanel />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <div className="text-sm text-muted-foreground">
          Using WebExtension Polyfill v0.10.0
        </div>
      </CardFooter>
    </Card>
  );
};

export default BrowserCompatibilityChecker;
