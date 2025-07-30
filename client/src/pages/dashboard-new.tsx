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
  Bot, 
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [response, setResponse] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Form handling
  const form = useForm<GenerateFormData>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      clientMessage: "",
      queryType: "general",
      tone: "professional"
    }
  });

  // Generate response mutation
  const generateMutation = useMutation({
    mutationFn: async (data: GenerateFormData) => {
      return await apiRequest(`/api/generate`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setResponse(data.response);
      setConfidence(data.confidence);
      queryClient.invalidateQueries({ queryKey: ["/api/replies/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/usage/stats"] });
      toast({
        title: "Response Generated!",
        description: "Your AI response is ready to use.",
      });
    },
    onError: (error) => {
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
      toast({
        title: "Error",
        description: error.message || "Failed to generate response",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GenerateFormData) => {
    generateMutation.mutate(data);
  };

  const copyResponse = async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
          Welcome back, {(user as any)?.firstName || 'there'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-body">
          Generate AI-powered customer responses with confidence and speed.
        </p>
      </motion.div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <UsageTracker onUpgradeClick={handleUpgrade} />
        </div>
        <div className="lg:col-span-2">
          <AIConfidencePanel />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* AI Response Generator */}
        <div className="space-y-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Bot className="w-5 h-5 text-blue-600" />
                AI Response Generator
                <Badge variant="secondary" className="ml-auto">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Smart AI
                </Badge>
              </CardTitle>
              <CardDescription className="font-body">
                Generate professional customer responses instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="clientMessage">Customer Message</Label>
                  <Textarea
                    id="clientMessage"
                    placeholder="Paste your customer's message here..."
                    className="h-32 mt-1"
                    {...form.register("clientMessage")}
                  />
                  {form.formState.errors.clientMessage && (
                    <p className="text-red-500 text-sm mt-1 font-body">
                      {form.formState.errors.clientMessage.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="queryType">Query Type</Label>
                    <Select onValueChange={(value) => form.setValue("queryType", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(queryTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tone">Response Tone</Label>
                    <Select onValueChange={(value) => form.setValue("tone", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(toneLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Generate Response
                    </>
                  )}
                </Button>
              </form>

              {/* Generated Response */}
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Label>Generated Response</Label>
                    <div className="flex items-center gap-2">
                      {confidence > 0 && (
                        <Badge variant={confidence > 0.8 ? "default" : confidence > 0.6 ? "secondary" : "destructive"}>
                          {Math.round(confidence * 100)}% confidence
                        </Badge>
                      )}
                      <Button variant="outline" size="sm" onClick={copyResponse}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-blue-900 dark:text-blue-100 font-body whitespace-pre-wrap">
                      {response}
                    </p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Tone Training */}
          <ToneTraining />
        </div>

        {/* Right Column - Recent Activity */}
        <div className="space-y-6">
          <RecentReplies />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Zap className="w-5 h-5 text-yellow-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Wand2 className="w-4 h-4 mr-2" />
                Build Custom Prompt
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20"
                onClick={handleUpgrade}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          {/* Integration Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading">Integrations</CardTitle>
              <CardDescription className="font-body">
                Connect with your favorite tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Z</span>
                  </div>
                  <div>
                    <p className="font-medium font-body">Zapier</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-body">
                      Automate workflows
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Connect</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <div>
                    <p className="font-medium font-body">Gmail</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-body">
                      Email integration
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Connect</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}