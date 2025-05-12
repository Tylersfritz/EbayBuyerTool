
import { useState, useEffect, useCallback } from 'react';
import { ApiStats } from '../types';
import { getApiStats, getMockApiStats, getRotatingMockStats } from '@/api/apiStatsService';
import { useApiHealth } from '@/context/ApiHealthContext';
import { ApiErrorType } from '@/api/apiClient';
import { isExtensionEnvironment } from '@/api/apiConfig';
import { toast } from "@/components/ui/sonner";

export interface ApiStatsState {
  stats: ApiStats | null;
  loading: boolean;
  error: string | null;
  errorType: ApiErrorType | null;
  lastUpdated: Date | null;
  testMode: boolean;
}

interface UseApiStatsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  initialTestMode?: boolean;
  rotatingMockData?: boolean;
}

export function useApiStats(options: UseApiStatsOptions | boolean = {}) {
  // Handle boolean shorthand for autoRefresh
  const defaultOptions = {
    autoRefresh: typeof options === 'boolean' ? options : true,
    refreshInterval: 30000, // 30 seconds default
    initialTestMode: false,
    rotatingMockData: false
  };
  
  const opts = typeof options === 'boolean' 
    ? { ...defaultOptions, autoRefresh: options }
    : { ...defaultOptions, ...options };
  
  // Initial state
  const [state, setState] = useState<ApiStatsState>({
    stats: null,
    loading: false,
    error: null,
    errorType: null,
    lastUpdated: null,
    testMode: opts.initialTestMode || import.meta.env.DEV // Default to test mode in development
  });
  
  const { healthState } = useApiHealth();
  
  // Function to fetch API stats with exponential backoff retry strategy
  const fetchStats = useCallback(async (clearCache: boolean = false) => {
    setState(prev => ({ ...prev, loading: true, error: null, errorType: null }));
    
    try {
      // If we're already in test mode, just return mock data
      if (state.testMode) {
        console.log('Test mode: Using mock API stats data');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        let mockData;
        if (opts.rotatingMockData) {
          mockData = getRotatingMockStats();
        } else {
          mockData = getMockApiStats(clearCache);
        }
        
        if (clearCache) {
          mockData.cacheCleared = true;
        }
        
        setState(prev => ({
          ...prev,
          stats: mockData,
          loading: false,
          lastUpdated: new Date()
        }));
        
        return true;
      }
      
      // Real API call with retries
      console.log(`Fetching API stats, clearCache=${clearCache}`);
      const response = await getApiStats({ clearCache });
      
      if (response.error) {
        console.error('API stats error:', response.error);
        
        // Determine error type for better error UI
        const errorType = 
          response.error.includes('CORS') ? ApiErrorType.Cors :
          response.error.includes('Network') ? ApiErrorType.Network :
          response.error.includes('fetch') ? ApiErrorType.Network :
          response.error.includes('timeout') ? ApiErrorType.Network :
          response.error.includes('permission') ? ApiErrorType.Authentication :
          ApiErrorType.Unknown;
        
        // For extension environment, immediately use fallback mode if network/CORS error
        // This is especially important for extension environments where the API might be unreachable
        const shouldUseFallback = import.meta.env.DEV || 
          isExtensionEnvironment() || 
          (errorType === ApiErrorType.Cors || 
           errorType === ApiErrorType.Network);
        
        if (shouldUseFallback) {
          console.log('Falling back to test mode with mock data due to network issue');
          
          // Show a toast to inform the user
          toast.warning("Using simulated API stats data", {
            description: "Could not connect to API server, showing example data"
          });
          
          let mockData;
          if (opts.rotatingMockData) {
            mockData = getRotatingMockStats();
          } else {
            mockData = getMockApiStats(clearCache);
          }
          
          if (clearCache) {
            mockData.cacheCleared = true;
          }
          
          setState(prev => ({
            ...prev,
            stats: mockData,
            loading: false,
            testMode: true,
            lastUpdated: new Date()
          }));
          
          return true;
        }
        
        setState(prev => ({
          ...prev,
          error: response.error,
          errorType,
          loading: false
        }));
        
        return false;
      }
      
      if (response.data) {
        console.log('API stats received:', response.data);
        setState(prev => ({
          ...prev,
          stats: response.data,
          loading: false,
          testMode: false,
          lastUpdated: new Date()
        }));
        
        return true;
      }
      
      throw new Error('No data received from API');
    } catch (err) {
      console.error('Error during API stats fetch:', err);
      
      // Always use mock data for extension environment or if we hit an error
      console.log('Using mock API stats data after error');
      const mockData = getMockApiStats(clearCache);
      
      // Show a toast to inform the user
      toast.warning("Could not connect to API stats server", {
        description: "Showing example data instead"
      });
      
      setState(prev => ({
        ...prev,
        stats: mockData,
        loading: false,
        testMode: true,
        lastUpdated: new Date(),
        error: err instanceof Error ? err.message : 'An unknown error occurred',
        errorType: ApiErrorType.Network
      }));
      
      return true;
    }
  }, [state.testMode, opts.rotatingMockData]);
  
  // Function to clear cache
  const clearCache = useCallback(async () => {
    return fetchStats(true);
  }, [fetchStats]);
  
  // Auto-refresh on component mount and when health state changes
  useEffect(() => {
    // Always fetch on mount
    fetchStats();
    
    // Set up refresh interval if auto-refresh is enabled
    if (opts.autoRefresh) {
      const interval = setInterval(() => {
        // Only auto-refresh if we're in test mode or API health is good
        if (state.testMode || healthState.status === 'ok' || healthState.status === 'warning') {
          fetchStats();
        }
      }, opts.refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [opts.autoRefresh, opts.refreshInterval, fetchStats, healthState.status]);
  
  // Enable test mode programmatically
  const enableTestMode = useCallback(() => {
    if (!state.testMode) {
      setState(prev => ({ ...prev, testMode: true }));
      fetchStats();
    }
  }, [state.testMode, fetchStats]);
  
  // Disable test mode programmatically
  const disableTestMode = useCallback(() => {
    if (state.testMode) {
      setState(prev => ({ ...prev, testMode: false }));
      fetchStats();
    }
  }, [state.testMode, fetchStats]);
  
  return {
    ...state,
    fetchStats,
    clearCache,
    isLoading: state.loading,
    enableTestMode,
    disableTestMode
  };
}
