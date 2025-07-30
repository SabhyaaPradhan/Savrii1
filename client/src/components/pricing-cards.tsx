import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Sprout, Rocket, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  {
    name: "Free Trial",
    icon: Sprout,
    description: "Perfect for trying out Savrii",
    price: { INR: "Free", USD: "Free", EUR: "Free" },
    duration: "14 days",
    features: [
      { text: "50 AI responses", included: true },
      { text: "Basic templates", included: true },
      { text: "Email support", included: true },
      { text: "Priority support", included: false },
    ],
    popular: false,
    planId: "free_trial"
  },
  {
    name: "Starter",
    icon: Rocket,
    description: "For growing professionals",
    price: { INR: "₹499", USD: "$6", EUR: "€5" },
    duration: "month",
    features: [
      { text: "Unlimited responses", included: true },
      { text: "Premium templates", included: true },
      { text: "Priority email support", included: true },
      { text: "Custom tone settings", included: true },
    ],
    popular: true,
    planId: "starter"
  },
  {
    name: "Pro",
    icon: Crown,
    description: "For established businesses",
    price: { INR: "₹999", USD: "$12", EUR: "€10" },
    duration: "month",
    features: [
      { text: "Everything in Starter", included: true },
      { text: "Advanced AI models", included: true },
      { text: "24/7 priority support", included: true },
      { text: "Team collaboration", included: true },
    ],
    popular: false,
    planId: "pro"
  }
];

export function PricingCards() {
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR">("INR");
  const { isAuthenticated } = useAuth();

  const handlePlanSelect = async (planId: string) => {
    if (!isAuthenticated) {
      // Redirect to auth page to sign up
      window.location.href = "/auth";
      return;
    }

    try {
      // Update user plan
      const response = await fetch("/api/user/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planId }),
      });

      if (response.ok) {
        // Redirect to dashboard after plan selection
        window.location.href = "/dashboard";
      } else {
        console.error("Failed to update plan");
      }
    } catch (error) {
      console.error("Error selecting plan:", error);
    }
  };

  return (
    <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your business needs
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4">
            <span className="text-gray-600 dark:text-gray-300">Currency:</span>
            <Select value={currency} onValueChange={(value: "INR" | "USD" | "EUR") => setCurrency(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">₹ INR</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
                <SelectItem value="EUR">€ EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-8 relative hover:shadow-xl transition-all transform hover:scale-105 ${
                plan.popular ? "border-2 border-indigo-500" : "border border-gray-200 dark:border-slate-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <div className={`w-16 h-16 ${
                  plan.popular 
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                    : index === 0 
                    ? "bg-gradient-to-br from-gray-400 to-gray-600"
                    : "bg-gradient-to-br from-amber-500 to-orange-600"
                } rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <plan.icon className="text-white w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold">{plan.price[currency]}</span>
                  <span className="text-gray-600 dark:text-gray-300">/{plan.duration}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    {feature.included ? (
                      <Check className="text-green-500 w-5 h-5 mr-3 flex-shrink-0" />
                    ) : (
                      <X className="text-red-500 w-5 h-5 mr-3 flex-shrink-0" />
                    )}
                    <span className={feature.included ? "" : "text-gray-500 dark:text-gray-400"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePlanSelect(plan.planId)}
                className={`w-full py-3 font-medium transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                    : index === 2
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {plan.name === "Free Trial" ? "Start Free Trial" : `Choose ${plan.name}`}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
