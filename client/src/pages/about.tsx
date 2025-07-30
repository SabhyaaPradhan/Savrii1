import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Heart, 
  Target, 
  Users, 
  Lightbulb, 
  ArrowRight,
  Award,
  TrendingUp,
  Globe
} from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Customer First",
    description: "Every decision we make starts with how it benefits our customers and their success."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously push the boundaries of AI technology to solve real business problems."
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "We believe in the power of working together to achieve extraordinary results."
  },
  {
    icon: Target,
    title: "Excellence",
    description: "We strive for excellence in everything we do, from code quality to customer support."
  }
];

const team = [
  {
    name: "Alex Chen",
    role: "CEO & Co-founder",
    bio: "Former AI researcher at Google with 10+ years in machine learning and natural language processing.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
  },
  {
    name: "Sarah Rodriguez",
    role: "CTO & Co-founder", 
    bio: "Ex-OpenAI engineer specializing in large language models and conversational AI systems.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
  },
  {
    name: "David Kim",
    role: "Head of Product",
    bio: "Product leader with experience at Slack and Zoom, passionate about user-centric design.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
  },
  {
    name: "Emily Watson",
    role: "Head of Customer Success",
    bio: "Customer success expert who ensures every Savrii user achieves their communication goals.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
  }
];

const stats = [
  { number: "50K+", label: "Active Users" },
  { number: "2M+", label: "Queries Processed" },
  { number: "98%", label: "Customer Satisfaction" },
  { number: "150+", label: "Countries" }
];

const timeline = [
  {
    year: "2022",
    title: "Founded",
    description: "Savrii was founded with a mission to democratize AI-powered customer communication."
  },
  {
    year: "2023",
    title: "First Product Launch",
    description: "Released our first AI assistant focused on coaches and consultants."
  },
  {
    year: "2024",
    title: "Series A Funding",
    description: "Raised $10M Series A to expand our AI capabilities and team."
  },
  {
    year: "2025",
    title: "Global Expansion",
    description: "Launched in 50+ countries with multi-language support and enterprise features."
  }
];

export default function About() {
  const { isAuthenticated } = useAuth();

  const aboutStructuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Savrii - AI Customer Communication Platform",
    "description": "Learn about Savrii's mission to transform customer communication with AI-powered responses for businesses.",
    "url": "https://www.savrii.com/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "Savrii",
      "foundingDate": "2024",
      "description": "AI-powered customer communication platform helping businesses provide instant, intelligent customer support."
    }
  };
  
  const content = (
    <>
      <SEOHead
        title="About Savrii - AI-Powered Customer Communication Platform | Our Story"
        description="Learn about Savrii's mission to transform customer communication with AI-powered responses. Discover our story, values, and commitment to helping businesses scale their customer support."
        keywords="about Savrii, AI customer support company, business communication platform, customer service automation, AI technology company"
        canonicalUrl="https://www.savrii.com/about"
        structuredData={aboutStructuredData}
      />
      <main className={`${!isAuthenticated ? 'pt-32 pb-20' : 'py-20'} px-4 sm:px-6 lg:px-8`}>
      {/* Hero Section */}
      <section>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <Badge variant="secondary" className="mb-4 px-4 py-2">
                🚀 About Savrii
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                Transforming{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Customer Communication
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                We're on a mission to help businesses provide instant, intelligent customer support 
                that scales with their growth while maintaining a personal touch.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                At Savrii, we believe that every business deserves to provide exceptional customer support, 
                regardless of their size or resources. Our AI-powered platform democratizes access to 
                intelligent customer communication tools.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                We're not just building software – we're empowering coaches, consultants, freelancers, 
                and e-commerce sellers to focus on what they do best while our AI handles the routine 
                customer interactions.
              </p>
              <Button
                onClick={() => window.location.href = "/auth"}
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
              >
                Join Our Mission
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Globe className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Global Impact</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Serving customers worldwide</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Rapid Growth</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">500% growth year over year</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Award className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Award Winning</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Best AI Startup 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do at Savrii.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <value.icon className="text-white w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Our Journey</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              From startup to industry leader
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-600"></div>
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative flex items-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold z-10">
                    {item.year}
                  </div>
                  <div className="ml-8">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The passionate individuals behind Savrii's success.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                    />
                    <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm mb-3">{member.role}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Join Our Mission?</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Whether you're looking to transform your customer communication or join our team, 
              we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = "/auth"}
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => window.location.href = "/contact"}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-medium"
              >
                Get in Touch
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      </main>
    </>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <Navbar />
        <main className="flex-1">
          {content}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {content}
    </div>
  );
}