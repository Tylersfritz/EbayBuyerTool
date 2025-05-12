
// Consolidated API Stats interface to be used across the application
export interface ApiStats {
  cache: {
    hits: number;
    misses: number;
    keys: number;
    ksize: number;
    vsize: number;
  };
  pooling: {
    activeRequests: number;
    keys: string[];
  };
  rateLimiter: {
    availableTokens: number;
    dailyApiCalls: number;
    dailyLimitRemaining: number;
    queueLength: number;
  };
  timestamp: string;
  cacheCleared?: boolean;
}
