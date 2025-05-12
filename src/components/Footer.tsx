
import React from 'react';
import { Github, Linkedin, Twitter, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary text-white py-12">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold font-display mb-4">DealHavenAI</h3>
            <p className="mb-2 text-secondary-foreground/80">
              Smart tools for buyers with price checks, negotiation assistance, and more.
            </p>
            <p className="mb-6 text-secondary-foreground/80">
              <a href="https://www.dealhavenai.com" className="hover:text-primary transition-colors">www.dealhavenai.com</a>
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary-foreground hover:text-primary transition-colors p-2 bg-white/10 rounded-full">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-foreground hover:text-primary transition-colors p-2 bg-white/10 rounded-full">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-foreground hover:text-primary transition-colors p-2 bg-white/10 rounded-full">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-foreground hover:text-primary transition-colors p-2 bg-white/10 rounded-full">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#projects" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="#about" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors inline-flex items-center">
                  Blog <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors inline-flex items-center">
                  Help Center <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors inline-flex items-center">
                  Extension <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-secondary-foreground/70 text-sm">
            © {currentYear} DealHavenAI. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-secondary-foreground/70 hover:text-primary text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-secondary-foreground/70 hover:text-primary text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
