
import React from 'react';
import { Chrome, Globe } from 'lucide-react';
import BrowserIcon from './BrowserIcon';

/**
 * Component that displays browser compatibility information
 */
const BrowserInfoPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="border rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Chrome className="h-5 w-5" />
            <h3 className="font-medium">Chrome</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Manifest V3 compatible. All extension features are fully supported.
          </p>
        </div>
        
        <div className="border rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <BrowserIcon browserName="firefox" />
            <h3 className="font-medium">Firefox</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Uses Manifest V2 with browser-specific settings. Compatible via polyfill.
          </p>
        </div>
        
        <div className="border rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5" />
            <h3 className="font-medium">Edge</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on Chromium, uses Manifest V3 with Chrome-compatible API.
          </p>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-blue-800 font-medium mb-2">Cross-Browser Compatibility</h3>
        <p className="text-sm text-blue-700">
          DealHavenAI uses a browser abstraction layer with the WebExtension Polyfill to ensure
          consistent behavior across different browsers. The extension automatically detects
          the current browser and adapts its functionality accordingly.
        </p>
      </div>
    </div>
  );
};

export default BrowserInfoPanel;
