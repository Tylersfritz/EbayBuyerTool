
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { checkApiHealth } from '@/api/apiClient';

export interface HealthService {
  status: 'ok' | 'error' | 'warning' | 'pending';
  message?: string;
}

export interface HealthState {
  status: 'ok' | 'error' | 'warning' | 'pending';
  message?: string;
  lastChecked: number;
  services?: Record<string, HealthService>;
}

interface ApiHealthContextType {
  healthState: HealthState;
  checkHealth: () => Promise<boolean>;
  isLoading: boolean;
}

const initialState: HealthState = {
  status: 'pending',
  lastChecked: 0
};

const ApiHealthContext = createContext<ApiHealthContextType>({
  healthState: initialState,
  checkHealth: async () => false,
  isLoading: false
});

export const useApiHealth = () => useContext(ApiHealthContext);

export const ApiHealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthState, setHealthState] = useState<HealthState>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const processHealthResponse = (data: any): HealthState => {
    let state: HealthState = {
      status: 'ok',
      lastChecked: Date.now(),
      services: {}
    };

    // Process API response structure
    if (data) {
      // Handle main API status
      if (data.status) {
        state.status = data.status.toLowerCase() === 'ok' ? 'ok' : 'error';
        state.message = data.status === 'ERROR' ? 'API error detected' : 'API is operational';
      }

      // Handle eBay connectivity
      const services: Record<string, HealthService> = {
        api: {
          status: state.status,
          message: 'API is operational'
        }
      };

      // Add eBay service status if present
      if (data.ebayAuth !== undefined || data.ebayApiAccess !== undefined) {
        if (data.ebayAuth && data.ebayApiAccess) {
          services.ebay = {
            status: 'ok',
            message: 'eBay services operational'
          };
        } else if (data.ebayAuth) {
          services.ebay = {
            status: 'warning',
            message: 'eBay authentication OK but API access failed'
          };
        } else {
          services.ebay = {
            status: 'error',
            message: data.error || 'eBay authentication failed'
          };
        }
      }

      state.services = services;
    } else {
      state = {
        status: 'error',
        message: 'No response from API',
        lastChecked: Date.now()
      };
    }

    console.log('Processed health status:', state);
    return state;
  };

  const checkHealth = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await checkApiHealth();
      console.log('Health check API response:', result);
      
      const processed = processHealthResponse(result.data);
      setHealthState(processed);
      setIsLoading(false);
      
      return processed.status === 'ok';
    } catch (error) {
      console.error('Health check error:', error);
      
      setHealthState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error checking API health',
        lastChecked: Date.now()
      });
      
      setIsLoading(false);
      return false;
    }
  }, []);

  // Run an initial health check when component mounts
  useEffect(() => {
    const initialCheck = async () => {
      try {
        await checkHealth();
      } catch (error) {
        console.error('Initial health check failed:', error);
      }
    };
    
    initialCheck();
    
    // Check health every 10 minutes
    const interval = setInterval(() => {
      checkHealth().catch(console.error);
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <ApiHealthContext.Provider value={{ healthState, checkHealth, isLoading }}>
      {children}
    </ApiHealthContext.Provider>
  );
};
