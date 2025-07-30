import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  MessageSquare,
  Target,
  BarChart3,
  Zap,
  Star,
  Users,
  Mail,
  FileText,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { FeatureGate } from "@/components/FeatureGate";
import { useAuth } from "@/hooks/useAuth";

interface DailySummaryData {
  date: string;
  totalQueries: number;
  avgResponseTime: number;
  avgConfidenceScore: number;
  successRate: number;
  peakHour: string;
  topTemplates: Array<{name: string; uses: number}>;
  hourlyDistribution: Array<{hour: string; queries: number}>;
  categoryBreakdown: Array<{category: string; count: number; percentage: number}>;
  trends: {
    queriesChange: number;
    responseTimeChange: number;
    confidenceChange: number;
    successRateChange: number;
  };
  insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    actionable?: boolean;
  }>;
}

const CHART_COLORS = ['#059669', '#0891b2', '#7c3aed', '#dc2626', '#ea580c', '#ca8a04'];

export default function DailySummary() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeRange, setTimeRange] = useState("today");
  const { user } = useAuth();

  // Mock data for demonstration - in production, this would come from your analytics API
  const { data: summaryData, isLoading, refetch } = useQuery({
    queryKey: ['/api/daily-summary', selectedDate, timeRange],
    queryFn: async () => {
      // Simulate API call with realistic data
      const mockData: DailySummaryData = {
        date: selectedDate,
        totalQueries: 47,
        avgResponseTime: 2.3,
        avgConfidenceScore: 87.5,
        successRate: 94.7,
        peakHour: "2:00 PM",
        topTemplates: [
          { name: "Customer Support Response", uses: 12 },
          { name: "Professional Email", uses: 8 },
          { name: "Sales Follow-up", uses: 6 },
          { name: "Social Media Post", uses: 4 }
        ],
        hourlyDistribution: [
          { hour: "9 AM", queries: 3 },
          { hour: "10 AM", queries: 8 },
          { hour: "11 AM", queries: 5 },
          { hour: "12 PM", queries: 7 },
          { hour: "1 PM", queries: 9 },
          { hour: "2 PM", queries: 12 },
          { hour: "3 PM", queries: 3 }
        ],
        categoryBreakdown: [
          { category: "Customer Support", count: 15, percentage: 32 },
          { category: "Email Templates", count: 12, percentage: 26 },
          { category: "Sales & Marketing", count: 10, percentage: 21 },
          { category: "Social Media", count: 6, percentage: 13 },
          { category: "Business Communication", count: 4, percentage: 8 }
        ],
        trends: {
          queriesChange: 12.5,
          responseTimeChange: -8.2,
          confidenceChange: 3.1,
          successRateChange: 1.8
        },
        insights: [
          {
            type: 'success',
            title: 'Peak Performance Hour',
            description: 'Your highest activity was at 2:00 PM with 12 queries and 95% success rate.',
            actionable: false
          },
          {
            type: 'info',
            title: 'Most Popular Template',
            description: 'Customer Support Response was used 12 times today - consider creating variations.',
            actionable: true
          },
          {
            type: 'warning',
            title: 'Response Time Spike',
            description: 'Average response time increased by 15% during peak hours. Consider optimizing prompts.',
            actionable: true
          }
        ]
      };
      return mockData;
    }
  });

  const getMetricColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getMetricIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4" />;
    if (change < 0) return <ArrowDown className="w-4 h-4" />;
    return null;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const exportSummary = () => {
    if (!summaryData) return;
    
    const csvContent = [
      'Metric,Value,Change',
      `Total Queries,${summaryData.totalQueries},${summaryData.trends.queriesChange}%`,
      `Avg Response Time,${summaryData.avgResponseTime}s,${summaryData.trends.responseTimeChange}%`,
      `Avg Confidence,${summaryData.avgConfidenceScore}%,${summaryData.trends.confidenceChange}%`,
      `Success Rate,${summaryData.successRate}%,${summaryData.trends.successRateChange}%`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-summary-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <FeatureGate 
      feature="daily_reports" 
      fallback={
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Daily Summary Reports</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            Get comprehensive daily insights into your usage patterns, performance metrics, and trends. Upgrade to Pro to unlock this feature.
          </p>
          <Button onClick={() => window.location.href = '/billing'}>
            Upgrade to Pro
          </Button>
        </div>
      }
    >
      <div className="container mx-auto p-6 pt-20 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-emerald-600" />
              Daily Summary
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Comprehensive insights into your usage patterns and performance metrics
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            <Button variant="outline" onClick={exportSummary}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : summaryData ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Queries</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryData.totalQueries}</p>
                      <div className={`flex items-center gap-1 text-sm ${getMetricColor(summaryData.trends.queriesChange)}`}>
                        {getMetricIcon(summaryData.trends.queriesChange)}
                        <span>{Math.abs(summaryData.trends.queriesChange)}% vs yesterday</span>
                      </div>
                    </div>
                    <MessageSquare className="w-8 h-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Response Time</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryData.avgResponseTime}s</p>
                      <div className={`flex items-center gap-1 text-sm ${getMetricColor(summaryData.trends.responseTimeChange)}`}>
                        {getMetricIcon(summaryData.trends.responseTimeChange)}
                        <span>{Math.abs(summaryData.trends.responseTimeChange)}% vs yesterday</span>
                      </div>
                    </div>
                    <Clock className="w-8 h-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Confidence</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryData.avgConfidenceScore}%</p>
                      <div className={`flex items-center gap-1 text-sm ${getMetricColor(summaryData.trends.confidenceChange)}`}>
                        {getMetricIcon(summaryData.trends.confidenceChange)}
                        <span>{Math.abs(summaryData.trends.confidenceChange)}% vs yesterday</span>
                      </div>
                    </div>
                    <Star className="w-8 h-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryData.successRate}%</p>
                      <div className={`flex items-center gap-1 text-sm ${getMetricColor(summaryData.trends.successRateChange)}`}>
                        {getMetricIcon(summaryData.trends.successRateChange)}
                        <span>{Math.abs(summaryData.trends.successRateChange)}% vs yesterday</span>
                      </div>
                    </div>
                    <Target className="w-8 h-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Hourly Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Hourly Activity Distribution
                      </CardTitle>
                      <CardDescription>
                        Peak activity at {summaryData.peakHour}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={summaryData.hourlyDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="queries" 
                            stroke="#059669" 
                            fill="#059669" 
                            fillOpacity={0.2} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Category Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Usage by Category
                      </CardTitle>
                      <CardDescription>
                        Distribution of query types
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={summaryData.categoryBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ category, percentage }) => `${category}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {summaryData.categoryBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Most Used Templates
                    </CardTitle>
                    <CardDescription>
                      Your favorite prompt templates today
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {summaryData.topTemplates.map((template, index) => (
                        <div key={template.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <span className="font-medium">{template.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">{template.uses} uses</span>
                            <Progress 
                              value={(template.uses / summaryData.topTemplates[0].uses) * 100} 
                              className="w-20 h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Usage Patterns Tab */}
              <TabsContent value="usage" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Query Volume Trends</CardTitle>
                      <CardDescription>
                        7-day query volume comparison
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={[
                          { day: 'Mon', queries: 32 },
                          { day: 'Tue', queries: 28 },
                          { day: 'Wed', queries: 45 },
                          { day: 'Thu', queries: 39 },
                          { day: 'Fri', queries: 52 },
                          { day: 'Sat', queries: 23 },
                          { day: 'Sun', queries: 47 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="queries" stroke="#059669" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Category Trends</CardTitle>
                      <CardDescription>
                        Most popular categories this week
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {summaryData.categoryBreakdown.map((category, index) => (
                          <div key={category.category}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{category.category}</span>
                              <span>{category.count} queries ({category.percentage}%)</span>
                            </div>
                            <Progress value={category.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Response Time Analysis</CardTitle>
                      <CardDescription>
                        Average response times throughout the day
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          { hour: '9 AM', responseTime: 2.1 },
                          { hour: '10 AM', responseTime: 1.8 },
                          { hour: '11 AM', responseTime: 2.0 },
                          { hour: '12 PM', responseTime: 2.5 },
                          { hour: '1 PM', responseTime: 2.8 },
                          { hour: '2 PM', responseTime: 3.2 },
                          { hour: '3 PM', responseTime: 2.1 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="responseTime" fill="#059669" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Confidence Score Distribution</CardTitle>
                      <CardDescription>
                        AI confidence levels for responses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          { range: '90-100%', count: 32 },
                          { range: '80-89%', count: 11 },
                          { range: '70-79%', count: 3 },
                          { range: '60-69%', count: 1 },
                          { range: '50-59%', count: 0 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#0891b2" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      AI-Generated Insights
                    </CardTitle>
                    <CardDescription>
                      Actionable recommendations based on your usage patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {summaryData.insights.map((insight, index) => (
                        <div key={index} className="flex gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{insight.description}</p>
                            {insight.actionable && (
                              <Button variant="outline" size="sm" className="mt-2">
                                Take Action
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Optimization Recommendations</CardTitle>
                    <CardDescription>
                      Ways to improve your workflow efficiency
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Create Custom Templates</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">You frequently use similar prompts. Consider saving them as custom templates.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Optimize Peak Hours</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Your peak usage is at 2 PM. Consider pre-generating responses for better efficiency.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Brand Voice Training</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Enable brand voice training to get more consistent response styles.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
            <p className="text-gray-600 dark:text-gray-300">
              No usage data found for the selected date range.
            </p>
          </div>
        )}
      </div>
    </FeatureGate>
  );
}