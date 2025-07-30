import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { FeatureGate } from "@/components/FeatureGate";
import { BrandVoiceSEO } from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload,
  FileText,
  Mic,
  Brain,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  Trash2,
  Edit,
  Play,
  Download,
  RotateCcw,
  Palette,
  MessageSquare,
  Target,
  Sparkles,
  BookOpen,
  TrendingUp
} from "lucide-react";

interface BrandVoiceSample {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'file' | 'guideline';
  category: string;
  status: 'processing' | 'analyzed' | 'error';
  toneAnalysis?: {
    tone: string;
    confidence: number;
    characteristics: string[];
    sentiment: string;
  };
  createdAt: string;
  wordCount: number;
}

interface BrandVoiceProfile {
  id: string;
  name: string;
  description: string;
  status: 'training' | 'ready' | 'needs_samples';
  accuracy: number;
  samplesCount: number;
  toneCharacteristics: {
    formality: number; // 0-100
    friendliness: number;
    confidence: number;
    enthusiasm: number;
    empathy: number;
  };
  guidelines: string[];
  keyPhrases: string[];
  avoidWords: string[];
  lastTrained: string;
}

const SAMPLE_CATEGORIES = [
  "Email Communication",
  "Customer Support", 
  "Marketing Content",
  "Social Media",
  "Documentation",
  "Sales Material",
  "Product Descriptions",
  "Brand Messaging",
  "Website Copy",
  "Press Releases"
];

const TONE_CHARACTERISTICS = [
  { key: 'formality', label: 'Formality', description: 'Professional vs Casual' },
  { key: 'friendliness', label: 'Friendliness', description: 'Warm vs Direct' },
  { key: 'confidence', label: 'Confidence', description: 'Assertive vs Humble' },
  { key: 'enthusiasm', label: 'Enthusiasm', description: 'Energetic vs Calm' },
  { key: 'empathy', label: 'Empathy', description: 'Understanding vs Factual' }
];

