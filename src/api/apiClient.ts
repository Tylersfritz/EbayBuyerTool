
// src/api/apiClient.ts

import { toast } from '@/components/ui/sonner';
import { getApiUrl } from './apiConfig';
import { isExtensionEnvironment } from '@/utils/browserUtils';
import { ApiStats } from '@/components/apiStats/types';

// API error types for better error handling
export enum ApiErrorType {
  Network = 'network',
  Authentication = 'auth',
  NotFound = 'not_found',
  Server = 'server',
  RateLimit = 'rate_limit',
  Cors = 'cors',
  Unknown = 'unknown'
}

export interface ApiError {
  type: ApiErrorType;
  message: string;
  status?: number;
  originalError?: Error;
}

export interface ApiRequestOptions {
  params?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  showToast?: boolean;
  headers?: Record<string, string>;
  retries?: number;
}

const DEFAULT_OPTIONS: ApiRequestOptions = {
  method: 'GET',
  showToast: false,
  retries: 1
};

/**
 * Main API client function for making requests to our API
 */
export async function apiRequest<T>(
  endpoint: 'priceCheck' | 'health' | 'stats',
  options: ApiRequestOptions = {}
): Promise<{ data: T | null; error: ApiError | null }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const maxRetries = opts.retries || 1;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    attempt++;
    
    try {
      // Get the full API URL based on current configuration
      const apiUrl = await getApiUrl(endpoint);
      
      // Add query parameters if provided
      const url = new URL(apiUrl);
      if (opts.params) {
        Object.entries(opts.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value);
          }
        });
      }
      
      console.log(`API Request (attempt ${attempt}/${maxRetries}):`, url.toString());
      
      // Default headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...opts.headers
      };
      
      // Make the request
      const response = await fetch(url.toString(), {
        method: opts.method,
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined
      });
      
      // Handle successful response
      if (response.ok) {
        const text = await response.text();
        let data: T | null = null;
        
        try {
          data = text ? JSON.parse(text) : null;
        } catch (e) {
          console.error('Failed to parse API response:', text);
          throw new Error('Invalid JSON response');
        }
        
        console.log('API response received successfully:', data);
        return { data, error: null };
      }
      
      // Handle error response
      let errorType = ApiErrorType.Unknown;
      let errorText = 'An unknown error occurred';
      
      // Get response text for better error information
      const text = await response.text();
      
      try {
        const errorResponse = text ? JSON.parse(text) : {};
        errorText = errorResponse.error || errorResponse.message || text || 'Unknown error';
      } catch (e) {
        errorText = text || 'Unknown error';
      }
      
      // Categorize the error based on status code
      switch (response.status) {
        case 401:
        case 403:
          errorType = ApiErrorType.Authentication;
          break;
        case 404:
          errorType = ApiErrorType.NotFound;
          break;
        case 429:
          errorType = ApiErrorType.RateLimit;
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorType = ApiErrorType.Server;
          break;
        default:
          errorType = ApiErrorType.Unknown;
      }
      
      const error: ApiError = {
        type: errorType,
        message: errorText,
        status: response.status
      };
      
      // For server errors that might be temporary, retry if attempts remain
      if ((errorType === ApiErrorType.Server || errorType === ApiErrorType.Unknown) && attempt < maxRetries) {
        console.log(`Server error, retrying (${attempt}/${maxRetries})...`);
        continue;
      }
      
      // Show toast for errors if requested
      if (opts.showToast) {
        showErrorToast(error);
      }
      
      console.error(`API error (${response.status}):`, errorText);
      return { data: null, error };
      
    } catch (error: any) {
      // Handle network and other uncaught errors
      console.error('API request failed:', error);
      
      // Detect specific error types for better handling
      const apiError: ApiError = {
        message: error.message || 'Network error occurred',
        originalError: error,
        type: ApiErrorType.Network
      };
      
      // Detect CORS errors (often manifest as network errors)
      if (error.message && error.message.includes('CORS')) {
        apiError.type = ApiErrorType.Cors;
        apiError.message = 'Cross-origin request blocked. API may be unreachable from this domain.';
      }
      
      // For network errors, retry if we haven't hit the max
      if (attempt < maxRetries) {
        console.log(`Network error, retrying (${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        continue;
      }
      
      // Show toast for errors if requested
      if (opts.showToast) {
        showErrorToast(apiError);
      }
      
      return { data: null, error: apiError };
    }
  }
  
  // If we've tried maxRetries and still failed, return a final error
  const finalError: ApiError = {
    type: ApiErrorType.Network,
    message: `Request failed after ${maxRetries} attempts`
  };
  
  if (options.showToast) {
    showErrorToast(finalError);
  }
  
  return { data: null, error: finalError };
}

// Helper function to display appropriate error messages
function showErrorToast(error: ApiError): void {
  switch (error.type) {
    case ApiErrorType.Network:
      toast.error('Connection failed. Please check your internet connection.');
      break;
    case ApiErrorType.Authentication:
      toast.error('Authentication failed. Please check your API credentials.');
      break;
    case ApiErrorType.NotFound:
      toast.error('Resource not found. The API endpoint may have changed.');
      break;
    case ApiErrorType.Server:
      toast.error('Server error. Please try again later.');
      break;
    case ApiErrorType.RateLimit:
      toast.error('Rate limit exceeded. Please try again later.');
      break;
    case ApiErrorType.Cors:
      toast.error('API access blocked. This may be a cross-origin issue.');
      break;
    default:
      toast.error(`Error: ${error.message}`);
  }
}

// Mock API in development for testing
export function mockApiRequest<T>(mockData: T): Promise<{ data: T; error: null }> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ data: mockData, error: null });
    }, 500);
  });
}

// Track API call status for the health check
let lastHealthCheckStatus: {
  timestamp: number;
  success: boolean;
  message?: string;
} = {
  timestamp: 0,
  success: false
};

// Health check function that updates the status
export async function checkApiHealth(): Promise<{ data: any | null; error: ApiError | null }> {
  try {
    const response = await apiRequest<any>('health', {
      retries: 2,
      showToast: false
    });
    
    const success = !!response.data && !response.error && 
      (response.data.status === 'OK' || response.data.status === 'ok');
    
    lastHealthCheckStatus = {
      timestamp: Date.now(),
      success,
      message: response.error?.message
    };
    
    return response;
  } catch (err) {
    lastHealthCheckStatus = {
      timestamp: Date.now(),
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error during health check'
    };
    return { 
      data: null, 
      error: {
        type: ApiErrorType.Unknown,
        message: err instanceof Error ? err.message : 'Unknown error during health check'
      } 
    };
  }
}

// Get the last health check status
export function getLastHealthCheckStatus() {
  return lastHealthCheckStatus;
}
