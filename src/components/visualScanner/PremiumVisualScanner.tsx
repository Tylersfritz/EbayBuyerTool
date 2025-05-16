
import React from 'react';
import VisualScanner, { ScanResult } from './VisualScanner';
import PremiumOnlyLock from '../premium/PremiumOnlyLock';

interface PremiumVisualScannerProps {
  isPremium: boolean;
  onScanComplete: (data: ScanResult) => void;
  onClose: () => void;
  isOpen: boolean;
}

const PremiumVisualScanner: React.FC<PremiumVisualScannerProps> = ({
  isPremium,
  onScanComplete,
  onClose,
  isOpen
}) => {
  if (!isOpen) return null;

  if (!isPremium) {
    return (
      <PremiumOnlyLock
        title="Visual Scanner"
        description="Scan product images to automatically find price information and market value."
        showPreview={true}
        onClose={onClose}
      >
        <VisualScanner 
          onScanComplete={() => {}} 
          onCancel={onClose}
          isPremium={true} 
        />
      </PremiumOnlyLock>
    );
  }

  return (
    <VisualScanner
      onScanComplete={onScanComplete}
      onCancel={onClose}
      isPremium={isPremium}
    />
  );
};

export default PremiumVisualScanner;
