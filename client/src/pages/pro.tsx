import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown,
  Zap,
  Shield,
  Users,
  BarChart3,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Rocket
} from "lucide-react";
import { Link } from "wouter";

export default function Pro() {
  const { user } = useAuth();

  // Get user analytics for Pro features
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/overview'],
    enabled: !!user
  });

  const { data: usageStats } = useQuery({
    queryKey: ['/api/usage/stats'],
    enabled: !!user
  });

  const proFeatures = [
    {
      icon: <MessageSquare className="w-6 h-6 text-emerald-600" />,
      title: "5,000 Monthly Responses",
      description: "Generate up to 5,000 AI responses per month with priority processing",
      value: "5,000/month"
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: "Advanced AI Models",
      description: "Access to GPT-4o and premium AI models for superior response quality",
      value: "Premium Models"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
      title: "Advanced Analytics",
      description: "Detailed performance insights, confidence tracking, and optimization recommendations",
      value: "Full Analytics"
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      title: "Priority Support",
      description: "24/7 priority customer support with dedicated account management",
      value: "24/7 Support"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Enhanced Security",
      description: "Advanced data encryption, GDPR compliance, and audit logging",
      value: "Enterprise Security"
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      title: "Team Collaboration",
      description: "Share templates, collaborate on responses, and manage team permissions",
      value: "Team Features"
    }
  ];

  const currentPlan = usageStats?.plan || 'starter';
  const isProUser = currentPlan === 'pro';

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="w-8 h-8 text-emerald-600" />
          <h1 className="text-4xl font-bold font-heading text-gray-900 dark:text-white">
            Savrii Pro
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Unlock advanced AI communication features designed for professionals and growing businesses
        </p>
        
        {isProUser ? (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            <CheckCircle className="w-4 h-4 mr-1" />
            You're on Pro Plan
          </Badge>
        ) : (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/billing">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Rocket className="w-5 h-5 mr-2" />
                Upgrade to Pro - $29/month
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                Compare Plans
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Current Usage Overview */}
      {isProUser && (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Your Pro Usage This Month
            </CardTitle>
            <CardDescription>
              Track your advanced plan utilization and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {usageStats?.used || 0}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Responses Generated
                </p>
                <Progress 
                  value={((usageStats?.used || 0) / 5000) * 100} 
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {5000 - (usageStats?.used || 0)} remaining this month
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(((analytics as any)?.avgConfidence || 0) * 100)}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Average Confidence
                </p>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">Premium Quality</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
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

      {/* Pro Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <Badge variant="outline" className="text-emerald-700 border-emerald-300">
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

      {/* Advanced Features Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Advanced AI Capabilities
            </CardTitle>
            <CardDescription>
              Pro-exclusive AI features for superior results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>GPT-4o Premium Model Access</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Advanced Tone Customization</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Industry-Specific Templates</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Multi-Language Support</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Custom Response Length Controls</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Pro Analytics & Insights
            </CardTitle>
            <CardDescription>
              Deep insights to optimize your communication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Detailed Performance Metrics</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Confidence Score Tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Response Time Analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Usage Pattern Analysis</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Export & Reporting Tools</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Stories */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Join Thousands of Pro Users
          </CardTitle>
          <CardDescription className="text-lg">
            See how professionals are transforming their client communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-600">95%</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Response Quality Improvement
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">3x</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Faster Response Times
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">89%</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Client Satisfaction Increase
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {!isProUser && (
        <Card className="border-emerald-200 dark:border-emerald-800 text-center">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-bold mb-4">Ready to Upgrade?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join thousands of professionals using Savrii Pro to enhance their client communication
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/billing">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Crown className="w-5 h-5 mr-2" />
                  Start Pro Trial - Free for 14 days
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Talk to Sales
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}