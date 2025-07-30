import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { IntegrationsSEO } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  Zap, 
  Check, 
  X, 
  Plus, 
  Settings, 
  Trash2, 
  AlertCircle,
  Key,
  Globe,
  Lock,
  Shield,
  ExternalLink,
  Info
} from "lucide-react";

interface EmailIntegration {
  id: number;
  provider: string;
  email: string;
  displayName?: string;
  isActive: boolean;
  syncStatus: string;
  lastSyncAt?: string;
  errorMessage?: string;
  createdAt: string;
}

interface SMTPFormData {
  provider: "smtp";
  email: string;
  displayName?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpSecurity: "ssl" | "tls" | "none";
  imapHost: string;
  imapPort: number;
  imapUsername: string;
  imapPassword: string;
  imapSecurity: "ssl" | "tls" | "none";
}

export default function Integrations() {
  // Add SEO
  useEffect(() => {
    document.title = "Email Integrations - Connect Gmail, Outlook & SMTP | Savrii";
  }, []);

  const [showSMTPForm, setShowSMTPForm] = useState(false);
  const [smtpFormData, setSMTPFormData] = useState<SMTPFormData>({
    provider: "smtp",
    email: "",
    displayName: "",
    smtpHost: "",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    smtpSecurity: "tls",
    imapHost: "",
    imapPort: 993,
    imapUsername: "",
    imapPassword: "",
    imapSecurity: "ssl"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email integrations
  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["/api/email/integrations"],
  });

  // Gmail App Password setup form data
  const [gmailFormData, setGmailFormData] = useState({
    email: "",
    displayName: "",
    appPassword: ""
  });

  // Gmail App Password connection
  const gmailConnect = useMutation({
    mutationFn: (data: any) => {
      const smtpData = {
        provider: "smtp" as const,
        email: data.email,
        displayName: data.displayName || data.email,
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        smtpUsername: data.email,
        smtpPassword: data.appPassword,
        smtpSecurity: "tls" as const,
        imapHost: "imap.gmail.com", 
        imapPort: 993,
        imapUsername: data.email,
        imapPassword: data.appPassword,
        imapSecurity: "ssl" as const,
      };
      return apiRequest("POST", "/api/email/integrations/smtp", smtpData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/integrations"] });
      toast({
        title: "Gmail Connected",
        description: "Your Gmail account has been connected successfully.",
      });
      setGmailFormData({ email: "", displayName: "", appPassword: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect Gmail account. Please check your credentials.",
        variant: "destructive",
      });
    }
  });

  const handleGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailFormData.email || !gmailFormData.appPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in your email and app password.",
        variant: "destructive",
      });
      return;
    }
    gmailConnect.mutate(gmailFormData);
  };

