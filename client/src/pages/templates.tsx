import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { FeatureGate } from "@/components/FeatureGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  MessageSquare, 
  ShoppingCart, 
  Truck, 
  HelpCircle,
  Crown,
  Sparkles
} from "lucide-react";

const templates = [
  {
    id: 1,
    name: "Refund Request Response",
    description: "Professional templates for handling refund requests",
    category: "Customer Service",
    icon: MessageSquare,
    isPro: false
  },
  {
    id: 2,
    name: "Shipping Delay Notice",
    description: "Templates for shipping delay communications",
    category: "Logistics",
    icon: Truck,
    isPro: false
  },
  {
    id: 3,
    name: "Product Support",
    description: "Technical support response templates",
    category: "Support",
    icon: HelpCircle,
    isPro: false
  },
  {
    id: 4,
    name: "Custom Brand Voice",
    description: "Personalized templates matching your brand",
    category: "Advanced",
    icon: Crown,
    isPro: true
  },
  {
    id: 5,
    name: "Industry-Specific Templates",
    description: "Specialized templates for your industry",
    category: "Pro Features",
    icon: Sparkles,
    isPro: true
  }
];

export default function Templates() {
  const { user } = useAuth();

  const basicTemplates = templates.filter(t => !t.isPro);
  const proTemplates = templates.filter(t => t.isPro);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">
          Response Templates
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Pre-built templates to speed up your client responses
        </p>
      </motion.div>

      {/* Basic Templates */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Basic Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {basicTemplates.map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8 text-emerald-600" />
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Pro Templates - Feature Gated */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Pro Templates
        </h2>
        
        <FeatureGate 
          feature="prompt_templates"
          title="Advanced Template Library"
          description="Access industry-specific templates and custom brand voice training to match your unique communication style."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proTemplates.map((template, index) => {
              const Icon = template.icon;
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Icon className="h-8 w-8 text-emerald-600" />
                        <Badge className="text-xs bg-emerald-100 text-emerald-800">
                          {template.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </FeatureGate>
      </section>
    </div>
  );
}