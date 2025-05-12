
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import ExtensionPopupWrapper from "./components/ExtensionPopupWrapper";
import OnboardingModal from "./components/OnboardingModal";
import { generateIcons } from "./utils/generateIcons";
import "./index.css";

const queryClient = new QueryClient();

interface AppProps {
  mode?: 'extension' | 'marketing';
}

const App = ({ mode = 'marketing' }: AppProps) => {
  const [isFirstUse, setIsFirstUse] = useState(true);
  
  useEffect(() => {
    // Check if this is first use
    const checkFirstUse = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['dealHavenAIFirstUse'], (result: Record<string, unknown>) => {
          if (result.dealHavenAIFirstUse === 'completed') {
            setIsFirstUse(false);
          } else {
            // Set the first use flag
            chrome.storage.local.set({ dealHavenAIFirstUse: 'completed' });
          }
        });
      } else {
        // For development without chrome API
        const hasVisited = localStorage.getItem('dealHavenAIFirstUse');
        if (hasVisited === 'completed') {
          setIsFirstUse(false);
        } else {
          localStorage.setItem('dealHavenAIFirstUse', 'completed');
        }
      }
    };

    // Initialize premium status in development mode if not set
    if (import.meta.env.DEV) {
      const premiumStatus = localStorage.getItem('dealHavenAIPremium');
      if (!premiumStatus) {
        localStorage.setItem('dealHavenAIPremium', 'active'); // Default to premium in development
      }
      
      // Initialize offer history if not set (for development)
      const offerHistory = localStorage.getItem('offerHistory');
      if (!offerHistory) {
        localStorage.setItem('offerHistory', JSON.stringify([]));
      }
    }

    // Generate and save icons if in development mode
    if (import.meta.env.DEV) {
      const icons = generateIcons();
      
      // Create favicon link for 16x16 icon
      const link16 = document.createElement('link');
      link16.rel = 'icon';
      link16.type = 'image/png';
      link16.href = icons.icon16;
      link16.setAttribute('sizes', '16x16');
      document.head.appendChild(link16);
      
      // Also add the larger icon for better visibility
      const link48 = document.createElement('link');
      link48.rel = 'icon';
      link48.type = 'image/png';
      link48.href = icons.icon48;
      link48.setAttribute('sizes', '48x48');
      document.head.appendChild(link48);
    }
    
    checkFirstUse();
    console.log("App rendered with mode:", mode); // Add logging for debugging
  }, [mode]);

  const completeOnboarding = () => {
    setIsFirstUse(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* Main content based on mode */}
        {mode === 'extension' ? (
          <div className="w-[300px] h-[500px] overflow-y-auto bg-white mx-auto border border-gray-300 shadow-lg">
            {isFirstUse ? (
              <OnboardingModal onComplete={completeOnboarding} />
            ) : (
              <ExtensionPopupWrapper />
            )}
          </div>
        ) : (
          // Marketing website would normally be here
          <div className="p-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-12 relative mr-3">
                <div className="absolute inset-0 flex items-center justify-center bg-[#1EAEDB] rounded-lg shadow-md">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-8 h-8"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold">DealHavenAI</h1>
            </div>
            
            <p className="mb-4">This is the marketing website view. To see the extension popup, click the "Extension Popup" button at the top.</p>
            <p className="mb-4">From here, you would normally see the marketing content for the extension.</p>
            
            <div className="mt-8 p-4 border rounded bg-gray-50">
              <h2 className="text-lg font-semibold mb-2">Preview of Extension</h2>
              <p>Click the button below to see how the extension popup looks:</p>
              <Link to="/extension" className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                View Extension Popup
              </Link>
            </div>
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
