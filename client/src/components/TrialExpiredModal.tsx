import { AlertTriangle, Crown, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@shared/plans";

interface TrialExpiredModalProps {
  isOpen: boolean;
  onUpgrade: () => void;
}

export function TrialExpiredModal({ isOpen, onUpgrade }: TrialExpiredModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <DialogTitle className="font-heading text-xl">
              Free Trial Expired
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your 14-day free trial has ended. Upgrade to continue using Savrii's powerful AI response generation.
            </p>
          </div>

          <div className="grid gap-4">
            {/* Pro Plan */}
            <div className="border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-semibold font-heading text-emerald-900 dark:text-emerald-100">
                    {PLANS.pro.name}
                  </h3>
                </div>
                <Badge className="bg-emerald-600 text-white">Most Popular</Badge>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  ${PLANS.pro.price}
                </span>
                <span className="text-sm text-emerald-600 dark:text-emerald-400">/month</span>
              </div>
              <div className="space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
                {PLANS.pro.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold font-heading">
                    {PLANS.enterprise.name}
                  </h3>
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold">
                  ${PLANS.enterprise.price}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {PLANS.enterprise.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button 
              onClick={onUpgrade}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3"
            >
              Choose Your Plan
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Secure payment processing with Stripe
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}