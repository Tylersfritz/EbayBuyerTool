
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowRight, PlayCircle, XCircle, CheckCircle, RotateCw, Gavel, Tag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { realListings, generateMockListingResponse } from "@/utils/listingTestUtils";
import { toast } from "@/components/ui/sonner";
import { useModeContext } from '@/context/ModeContext';

interface TestResultType {
  success: boolean;
  message: string;
  details?: string;
  data?: any;
}

interface ListingTestToolProps {
  onSelectListing: (listingData: any) => void;
  onResetListing: () => void;
}

const ListingTestTool: React.FC<ListingTestToolProps> = ({ 
  onSelectListing, 
  onResetListing 
}) => {
  const [selectedCategory, setSelectedCategory] = useState(realListings[0].category);
  const [selectedListing, setSelectedListing] = useState<typeof realListings[0]['items'][0] | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState<TestResultType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuctionMode, modeName } = useModeContext();

  // Get listings for the selected category
  const categoryListings = realListings.find(category => 
    category.category === selectedCategory
  )?.items || [];
  
  // Filter listings based on current mode if needed
  const filteredListings = isAuctionMode 
    ? categoryListings.filter(item => item.isAuction) 
    : categoryListings.filter(item => !item.isAuction);
  
  // Effect to handle test mode changes
  useEffect(() => {
    if (!testMode) {
      onResetListing();
      setTestResults([]);
      setSelectedListing(null);
    }
  }, [testMode, onResetListing]);
  
  // Effect to reset selected listing when mode changes
  useEffect(() => {
    setSelectedListing(null);
  }, [isAuctionMode]);
  
  // Function to simulate loading data from a real listing
  const loadTestListing = () => {
    if (!selectedListing) {
      toast.error("Please select a listing first");
      return;
    }
    
    setIsLoading(true);
    setTestResults([]);
    
    // Simulate network delay
    setTimeout(() => {
      try {
        // Generate mock response based on the selected listing
        const mockResponse = generateMockListingResponse(selectedListing);
        
        // Send to parent component
        onSelectListing(mockResponse);
        
        // Add success result
        setTestResults([
          {
            success: true,
            message: `Successfully loaded ${mockResponse.isAuction ? 'auction' : 'fixed price'} listing data`,
            data: mockResponse
          }
        ]);
        
        toast.success("Test listing loaded successfully");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        setTestResults([
          {
            success: false,
            message: "Failed to load listing data",
            details: errorMessage
          }
        ]);
        
        toast.error("Failed to load test listing");
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CardTitle className="text-sm">Testing Tool</CardTitle>
            {testMode && (
              <Badge variant={isAuctionMode ? "warning" : "secondary"} className="ml-2 text-xs">
                {isAuctionMode ? (
                  <div className="flex items-center gap-1">
                    <Gavel className="h-3 w-3" />
                    <span>{modeName} Mode</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    <span>{modeName} Mode</span>
                  </div>
                )}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="test-mode" className="text-xs">Test Mode</Label>
            <Switch 
              id="test-mode" 
              checked={testMode}
              onCheckedChange={setTestMode}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
        </div>
      </CardHeader>
      
      {testMode && (
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="category-select" className="text-xs mb-1 block">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger id="category-select" className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {realListings.map(category => (
                      <SelectItem 
                        key={category.category} 
                        value={category.category}
                        className="text-xs"
                      >
                        {category.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="listing-select" className="text-xs mb-1 block">
                  {isAuctionMode ? "Auction Listing" : "Fixed Price Listing"}
                </Label>
                <Select
                  value={selectedListing?.url || ""}
                  onValueChange={(url) => {
                    const listing = categoryListings.find(item => item.url === url);
                    setSelectedListing(listing || null);
                  }}
                  disabled={filteredListings.length === 0}
                >
                  <SelectTrigger id="listing-select" className="w-full h-8 text-xs">
                    <SelectValue placeholder={`Select ${isAuctionMode ? 'Auction' : 'Fixed Price'} Listing`} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredListings.length > 0 ? (
                      filteredListings.map(item => (
                        <SelectItem 
                          key={item.url} 
                          value={item.url}
                          className="text-xs"
                        >
                          {item.title.substring(0, 30)}...
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled className="text-xs text-red-500">
                        No {isAuctionMode ? 'auction' : 'fixed price'} listings in this category
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {selectedListing && (
              <div className="p-2 bg-slate-50 rounded text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium line-clamp-1">{selectedListing.title}</span>
                  <Badge 
                    variant={selectedListing.isAuction ? "warning" : "secondary"}
                    className="text-[0.65rem] ml-1"
                  >
                    {selectedListing.isAuction ? "Auction" : "Fixed Price"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Expected Price:</span>
                  <Badge variant="outline" className="font-mono">
                    ${selectedListing.expectedPrice.toFixed(2)}
                  </Badge>
                </div>
                {selectedListing.isAuction && selectedListing.timeRemaining && (
                  <div className="flex items-center justify-between mt-1">
                    <span>Time Remaining:</span>
                    <Badge variant="outline" className="font-mono">
                      {selectedListing.timeRemaining}
                    </Badge>
                  </div>
                )}
              </div>
            )}
            
            <Button 
              onClick={loadTestListing} 
              disabled={!selectedListing || isLoading}
              className="w-full h-8 text-xs"
            >
              {isLoading ? (
                <>
                  <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                  Loading Test Data...
                </>
              ) : (
                <>
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Load Test Listing
                </>
              )}
            </Button>
            
            {testResults.length > 0 && (
              <div className="mt-2 space-y-1">
                <Separator className="my-1" />
                <h5 className="text-xs font-medium">Test Results:</h5>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {testResults.map((result, idx) => (
                    <div 
                      key={idx}
                      className={`text-xs p-1 rounded flex items-start ${
                        result.success ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      {result.success ? (
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-1 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{result.message}</p>
                        {result.details && (
                          <p className="text-xs opacity-70">{result.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ListingTestTool;
