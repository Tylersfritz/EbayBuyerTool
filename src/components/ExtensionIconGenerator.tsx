
import React, { useEffect, useRef, useState } from 'react';
import { Shield, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveAs } from 'file-saver';

/**
 * Component that generates icons for the Chrome Extension
 * Creates both standard and active state icons in required sizes
 */
const ExtensionIconGenerator: React.FC = () => {
  const canvasRefs = {
    icon16: useRef<HTMLCanvasElement>(null),
    icon48: useRef<HTMLCanvasElement>(null),
    icon128: useRef<HTMLCanvasElement>(null),
    icon16Active: useRef<HTMLCanvasElement>(null),
    icon48Active: useRef<HTMLCanvasElement>(null),
    icon128Active: useRef<HTMLCanvasElement>(null),
  };
  
  const [icons, setIcons] = useState<Record<string, string>>({});
  
  useEffect(() => {
    generateAllIcons();
  }, []);
  
  const generateAllIcons = () => {
    const iconUrls: Record<string, string> = {};
    
    // Generate standard icons
    iconUrls.icon16 = generateIcon(16, false, canvasRefs.icon16.current);
    iconUrls.icon48 = generateIcon(48, false, canvasRefs.icon48.current);
    iconUrls.icon128 = generateIcon(128, false, canvasRefs.icon128.current);
    
    // Generate active state icons
    iconUrls.icon16Active = generateIcon(16, true, canvasRefs.icon16Active.current);
    iconUrls.icon48Active = generateIcon(48, true, canvasRefs.icon48Active.current);
    iconUrls.icon128Active = generateIcon(128, true, canvasRefs.icon128Active.current);
    
    setIcons(iconUrls);
  };
  
  const generateIcon = (size: number, isActive: boolean, canvas: HTMLCanvasElement | null): string => {
    if (!canvas) return '';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Clear previous content
    ctx.clearRect(0, 0, size, size);
    
    // Set colors based on active state
    const baseColor = isActive ? '#34D399' : '#1EAEDB';
    
    // Draw shield background
    const centerX = size / 2;
    const shieldWidth = size * 0.8;
    const shieldTop = size * 0.1;
    const shieldBottom = size * 0.9;
    
    // Shield shape
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(centerX, shieldTop);
    ctx.lineTo(centerX + shieldWidth/2, shieldTop + size * 0.15);
    ctx.lineTo(centerX + shieldWidth/2, size * 0.6);
    ctx.arcTo(centerX + shieldWidth/2, shieldBottom, centerX, shieldBottom, shieldWidth/2);
    ctx.arcTo(centerX - shieldWidth/2, shieldBottom, centerX - shieldWidth/2, size * 0.6, shieldWidth/2);
    ctx.lineTo(centerX - shieldWidth/2, shieldTop + size * 0.15);
    ctx.closePath();
    ctx.fill();
    
    // Add highlight shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(centerX, shieldTop + size * 0.05);
    ctx.lineTo(centerX + shieldWidth * 0.4, shieldTop + size * 0.15);
    ctx.lineTo(centerX + shieldWidth * 0.3, shieldTop + size * 0.25);
    ctx.lineTo(centerX, shieldTop + size * 0.2);
    ctx.lineTo(centerX - shieldWidth * 0.3, shieldTop + size * 0.25);
    ctx.lineTo(centerX - shieldWidth * 0.4, shieldTop + size * 0.15);
    ctx.closePath();
    ctx.fill();
    
    // Draw text or checkmark
    if (size > 32) {
      // For larger icons
      ctx.fillStyle = 'white';
      ctx.font = `bold ${size * 0.25}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DH', centerX, centerX + size * 0.1);
      
      if (isActive) {
        // Add checkmark for active icons
        ctx.strokeStyle = 'white';
        ctx.lineWidth = size * 0.05;
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.15, centerX - size * 0.05);
        ctx.lineTo(centerX, centerX + size * 0.1);
        ctx.lineTo(centerX + size * 0.2, centerX - size * 0.1);
        ctx.stroke();
      }
    } else {
      // For smaller icons, just use simple text or symbol
      ctx.fillStyle = 'white';
      ctx.font = `bold ${size * 0.4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isActive ? '✓' : 'D', centerX, centerX);
    }
    
    return canvas.toDataURL();
  };
  
  const downloadIcon = (iconKey: string, filename: string) => {
    const iconUrl = icons[iconKey];
    if (iconUrl) {
      saveAs(iconUrl, filename);
    }
  };
  
  const downloadAllIcons = () => {
    downloadIcon('icon16', 'icon-16.png');
    downloadIcon('icon48', 'icon-48.png');
    downloadIcon('icon128', 'icon-128.png');
    downloadIcon('icon16Active', 'icon-16-active.png');
    downloadIcon('icon48Active', 'icon-48-active.png');
    downloadIcon('icon128Active', 'icon-128-active.png');
  };
  
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Extension Icon Generator</CardTitle>
        <CardDescription>Generate and download the required icons for the Chrome Extension</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="standard">
          <TabsList className="mb-4">
            <TabsTrigger value="standard">Standard Icons</TabsTrigger>
            <TabsTrigger value="active">Active State Icons</TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">16x16</h3>
                <canvas ref={canvasRefs.icon16} width="16" height="16" className="border border-gray-200 w-16 h-16"></canvas>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => downloadIcon('icon16', 'icon-16.png')}
                >
                  Download
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">48x48</h3>
                <canvas ref={canvasRefs.icon48} width="48" height="48" className="border border-gray-200 w-16 h-16"></canvas>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => downloadIcon('icon48', 'icon-48.png')}
                >
                  Download
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">128x128</h3>
                <canvas ref={canvasRefs.icon128} width="128" height="128" className="border border-gray-200 w-16 h-16"></canvas>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => downloadIcon('icon128', 'icon-128.png')}
                >
                  Download
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="active" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">16x16 Active</h3>
                <canvas ref={canvasRefs.icon16Active} width="16" height="16" className="border border-gray-200 w-16 h-16"></canvas>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => downloadIcon('icon16Active', 'icon-16-active.png')}
                >
                  Download
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">48x48 Active</h3>
                <canvas ref={canvasRefs.icon48Active} width="48" height="48" className="border border-gray-200 w-16 h-16"></canvas>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => downloadIcon('icon48Active', 'icon-48-active.png')}
                >
                  Download
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">128x128 Active</h3>
                <canvas ref={canvasRefs.icon128Active} width="128" height="128" className="border border-gray-200 w-16 h-16"></canvas>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => downloadIcon('icon128Active', 'icon-128-active.png')}
                >
                  Download
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={downloadAllIcons}>Download All Icons</Button>
      </CardFooter>
    </Card>
  );
};

export default ExtensionIconGenerator;
