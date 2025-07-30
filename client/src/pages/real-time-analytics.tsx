import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Activity, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Zap,
  Database,
  Cpu,
  Eye,
  RefreshCw
} from "lucide-react";

type TimeRange = "24h" | "7d" | "30d";

export default function RealTimeAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Real-time user activity data
  const { data: userActivity, refetch: refetchUserActivity } = useQuery({
    queryKey: ['/api/analytics/user-activity', timeRange],
    refetchInterval: isLiveMode ? 10000 : false, // Update every 10 seconds in live mode
  });

  // System performance metrics
  const { data: systemMetrics, refetch: refetchSystemMetrics } = useQuery({
    queryKey: ['/api/analytics/system-metrics', timeRange],
    refetchInterval: isLiveMode ? 5000 : false, // Update every 5 seconds
  });

  // Query usage patterns
  const { data: queryPatterns, refetch: refetchQueryPatterns } = useQuery({
    queryKey: ['/api/analytics/query-patterns', timeRange],
    refetchInterval: isLiveMode ? 15000 : false, // Update every 15 seconds
  });

  // Live usage statistics
  const { data: liveStats, refetch: refetchLiveStats } = useQuery({
    queryKey: ['/api/analytics/live-stats'],
    refetchInterval: isLiveMode ? 3000 : false, // Update every 3 seconds
  });

  // Response time analytics
  const { data: responseTimeData, refetch: refetchResponseTime } = useQuery({
    queryKey: ['/api/analytics/response-times', timeRange],
    refetchInterval: isLiveMode ? 8000 : false, // Update every 8 seconds
  });

  // User engagement metrics
  const { data: engagementData, refetch: refetchEngagement } = useQuery({
    queryKey: ['/api/analytics/engagement', timeRange],
    refetchInterval: isLiveMode ? 12000 : false, // Update every 12 seconds
  });

  // Manual refresh all data
  const refreshAllData = () => {
    refetchUserActivity();
    refetchSystemMetrics();
    refetchQueryPatterns();
    refetchLiveStats();
    refetchResponseTime();
    refetchEngagement();
    setLastUpdated(new Date());
  };

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case "24h": return "Last 24 Hours";
      case "7d": return "Last 7 Days";
      case "30d": return "Last 30 Days";
    }
  };

  // Chart colors
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Sample data structure (will be replaced with real API data)
  const sampleUserActivity = [
    { time: '00:00', activeUsers: 45, queries: 120, responses: 118 },
    { time: '04:00', activeUsers: 32, queries: 89, responses: 85 },
    { time: '08:00', activeUsers: 78, queries: 234, responses: 228 },
    { time: '12:00', activeUsers: 95, queries: 312, responses: 305 },
    { time: '16:00', activeUsers: 87, queries: 278, responses: 271 },
    { time: '20:00', activeUsers: 62, queries: 189, responses: 184 },
  ];

  const sampleSystemMetrics = [
    { time: '00:00', cpu: 45, memory: 67, responseTime: 120 },
    { time: '04:00', cpu: 32, memory: 54, responseTime: 95 },
    { time: '08:00', cpu: 78, memory: 82, responseTime: 145 },
    { time: '12:00', cpu: 95, memory: 89, responseTime: 178 },
    { time: '16:00', cpu: 87, memory: 76, responseTime: 156 },
    { time: '20:00', cpu: 62, memory: 68, responseTime: 134 },
  ];

  const sampleQueryTypes = [
    { name: 'Customer Support', value: 35, queries: 1245 },
    { name: 'Sales Inquiry', value: 28, queries: 987 },
    { name: 'Product Questions', value: 22, queries: 789 },
    { name: 'Technical Support', value: 15, queries: 567 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-playfair text-gray-900 dark:text-white">
            Real-Time Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Live monitoring of user activity, system performance, and usage patterns
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isLiveMode ? 'Live Mode' : 'Paused'}
            </span>
          </div>
          
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLiveMode(!isLiveMode)}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>{isLiveMode ? 'Pause' : 'Resume'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllData}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Last updated indicator */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <Clock className="h-4 w-4" />
        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
      </div>

      {/* Live Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStats?.activeUsers || 127}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last hour
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queries/Minute</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStats?.queriesPerMinute || 23}</div>
              <p className="text-xs text-blue-600 flex items-center mt-1">
                <Activity className="h-3 w-3 mr-1" />
                Real-time rate
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics?.avgResponseTime || 1.2}s</div>
              <p className="text-xs text-yellow-600 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                -0.3s from yesterday
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Load</CardTitle>
              <Cpu className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics?.systemLoad || 67}%</div>
              <p className="text-xs text-purple-600 flex items-center mt-1">
                <Database className="h-3 w-3 mr-1" />
                Normal range
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span>User Activity - {getTimeRangeLabel(timeRange)}</span>
              </CardTitle>
              <CardDescription>
                Real-time monitoring of active users and query volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userActivity || sampleUserActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="activeUsers" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                      name="Active Users"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="queries" 
                      stackId="2"
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                      name="Queries"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Performance Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-purple-600" />
                <span>System Performance</span>
              </CardTitle>
              <CardDescription>
                CPU, memory usage, and response times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={systemMetrics || sampleSystemMetrics}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cpu" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="CPU %"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="memory" 
                      stroke="#06b6d4" 
                      strokeWidth={2}
                      name="Memory %"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Response Time (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Query Patterns and Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Types Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>Query Types Distribution</span>
              </CardTitle>
              <CardDescription>
                Breakdown of query categories in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={queryPatterns || sampleQueryTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(queryPatterns || sampleQueryTypes).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {(queryPatterns || sampleQueryTypes).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <Badge variant="secondary">{item.queries} queries</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Response Time Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Response Time Trends</span>
              </CardTitle>
              <CardDescription>
                Performance metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={responseTimeData || sampleSystemMetrics}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="responseTime" 
                      fill="#10b981" 
                      name="Response Time (ms)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {responseTimeData?.avgResponseTime || '1.2s'}
                  </div>
                  <div className="text-sm text-gray-500">Average</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {responseTimeData?.minResponseTime || '0.8s'}
                  </div>
                  <div className="text-sm text-gray-500">Fastest</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {responseTimeData?.maxResponseTime || '2.1s'}
                  </div>
                  <div className="text-sm text-gray-500">Slowest</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Live Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span>Live Activity Feed</span>
              <div className="ml-auto">
                <Badge variant={isLiveMode ? "default" : "secondary"} className="animate-pulse">
                  {isLiveMode ? 'LIVE' : 'PAUSED'}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Real-time stream of user interactions and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {/* This would be populated with real-time activity data */}
              <div className="flex items-center space-x-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="text-sm font-medium">New query processed</div>
                  <div className="text-xs text-gray-500">Customer support - Response time: 1.2s</div>
                </div>
                <div className="text-xs text-gray-400">Just now</div>
              </div>
              
              <div className="flex items-center space-x-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="text-sm font-medium">User logged in</div>
                  <div className="text-xs text-gray-500">Premium plan user from New York</div>
                </div>
                <div className="text-xs text-gray-400">2 min ago</div>
              </div>
              
              <div className="flex items-center space-x-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="text-sm font-medium">High response time detected</div>
                  <div className="text-xs text-gray-500">Query took 2.8s to process</div>
                </div>
                <div className="text-xs text-gray-400">5 min ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}