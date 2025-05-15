
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface OnboardingModalProps {
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Check prices",
      description: "Get instant price comparisons from across the web to ensure you're getting the best deal.",
      image: "/price-check.png"
    },
    {
      title: "Negotiate deals",
      description: "Use our AI-powered negotiation assistant to help you get the best possible price.",
      image: "/negotiation-assistance.png"
    },
    {
      title: "Snipe auctions",
      description: "Automatically bid at the last second and win more auctions with our premium feature.",
      image: "/auction-sniping.png"
    },
    {
      title: "Find arbitrage opportunities",
      description: "Discover items you can buy low and sell high across different marketplaces for maximum profit.",
      image: "/arbitrage-search.png"
    }
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };
  
  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-xl font-bold text-center mb-2 text-secondary">Welcome to DealHavenAI</h2>
      <p className="text-sm text-muted-foreground text-center mb-4">Let's get you started in just a few steps</p>
      
      <div className="flex justify-center mb-4">
        {steps.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-2 w-6 mx-1 rounded-full ${
              idx === currentStep ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
      
      <Card className="flex-1 flex flex-col justify-center overflow-hidden animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-48 h-48 mb-4 flex items-center justify-center">
            <img 
              src={steps[currentStep].image} 
              alt={steps[currentStep].title} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2">{currentStep + 1}. {steps[currentStep].title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{steps[currentStep].description}</p>
        </CardContent>
      </Card>
      
      <Button 
        onClick={handleNext} 
        className="mt-4"
        size="lg"
      >
        {currentStep < steps.length - 1 ? "Next" : "Get Started"} 
        {currentStep < steps.length - 1 ? null : <Check className="ml-2" />}
      </Button>
    </div>
  );
};

export default OnboardingModal;
