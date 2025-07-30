import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Copy, 
  Star, 
  Filter, 
  BookOpen, 
  MessageSquare, 
  Mail, 
  Users, 
  Briefcase, 
  Heart, 
  Zap,
  CheckCircle,
  Tag,
  TrendingUp,
  Shield,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FeatureGate } from "@/components/FeatureGate";

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  useCase: string;
  rating: number;
  usageCount: number;
  isFavorite?: boolean;
}

const PROMPT_CATEGORIES = [
  "All Categories",
  "Customer Support",
  "Sales & Marketing", 
  "Business Communication",
  "Social Media",
  "Email Templates",
  "Product Descriptions",
  "Educational Content",
  "Technical Writing",
  "Personal Assistance"
];

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "1",
    title: "Professional Email Response",
    description: "Craft professional, courteous email responses for business communication",
    category: "Email Templates",
    prompt: "Please help me write a professional email response that:\n- Acknowledges the sender's message\n- Addresses their main concerns\n- Provides helpful information or next steps\n- Maintains a courteous and professional tone\n- Includes appropriate closing\n\nOriginal message: [INSERT MESSAGE]\nContext: [INSERT CONTEXT]",
    tags: ["email", "professional", "business", "communication"],
    difficulty: "Beginner",
    useCase: "Responding to business emails, client inquiries, and professional correspondence",
    rating: 4.8,
    usageCount: 1245
  },
  {
    id: "2", 
    title: "Customer Support Resolution",
    description: "Address customer complaints and issues with empathy and solutions",
    category: "Customer Support",
    prompt: "Help me create a customer support response that:\n- Shows empathy for the customer's situation\n- Acknowledges their concern specifically\n- Provides a clear solution or next steps\n- Offers additional assistance\n- Maintains a helpful and understanding tone\n\nCustomer issue: [INSERT ISSUE]\nContext: [INSERT CONTEXT]\nAvailable solutions: [INSERT SOLUTIONS]",
    tags: ["support", "empathy", "problem-solving", "customer-service"],
    difficulty: "Intermediate",
    useCase: "Handling customer complaints, technical issues, and service inquiries",
    rating: 4.9,
    usageCount: 892
  },
  {
    id: "3",
    title: "Sales Follow-up Message",
    description: "Create compelling follow-up messages that convert leads into customers",
    category: "Sales & Marketing",
    prompt: "Write a sales follow-up message that:\n- References our previous conversation\n- Highlights key benefits relevant to their needs\n- Addresses potential objections\n- Includes a clear call-to-action\n- Maintains an enthusiastic but not pushy tone\n\nProspect background: [INSERT BACKGROUND]\nPrevious interaction: [INSERT INTERACTION]\nProduct/service: [INSERT OFFERING]",
    tags: ["sales", "follow-up", "conversion", "lead-nurturing"],
    difficulty: "Advanced",
    useCase: "Following up with prospects, nurturing leads, closing sales opportunities",
    rating: 4.7,
    usageCount: 673
  },
  {
    id: "4",
    title: "Social Media Content Creator",
    description: "Generate engaging social media posts for various platforms",
    category: "Social Media",
    prompt: "Create a social media post that:\n- Captures attention with an engaging hook\n- Delivers valuable content or insight\n- Encourages engagement (likes, comments, shares)\n- Includes relevant hashtags\n- Matches the platform's tone and format\n\nTopic: [INSERT TOPIC]\nPlatform: [INSERT PLATFORM]\nTarget audience: [INSERT AUDIENCE]\nKey message: [INSERT MESSAGE]",
    tags: ["social-media", "content", "engagement", "marketing"],
    difficulty: "Intermediate",
    useCase: "Creating posts for LinkedIn, Twitter, Facebook, Instagram",
    rating: 4.6,
    usageCount: 1156
  },
  {
    id: "5",
    title: "Product Description Writer",
    description: "Write compelling product descriptions that drive sales",
    category: "Product Descriptions", 
    prompt: "Write a product description that:\n- Highlights key features and benefits\n- Addresses customer pain points\n- Uses persuasive but honest language\n- Includes technical specifications if relevant\n- Ends with a compelling reason to buy\n\nProduct: [INSERT PRODUCT]\nTarget audience: [INSERT AUDIENCE]\nKey features: [INSERT FEATURES]\nUnique selling points: [INSERT USP]",
    tags: ["product", "sales", "e-commerce", "persuasive"],
    difficulty: "Intermediate",
    useCase: "E-commerce listings, product catalogs, marketing materials",
    rating: 4.8,
    usageCount: 734
  },
  {
    id: "6",
    title: "Meeting Follow-up Summary",
    description: "Create comprehensive meeting summaries with action items",
    category: "Business Communication",
    prompt: "Create a meeting follow-up summary that:\n- Summarizes key discussion points\n- Lists specific action items with owners\n- Includes deadlines and next steps\n- Highlights important decisions made\n- Maintains a professional, organized format\n\nMeeting topic: [INSERT TOPIC]\nAttendees: [INSERT ATTENDEES]\nKey discussions: [INSERT DISCUSSIONS]\nDecisions made: [INSERT DECISIONS]",
    tags: ["meeting", "summary", "action-items", "business"],
    difficulty: "Beginner",
    useCase: "Team meetings, client calls, project updates, board meetings",
    rating: 4.7,
    usageCount: 568
  },
  {
    id: "7",
    title: "Educational Content Explainer",
    description: "Break down complex topics into easy-to-understand explanations",
    category: "Educational Content",
    prompt: "Explain this topic in a way that:\n- Breaks down complex concepts into simple terms\n- Uses analogies and examples when helpful\n- Follows a logical progression\n- Includes key takeaways\n- Engages the reader throughout\n\nTopic: [INSERT TOPIC]\nAudience level: [INSERT LEVEL]\nKey concepts: [INSERT CONCEPTS]\nLearning objectives: [INSERT OBJECTIVES]",
    tags: ["education", "explanation", "learning", "simplification"],
    difficulty: "Advanced",
    useCase: "Training materials, blog posts, educational content, tutorials",
    rating: 4.9,
    usageCount: 423
  },
  {
    id: "8",
    title: "Appointment Scheduling Assistant",
    description: "Handle appointment requests and scheduling communications",
    category: "Personal Assistance",
    prompt: "Handle this scheduling request by:\n- Acknowledging the appointment request\n- Providing available time slots\n- Confirming important details (location, duration, purpose)\n- Requesting any needed preparation\n- Offering alternative contact methods if needed\n\nRequest details: [INSERT REQUEST]\nAvailable times: [INSERT AVAILABILITY]\nLocation/format: [INSERT LOCATION]\nSpecial requirements: [INSERT REQUIREMENTS]",
    tags: ["scheduling", "appointments", "coordination", "assistant"],
    difficulty: "Beginner",
    useCase: "Appointment booking, calendar management, meeting coordination",
    rating: 4.5,
    usageCount: 912
  }
];

