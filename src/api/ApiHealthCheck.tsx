
import { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiConfig } from './apiConfig';
import { useApiHealth } from '@/context/ApiHealthContext';
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

const ApiHealthCheck = () => {
  const { healthState, checkHealth, isLoading } = useApiHealth();
  const [apiConfig, setApiConfig] = useState<{baseUrl: string, environment: string}>({
    baseUrl: '',
    environment: 'web'
  });
  
  // Load API configuration
  useEffect(() => {
    const loadConfig = async () => {
      const config = await getApiConfig();
      setApiConfig({
        baseUrl: config.baseUrl,
        environment: config.environment
      });
    };
    
    loadConfig();
  }, []);

  // Helper function to get service status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">API Connection Status</h3>
      
      <div className="text-xs text-muted-foreground mb-2">
        <div>Environment: {apiConfig.environment}</div>
        <div className="truncate">API URL: {apiConfig.baseUrl}</div>
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : healthState.status === 'error' ? (
        <Alert variant="destructive">
          <AlertTitle className="flex items-center gap-1">
            <XCircle className="h-4 w-4" /> API Connection Error
          </AlertTitle>
          <AlertDescription className="text-xs">
            {healthState.message || 'Unable to connect to API'}
            
            {/* Show detailed service status if available */}
            {healthState.services && (
              <div className="mt-2 space-y-1">
                {Object.entries(healthState.services).map(([service, status]) => (
                  <div key={service} className="flex items-center gap-1">
                    {getStatusIcon(status?.status || 'error')}
                    <span className="font-semibold capitalize">{service}:</span> {status?.message || 'Unknown status'}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-1 text-xs opacity-70">
              Last checked: {new Date(healthState.lastChecked).toLocaleTimeString()}
            </div>
          </AlertDescription>
        </Alert>
      ) : healthState.status === 'ok' ? (
        <Alert variant="default">
          <AlertTitle className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" /> API Status: OK
          </AlertTitle>
          <AlertDescription className="text-xs">
            {healthState.services && (
              <div className="space-y-1 mt-1">
                {Object.entries(healthState.services).map(([service, status]) => (
                  <div key={service} className="flex items-center gap-1">
                    {getStatusIcon(status?.status || 'ok')}
                    <span className="font-semibold capitalize">{service}:</span> {status?.status === 'ok' ? 'Operational' : status?.message}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-1">
              Environment: {apiConfig.environment}<br />
              Last checked: {new Date(healthState.lastChecked).toLocaleTimeString()}
            </div>
          </AlertDescription>
        </Alert>
      ) : healthState.status === 'pending' ? (
        <div className="p-4 border rounded-md text-center text-sm text-gray-500">
          Waiting for API status check...
        </div>
      ) : null}
      
      <Button 
        onClick={() => checkHealth()} 
        disabled={isLoading}
        size="sm"
        variant="outline"
        className="w-full"
      >
        {isLoading ? 'Checking...' : 'Check API Status'}
      </Button>
    </div>
  );
};

export default ApiHealthCheck;
