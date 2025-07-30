import { useAuth } from "@/hooks/useAuth";
import { canAccessFeature, isTrialExpired, getUpgradeTarget, getPlanFeatures } from "@shared/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, Zap, Star, Building } from "lucide-react";
import { useLocation } from "wouter";

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showPreview?: boolean;
  title?: string;
  description?: string;
  variant?: 'card' | 'overlay' | 'disabled';
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  showPreview = true,
  title,
  description,
  variant = 'card'
}: FeatureGateProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return null;
  }

  const hasAccess = canAccessFeature(user, feature);
  const trialExpired = isTrialExpired(user);
  const upgradeTarget = getUpgradeTarget(user.plan, feature);
  const targetPlan = getPlanFeatures(upgradeTarget);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getUpgradeIcon = () => {
    switch (upgradeTarget) {
      case 'pro': return <Zap className="w-4 h-4" />;
      case 'enterprise': return <Building className="w-4 h-4" />;
      default: return <Crown className="w-4 h-4" />;
    }
  };

  const getUpgradeColor = () => {
    switch (upgradeTarget) {
      case 'pro': return 'bg-blue-600 hover:bg-blue-700';
      case 'enterprise': return 'bg-purple-600 hover:bg-purple-700';
      default: return 'bg-emerald-600 hover:bg-emerald-700';
    }
  };

  // Overlay variant - adds blur and lock overlay to existing content
  if (variant === 'overlay') {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-gray-900/60 dark:to-gray-800/60 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border max-w-sm text-center">
            <div className="flex justify-center mb-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Lock className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {title || 'Premium Feature'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {description || (trialExpired 
                ? "Your trial has expired. Upgrade to access this feature."
                : `This feature requires ${targetPlan.name} plan.`
              )}
            </p>
            <Button 
              onClick={() => setLocation("/billing")}
              className={`w-full ${getUpgradeColor()} text-white`}
              size="sm"
            >
              {getUpgradeIcon()}
              <span className="ml-2">Upgrade to {targetPlan.name}</span>
            </Button>
          </div>
        </div>
        <div className={showPreview ? "opacity-30 pointer-events-none" : "hidden"}>
          {children}
        </div>
      </div>
    );
  }

  // Disabled variant - dims content and prevents interaction
  if (variant === 'disabled') {
    return (
      <div className="relative">
        <div className="opacity-40 pointer-events-none">
          {children}
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700">
            <Lock className="w-3 h-3 mr-1" />
            {targetPlan.name}
          </Badge>
        </div>
      </div>
    );
  }

  // Card variant - default locked state UI
  return (
    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className={`p-3 rounded-full ${
            upgradeTarget === 'pro' 
              ? 'bg-blue-100 dark:bg-blue-900/20' 
              : upgradeTarget === 'enterprise'
              ? 'bg-purple-100 dark:bg-purple-900/20'
              : 'bg-emerald-100 dark:bg-emerald-900/20'
          }`}>
            {getUpgradeIcon()}
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          {title || `${targetPlan.name} Feature`}
        </CardTitle>
        <CardDescription className="text-center">
          {description || (trialExpired 
            ? "Your trial has expired. Upgrade to unlock this feature."
            : `Unlock this feature with ${targetPlan.name} plan starting at $${targetPlan.price}/${targetPlan.interval}.`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button 
          onClick={() => setLocation("/billing")}
          className={`w-full ${getUpgradeColor()} text-white`}
        >
          {getUpgradeIcon()}
          <span className="ml-2">Upgrade to {targetPlan.name}</span>
        </Button>
        {showPreview && (
          <div className="mt-4 opacity-40 pointer-events-none border-t pt-4">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}