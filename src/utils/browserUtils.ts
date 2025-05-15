
/**
 * Utility functions for browser extension environment
 */

// Check if the current environment is a browser extension
export function isExtensionEnvironment(): boolean {
  return !!window.chrome?.runtime || !!window.browser?.runtime;
}

// Safe access to browser API with fallback to chrome API or mock
export function getBrowserAPI() {
  // For actual extension environment
  if (typeof window !== 'undefined') {
    // Use the browser object if available (Firefox, etc.)
    if (window.browser) {
      return window.browser;
    }
    
    // Use chrome object as fallback (Chrome, Edge, etc.)
    if (window.chrome?.runtime) {
      return window.chrome;
    }
  }
  
  // For preview/web environment, return a mock implementation
  return createMockBrowserAPI();
}

// Create a mock browser API for preview/web environment
function createMockBrowserAPI() {
  console.log('Using mock browser API for web/preview environment');
  
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
