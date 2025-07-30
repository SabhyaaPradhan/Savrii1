import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, Crown, AlertTriangle } from "lucide-react";

interface UsageTrackerProps {
  onUpgradeClick?: () => void;
}

export function UsageTracker({ onUpgradeClick }: UsageTrackerProps) {
  const { data: usageStats, isLoading } = useQuery<{
    used: number;
    limit: number;
    plan: string;
    weekTotal: number;
    weeklyLimit: number;
    monthTotal: number;
    monthlyLimit: number;
    weeklyGrowth: number;
    totalResponses: number;
    trialDaysLeft: number | null;
    avgConfidence: number;
    highQualityCount: number;
    lowQualityCount: number;
    avgGenerationTime: number;
    fastestTime: number;
    successRate: number;
    streak?: number;
    weeklyUsage?: number[];
    trialEnd?: string;
    daysLeft?: number;
    currentTrialDay?: number;
    trialStartDate?: string;
  }>({
    queryKey: ["/api/usage/stats"],
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isUnlimited = usageStats?.limit === -1;
  const usagePercentage = isUnlimited ? 0 : ((usageStats?.used || 0) / (usageStats?.limit || 1)) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isOverLimit = usagePercentage >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main Usage Card */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between font-heading">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Daily Usage
            </div>
            {usageStats?.plan === "starter" && usageStats?.currentTrialDay !== undefined && (
              <Badge 
                variant={usageStats.daysLeft && usageStats.daysLeft > 3 ? "secondary" : "destructive"} 
                className="flex items-center gap-1"
              >
                {usageStats.daysLeft && usageStats.daysLeft > 0 ? (
                  <>📅 Day {usageStats.currentTrialDay} of 14-day trial</>
                ) : (
                  <>⚠️ Trial expired</>
                )}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                {usageStats?.used || 0}
                {!isUnlimited && (
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    /{usageStats?.limit}
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-body">
                {isUnlimited ? "Unlimited queries" : "Queries used today"}
              </p>
            </div>
            {isUnlimited && (
              <Crown className="w-8 h-8 text-yellow-500" />
            )}
          </div>

          {!isUnlimited && (
            <>
              <Progress 
                value={usagePercentage} 
                className={`h-3 ${
                  isOverLimit ? "bg-red-100 dark:bg-red-900/20" : 
                  isNearLimit ? "bg-yellow-100 dark:bg-yellow-900/20" : ""
                }`}
              />
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-body">
                  {Math.round(usagePercentage)}% used
                </span>
                <span className="text-gray-600 dark:text-gray-400 font-body">
                  {(usageStats?.limit || 0) - (usageStats?.used || 0)} remaining
                </span>
              </div>
            </>
          )}

          {/* Alert for near/over limit */}
          {(isNearLimit || isOverLimit) && !isUnlimited && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-3 rounded-lg flex items-center gap-2 ${
                isOverLimit 
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300" 
                  : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium font-body">
                {isOverLimit 
                  ? "Daily limit reached! Upgrade to Pro for unlimited queries."
                  : "You're close to your daily limit. Consider upgrading to Pro."}
              </span>
            </motion.div>
          )}

          {/* Upgrade Button */}
          {!isUnlimited && (isNearLimit || isOverLimit) && (
            <Button 
              onClick={onUpgradeClick}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Upgrade Plan
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Weekly & Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Usage */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between font-heading">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Weekly Usage
              </div>
              {usageStats?.weeklyGrowth !== 0 && (
                <Badge 
                  variant={usageStats?.weeklyGrowth && usageStats.weeklyGrowth > 0 ? "default" : "secondary"}
                  className={`${
                    usageStats?.weeklyGrowth && usageStats.weeklyGrowth > 0 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  }`}
                >
                  {usageStats?.weeklyGrowth && usageStats.weeklyGrowth > 0 ? "+" : ""}{usageStats?.weeklyGrowth}%
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-heading">
                  {usageStats?.weekTotal || 0}
                  {usageStats?.weeklyLimit !== -1 && (
                    <span className="text-lg text-gray-500 dark:text-gray-400">
                      /{usageStats?.weeklyLimit}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-body">
                  {usageStats?.weeklyLimit === -1 ? "Unlimited this week" : "Queries this week"}
                </p>
              </div>
            </div>

            {usageStats?.weeklyLimit !== -1 && (
              <>
                <Progress 
                  value={usageStats?.weeklyLimit ? (usageStats.weekTotal / usageStats.weeklyLimit) * 100 : 0} 
                  className="h-3 [&>div]:bg-blue-500"
                />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-body">
                    {Math.round(usageStats?.weeklyLimit ? (usageStats.weekTotal / usageStats.weeklyLimit) * 100 : 0)}% used
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 font-body">
                    {(usageStats?.weeklyLimit || 0) - (usageStats?.weekTotal || 0)} remaining
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Monthly Usage */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-heading">
              <Crown className="w-5 h-5 text-purple-600" />
              Monthly Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-heading">
                  {usageStats?.monthTotal || 0}
                  {usageStats?.monthlyLimit !== -1 && (
                    <span className="text-lg text-gray-500 dark:text-gray-400">
                      /{usageStats?.monthlyLimit}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-body">
                  {usageStats?.monthlyLimit === -1 ? "Unlimited this month" : "Queries this month"}
                </p>
              </div>
            </div>

            {usageStats?.monthlyLimit !== -1 && (
              <>
                <Progress 
                  value={usageStats?.monthlyLimit ? (usageStats.monthTotal / usageStats.monthlyLimit) * 100 : 0} 
                  className="h-3 [&>div]:bg-purple-500"
                />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-body">
                    {Math.round(usageStats?.monthlyLimit ? (usageStats.monthTotal / usageStats.monthlyLimit) * 100 : 0)}% used
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 font-body">
                    {(usageStats?.monthlyLimit || 0) - (usageStats?.monthTotal || 0)} remaining
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart - if weeklyUsage data exists */}
      {usageStats?.weeklyUsage && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-heading">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Daily Progress (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-16 space-x-1">
              {usageStats.weeklyUsage.map((usage, index) => {
                const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const maxUsage = Math.max(...usageStats.weeklyUsage!);
                const height = maxUsage > 0 ? (usage / maxUsage) * 100 : 0;
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <motion.div
                      className="w-full bg-green-500 rounded-t min-h-[4px]"
                      style={{ height: `${height}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.1 }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-body">
                      {dayLabels[index]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}