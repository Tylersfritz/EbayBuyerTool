
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useApiHealth } from '@/context/ApiHealthContext';
import { toast } from "@/components/ui/sonner";

const ApiHealthChecker = () => {
  const { healthState, checkHealth, isLoading } = useApiHealth();
  const [showDetails, setShowDetails] = useState(false);

  const handleCheckHealth = async () => {
    try {
      const result = await checkHealth();
      if (result) {
        toast.success("API connection verified successfully!");
      } else {
        toast.error("API connection check failed. See details for more information.");
      }
    } catch (error) {
      toast.error("Error checking API health. Please check your network connection.");
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status || status === 'pending') return "text-gray-500";
    switch (status.toLowerCase()) {
      case 'ok':
        return "text-green-500";
      case 'error':
        return "text-red-500";
      default:
        return "text-amber-500";
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    if (!status || status === 'pending') return <AlertCircle className="h-4 w-4" />;
    switch (status.toLowerCase()) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">API Connection Status</h3>
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleCheckHealth}
          disabled={isLoading}
        >
          {isLoading ? "Checking..." : "Check Now"}
        </Button>
      </div>

      {healthState.status !== 'pending' && (
        <Alert variant={healthState.status === 'ok' ? 'default' : 'destructive'}>
          <div className="flex items-center gap-2">
            {getStatusIcon(healthState.status)}
            <AlertTitle>
              API Status: {healthState.status.toUpperCase()}
            </AlertTitle>
          </div>
          <AlertDescription>
            <p>{healthState.message || "Unknown status"}</p>
            
            {healthState.lastChecked && (
              <p className="text-xs mt-1 opacity-70">
                Last checked: {new Date(healthState.lastChecked).toLocaleTimeString()}
              </p>
            )}

            {healthState.services && Object.keys(healthState.services).length > 0 && (
              <div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs mt-1" 
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? "Hide details" : "Show details"}
                </Button>
                
                {showDetails && (
                  <div className="mt-2 space-y-1 text-sm">
                    {Object.entries(healthState.services).map(([service, status]) => (
                      <div key={service} className="flex items-center gap-1">
                        {getStatusIcon(status?.status)}
                        <span className="font-semibold capitalize">{service}:</span>
                        <span className={getStatusColor(status?.status)}>
                          {status?.status === 'ok' ? 'Operational' : status?.message || 'Unknown status'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ApiHealthChecker;
