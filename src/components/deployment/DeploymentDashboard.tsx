
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Image, CheckCircle, LayoutGrid, Chrome, FileJson } from "lucide-react";

import ExtensionIconGenerator from '@/components/ExtensionIconGenerator';
import DeploymentReadinessChecker from './DeploymentReadinessChecker';
import ApiStatsServiceFixer from './ApiStatsServiceFixer';
import BrowserCompatibilityChecker from './BrowserCompatibilityChecker';
import ManifestFixer from './ManifestFixer';

const DeploymentDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Extension Deployment</h1>
          <p className="text-muted-foreground">Prepare your extension for Chrome Web Store submission</p>
        </div>
        <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">
          Ready for Deployment
        </Badge>
      </div>
      
      <Tabs defaultValue="manifest" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manifest" className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            <span>Fix Manifest</span>
          </TabsTrigger>
          <TabsTrigger value="readiness" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Readiness Check</span>
          </TabsTrigger>
          <TabsTrigger value="browsers" className="flex items-center gap-2">
            <Chrome className="h-4 w-4" />
            <span>Browser Compatibility</span>
          </TabsTrigger>
          <TabsTrigger value="icons" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span>Icons Generator</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span>API Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="package" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Package Builder</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manifest" className="space-y-4">
          <ManifestFixer />
        </TabsContent>
        
        <TabsContent value="readiness" className="space-y-4">
          <DeploymentReadinessChecker />
        </TabsContent>
        
        <TabsContent value="browsers" className="space-y-4">
          <BrowserCompatibilityChecker />
        </TabsContent>
        
        <TabsContent value="icons" className="space-y-4">
          <ExtensionIconGenerator />
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <ApiStatsServiceFixer />
        </TabsContent>
        
        <TabsContent value="package" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Package Builder</CardTitle>
              <CardDescription>
                Build and optimize your extension package for submission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>To build your extension package, run the following commands:</p>
              
              <pre className="bg-slate-100 p-4 rounded-md text-sm">
                {`
# Install dependencies
npm install

# Build the extension
npm run build

# The built extension will be in the 'dist' directory
                `.trim()}
              </pre>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-blue-800 font-medium mb-2">Distribution Package Checklist</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>Verify all necessary icons are included</li>
                  <li>Test the extension in Chrome Developer Mode</li>
                  <li>Validate manifest.json file</li>
                  <li>Check permissions are minimized</li>
                  <li>Prepare promotional images for Chrome Web Store</li>
                </ul>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Browser-Specific Builds</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-md flex justify-between items-center">
                    <div>
                      <span className="font-medium">Chrome & Edge (Manifest V3)</span>
                      <p className="text-sm text-muted-foreground">manifest.json</p>
                    </div>
                    <Badge>Default Build</Badge>
                  </div>
                  <div className="p-3 border rounded-md flex justify-between items-center">
                    <div>
                      <span className="font-medium">Firefox (Manifest V2)</span>
                      <p className="text-sm text-muted-foreground">manifest.firefox.json</p>
                    </div>
                    <Badge variant="outline">Requires Renaming</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeploymentDashboard;
