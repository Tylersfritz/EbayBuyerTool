import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw, Database, Clock, AlertCircle, WifiOff, BarChart2, LineChart } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useApiStats } from './apiStats/hooks/useApiStats';
import { ApiErrorType } from '@/api/apiClient';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const ApiStatsDashboard: React.FC = () => {
  const { 
    stats, 
    isLoading, 
    error, 
    errorType, 
    lastUpdated,
    testMode,
    fetchStats,
    clearCache,
    enableTestMode,
    disableTestMode
  } = useApiStats({
    autoRefresh: true,
    refreshInterval: 30000,
    rotatingMockData: true
  });
  
  const handleClearCache = async () => {
    try {
      const success = await clearCache();
      if (success) {
        toast({
          title: 'Cache cleared successfully',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Failed to clear cache',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error clearing cache:', err);
      toast({
        title: 'Failed to clear cache',
        variant: 'destructive'
      });
    }
  };
  
  // Display a warning for test mode
  React.useEffect(() => {
    if (testMode && !error) {
      toast({
        title: 'Using simulated API stats data',
        description: 'Could not connect to real API, showing example data',
        variant: 'default'
      });
    }
  }, [testMode, error]);

  const handleTestModeToggle = (checked: boolean) => {
    if (checked) {
      enableTestMode();
      toast({
        title: 'Test mode enabled',
        description: 'Using mock data for API statistics',
        variant: 'default'
      });
    } else {
      disableTestMode();
      toast({
        title: 'Test mode disabled',
        description: 'Attempting to use real API data',
        variant: 'default'
      });
    }
  };

  if (error) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">API Statistics</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchStats()}
              className="flex items-center gap-1"
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => enableTestMode()}
              className="flex items-center gap-1"
            >
              Use Test Data
            </Button>
          </div>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center">
            {errorType === ApiErrorType.Network || errorType === ApiErrorType.Cors ? (
              <WifiOff className="h-12 w-12 text-red-500 mx-auto mb-2" />
            ) : (
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            )}
            <p className="text-red-800">Failed to load API stats</p>
            <p className="text-sm text-red-600 mt-2">
              {errorType === ApiErrorType.Network 
                ? 'Network error: Cannot connect to the API server. Please check your internet connection.'
                : errorType === ApiErrorType.Cors
                ? 'CORS error: API access blocked from current domain.'
                : errorType === ApiErrorType.Authentication
                ? 'Authentication error: Please check API credentials or permissions.'
                : error}
            </p>
          </CardContent>
          <CardFooter className="justify-center gap-2">
            <Button variant="outline" onClick={() => fetchStats()} className="text-red-800 border-red-300">
              Try Again
            </Button>
            <Button variant="secondary" onClick={() => enableTestMode()}>
              Use Test Data
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">API Statistics</h2>
        <div className="flex items-center gap-2">
          {testMode && (
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
              Test Mode
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchStats()}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearCache}
            disabled={isLoading}
          >
            Clear Cache
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        {lastUpdated && (
          <p className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" /> 
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="test-mode" className="text-xs text-gray-500">Test Mode</Label>
          <Switch
            id="test-mode"
            checked={testMode}
            onCheckedChange={handleTestModeToggle}
            className="scale-75"
          />
        </div>
      </div>
      
      {isLoading && !stats ? (
        <div className="py-8 text-center text-gray-500">
          <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading stats...</p>
        </div>
      ) : stats ? (
        <div className="space-y-3">
          {/* Cache Stats */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Cache Statistics
                </CardTitle>
                <Badge variant={stats.cache.hits > 0 ? "success" : "secondary"}>
                  {stats.cache.hits > 0 ? "Active" : "No Hits Yet"}
                </Badge>
              </div>
              {stats.cacheCleared && (
                <CardDescription className="text-xs text-amber-600 mt-1">
                  Cache was recently cleared
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pb-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Cache Keys:</span>
                  <span className="font-medium">{stats.cache.keys}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Cache Hits:</span>
                  <span className="font-medium">{stats.cache.hits}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Cache Misses:</span>
                  <span className="font-medium">{stats.cache.misses}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Memory Usage:</span>
                  <span className="font-medium">
                    {Math.round((stats.cache.ksize + stats.cache.vsize) / 1024)} KB
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Request Pooling Stats */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Request Pooling
                </CardTitle>
                <Badge variant={stats.pooling.activeRequests > 0 ? "success" : "secondary"}>
                  {stats.pooling.activeRequests > 0 ? "Active Requests" : "Idle"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Active Requests:</span>
                  <span className="font-medium">{stats.pooling.activeRequests}</span>
                </div>
                
                {stats.pooling.activeRequests > 0 && (
                  <div className="flex flex-col">
                    <span className="text-gray-500">Current Pool Keys:</span>
                    <div className="text-xs mt-1 space-y-1">
                      {stats.pooling.keys.map((key, index) => (
                        <div key={index} className="bg-gray-100 p-1 rounded text-gray-700 overflow-hidden overflow-ellipsis">
                          {key}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Rate Limiter Stats */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  <LineChart className="h-4 w-4 mr-2" />
                  Rate Limiter
                </CardTitle>
                <Badge variant={stats.rateLimiter.queueLength > 0 ? "warning" : "success"}>
                  {stats.rateLimiter.queueLength > 0 ? `${stats.rateLimiter.queueLength} Queued` : "Ready"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Available Tokens:</span>
                  <span className="font-medium">{stats.rateLimiter.availableTokens}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">API Calls Today:</span>
                  <span className="font-medium">{stats.rateLimiter.dailyApiCalls}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Daily Remaining:</span>
                  <span className="font-medium">{stats.rateLimiter.dailyLimitRemaining}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Queue Length:</span>
                  <span className="font-medium">{stats.rateLimiter.queueLength}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default ApiStatsDashboard;
