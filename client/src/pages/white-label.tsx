import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Paintbrush, 
  Upload, 
  Globe, 
  Palette, 
  Monitor,
  Eye,
  Save,
  RotateCcw,
  Download,
  Link,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Code,
  Settings
} from "lucide-react";

interface WhiteLabelSettings {
  id: number;
  logoUrl: string;
  faviconUrl: string;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customDomain: string;
  domainVerified: boolean;
  customCss: string;
  hideFooter: boolean;
  hidePoweredBy: boolean;
  customTermsUrl: string;
  customPrivacyUrl: string;
  customSupportEmail: string;
  loginPageCustomization: {
    backgroundImage: string;
    welcomeMessage: string;
    subtitle: string;
  };
}

export default function WhiteLabel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'logo' | 'favicon' | 'background'>('logo');

  // Fetch white-label settings
  const { data: settings, isLoading } = useQuery<WhiteLabelSettings>({
    queryKey: ['/api/white-label/settings'],
    enabled: !!user
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<WhiteLabelSettings>) => 
      apiRequest("PATCH", "/api/white-label/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/white-label/settings'] });
      toast({
        title: "Settings Updated",
        description: "White-label settings have been saved successfully"
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update white-label settings",
        variant: "destructive"
      });
    }
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/white-label/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data) => {
      if (uploadType === 'logo') {
        setLogoPreview(data.url);
      } else if (uploadType === 'favicon') {
        setFaviconPreview(data.url);
      }
      setUploadDialogOpen(false);
      toast({
        title: "Upload Successful",
        description: `${uploadType} has been uploaded successfully`
      });
    }
  });

  // Verify domain mutation
  const verifyDomainMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/white-label/verify-domain"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/white-label/settings'] });
      toast({
        title: "Domain Verified",
        description: "Your custom domain has been verified successfully"
      });
    }
  });

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', uploadType);
    
    uploadFileMutation.mutate(formData);
  };

  const handleColorChange = (colorType: string, color: string) => {
    updateSettingsMutation.mutate({ [colorType]: color });
  };

  const resetToDefaults = () => {
    const defaults = {
      primaryColor: "#3b82f6",
      secondaryColor: "#64748b",
      accentColor: "#10b981",
      brandName: "Savrii",
      hideFooter: false,
      hidePoweredBy: false
    };
    updateSettingsMutation.mutate(defaults);
  };

  const generatePreviewUrl = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      preview: 'true',
      primaryColor: settings?.primaryColor || "#3b82f6",
      brandName: settings?.brandName || "Savrii"
    });
    return `${baseUrl}?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold">White-label Settings</h1>
          <p className="text-muted-foreground">
            Customize the platform branding to match your organization
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview Changes'}
          </Button>
          <Button onClick={resetToDefaults} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="colors">Colors & Theme</TabsTrigger>
          <TabsTrigger value="domain">Custom Domain</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Logo & Brand Assets
              </CardTitle>
              <CardDescription>
                Upload your company logo and favicon to replace the default branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <Label>Company Logo</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {logoPreview || settings?.logoUrl ? (
                      <div className="space-y-2">
                        <img 
                          src={logoPreview || settings?.logoUrl} 
                          alt="Logo preview" 
                          className="max-h-16 mx-auto"
                        />
                        <p className="text-sm text-muted-foreground">Current logo</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No logo uploaded</p>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setUploadType('logo');
                      setUploadDialogOpen(true);
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Recommended: PNG or SVG, max 5MB, optimal size: 200x60px
                  </p>
                </div>

                {/* Favicon Upload */}
                <div className="space-y-4">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {faviconPreview || settings?.faviconUrl ? (
                      <div className="space-y-2">
                        <img 
                          src={faviconPreview || settings?.faviconUrl} 
                          alt="Favicon preview" 
                          className="w-8 h-8 mx-auto"
                        />
                        <p className="text-sm text-muted-foreground">Current favicon</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-8 h-8 mx-auto bg-gray-200 rounded"></div>
                        <p className="text-sm text-muted-foreground">No favicon uploaded</p>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setUploadType('favicon');
                      setUploadDialogOpen(true);
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Favicon
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Recommended: ICO or PNG, 32x32px or 16x16px
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="brand-name">Brand Name</Label>
                  <Input
                    id="brand-name"
                    value={settings?.brandName || ''}
                    onChange={(e) => updateSettingsMutation.mutate({ brandName: e.target.value })}
                    placeholder="Your Company Name"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This will replace "Savrii" throughout the platform
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Customization</CardTitle>
              <CardDescription>
                Control what elements are visible to your users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Hide Footer</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove the footer from all pages
                  </p>
                </div>
                <Switch
                  checked={settings?.hideFooter || false}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ hideFooter: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Hide "Powered by Savrii"</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove branding attribution
                  </p>
                </div>
                <Switch
                  checked={settings?.hidePoweredBy || false}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ hidePoweredBy: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors & Theme Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Color Scheme
              </CardTitle>
              <CardDescription>
                Customize the colors to match your brand identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings?.primaryColor || "#3b82f6"}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings?.primaryColor || "#3b82f6"}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Used for buttons, links, and highlights
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings?.secondaryColor || "#64748b"}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings?.secondaryColor || "#64748b"}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      placeholder="#64748b"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Used for secondary elements and text
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings?.accentColor || "#10b981"}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings?.accentColor || "#10b981"}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      placeholder="#10b981"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Used for success states and notifications
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                <h4 className="font-medium mb-3">Color Preview</h4>
                <div className="flex items-center gap-4">
                  <Button style={{ backgroundColor: settings?.primaryColor || "#3b82f6" }}>
                    Primary Button
                  </Button>
                  <Button 
                    variant="secondary" 
                    style={{ backgroundColor: settings?.secondaryColor || "#64748b" }}
                  >
                    Secondary Button
                  </Button>
                  <Badge style={{ backgroundColor: settings?.accentColor || "#10b981" }}>
                    Accent Badge
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Domain Tab */}
        <TabsContent value="domain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Custom Domain
              </CardTitle>
              <CardDescription>
                Connect your own domain to access the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-domain">Custom Domain</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="custom-domain"
                      value={settings?.customDomain || ''}
                      onChange={(e) => updateSettingsMutation.mutate({ customDomain: e.target.value })}
                      placeholder="app.yourcompany.com"
                    />
                    <Button 
                      onClick={() => verifyDomainMutation.mutate()}
                      disabled={verifyDomainMutation.isPending}
                    >
                      {verifyDomainMutation.isPending ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {settings?.domainVerified ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">Domain verified and active</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600">Domain not verified</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <h4 className="font-medium mb-2">DNS Configuration</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Add these DNS records to your domain provider:
                </p>
                <div className="space-y-2 font-mono text-sm">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                    <strong>Type:</strong> CNAME<br />
                    <strong>Name:</strong> app (or your subdomain)<br />
                    <strong>Value:</strong> platform.savrii.com
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Custom CSS
              </CardTitle>
              <CardDescription>
                Add custom CSS for advanced styling (Enterprise only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custom-css">Custom CSS</Label>
                <textarea
                  id="custom-css"
                  value={settings?.customCss || ''}
                  onChange={(e) => updateSettingsMutation.mutate({ customCss: e.target.value })}
                  className="w-full h-32 p-3 border rounded-md font-mono text-sm"
                  placeholder="/* Your custom CSS here */
.navbar {
  background-color: #your-color;
}

.sidebar {
  border-left: 3px solid #your-accent;
}"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Add custom CSS to override default styling. Use with caution.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legal & Support Links</CardTitle>
              <CardDescription>
                Customize legal and support page URLs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="terms-url">Terms of Service URL</Label>
                  <Input
                    id="terms-url"
                    value={settings?.customTermsUrl || ''}
                    onChange={(e) => updateSettingsMutation.mutate({ customTermsUrl: e.target.value })}
                    placeholder="https://yourcompany.com/terms"
                  />
                </div>
                
                <div>
                  <Label htmlFor="privacy-url">Privacy Policy URL</Label>
                  <Input
                    id="privacy-url"
                    value={settings?.customPrivacyUrl || ''}
                    onChange={(e) => updateSettingsMutation.mutate({ customPrivacyUrl: e.target.value })}
                    placeholder="https://yourcompany.com/privacy"
                  />
                </div>
                
                <div>
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={settings?.customSupportEmail || ''}
                    onChange={(e) => updateSettingsMutation.mutate({ customSupportEmail: e.target.value })}
                    placeholder="support@yourcompany.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {uploadType === 'logo' ? 'Logo' : 'Favicon'}</DialogTitle>
            <DialogDescription>
              Select a file to upload as your {uploadType}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept={uploadType === 'favicon' ? '.ico,.png' : '.png,.jpg,.jpeg,.svg'}
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p>Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {uploadType === 'favicon' 
                    ? 'ICO or PNG, 32x32px recommended' 
                    : 'PNG, JPG, or SVG, max 5MB'}
                </p>
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}