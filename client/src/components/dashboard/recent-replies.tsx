import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Clock, Copy, Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Reply {
  id: string;
  customerMessage: string;
  aiResponse: string;
  tone: string;
  confidence: number;
  createdAt: string;
}

export function RecentReplies() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: replies, isLoading } = useQuery<Reply[]>({
    queryKey: ["/api/replies/recent"],
  });

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600 dark:text-green-400";
    if (confidence >= 0.7) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return "success";
    if (confidence >= 0.7) return "warning";
    return "destructive";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <MessageSquare className="w-5 h-5" />
            Recent Replies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3 p-4 border rounded-lg">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Recent Replies
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!replies || replies.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400 font-body">
              No recent replies yet. Generate your first AI response!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {replies.map((reply, index) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Customer Message */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-body">
                    Customer Message:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 p-3 rounded-md font-body">
                    {reply.customerMessage}
                  </p>
                </div>

                {/* AI Response */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-body">
                    AI Response:
                  </h4>
                  <div className="relative">
                    <p className="text-sm text-gray-800 dark:text-gray-200 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md font-body">
                      {reply.aiResponse}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={() => copyToClipboard(reply.aiResponse, reply.id)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {copiedId === reply.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-2 right-10 bg-green-500 text-white text-xs px-2 py-1 rounded"
                      >
                        Copied!
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-body">
                      {reply.tone}
                    </Badge>
                    <Badge 
                      variant={getConfidenceBadge(reply.confidence)}
                      className="flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      {(reply.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span className="font-body">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}