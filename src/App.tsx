
import * as React from 'react';
import './App.css';
import ExtensionPopupWrapper from './components/ExtensionPopupWrapper';
// Import the critical components directly to ensure they're included in the build
// Use explicit imports to ensure they're properly included in the bundle
import './components/arbitrage/ArbitragePrompt';
import './components/visualScanner/VisualScanner';

// Verify React version to help with debugging
console.log('React version:', React.version);

interface AppProps {
  mode?: string;
}

function App({ mode }: AppProps) {
  // Log to confirm critical components are being imported
  console.log('Loading App with critical components: ArbitragePrompt, VisualScanner');
  
  return (
    <div className="App">
      <ExtensionPopupWrapper />
    </div>
  );
}

export default App;
