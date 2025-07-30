import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Key, 
  Eye, 
  Smartphone, 
  Users, 
  Lock, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  Filter,
  Search,
  AlertTriangle,
  Settings,
  Globe,
  Database,
  FileText,
  Activity,
  Zap
} from "lucide-react";

interface SecuritySettings {
  id: number;
  ssoEnabled: boolean;
  ssoProvider: string;
  ssoMetadata: string;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
    requireUppercase: boolean;
  };
  ipWhitelist: string[];
  apiKeyRotationDays: number;
  auditLogRetentionDays: number;
}

interface AuditLog {
  id: number;
  userId: string;
  userEmail: string;
  action: string;
  category: 'auth' | 'data' | 'api' | 'admin' | 'security';
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
  timestamp: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function SecurityCompliance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [ssoDialogOpen, setSsoDialogOpen] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    category: 'all',
    status: 'all',
    dateRange: '7d',
    search: ''
  });

  // Fetch security settings
  const { data: securitySettings, isLoading: settingsLoading } = useQuery<SecuritySettings>({
    queryKey: ['/api/security/settings'],
    enabled: !!user
  });

  // Fetch audit logs
  const { data: auditLogs = [], isLoading: logsLoading } = useQuery<AuditLog[]>({
    queryKey: ['/api/security/audit-logs', auditFilters],
    enabled: !!user
  });

  // Update security settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: Partial<SecuritySettings>) => 
      apiRequest("PATCH", "/api/security/settings", settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/settings'] });
      toast({
        title: "Settings Updated",
        description: "Security settings have been saved successfully"
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update security settings",
        variant: "destructive"
      });
    }
  });

  // Enable 2FA mutation
  const enable2FAMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/security/2fa/enable"),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/settings'] });
      toast({
        title: "2FA Setup",
        description: "Scan the QR code with your authenticator app"
      });
    }
  });

  // Generate audit report mutation
  const generateReportMutation = useMutation({
    mutationFn: (params: any) => apiRequest("POST", "/api/security/audit-report", params),
    onSuccess: () => {
      toast({
        title: "Report Generated",
        description: "Audit report has been generated and will be emailed to you"
      });
    }
  });

  const handleSettingToggle = (key: keyof SecuritySettings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failure': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return <Key className="w-4 h-4" />;
      case 'data': return <Database className="w-4 h-4" />;
      case 'api': return <Zap className="w-4 h-4" />;
      case 'admin': return <Settings className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesCategory = auditFilters.category === 'all' || log.category === auditFilters.category;
    const matchesStatus = auditFilters.status === 'all' || log.status === auditFilters.status;
    const matchesSearch = !auditFilters.search || 
      log.action.toLowerCase().includes(auditFilters.search.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(auditFilters.search.toLowerCase()) ||
      log.details.toLowerCase().includes(auditFilters.search.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  if (settingsLoading) {
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
          <h1 className="text-2xl font-bold">Security & Compliance</h1>
          <p className="text-muted-foreground">
            Manage authentication, access controls, and security monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => generateReportMutation.mutate({ period: '30d' })}
            disabled={generateReportMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="authentication" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="access-control">Access Control</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-6">
          {/* SSO Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Single Sign-On (SSO)
              </CardTitle>
              <CardDescription>
                Configure SAML-based SSO for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Enable SSO</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to authenticate using your identity provider
                  </p>
                </div>
                <Switch
                  checked={securitySettings?.ssoEnabled || false}
                  onCheckedChange={(checked) => handleSettingToggle('ssoEnabled', checked)}
                />
              </div>

              {securitySettings?.ssoEnabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="sso-provider">SSO Provider</Label>
                      <Select value={securitySettings.ssoProvider}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="okta">Okta</SelectItem>
                          <SelectItem value="azure">Azure AD</SelectItem>
                          <SelectItem value="google">Google Workspace</SelectItem>
                          <SelectItem value="saml">Generic SAML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="sso-domain">SSO Domain</Label>
                      <Input
                        id="sso-domain"
                        placeholder="company.okta.com"
                        value={securitySettings.ssoMetadata}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      SSO is configured and active. Users can sign in using your identity provider.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to user accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Require 2FA</Label>
                  <p className="text-sm text-muted-foreground">
                    Force all users to enable two-factor authentication
                  </p>
                </div>
                <Switch
                  checked={securitySettings?.twoFactorEnabled || false}
                  onCheckedChange={(checked) => handleSettingToggle('twoFactorEnabled', checked)}
                />
              </div>

              {securitySettings?.twoFactorEnabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Supported Methods</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Authenticator Apps (TOTP)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">SMS Verification</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Hardware Security Keys</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Backup Codes</Label>
                      <p className="text-sm text-muted-foreground">
                        Users receive 10 backup codes for account recovery
                      </p>
                      <Button variant="outline" size="sm">
                        Regenerate Backup Codes
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Password Policy
              </CardTitle>
              <CardDescription>
                Set password requirements for user accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="min-length">Minimum Length</Label>
                  <Input
                    id="min-length"
                    type="number"
                    value={securitySettings?.passwordPolicy?.minLength || 8}
                    min="6"
                    max="32"
                  />
                </div>
                
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={securitySettings?.sessionTimeout || 480}
                    min="30"
                    max="1440"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Password Requirements</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require special characters</span>
                    <Switch
                      checked={securitySettings?.passwordPolicy?.requireSpecialChars || false}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require numbers</span>
                    <Switch
                      checked={securitySettings?.passwordPolicy?.requireNumbers || false}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require uppercase letters</span>
                    <Switch
                      checked={securitySettings?.passwordPolicy?.requireUppercase || false}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access-control" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                IP Whitelist
              </CardTitle>
              <CardDescription>
                Restrict access to specific IP addresses or ranges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ip-whitelist">Allowed IP Addresses</Label>
                <Input
                  id="ip-whitelist"
                  placeholder="192.168.1.0/24, 10.0.0.1"
                  value={securitySettings?.ipWhitelist?.join(', ') || ''}
                />
                <p className="text-sm text-muted-foreground">
                  Enter IP addresses or CIDR ranges separated by commas
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Security
              </CardTitle>
              <CardDescription>
                Manage API access and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="api-rotation">API Key Rotation (days)</Label>
                  <Input
                    id="api-rotation"
                    type="number"
                    value={securitySettings?.apiKeyRotationDays || 90}
                    min="30"
                    max="365"
                  />
                </div>
                
                <div>
                  <Label htmlFor="audit-retention">Audit Log Retention (days)</Label>
                  <Input
                    id="audit-retention"
                    type="number"
                    value={securitySettings?.auditLogRetentionDays || 365}
                    min="90"
                    max="2555"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit-logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Security Audit Logs
              </CardTitle>
              <CardDescription>
                Monitor user actions, system access, and security events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={auditFilters.search}
                    onChange={(e) => setAuditFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-64"
                  />
                </div>
                
                <Select
                  value={auditFilters.category}
                  onValueChange={(value) => setAuditFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="data">Data Access</SelectItem>
                    <SelectItem value="api">API Usage</SelectItem>
                    <SelectItem value="admin">Admin Actions</SelectItem>
                    <SelectItem value="security">Security Events</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={auditFilters.status}
                  onValueChange={(value) => setAuditFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={auditFilters.dateRange}
                  onValueChange={(value) => setAuditFilters(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Logs Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="animate-pulse">Loading audit logs...</div>
                        </TableCell>
                      </TableRow>
                    ) : filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="space-y-2">
                            <FileText className="w-8 h-8 mx-auto text-muted-foreground/50" />
                            <p className="text-muted-foreground">No audit logs found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{log.userEmail}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{log.action}</div>
                              <div className="text-sm text-muted-foreground">{log.details}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(log.category)}
                              <span className="capitalize">{log.category}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <span className="capitalize">{log.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRiskLevelColor(log.riskLevel)}>
                              {log.riskLevel}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.ipAddress}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
                <CardDescription>
                  GDPR, CCPA, and other privacy compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Data encryption at rest</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Data encryption in transit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Right to data deletion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Data portability</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Standards</CardTitle>
                <CardDescription>
                  Industry certifications and compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">SOC 2 Type II certified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">ISO 27001 compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">HIPAA compliance available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">PCI DSS Level 1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>
                Generate compliance reports for auditors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="w-6 h-6 mb-2" />
                  <span>Security Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Shield className="w-6 h-6 mb-2" />
                  <span>Access Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Activity className="w-6 h-6 mb-2" />
                  <span>Audit Trail</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}