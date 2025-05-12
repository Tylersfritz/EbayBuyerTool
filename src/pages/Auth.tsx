
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const Auth = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to home if already authenticated
    if (session && !isLoading) {
      navigate('/');
    }
  }, [session, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-blue-400 p-3 mb-4">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center mb-2">
            <ShieldCheck className="text-primary w-8 h-8 mr-2" />
            <h1 className="text-3xl font-bold">DealHavenAI</h1>
          </div>
          <p className="text-muted-foreground text-center">
            Shop smarter with AI-powered savings
          </p>
        </div>
        
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} DealHavenAI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Auth;
