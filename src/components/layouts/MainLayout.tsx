
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ApiHealthProvider } from '@/context/ApiHealthContext';
import DevToolbar from '@/components/DevToolbar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function MainLayout() {
  // Create a QueryClient instance
  const queryClient = new QueryClient();
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ApiHealthProvider>
            {/* DevToolbar is now inside the AuthProvider */}
            {import.meta.env.DEV && <DevToolbar />}
            <Outlet />
            <Toaster />
          </ApiHealthProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default MainLayout;
