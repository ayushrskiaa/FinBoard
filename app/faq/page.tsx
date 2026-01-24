'use client';

import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I handle different API response formats?",
      answer: "Implement a flexible data mapper that can handle various JSON structures. Consider creating adapters for common API formats. FinBoard automatically attempts to flatten and map JSON responses to readable fields."
    },
    {
      question: "What happens if the API request limit is reached?",
      answer: "If the API request limit is reached, the website may temporarily stop fetching new data until the limit resets. You may see a message indicating that the API limit has been reached and suggesting you try again later. We recommend setting a reasonable refresh interval (e.g., 60 seconds) to avoid hitting limits."
    },
    {
      question: "How do I create a new API key?",
      answer: (
        <div className="space-y-2">
          <p>To create a new API key, follow these steps:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Visit the API provider's website (e.g., Alpha Vantage, Coinbase).</li>
            <li>Sign in to your account or create a new account if you don't have one.</li>
            <li>Navigate to the API section or dashboard.</li>
            <li>Look for an option to generate a new API key.</li>
            <li>Follow the prompts to create and copy the new API key.</li>
            <li>Update your web application's configuration or widget URL with the new API key.</li>
          </ol>
        </div>
      )
    },
    {
      question: "What are common API errors and what should I do when API rate limits are exceeded?",
      answer: "Common API errors include exceeding the rate limit, invalid API keys, CORS and network issues. To avoid rate limit errors, cache API responses (FinBoard caches data automatically). Also, each API provider has specific rate limits, which are typically documented on their website."
    },
    {
      question: "What should I do when API rate limits are exceeded?",
      answer: "If you consistently hit rate limits, increase the refresh interval of your widgets. For specific API support, contact the provider's team through their documentation."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <HelpCircle className="h-8 w-8" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Help & FAQ</h1>
                <p className="text-muted-foreground">Common questions about connecting APIs and managing data</p>
            </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium text-lg text-foreground/90 hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Still have questions?</p>
            <p>Check the documentation of the specific API service you are using.</p>
        </div>
      </div>
    </div>
  );
}
