import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dashboard Components
import { UsageTracker } from "@/components/dashboard/usage-tracker";
import { RecentReplies } from "@/components/dashboard/recent-replies";
import { AIConfidencePanel } from "@/components/dashboard/ai-confidence-panel";
import { ToneTraining } from "@/components/dashboard/tone-training";

// Icons
import { 
  MessageSquare, 
  Sparkles, 
  Copy, 
  Send,
  Wand2,
  TrendingUp,
  Zap,
  Crown,
  AlertTriangle
} from "lucide-react";

// Form schema
const generateSchema = z.object({
  clientMessage: z.string().min(10, "Message must be at least 10 characters"),
  queryType: z.enum(["refund_request", "shipping_delay", "product_howto", "general"]),
  tone: z.enum(["professional", "friendly", "casual", "empathetic"]).default("professional"),
});

type GenerateFormData = z.infer<typeof generateSchema>;

const queryTypeLabels = {
  refund_request: "Refund Request",
  shipping_delay: "Shipping Delay", 
  product_howto: "Product How-to",
  general: "General Inquiry"
};

const toneLabels = {
  professional: "Professional",
  friendly: "Friendly", 
  casual: "Casual",
  empathetic: "Empathetic"
};

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("generator");
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [hasShownLimitModal, setHasShownLimitModal] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Forms
  const generateForm = useForm<GenerateFormData>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      tone: "professional",
      queryType: "general"
    }
  });

  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      firstName: (user as any)?.firstName || "",
      lastName: (user as any)?.lastName || "",
      email: (user as any)?.email || "",
      country: (user as any)?.country || "IN"
    }
  });

  // Update form defaults when user data loads
  useEffect(() => {
    if (user) {
      settingsForm.reset({
        firstName: (user as any).firstName || "",
        lastName: (user as any).lastName || "",
        email: (user as any).email || "",
        country: (user as any).country || "IN"
      });
    }
  }, [user, settingsForm]);

  // GSAP animations on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate header
      gsap.fromTo(headerRef.current, 
        { opacity: 0, y: -30 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );

      // Animate cards with stagger
      gsap.fromTo(".dashboard-card", 
        { opacity: 0, y: 50, scale: 0.95 }, 
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6, 
          stagger: 0.1, 
          ease: "power2.out",
          delay: 0.2
        }
      );

      // Animate tabs
      gsap.fromTo(".dashboard-tabs", 
        { opacity: 0, x: -30 }, 
        { opacity: 1, x: 0, duration: 0.6, ease: "power2.out", delay: 0.4 }
      );
    });

    return () => ctx.revert();
  }, [isAuthenticated]);

  // Usage stats query
  const { data: usageStats, refetch: refetchUsage } = useQuery<{
    used: number;
    limit: number;
    plan: string;
  }>({
    queryKey: ["/api/usage/stats"],
    enabled: isAuthenticated,
  });

  // Check if user hits limit and show modal
  useEffect(() => {
    if (usageStats && usageStats.used >= usageStats.limit && usageStats.plan === "free_trial" && !hasShownLimitModal) {
      setShowUpgradeDialog(true);
      setHasShownLimitModal(true);
    }
  }, [usageStats, hasShownLimitModal]);

  // AI Response Generation Mutation
  const generateMutation = useMutation({
    mutationFn: async (data: GenerateFormData) => {
      const response = await fetch("/api/ai/generate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Generation failed");
      }
      return response.json();
    },
    onSuccess: (response) => {
      setGeneratedResponse(response.response);
      refetchUsage();
      toast({
        title: "Response Generated!",
        description: `Generated in ${response.generationTime}ms with ${Math.round(response.confidence * 100)}% confidence`,
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      if (error.message.includes("Daily limit")) {
        setShowUpgradeDialog(true);
        return;
      }
      
      toast({
        title: "Generation Failed", 
        description: error.message || "Failed to generate response",
        variant: "destructive",
      });
    },
  });

  // Settings Update Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Update failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Settings Updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard",
      });
      setTimeout(() => setCopiedText(""), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  // Calculate trial days remaining
  const getTrialDaysRemaining = () => {
    if (!(user as any)?.trialStart) return 0;
    const trialStart = new Date((user as any).trialStart);
    const now = new Date();
    const diffTime = (14 * 24 * 60 * 60 * 1000) - (now.getTime() - trialStart.getTime());
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const onSubmitGenerate = (data: GenerateFormData) => {
    generateMutation.mutate(data);
  };

  const onSubmitSettings = (data: SettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const usagePercentage = usageStats?.limit === -1 ? 0 : ((usageStats?.used || 0) / (usageStats?.limit || 1)) * 100;
  const trialDaysRemaining = getTrialDaysRemaining();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Navbar />
      
      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeDialog} 
        onClose={() => setShowUpgradeDialog(false)} 
      />
      
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            {/* Usage Counter */}
            {usageStats && (
              <div className="mb-6">
                <UsageCounter 
                  used={usageStats.used} 
                  limit={usageStats.limit} 
                  plan={usageStats.plan} 
                />
              </div>
            )}
          </motion.div>

          {/* Dashboard Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
                  <MessageSquare className="text-white w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
                    Welcome back, {(user as any)?.firstName || 'User'}!
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge variant={(user as any)?.plan === 'free_trial' ? 'secondary' : 'default'} className="capitalize">
                      {(user as any)?.plan?.replace('_', ' ') || 'Free Trial'}
                    </Badge>
                    {(user as any)?.plan === 'free_trial' && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        • {trialDaysRemaining} days left
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Usage Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Usage</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {usageStats?.used || 0}
                    {usageStats?.limit !== -1 && ` / ${usageStats?.limit}`}
                  </span>
                </div>
                {usageStats?.limit !== -1 && (
                  <Progress value={usagePercentage} className="h-2" />
                )}
                {usageStats?.limit === -1 && (
                  <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                    <Crown className="w-3 h-3" />
                    Unlimited
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 dashboard-tabs">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="generator" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Generator
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Billing
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* AI Generator Tab */}
            <TabsContent value="generator" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="dashboard-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-heading">
                        <MessageSquare className="w-5 h-5" />
                        Generate AI Response
                      </CardTitle>
                      <CardDescription className="font-body">
                        Paste your customer's message and get a professional response instantly
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={generateForm.handleSubmit(onSubmitGenerate)} className="space-y-4">
                        <div>
                          <Label htmlFor="queryType">Query Type</Label>
                          <Select 
                            onValueChange={(value) => generateForm.setValue('queryType', value as any)}
                            defaultValue={generateForm.watch('queryType')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select query type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(queryTypeLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="tone">Response Tone</Label>
                          <Select 
                            onValueChange={(value) => generateForm.setValue('tone', value as any)}
                            defaultValue={generateForm.watch('tone')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(toneLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="clientMessage">Customer Message</Label>
                          <Textarea
                            id="clientMessage"
                            placeholder="Paste your customer's message here..."
                            className="min-h-[120px]"
                            {...generateForm.register('clientMessage')}
                          />
                          {generateForm.formState.errors.clientMessage && (
                            <p className="text-sm text-red-500 mt-1">
                              {generateForm.formState.errors.clientMessage.message}
                            </p>
                          )}
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={generateMutation.isPending}
                        >
                          {generateMutation.isPending ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Generate Response
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Output Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-heading">
                        <Zap className="w-5 h-5" />
                        Generated Response
                      </CardTitle>
                      <CardDescription className="font-body">
                        Your AI-generated customer response
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {generatedResponse ? (
                        <div className="space-y-4">
                          <Textarea
                            value={generatedResponse}
                            readOnly
                            className="min-h-[200px] bg-gray-50 dark:bg-slate-700"
                          />
                          <Button
                            onClick={() => copyToClipboard(generatedResponse)}
                            variant="outline"
                            className="w-full"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            {copiedText === generatedResponse ? "Copied!" : "Copy Response"}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                          <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                          <p>Generate your first response to see it here</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="font-heading">Profile Information</CardTitle>
                    <CardDescription className="font-body">Your account details and plan information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <User className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg font-heading">{(user as any)?.firstName} {(user as any)?.lastName}</h3>
                        <p className="text-gray-600 dark:text-gray-400 font-body">{(user as any)?.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Plan</div>
                        <div className="font-semibold capitalize">
                          {(user as any)?.plan?.replace('_', ' ') || 'Free Trial'}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Country</div>
                        <div className="font-semibold">{(user as any)?.country || 'India'}</div>
                      </div>
                    </div>

                    {(user as any)?.plan === 'free_trial' && (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Trial ends in {trialDaysRemaining} days</span>
                        </div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Upgrade to continue using unlimited AI responses
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="font-heading">Usage Statistics</CardTitle>
                    <CardDescription className="font-body">Your AI response generation activity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Today's Responses</span>
                      <span className="font-semibold">{usageStats?.used || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Daily Limit</span>
                      <span className="font-semibold">
                        {usageStats?.limit === -1 ? 'Unlimited' : usageStats?.limit || 50}
                      </span>
                    </div>

                    {usageStats?.limit !== -1 && (
                      <>
                        <Progress value={usagePercentage} className="h-3" />
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                          {Math.round(usagePercentage)}% used
                        </div>
                      </>
                    )}

                    <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Account created {new Date((user as any)?.createdAt || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="font-heading">Account Settings</CardTitle>
                    <CardDescription className="font-body">Update your profile information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            {...settingsForm.register('firstName')}
                          />
                          {settingsForm.formState.errors.firstName && (
                            <p className="text-sm text-red-500 mt-1">
                              {settingsForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            {...settingsForm.register('lastName')}
                          />
                          {settingsForm.formState.errors.lastName && (
                            <p className="text-sm text-red-500 mt-1">
                              {settingsForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          {...settingsForm.register('email')}
                        />
                        {settingsForm.formState.errors.email && (
                          <p className="text-sm text-red-500 mt-1">
                            {settingsForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          {...settingsForm.register('country')}
                        />
                        {settingsForm.formState.errors.country && (
                          <p className="text-sm text-red-500 mt-1">
                            {settingsForm.formState.errors.country.message}
                          </p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        disabled={updateSettingsMutation.isPending}
                      >
                        {updateSettingsMutation.isPending ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <Settings className="w-4 h-4 mr-2" />
                        )}
                        Update Settings
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="font-heading">Billing & Plans</CardTitle>
                    <CardDescription className="font-body">Manage your subscription and billing</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-12">
                    <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2 font-heading">Upgrade Your Plan</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 font-body">
                      Get more AI responses and advanced features
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/pricing'} 
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-emerald-600"
                    >
                      View Pricing Plans
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}