
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import PricingSection from '@/components/PricingSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        
        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="section-container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Saving?</h2>
            <p className="text-lg max-w-2xl mx-auto mb-8 text-primary-foreground/90">
              Join thousands of smart shoppers who are already using DealHavenAI to save money on every purchase.
            </p>
            <Button size="lg" variant="secondary" className="text-primary" asChild>
              <Link to="/extension">
                <Download className="mr-2 h-5 w-5" /> Install DealHavenAI
              </Link>
            </Button>
          </div>
        </section>
        
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <AboutSection />
        <ContactSection />
        
        {/* Final CTA Section */}
        <section className="py-16 bg-muted">
          <div className="section-container text-center">
            <h2 className="text-3xl font-bold mb-4">Transform Your Online Shopping Experience</h2>
            <p className="text-lg max-w-2xl mx-auto mb-8 text-muted-foreground">
              Stop overpaying. Start using DealHavenAI today and join the smart shopping revolution.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/extension">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">Create Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
