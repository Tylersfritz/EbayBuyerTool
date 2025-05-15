
/**
 * Utility functions for browser extension environment
 */

// Check if the current environment is a browser extension
export function isExtensionEnvironment(): boolean {
  try {
    return !!(
      (typeof window !== 'undefined' && window.chrome && window.chrome.runtime) ||
      (typeof window !== 'undefined' && window.browser && window.browser.runtime)
    );
  } catch (e) {
    console.error("Error checking extension environment:", e);
    return false;
  }
}

// Safe access to browser API with fallback to chrome API or mock
export function getBrowserAPI() {
  // For actual extension environment
  if (typeof window !== 'undefined') {
    try {
      // Use the browser object if available (Firefox, etc.)
      if (window.browser) {
        console.log("Using Firefox/browser API");
        return window.browser;
      }
      
      // Use chrome object as fallback (Chrome, Edge, etc.)
      if (window.chrome?.runtime) {
        console.log("Using Chrome API");
        return window.chrome;
      }
    } catch (e) {
      console.error("Error accessing browser APIs:", e);
    }
  }
  
  // For preview/web environment, return a mock implementation
  console.log('Using mock browser API for web/preview environment');
  return createMockBrowserAPI();
}

// Create a mock browser API for preview/web environment
function createMockBrowserAPI() {
  console.log('Creating mock browser API');
  
  // Simple in-memory storage
  const storageData: Record<string, any> = {};
  
  return {
    runtime: {
      id: 'mock-extension-id',
      sendMessage: (message: any) => {
        console.log('Mock sendMessage:', message);
        return Promise.resolve({ success: true, mock: true });
      },
      onMessage: {
        addListener: (callback: Function) => {
          console.log('Mock onMessage listener added');
        },
        removeListener: (callback: Function) => {}
      },
      getURL: (path: string) => {
        return `mock-extension://${path}`;
      }
    },
    storage: {
      local: {
        get: async (keys: string | string[] | null) => {
          console.log('Mock storage.get:', keys);
          if (keys === null) {
            return { ...storageData };
          }
          
          if (typeof keys === 'string') {
            return { [keys]: storageData[keys] };
          }
          
          const result: Record<string, any> = {};
          keys.forEach(key => {
            result[key] = storageData[key];
          });
          
          return result;
        },
        set: async (items: Record<string, any>) => {
          console.log('Mock storage.set:', items);
          Object.assign(storageData, items);
          return;
        },
        remove: async (keys: string | string[]) => {
          console.log('Mock storage.remove:', keys);
          const keysToRemove = typeof keys === 'string' ? [keys] : keys;
          
          keysToRemove.forEach(key => {
            delete storageData[key];
          });
          
          return;
        }
      }
    },
    tabs: {
      query: async (queryInfo: any) => {
        console.log('Mock tabs.query:', queryInfo);
        return [{ id: 1, url: 'https://www.example.com', title: 'Example Page' }];
      },
      sendMessage: async (tabId: number, message: any) => {
        console.log(`Mock tabs.sendMessage to tab ${tabId}:`, message);
        return { success: true, mock: true };
      }
    }
  };
}

// Export a browserAPI object for backward compatibility
export const browserAPI = getBrowserAPI();

// Helper to safely check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';

// Helper to determine if the current environment is localhost/development
export function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.endsWith('.local')
  );
}

// Browser detection utility
export function detectBrowser(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (userAgent.indexOf('firefox') !== -1) return 'firefox';
  if (userAgent.indexOf('edg') !== -1) return 'edge';
  if (userAgent.indexOf('chrome') !== -1) return 'chrome';
  if (userAgent.indexOf('safari') !== -1) return 'safari';
  if (userAgent.indexOf('opera') !== -1 || userAgent.indexOf('opr') !== -1) return 'opera';
  
  return 'unknown';
}

// Check if the extension is properly initialized
export function checkExtensionInitialization(): boolean {
  try {
    const api = getBrowserAPI();
    return !!api?.runtime?.id;
  } catch (e) {
    console.error("Extension initialization check failed:", e);
    return false;
  }
}

// Validate that critical extension APIs are available
export function validateExtensionAPIs(): {valid: boolean, missing: string[]} {
  const missingAPIs: string[] = [];
  const api = getBrowserAPI();
  
  if (!api) missingAPIs.push('browser/chrome API');
  if (!api?.runtime) missingAPIs.push('runtime API');
  if (!api?.storage?.local) missingAPIs.push('storage.local API');
  if (!api?.tabs) missingAPIs.push('tabs API');
  
  return {
    valid: missingAPIs.length === 0,
    missing: missingAPIs
  };
}
