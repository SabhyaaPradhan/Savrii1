import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Zap, TrendingUp, X } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const handleViewPricing = () => {
    window.location.href = "/pricing";
  };

  const handleUpgradePlan = () => {
    // Direct to pricing with starter plan highlighted
    window.location.href = "/pricing#starter";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Daily Limit Reached
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  You've reached your daily limit of 50 replies. Upgrade your plan to continue using the service without interruptions.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6">
                {/* Limit Reached Banner */}
                <motion.div
                  className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Free Trial Limit: 50/50</h3>
                      <p className="text-sm opacity-90">Reset in 24 hours or upgrade now</p>
                    </div>
                  </div>
                </motion.div>

                {/* Upgrade Options */}
                <div className="space-y-4">
                  <motion.div
                    className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:border-green-300 dark:hover:border-green-600 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">Starter Plan</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Unlimited responses • $9.99/month</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:border-yellow-300 dark:hover:border-yellow-600 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">Pro Plan</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Everything + Advanced features • $19.99/month</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-3 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={handleUpgradePlan}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  <Button
                    onClick={handleViewPricing}
                    variant="outline"
                    className="flex-1"
                  >
                    View Pricing
                  </Button>
                </motion.div>

                {/* Additional Info */}
                <motion.p
                  className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Your free trial resets every 24 hours. Upgrade for unlimited access and advanced features.
                </motion.p>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}