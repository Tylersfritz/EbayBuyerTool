
import React from 'react';
import { Badge } from "@/components/ui/badge";

export interface BrowserApiTestResult {
  available: boolean;
  working?: boolean;
  message?: string;
}

interface BrowserTestResultProps {
  apiName: string;
  result: BrowserApiTestResult;
}

/**
 * Component that displays the result of a browser API compatibility test
 */
const BrowserTestResult: React.FC<BrowserTestResultProps> = ({ apiName, result }) => {
  return (
    <div 
      className={`p-3 rounded-md border ${
        result.working ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium">browser.{apiName}</span>
        <Badge variant={result.working ? 'default' : 'outline'}>
          {result.working ? 'Compatible' : 'Issue Detected'}
        </Badge>
      </div>
      <p className="text-sm mt-1">{result.message}</p>
    </div>
  );
};

export default BrowserTestResult;
