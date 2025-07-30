import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FeatureGate } from "@/components/FeatureGate";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Star,
  MoreVertical,
  Tag,
  Calendar,
  Users,
  Lock,
  Globe
} from "lucide-react";

interface CustomPrompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  tone: string;
  isPublic: boolean;
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
  };
}

const PROMPT_CATEGORIES = [
  "Customer Support",
  "Sales & Marketing", 
  "Content Creation",
  "Technical Support",
  "HR & Recruiting",
  "General Business",
  "Custom"
];

const TONE_OPTIONS = [
  "Professional",
  "Friendly", 
  "Casual",
  "Formal",
  "Empathetic",
  "Confident",
  "Helpful"
];

export default function CustomPrompts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTone, setSelectedTone] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<CustomPrompt | null>(null);
  const [promptForm, setPromptForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    tags: [],
    tone: "",
    isPublic: false
  });

  // Fetch custom prompts
  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ['/api/prompts/custom'],
    enabled: !!user
  });

  // Create prompt mutation
  const createPromptMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/prompts/custom", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prompts/custom'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Prompt Created",
        description: "Your custom prompt has been created successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create prompt",
        variant: "destructive"
      });
    }
  });

  // Update prompt mutation
  const updatePromptMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/prompts/custom/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prompts/custom'] });
      setIsEditDialogOpen(false);
      setEditingPrompt(null);
      resetForm();
      toast({
        title: "Prompt Updated",
        description: "Your prompt has been updated successfully"
      });
    }
  });

  // Delete prompt mutation
  const deletePromptMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/prompts/custom/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prompts/custom'] });
      toast({
        title: "Prompt Deleted",
        description: "The prompt has been removed"
      });
    }
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) => 
      apiRequest("POST", `/api/prompts/custom/${id}/favorite`, { isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prompts/custom'] });
    }
  });

  // Duplicate prompt mutation
  const duplicatePromptMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/prompts/custom/${id}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prompts/custom'] });
      toast({
        title: "Prompt Duplicated",
        description: "A copy of the prompt has been created"
      });
    }
  });

  const resetForm = () => {
    setPromptForm({
      title: "",
      description: "",
      content: "",
      category: "",
      tags: [],
      tone: "",
      isPublic: false
    });
  };

  const handleCreatePrompt = () => {
    if (!promptForm.title || !promptForm.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in the title and content fields",
        variant: "destructive"
      });
      return;
    }
    createPromptMutation.mutate(promptForm);
  };

  const handleUpdatePrompt = () => {
    if (!editingPrompt || !promptForm.title || !promptForm.content) {
      toast({
        title: "Validation Error", 
        description: "Please fill in the title and content fields",
        variant: "destructive"
      });
      return;
    }
    updatePromptMutation.mutate({ id: editingPrompt.id, data: promptForm });
  };

  const handleEditPrompt = (prompt: CustomPrompt) => {
    setEditingPrompt(prompt);
    setPromptForm({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.tags,
      tone: prompt.tone,
      isPublic: prompt.isPublic
    });
    setIsEditDialogOpen(true);
  };

  const copyPromptContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Prompt content copied to clipboard"
    });
  };

  // Filter prompts based on search and filters
  const filteredPrompts = prompts.filter((prompt: CustomPrompt) => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
    const matchesTone = selectedTone === "all" || prompt.tone === selectedTone;
    
    return matchesSearch && matchesCategory && matchesTone;
  });

  const addTag = (tag: string) => {
    if (tag && !promptForm.tags.includes(tag)) {
      setPromptForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPromptForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <FeatureGate 
      feature="prompt_builder" 
      fallback={
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Custom Prompts</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Create and manage reusable prompt templates for consistent AI responses
          </p>
          <Button>Upgrade to Pro</Button>
        </div>
      }
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">
              Custom Prompts
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Create, organize, and manage your reusable prompt templates
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Prompt</DialogTitle>
                <DialogDescription>
                  Create a reusable prompt template for consistent AI responses
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={promptForm.title}
                      onChange={(e) => setPromptForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Customer Support Response"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={promptForm.category}
                      onValueChange={(value) => setPromptForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROMPT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={promptForm.description}
                    onChange={(e) => setPromptForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of when to use this prompt"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Prompt Content *</Label>
                  <Textarea
                    id="content"
                    value={promptForm.content}
                    onChange={(e) => setPromptForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="You are a helpful customer support agent. When responding to customer inquiries..."
                    rows={6}
                    className="font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tone">Tone</Label>
                    <Select 
                      value={promptForm.tone}
                      onValueChange={(value) => setPromptForm(prev => ({ ...prev, tone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TONE_OPTIONS.map((tone) => (
                          <SelectItem key={tone} value={tone}>
                            {tone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Visibility</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        id="public"
                        checked={promptForm.isPublic}
                        onChange={(e) => setPromptForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="public" className="text-sm">
                        Make public (visible to team)
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {promptForm.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add tags (press Enter)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePrompt} disabled={createPromptMutation.isPending}>
                    {createPromptMutation.isPending ? 'Creating...' : 'Create Prompt'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search prompts by title, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {PROMPT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTone} onValueChange={setSelectedTone}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Tones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tones</SelectItem>
                    {TONE_OPTIONS.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prompts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPrompts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || selectedCategory !== "all" || selectedTone !== "all" 
                  ? "No prompts found" 
                  : "No custom prompts yet"
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchQuery || selectedCategory !== "all" || selectedTone !== "all"
                  ? "Try adjusting your search filters"
                  : "Create your first custom prompt template to get started"
                }
              </p>
              {!searchQuery && selectedCategory === "all" && selectedTone === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Prompt
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt: CustomPrompt) => (
              <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg line-clamp-1">{prompt.title}</CardTitle>
                        {prompt.isFavorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        {prompt.isPublic ? (
                          <Globe className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {prompt.description || "No description provided"}
                      </CardDescription>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPrompt(prompt)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicatePromptMutation.mutate(prompt.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleFavoriteMutation.mutate({ 
                            id: prompt.id, 
                            isFavorite: !prompt.isFavorite 
                          })}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          {prompt.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => copyPromptContent(prompt.content)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Content
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deletePromptMutation.mutate(prompt.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {prompt.content}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {prompt.category && (
                          <Badge variant="outline" className="text-xs">
                            {prompt.category}
                          </Badge>
                        )}
                        {prompt.tone && (
                          <Badge variant="outline" className="text-xs">
                            {prompt.tone}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        {prompt.usageCount}
                      </div>
                    </div>

                    {prompt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {prompt.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {prompt.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{prompt.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>by {prompt.author?.name || 'You'}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(prompt.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Prompt</DialogTitle>
              <DialogDescription>
                Update your prompt template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={promptForm.title}
                    onChange={(e) => setPromptForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Customer Support Response"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={promptForm.category}
                    onValueChange={(value) => setPromptForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={promptForm.description}
                  onChange={(e) => setPromptForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of when to use this prompt"
                />
              </div>

              <div>
                <Label htmlFor="edit-content">Prompt Content *</Label>
                <Textarea
                  id="edit-content"
                  value={promptForm.content}
                  onChange={(e) => setPromptForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="You are a helpful customer support agent..."
                  rows={6}
                  className="font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-tone">Tone</Label>
                  <Select 
                    value={promptForm.tone}
                    onValueChange={(value) => setPromptForm(prev => ({ ...prev, tone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((tone) => (
                        <SelectItem key={tone} value={tone}>
                          {tone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Visibility</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id="edit-public"
                      checked={promptForm.isPublic}
                      onChange={(e) => setPromptForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="edit-public" className="text-sm">
                      Make public (visible to team)
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {promptForm.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tags (press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePrompt} disabled={updatePromptMutation.isPending}>
                  {updatePromptMutation.isPending ? 'Updating...' : 'Update Prompt'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </FeatureGate>
  );
}