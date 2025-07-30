import { motion } from "framer-motion";
import { Bot, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const linkVariants = {
    hover: { 
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  return (
    <motion.footer
      className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 mt-20"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <motion.div 
              className="flex items-center space-x-2 mb-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Savrii
              </span>
            </motion.div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md font-body">
              AI-powered customer support responses for coaches, consultants, and freelancers. 
              Generate professional replies instantly with intelligent prompts.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for better customer communication</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 font-heading">Navigation</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "Pricing", href: "/pricing" },
                { name: "Dashboard", href: "/dashboard" },
                { name: "About", href: "/about" },
              ].map((link) => (
                <motion.li key={link.name} variants={linkVariants} whileHover="hover">
                  <a
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 font-heading">Support</h3>
            <ul className="space-y-2">
              {[
                { name: "Contact", href: "/contact" },
                { name: "FAQ", href: "/faq" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
              ].map((link) => (
                <motion.li key={link.name} variants={linkVariants} whileHover="hover">
                  <a
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-gray-200 dark:border-slate-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm font-body">
            © {currentYear} Savrii. All rights reserved.
          </p>
          <div className="mt-4 sm:mt-0 flex space-x-6">
            <motion.a
              href="/privacy"
              className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
            >
              Privacy
            </motion.a>
            <motion.a
              href="/terms"
              className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
            >
              Terms
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}