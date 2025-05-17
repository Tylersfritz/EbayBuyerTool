
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { getApiStats, ApiStatsParams } from '@/api/apiStatsService';
import { getApiConfig, saveApiConfig, getFullApiUrl } from '@/api/apiConfig';
import { isExtensionEnvironment } from '@/utils/browserUtils';

const ApiStatsServiceFixer: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState('');
  const [testMode, setTestMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);
  const [configSaved, setConfigSaved] = useState(false);
  
  // Load current API config
  useEffect(() => {
    const loadConfig = async () => {
      const config = await getApiConfig();
      setBaseUrl(config.baseUrl);
    };
    loadConfig();
  }, []);
  
  // Test API connection
  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const params: ApiStatsParams = {
        forceMock: testMode
      };
      
      const response = await getApiStats(params);
      
      if (response.error) {
        setTestResult({
          success: false,
          message: `API Error: ${response.error}`
        });
      } else if (response.data) {
        setTestResult({
          success: true,
          message: 'API connection successful!',
          data: response.data
        });
      } else {
        setTestResult({
          success: false,
          message: 'No data returned from API'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Exception: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save API configuration
  const saveApiSettings = async () => {
    try {
      // For extension environment, save to chrome.storage
      if (isExtensionEnvironment()) {
        await saveApiConfig({
          baseUrl: baseUrl,
          endpoints: {
            priceCheck: '/price-check',
            health: '/health',
            stats: '/api-stats'
          }
        });
        
        setConfigSaved(true);
        toast.success('API configuration saved successfully');
      } else {
        // For web environment, we can't permanently save but we can update the current session
        toast.info('Configuration updated for current session only (not in extension mode)');
      }
    } catch (error) {
      toast.error(`Failed to save API configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Reset to default API settings
  const resetApiSettings = async () => {
    const defaultUrl = 'https://ebay-buyer-tool-zp52.vercel.app/api';
    setBaseUrl(defaultUrl);
    
    if (isExtensionEnvironment()) {
      await saveApiConfig({
        baseUrl: defaultUrl,
        endpoints: {
          priceCheck: '/price-check',
          health: '/health',
          stats: '/api-stats'
        }
      });
      toast.success('API configuration reset to defaults');
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Configure and test API connectivity for the extension
            </CardDescription>
          </div>
          <Badge variant={
            isExtensionEnvironment() ? "default" : "secondary"
          }>
            {isExtensionEnvironment() ? 'Extension Environment' : 'Web Environment'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="config">
          <TabsList>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="test">Connection Test</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="apiBaseUrl">API Base URL</Label>
                <Input
                  id="apiBaseUrl"
                  placeholder="https://api.example.com"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This is the base URL for all API endpoints
                </p>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={resetApiSettings}>
                  Reset to Default
                </Button>
                <Button onClick={saveApiSettings}>
                  Save Configuration
                </Button>
              </div>
              
              {configSaved && (
                <div className="bg-green-50 text-green-700 p-2 rounded text-sm">
                  Configuration saved successfully! Please refresh the extension to apply changes.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="test" className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="test-mode" 
                checked={testMode}
                onCheckedChange={setTestMode}
              />
              <Label htmlFor="test-mode">Force Test Mode</Label>
            </div>
            
            <Button 
              onClick={testApiConnection} 
              disabled={isLoading} 
              className="mt-4"
            >
              {isLoading ? 'Testing...' : 'Test API Connection'}
            </Button>
            
            {testResult && (
              <div className={`mt-4 p-4 rounded-md ${
                testResult.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <h3 className={`font-medium ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.success ? 'Success' : 'Error'}
                </h3>
                <p className={`text-sm ${
                  testResult.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {testResult.message}
                </p>
                {testResult.data && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-500 mb-1">API Response:</div>
                    <pre className="bg-slate-100 p-2 rounded overflow-auto text-xs max-h-48">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="help" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Common API Issues</h3>
                <ul className="list-disc pl-5 space-y-2 mt-2 text-sm">
                  <li>
                    <strong>CORS Errors</strong>: If you see CORS errors in the console, ensure your API allows requests from the extension's origin.
                  </li>
                  <li>
                    <strong>Network Errors</strong>: Check if your API is accessible from the current network. The extension will automatically fall back to test mode if API is unreachable.
                  </li>
                  <li>
                    <strong>Authentication Issues</strong>: If you see authentication errors, check your API keys and permissions.
                  </li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-blue-800 font-medium">Extension Environment</h3>
                <p className="text-sm text-blue-700 mt-1">
                  In extension mode, the API configuration is stored in chrome.storage.local and persists between sessions. 
                  API calls may be subject to CORS restrictions depending on the target API's configuration.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          Current mode: {isExtensionEnvironment() ? 'Extension' : 'Web Development'}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ApiStatsServiceFixer;
