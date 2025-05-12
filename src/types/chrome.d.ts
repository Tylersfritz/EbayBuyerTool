
// Chrome extension API type definitions
interface Chrome {
  storage: {
    local: {
      get: (keys: string | string[] | object, callback: (items: object) => void) => void;
      set: (items: object, callback?: () => void) => void;
    };
  };
  runtime: {
    sendMessage: (message: any, callback?: (response: any) => void) => void;
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
    };
    lastError?: {
      message?: string;
    };
    getURL?: (path: string) => string;
  };
  tabs: {
    query: (queryInfo: { active: boolean, currentWindow: boolean }, callback: (tabs: { id?: number }[]) => void) => void;
    sendMessage: (tabId: number, message: any, callback?: (response?: any) => void) => void;
    create?: (createProperties: { url: string }) => void;
    onUpdated?: {
      addListener: (callback: (tabId: number, changeInfo: any, tab: any) => void) => void;
    };
  };
  action?: {
    setIcon: (details: { path: Record<string, string>, tabId?: number }) => void;
  };
  browserAction?: {
    setIcon: (details: { path: Record<string, string>, tabId?: number }) => void;
  };
}

// Browser WebExtension API type definitions
interface Browser {
  storage: {
    local: {
      get: (keys: string | string[] | object) => Promise<Record<string, any>>;
      set: (items: object) => Promise<void>;
    };
  };
  runtime: {
    sendMessage: (message: any) => Promise<any>;
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: any) => boolean | void) => void;
    };
    lastError?: {
      message?: string;
    };
    getURL: (path: string) => string;
  };
  tabs: {
    query: (queryInfo: { active: boolean, currentWindow: boolean }) => Promise<{ id?: number, url?: string }[]>;
    sendMessage: (tabId: number, message: any) => Promise<any>;
    create: (createProperties: { url: string }) => Promise<any>;
    onUpdated?: {
      addListener: (callback: (tabId: number, changeInfo: any, tab: any) => void) => void;
    };
  };
  action?: {
    setIcon: (details: { path: Record<string, string>, tabId?: number }) => Promise<void>;
  };
  browserAction?: {
    setIcon: (details: { path: Record<string, string>, tabId?: number }) => Promise<void>;
  };
}

declare const chrome: Chrome;
declare const browser: Browser;
