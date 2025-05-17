import React, { useEffect, useState } from 'react';
import { Card } from '../../ui/card';
import { usePriceCheck } from '../priceCheck/hooks/usePriceCheck';
import './VisualScanner.css';

const VisualScanner: React.FC = () => {
  const [scanResults, setScanResults] = useState<any[]>([]);
  const { scanPage } = usePriceCheck();

  useEffect(() => {
    const performScan = async () => {
      try {
        const results = await scanPage();
        setScanResults(results);
      } catch (error) {
        console.error('Visual scan failed:', error);
      }
    };
    performScan();
  }, [scanPage]);

  return (
    <div className="visual-scanner">
      <h2>Visual Scanner</h2>
      {scanResults.length > 0 ? (
        scanResults.map((result, index) => (
          <Card key={index}>
            <p>{result.title}</p>
            <p>Price: {result.price}</p>
          </Card>
        ))
      ) : (
        <p>Scanning page...</p>
      )}
    </div>
  );
};

export default VisualScanner;