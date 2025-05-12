
/**
 * Utility functions for browser storage
 */
import { browserAPI } from "../browserUtils";

// Save data to extension storage
export function saveToStorage(key: string, value: any): Promise<void> {
  if (browserAPI.isExtensionEnvironment()) {
    return browserAPI.storage.set({ [key]: value });
  } else {
    // For development without browser API
    localStorage.setItem(key, JSON.stringify(value));
    return Promise.resolve();
  }
}

// Get data from extension storage
export function getFromStorage<T>(key: string): Promise<T | null> {
  if (browserAPI.isExtensionEnvironment()) {
    return browserAPI.storage.get<Record<string, T>>([key])
      .then(result => result[key] || null);
  } else {
    // For development without browser API
    const value = localStorage.getItem(key);
    return Promise.resolve(value ? JSON.parse(value) as T : null);
  }
}
