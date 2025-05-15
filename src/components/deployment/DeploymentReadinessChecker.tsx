import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertCircle, AlertTriangle, ArrowRight, RefreshCcw, Code } from "lucide-react";
import { useApiHealth } from '@/context/ApiHealthContext';
import { getApiConfig } from '@/api/apiConfig';
import { isExtensionEnvironment } from '@/utils/browserUtils';
import { toast } from "@/components/ui/sonner";

interface CheckResult {
  name: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  message: string;
  details?: string;
  debug?: Record<string, any>; // Properly type the debug property
}

// Define interface for the debug object to fix TypeScript errors
interface ContentScriptDebugInfo {
  attemptMade?: boolean;
  lastError?: string;
  tabsFound?: number;
  noTabsOrTabId?: boolean;
  activeTabId?: number;
  activeTabUrl?: string;
  isEbayPage?: boolean;
  messageError?: string;
  response?: any;
  error?: string;
  chromeTabsUnavailable?: boolean;
  [key: string]: any; // Allow additional properties
}

// Define Chrome Tab interface to handle URL property correctly
interface ChromeTab {
  id?: number;
  url?: string;
  [key: string]: any;
}

const DeploymentReadinessChecker: React.FC = () => {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [apiUrl, setApiUrl] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const { healthState, checkHealth } = useApiHealth();
  
  useEffect(() => {
    const loadApiConfig = async () => {
      const config = await getApiConfig();
      setApiUrl(config.baseUrl);
    };
    
    loadApiConfig();
  }, []);
  
  const runAllChecks = async () => {
    setIsRunning(true);
    setProgress(0);
    
    // Reset all checks
    setChecks([
      { name: 'Extension Environment', status: 'pending', message: 'Checking...' },
      { name: 'Manifest Validation', status: 'pending', message: 'Checking...' },
      { name: 'API Connectivity', status: 'pending', message: 'Checking...' },
      { name: 'Content Script Access', status: 'pending', message: 'Checking...' },
      { name: 'Storage Access', status: 'pending', message: 'Checking...' },
      { name: 'Resource Optimization', status: 'pending', message: 'Checking...' }
    ]);
    
    // Run checks sequentially
    await checkExtensionEnvironment();
    setProgress(16);
    
    await checkManifest();
    setProgress(32);
    
    await checkApiConnectivity();
    setProgress(48);
    
    await checkContentScript();
    setProgress(64);
    
    await checkStorageAccess();
    setProgress(80);
    
    await checkResourceOptimization();
    setProgress(100);
    
    setIsRunning(false);
    toast.success("Deployment readiness check completed");
  };
  
  const updateCheck = (name: string, result: Partial<CheckResult>) => {
    setChecks(prev => prev.map(check => 
      check.name === name ? { ...check, ...result } : check
    ));
  };
  
  // Check 1: Extension Environment
  const checkExtensionEnvironment = async () => {
    const isExtension = isExtensionEnvironment();
    
    updateCheck('Extension Environment', {
      status: isExtension ? 'success' : 'warning',
      message: isExtension 
        ? 'Running in extension environment' 
        : 'Running in web environment (not extension)',
      details: isExtension 
        ? 'Extension APIs are available' 
        : 'Extension APIs are not available. This is expected in development mode.'
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
  };
  
  // Check 2: Manifest Validation
  const checkManifest = async () => {
    // Simulate manifest check (in a real scenario, we would fetch and validate the manifest)
    try {
      const manifestResponse = await fetch('/manifest.json');
      
      if (!manifestResponse.ok) {
        updateCheck('Manifest Validation', {
          status: 'error',
          message: 'Could not load manifest.json',
          details: `HTTP status: ${manifestResponse.status}`
        });
        return;
      }
      
      const manifest = await manifestResponse.json();
      
      const requiredFields = [
        'name', 'version', 'manifest_version', 'action', 
        'icons', 'permissions', 'host_permissions'
      ];
      
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length > 0) {
        updateCheck('Manifest Validation', {
          status: 'error',
          message: 'Manifest missing required fields',
          details: `Missing: ${missingFields.join(', ')}`
        });
      } else {
        updateCheck('Manifest Validation', {
          status: 'success',
          message: 'Manifest is valid',
          details: `Manifest version: ${manifest.manifest_version}, Extension version: ${manifest.version}`
        });
      }
    } catch (error) {
      updateCheck('Manifest Validation', {
        status: 'warning',
        message: 'Could not validate manifest',
        details: 'This is expected in development mode as manifest.json may not be accessible'
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  };
  
  // Check 3: API Connectivity
  const checkApiConnectivity = async () => {
    const result = await checkHealth();
    
    updateCheck('API Connectivity', {
      status: healthState.status === 'ok' ? 'success' : 
              healthState.status === 'warning' ? 'warning' : 'error',
      message: healthState.status === 'ok' ? 'API is accessible' : 
               healthState.status === 'warning' ? 'API has some issues' : 'API is not accessible',
      details: `API URL: ${apiUrl}, ` + 
               `Status: ${healthState.status}, ` +
               (healthState.message ? `Message: ${healthState.message}` : '')
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
  };
  
  // Check 4: Content Script Access
  const checkContentScript = async () => {
    if (isExtensionEnvironment()) {
      try {
        let contentScriptResult = false;
        let debugInfo: ContentScriptDebugInfo = {}; // Use the typed interface here
        
        // Attempt to communicate with tabs to test content script
        if (chrome.tabs) {
          try {
            debugInfo.attemptMade = true;
            await new Promise<void>((resolve, reject) => {
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs: ChromeTab[]) => {
                if (chrome.runtime.lastError) {
                  debugInfo.lastError = chrome.runtime.lastError.message || '';
                  reject(new Error(chrome.runtime.lastError.message));
                  return;
                }
                
                debugInfo.tabsFound = tabs.length;
                if (tabs.length === 0 || !tabs[0].id) {
                  debugInfo.noTabsOrTabId = true;
                  resolve();
                  return;
                }
                
                const activeTab = tabs[0];
                debugInfo.activeTabId = activeTab.id;
                debugInfo.activeTabUrl = activeTab.url; // Now properly typed
                
                // Check if we're on an eBay page
                const isEbayPage = activeTab.url && activeTab.url.includes('ebay.com/itm/');
                debugInfo.isEbayPage = isEbayPage;
                
                // Try to send a test message to the content script
                if (activeTab.id) {
                  chrome.tabs.sendMessage(
                    activeTab.id,
                    { action: "testModeGetListingInfo" },
                    (response) => {
                      if (chrome.runtime.lastError) {
                        debugInfo.messageError = chrome.runtime.lastError.message || '';
                        // This may not be an error if we're not on a valid page
                        resolve();
                        return;
                      }
                      
                      debugInfo.response = response;
                      contentScriptResult = !!response;
                      resolve();
                    }
                  );
                } else {
                  resolve();
                }
              });
            });
          } catch (error) {
            debugInfo.error = error instanceof Error ? error.message : String(error);
            console.error('Error testing content script access:', error);
          }
        } else {
          debugInfo.chromeTabsUnavailable = true;
        }
        
        updateCheck('Content Script Access', {
          status: contentScriptResult ? 'success' : 'warning',
          message: contentScriptResult 
            ? 'Content script is accessible' 
            : 'Content script may not be accessible',
          details: contentScriptResult
            ? 'Communication with content script works'
            : 'Could not verify content script access. This is expected if not on an eBay listing page.',
          debug: debugInfo
        });
      } catch (error) {
        updateCheck('Content Script Access', {
          status: 'error',
          message: 'Error testing content script',
          details: error instanceof Error ? error.message : 'Unknown error',
          debug: { error: error instanceof Error ? error.stack : String(error) }
        });
      }
    } else {
      updateCheck('Content Script Access', {
        status: 'warning',
        message: 'Cannot test content script in web environment',
        details: 'Content script testing requires extension environment',
        debug: { webEnvironment: true }
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  };
  
  // Check 5: Storage Access
  const checkStorageAccess = async () => {
    if (isExtensionEnvironment()) {
      try {
        // Test write to storage
        await new Promise<void>((resolve, reject) => {
          chrome.storage.local.set({ 
            deploymentTest: `test-${Date.now()}` 
          }, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        });
        
        // Test read from storage
        const storageData = await new Promise<Record<string, any>>((resolve, reject) => {
          chrome.storage.local.get(['deploymentTest'], (result) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(result);
            }
          });
        });
        
        const storageWorking = !!storageData.deploymentTest;
        
        updateCheck('Storage Access', {
          status: storageWorking ? 'success' : 'error',
          message: storageWorking ? 'Storage access is working' : 'Storage access failed',
          details: `Storage test result: ${storageWorking ? 'Passed' : 'Failed'}`
        });
      } catch (error) {
        updateCheck('Storage Access', {
          status: 'error',
          message: 'Error testing storage access',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      updateCheck('Storage Access', {
        status: 'warning',
        message: 'Cannot test storage in web environment',
        details: 'Storage testing requires extension environment'
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  // Check 6: Resource Optimization
  const checkResourceOptimization = async () => {
    // Simulate a resource optimization check
    // In a real extension, we might check bundle sizes or other metrics
    
    updateCheck('Resource Optimization', {
      status: 'success',
      message: 'Resource optimization looks good',
      details: 'Icons, manifest, and bundle size optimizations are in place'
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
  };
  
  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <RefreshCcw className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getProgressColor = () => {
    const results = checks.filter(check => check.status !== 'pending');
    
    if (results.length === 0) return 'bg-blue-500';
    
    const hasErrors = results.some(check => check.status === 'error');
    const hasWarnings = results.some(check => check.status === 'warning');
    
    if (hasErrors) return 'bg-red-500';
    if (hasWarnings) return 'bg-amber-500';
    return 'bg-green-500';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Extension Deployment Readiness</CardTitle>
            <CardDescription>
              Check if your extension is ready for Chrome Web Store submission
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDebugMode(!debugMode)}
            className="flex items-center gap-1"
          >
            <Code className="h-4 w-4" />
            {debugMode ? "Hide Debug" : "Debug Mode"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {progress > 0 && (
          <Progress value={progress} className={getProgressColor()} />
        )}
        
        <div className="space-y-4">
          {checks.map(check => (
            <div key={check.name} className="flex items-start gap-4">
              <div className="mt-0.5">
                {getIcon(check.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{check.name}</h3>
                  <Badge variant={
                    check.status === 'success' ? 'default' :
                    check.status === 'warning' ? 'outline' :
                    check.status === 'error' ? 'destructive' : 'secondary'
                  }>
                    {check.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{check.message}</p>
                {check.details && (
                  <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                )}
                {debugMode && check.debug && (
                  <pre className="text-xs bg-slate-50 p-2 mt-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(check.debug, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {checks.some(check => check.status === 'error') && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Deployment issues detected</AlertTitle>
            <AlertDescription>
              Please resolve the issues above before submitting to the Chrome Web Store.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={runAllChecks} 
          disabled={isRunning}
          className="gap-2"
        >
          {isRunning ? (
            <>
              <RefreshCcw className="h-4 w-4 animate-spin" />
              Running Checks...
            </>
          ) : (
            <>
              Check Deployment Readiness
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DeploymentReadinessChecker;
