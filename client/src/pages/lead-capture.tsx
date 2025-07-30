import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FeatureGate } from "@/components/FeatureGate";
import { 
  FormInput, 
  Globe, 
  Copy, 
  Plus, 
  Edit3, 
  Trash2,
  Eye,
  Code,
  ExternalLink,
  BarChart3,
  Settings,
  Download,
  Play,
  Pause
} from "lucide-react";

interface LeadCaptureForm {
  id: number;
  name: string;
  title: string;
  description?: string;
  type: string;
  fields: any[];
  styling: any;
  settings: any;
  status: string;
  isPublic: boolean;
  submissions: number;
  conversionRate: number;
  createdAt: string;
  updatedAt: string;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

const DEFAULT_FIELDS: FormField[] = [
  { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter your full name" },
  { name: "email", label: "Email Address", type: "email", required: true, placeholder: "your@email.com" },
  { name: "company", label: "Company", type: "text", required: false, placeholder: "Your company name" },
  { name: "message", label: "Message", type: "textarea", required: false, placeholder: "Tell us about your needs..." }
];

const DEFAULT_STYLING = {
  theme: "modern",
  primaryColor: "#10B981",
  backgroundColor: "#FFFFFF",
  textColor: "#1F2937",
  borderRadius: "8px",
  buttonText: "Submit"
};

const DEFAULT_SETTINGS = {
  showTitle: true,
  showDescription: true,
  redirectUrl: "",
  thankYouMessage: "Thank you for your interest! We'll be in touch soon.",
  emailNotifications: true,
  autoResponse: false
};

export default function LeadCapture() {
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("forms");
  const [newForm, setNewForm] = useState({
    name: "",
    title: "",
    description: "",
    type: "embed"
  });

  const { data: leadForms = [], isLoading: loadingForms } = useQuery({
    queryKey: ['/api/lead-capture/forms'],
    queryFn: async () => {
      const response = await fetch('/api/lead-capture/forms');
      if (!response.ok) {
        throw new Error('Failed to fetch lead forms');
      }
      return response.json();
    }
  });

  const { data: submissions = [], isLoading: loadingSubmissions } = useQuery({
    queryKey: ['/api/lead-capture/submissions'],
    queryFn: async () => {
      const response = await fetch('/api/lead-capture/submissions');
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      return response.json();
    }
  });

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['/api/lead-capture/analytics'],
    queryFn: async () => {
      const response = await fetch('/api/lead-capture/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    }
  });

  const createFormMutation = useMutation({
    mutationFn: async (formData: any) => {
      return apiRequest("POST", "/api/lead-capture/forms", {
        ...formData,
        fields: DEFAULT_FIELDS,
        styling: DEFAULT_STYLING,
        settings: DEFAULT_SETTINGS
      });
    },
    onSuccess: () => {
      toast({
        title: "Form Created",
        description: "Your lead capture form has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      setNewForm({ name: "", title: "", description: "", type: "embed" });
      queryClient.invalidateQueries({ queryKey: ['/api/lead-capture/forms'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create form",
        variant: "destructive",
      });
    }
  });

  const toggleFormStatusMutation = useMutation({
    mutationFn: async ({ formId, status }: { formId: number; status: string }) => {
      return apiRequest("PATCH", `/api/lead-capture/forms/${formId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Form status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lead-capture/forms'] });
    }
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (formId: number) => {
      return apiRequest("DELETE", `/api/lead-capture/forms/${formId}`);
    },
    onSuccess: () => {
      toast({
        title: "Form Deleted",
        description: "Lead capture form has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lead-capture/forms'] });
    }
  });

  const handleCreateForm = () => {
    if (!newForm.name.trim() || !newForm.title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createFormMutation.mutate(newForm);
  };

  const handleToggleStatus = (formId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    toggleFormStatusMutation.mutate({ formId, status: newStatus });
  };

  const handleDeleteForm = (formId: number, formName: string) => {
    if (confirm(`Are you sure you want to delete "${formName}"? This action cannot be undone.`)) {
      deleteFormMutation.mutate(formId);
    }
  };

  const getEmbedCode = (formId: number) => {
    const baseUrl = window.location.origin;
    return `<iframe src="${baseUrl}/embed/form/${formId}" width="100%" height="500" frameborder="0"></iframe>`;
  };

  const copyEmbedCode = (formId: number) => {
    const embedCode = getEmbedCode(formId);
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    };
    return variants[status as keyof typeof variants] || variants.draft;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "popup": return Globe;
      case "widget": return Code;
      case "inline": return FormInput;
      default: return FormInput;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSubmissionData = (data: any) => {
    if (!data) return "No data";
    return Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(", ");
  };

  return (
    <FeatureGate 
      feature="lead_capture" 
      fallback={
        <div className="text-center py-12">
          <FormInput className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Lead Capture Options</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            Create embed forms, popups, and widgets to collect leads from your website. Upgrade to Enterprise to unlock lead capture features.
          </p>
          <Button onClick={() => window.location.href = '/billing'}>
            Upgrade to Enterprise
          </Button>
        </div>
      }
    >
      <div className="container mx-auto p-6 pt-20 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-2">
              <FormInput className="w-8 h-8 text-emerald-600" />
              Lead Capture Options
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Embed forms, popups, or widgets to collect leads from your website
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Form
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Lead Capture Form</DialogTitle>
                <DialogDescription>
                  Create a new form to capture leads from your website or marketing campaigns.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Form Name</Label>
                  <Input
                    id="name"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    placeholder="e.g., Newsletter Signup"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Form Title</Label>
                  <Input
                    id="title"
                    value={newForm.title}
                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                    placeholder="e.g., Get Our Latest Updates"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    placeholder="Brief description of the form"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Form Type</Label>
                  <Select value={newForm.type} onValueChange={(value) => setNewForm({ ...newForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="embed">Embed Form</SelectItem>
                      <SelectItem value="popup">Popup Modal</SelectItem>
                      <SelectItem value="widget">Widget</SelectItem>
                      <SelectItem value="inline">Inline Form</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateForm}
                    disabled={createFormMutation.isPending}
                  >
                    {createFormMutation.isPending ? "Creating..." : "Create Form"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FormInput className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Forms</p>
                    <p className="text-2xl font-bold">{analytics.totalForms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Submissions</p>
                    <p className="text-2xl font-bold">{analytics.totalSubmissions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Avg. Score</p>
                    <p className="text-2xl font-bold">{analytics.averageScore}/100</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Conversion</p>
                    <p className="text-2xl font-bold">
                      {analytics.totalForms > 0 ? Math.round((analytics.totalSubmissions / analytics.totalForms) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="forms" className="space-y-4">
            {loadingForms ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : leadForms.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FormInput className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Lead Capture Forms</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Create your first lead capture form to start collecting leads from your website.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Form
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leadForms.map((form: LeadCaptureForm) => {
                  const TypeIcon = getTypeIcon(form.type);
                  return (
                    <Card key={form.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="w-5 h-5 text-emerald-600" />
                            <div>
                              <CardTitle className="text-lg">{form.name}</CardTitle>
                              <CardDescription>{form.title}</CardDescription>
                            </div>
                          </div>
                          <Badge className={getStatusBadge(form.status)}>
                            {form.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Submissions:</span>
                          <span className="font-medium">{form.submissions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Conversion:</span>
                          <span className="font-medium">{form.conversionRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Created:</span>
                          <span className="font-medium">{formatDate(form.createdAt)}</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyEmbedCode(form.id)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Code
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleToggleStatus(form.id, form.status)}
                          >
                            {form.status === "active" ? (
                              <>
                                <Pause className="w-3 h-3 mr-1" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteForm(form.id, form.name)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            {loadingSubmissions ? (
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : submissions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    When people submit your lead capture forms, their information will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>
                    Latest lead submissions from all your forms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {submissions.map((submission: any) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {submission.data?.name || submission.data?.email || 'Anonymous'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {submission.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            {formatSubmissionData(submission.data)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(submission.submittedAt)} • Score: {submission.score}/100
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {loadingAnalytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Submissions by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.submissionsByStatus ? (
                      <div className="space-y-2">
                        {Object.entries(analytics.submissionsByStatus).map(([status, count]) => (
                          <div key={status} className="flex justify-between items-center">
                            <span className="capitalize">{status}</span>
                            <Badge variant="outline">{count as number}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.submissionsBySource ? (
                      <div className="space-y-2">
                        {Object.entries(analytics.submissionsBySource).map(([source, count]) => (
                          <div key={source} className="flex justify-between items-center">
                            <span className="capitalize">{source}</span>
                            <Badge variant="outline">{count as number}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Form Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.formStats ? (
                      <div className="space-y-3">
                        {analytics.formStats.map((form: any) => (
                          <div key={form.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{form.name}</span>
                              <Badge className={getStatusBadge(form.status)}>
                                {form.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                              <span>Submissions: {form.submissions}</span>
                              <span>Conversion: {form.conversionRate}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No forms available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.recentSubmissions ? (
                      <div className="space-y-2">
                        {analytics.recentSubmissions.slice(0, 5).map((submission: any) => (
                          <div key={submission.id} className="flex justify-between items-center text-sm">
                            <span>{submission.data?.name || submission.data?.email || 'Anonymous'}</span>
                            <span className="text-gray-500">{formatDate(submission.submittedAt)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No recent activity</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FeatureGate>
  );
}