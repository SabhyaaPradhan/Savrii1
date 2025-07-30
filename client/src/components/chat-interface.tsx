import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Edit3, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface GeneratedResponse {
  response: string;
  confidence: number;
  generationTime: number;
  id: number;
}

export function ChatInterface() {
  const [clientMessage, setClientMessage] = useState("");
  const [tone, setTone] = useState("professional");
  const [generatedResponse, setGeneratedResponse] = useState<GeneratedResponse | null>(null);
  const { toast } = useToast();

  const generateResponseMutation = useMutation({
    mutationFn: async (data: { clientMessage: string; tone: string }) => {
      const response = await apiRequest("POST", "/api/ai/generate-response", data);
      return response.json();
    },
    onSuccess: (data: GeneratedResponse) => {
      setGeneratedResponse(data);
      toast({
        title: "Response Generated!",
        description: `Generated in ${data.generationTime}ms with ${Math.round(data.confidence * 100)}% confidence`,
      });
    },
    onError: (error: Error) => {
      console.error("Generate response error:", error);
      if (error.message.includes("429")) {
        toast({
          title: "Daily Limit Reached",
          description: "Upgrade to Starter or Pro for unlimited responses.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "Failed to generate response. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleGenerate = () => {
    if (!clientMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a client message to generate a response.",
        variant: "destructive",
      });
      return;
    }

    generateResponseMutation.mutate({
      clientMessage: clientMessage.trim(),
      tone,
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Message Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6"
      >
        <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-4">Client Message</h3>
        <Textarea
          value={clientMessage}
          onChange={(e) => setClientMessage(e.target.value)}
          placeholder="Paste your client's message here..."
          className="min-h-[120px] bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 resize-none"
        />
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Tone:</span>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generateResponseMutation.isPending}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            {generateResponseMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Reply"
            )}
          </Button>
        </div>
      </motion.div>

      {/* Generated Response */}
      {generatedResponse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-green-800 dark:text-green-300 flex items-center">
              ✨ AI Generated Response
            </h3>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(generatedResponse.response)}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-sm leading-relaxed">
            {generatedResponse.response}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-4 text-xs text-green-600 dark:text-green-400">
              <span>Generated in {generatedResponse.generationTime}ms</span>
              <span>Confidence: {Math.round(generatedResponse.confidence * 100)}%</span>
            </div>
            <Button
              size="sm"
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Response
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
