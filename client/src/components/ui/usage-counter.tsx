import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Zap, TrendingUp, Calendar, CalendarDays, Clock } from "lucide-react";

interface UsageCounterProps {
  used: number;
  limit: number;
  plan: string;
  weekTotal?: number;
  weeklyLimit?: number;
  monthTotal?: number;
  monthlyLimit?: number;
  weeklyGrowth?: number;
}

export function UsageCounter({ 
  used, 
  limit, 
  plan, 
  weekTotal = 0,
  weeklyLimit = -1,
  monthTotal = 0,
  monthlyLimit = -1,
  weeklyGrowth = 0
}: UsageCounterProps) {
  const percentage = limit === -1 ? 0 : (used / limit) * 100;
  const weeklyPercentage = weeklyLimit === -1 ? 0 : (weekTotal / weeklyLimit) * 100;
  const monthlyPercentage = monthlyLimit === -1 ? 0 : (monthTotal / monthlyLimit) * 100;
  
  const isNearLimit = percentage >= 80;
  const isAtLimit = limit !== -1 && used >= limit;
  const isUnlimited = limit === -1;

  const getPlanIcon = () => {
    switch (plan) {
      case "pro":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "starter":
        return <Zap className="w-4 h-4 text-blue-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
  };

  const getPlanColor = () => {
    switch (plan) {
      case "pro":
        return "bg-gradient-to-r from-yellow-500 to-amber-500";
      case "starter":
        return "bg-gradient-to-r from-blue-500 to-cyan-500";
      default:
        return "bg-gradient-to-r from-green-500 to-emerald-500";
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Usage Analytics
          </h3>
          {getPlanIcon()}
        </div>
        <Badge 
          variant="secondary" 
          className={`${getPlanColor()} text-white border-0`}
        >
          {plan.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {isUnlimited ? (
        <div className="text-center py-8">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Unlimited Usage</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            You have unlimited access to all features
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{used}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{weekTotal}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{monthTotal}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">This Month</div>
            </div>
          </div>
          {weeklyGrowth !== 0 && (
            <div className="mt-4 flex items-center justify-center space-x-1">
              <TrendingUp className={`w-4 h-4 ${weeklyGrowth > 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-medium ${weeklyGrowth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth}% vs last week
              </span>
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Daily</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Weekly</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center space-x-1">
              <CalendarDays className="w-4 h-4" />
              <span>Monthly</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <motion.span 
                className={`text-2xl font-bold ${
                  isAtLimit 
                    ? "text-red-600 dark:text-red-400" 
                    : isNearLimit 
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
                key={used}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {used}
              </motion.span>
              <span className="text-gray-600 dark:text-gray-400">
                of {limit} replies used today
              </span>
            </div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Progress 
                value={percentage} 
                className={`h-3 ${
                  isAtLimit 
                    ? "[&>div]:bg-red-500 dark:[&>div]:bg-red-400" 
                    : isNearLimit 
                    ? "[&>div]:bg-amber-500 dark:[&>div]:bg-amber-400"
                    : "[&>div]:bg-emerald-500 dark:[&>div]:bg-emerald-400"
                }`}
              />
            </motion.div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {limit - used} replies remaining today
              </span>
              <span className={`font-medium ${
                isAtLimit 
                  ? "text-red-600 dark:text-red-400" 
                  : isNearLimit 
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-green-600 dark:text-green-400"
              }`}>
                {percentage.toFixed(0)}% used
              </span>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <motion.span 
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                key={weekTotal}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {weekTotal}
              </motion.span>
              <span className="text-gray-600 dark:text-gray-400">
                of {weeklyLimit} replies used this week
              </span>
            </div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Progress 
                value={weeklyPercentage} 
                className="h-3 [&>div]:bg-blue-500 dark:[&>div]:bg-blue-400"
              />
            </motion.div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {weeklyLimit - weekTotal} replies remaining this week
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {weeklyPercentage.toFixed(0)}% used
              </span>
            </div>

            {weeklyGrowth !== 0 && (
              <div className="flex items-center space-x-1">
                <TrendingUp className={`w-4 h-4 ${weeklyGrowth > 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm font-medium ${weeklyGrowth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth}% vs last week
                </span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <motion.span 
                className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                key={monthTotal}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {monthTotal}
              </motion.span>
              <span className="text-gray-600 dark:text-gray-400">
                of {monthlyLimit} replies used this month
              </span>
            </div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Progress 
                value={monthlyPercentage} 
                className="h-3 [&>div]:bg-purple-500 dark:[&>div]:bg-purple-400"
              />
            </motion.div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {monthlyLimit - monthTotal} replies remaining this month
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {monthlyPercentage.toFixed(0)}% used
              </span>
            </div>
          </TabsContent>

          {isNearLimit && !isAtLimit && (
            <motion.div
              className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm text-amber-800 dark:text-amber-200">
                You're approaching your daily limit. Consider upgrading for unlimited access.
              </p>
            </motion.div>
          )}

          {isAtLimit && (
            <motion.div
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                Daily limit reached! Upgrade to continue generating responses.
              </p>
            </motion.div>
          )}
        </Tabs>
      )}
    </motion.div>
  );
}