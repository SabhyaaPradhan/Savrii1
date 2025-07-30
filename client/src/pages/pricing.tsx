import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ArrowRight, Star, Users, Zap, Crown, Rocket, Globe } from "lucide-react";
import logoImage from "@assets/Screenshot_2025-07-27_102834-removebg-preview_1753592423683.png";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { useCurrency } from "@/hooks/useCurrency";

// Dynamic structured data will be generated based on detected currency
const generatePricingStructuredData = (currencyCode: string, formatPrice: (price: number) => string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Savrii - AI Customer Communication Platform",
  "description": "Transform your customer communication with AI-powered responses. Choose from Starter, Pro, or Unlimited plans.",
  "url": "https://www.savrii.com/pricing",
  "provider": {
    "@type": "Organization",
    "name": "Savrii"
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter Plan",
      "price": "0",
      "priceCurrency": currencyCode,
      "description": "100 queries per month, basic AI responses, email support"
    },
    {
      "@type": "Offer", 
      "name": "Pro Plan",
      "price": "29",
      "priceCurrency": currencyCode,
      "description": "5,000 queries per month, advanced AI responses, priority support"
    },
    {
      "@type": "Offer",
      "name": "Unlimited Plan", 
      "price": "99",
      "priceCurrency": currencyCode,
      "description": "Unlimited queries, premium AI responses, 24/7 support"
    }
  ]
});

const plans = [
  {
    name: "Starter",
    subtitle: "Free",
    icon: Rocket,
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for trying out Savrii",
    features: [
      "100 queries per month",
      "Basic AI responses", 
      "Email support",
      "1 integration",
      "Basic analytics"
    ],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Pro", 
    subtitle: "Most Popular",
    icon: Crown,
    price: { monthly: 29, yearly: 290 },
    description: "For growing businesses and professionals",
    features: [
      "5,000 queries per month",
      "Advanced AI responses",
      "Priority support",
      "All integrations",
      "Advanced analytics",
      "Custom prompts",
      "Brand voice training"
    ],
    cta: "Get Started",
    popular: true
  },
  {
    name: "Unlimited",
    subtitle: "Enterprise", 
    icon: Zap,
    price: { monthly: 99, yearly: 990 },
    description: "For teams and high-volume users",
    features: [
      "Unlimited queries",
      "Premium AI responses",
      "24/7 phone support",
      "All integrations",
      "Real-time analytics",
      "Custom prompts",
      "Brand voice training",
      "API access",
      "White-label options"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const { isAuthenticated } = useAuth();
  const { currency, isLoading: currencyLoading, formatPrice, setCurrencyManually, availableCurrencies } = useCurrency();

  const handlePlanSelect = (planName: string) => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
      return;
    }
    
    if (planName === "Unlimited") {
      window.location.href = "/contact";
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <SEOHead
        title="Pricing Plans - Choose Your Perfect Plan | Savrii AI Platform"
        description="Transparent pricing for Savrii's AI-powered customer communication platform. Start with our free Starter plan or choose Pro/Unlimited for advanced features. 30-day money-back guarantee."
        keywords="Savrii pricing, AI customer support pricing, business communication plans, customer service platform cost, AI chatbot pricing"
        canonicalUrl="https://www.savrii.com/pricing"
        structuredData={generatePricingStructuredData(currency.code, formatPrice)}
      />
      <Navbar />
      
      <main className="pt-32 pb-16">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <Badge variant="secondary" className="mb-4 px-4 py-2">
                💰 Transparent Pricing
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Choose Your{" "}
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Perfect Plan
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                Start with our free plan and scale as you grow. All plans include our core AI features.
              </p>
              
              {/* Currency Selector */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <Globe className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Currency:</span>
                <Select
                  value={currency.code}
                  onValueChange={setCurrencyManually}
                  disabled={currencyLoading}
                >
                  <SelectTrigger className="w-32 bg-white dark:bg-slate-800">
                    <SelectValue>
                      {currencyLoading ? "Loading..." : `${currency.symbol} ${currency.code}`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center gap-4 mb-16"
            >
              <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-green-600"
              />
              <span className={`text-sm font-medium ${isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                Yearly
              </span>
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Save 20%
              </Badge>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`h-full border-0 shadow-xl transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 ring-2 ring-green-500' 
                      : 'bg-white dark:bg-slate-800'
                  }`}>
                    <CardHeader className="text-center pb-4">
                      <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4">
                        <img src={logoImage} alt="Savrii Logo" className="w-12 h-12" />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="text-sm font-medium text-green-600 dark:text-green-400">
                        {plan.subtitle}
                      </CardDescription>
                      
                      <div className="pt-4">
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold">
                            {currencyLoading ? "..." : formatPrice(isYearly ? plan.price.yearly : plan.price.monthly)}
                          </span>
                          <span className="text-gray-500 ml-1">
                            /{isYearly ? 'year' : 'month'}
                          </span>
                        </div>
                        {isYearly && plan.price.monthly > 0 && !currencyLoading && (
                          <p className="text-sm text-gray-500 mt-1">
                            Save {formatPrice((plan.price.monthly * 12) - plan.price.yearly)}/year
                          </p>
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 pt-2">
                        {plan.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      <Button
                        onClick={() => handlePlanSelect(plan.name)}
                        className={`w-full mb-6 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                        }`}
                        size="lg"
                      >
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center">
                            <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white dark:bg-slate-800">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Everything you need to know about our pricing
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid gap-6"
            >
              {[
                {
                  question: "Can I change my plan at any time?",
                  answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated."
                },
                {
                  question: "What happens when I reach my query limit?",
                  answer: "On the Starter plan, you'll need to upgrade to continue. Pro and Unlimited plans have high limits with overflow protection."
                },
                {
                  question: "Is there a refund policy?",
                  answer: "We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund."
                },
                {
                  question: "Do you offer team discounts?",
                  answer: "Yes! Contact us for custom pricing for teams of 5 or more. We offer significant discounts for larger organizations."
                },
                {
                  question: "What's included in the free Starter plan?",
                  answer: "The Starter plan includes 100 queries per month, basic AI responses, email support, and access to our core features."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white"
            >
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Customer Communication?</h2>
              <p className="text-xl text-green-100 mb-8">
                Join thousands of businesses using Savrii to provide instant, intelligent customer support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.href = "/auth"}
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => window.location.href = "/contact"}
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-medium"
                >
                  Contact Sales
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
