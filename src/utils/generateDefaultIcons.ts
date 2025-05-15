
/**
 * Utility for generating default extension icons when they're missing
 * This is a fallback mechanism to ensure the extension can load even if icon files are missing
 */

export function generateDefaultIcons() {
  // Generate the 16x16 icon
  const canvas16 = document.createElement('canvas');
  canvas16.width = 16;
  canvas16.height = 16;
  const ctx16 = canvas16.getContext('2d');
  if (ctx16) {
    // Draw shield background
    ctx16.fillStyle = '#1EAEDB';
    ctx16.beginPath();
    ctx16.moveTo(8, 1);
    ctx16.lineTo(14, 3);
    ctx16.lineTo(14, 8);
    ctx16.arcTo(14, 12, 8, 15, 6);
    ctx16.arcTo(2, 12, 2, 8, 6);
    ctx16.lineTo(2, 3);
    ctx16.closePath();
    ctx16.fill();
    
    // Draw text
    ctx16.fillStyle = 'white';
    ctx16.font = 'bold 8px Arial';
    ctx16.textAlign = 'center';
    ctx16.textBaseline = 'middle';
    ctx16.fillText('DH', 8, 8);
  }
  
  // Generate the 48x48 icon
  const canvas48 = document.createElement('canvas');
  canvas48.width = 48;
  canvas48.height = 48;
  const ctx48 = canvas48.getContext('2d');
  if (ctx48) {
    // Draw shield background
    ctx48.fillStyle = '#1EAEDB';
    ctx48.beginPath();
    ctx48.moveTo(24, 3);
    ctx48.lineTo(42, 9);
    ctx48.lineTo(42, 24);
    ctx48.arcTo(42, 36, 24, 45, 18);
    ctx48.arcTo(6, 36, 6, 24, 18);
    ctx48.lineTo(6, 9);
    ctx48.closePath();
    ctx48.fill();
    
    // Draw text
    ctx48.fillStyle = 'white';
    ctx48.font = 'bold 20px Arial';
    ctx48.textAlign = 'center';
    ctx48.textBaseline = 'middle';
    ctx48.fillText('DH', 24, 24);
  }
  
  // Generate the 128x128 icon
  const canvas128 = document.createElement('canvas');
  canvas128.width = 128;
  canvas128.height = 128;
  const ctx128 = canvas128.getContext('2d');
  if (ctx128) {
    // Draw shield background
    ctx128.fillStyle = '#1EAEDB';
    ctx128.beginPath();
    ctx128.moveTo(64, 8);
    ctx128.lineTo(112, 24);
    ctx128.lineTo(112, 64);
    ctx128.arcTo(112, 96, 64, 120, 48);
    ctx128.arcTo(16, 96, 16, 64, 48);
    ctx128.lineTo(16, 24);
    ctx128.closePath();
    ctx128.fill();
    
    // Draw text
    ctx128.fillStyle = 'white';
    ctx128.font = 'bold 56px Arial';
    ctx128.textAlign = 'center';
    ctx128.textBaseline = 'middle';
    ctx128.fillText('DH', 64, 64);
  }
  
  return {
    icon16: canvas16.toDataURL(),
    icon48: canvas48.toDataURL(),
    icon128: canvas128.toDataURL()
  };
}

// Function to download icons to user's computer
export function downloadGeneratedIcons() {
  const icons = generateDefaultIcons();
  
  // Helper function to trigger download
  const downloadIcon = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Download all icons
  downloadIcon(icons.icon16, 'icon-16.png');
  downloadIcon(icons.icon48, 'icon-48.png');
  downloadIcon(icons.icon128, 'icon-128.png');
  
  return icons;
}

// Function to save icons directly to the extension (works only in dev mode)
export function saveIconsToExtension() {
  const icons = generateDefaultIcons();
  
  // Fix: Check for chrome.runtime existence in a safer way
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('Attempting to save icons to extension storage...');
    // We can't directly write to filesystem from extension, but we can store in extension storage
    try {
      // Check if storage API is available first
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          generatedIcons: icons
        }, () => {
          console.log('Icons saved to extension storage.');
        });
        return true;
      } else {
        console.warn('Chrome storage API not available');
        return false;
      }
    } catch (e) {
      console.error('Failed to save icons to extension:', e);
      return false;
    }
  }
  
  return false;
}
