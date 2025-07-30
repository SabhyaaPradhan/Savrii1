import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Target, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ConfidenceMetrics {
  overall: number;
  accuracy: number;
  consistency: number;
  improvement: number;
}

interface AIConfidencePanelProps {
  className?: string;
}

export function AIConfidencePanel({ className }: AIConfidencePanelProps) {
  // Fetch real confidence metrics from API
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/analytics/confidence"],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000,
  });

  // Use real data or show empty state for new users
  const displayMetrics = metrics || { overall: 0.0, accuracy: 0.0, consistency: 0.0, improvement: 0.0, totalResponses: 0 };
  const hasData = metrics && metrics.totalResponses > 0;
  
  const getConfidenceLevel = (score: number) => {
    if (score >= 0.9) return { label: "Excellent", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/20" };
    if (score >= 0.8) return { label: "Good", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/20" };
    if (score >= 0.7) return { label: "Fair", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/20" };
    return { label: "Needs Work", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/20" };
  };

  const overallLevel = getConfidenceLevel(displayMetrics.overall);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading">
          <Brain className="w-5 h-5 text-green-600" />
          AI Confidence Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative inline-flex items-center justify-center w-24 h-24 mx-auto mb-4"
          >
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-slate-700"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className="text-green-600"
                strokeDasharray={`${2 * Math.PI * 45}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - displayMetrics.overall) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                {(displayMetrics.overall * 100).toFixed(0)}%
              </span>
            </div>
          </motion.div>
          
          <Badge className={`${overallLevel.color} ${overallLevel.bg} border-0 font-body`}>
            {overallLevel.label}
          </Badge>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20"
          >
            <Target className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 font-body">
              Accuracy
            </p>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 font-heading">
              {(displayMetrics.accuracy * 100).toFixed(0)}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20"
          >
            <Award className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-sm font-medium text-green-900 dark:text-green-100 font-body">
              Consistency
            </p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300 font-heading">
              {(displayMetrics.consistency * 100).toFixed(0)}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20"
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-amber-600" />
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 font-body">
              Growth
            </p>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-300 font-heading">
              {displayMetrics.improvement >= 0 ? '+' : ''}{(displayMetrics.improvement * 100).toFixed(0)}%
            </p>
          </motion.div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400 font-body">Response Quality</span>
              <span className="text-gray-900 dark:text-white font-body">{(displayMetrics.accuracy * 100).toFixed(0)}%</span>
            </div>
            <Progress value={displayMetrics.accuracy * 100} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400 font-body">Brand Consistency</span>
              <span className="text-gray-900 dark:text-white font-body">{(displayMetrics.consistency * 100).toFixed(0)}%</span>
            </div>
            <Progress value={displayMetrics.consistency * 100} className="h-2" />
          </div>
        </div>

        {/* Tips and Status */}
        <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
          {hasData ? (
            <p className="text-xs text-gray-600 dark:text-gray-400 font-body">
              💡 <strong>Tip:</strong> Your AI confidence improves with more responses and consistent feedback. 
              Try our Tone Training feature to boost performance!
            </p>
          ) : (
            <p className="text-xs text-gray-600 dark:text-gray-400 font-body">
              📊 <strong>Getting Started:</strong> Generate some AI responses to see your confidence metrics. 
              Your performance data will appear here as you use the system.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}