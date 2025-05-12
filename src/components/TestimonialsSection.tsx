
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  avatarUrl?: string;
  rating: number;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, author, role, avatarUrl, rating }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="flex mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
        
        <blockquote className="text-lg mb-6 flex-grow">"{quote}"</blockquote>
        
        <div className="flex items-center mt-auto">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{author.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{author}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "This extension has saved me hundreds of dollars on electronics purchases. The price check feature alone is worth installing it for.",
      author: "Michael T.",
      role: "Tech Enthusiast",
      rating: 5
    },
    {
      quote: "I was skeptical at first, but the negotiation templates helped me get a $50 discount on my first try. I'm now a believer!",
      author: "Sarah J.",
      role: "Online Shopper",
      rating: 5
    },
    {
      quote: "As a reseller, the premium features have been a game-changer for my business. The arbitrage finder pays for itself every month.",
      author: "David R.",
      role: "eBay Seller",
      rating: 4
    }
  ];

  return (
    <section id="testimonials" className="py-24">
      <div className="section-container">
        <h2 className="section-title text-center">What Our Users Say</h2>
        <p className="section-subtitle text-center mx-auto">
          Join thousands of smart shoppers who are already saving money with DealHavenAI.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
