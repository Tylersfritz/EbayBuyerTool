
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/sonner";
import { detectBrowser, browserAPI, isExtensionEnvironment } from '@/utils/browserUtils';
import { BrowserApiTestResult } from '@/components/deployment/BrowserTestResult';

export interface BrowserCompatibilityResults {
  [key: string]: BrowserApiTestResult;
}

/**
 * Hook for browser detection and API compatibility testing
 */
export function useBrowserCompatibility() {
  const [currentBrowser, setCurrentBrowser] = useState<string>('unknown');
  const [apiResults, setApiResults] = useState<BrowserCompatibilityResults>({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  useEffect(() => {
    // Detect current browser on component mount
    setCurrentBrowser(detectBrowser());
  }, []);
  
  const runCompatibilityTests = async () => {
    setIsRunningTests(true);
    const results: BrowserCompatibilityResults = {};
    
    // Check if we're in an extension environment first
    const extensionEnv = isExtensionEnvironment();
    
    // Test browser.storage API
    try {
      if (!extensionEnv) {
        results['storage'] = {
          available: false,
          working: false,
          message: 'Extension APIs not available in web environment. Testing in simulation mode.'
        };
      } else {
        const testKey = 'browserCompatTest';
        const testValue = { timestamp: new Date().toISOString() };
        
        await browserAPI.storage.set({ [testKey]: testValue });
        const retrieved = await browserAPI.storage.get<any>(testKey);
        
        results['storage'] = {
          available: true,
          working: JSON.stringify(retrieved[testKey]) === JSON.stringify(testValue),
          message: retrieved[testKey] ? 'Storage API working correctly' : 'Storage test failed'
        };
      }
    } catch (error) {
      results['storage'] = {
        available: false,
        working: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
    
    // Test browser.runtime API
    try {
      if (!extensionEnv) {
        results['runtime'] = {
          available: false,
          working: false,
          message: 'Extension APIs not available in web environment. Testing in simulation mode.'
        };
      } else {
        const url = browserAPI.runtime.getURL('manifest.json');
        results['runtime'] = {
          available: true,
          working: !!url,
          message: url ? 'Runtime API available' : 'Runtime getURL not available'
        };
      }
    } catch (error) {
      results['runtime'] = {
        available: false,
        working: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
    
    // Test browser.tabs API
    try {
      if (!extensionEnv) {
        results['tabs'] = {
          available: false,
          working: false,
          message: 'Extension APIs not available in web environment. Testing in simulation mode.'
        };
      } else {
        const tabQuery = await browserAPI.tabs.query({ active: true, currentWindow: true });
        
        results['tabs'] = {
          available: true,
          working: Array.isArray(tabQuery) && tabQuery.length > 0,
          message: Array.isArray(tabQuery) && tabQuery.length > 0 ? 
            'Tabs API working correctly' : 'Tabs query returned no results'
        };
      }
    } catch (error) {
      results['tabs'] = {
        available: false,
        working: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
    
    setApiResults(results);
    setIsRunningTests(false);
    
    // Calculate overall compatibility 
    const totalTests = Object.keys(results).length;
    const workingTests = Object.values(results).filter(r => r.working).length;
    const compatibilityScore = extensionEnv ? 
      Math.round((workingTests / totalTests) * 100) : 
      0;
    
    if (!extensionEnv) {
      toast.warning('Running in web environment. Extension APIs not available.');
    } else {
      toast.success(`Compatibility check complete: ${compatibilityScore}% compatible`);
    }
  };
  
  return {
    currentBrowser,
    apiResults,
    isRunningTests,
    runCompatibilityTests
  };
}
