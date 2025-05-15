
import { getBrowserAPI, isExtensionEnvironment } from '../browserUtils';

// Fallback local storage for web environment
const localStorageCache: Record<string, any> = {};

/**
 * Save data to browser storage
 * @param key Storage key
 * @param value Data to store
 */
export async function saveToStorage<T>(key: string, value: T): Promise<void> {
  try {
    if (isExtensionEnvironment()) {
      const browser = getBrowserAPI();
      await browser.storage.local.set({ [key]: value });
    } else {
      // Fallback to localStorage in web environment
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        // If localStorage fails (e.g., private browsing), use in-memory cache
        localStorageCache[key] = value;
      }
    }
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    // Use in-memory cache as last resort
    localStorageCache[key] = value;
  }
}

/**
 * Get data from browser storage
 * @param key Storage key
 * @returns Stored data or null if not found
 */
export async function getFromStorage<T>(key: string): Promise<T | null> {
  try {
    if (isExtensionEnvironment()) {
      const browser = getBrowserAPI();
      const result = await browser.storage.local.get(key);
      return result[key] as T || null;
    } else {
      // Fallback to localStorage in web environment
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (e) {
        // If localStorage fails, use in-memory cache
        return localStorageCache[key] || null;
      }
    }
  } catch (error) {
    console.error(`Error getting from storage (${key}):`, error);
    // Use in-memory cache as last resort
    return localStorageCache[key] || null;
  }
}

/**
 * Remove data from browser storage
 * @param key Storage key
 */
export async function removeFromStorage(key: string): Promise<void> {
  try {
    if (isExtensionEnvironment()) {
      const browser = getBrowserAPI();
      await browser.storage.local.remove(key);
    } else {
      // Fallback to localStorage in web environment
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // If localStorage fails, clear from in-memory cache
        delete localStorageCache[key];
      }
    }
  } catch (error) {
    console.error(`Error removing from storage (${key}):`, error);
    // Clear from in-memory cache
    delete localStorageCache[key];
  }
}

/**
 * Clear all extension storage
 */
export async function clearAllStorage(): Promise<void> {
  try {
    if (isExtensionEnvironment()) {
      const browser = getBrowserAPI();
      await browser.storage.local.clear();
    } else {
      // Fallback to localStorage in web environment
      try {
        localStorage.clear();
      } catch (e) {
        // If localStorage fails, clear in-memory cache
        Object.keys(localStorageCache).forEach(key => delete localStorageCache[key]);
      }
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}
