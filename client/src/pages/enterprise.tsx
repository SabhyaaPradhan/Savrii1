import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown,
  Shield,
  Users,
  Zap,
  Globe,
  Settings,
  BarChart3,
  Lock,
  Headphones,
  CheckCircle,
  ArrowRight,
  Star,
  Building,
  Workflow
} from "lucide-react";
import { Link } from "wouter";

export default function Enterprise() {
  const { user } = useAuth();

  // Get user analytics for Enterprise features
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/overview'],
    enabled: !!user
  });

  const { data: usageStats } = useQuery({
    queryKey: ['/api/usage/stats'],
    enabled: !!user
  });

  const enterpriseFeatures = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Unlimited Team Members",
      description: "Add unlimited team members with granular role-based permissions and collaboration tools",
      value: "Unlimited"
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-600" />,
      title: "Unlimited AI Responses",
      description: "Generate unlimited AI responses with highest priority processing and premium models",
      value: "Unlimited"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Enterprise Security",
      description: "SSO, 2FA, audit logs, data encryption, GDPR compliance, and dedicated security reviews",
      value: "Advanced"
    },
    {
      icon: <Globe className="w-6 h-6 text-indigo-600" />,
      title: "White-label Solution",
      description: "Completely customize branding, domain, and user experience to match your organization",
      value: "Full Control"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-600" />,
      title: "Advanced Analytics & Reporting",
      description: "Real-time dashboards, custom reports, performance insights, and business intelligence",
      value: "Enterprise"
    },
    {
      icon: <Headphones className="w-6 h-6 text-orange-600" />,
      title: "Dedicated Support",
      description: "24/7 priority support with dedicated account manager and custom SLA agreements",
      value: "Dedicated"
    }
  ];

  const currentPlan = usageStats?.plan || 'starter';
  const isEnterpriseUser = currentPlan === 'enterprise';

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Building className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl font-bold font-heading text-gray-900 dark:text-white">
            Savrii Enterprise
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Powerful AI communication platform designed for large organizations and enterprise-scale operations
        </p>
        
        {isEnterpriseUser ? (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            <CheckCircle className="w-4 h-4 mr-1" />
            You're on Enterprise Plan
          </Badge>
        ) : (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/billing">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Building className="w-5 h-5 mr-2" />
                Upgrade to Enterprise - $99/month
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Contact Sales
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Current Usage Overview */}
      {isEnterpriseUser && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Your Enterprise Usage
            </CardTitle>
            <CardDescription>
              Monitor your organization's AI communication performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {usageStats?.used || 0}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Responses This Month
                </p>
                <Badge variant="outline" className="mt-1">Unlimited</Badge>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(((analytics as any)?.avgConfidence || 0) * 100)}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Average Confidence
                </p>
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">Premium Quality</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  24/7
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Dedicated Support
                </p>
                <Badge variant="outline" className="mt-1">Active</Badge>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  {(analytics as any)?.totalResponses || 0}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Responses
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Since {(analytics as any)?.joinDate || 'recently'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enterprise Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enterpriseFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  {feature.value}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exclusive Enterprise Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              Enterprise Security & Compliance
            </CardTitle>
            <CardDescription>
              Bank-grade security for mission-critical operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Single Sign-On (SSO) Integration</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Multi-Factor Authentication (2FA)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Comprehensive Audit Logging</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>GDPR & SOC 2 Compliance</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Data Residency Controls</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Regular Security Assessments</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-purple-600" />
              Advanced Automation & Integration
            </CardTitle>
            <CardDescription>
              Seamlessly integrate with your existing workflows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Custom API Endpoints & Webhooks</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Workflow Builder & Automation</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Salesforce & CRM Integration</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Slack & Teams Connectors</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Custom AI Model Training</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Bulk Operations & Mass Processing</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Enterprise-Grade Performance
          </CardTitle>
          <CardDescription className="text-lg">
            Proven results at scale for large organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600">99.9%</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Uptime SLA Guarantee
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">5x</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Faster Response Processing
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">10M+</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Responses Processed Monthly
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">500+</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Enterprise Customers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support & Implementation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-orange-600" />
              Dedicated Support & Success
            </CardTitle>
            <CardDescription>
              White-glove service for enterprise customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span className="font-medium">Response Time</span>
                <Badge className="bg-orange-100 text-orange-700">< 1 Hour</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="font-medium">Account Manager</span>
                <Badge className="bg-green-100 text-green-700">Dedicated</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="font-medium">Training & Onboarding</span>
                <Badge className="bg-blue-100 text-blue-700">Included</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="font-medium">Custom Implementation</span>
                <Badge className="bg-purple-100 text-purple-700">Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Implementation & Migration
            </CardTitle>
            <CardDescription>
              Seamless transition to enterprise platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Discovery & Planning</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Assess requirements and plan implementation strategy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">2</span>
                </div>
                <div>
                  <h4 className="font-medium">System Integration</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Connect with existing tools and configure security
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Training & Go-Live</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Team training and phased rollout with ongoing support
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA */}
      {!isEnterpriseUser && (
        <Card className="border-purple-200 dark:border-purple-800 text-center">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-bold mb-4">Ready for Enterprise Scale?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join leading organizations using Savrii Enterprise to transform their AI communication at scale
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/billing">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Building className="w-5 h-5 mr-2" />
                  Start Enterprise Trial - Free for 30 days
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Schedule Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Custom pricing available for large deployments and multi-year contracts
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}