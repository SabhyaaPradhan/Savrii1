import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  Brain, 
  FileText, 
  Settings, 
  Trash2, 
  Download, 
  Eye, 
  EyeOff, 
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus
} from "lucide-react";

interface CustomModel {
  id: number;
  name: string;
  description: string;
  type: 'model' | 'template';
  status: 'uploading' | 'processing' | 'active' | 'error';
  isDefault: boolean;
  fileSize: number;
  uploadedAt: string;
  lastUsed?: string;
  usageCount: number;
  modelConfig?: any;
  templateContent?: string;
}

interface ModelUploadForm {
  name: string;
  description: string;
  type: 'model' | 'template';
  file?: File;
  templateContent?: string;
  modelConfig?: any;
}

export default function CustomModel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState<ModelUploadForm>({
    name: '',
    description: '',
    type: 'template'
  });
  const [dragOver, setDragOver] = useState(false);

  // Fetch custom models
  const { data: customModels = [], isLoading } = useQuery<CustomModel[]>({
    queryKey: ['/api/custom-models'],
    enabled: !!user
  });

  // Upload model mutation
  const uploadModelMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/custom-models/upload', {
        method: 'POST',
        body: data,
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-models'] });
      setUploadDialogOpen(false);
      setUploadForm({ name: '', description: '', type: 'template' });
      toast({
        title: "Upload Started",
        description: "Your model/template is being processed"
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file",
        variant: "destructive"
      });
    }
  });

  // Delete model mutation
  const deleteModelMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/custom-models/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-models'] });
      toast({
        title: "Model Deleted",
        description: "Your custom model has been deleted"
      });
    }
  });

  // Set default model mutation
  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/custom-models/${id}/default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-models'] });
      toast({
        title: "Default Model Updated",
        description: "Your default model has been changed"
      });
    }
  });

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 100MB",
        variant: "destructive"
      });
      return;
    }

    setUploadForm(prev => ({ ...prev, file }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSubmitUpload = () => {
    if (!uploadForm.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your model/template",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('name', uploadForm.name);
    formData.append('description', uploadForm.description);
    formData.append('type', uploadForm.type);
    
    if (uploadForm.type === 'model' && uploadForm.file) {
      formData.append('file', uploadForm.file);
    } else if (uploadForm.type === 'template' && uploadForm.templateContent) {
      formData.append('templateContent', uploadForm.templateContent);
    } else {
      toast({
        title: "Missing Content",
        description: uploadForm.type === 'model' ? "Please select a file to upload" : "Please enter template content",
        variant: "destructive"
      });
      return;
    }

    uploadModelMutation.mutate(formData);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'uploading': return <Upload className="w-4 h-4 text-blue-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'uploading': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Custom AI Models</h1>
          <p className="text-muted-foreground">
            Upload your own finetuned models or create custom prompt templates
          </p>
        </div>
        
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Model
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Custom Model</DialogTitle>
              <DialogDescription>
                Upload a finetuned model or create a custom prompt template
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={uploadForm.type} onValueChange={(value: 'model' | 'template') => 
              setUploadForm(prev => ({ ...prev, type: value }))
            }>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template">Prompt Template</TabsTrigger>
                <TabsTrigger value="model">AI Model</TabsTrigger>
              </TabsList>
              
              <TabsContent value="template" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="template-desc">Description</Label>
                    <Input
                      id="template-desc"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your template"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="template-content">Template Content</Label>
                    <Textarea
                      id="template-content"
                      value={uploadForm.templateContent || ''}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, templateContent: e.target.value }))}
                      placeholder="Enter your prompt template with {variables} for dynamic content..."
                      rows={8}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Use {"{variable_name}"} for dynamic placeholders
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="model" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="model-name">Model Name</Label>
                    <Input
                      id="model-name"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter model name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="model-desc">Description</Label>
                    <Input
                      id="model-desc"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your model"
                    />
                  </div>
                  
                  <div>
                    <Label>Model File</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".bin,.safetensors,.gguf,.pt,.pth"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                      
                      {uploadForm.file ? (
                        <div className="space-y-2">
                          <FileText className="w-8 h-8 mx-auto text-primary" />
                          <p className="font-medium">{uploadForm.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(uploadForm.file.size)}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p>Drop your model file here or click to browse</p>
                          <p className="text-sm text-muted-foreground">
                            Supports .bin, .safetensors, .gguf, .pt, .pth (max 100MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitUpload}
                disabled={uploadModelMutation.isPending}
              >
                {uploadModelMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Default Savrii Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Savrii Models
          </CardTitle>
          <CardDescription>
            Pre-trained models optimized for business communication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Savrii Professional</h3>
                  <p className="text-sm text-muted-foreground">
                    Optimized for professional business communication
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Default</Badge>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Active
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">Savrii Creative</h3>
                  <p className="text-sm text-muted-foreground">
                    Enhanced creativity for marketing and content creation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Available
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Your Custom Models
          </CardTitle>
          <CardDescription>
            Models and templates you've uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customModels.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">No custom models yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first custom model or prompt template to get started
              </p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Your First Model
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {customModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      {model.type === 'model' ? (
                        <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{model.name}</h3>
                        {model.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{model.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Type: {model.type}</span>
                        {model.fileSize > 0 && <span>Size: {formatFileSize(model.fileSize)}</span>}
                        <span>Used: {model.usageCount} times</span>
                        <span>Uploaded: {new Date(model.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(model.status)}
                      <Badge className={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {!model.isDefault && model.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDefaultMutation.mutate(model.id)}
                          disabled={setDefaultMutation.isPending}
                        >
                          Set Default
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteModelMutation.mutate(model.id)}
                        disabled={deleteModelMutation.isPending}
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

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Custom Models</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Prompt Templates</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create reusable prompt structures</li>
                <li>• Use {"{variable_name}"} for dynamic content</li>
                <li>• Perfect for consistent tone and style</li>
                <li>• Instantly available after upload</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">AI Models</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Upload finetuned models (.bin, .safetensors, etc.)</li>
                <li>• Processing time varies by model size</li>
                <li>• Set as default for all conversations</li>
                <li>• Toggle between Savrii and custom models</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}