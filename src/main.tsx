
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
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