export default function BrandVoiceTraining() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState("samples");
  const [newSample, setNewSample] = useState({
    name: "",
    content: "",
    category: "",
    type: "text" as const
  });
  const [guidelines, setGuidelines] = useState({
    brandPersonality: "",
    communicationStyle: "",
    keyMessages: "",
    avoidanceRules: "",
    targetAudience: ""
  });
  const [testMessage, setTestMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Fetch brand voice profile
  const { data: brandProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/brand-voice/profile'],
    enabled: !!user
  });

  // Fetch brand voice samples
  const { data: samples = [], isLoading: samplesLoading } = useQuery({
    queryKey: ['/api/brand-voice/samples'],
    enabled: !!user
  });

  // Add sample mutation
  const addSampleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/brand-voice/samples", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-voice/samples'] });
      queryClient.invalidateQueries({ queryKey: ['/api/brand-voice/profile'] });
      setNewSample({ name: "", content: "", category: "", type: "text" });
      toast({
        title: "Sample Added",
        description: "Your brand voice sample has been added for analysis"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add sample",
        variant: "destructive"
      });
    }
  });

  // Delete sample mutation
  const deleteSampleMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/brand-voice/samples/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-voice/samples'] });
      queryClient.invalidateQueries({ queryKey: ['/api/brand-voice/profile'] });
      toast({
        title: "Sample Deleted",
        description: "Sample has been removed from your brand voice training"
      });
    }
  });

  // Update guidelines mutation
  const updateGuidelinesMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/brand-voice/guidelines", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-voice/profile'] });
      toast({
        title: "Guidelines Updated",
        description: "Your brand voice guidelines have been saved"
      });
    }
  });

  // Retrain model mutation
  const retrainMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/brand-voice/retrain"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-voice/profile'] });
      toast({
        title: "Retraining Started",
        description: "Your brand voice model is being updated with the latest samples"
      });
    }
  });

  // Test brand voice mutation
  const testVoiceMutation = useMutation({
    mutationFn: (message: string) => 
      apiRequest("POST", "/api/brand-voice/test", { message }),
    onSuccess: (data) => {
      toast({
        title: "Brand Voice Test",
        description: `Confidence: ${(data.confidence * 100).toFixed(1)}% - ${data.feedback}`
      });
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const sample = {
        name: file.name,
        content,
        category: newSample.category || "Documentation",
        type: "file" as const
      };
      
      addSampleMutation.mutate(sample);
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const handleAddTextSample = () => {
    if (!newSample.name || !newSample.content || !newSample.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    addSampleMutation.mutate(newSample);
  };

  const handleUpdateGuidelines = () => {
    updateGuidelinesMutation.mutate(guidelines);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case 'analyzed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600";
    if (accuracy >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // Add SEO meta tags
  useEffect(() => {
    document.title = "Brand Voice Training - AI-Powered Communication Consistency | Savrii";
  }, []);

  return (
    <>
      <BrandVoiceSEO />
      <FeatureGate 
        feature="brand_voice_training" 
        fallback={
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Brand Voice Training</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Train AI to match your brand's unique voice and communication style
            </p>
            <Button>Upgrade to Pro</Button>
          </div>
        }
      >
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with SEO-optimized structure */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-['Playfair_Display'] text-gray-900 dark:text-white">
              Brand Voice Training
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Train AI to perfectly match your brand's voice and communication style
            </p>
          </div>

          {brandProfile?.status === 'ready' && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => retrainMutation.mutate()}
                disabled={retrainMutation.isPending}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retrain Model
              </Button>
              <Button 
                onClick={() => setActiveTab("test")}
              >
                <Play className="w-4 h-4 mr-2" />
                Test Voice
              </Button>
            </div>
          )}
        </div>

        {/* Brand Voice Overview */}
        {brandProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Brand Voice Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    <span className={getAccuracyColor(brandProfile.accuracy)}>
                      {brandProfile.accuracy}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Model Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{brandProfile.samplesCount}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Training Samples</div>
                </div>
                <div className="text-center">
                  <Badge 
                    variant={brandProfile.status === 'ready' ? 'default' : 'secondary'}
                    className="text-sm"
                  >
                    {brandProfile.status === 'ready' ? 'Ready' : 
                     brandProfile.status === 'training' ? 'Training' : 'Needs Samples'}
                  </Badge>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Status</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">
                    {brandProfile.lastTrained ? 
                      new Date(brandProfile.lastTrained).toLocaleDateString() : 
                      'Never'
                    }
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Last Trained</div>
                </div>
              </div>

              {brandProfile.toneCharacteristics && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Tone Characteristics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TONE_CHARACTERISTICS.map(char => (
                      <div key={char.key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{char.label}</span>
                          <span className="text-gray-600">
                            {brandProfile.toneCharacteristics[char.key as keyof typeof brandProfile.toneCharacteristics]}%
                          </span>
                        </div>
                        <Progress 
                          value={brandProfile.toneCharacteristics[char.key as keyof typeof brandProfile.toneCharacteristics]} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="samples">Training Samples</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="test">Test Voice</TabsTrigger>
          </TabsList>

          {/* Training Samples Tab */}
          <TabsContent value="samples" className="space-y-6">
            {/* Add New Sample */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Add Training Sample
                </CardTitle>
                <CardDescription>
                  Upload text files or input content that represents your brand voice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sample-name">Sample Name</Label>
                    <Input
                      id="sample-name"
                      value={newSample.name}
                      onChange={(e) => setNewSample(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Customer email template"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sample-category">Category</Label>
                    <Select 
                      value={newSample.category}
                      onValueChange={(value) => setNewSample(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {SAMPLE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sample-content">Content</Label>
                  <Textarea
                    id="sample-content"
                    value={newSample.content}
                    onChange={(e) => setNewSample(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Paste your brand voice sample content here..."
                    rows={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddTextSample}
                    disabled={addSampleMutation.isPending}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {addSampleMutation.isPending ? 'Adding...' : 'Add Text Sample'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Samples List */}
            <Card>
              <CardHeader>
                <CardTitle>Training Samples ({samples.length})</CardTitle>
                <CardDescription>
                  Review and manage your brand voice training samples
                </CardDescription>
              </CardHeader>
              <CardContent>
                {samplesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : samples.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-300">
                      No training samples yet. Add your first sample to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {samples.map((sample: BrandVoiceSample) => (
                      <div key={sample.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{sample.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {sample.category}
                              </Badge>
                              {getStatusIcon(sample.status)}
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                              {sample.content.substring(0, 150)}...
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{sample.wordCount} words</span>
                              <span>{new Date(sample.createdAt).toLocaleDateString()}</span>
                              {sample.toneAnalysis && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  {(sample.toneAnalysis.confidence * 100).toFixed(0)}% confidence
                                </span>
                              )}
                            </div>

                            {sample.toneAnalysis && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {sample.toneAnalysis.characteristics.map((char, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {char}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-1 ml-4">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteSampleMutation.mutate(sample.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guidelines Tab */}
          <TabsContent value="guidelines" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Brand Voice Guidelines
                </CardTitle>
                <CardDescription>
                  Define your brand personality, communication style, and messaging guidelines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="brand-personality">Brand Personality</Label>
                  <Textarea
                    id="brand-personality"
                    value={guidelines.brandPersonality}
                    onChange={(e) => setGuidelines(prev => ({ ...prev, brandPersonality: e.target.value }))}
                    placeholder="Describe your brand's personality (e.g., friendly, professional, innovative, trustworthy...)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="communication-style">Communication Style</Label>
                  <Textarea
                    id="communication-style"
                    value={guidelines.communicationStyle}
                    onChange={(e) => setGuidelines(prev => ({ ...prev, communicationStyle: e.target.value }))}
                    placeholder="How should your brand communicate? (e.g., conversational, formal, empathetic, direct...)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="key-messages">Key Messages & Values</Label>
                  <Textarea
                    id="key-messages"
                    value={guidelines.keyMessages}
                    onChange={(e) => setGuidelines(prev => ({ ...prev, keyMessages: e.target.value }))}
                    placeholder="What key messages and values should always be conveyed?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Textarea
                    id="target-audience"
                    value={guidelines.targetAudience}
                    onChange={(e) => setGuidelines(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="Describe your target audience and how to speak to them"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="avoidance-rules">What to Avoid</Label>
                  <Textarea
                    id="avoidance-rules"
                    value={guidelines.avoidanceRules}
                    onChange={(e) => setGuidelines(prev => ({ ...prev, avoidanceRules: e.target.value }))}
                    placeholder="Words, phrases, or communication styles to avoid"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleUpdateGuidelines}
                  disabled={updateGuidelinesMutation.isPending}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {updateGuidelinesMutation.isPending ? 'Saving...' : 'Save Guidelines'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Voice Consistency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {brandProfile ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getAccuracyColor(brandProfile.accuracy)}`}>
                          {brandProfile.accuracy}%
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Brand Voice Consistency
                        </p>
                      </div>
                      
                      {brandProfile.keyPhrases && brandProfile.keyPhrases.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Key Phrases</h4>
                          <div className="flex flex-wrap gap-2">
                            {brandProfile.keyPhrases.slice(0, 8).map((phrase, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {phrase}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-600 dark:text-gray-300 py-8">
                      No analysis available yet. Add training samples to get started.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Sample Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {samples.length > 0 ? (
                    <div className="space-y-3">
                      {SAMPLE_CATEGORIES.map(category => {
                        const count = samples.filter((s: BrandVoiceSample) => s.category === category).length;
                        const percentage = samples.length > 0 ? (count / samples.length) * 100 : 0;
                        
                        if (count === 0) return null;
                        
                        return (
                          <div key={category}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{category}</span>
                              <span>{count} samples</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-600 dark:text-gray-300 py-8">
                      No samples to analyze yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Test Voice Tab */}
          <TabsContent value="test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Test Brand Voice
                </CardTitle>
                <CardDescription>
                  Test how well a message matches your trained brand voice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-message">Message to Test</Label>
                  <Textarea
                    id="test-message"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Enter a message to test against your brand voice..."
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={() => testVoiceMutation.mutate(testMessage)}
                  disabled={!testMessage || testVoiceMutation.isPending || !brandProfile || brandProfile.status !== 'ready'}
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {testVoiceMutation.isPending ? 'Testing...' : 'Test Brand Voice Match'}
                </Button>

                {!brandProfile || brandProfile.status !== 'ready' ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Brand voice model needs more training samples to enable testing.
                      </p>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </FeatureGate>
    </>
  );
}