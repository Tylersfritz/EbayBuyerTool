
/**
 * Utility for generating extension icons and downloading them
 */

/**
 * Generate default icons for the extension with optional color customization
 * @param {string} primaryColor - Primary color for the icon (hex code)
 * @param {string} secondaryColor - Secondary color for details (hex code)
 * @param {string} style - Style of the icon ('gradient', 'flat', or 'outline')
 * @returns Object containing data URLs for each icon size
 */
export const generateDefaultIcons = (
  primaryColor: string = '#1EAEDB', 
  secondaryColor: string = '#ffffff',
  iconStyle: 'gradient' | 'flat' | 'outline' = 'gradient'
) => {
  // Icon sizes
  const sizes = [16, 48, 128];
  const icons: Record<string, string> = {};
  
  // Generate an icon for each size
  sizes.forEach(size => {
    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw background
      ctx.fillStyle = primaryColor;
      ctx.fillRect(0, 0, size, size);
      
      // Draw shield shape (simplified for small icons)
      ctx.fillStyle = secondaryColor;
      const shieldWidth = size * 0.7;
      const shieldHeight = size * 0.8;
      const shieldX = (size - shieldWidth) / 2;
      const shieldY = (size - shieldHeight) / 2;
      
      // Draw a simple shield
      ctx.beginPath();
      ctx.moveTo(shieldX, shieldY);
      ctx.lineTo(shieldX + shieldWidth, shieldY);
      ctx.lineTo(shieldX + shieldWidth, shieldY + shieldHeight * 0.7);
      ctx.lineTo(shieldX + shieldWidth / 2, shieldY + shieldHeight);
      ctx.lineTo(shieldX, shieldY + shieldHeight * 0.7);
      ctx.closePath();
      ctx.fill();
      
      // Add checkmark for larger icons
      if (size >= 48) {
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = size * 0.08;
        ctx.beginPath();
        ctx.moveTo(shieldX + shieldWidth * 0.3, shieldY + shieldHeight * 0.5);
        ctx.lineTo(shieldX + shieldWidth * 0.45, shieldY + shieldHeight * 0.65);
        ctx.lineTo(shieldX + shieldWidth * 0.7, shieldY + shieldHeight * 0.35);
        ctx.stroke();
      }
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      icons[`icon${size}`] = dataUrl;
      
      // Also generate active icons with inverted colors
      const activeCanvas = document.createElement('canvas');
      activeCanvas.width = size;
      activeCanvas.height = size;
      const activeCtx = activeCanvas.getContext('2d');
      
      if (activeCtx) {
        // For active icons, swap colors for visual distinction
        activeCtx.fillStyle = secondaryColor;
        activeCtx.fillRect(0, 0, size, size);
        
        activeCtx.fillStyle = primaryColor;
        activeCtx.beginPath();
        activeCtx.moveTo(shieldX, shieldY);
        activeCtx.lineTo(shieldX + shieldWidth, shieldY);
        activeCtx.lineTo(shieldX + shieldWidth, shieldY + shieldHeight * 0.7);
        activeCtx.lineTo(shieldX + shieldWidth / 2, shieldY + shieldHeight);
        activeCtx.lineTo(shieldX, shieldY + shieldHeight * 0.7);
        activeCtx.closePath();
        activeCtx.fill();
        
        if (size >= 48) {
          activeCtx.strokeStyle = secondaryColor;
          activeCtx.lineWidth = size * 0.08;
          activeCtx.beginPath();
          activeCtx.moveTo(shieldX + shieldWidth * 0.3, shieldY + shieldHeight * 0.5);
          activeCtx.lineTo(shieldX + shieldWidth * 0.45, shieldY + shieldHeight * 0.65);
          activeCtx.lineTo(shieldX + shieldWidth * 0.7, shieldY + shieldHeight * 0.35);
          activeCtx.stroke();
        }
        
        // Convert to data URL for active icon
        const activeDataUrl = activeCanvas.toDataURL('image/png');
        icons[`icon${size}Active`] = activeDataUrl;
      }
    }
  });
  
  return {
    icon16: icons.icon16 || '',
    icon48: icons.icon48 || '',
    icon128: icons.icon128 || '',
    icon16Active: icons.icon16Active || '',
    icon48Active: icons.icon48Active || '',
    icon128Active: icons.icon128Active || ''
  };
};

/**
 * Download the generated icons
 * @param icons - Object containing data URLs for each icon size
 * @param suffix - Optional suffix to append to filenames (e.g., '-active')
 */
export const downloadGeneratedIcons = (
  icons: Record<string, string>,
  suffix: string = ''
) => {
  // Create download links for each icon
  Object.entries(icons).forEach(([key, dataUrl]) => {
    if (!dataUrl) return;
    
    // Extract size from key (e.g., 'icon16' -> '16')
    const size = key.replace(/[^0-9]/g, '');
    
    // Check if this is an active icon
    const isActive = key.includes('Active');
    const activeSuffix = isActive ? '-active' : '';
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `icon-${size}${activeSuffix}${suffix}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
};
