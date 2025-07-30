import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  TrendingUp, 
  Check, 
  AlertTriangle,
  Sparkles,
  Shield,
  Zap,
  Globe
} from "lucide-react";
import { PLANS, getPlanFeatures, getDaysLeftInTrial, isTrialExpired } from "@shared/plans";
import { Link } from "wouter";
import { useCurrency } from "@/hooks/useCurrency";

interface BillingStats {
  currentPlan: string;
  planStartDate: string;
  trialEnd?: string | null;
  nextBillingDate?: string;
  monthlyUsage: number;
  totalQueries: number;
  accountAge: string;
}

export default function Billing() {
  const { user } = useAuth();
  const { currency, isLoading: currencyLoading, formatPrice, setCurrencyManually, availableCurrencies } = useCurrency();

  const { data: billingStats, isLoading } = useQuery<BillingStats>({
    queryKey: ["/api/billing/stats"],
    enabled: !!user,
  });

  if (isLoading || !user || !billingStats) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const currentPlan = getPlanFeatures(user?.plan || "starter");
  const daysLeft = getDaysLeftInTrial(user || { plan: "starter", trialEnd: null });
  const trialExpired = isTrialExpired(user || { plan: "starter", trialEnd: null });

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">
          Billing & Plans
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your subscription and billing preferences
        </p>
        
        {/* Currency Selector */}
        <div className="flex items-center gap-4 pt-4">
          <Globe className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Currency:</span>
          <Select
            value={currency.code}
            onValueChange={setCurrencyManually}
            disabled={currencyLoading}
          >
            <SelectTrigger className="w-32 bg-white dark:bg-slate-800">
              <SelectValue>
                {currencyLoading ? "Loading..." : `${currency.symbol} ${currency.code}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Trial Alert */}
      {user?.plan === "starter" && !trialExpired && daysLeft > 0 && (
        <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
          <AlertTriangle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-200">
            You have {daysLeft} days left in your free trial. 
            <Link href="/pricing" className="font-medium underline ml-1">
              Upgrade now to continue using all features
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Expired Trial Alert */}
      {trialExpired && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            Your free trial has expired. 
            <Link href="/pricing" className="font-medium underline ml-1">
              Upgrade to continue using Savrii
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-emerald-600" />
                  Current Plan
                </CardTitle>
                <Badge 
                  variant={user?.plan === "starter" ? "secondary" : "default"}
                  className="text-xs px-2 py-1"
                >
                  {currentPlan.name}
                </Badge>
              </div>
              <CardDescription>
                Your active subscription details
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Plan</span>
                  <span className="font-medium">{currentPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
                  <span className="font-medium">
                    {currencyLoading ? "..." : formatPrice(currentPlan.price)}/{currentPlan.interval}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Started</span>
                  <span className="font-medium">{billingStats.planStartDate}</span>
                </div>
                {billingStats.nextBillingDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Next billing</span>
                    <span className="font-medium">{billingStats.nextBillingDate}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-3">
                <h4 className="font-medium text-sm">Plan Features</h4>
                <div className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Link href="/pricing">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    {user?.plan === "starter" ? "Upgrade Plan" : "Change Plan"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Usage Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Monthly Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Usage Overview
              </CardTitle>
              <CardDescription>
                Your activity this month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Queries this month</span>
                  <span className="font-medium">{billingStats.monthlyUsage.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total queries</span>
                  <span className="font-medium">{billingStats.totalQueries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Account age</span>
                  <span className="font-medium">{billingStats.accountAge}</span>
                </div>
              </div>

              {/* Plan Limits - Only show for Starter plan */}
              {user?.plan === "starter" && (
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily limit</span>
                    <span>50 queries/day</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Pro and Enterprise plans have unlimited queries
                  </div>
                </div>
              )}

              {user?.plan !== "starter" && (
                <div className="pt-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">Unlimited queries</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/pricing">
                <Button variant="outline" className="w-full justify-start">
                  <Sparkles className="h-4 w-4 mr-2" />
                  View All Plans
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Shield className="h-4 w-4 mr-2" />
                Billing History
                <Badge variant="secondary" className="ml-auto text-xs">Coming Soon</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Calendar className="h-4 w-4 mr-2" />
                Payment Methods
                <Badge variant="secondary" className="ml-auto text-xs">Coming Soon</Badge>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Plan Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Compare Plans</CardTitle>
            <CardDescription>
              Choose the plan that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(PLANS).map(([planKey, plan]) => (
                <div
                  key={planKey}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    user?.plan === planKey
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <div className="text-2xl font-bold text-emerald-600">
                      {currencyLoading ? "..." : formatPrice(plan.price)}
                      <span className="text-sm text-gray-500">/{plan.interval}</span>
                    </div>
                    {plan.trialDays && (
                      <div className="text-xs text-gray-500 mt-1">
                        {plan.trialDays} day free trial
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{plan.features.length - 3} more features
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    {user?.plan === planKey ? (
                      <Badge className="w-full justify-center">Current Plan</Badge>
                    ) : (
                      <Link href="/pricing">
                        <Button 
                          variant={planKey === "pro" ? "default" : "outline"}
                          className="w-full"
                          size="sm"
                        >
                          {user?.plan === "starter" ? "Upgrade" : "Switch"}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}