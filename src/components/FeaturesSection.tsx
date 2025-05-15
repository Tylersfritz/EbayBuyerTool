
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, MessageSquare, Rocket, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type FeatureCardProps = { 
  title: string;
  description: string;
  icon: React.ElementType;
  badgeText: string;
  premium?: boolean;
  buttonText: string;
  buttonLink: string;
  buttonVariant?: "default" | "premium";
  sneakPeek?: boolean;
  imageSrc?: string;
};

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  badgeText,
  premium = false,
  buttonText,
  buttonLink,
  buttonVariant = "default",
  sneakPeek = false,
  imageSrc
}: FeatureCardProps) => (
  <Card className={cn(
    "h-full flex flex-col hover:shadow-lg transition-shadow border-2 border-muted relative overflow-hidden",
    premium && "border-blue-200"
  )}>
    {sneakPeek && (
      <div className="absolute top-3 right-3 z-10">
        <Badge variant="premium" className="text-xs font-medium">
          Sneak Peek
        </Badge>
      </div>
    )}
    
    {imageSrc && (
      <div className="absolute inset-0 opacity-10">
        <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
      </div>
    )}
    
    <CardHeader className="pb-2 relative z-10">
      <div className="mb-2 flex items-center gap-2">
        {premium ? (
          <Badge variant="premium" className="text-xs font-medium">
            {badgeText}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {badgeText}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className={cn(
          "p-2 rounded-md w-fit",
          premium ? "bg-blue-100 text-blue-800" : "bg-primary/10"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            premium ? "text-blue-600" : "text-primary"
          )} />
        </div>
        <CardTitle>{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="flex-grow relative z-10">
      <CardDescription className="text-base">{description}</CardDescription>
    </CardContent>
    <CardFooter className="relative z-10">
      <Button asChild variant={buttonVariant} className="w-full">
        <Link to={buttonLink}>{buttonText}</Link>
      </Button>
    </CardFooter>
  </Card>
);

const FeaturesSection = () => {
  const features = [
    {
      title: "Price Check",
      description: "Instantly compare prices with market averages to find good deals. Free for up to 10 searches – our AI analyzes thousands of similar items to give you accurate pricing insights.",
      icon: TrendingUp,
      badgeText: "Free with Limits",
      premium: false,
      buttonText: "Try Price Check",
      buttonLink: "/extension",
      buttonVariant: "default" as const,
      sneakPeek: false,
      imageSrc: "/price-check.png"
    },
    {
      title: "Negotiate",
      description: "Generate persuasive messages to help you get better deals. Our AI creates custom negotiation templates based on market data and proven techniques.",
      icon: MessageSquare,
      badgeText: "Free",
      premium: false,
      buttonText: "Start Negotiating",
      buttonLink: "/extension",
      buttonVariant: "default" as const,
      sneakPeek: false,
      imageSrc: "/negotiation-assistance.png"
    },
    {
      title: "Auction Snipe",
      description: "Premium users can automatically bid in the final seconds of auctions to increase win rates while getting the best possible price. Never miss out on an auction again.",
      icon: Rocket,
      badgeText: "Premium",
      premium: true,
      buttonText: "Upgrade to Premium",
      buttonLink: "/auth",
      buttonVariant: "premium" as const,
      sneakPeek: true,
      imageSrc: "/auction-sniping.png"
    },
    {
      title: "Arbitrage Finder",
      description: "Discover profitable reselling opportunities across different marketplaces. Our AI scans multiple platforms to find price differences you can capitalize on.",
      icon: BarChart,
      badgeText: "Premium",
      premium: true,
      buttonText: "Upgrade to Premium",
      buttonLink: "/auth",
      buttonVariant: "premium" as const,
      sneakPeek: true,
      imageSrc: "/arbitrage-search.png"
    }
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="section-container">
        <h2 className="section-title text-center">Powerful Features</h2>
        <p className="section-subtitle text-center mx-auto">
          DealHavenAI combines cutting-edge technology with practical shopping tools to help you save money and make smarter purchases.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {features.map(feature => (
            <FeatureCard 
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              badgeText={feature.badgeText}
              premium={feature.premium}
              buttonText={feature.buttonText}
              buttonLink={feature.buttonLink}
              buttonVariant={feature.buttonVariant}
              sneakPeek={feature.sneakPeek}
              imageSrc={feature.imageSrc}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
