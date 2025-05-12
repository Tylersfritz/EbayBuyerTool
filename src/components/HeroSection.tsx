
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Download } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="hero" className="pt-24 pb-12 md:pt-32 md:pb-20">
      <div className="section-container text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Never Overpay <span className="text-primary">Again</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            DealHavenAI helps you save time and money by providing instant price comparisons and negotiation tools for online shopping.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/extension">
                <Download className="mr-2 h-5 w-5" /> Install Browser Extension
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/#features">
                <span>See Features</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8">
            <p className="text-sm text-muted-foreground">
              Works with <span className="font-medium text-foreground">Amazon</span>,{' '}
              <span className="font-medium text-foreground">eBay</span>,{' '}
              <span className="font-medium text-foreground">Walmart</span> and more!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
