
// src/api/apiConfig.ts
// API Configuration Utility for DealHavenAI
// This utility handles environment detection and API URL configuration

import { getBrowserAPI } from '@/utils/browserUtils';

// Default API URLs
const DEFAULT_API_BASE_URL = 'https://ebay-buyer-tool-zp52.vercel.app/api';
const DEFAULT_API_ENDPOINTS = {
  priceCheck: '/price-check',
  health: '/health', // Updated from '/api/health'
  stats: '/api-stats' // Updated from '/api/api-stats'
};

// Interface for API configuration
export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    priceCheck: string;
    health: string;
    stats: string;
  };
  environment: 'extension' | 'web' | 'development';
}

// Create a type for the apiSettings storage interface
interface ApiSettingsStorage {
  apiSettings?: Partial<ApiConfig>;
}

/**
 * Detect whether we're running in an extension environment
 */
export function isExtensionEnvironment(): boolean {
  const browserAPI = getBrowserAPI();
  return browserAPI.isExtensionEnvironment();
}

/**
 * Gets the API configuration based on the current environment
 * Checks storage first (for extension settings), then falls back to defaults
 */
export async function getApiConfig(): Promise<ApiConfig> {
  const browserAPI = getBrowserAPI();
  
  // Default configuration
  const defaultConfig: ApiConfig = {
    baseUrl: DEFAULT_API_BASE_URL,
    endpoints: DEFAULT_API_ENDPOINTS,
    environment: import.meta.env.DEV ? 'development' : 'web'
  };

  // If we're in extension environment, check storage for custom settings
  if (isExtensionEnvironment()) {
    defaultConfig.environment = 'extension';

    try {
      // Fixed: Remove type arguments from the storage.get call
      const result = await browserAPI.storage.get('apiSettings');
      const apiSettings = (result as ApiSettingsStorage).apiSettings;

      if (apiSettings?.baseUrl) {
        return {
          baseUrl: apiSettings.baseUrl,
          endpoints: apiSettings.endpoints || DEFAULT_API_ENDPOINTS,
          environment: 'extension'
        };
      } else {
        // No custom settings, use defaults for extension
        return defaultConfig;
      }
    } catch (error) {
      console.error('Error retrieving API settings from extension storage:', error);
      return defaultConfig;
    }
  }

  // For web environment or if extension storage access failed
  return defaultConfig;
}

/**
 * Builds a full API URL for the given endpoint
 */
export async function getApiUrl(endpoint: keyof ApiConfig['endpoints']): Promise<string> {
  const config = await getApiConfig();
  return `${config.baseUrl}${config.endpoints[endpoint]}`;
}

/**
 * Saves custom API configuration (for extension environment)
 */
export async function saveApiConfig(config: Partial<ApiConfig>): Promise<boolean> {
  const browserAPI = getBrowserAPI();
  
  if (!isExtensionEnvironment()) {
    console.warn('Cannot save API config in non-extension environment');
    return false;
  }

  try {
    // Fixed: Remove type arguments from the storage.get call
    const result = await browserAPI.storage.get('apiSettings');
    const currentSettings = (result as ApiSettingsStorage).apiSettings || {};

    const newSettings = {
      ...currentSettings,
      ...config
    };

    await browserAPI.storage.set({ apiSettings: newSettings });
    return true;
  } catch (error) {
    console.error('Error saving API settings to extension storage:', error);
    return false;
  }
}
