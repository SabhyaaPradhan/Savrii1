import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  LayoutDashboard, 
  FileText, 
  Wand2, 
  BarChart3, 
  Settings, 
  CreditCard, 
  MessageCircle,
  Menu,
  X,
  Leaf,
  ChevronRight,
  User,
  LogOut,
  Sun,
  Moon,
  Crown,
  Lock,
  Bot,
  Zap,
  Palette,
  BookOpen,
  Users,
  Target,
  Download,
  TrendingUp,
  Code,
  Workflow,
  Upload,
  Shield,
  Paintbrush,
  Webhook,
  HelpCircle
} from "lucide-react";
import { getPlanFeatures, canAccessFeature, getDaysLeftInTrial, isTrialExpired } from "@shared/plans";
import { TrialCountdownDisplay } from "@/components/TrialCountdownDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const userPlan = (user as any)?.plan || 'starter';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Core sections available to all users
  const coreNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, feature: null },
    { name: "Inbox", href: "/inbox", icon: MessageCircle, feature: null, description: "AI-assisted customer replies" },
    { name: "Chat / AI Assistant", href: "/chat", icon: Bot, feature: null },
    { name: "Analytics", href: "/analytics", icon: BarChart3, feature: null, description: "Basic analytics" },
    { name: "Integrations", href: "/integrations", icon: Zap, feature: null, description: "1 integration for Starter" },
    { name: "Billing", href: "/billing", icon: CreditCard, feature: null },
    { name: "Settings", href: "/settings", icon: Settings, feature: null },
    { name: "FAQ / Support", href: "/support", icon: HelpCircle, feature: null },
  ];

  // Pro and Enterprise features
  const proNavigation = [
    { name: "Custom Prompts", href: "/prompts", icon: Wand2, feature: "prompt_builder", planRequired: "pro" },
    { name: "Brand Voice Training", href: "/brand-voice", icon: Palette, feature: "brand_voice_training", planRequired: "pro" },
    { name: "Prompt Library", href: "/prompt-library", icon: BookOpen, feature: "prompt_templates", planRequired: "pro" },
    { name: "Daily Summary", href: "/daily-summary", icon: FileText, feature: "daily_reports", planRequired: "pro" },
    { name: "Collaboration Tools", href: "/collaboration", icon: Users, feature: "team_collaboration", planRequired: "pro" },
    { name: "Lead Capture", href: "/lead-capture", icon: Target, feature: "lead_capture", planRequired: "pro" },
    { name: "Export Conversations", href: "/export", icon: Download, feature: "export_data", planRequired: "pro" },
  ];

  // Enterprise-only features
  const enterpriseNavigation = [
    { name: "Real-Time Analytics", href: "/real-time-analytics", icon: TrendingUp, feature: "real_time_analytics", planRequired: "enterprise" },
    { name: "Workflow Builder", href: "/workflow-builder", icon: Workflow, feature: "workflow_automation", planRequired: "enterprise" },
    { name: "Custom AI Model", href: "/custom-model", icon: Upload, feature: "custom_ai_model", planRequired: "enterprise" },
    { name: "Security & Compliance", href: "/security", icon: Shield, feature: "security_compliance", planRequired: "enterprise" },
    { name: "White-label Settings", href: "/white-label", icon: Paintbrush, feature: "white_label", planRequired: "enterprise" },
    { name: "Webhooks & Zapier", href: "/webhooks", icon: Webhook, feature: "webhooks", planRequired: "enterprise" },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  const handleNavigation = (href: string, hasAccess: boolean) => {
    if (hasAccess) {
      setLocation(href);
      if (isMobile) {
        setIsOpen(false);
      }
    } else {
      // Navigate to billing page for upgrade
      setLocation('/billing');
      if (isMobile) {
        setIsOpen(false);
      }
    }
  };

  const getNavigationSections = () => {
    const sections = [
      { title: "Core Features", items: coreNavigation },
      { title: "Pro Features", items: proNavigation },
      { title: "Enterprise Features", items: enterpriseNavigation }
    ];

    return sections.filter(section => {
      if (section.title === "Pro Features" && userPlan === 'starter') return true; // Show locked
      if (section.title === "Enterprise Features" && (userPlan === 'starter' || userPlan === 'pro')) return true; // Show locked
      return true;
    });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-1 bg-gray-50 dark:bg-slate-900">
      {/* Mobile Menu Button */}
      <motion.button
        className="md:hidden fixed top-20 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed left-0 top-0 z-40 h-full ${isCollapsed && !isMobile ? 'w-16' : 'w-64'} bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shadow-lg transition-all duration-300 ${
          isMobile ? "md:relative mt-16" : "md:relative"
        }`}
        variants={sidebarVariants}
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : "closed"}
        style={{ paddingTop: isMobile ? '0' : '4rem' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Brand */}
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {(!isCollapsed || isMobile) ? (
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white font-poppins">
                      Savrii
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Smart Response Platform
                    </p>
                  </div>
                ) : null}
              </div>
              {!isMobile ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-2"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              ) : null}
            </div>
          </div>

          {/* Current Plan Indicator */}
          {user && (!isCollapsed || isMobile) && (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Plan
                  </span>
                </div>
                <Badge 
                  variant={(user as any)?.plan === "starter" ? "secondary" : "default"}
                  className="text-xs"
                >
                  {getPlanFeatures((user as any)?.plan || 'starter').name}
                </Badge>
              </div>
              
              {/* Enhanced Trial Counter for Starter Plan */}
              {((user as any)?.plan === "starter" || (user as any)?.plan === "free_trial") && (
                <TrialCountdownDisplay userId={(user as any)?.id || 'unknown'} />
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {getNavigationSections().map((section) => (
              <div key={section.title}>
                {(!isCollapsed || isMobile) && (
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location === item.href || 
                      (item.href === "/dashboard" && location === "/");
                    const Icon = item.icon;
                    
                    // Check feature access
                    const hasAccess = item.feature ? canAccessFeature(user, item.feature) : true;
                    const isLocked = (item as any).planRequired && (
                      ((item as any).planRequired === "pro" && userPlan === "starter") ||
                      ((item as any).planRequired === "enterprise" && (userPlan === "starter" || userPlan === "pro"))
                    );

                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.href, hasAccess && !isLocked)}
                        className={`w-full flex items-center ${isCollapsed && !isMobile ? 'justify-center px-3 py-3' : 'justify-between px-3 py-2.5'} rounded-lg text-left transition-colors group ${
                          isActive
                            ? "bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                            : isLocked
                            ? "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-750"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                        }`}
                        title={isCollapsed && !isMobile ? item.name : undefined}
                      >
                        <div className={`flex items-center ${isCollapsed && !isMobile ? '' : 'space-x-3'}`}>
                          <Icon className={`w-5 h-5 ${
                            isActive 
                              ? "text-green-600 dark:text-green-400" 
                              : isLocked
                              ? "text-gray-400 dark:text-gray-500"
                              : "text-gray-500 dark:text-gray-400"
                          }`} />
                          {(!isCollapsed || isMobile) && (
                            <>
                              <span className="font-medium">{item.name}</span>
                              {isLocked && (
                                <Lock className="w-3 h-3 text-gray-400" />
                              )}
                            </>
                          )}
                        </div>
                        {(!isCollapsed || isMobile) && !isLocked && (
                          <ChevronRight className={`w-4 h-4 transition-transform ${
                            isActive ? "rotate-90" : "group-hover:translate-x-1"
                          }`} />
                        )}
                        {isCollapsed && !isMobile && isLocked && (
                          <Lock className="w-3 h-3 text-gray-400 absolute top-1 right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className={`flex items-center ${isCollapsed && !isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`p-2 ${isCollapsed && !isMobile ? 'w-10 h-10' : 'w-full justify-start'}`}>
                    {isCollapsed && !isMobile ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={(user as any)?.profileImageUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-700 text-white text-sm">
                          {((user as any)?.firstName?.[0] || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={(user as any)?.profileImageUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-700 text-white text-sm">
                            {((user as any)?.firstName?.[0] || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {(user as any)?.firstName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(user as any)?.plan?.replace('_', ' ') || 'Free Trial'}
                          </p>
                        </div>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleNavigation("/settings", true)}>
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
              >
                <motion.div
                  animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </motion.div>
              </Button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${
        isOpen && !isMobile ? (isCollapsed ? "ml-16" : "ml-64") : "ml-0"
      }`}>
        <div className="p-6 pt-20">
          {children}
        </div>
      </main>
    </div>
  );
}