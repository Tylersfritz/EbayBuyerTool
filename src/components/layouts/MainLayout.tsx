
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ApiHealthProvider } from '@/context/ApiHealthContext';
import DevToolbar from '@/components/DevToolbar';

export function MainLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ApiHealthProvider>
          {/* DevToolbar is now inside the AuthProvider */}
          {import.meta.env.DEV && <DevToolbar />}
          <Outlet />
          <Toaster />
        </ApiHealthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MainLayout;
