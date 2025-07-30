import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Clock, TrendingUp, Users, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import TopNavbar from "@/components/ui/top-navbar";

// Helper function to format time ago
function formatTimeAgo(timestamp: string | Date) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
}

// Recent Activity Card Component
function RecentActivityCard() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/home/recent-activity'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Recent Activity</CardTitle>
        <CardDescription>
          Quick overview of your latest customer interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </>
          ) : activities && activities.length > 0 ? (
            activities.map((activity: any) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  {formatTimeAgo(activity.timestamp)}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No recent activity yet</p>
              <p className="text-sm">Start generating responses to see your activity here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Performance Stats Card Component
function PerformanceStatsCard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/home/performance-stats'],
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Performance Stats</CardTitle>
        <CardDescription>
          Your communication efficiency at a glance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats?.responseAccuracy || 85}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Response Accuracy</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats?.avgResponseTime || '1.2s'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Avg Response Time</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats?.totalQueries || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Queries Handled</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats?.customerSatisfaction || 98}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Customer Satisfaction</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your home page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <TopNavbar />
      {/* Main Content */}
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                Welcome back to Savrii
              </Badge>
              <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                Hello, {(user as any)?.firstName || 'there'}! 
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Your intelligent customer communication hub is ready. Manage your responses, track performance, and grow your business.
              </p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="text-white w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-4">
                  Access your full dashboard with analytics and response management.
                </CardDescription>
                <Button 
                  onClick={() => window.location.href = "/dashboard"}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-700 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="text-white w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Quick Response</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-4">
                  Generate instant responses to customer queries.
                </CardDescription>
                <Button 
                  onClick={() => window.location.href = "/dashboard"}
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50"
                >
                  Start Responding
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="text-white w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-4">
                  View detailed performance metrics and insights.
                </CardDescription>
                <Button 
                  onClick={() => window.location.href = "/analytics"}
                  variant="outline"
                  className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-700 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-white w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-4">
                  Configure your account and response preferences.
                </CardDescription>
                <Button 
                  onClick={() => window.location.href = "/settings"}
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50"
                >
                  Manage Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            <RecentActivityCard />
            <PerformanceStatsCard />
          </motion.div>
        </div>
      </div>
    </div>
  );
}