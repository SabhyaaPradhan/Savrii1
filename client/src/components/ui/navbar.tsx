import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      window.location.href = "/api/logout";
    } else {
      window.location.href = "/api/login";
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg"
          : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
      } border-b border-gray-200 dark:border-slate-700`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Savrii
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              <a
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                Home
              </a>
              <a
                href="/pricing"
                className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                Pricing
              </a>
              <a
                href="/contact"
                className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                Contact
              </a>
              <a
                href="/faq"
                className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                FAQ
              </a>
            </div>
          </motion.div>

          {/* Right side actions */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {/* Theme toggle */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300"
              >
                <motion.div
                  initial={false}
                  animate={{ 
                    rotate: theme === "dark" ? 180 : 0,
                    scale: theme === "dark" ? 1.1 : 1
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  )}
                </motion.div>
              </Button>
            </motion.div>

            {/* Auth buttons */}
            {!isLoading && (
              <>
                {!isAuthenticated && (
                  <Button
                    variant="ghost"
                    onClick={() => window.location.href = "/auth"}
                    className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Sign In
                  </Button>
                )}
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => window.location.href = "/dashboard"}
                      variant="ghost"
                      className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                    >
                      Dashboard
                    </Button>
                    <Button
                      onClick={() => window.location.href = "/api/logout"}
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => window.location.href = "/auth"}
                    className="bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 transform hover:scale-105 transition-all"
                  >
                    Get Started
                  </Button>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </Button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700"
            >
              <div className="px-4 py-4 space-y-3">
                <a
                  href="/"
                  className="block text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="/pricing"
                  className="block text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <a
                  href="/contact"
                  className="block text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </a>
                <a
                  href="#features"
                  className="block text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                {!isAuthenticated && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      window.location.href = "/auth";
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
