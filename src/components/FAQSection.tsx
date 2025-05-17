
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "How does DealHavenAI determine if a price is good?",
      answer: "DealHavenAI analyzes thousands of similar listings across multiple marketplaces to calculate the average market price for an item. We consider factors like condition, seller reputation, and historical price trends to give you an accurate deal score."
    },
    {
      question: "Which marketplaces does the extension work with?",
      answer: "Currently, DealHavenAI works with eBay, Amazon, Walmart, and Best Buy. We're constantly adding support for more platforms based on user demand."
    },
    {
      question: "How accurate are the price comparisons?",
      answer: "Our price comparisons are typically accurate within 5-10% of the true market value. The accuracy improves over time as our database grows and our algorithms learn from more data points."
    },
    {
      question: "What's the difference between the free and premium versions?",
      answer: "The free version gives you access to basic price checking (limited to 5 checks per month), simple negotiation templates, and deal scoring. Premium unlocks unlimited price checks, advanced negotiation AI, price history trends, auction sniping tools, arbitrage finder, and priority support."
    },
    {
      question: "How do I cancel my premium subscription?",
      answer: "You can cancel your premium subscription anytime from your account settings. Your premium features will remain active until the end of your billing period, and you won't be charged again after that."
    },
    {
      question: "Is my data safe with DealHavenAI?",
      answer: "Yes, we take data privacy very seriously. We only collect data necessary to provide our services and never sell your personal information to third parties. All sensitive data is encrypted, and you can request deletion of your data at any time."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-muted/20">
      <div className="section-container">
        <h2 className="section-title text-center">Frequently Asked Questions</h2>
        <p className="section-subtitle text-center mx-auto">
          Got questions about DealHavenAI? We've got answers.
        </p>
        
        <div className="max-w-3xl mx-auto mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Still have questions? <a href="#contact" className="text-primary hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
