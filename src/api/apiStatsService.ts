import { apiRequest } from './apiClient';
import { ApiStats } from '@/components/apiStats/types';
import { 
  mockApiStats, 
  mockApiStatsWithCacheCleared,
  mockApiStatsWithActiveRequests,
  mockApiStatsWithRateLimiting
} from '@/components/apiStats/utils/mockData';
import { isExtensionEnvironment } from '@/utils/browserUtils';

export interface ApiStatsParams {
  clearCache?: boolean;
  forceMock?: boolean;
  maxRetries?: number;
}

/**
 * Fetches API statistics from the server
 * Similar structure to getPriceCheck in priceApiService
 */
export async function getApiStats(params?: ApiStatsParams): Promise<{ data: ApiStats | null; error: string | null }> {
  console.log('Getting API stats with params:', params);
  
  // Force mock mode for testing
  if (params?.forceMock) {
    console.log('Forcing mock mode for API stats');
    return {
      data: params.clearCache ? mockApiStatsWithCacheCleared : mockApiStats,
      error: null
    };
  }
  
  // Extract parameters
  const queryParams: Record<string, string> = {};
  
  // Add clearCache flag if specified
  if (params?.clearCache) {
    queryParams.clearCache = 'true';
  }
  
  const maxRetries = params?.maxRetries || 2;
  
  try {
    const response = await apiRequest<ApiStats>('stats', {
      params: queryParams,
      retries: maxRetries,
      showToast: false // We'll handle toasts separately in the component
    });
    
    if (response.error) {
      console.error('API stats error:', response.error);
      return {
        data: null,
        error: response.error.message
      };
    }
    
    if (!response.data) {
      return {
        data: null,
        error: 'No data received from API'
      };
    }
    
    return {
      data: response.data,
      error: null
    };
  } catch (err) {
    console.error('Error in getApiStats:', err);
    
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch API stats'
    };
  }
}

/**
 * Get mock API stats data for testing or when API is unavailable
 * Similar to the mock functionality in the price check service
 */
export function getMockApiStats(withCacheClear: boolean = false, variant: 'default' | 'active' | 'limited' = 'default'): ApiStats {
  // Return a copy of mock data to avoid mutations
  if (withCacheClear) {
    return { ...mockApiStatsWithCacheCleared };
  }
  
  // Select the appropriate variant
  switch (variant) {
    case 'active':
      return { ...mockApiStatsWithActiveRequests };
    case 'limited':
      return { ...mockApiStatsWithRateLimiting };
    default:
      return { ...mockApiStats };
  }
}

/**
 * Rotates between different mock data states for a more dynamic test experience
 */
export function getRotatingMockStats(): ApiStats {
  // Create a deterministic but changing pattern based on time
  const minute = new Date().getMinutes();
  
  // Every 3rd minute, show active requests
  if (minute % 3 === 0) {
    return { ...mockApiStatsWithActiveRequests };
  }
  
  // Every 5th minute, show rate limiting
  if (minute % 5 === 0) {
    return { ...mockApiStatsWithRateLimiting };
  }
  
  // Otherwise, show normal stats
  return { ...mockApiStats };
}
