
import React from 'react';
import './App.css';
import ExtensionPopupWrapper from './components/ExtensionPopupWrapper';

interface AppProps {
  mode?: string;
}

function App({ mode }: AppProps) {
  return (
    <div className="App">
      <ExtensionPopupWrapper />
    </div>
  );
}

export default App;
