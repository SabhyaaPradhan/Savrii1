import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Send, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Clock,
  Loader2
} from "lucide-react";

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<any[]>([]);

  // Get user's conversation history
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<any[]>({
    queryKey: ['/api/conversations'],
    enabled: !!user
  });

  // Get current usage stats
  const { data: usageStats } = useQuery<{used: number, limit: number, plan: string, trialDaysLeft?: number}>({
    queryKey: ['/api/usage/stats'],
    enabled: !!user
  });

  // Initialize conversation with welcome message
  useEffect(() => {
    if (conversations && conversations.length === 0) {
      setConversation([
        {
          id: 'welcome',
          type: "ai",
          content: "Hello! I'm your AI assistant. I can help you craft professional responses to client messages. What would you like help with today?",
          timestamp: new Date().toLocaleTimeString(),
          createdAt: new Date().toISOString()
        }
      ]);
    } else if (conversations && conversations.length > 0) {
      // Load the most recent conversation
      const recentConversation = conversations[0];
      setConversation(recentConversation.messages || []);
    }
  }, [conversations]);

  // Generate AI response mutation
  const generateResponseMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/ai/generate-response', {
        clientMessage: prompt,
        queryType: 'general_support',
        tone: 'professional'
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiResponse = {
        id: Date.now() + Math.random(),
        type: "ai",
        content: typeof data.response === 'string' ? data.response : data.response?.response || "Response generated successfully",
        confidence: data.confidence || 0.95,
        timestamp: new Date().toLocaleTimeString(),
        createdAt: new Date().toISOString()
      };
      setConversation(prev => [...prev, aiResponse]);
      
      // Invalidate conversations to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/usage/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error generating response",
        description: error.message || "Failed to generate AI response",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Check usage limits
    if (usageStats && usageStats.limit > 0 && usageStats.used >= usageStats.limit) {
      toast({
        title: "Usage limit reached",
        description: "You've reached your monthly query limit. Please upgrade your plan.",
        variant: "destructive"
      });
      return;
    }

    const newMessage = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString(),
      createdAt: new Date().toISOString()
    };

    setConversation(prev => [...prev, newMessage]);
    const currentMessage = message;
    setMessage("");

    // Generate AI response
    generateResponseMutation.mutate(currentMessage);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Response copied successfully"
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Chat / AI Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Get instant help crafting professional client responses
          </p>
        </div>
        <Badge variant="outline" className="text-emerald-700 border-emerald-300">
          <Bot className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Start with common scenarios or ask a custom question
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3">
              <Button variant="outline" className="justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Respond to Complaint
              </Button>
              <Button variant="outline" className="justify-start">
                <Clock className="w-4 h-4 mr-2" />
                Explain Delay
              </Button>
              <Button variant="outline" className="justify-start">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Thank You Response
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {conversationsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                conversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.type === "user"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {msg.content}
                      </div>
                      <div className="flex items-center justify-between text-xs opacity-70 mt-1">
                        <span>{msg.timestamp}</span>
                        {msg.confidence && (
                          <span className="text-green-300">
                            {Math.round(msg.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                      {msg.type === "ai" && (
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(msg.content)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {generateResponseMutation.isPending && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Generating response...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Describe your client's message and the type of response you need..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
                rows={3}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage} 
                className="self-end"
                disabled={generateResponseMutation.isPending || !message.trim()}
              >
                {generateResponseMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Monthly Usage:</span> {usageStats?.used || 0} / {
                  usageStats?.limit === -1 ? 'unlimited' : (usageStats?.limit || 100)
                } queries
              </div>
              <Badge variant="secondary">
                {(user as any)?.plan || 'Starter'} Plan
              </Badge>
            </div>
            {usageStats && usageStats.limit > 0 && usageStats.used >= usageStats.limit && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-300">
                  You've reached your monthly limit. Upgrade to continue using the AI assistant.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}