
import React from 'react';
import { Download, ShoppingBag, Search, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const steps = [
  {
    number: "1",
    title: "Install the Extension",
    description: "Add DealHavenAI to your browser with just one click. Available for Chrome, Firefox, and Edge browsers.",
    icon: Download,
  },
  {
    number: "2",
    title: "Browse Products",
    description: "Shop normally on your favorite marketplaces like eBay, Mercari, and others.",
    icon: ShoppingBag,
  },
  {
    number: "3",
    title: "Check Prices",
    description: "Click the DealHavenAI icon to instantly analyze prices and get insights about the current listing.",
    icon: Search,
  },
  {
    number: "4",
    title: "Save Money",
    description: "Make informed decisions, negotiate better prices, or find alternative options to maximize your savings.",
    icon: PiggyBank,
  }
];

const HowItWorksSection = () => {
  const isMobile = useIsMobile();

  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="section-container">
        <h2 className="section-title text-center">How It Works</h2>
        <p className="section-subtitle text-center mx-auto">
          Getting started with DealHavenAI is quick and easy. Start saving money in just a few minutes.
        </p>
        
        {/* Timeline container */}
        <div className={cn(
          "mt-16 relative",
          isMobile ? "space-y-12" : "flex justify-between items-start"
        )}>
          {/* Timeline line for desktop */}
          {!isMobile && (
            <div className="absolute top-7 left-0 right-0 h-0.5 bg-primary/20" />
          )}
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.number} 
                className={cn(
                  "relative animate-fade-in flex flex-col items-center", 
                  isMobile ? "text-center" : "flex-1 px-4 text-center"
                )}
                style={{ 
                  animationDelay: `${index * 0.15}s`,
                }}
              >
                {/* Timeline line for mobile */}
                {isMobile && index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-14 bottom-0 w-0.5 bg-primary/20 -z-10 transform -translate-x-1/2" />
                )}
                
                {/* Step circle with icon - explicitly centered */}
                <div className="flex-shrink-0 relative z-10 mx-auto">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                
                {/* Step content - explicitly centered */}
                <div className="flex flex-col items-center text-center w-full mt-4">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