// Gmail Setup Form Component
function GmailSetupForm({ 
  formData, 
  setFormData, 
  onSubmit 
}: { 
  formData: any; 
  setFormData: any; 
  onSubmit: (e: React.FormEvent) => void; 
}) {
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">How to generate a Gmail App Password:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to your Google Account settings</li>
              <li>Select "Security" → "2-Step Verification" (must be enabled)</li>
              <li>Click "App passwords" at the bottom</li>
              <li>Generate a password for "Mail"</li>
              <li>Copy the 16-character password and paste it below</li>
            </ol>
            <a 
              href="https://myaccount.google.com/apppasswords" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
            >
              Generate App Password <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </AlertDescription>
      </Alert>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gmail-email">Gmail Address</Label>
          <Input
            id="gmail-email"
            type="email"
            placeholder="your.email@gmail.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gmail-display">Display Name (Optional)</Label>
          <Input
            id="gmail-display"
            type="text"
            placeholder="Your Name"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gmail-password">App Password</Label>
          <Input
            id="gmail-password"
            type="password"  
            placeholder="16-character app password"
            value={formData.appPassword}
            onChange={(e) => handleInputChange('appPassword', e.target.value)}
            required
          />
          <p className="text-xs text-gray-500">
            Not your regular password - use the generated App Password from Google
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Connect Gmail Account
        </Button>
      </form>
    </div>
  );
}

  // Outlook OAuth connection - direct redirect
  const handleOutlookConnect = () => {
    window.location.href = "/api/email/auth/outlook";
  };

  // SMTP configuration
  const smtpConnect = useMutation({
    mutationFn: (data: SMTPFormData) => 
      apiRequest("POST", "/api/email/integrations/smtp", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/integrations"] });
      setShowSMTPForm(false);
      setSMTPFormData({
        provider: "smtp",
        email: "",
        displayName: "",
        smtpHost: "",
        smtpPort: 587,
        smtpUsername: "",
        smtpPassword: "",
        smtpSecurity: "tls",
        imapHost: "",
        imapPort: 993,
        imapUsername: "",
        imapPassword: "",
        imapSecurity: "ssl"
      });
      toast({
        title: "SMTP Connected",
        description: "Your SMTP email account has been connected successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "SMTP Connection Failed",
        description: error.message || "Please check your SMTP configuration and try again.",
        variant: "destructive",
      });
    }
  });

  // Delete integration
  const deleteIntegration = useMutation({
    mutationFn: (integrationId: number) => 
      apiRequest("DELETE", `/api/email/integrations/${integrationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/integrations"] });
      toast({
        title: "Integration Removed",
        description: "Email integration has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove integration. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSMTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    smtpConnect.mutate(smtpFormData);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "gmail":
        return <Mail className="h-5 w-5 text-red-500" />;
      case "outlook":
        return <Mail className="h-5 w-5 text-blue-500" />;
      case "smtp":
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <Mail className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (integration: EmailIntegration) => {
    if (integration.syncStatus === "active") {
      return <Badge variant="default" className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Connected</Badge>;
    } else if (integration.syncStatus === "error") {
      return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Error</Badge>;
    } else {
      return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <>
      <IntegrationsSEO />
      <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-['Playfair_Display']">
            Email Integration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Connect your email accounts to access your inbox and enable AI-powered replies
          </p>
        </div>
      </div>

      {/* Current Integrations */}
      {(integrations as EmailIntegration[]).length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white font-['Playfair_Display']">
            Connected Accounts
          </h2>
          <div className="grid gap-4">
            {(integrations as EmailIntegration[]).map((integration) => (
              <Card key={integration.id} className="border-green-200 dark:border-green-800">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    {getProviderIcon(integration.provider)}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {integration.displayName || integration.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {integration.email} • {integration.provider.toUpperCase()}
                      </div>
                      {integration.lastSyncAt && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(integration)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteIntegration.mutate(integration.id)}
                      disabled={deleteIntegration.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
                {integration.errorMessage && (
                  <div className="px-6 pb-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{integration.errorMessage}</AlertDescription>
                    </Alert>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Integration Options */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white font-['Playfair_Display']">
          Connect Email Account
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Gmail OAuth */}
          <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-fit">
                <Mail className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="font-['Playfair_Display']">Gmail</CardTitle>
              <CardDescription>
                Connect your Gmail account using App Passwords - simple and secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integrations?.some((integration: EmailIntegration) => 
                (integration.provider === 'gmail' || 
                 (integration.provider === 'smtp' && integration.email?.includes('gmail.com'))) && 
                integration.isActive
              ) ? (
                <Button 
                  disabled 
                  className="w-full bg-green-600 text-white opacity-75 cursor-not-allowed"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Connected
                </Button>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <Mail className="w-4 h-4 mr-2" />
                      Connect Gmail
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-red-600" />
                        Connect Gmail Account
                      </DialogTitle>
                      <DialogDescription>
                        Use Gmail App Passwords for secure, simple integration without OAuth complexity.
                      </DialogDescription>
                    </DialogHeader>
                    <GmailSetupForm 
                      formData={gmailFormData}
                      setFormData={setGmailFormData}
                      onSubmit={handleGmailSubmit}
                    />
                  </DialogContent>
                </Dialog>
              )}
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                <Key className="h-3 w-3 inline mr-1" />
                App Password authentication
              </div>
            </CardContent>
          </Card>

          {/* Outlook OAuth - Coming Soon */}
          <Card className="border-gray-200 dark:border-gray-700 opacity-60">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-full w-fit">
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
              <CardTitle className="font-['Playfair_Display'] text-gray-500">Outlook</CardTitle>
              <CardDescription>
                Microsoft Outlook integration coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                disabled
                variant="outline"
                className="w-full"
              >
                Coming Soon
              </Button>
              <div className="mt-3 text-xs text-gray-400 text-center">
                Microsoft Graph API integration
              </div>
            </CardContent>
          </Card>

          {/* SMTP Configuration */}
          <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-full w-fit">
                <Settings className="h-8 w-8 text-gray-500" />
              </div>
              <CardTitle className="font-['Playfair_Display']">SMTP/IMAP</CardTitle>
              <CardDescription>
                Configure custom SMTP and IMAP settings for any email provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showSMTPForm} onOpenChange={setShowSMTPForm}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Configure SMTP
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-['Playfair_Display']">SMTP/IMAP Configuration</DialogTitle>
                    <DialogDescription>
                      Enter your email provider's SMTP and IMAP settings to connect your account.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSMTPSubmit} className="space-y-6">
                    {/* Email Settings */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Email Account</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={smtpFormData.email}
                            onChange={(e) => setSMTPFormData({...smtpFormData, email: e.target.value})}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="displayName">Display Name (optional)</Label>
                          <Input
                            id="displayName"
                            value={smtpFormData.displayName}
                            onChange={(e) => setSMTPFormData({...smtpFormData, displayName: e.target.value})}
                            placeholder="Your Name"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* SMTP Settings */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">SMTP Settings (Outgoing Mail)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="smtpHost">SMTP Host</Label>
                          <Input
                            id="smtpHost"
                            value={smtpFormData.smtpHost}
                            onChange={(e) => setSMTPFormData({...smtpFormData, smtpHost: e.target.value})}
                            placeholder="smtp.gmail.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtpPort">SMTP Port</Label>
                          <Input
                            id="smtpPort"
                            type="number"
                            value={smtpFormData.smtpPort}
                            onChange={(e) => setSMTPFormData({...smtpFormData, smtpPort: parseInt(e.target.value)})}
                            placeholder="587"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtpUsername">SMTP Username</Label>
                          <Input
                            id="smtpUsername"
                            value={smtpFormData.smtpUsername}
                            onChange={(e) => setSMTPFormData({...smtpFormData, smtpUsername: e.target.value})}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtpPassword">SMTP Password</Label>
                          <Input
                            id="smtpPassword"
                            type="password"
                            value={smtpFormData.smtpPassword}
                            onChange={(e) => setSMTPFormData({...smtpFormData, smtpPassword: e.target.value})}
                            placeholder="App password or regular password"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtpSecurity">SMTP Security</Label>
                          <Select 
                            value={smtpFormData.smtpSecurity} 
                            onValueChange={(value: "ssl" | "tls" | "none") => 
                              setSMTPFormData({...smtpFormData, smtpSecurity: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tls">TLS (587)</SelectItem>
                              <SelectItem value="ssl">SSL (465)</SelectItem>
                              <SelectItem value="none">None (25)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* IMAP Settings */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">IMAP Settings (Incoming Mail)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="imapHost">IMAP Host</Label>
                          <Input
                            id="imapHost"
                            value={smtpFormData.imapHost}
                            onChange={(e) => setSMTPFormData({...smtpFormData, imapHost: e.target.value})}
                            placeholder="imap.gmail.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="imapPort">IMAP Port</Label>
                          <Input
                            id="imapPort"
                            type="number"
                            value={smtpFormData.imapPort}
                            onChange={(e) => setSMTPFormData({...smtpFormData, imapPort: parseInt(e.target.value)})}
                            placeholder="993"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="imapUsername">IMAP Username</Label>
                          <Input
                            id="imapUsername"
                            value={smtpFormData.imapUsername}
                            onChange={(e) => setSMTPFormData({...smtpFormData, imapUsername: e.target.value})}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="imapPassword">IMAP Password</Label>
                          <Input
                            id="imapPassword"
                            type="password"
                            value={smtpFormData.imapPassword}
                            onChange={(e) => setSMTPFormData({...smtpFormData, imapPassword: e.target.value})}
                            placeholder="App password or regular password"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="imapSecurity">IMAP Security</Label>
                          <Select 
                            value={smtpFormData.imapSecurity} 
                            onValueChange={(value: "ssl" | "tls" | "none") => 
                              setSMTPFormData({...smtpFormData, imapSecurity: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ssl">SSL (993)</SelectItem>
                              <SelectItem value="tls">TLS (143)</SelectItem>
                              <SelectItem value="none">None (143)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowSMTPForm(false)}
                        disabled={smtpConnect.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={smtpConnect.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {smtpConnect.isPending ? "Testing Connection..." : "Connect Account"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                <Key className="h-3 w-3 inline mr-1" />
                Custom SMTP/IMAP configuration
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center font-['Playfair_Display']">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>All credentials are encrypted and stored securely</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>OAuth tokens are refreshed automatically</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>No passwords stored for OAuth connections</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Disconnect anytime without data loss</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center font-['Playfair_Display']">
              <Globe className="h-5 w-5 mr-2 text-green-600" />
              Supported Providers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Gmail (OAuth 2.0 + Gmail API)</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Outlook/Hotmail (Microsoft Graph)</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Custom SMTP/IMAP (any provider)</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Corporate email servers supported</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {(integrations as EmailIntegration[]).length === 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Email integration required:</strong> You need to connect an email account to access your inbox and use AI-powered reply features.
          </AlertDescription>
        </Alert>
      )}
      </div>
    </>
  );
}