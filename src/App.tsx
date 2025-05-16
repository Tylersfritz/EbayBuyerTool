
import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";

// Layouts
import MainLayout from './components/layouts/MainLayout';

// Pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Deploy from './pages/Deploy';
import NotFound from './pages/NotFound';

// Components
import ExtensionPopupWrapper from './components/ExtensionPopupWrapper';
import { Spinner } from './components/ui/spinner';

// Providers
import { AuthProvider } from './context/AuthContext';
import { ApiHealthProvider } from './context/ApiHealthContext';
import { ModeProvider } from './context/ModeContext';

// Import statement to force CSS inclusion
import './App.css';

function App() {
  return (
    <>
      <AuthProvider>
        <ApiHealthProvider>
          <ModeProvider>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Index />} />
                <Route path="auth" element={<Auth />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="/deploy" element={<Deploy />} />
              <Route path="/extension" element={
                <Suspense fallback={
                  <div className="flex h-screen w-screen items-center justify-center bg-background">
                    <Spinner className="h-8 w-8" />
                  </div>
                }>
                  <ExtensionPopupWrapper />
                </Suspense>
              } />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate replace to="/404" />} />
            </Routes>
          </ModeProvider>
        </ApiHealthProvider>
      </AuthProvider>
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
