import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mic, 
  Plus, 
  Trash2, 
  Wand2, 
  Save, 
  RefreshCw,
  Volume2,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ToneExample {
  id: string;
  scenario: string;
  response: string;
  tone: string;
}

interface BrandProfile {
  id: string;
  status: 'ready' | 'training' | 'needs_samples';
  accuracy?: number;
  samplesCount: number;
}

interface BrandSample {
  id: string;
  name: string;
  content: string;
  category: string;
  type: string;
}

export function ToneTraining() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newExample, setNewExample] = useState({
    scenario: "",
    response: "",
    tone: "professional"
  });

  // Fetch brand voice profile
  const { data: brandProfile, isLoading: profileLoading } = useQuery<BrandProfile>({
    queryKey: ['/api/brand-voice/profile'],
    enabled: !!user
  });

  // Fetch brand voice samples
  const { data: samples = [], isLoading: samplesLoading } = useQuery<BrandSample[]>({
    queryKey: ['/api/brand-voice/samples'],
    enabled: !!user
  });

  // Add sample mutation
  const addSampleMutation = useMutation({
    mutationFn: async (data: { name: string; content: string; category: string; type: string }) => {
      const response = await apiRequest("POST", "/api/brand-voice/samples", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-voice/samples'] });
      queryClient.invalidateQueries({ queryKey: ['/api/brand-voice/profile'] });
      setNewExample({ scenario: "", response: "", tone: "professional" });
      toast({
        title: "Example Added",
        description: "Your tone example has been added successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Example",
        description: error.message || "Failed to add tone example",
        variant: "destructive"
      });
    }
  });

  // Retrain model mutation
  const retrainMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/brand-voice/retrain", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-voice/profile'] });
      toast({
        title: "Training Started",
        description: "Your AI is learning your brand voice. This may take a few minutes."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Training Failed",
        description: error.message || "Failed to start training",
        variant: "destructive"
      });
    }
  });

  const predefinedTones = [
    { name: "professional", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300" },
    { name: "friendly", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" },
    { name: "empathetic", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300" },
    { name: "helpful", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300" },
    { name: "casual", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300" },
  ];

  const addExample = () => {
    if (!newExample.scenario.trim() || !newExample.response.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both scenario and response",
        variant: "destructive"
      });
      return;
    }

    const sampleData = {
      name: `${newExample.tone} response example`,
      content: `Scenario: ${newExample.scenario}\n\nResponse: ${newExample.response}`,
      category: "Tone Training",
      type: "text"
    };

    addSampleMutation.mutate(sampleData);
  };

  const removeExample = async (sampleId: string) => {
    try {
      await apiRequest("DELETE", `/api/brand-voice/samples/${sampleId}`);
      queryClient.invalidateQueries({ queryKey: ['/api/brand-voice/samples'] });
      queryClient.invalidateQueries({ queryKey: ['/api/brand-voice/profile'] });
      toast({
        title: "Example Removed",
        description: "Tone example has been deleted"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove example",
        variant: "destructive"
      });
    }
  };

  const startTraining = () => {
    if ((samples as BrandSample[]).length < 2) {
      toast({
        title: "Need More Examples",
        description: "Add at least 2 examples to start training",
        variant: "destructive"
      });
      return;
    }

    retrainMutation.mutate();
  };

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading">
          <Mic className="w-5 h-5 text-red-600" />
          Tone Training
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Learning
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info and Status */}
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-800 dark:text-red-200 font-body">
              Train your AI to match your brand voice by providing examples of how you'd respond to different scenarios.
            </p>
            {brandProfile && (
              <Badge 
                variant={brandProfile.status === 'ready' ? 'default' : 'secondary'}
                className="ml-2"
              >
                {brandProfile.status === 'ready' ? 'Trained' : 
                 brandProfile.status === 'training' ? 'Training...' : 'Needs Training'}
              </Badge>
            )}
          </div>
          {brandProfile?.accuracy && brandProfile.accuracy > 0 && (
            <p className="text-xs text-red-700 dark:text-red-300 font-body">
              Current accuracy: {brandProfile.accuracy}%
            </p>
          )}
        </div>

        {/* Add New Example */}
        <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white font-heading">
            Add Training Example
          </h4>
          
          <div>
            <Label htmlFor="scenario">Customer Scenario</Label>
            <Textarea
              id="scenario"
              placeholder="Describe a customer situation or message..."
              value={newExample.scenario}
              onChange={(e) => setNewExample({...newExample, scenario: e.target.value})}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="response">Your Ideal Response</Label>
            <Textarea
              id="response"
              placeholder="How would you respond in your brand voice..."
              value={newExample.response}
              onChange={(e) => setNewExample({...newExample, response: e.target.value})}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="tone">Tone Category</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {predefinedTones.map((tone) => (
                <button
                  key={tone.name}
                  onClick={() => setNewExample({...newExample, tone: tone.name})}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    newExample.tone === tone.name 
                      ? tone.color + " ring-2 ring-offset-2 ring-green-500"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
                  }`}
                >
                  {tone.name}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={addExample} 
            disabled={addSampleMutation.isPending}
            className="w-full"
          >
            {addSampleMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Example
              </>
            )}
          </Button>
        </div>

        {/* Existing Examples */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white font-heading">
              Training Examples ({(samples as BrandSample[]).length})
            </h4>
            <Button
              onClick={startTraining}
              disabled={retrainMutation.isPending || (samples as BrandSample[]).length < 2 || brandProfile?.status === 'training'}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              {retrainMutation.isPending || brandProfile?.status === 'training' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Training...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  {brandProfile?.status === 'ready' ? 'Retrain' : 'Start Training'}
                </>
              )}
            </Button>
          </div>

          {samplesLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400 font-body">Loading examples...</p>
            </div>
          ) : (samples as BrandSample[]).length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Volume2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-body">No training examples yet. Add some to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(samples as BrandSample[]).slice(0, 5).map((sample: BrandSample, index: number) => (
                <motion.div
                  key={sample.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                      {sample.category || 'training sample'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExample(sample.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 font-body">
                        Sample:
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-body line-clamp-3">
                        {sample.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {(samples as BrandSample[]).length > 5 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center font-body">
                  And {(samples as BrandSample[]).length - 5} more examples...
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}