export default function PromptLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("popular");
  const [favorites, setFavorites] = useState<string[]>([]);
  const { toast } = useToast();

  // Filter prompts based on search and category
  const filteredPrompts = PROMPT_TEMPLATES.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All Categories" || prompt.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort prompts
  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.usageCount - a.usageCount;
      case "rating":
        return b.rating - a.rating;
      case "alphabetical":
        return a.title.localeCompare(b.title);
      case "difficulty":
        const difficultyOrder = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      default:
        return 0;
    }
  });

  const copyPrompt = (prompt: string, title: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt Copied!",
      description: `"${title}" has been copied to your clipboard.`,
    });
  };

  const toggleFavorite = (promptId: string) => {
    setFavorites(prev => 
      prev.includes(promptId) 
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "Intermediate":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "Advanced":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Customer Support":
        return <Shield className="w-4 h-4" />;
      case "Sales & Marketing":
        return <TrendingUp className="w-4 h-4" />;
      case "Business Communication":
        return <Briefcase className="w-4 h-4" />;
      case "Social Media":
        return <Users className="w-4 h-4" />;
      case "Email Templates":
        return <Mail className="w-4 h-4" />;
      case "Product Descriptions":
        return <Tag className="w-4 h-4" />;
      case "Educational Content":
        return <BookOpen className="w-4 h-4" />;
      case "Technical Writing":
        return <Zap className="w-4 h-4" />;
      case "Personal Assistance":
        return <Clock className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <FeatureGate 
      feature="prompt_templates" 
      fallback={
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Prompt Library</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            Access our comprehensive library of pre-built prompts for various use cases. Upgrade to Pro to unlock this feature.
          </p>
          <Button onClick={() => window.location.href = '/billing'}>
            Upgrade to Pro
          </Button>
        </div>
      }
    >
      <div className="container mx-auto p-6 pt-20 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-emerald-600" />
              Prompt Library
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Discover and use pre-built prompts for common business scenarios
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {sortedPrompts.length} prompts available
            </Badge>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search prompts by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-64">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROMPT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Options */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPrompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getCategoryIcon(prompt.category)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg leading-tight">
                        {prompt.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {prompt.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(prompt.id)}
                    className="p-1 h-auto"
                  >
                    <Star 
                      className={`w-4 h-4 ${
                        favorites.includes(prompt.id) 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-400"
                      }`} 
                    />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Metadata */}
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className={getDifficultyColor(prompt.difficulty)}>
                    {prompt.difficulty}
                  </Badge>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {prompt.rating}
                    </span>
                    <span>{prompt.usageCount.toLocaleString()} uses</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {prompt.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {prompt.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{prompt.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Use Case */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">
                    Best for:
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {prompt.useCase}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => copyPrompt(prompt.prompt, prompt.title)}
                    className="flex-1"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Prompt
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to chat with pre-filled prompt
                      const encodedPrompt = encodeURIComponent(prompt.prompt);
                      window.location.href = `/chat?prompt=${encodedPrompt}`;
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedPrompts.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No prompts found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Try adjusting your search or filter criteria to find relevant prompts.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All Categories");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Usage Tips */}
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <CheckCircle className="w-5 h-5" />
              Pro Tips for Using Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-700 dark:text-emerald-300">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600" />
                <span>Replace placeholder text [INSERT ...] with your specific content</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600" />
                <span>Customize prompts to match your brand voice and style</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600" />
                <span>Test different variations to find what works best</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600" />
                <span>Save successful variations as custom prompts</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureGate>
  );
}