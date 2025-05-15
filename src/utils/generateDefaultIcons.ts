
interface IconSet {
  icon16: string;
  icon48: string;
  icon128: string;
  icon16Active?: string;
  icon48Active?: string;
  icon128Active?: string;
}

/**
 * Generate a set of default icons for the extension
 * Returns data URLs that can be used as src for image elements
 */
export function generateDefaultIcons(
  primaryColor: string = '#1EAEDB',
  secondaryColor: string = '#ffffff',
  style: 'gradient' | 'flat' | 'outline' = 'gradient'
): IconSet {
  // Function to create an icon canvas with the specified size
  const createIconCanvas = (size: number, active: boolean = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Adjust colors for active state
    const mainColor = active ? '#ff6b00' : primaryColor;
    
    // Calculate dimensions
    const padding = Math.max(2, Math.floor(size * 0.1));
    const innerSize = size - (padding * 2);
    
    if (style === 'gradient') {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, mainColor);
      gradient.addColorStop(1, active ? '#ff9d4d' : '#0a617a');
      
      // Draw rounded rectangle with gradient
      ctx.fillStyle = gradient;
      roundRect(ctx, padding, padding, innerSize, innerSize, Math.max(4, size * 0.1));
      ctx.fill();
      
      // Draw letter D in the center
      ctx.fillStyle = secondaryColor;
      ctx.font = `bold ${Math.floor(size * 0.5)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('D', size / 2, size / 2);
    } 
    else if (style === 'flat') {
      // Flat style
      ctx.fillStyle = mainColor;
      roundRect(ctx, padding, padding, innerSize, innerSize, Math.max(4, size * 0.1));
      ctx.fill();
      
      // Draw letter D in the center
      ctx.fillStyle = secondaryColor;
      ctx.font = `bold ${Math.floor(size * 0.5)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('D', size / 2, size / 2);
    }
    else if (style === 'outline') {
      // Outline style
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = Math.max(2, Math.floor(size * 0.05));
      roundRect(ctx, padding, padding, innerSize, innerSize, Math.max(4, size * 0.1));
      ctx.stroke();
      
      // Draw letter D in the center
      ctx.fillStyle = mainColor;
      ctx.font = `bold ${Math.floor(size * 0.5)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('D', size / 2, size / 2);
    }
    
    return canvas;
  };
  
  // Helper for drawing rounded rectangles
  const roundRect = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  };
  
  // Create icons of different sizes
  const icon16Canvas = createIconCanvas(16);
  const icon48Canvas = createIconCanvas(48);
  const icon128Canvas = createIconCanvas(128);
  
  // Create active state icons
  const icon16ActiveCanvas = createIconCanvas(16, true);
  const icon48ActiveCanvas = createIconCanvas(48, true);
  const icon128ActiveCanvas = createIconCanvas(128, true);
  
  return {
    icon16: icon16Canvas.toDataURL('image/png'),
    icon48: icon48Canvas.toDataURL('image/png'),
    icon128: icon128Canvas.toDataURL('image/png'),
    icon16Active: icon16ActiveCanvas.toDataURL('image/png'),
    icon48Active: icon48ActiveCanvas.toDataURL('image/png'),
    icon128Active: icon128ActiveCanvas.toDataURL('image/png'),
  };
}

/**
 * Download the generated icons as PNG files
 */
export function downloadGeneratedIcons(icons: IconSet): void {
  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Download the icons
  downloadImage(icons.icon16, 'icon-16.png');
  downloadImage(icons.icon48, 'icon-48.png');
  downloadImage(icons.icon128, 'icon-128.png');
  
  // Download active icons if available
  if (icons.icon16Active) downloadImage(icons.icon16Active, 'icon-16-active.png');
  if (icons.icon48Active) downloadImage(icons.icon48Active, 'icon-48-active.png');
  if (icons.icon128Active) downloadImage(icons.icon128Active, 'icon-128-active.png');
}
