
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import UserMenu from './auth/UserMenu';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  // Change header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignOut = () => {
    setMobileMenuOpen(false);
    signOut();
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <a href="#" className="text-2xl font-bold font-display">DealHavenAI</a>
            <span className="hidden sm:inline-block text-sm text-muted-foreground ml-2">dealhavenai.com</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('hero')} className="text-foreground hover:text-primary transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('features')} className="text-foreground hover:text-primary transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-foreground hover:text-primary transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-foreground hover:text-primary transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollToSection('about')} className="text-foreground hover:text-primary transition-colors">
              About
            </button>
            
            {session ? (
              <UserMenu />
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                >
                  Get Started
                </Button>
              </>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu />
          </Button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('hero')} 
                className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('features')} 
                className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')} 
                className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
              >
                About
              </button>
              
              {session ? (
                <div className="border-t pt-4 mt-2">
                  <Link to="/profile" className="block px-4 py-2 text-foreground hover:bg-muted rounded-md">
                    My Profile
                  </Link>
                  <Link to="/settings" className="block px-4 py-2 text-foreground hover:bg-muted rounded-md">
                    Settings
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-md"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
