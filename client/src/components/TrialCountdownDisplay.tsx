import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, Zap, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface TrialCountdownDisplayProps {
  userId: string;
}

export function TrialCountdownDisplay({ userId }: TrialCountdownDisplayProps) {
  const [, setLocation] = useLocation();
  
  const { data: usageStats, isLoading } = useQuery<{
    used: number;
    limit: number;
    plan: string;
    trialEnd?: string;
    daysLeft?: number;
    currentTrialDay?: number;
    trialStartDate?: string;
  }>({
    queryKey: ["/api/usage/stats"],
    refetchInterval: 60000, // Refresh every minute to catch midnight rollover
  });

  if (isLoading || !usageStats) {
    return (
      <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Loading trial information...
        </div>
      </div>
    );
  }

  // Only show trial counter for starter plan users
  if (usageStats.plan !== 'starter') {
    return null;
  }

  const daysLeft = usageStats.daysLeft ?? 14; // Default to 14 if undefined
  const currentTrialDay = usageStats.currentTrialDay ?? 1; // Current day of trial (1-14)
  const totalTrialDays = 14;
  const progressPercentage = ((currentTrialDay - 1) / totalTrialDays) * 100;
  
  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft <= 3 && daysLeft > 0;
  const isWarning = daysLeft <= 7 && daysLeft > 3;

  if (isExpired) {
    return (
      <motion.div 
        className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-xs font-bold text-red-700 dark:text-red-300">
            Trial Expired
          </span>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 mb-2">
          Your 14-day free trial has ended. Upgrade to continue using Savrii.
        </p>
        <Button 
          size="sm" 
          onClick={() => setLocation("/billing")}
          className="w-full h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
        >
          Upgrade Now
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`mt-3 p-3 rounded-lg border ${
        isUrgent 
          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
          : isWarning
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${
            isUrgent ? "text-amber-600" : isWarning ? "text-blue-600" : "text-emerald-600"
          }`} />
          <span className={`text-xs font-bold ${
            isUrgent ? "text-amber-700 dark:text-amber-300" 
            : isWarning ? "text-blue-700 dark:text-blue-300"
            : "text-emerald-700 dark:text-emerald-300"
          }`}>
            Free Trial
          </span>
        </div>
        <span className={`text-xs font-bold ${
          isUrgent ? "text-amber-600" : isWarning ? "text-blue-600" : "text-emerald-600"
        }`}>
          {daysLeft} days left
        </span>
      </div>

      <Progress 
        value={progressPercentage} 
        className={`h-2 mb-2 ${
          isUrgent ? "bg-amber-100 dark:bg-amber-900/40" 
          : isWarning ? "bg-blue-100 dark:bg-blue-900/40"
          : "bg-emerald-100 dark:bg-emerald-900/40"
        }`}
      />

      <div className="flex items-center justify-between text-xs mb-2">
        <span className={`${
          isUrgent ? "text-amber-600 dark:text-amber-400" 
          : isWarning ? "text-blue-600 dark:text-blue-400"
          : "text-emerald-600 dark:text-emerald-400"
        }`}>
          Day {currentTrialDay} of {totalTrialDays}
        </span>
        <div className="flex items-center gap-1">
          <Zap className={`w-3 h-3 ${
            isUrgent ? "text-amber-500" : isWarning ? "text-blue-500" : "text-emerald-500"
          }`} />
          <span className={`${
            isUrgent ? "text-amber-600 dark:text-amber-400" 
            : isWarning ? "text-blue-600 dark:text-blue-400"
            : "text-emerald-600 dark:text-emerald-400"
          }`}>
            {usageStats.used}/{usageStats.limit} queries today
          </span>
        </div>
      </div>

      {(isUrgent || isWarning) && (
        <Button 
          size="sm" 
          onClick={() => setLocation("/billing")}
          className={`w-full h-7 text-xs ${
            isUrgent 
              ? "bg-amber-600 hover:bg-amber-700" 
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          Upgrade for Unlimited
        </Button>
      )}
    </motion.div>
  );
}