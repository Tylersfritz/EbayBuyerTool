
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateDefaultIcons, downloadGeneratedIcons } from '@/utils/generateDefaultIcons';
import { toast } from "@/components/ui/use-toast";

/**
 * Simple component that can generate missing extension icons
 * This is helpful for users who are having issues with missing icons
 */
const IconGenerator: React.FC = () => {
  const [icons, setIcons] = useState<{
    icon16: string;
    icon48: string;
    icon128: string;
    icon16Active?: string;
    icon48Active?: string;
    icon128Active?: string;
  } | null>(null);
  
  useEffect(() => {
    // Generate icons when component mounts
    const generatedIcons = generateDefaultIcons();
    setIcons(generatedIcons);
  }, []);
  
  const handleGenerateIcons = () => {
    const generatedIcons = generateDefaultIcons();
    setIcons(generatedIcons);
    toast({
      title: "Icons Generated",
      description: "Icons have been generated and can now be downloaded",
      duration: 3000
    });
  };
  
  const handleDownloadIcons = () => {
    if (icons) {
      downloadGeneratedIcons(icons);
      toast({
        title: "Icons Downloaded",
        description: "Save these files to your project's public folder",
        duration: 5000
      });
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Extension Icon Generator</CardTitle>
        <CardDescription>
          Generate missing icons required for the extension to load properly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="warning" className="bg-amber-50 border-amber-200 mb-4">
          <AlertTitle>Manifest Loading Error Fix</AlertTitle>
          <AlertDescription>
            If you're seeing a "Manifest file is missing or unreadable" error, download these icons and place them in your project's public folder, then rebuild the extension.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-3 gap-4">
          {icons && (
            <>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">16x16</h3>
                <img 
                  src={icons.icon16} 
                  alt="16x16 icon" 
                  className="border border-gray-200 w-16 h-16" 
                />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">48x48</h3>
                <img 
                  src={icons.icon48} 
                  alt="48x48 icon" 
                  className="border border-gray-200 w-16 h-16" 
                />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">128x128</h3>
                <img 
                  src={icons.icon128} 
                  alt="128x128 icon" 
                  className="border border-gray-200 w-16 h-16" 
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleGenerateIcons}>
          Regenerate Icons
        </Button>
        <Button onClick={handleDownloadIcons}>
          Download Icons
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IconGenerator;
