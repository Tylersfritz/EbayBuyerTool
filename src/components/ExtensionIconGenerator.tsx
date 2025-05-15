import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { generateDefaultIcons, downloadGeneratedIcons } from '@/utils/generateDefaultIcons';
import { toast } from '@/hooks/use-toast';
import { DownloadCloud, RefreshCw, Paintbrush } from 'lucide-react';

type IconStyle = 'gradient' | 'flat' | 'outline';

interface IconSet {
  icon16: string;
  icon48: string;
  icon128: string;
  icon16Active: string;
  icon48Active: string;
  icon128Active: string;
}

const ExtensionIconGenerator: React.FC = () => {
  const [icons, setIcons] = useState<IconSet | null>(null);
  
  const [primaryColor, setPrimaryColor] = useState('#1EAEDB');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [iconStyle, setIconStyle] = useState<IconStyle>('gradient');
  
  useEffect(() => {
    // Generate icons when component mounts
    generateIcons();
  }, []);
  
  const generateIcons = () => {
    const generatedIcons = generateDefaultIcons(primaryColor, secondaryColor, iconStyle);
    setIcons(generatedIcons);
  };
  
  useEffect(() => {
    generateIcons();
  }, [primaryColor, secondaryColor, iconStyle]);
  
  const handleDownloadIcons = () => {
    if (!icons) return;
    
    // Convert IconSet to Record<string, string> to match the expected type
    const iconRecord: Record<string, string> = {
      icon16: icons.icon16,
      icon48: icons.icon48,
      icon128: icons.icon128,
      icon16Active: icons.icon16Active,
      icon48Active: icons.icon48Active,
      icon128Active: icons.icon128Active
    };
    
    downloadGeneratedIcons(iconRecord);
    
    toast({
      title: "Icons Downloaded",
      description: "Save these files to your project's public folder",
      duration: 5000
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Extension Icon Generator</CardTitle>
        <CardDescription>
          Create consistent icons for your extension in all required sizes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            All Chrome extensions require several icon sizes. After generating, download and place them in your project's public folder.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="design">
          <TabsList>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="design" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-10 cursor-pointer rounded-md"
                  />
                  <input 
                    type="text" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-24 px-2 py-1 border rounded-md"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={secondaryColor} 
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full h-10 cursor-pointer rounded-md"
                  />
                  <input 
                    type="text" 
                    value={secondaryColor} 
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-24 px-2 py-1 border rounded-md"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon Style</label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={iconStyle === 'gradient' ? 'default' : 'outline'} 
                  onClick={() => setIconStyle('gradient')}
                  className="h-auto py-2"
                >
                  Gradient
                </Button>
                <Button 
                  variant={iconStyle === 'flat' ? 'default' : 'outline'}
                  onClick={() => setIconStyle('flat')}
                  className="h-auto py-2"
                >
                  Flat
                </Button>
                <Button 
                  variant={iconStyle === 'outline' ? 'default' : 'outline'}
                  onClick={() => setIconStyle('outline')}
                  className="h-auto py-2"
                >
                  Outline
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {icons && (
                <>
                  <div className="flex flex-col items-center space-y-2">
                    <h3 className="text-sm font-medium">16x16</h3>
                    <div className="p-4 border rounded bg-slate-50">
                      <img 
                        src={icons.icon16} 
                        alt="16x16 icon" 
                        className="w-16 h-16 object-contain" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <h3 className="text-sm font-medium">48x48</h3>
                    <div className="p-4 border rounded bg-slate-50">
                      <img 
                        src={icons.icon48} 
                        alt="48x48 icon" 
                        className="w-16 h-16 object-contain" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <h3 className="text-sm font-medium">128x128</h3>
                    <div className="p-4 border rounded bg-slate-50">
                      <img 
                        src={icons.icon128} 
                        alt="128x128 icon" 
                        className="w-16 h-16 object-contain" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <h3 className="text-sm font-medium">16x16 Active</h3>
                    <div className="p-4 border rounded bg-slate-50">
                      <img 
                        src={icons.icon16Active} 
                        alt="16x16 active icon" 
                        className="w-16 h-16 object-contain" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <h3 className="text-sm font-medium">48x48 Active</h3>
                    <div className="p-4 border rounded bg-slate-50">
                      <img 
                        src={icons.icon48Active} 
                        alt="48x48 active icon" 
                        className="w-16 h-16 object-contain" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <h3 className="text-sm font-medium">128x128 Active</h3>
                    <div className="p-4 border rounded bg-slate-50">
                      <img 
                        src={icons.icon128Active} 
                        alt="128x128 active icon" 
                        className="w-16 h-16 object-contain" 
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="outline" 
          onClick={generateIcons}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
        <Button 
          onClick={handleDownloadIcons}
          className="flex items-center gap-2"
        >
          <DownloadCloud className="h-4 w-4" />
          Download All Icons
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExtensionIconGenerator;
