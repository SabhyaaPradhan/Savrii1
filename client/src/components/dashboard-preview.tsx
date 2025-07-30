import { motion } from "framer-motion";
import { Leaf, MessageCircle } from "lucide-react";

export function DashboardPreview() {
  return (
    <section id="dashboard-preview" className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Intuitive Dashboard</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A clean, professional interface designed for productivity
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Dashboard Header */}
          <div className="bg-gray-50 dark:bg-slate-700 px-6 py-4 border-b border-gray-200 dark:border-slate-600 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center">
                  <Leaf className="text-white w-4 h-4" />
                </div>
                <span className="font-semibold">Savrii Dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Responses today:</span>
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded text-sm font-medium">
                  23/50
                </span>
              </div>
            </div>
            {/* User profile area */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <span className="text-sm font-medium hidden sm:block">John Doe</span>
            </div>
          </div>

          <div className="flex h-96">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 dark:bg-slate-700 border-r border-gray-200 dark:border-slate-600 p-4 hidden md:block">
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  New Conversation
                </button>
                <div className="pt-4">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Recent Clients
                  </h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">AC</span>
                      </div>
                      <span className="text-sm">Alice Cooper</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">BS</span>
                      </div>
                      <span className="text-sm">Bob Smith</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {/* Paste client message area */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Paste Client Message</h4>
                  <div className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 text-sm">
                    Hi, I need to reschedule our meeting tomorrow. Something urgent came up. Are you available Friday instead?
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <select className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm">
                      <option>Professional tone</option>
                      <option>Friendly tone</option>
                      <option>Casual tone</option>
                    </select>
                    <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-600 transition-colors">
                      Generate Reply
                    </button>
                  </div>
                </div>

                {/* AI Generated Response */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-indigo-800 dark:text-indigo-300">✨ AI Generated Response</h4>
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                        <i className="fas fa-copy text-sm"></i>
                      </button>
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                        <i className="fas fa-edit text-sm"></i>
                      </button>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-sm">
                    No problem at all! Friday works perfectly for me. I completely understand that urgent matters come up. 
                    Let's reschedule for Friday at the same time. Looking forward to our meeting!
                  </div>
                  <div className="mt-3 flex justify-between">
                    <span className="text-xs text-indigo-600 dark:text-indigo-400">Response generated in 0.8s</span>
                    <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors">
                      Send Response
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
