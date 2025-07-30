import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Search, HelpCircle, MessageSquare, Shield, Zap, Clock } from "lucide-react";
import TopNavbar from "@/components/ui/top-navbar";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { SEOHead } from "@/components/SEOHead";

const faqData = [
  {
    category: "Getting Started",
    icon: MessageSquare,
    questions: [
      {
        question: "How does Savrii understand my business?",
        answer: "You provide prompts, knowledge base content, and product information. Savrii learns from this to give accurate responses that match your expertise and brand voice. The more detailed information you provide, the better Savrii becomes at representing your business."
      },
      {
        question: "Can I customize the responses?",
        answer: "Absolutely! You have full control over the AI's knowledge base, tone, and response style. You can update prompts anytime to refine the responses, set different tones for different types of queries, and even create custom templates for specific scenarios."
      },
      {
        question: "How do I get started with Savrii?",
        answer: "Getting started is simple: 1) Sign up for your free account, 2) Complete the onboarding process where you'll provide your business information and response preferences, 3) Test the system with a few sample queries, 4) Connect your communication channels, and 5) Start handling customer queries automatically!"
      }
    ]
  },
  {
    category: "Features & Functionality",
    icon: Zap,
    questions: [
      {
        question: "What platforms does Savrii integrate with?",
        answer: "Savrii works with WhatsApp, email, website chat widgets, Zapier, Meta platforms, Slack, Discord, and many more through our API. We're constantly adding new integrations based on user feedback and market demand."
      },
      {
        question: "How accurate are the AI responses?",
        answer: "With properly configured prompts, Savrii achieves 95%+ accuracy. The AI learns from your corrections to continuously improve. You can review and approve responses before they're sent, and the system gets smarter over time as it learns from your feedback."
      },
      {
        question: "Can I handle multiple languages?",
        answer: "Yes! Savrii supports over 50 languages and can automatically detect the language of incoming queries and respond in the same language. You can also set preferred languages for your business and configure language-specific response templates."
      },
      {
        question: "What types of queries can Savrii handle?",
        answer: "Savrii can handle product questions, booking inquiries, support requests, general information queries, appointment scheduling, order status checks, refund requests, and much more. The system is designed to understand context and provide relevant, helpful responses."
      }
    ]
  },
  {
    category: "Pricing & Plans",
    icon: Shield,
    questions: [
      {
        question: "Is there a free trial?",
        answer: "Yes! Start with our Free Trial plan which includes 50 free queries per month. No credit card required. This gives you plenty of opportunity to test Savrii with your actual customer queries and see how it performs for your business."
      },
      {
        question: "What happens if I exceed my plan limits?",
        answer: "If you exceed your monthly query limit, Savrii will notify you and pause automatic responses until the next billing cycle or until you upgrade your plan. You can always upgrade at any time to get more queries and unlock additional features."
      },
      {
        question: "Can I change or cancel my plan anytime?",
        answer: "Absolutely! You can upgrade, downgrade, or cancel your plan at any time from your billing settings. Changes take effect immediately for upgrades, or at the end of your current billing cycle for downgrades and cancellations."
      },
      {
        question: "Do you offer discounts for annual billing?",
        answer: "Yes! Annual subscribers get 2 months free (equivalent to a 17% discount). We also offer special pricing for non-profits, educational institutions, and startups. Contact our sales team for custom pricing if you have high-volume needs."
      }
    ]
  },
  {
    category: "Technical Support",
    icon: Clock,
    questions: [
      {
        question: "How fast does Savrii respond to queries?",
        answer: "Savrii typically responds to customer queries in under 2 seconds. Response time may vary slightly based on query complexity and current system load, but we maintain 99.9% uptime and consistently fast response times."
      },
      {
        question: "Is my data secure with Savrii?",
        answer: "Yes, we take security very seriously. All data is encrypted in transit and at rest, we're SOC 2 compliant, and we never use your customer data to train our models. Your conversations and business information remain completely private and secure."
      },
      {
        question: "What if Savrii gives a wrong answer?",
        answer: "You can easily correct any response through the dashboard. When you make a correction, Savrii learns from it to improve future responses. You can also set up approval workflows for sensitive topics or enable human handoff for complex queries."
      },
      {
        question: "Do you provide customer support?",
        answer: "Yes! We offer email support for all users, chat support for paid plans, and phone support for enterprise customers. Our support team is available 24/7 and typically responds within 2 hours during business hours."
      }
    ]
  }
];

export default function FAQ() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "Savrii FAQ - Frequently Asked Questions",
    "mainEntity": faqData.flatMap(category => 
      category.questions.map(qa => ({
        "@type": "Question",
        "name": qa.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": qa.answer
        }
      }))
    )
  };

  // FAQ is accessible to everyone - no authentication required

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Remove loading check since FAQ doesn't require authentication

  // FAQ is accessible to both authenticated and non-authenticated users

  const content = (
    <>
      <SEOHead
        title="FAQ - Frequently Asked Questions | Savrii Customer Support Platform"
        description="Find answers to common questions about Savrii's AI-powered customer communication platform. Learn about features, pricing, integrations, and how to get started."
        keywords="Savrii FAQ, customer support questions, AI platform help, integration support, pricing questions, getting started guide"
        canonicalUrl="https://www.savrii.com/faq"
        structuredData={faqStructuredData}
      />
      <main className={`${!isAuthenticated ? 'pt-24 pb-20' : 'py-20'} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                <HelpCircle className="w-4 h-4 mr-2" />
                Frequently Asked Questions
              </Badge>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                How can we help you?
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Find answers to common questions about Savrii
              </p>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-12"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search frequently asked questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg border-green-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </motion.div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {filteredFAQs.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * (categoryIndex + 2) }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center">
                        <category.icon className="text-white w-4 h-4" />
                      </div>
                      <CardTitle className="text-2xl">{category.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.questions.map((faq, faqIndex) => {
                        const itemId = `${category.category}-${faqIndex}`;
                        const isOpen = openItems.includes(itemId);
                        
                        return (
                          <Collapsible key={faqIndex}>
                            <CollapsibleTrigger
                              onClick={() => toggleItem(itemId)}
                              className="flex items-center justify-between w-full p-4 text-left bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                            >
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {faq.question}
                              </span>
                              <ChevronDown
                                className={`w-5 h-5 text-gray-500 transition-transform ${
                                  isOpen ? 'transform rotate-180' : ''
                                }`}
                              />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-4 pb-4">
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {faq.answer}
                              </p>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-600 to-emerald-700">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Still have questions?
                </h3>
                <p className="text-green-100 mb-6">
                  Our support team is here to help you get the most out of Savrii.
                </p>
                <button
                  onClick={() => window.location.href = "/contact"}
                  className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Contact Support
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* No Results */}
          {searchTerm && filteredFAQs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                No results found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try searching with different keywords or{" "}
                <button 
                  onClick={() => window.location.href = "/contact"}
                  className="text-green-600 hover:underline"
                >
                  contact our support team
                </button>
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );

  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {isAuthenticated ? <TopNavbar /> : null}
      {content}
    </div>
  );
}