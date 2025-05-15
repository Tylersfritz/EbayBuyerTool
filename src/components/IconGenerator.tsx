
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateDefaultIcons, downloadGeneratedIcons } from '@/utils/generateDefaultIcons';
import { toast } from "@/components/ui/use-toast";

/**
 * Enhanced component that can generate missing extension icons
 * This is helpful for users who are having issues with missing icons
 */
const IconGenerator: React.FC = () => {
  const [icons, setIcons] = useState<{
    icon16: string;
    icon48: string;
    icon128: string;
    icon16Active: string;
    icon48Active: string;
    icon128Active: string;
    favicon: string;
  } | null>(null);
  
  useEffect(() => {
    // Generate icons when component mounts
    const generatedIcons = generateDefaultIcons();
    
    // Generate active versions (with slightly different color)
    const activeColor = '#4CAF50'; // Green color for active state
    const activeIcons = generateDefaultIcons(activeColor);
    
    // Generate favicon (same as icon16 but marked as favicon)
    setIcons({
      ...generatedIcons,
      icon16Active: activeIcons.icon16,
      icon48Active: activeIcons.icon48,
      icon128Active: activeIcons.icon128,
      favicon: generatedIcons.icon16 // Using icon16 as the favicon
    });
  }, []);
  
  const handleGenerateIcons = () => {
    const generatedIcons = generateDefaultIcons();
    const activeIcons = generateDefaultIcons('#4CAF50');
    
    setIcons({
      ...generatedIcons,
      icon16Active: activeIcons.icon16,
      icon48Active: activeIcons.icon48,
      icon128Active: activeIcons.icon128,
      favicon: generatedIcons.icon16
    });
    
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
  
  const handleDownloadActiveIcons = () => {
    if (icons) {
      const activeIconsOnly = {
        icon16: icons.icon16Active,
        icon48: icons.icon48Active,
        icon128: icons.icon128Active,
      };
      downloadGeneratedIcons(activeIconsOnly, '-active');
      toast({
        title: "Active Icons Downloaded",
        description: "Save these files to your project's public folder",
        duration: 5000
      });
    }
  };
  
  const handleDownloadFavicon = () => {
    if (icons && icons.favicon) {
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = icons.favicon;
      a.download = 'favicon.ico';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Favicon Downloaded",
        description: "Save this file to your project's public folder. Note: This is just a renamed PNG file, not a true ICO file.",
        duration: 5000
      });
    }
  };
  
  const handleDownloadAll = () => {
    if (icons) {
      handleDownloadIcons();
      handleDownloadActiveIcons();
      handleDownloadFavicon();
      
      toast({
        title: "All Icons Downloaded",
        description: "All icons have been downloaded. Save these files to your project's public folder.",
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
        
        <Tabs defaultValue="standard">
          <TabsList className="w-full">
            <TabsTrigger value="standard" className="flex-1">Standard Icons</TabsTrigger>
            <TabsTrigger value="active" className="flex-1">Active Icons</TabsTrigger>
            <TabsTrigger value="favicon" className="flex-1">Favicon</TabsTrigger>
          </TabsList>
          <TabsContent value="standard">
            <div className="grid grid-cols-3 gap-4 my-4">
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
            <Button onClick={handleDownloadIcons} className="w-full">
              Download Standard Icons
            </Button>
          </TabsContent>
          
          <TabsContent value="active">
            <div className="grid grid-cols-3 gap-4 my-4">
              {icons && (
                <>
                  <div className="flex flex-col items-center">
                    <h3 className="text-sm font-medium mb-2">16x16 Active</h3>
                    <img 
                      src={icons.icon16Active} 
                      alt="16x16 active icon" 
                      className="border border-gray-200 w-16 h-16"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <h3 className="text-sm font-medium mb-2">48x48 Active</h3>
                    <img 
                      src={icons.icon48Active} 
                      alt="48x48 active icon" 
                      className="border border-gray-200 w-16 h-16"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <h3 className="text-sm font-medium mb-2">128x128 Active</h3>
                    <img 
                      src={icons.icon128Active} 
                      alt="128x128 active icon" 
                      className="border border-gray-200 w-16 h-16"
                    />
                  </div>
                </>
              )}
            </div>
            <Button onClick={handleDownloadActiveIcons} className="w-full">
              Download Active Icons
            </Button>
          </TabsContent>
          
          <TabsContent value="favicon">
            <div className="flex flex-col items-center my-4">
              {icons && (
                <>
                  <h3 className="text-sm font-medium mb-2">Favicon</h3>
                  <img 
                    src={icons.favicon} 
                    alt="Favicon" 
                    className="border border-gray-200 w-16 h-16 mb-4"
                  />
                  <p className="text-sm text-muted-foreground mb-4">
                    Note: This is a PNG file renamed to .ico. For a true ICO file, use a dedicated icon converter.
                  </p>
                </>
              )}
            </div>
            <Button onClick={handleDownloadFavicon} className="w-full">
              Download Favicon
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleGenerateIcons}>
          Regenerate All Icons
        </Button>
        <Button onClick={handleDownloadAll}>
          Download All Icons
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IconGenerator;
