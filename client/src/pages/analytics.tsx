import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsSEO } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Clock,
  Target,
  Activity
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

export default function Analytics() {
  const { user } = useAuth();

  // Get analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics/overview'],
    enabled: !!user
  });

  const { data: dailyUsage } = useQuery({
    queryKey: ['/api/analytics/daily-usage'],
    enabled: !!user
  });

  const { data: templateUsage } = useQuery({
    queryKey: ['/api/analytics/templates'],
    enabled: !!user
  });

  const { data: heatmapData } = useQuery({
    queryKey: ['/api/analytics/heatmap'],
    enabled: !!user
  });

  if (analyticsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <>
      <AnalyticsSEO />
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Track your AI assistant usage and performance
          </p>
        </div>
        <Badge variant="outline" className="text-emerald-700 border-emerald-300">
          <BarChart3 className="w-3 h-3 mr-1" />
          Real-time Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics as any)?.totalResponses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Since {(analytics as any)?.joinDate || 'recently'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics as any)?.weekTotal || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{(analytics as any)?.weeklyGrowth || 0}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Confidence</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(((analytics as any)?.avgConfidence || 0) * 100)}%
            </div>
            <Progress 
              value={((analytics as any)?.avgConfidence || 0) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics as any)?.avgGenerationTime?.toFixed(1) || 0}s
            </div>
            <p className="text-xs text-muted-foreground">
              Fastest: {(analytics as any)?.fastestTime?.toFixed(1) || 0}s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage Trend</CardTitle>
            <CardDescription>
              Response generation over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={(dailyUsage as any) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="responses" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Template Usage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Templates</CardTitle>
            <CardDescription>
              Most used response types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(templateUsage as any) || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {((templateUsage as any) || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Heatmap
          </CardTitle>
          <CardDescription>
            Your most active hours of the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={(heatmapData as any) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="activity" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            Quality metrics and improvement suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(analytics as any)?.highQualityCount || 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                High Quality Responses (&gt;90% confidence)
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {Math.round(((analytics as any)?.successRate || 0) * 100)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Overall Success Rate
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(analytics as any)?.lowQualityCount || 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Responses to Improve (&lt;70% confidence)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Usage */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Current Plan:</span> {(analytics as any)?.plan || 'Starter'} Plan
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Usage:</span> {(analytics as any)?.used || 0} / {
                (analytics as any)?.limit === -1 ? 'unlimited' : ((analytics as any)?.limit || 100)
              } this month
            </div>
          </div>
          {(analytics as any)?.trialDaysLeft !== null && (analytics as any)?.trialDaysLeft !== undefined && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Trial ends in {(analytics as any).trialDaysLeft} days. Upgrade to continue unlimited access.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
}