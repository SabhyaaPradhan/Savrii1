import { motion } from "framer-motion";
import { Brain, Users, Zap, Palette, Shield, Smartphone } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Responses",
    description: "Generate professional, contextual replies instantly using advanced AI that understands your communication style.",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    icon: Users,
    title: "Multi-Client Management",
    description: "Organize conversations by client and maintain consistent communication across all your professional relationships.",
    gradient: "from-emerald-500 to-teal-600"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get professional responses in seconds, not minutes. Save time and maintain momentum in your client conversations.",
    gradient: "from-amber-500 to-orange-600"
  },
  {
    icon: Palette,
    title: "Custom Tone & Style",
    description: "Customize the AI to match your communication style - professional, friendly, or anywhere in between.",
    gradient: "from-pink-500 to-rose-600"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your client conversations remain private and secure. We never store or share your sensitive communications.",
    gradient: "from-green-400 to-emerald-500"
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Access Savrii from anywhere. Our mobile-optimized interface works perfectly on all devices.",
    gradient: "from-green-600 to-emerald-700"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Powerful Features for Professionals
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to communicate effectively with your clients
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
