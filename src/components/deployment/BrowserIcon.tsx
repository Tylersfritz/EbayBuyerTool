
import React from 'react';
import { Chrome, Globe } from 'lucide-react';

interface BrowserIconProps {
  browserName: string;
  size?: number;
  className?: string;
}

/**
 * Component that displays the appropriate browser icon based on browser name
 */
const BrowserIcon: React.FC<BrowserIconProps> = ({ 
  browserName, 
  size = 5, 
  className = "" 
}) => {
  switch (browserName.toLowerCase()) {
    case 'chrome':
      return <Chrome className={`h-${size} w-${size} ${className}`} />;
    case 'firefox':
    case 'edge':
    case 'safari':
    default:
      return <Globe className={`h-${size} w-${size} ${className}`} />;
  }
};

export default BrowserIcon;
