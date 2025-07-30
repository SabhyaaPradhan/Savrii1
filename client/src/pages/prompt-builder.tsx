import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FeatureGate } from "@/components/FeatureGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wand2, 
  Save, 
  Play, 
  Copy, 
  FileText, 
  Globe, 
  Users, 
  Palette,
  BookOpen,
  Zap,
  Building,
  Crown
} from "lucide-react";

export default function PromptBuilder() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [promptText, setPromptText] = useState("");
  const [tone, setTone] = useState("professional");

  const basicTemplates = [
    { id: "support", name: "Customer Support", description: "Handle customer inquiries professionally" },
    { id: "sales", name: "Sales Inquiry", description: "Respond to sales questions" },
    { id: "general", name: "General Response", description: "Basic professional response" }
  ];

  const proTemplates = [
    { id: "technical", name: "Technical Support", description: "Handle complex technical issues" },
    { id: "billing", name: "Billing & Payments", description: "Manage billing inquiries" },
    { id: "refund", name: "Refund & Returns", description: "Process refund requests professionally" },
    { id: "complaint", name: "Complaint Resolution", description: "De-escalate and resolve complaints" },
    { id: "upsell", name: "Upselling & Cross-sell", description: "Suggest additional products/services" }
  ];

  const enterpriseTemplates = [
    { id: "legal", name: "Legal Compliance", description: "GDPR, privacy, and legal responses" },
    { id: "crisis", name: "Crisis Management", description: "Handle PR crises and sensitive issues" },
    { id: "enterprise", name: "Enterprise B2B", description: "Corporate communication templates" },
    { id: "multilingual", name: "Multilingual Support", description: "Templates in 20+ languages" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Custom Prompt Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Create and customize AI response templates for your business
          </p>
        </div>
        <Badge variant="outline" className="text-blue-700 border-blue-300">
          <Wand2 className="w-3 h-3 mr-1" />
          Pro Feature
        </Badge>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="voice">Brand Voice</TabsTrigger>
          <TabsTrigger value="multilingual">Multilingual</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <FeatureGate feature="prompt_builder">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prompt Configuration</CardTitle>
                  <CardDescription>
                    Customize your AI response parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template">Base Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {basicTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone">Response Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="empathetic">Empathetic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt">Custom Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Enter your custom prompt instructions..."
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Test Prompt
                    </Button>
                    <Button variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview & Test</CardTitle>
                  <CardDescription>
                    Test your prompt with sample inputs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sample Customer Message</Label>
                    <Textarea
                      placeholder="Hi, I'm having trouble with my order..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <Label className="text-sm font-medium">AI Response Preview</Label>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Response will appear here after testing...
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Response
                  </Button>
                </CardContent>
              </Card>
            </div>
          </FeatureGate>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-6">
            {/* Basic Templates - Available to all */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Basic Templates
                  <Badge variant="secondary">Included</Badge>
                </CardTitle>
                <CardDescription>
                  Essential templates for customer communication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {basicTemplates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <CardContent className="p-4">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {template.description}
                        </p>
                        <Button size="sm" className="mt-3 w-full">Use Template</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pro Templates */}
            <FeatureGate 
              feature="prompt_templates" 
              title="Advanced Template Library"
              description="Unlock 20+ professional templates for complex customer scenarios"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Pro Templates
                    <Badge className="bg-blue-100 text-blue-800">Pro</Badge>
                  </CardTitle>
                  <CardDescription>
                    Advanced templates for complex customer scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {proTemplates.map((template) => (
                      <Card key={template.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <CardContent className="p-4">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {template.description}
                          </p>
                          <Button size="sm" className="mt-3 w-full">Use Template</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FeatureGate>

            {/* Enterprise Templates */}
            <FeatureGate 
              feature="fine_tuned_ai"
              title="Enterprise Template Suite"
              description="Industry-specific templates with legal compliance and multilingual support"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-purple-600" />
                    Enterprise Templates
                    <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>
                  </CardTitle>
                  <CardDescription>
                    Industry-specific templates with compliance and multilingual support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {enterpriseTemplates.map((template) => (
                      <Card key={template.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <CardContent className="p-4">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {template.description}
                          </p>
                          <Button size="sm" className="mt-3 w-full">Use Template</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FeatureGate>
          </div>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <FeatureGate 
            feature="brand_voice_training"
            title="Brand Voice Training"
            description="Train AI to match your brand's unique communication style and tone"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Brand Voice Configuration
                </CardTitle>
                <CardDescription>
                  Train the AI to match your brand's unique communication style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Brand Personality</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select personality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional & Formal</SelectItem>
                          <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                          <SelectItem value="casual">Casual & Conversational</SelectItem>
                          <SelectItem value="authoritative">Authoritative & Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Communication Style</Label>
                      <Textarea
                        placeholder="Describe your brand's communication style..."
                        className="mt-2 min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Sample Brand Responses</Label>
                      <Textarea
                        placeholder="Paste examples of your brand's existing responses..."
                        className="mt-2 min-h-[120px]"
                      />
                    </div>

                    <Button className="w-full">
                      <Crown className="w-4 h-4 mr-2" />
                      Train Brand Voice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FeatureGate>
        </TabsContent>

        <TabsContent value="multilingual" className="space-y-6">
          <FeatureGate 
            feature="multilingual_support"
            title="Multilingual Support"
            description="Generate responses in 20+ languages with cultural context awareness"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Multilingual Response Generation
                </CardTitle>
                <CardDescription>
                  Generate responses in multiple languages with cultural context
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    "English", "Spanish", "French", "German", "Italian", "Portuguese",
                    "Japanese", "Korean", "Chinese", "Arabic", "Hindi", "Russian"
                  ].map((language) => (
                    <Card key={language} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <CardContent className="p-4 text-center">
                        <h4 className="font-medium">{language}</h4>
                        <Button size="sm" className="mt-2 w-full">
                          Generate Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FeatureGate>
        </TabsContent>
      </Tabs>
    </div>
  );
}