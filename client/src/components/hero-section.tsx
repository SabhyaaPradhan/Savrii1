import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function HeroSection() {
  const { isAuthenticated } = useAuth();

  const handleCTAClick = () => {
    if (isAuthenticated) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/auth";
    }
  };

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            AI Assistant for{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Client Communication
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Empower coaches, consultants, and freelancers with AI-powered client replies. 
            Generate professional responses instantly with intelligent prompts.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={handleCTAClick}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 text-lg font-medium hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all shadow-lg"
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-8 py-4 text-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Watch Demo
            </Button>
          </motion.div>
        </div>

        {/* Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden max-w-4xl mx-auto">
            <div className="bg-gray-50 dark:bg-slate-700 px-6 py-4 border-b border-gray-200 dark:border-slate-600">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Savrii Dashboard</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Client Message */}
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Hi, I'm running behind on the project deliverables. Can we discuss extending the timeline?
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Client Message</span>
                </div>
              </div>
              {/* AI Generated Reply */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs">
                  <p className="text-sm">
                    Thank you for reaching out! I understand these things happen. Let's schedule a quick call tomorrow to discuss a revised timeline that works for both of us. I'm committed to delivering quality work.
                  </p>
                  <span className="text-xs text-green-100 mt-1 block">✨ AI Generated</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
