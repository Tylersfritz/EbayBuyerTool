
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingSection = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for casual online shoppers",
      features: [
        "Basic price comparison",
        "Simple negotiation templates",
        "Market average pricing",
        "Deal scoring system",
        "10 price checks per day"
      ],
      buttonText: "Install Now",
      buttonLink: "/extension",
      highlighted: false
    },
    {
      name: "Premium",
      price: "$7",
      period: "per month",
      description: "Ideal for frequent shoppers and resellers",
      features: [
        "Everything in Free plan",
        "Unlimited price checks",
        "Advanced negotiation AI",
        "Price history trends",
        "Auction sniping tools",
        "Arbitrage opportunity finder",
        "Priority support"
      ],
      buttonText: "Upgrade to Premium",
      buttonLink: "/auth",
      highlighted: true
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-muted/20">
      <div className="section-container">
        <h2 className="section-title text-center">Simple, Transparent Pricing</h2>
        <p className="section-subtitle text-center mx-auto">
          Choose the plan that works for you. Start saving money immediately with our free plan, or unlock premium features for maximum savings.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
          {plans.map(plan => (
            <Card 
              key={plan.name} 
              className={`flex flex-col ${
                plan.highlighted 
                  ? 'border-primary/50 shadow-lg shadow-primary/10 relative overflow-hidden' 
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground px-4 py-1 text-xs font-medium rotate-45 transform translate-x-[30%] translate-y-[-10%] w-[170px] text-center">
                    MOST POPULAR
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="ml-1 text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className={`w-full ${plan.highlighted ? 'bg-primary hover:bg-primary/90' : ''}`}>
                  <Link to={plan.buttonLink}>{plan.buttonText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <p className="text-center mt-8 text-sm text-muted-foreground">
          All plans come with a 14-day money-back guarantee. No questions asked.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
