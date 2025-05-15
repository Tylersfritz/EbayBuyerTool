
/// <reference types="vite/client" />

interface Window {
  browser?: any;
  chrome?: any;
}

// API configuration types
interface EbayApiConfig {
  browseApiEnvironment: 'production' | 'sandbox';
  marketInsightsApiEnvironment: 'production' | 'sandbox';
  clientId?: string;
  clientSecret?: string;
  apiToken?: string;
}

interface ApiEnvironmentConfig {
  useMockData: boolean;
  mockDataFallbackDelay: number; // ms to wait before falling back to mock data
  debugLogging: boolean;
  ebay: EbayApiConfig;
}
