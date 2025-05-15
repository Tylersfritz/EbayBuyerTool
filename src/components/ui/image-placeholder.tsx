
import React from 'react';
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  text?: string;
}

const ImagePlaceholder = ({ 
  width = 'auto', 
  height = 'auto', 
  text = 'Image Placeholder',
  className,
  ...props 
}: ImagePlaceholderProps) => {
  return (
    <div 
      className={cn(
        "bg-muted flex items-center justify-center rounded-md overflow-hidden", 
        className
      )}
      style={{ width, height }}
      {...props}
    >
      <img 
        src="/app-placeholder.svg" 
        alt={text} 
        className="w-full h-full object-cover" 
      />
    </div>
  );
};

export { ImagePlaceholder };
