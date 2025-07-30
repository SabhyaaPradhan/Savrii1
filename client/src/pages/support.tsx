import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  Video,
  Mail,
  Clock,
  CheckCircle,
  Book,
  Search,
  ExternalLink
} from "lucide-react";

export default function Support() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const faqItems = [
    {
      question: "How do I upgrade my plan?",
      answer: "You can upgrade your plan anytime from the Billing page. Changes take effect immediately.",
      category: "Billing"
    },
    {
      question: "What's included in the Pro plan?",
      answer: "Pro includes unlimited queries, advanced templates, team collaboration, and priority support.",
      category: "Plans"
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel anytime. Your plan remains active until the end of your billing period.",
      category: "Billing"
    },
    {
      question: "How does the AI generate responses?",
      answer: "Our AI uses advanced language models trained on professional communication patterns.",
      category: "Features"
    }
  ];

  const supportChannels = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageSquare,
      availability: "24/7 for Pro & Enterprise",
      action: "Start Chat"
    },
    {
      title: "Email Support",
      description: "Send us detailed questions or feedback",
      icon: Mail,
      availability: "Response within 24 hours",
      action: "Send Email"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      icon: Video,
      availability: "Available anytime",
      action: "Watch Now"
    },
    {
      title: "Documentation",
      description: "Browse our comprehensive guides",
      icon: Book,
      availability: "Always updated",
      action: "Read Docs"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">
            FAQ / Support
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Get help and find answers to common questions
          </p>
        </div>
        <Badge variant="outline" className="text-blue-700 border-blue-300">
          <HelpCircle className="w-3 h-3 mr-1" />
          Help Center
        </Badge>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search for help articles, guides, or common issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Support Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Get Support</CardTitle>
          <CardDescription>
            Choose the best way to get help based on your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {supportChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div key={channel.title} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-medium">{channel.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {channel.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <Clock className="w-3 h-3" />
                    {channel.availability}
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    {channel.action}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Frequently Asked Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.question}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Send us a message
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Brief description of your issue" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-md">
                  <option>Low - General question</option>
                  <option>Medium - Feature request</option>
                  <option>High - Bug report</option>
                  <option>Urgent - Service issue</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea 
                placeholder="Please describe your issue or question in detail..."
                className="mt-1"
                rows={6}
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Mail className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status & Resources */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Services</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Response Engine</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Quick Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-start">
                <Book className="w-4 h-4 mr-2" />
                Getting Started Guide
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Video className="w-4 h-4 mr-2" />
                Video Tutorials
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                API Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}