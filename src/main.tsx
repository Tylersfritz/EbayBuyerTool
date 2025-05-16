
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import App from './App.tsx'
import Index from './pages/Index.tsx'
import NotFound from './pages/NotFound.tsx'
import Deploy from './pages/Deploy.tsx'
import Auth from './pages/Auth.tsx'
import Profile from './pages/Profile.tsx'
import RequireAuth from './components/auth/RequireAuth.tsx'
import MainLayout from './components/layouts/MainLayout.tsx'
import './index.css'

// Define the Vercel backend URL 
const VERCEL_API_URL = 'https://ebay-buyer-tool-zp52.vercel.app';

// Create a more comprehensive router with proper 404 handling
const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Index />,
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
      // Redirect any /api/* paths to the actual API endpoints on Vercel
      {
        path: '/api/*',
        element: <Navigate to={`${VERCEL_API_URL}/api/*`} replace />,
      },
      // Catch-all route for 404 errors
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
