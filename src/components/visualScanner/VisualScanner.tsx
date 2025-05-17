
import * as React from 'react';
import { useState, useRef } from 'react';
import { Camera, ImagePlus, ScanLine, X, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/sonner";
import { trackVisualScannerUsage } from "@/utils/premium/premiumUtils";

interface VisualScannerProps {
  onScanComplete: (data: ScanResult) => void;
  onCancel: () => void;
  isPremium: boolean;
}

export interface ScanResult {
  title?: string;
  description?: string;
  brand?: string;
  model?: string;
  imageUrl?: string;
  confidence: number;
  itemId?: string;  // Added itemId to match expected interface
}

const VisualScanner: React.FC<VisualScannerProps> = ({ onScanComplete, onCancel, isPremium }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if the browser supports getUserMedia
  const hasGetUserMedia = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };
  
  // Start camera stream
  const startCamera = async () => {
    if (!hasGetUserMedia()) {
      toast.error("Camera access is not supported by your browser");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
    }
  };
  
  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };
  
  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setImagePreview(imageData);
        stopCamera();
        analyzeImage(imageData);
      }
    }
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setImagePreview(imageData);
      analyzeImage(imageData);
    };
    reader.readAsDataURL(file);
  };
  
  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Analyze image using mock API (replace with real API in production)
  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    
    try {
      // Track usage in Supabase
      await trackVisualScannerUsage();
      
      // In a real implementation, you would send the image to your API
      // For now, we'll use a mock response with a delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock scan result
      const result: ScanResult = {
        title: "Scanned Product",
        brand: "Example Brand",
        model: "Model XYZ-123",
        description: "A product detected from the image scan",
        imageUrl: imageData,
        confidence: 0.85,
        itemId: "mock-item-123"  // Added mock itemId
      };
      
      onScanComplete(result);
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  // Handle cancel
  const handleCancel = () => {
    stopCamera();
    setImagePreview(null);
    onCancel();
  };
  
  if (isAnalyzing) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            {imagePreview && (
              <div className="relative w-full max-w-xs mx-auto">
                <img 
                  src={imagePreview} 
                  alt="Scan preview" 
                  className="w-full h-auto rounded-md object-contain max-h-60" 
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-md">
                  <Loader className="h-12 w-12 text-white animate-spin" />
                </div>
              </div>
            )}
            <p className="text-sm font-medium">Analyzing image...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Visual Scanner</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {isCapturing ? (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto"
              />
              <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                <div className="w-full h-full flex items-center justify-center">
                  <ScanLine className="h-40 w-40 text-primary opacity-70" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button 
                onClick={captureImage}
                className="bg-primary hover:bg-primary/90"
              >
                <Camera className="h-4 w-4 mr-2" /> Capture
              </Button>
              <Button
                variant="outline"
                onClick={stopCamera}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {imagePreview ? (
              <div className="bg-gray-100 rounded-lg p-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-auto rounded object-contain max-h-60"
                />
              </div>
            ) : (
              <Alert>
                <AlertDescription className="text-sm">
                  Scan a product image to analyze and find pricing information
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button 
                onClick={startCamera}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" /> Use Camera
              </Button>
              
              <Button 
                variant="secondary"
                onClick={triggerFileUpload}
                className="flex-1"
              >
                <ImagePlus className="h-4 w-4 mr-2" /> Upload Image
              </Button>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualScanner;
