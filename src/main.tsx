
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate, HashRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import Index from './pages/Index.tsx'
import NotFound from './pages/NotFound.tsx'
import Deploy from './pages/Deploy.tsx'
import Auth from './pages/Auth.tsx'
import Profile from './pages/Profile.tsx'
import RequireAuth from './components/auth/RequireAuth.tsx'
import MainLayout from './components/layouts/MainLayout.tsx'
import { setupPreviewApiRoutes } from './api/previewApiEndpoints.ts'
import './index.css'

// Setup preview API routes if we're in a browser environment
if (typeof window !== 'undefined') {
  const isExtension = !!window.chrome?.runtime || !!window.browser?.runtime;
  if (!isExtension) {
    console.log('Setting up preview API routes for web environment');
    setupPreviewApiRoutes();
  }
}

// Check if we're running as an extension to determine which router to use
const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime;

// For extension context, use HashRouter to avoid issues with paths in extensions
if (isExtension) {
  createRoot(document.getElementById("root")!).render(
    <HashRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/extension" replace />} />
          <Route path="/index.html" element={<Navigate to="/extension" replace />} />
          <Route path="/app" element={<App />} />
          <Route path="/extension" element={<App mode="extension" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/deploy" element={<Deploy />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
} else {
  // For web context, use standard browser router for full URL capabilities
  const router = createBrowserRouter([
    {
      element: <MainLayout />,
      children: [
        {
          path: '/',
          element: <Navigate to="/extension" replace />,
        },
        {
          path: '/index.html',
          element: <Navigate to="/extension" replace />,
        },
        {
          path: '/app',
          element: <App />,
        },
        {
          path: '/extension',
          element: <App mode="extension" />,
        },
        {
          path: '/auth',
          element: <Auth />,
        },
        {
          path: '/deploy',
          element: <Deploy />,
        },
        {
          path: '/profile',
          element: (
            <RequireAuth>
              <Profile />
            </RequireAuth>
          ),
        },
        {
          path: '/api/*',
          element: <Navigate to="/" replace />,
        },
        {
          path: '*',
          element: <NotFound />,
        }
      ]
    }
  ]);

  createRoot(document.getElementById("root")!).render(
    <RouterProvider router={router} />
  );
}
