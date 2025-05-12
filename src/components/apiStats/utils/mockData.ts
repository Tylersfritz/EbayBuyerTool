
import { ApiStats } from '../types';

// Mock API stats data for development and testing
export const mockApiStats: ApiStats = {
  cache: {
    hits: 124,
    misses: 43,
    keys: 18,
    ksize: 4320,
    vsize: 15640
  },
  pooling: {
    activeRequests: 0,
    keys: []
  },
  rateLimiter: {
    availableTokens: 50,
    dailyApiCalls: 167,
    dailyLimitRemaining: 833,
    queueLength: 0
  },
  timestamp: new Date().toISOString()
};

// Alternative mock data with active requests for testing
export const mockApiStatsWithActiveRequests: ApiStats = {
  ...mockApiStats,
  pooling: {
    activeRequests: 2,
    keys: ['item_search:iphone_11', 'item_search:macbook_pro']
  },
  rateLimiter: {
    ...mockApiStats.rateLimiter,
    availableTokens: 48,
    queueLength: 1
  }
};

// Mock data showing rate limiting in effect
export const mockApiStatsWithRateLimiting: ApiStats = {
  ...mockApiStats,
  rateLimiter: {
    availableTokens: 5,
    dailyApiCalls: 842,
    dailyLimitRemaining: 158,
    queueLength: 3
  }
};

// Mock data for cache cleared state
export const mockApiStatsWithCacheCleared: ApiStats = {
  ...mockApiStats,
  cache: {
    hits: 0,
    misses: 2,
    keys: 0,
    ksize: 0,
    vsize: 0
  },
  cacheCleared: true
};
