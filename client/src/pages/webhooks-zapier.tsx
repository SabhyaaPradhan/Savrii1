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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Edit, 
  Play, 
  Pause,
  CheckCircle, 
  AlertCircle, 
  Copy,
  ExternalLink,
  Zap,
  Globe,
  Settings,
  Activity,
  Clock,
  Send,
  Shield,
  Code,
  TestTube,
  BarChart3
} from "lucide-react";

interface WebhookEndpoint {
  id: number;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  headers: Record<string, string>;
  retryCount: number;
  timeout: number;
  lastTriggered?: string;
  status: 'active' | 'error' | 'disabled';
  deliveries: {
    total: number;
    successful: number;
    failed: number;
  };
}

interface ZapierIntegration {
  id: number;
  name: string;
  trigger: string;
  zapierWebhookUrl: string;
  active: boolean;
  filters: Record<string, any>;
  lastExecution?: string;
  executionCount: number;
}

interface WebhookDelivery {
  id: number;
  webhookId: number;
  event: string;
  status: 'success' | 'failed' | 'pending';
  httpStatus: number;
  response: string;
  timestamp: string;
  duration: number;
}

export default function WebhooksZapier() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<number | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  // Available webhook events
  const webhookEvents = [
    { id: 'response.generated', label: 'AI Response Generated', description: 'Triggered when an AI response is generated' },
    { id: 'user.login', label: 'User Login', description: 'Triggered when a user logs in' },
    { id: 'plan.upgraded', label: 'Plan Upgraded', description: 'Triggered when user upgrades their plan' },
    { id: 'usage.limit.reached', label: 'Usage Limit Reached', description: 'Triggered when user reaches usage limits' },
    { id: 'prompt.created', label: 'Custom Prompt Created', description: 'Triggered when a custom prompt is created' },
    { id: 'workflow.executed', label: 'Workflow Executed', description: 'Triggered when a workflow completes' },
    { id: 'export.completed', label: 'Export Completed', description: 'Triggered when data export finishes' }
  ];

  // Fetch webhooks
  const { data: webhooks = [], isLoading: webhooksLoading } = useQuery<WebhookEndpoint[]>({
    queryKey: ['/api/webhooks'],
    enabled: !!user
  });

  // Fetch Zapier integrations
  const { data: zapierIntegrations = [], isLoading: zapierLoading } = useQuery<ZapierIntegration[]>({
    queryKey: ['/api/zapier/integrations'],
    enabled: !!user
  });

  // Fetch webhook deliveries
  const { data: deliveries = [], isLoading: deliveriesLoading } = useQuery<WebhookDelivery[]>({
    queryKey: ['/api/webhooks/deliveries'],
    enabled: !!user
  });

  // Create/Update webhook mutation
  const webhookMutation = useMutation({
    mutationFn: (data: Partial<WebhookEndpoint>) => 
      editingWebhook 
        ? apiRequest("PATCH", `/api/webhooks/${editingWebhook.id}`, data)
        : apiRequest("POST", "/api/webhooks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      setDialogOpen(false);
      setEditingWebhook(null);
      setSelectedEvents([]);
      toast({
        title: editingWebhook ? "Webhook Updated" : "Webhook Created",
        description: "Webhook has been saved successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save webhook",
        variant: "destructive"
      });
    }
  });

  // Delete webhook mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/webhooks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast({
        title: "Webhook Deleted",
        description: "Webhook has been removed successfully"
      });
    }
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/webhooks/${id}/test`),
    onSuccess: () => {
      toast({
        title: "Test Sent",
        description: "Test webhook payload has been sent"
      });
      setTestingWebhook(null);
    }
  });

  // Toggle webhook status
  const toggleWebhookMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => 
      apiRequest("PATCH", `/api/webhooks/${id}`, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
    }
  });

  // Zapier integration mutation
  const zapierMutation = useMutation({
    mutationFn: (data: Partial<ZapierIntegration>) => 
      apiRequest("POST", "/api/zapier/integrations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/zapier/integrations'] });
      toast({
        title: "Zapier Integration Created",
        description: "Integration has been set up successfully"
      });
    }
  });

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSubmitWebhook = (formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      url: formData.get('url') as string,
      events: selectedEvents,
      secret: formData.get('secret') as string,
      timeout: parseInt(formData.get('timeout') as string) || 30,
      retryCount: parseInt(formData.get('retryCount') as string) || 3,
      active: true
    };
    
    webhookMutation.mutate(data);
  };

  const openEditDialog = (webhook?: WebhookEndpoint) => {
    if (webhook) {
      setEditingWebhook(webhook);
      setSelectedEvents(webhook.events);
    } else {
      setEditingWebhook(null);
      setSelectedEvents([]);
    }
    setDialogOpen(true);
  };

  const copyWebhookSecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Secret Copied",
      description: "Webhook secret has been copied to clipboard"
    });
  };

  if (webhooksLoading || zapierLoading) {
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
          <h1 className="text-2xl font-bold">Webhooks & Zapier Integration</h1>
          <p className="text-muted-foreground">
            Set up webhooks and automation integrations to connect with external services
          </p>
        </div>
        
        <Button onClick={() => openEditDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      <Tabs defaultValue="webhooks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="zapier">Zapier Integration</TabsTrigger>
          <TabsTrigger value="deliveries">Delivery Logs</TabsTrigger>
          <TabsTrigger value="events">Available Events</TabsTrigger>
        </TabsList>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          {webhooks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Webhook className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Webhooks Configured</h3>
                <p className="text-muted-foreground mb-4">
                  Set up your first webhook to receive real-time notifications when events occur
                </p>
                <Button onClick={() => openEditDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          webhook.status === 'active' ? 'bg-green-500' : 
                          webhook.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <CardTitle className="text-lg">{webhook.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Globe className="w-4 h-4" />
                            {webhook.url}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={webhook.active}
                          onCheckedChange={(checked) => 
                            toggleWebhookMutation.mutate({ id: webhook.id, active: checked })
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTestingWebhook(webhook.id)}
                        >
                          <TestTube className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(webhook)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Events</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {webhook.events.map(event => (
                            <Badge key={event} variant="secondary" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Delivery Stats</Label>
                        <div className="text-sm text-muted-foreground mt-1">
                          {webhook.deliveries.successful}/{webhook.deliveries.total} successful
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Last Triggered</Label>
                        <div className="text-sm text-muted-foreground mt-1">
                          {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : 'Never'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Secret: </span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {webhook.secret.substring(0, 8)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyWebhookSecret(webhook.secret)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Timeout: {webhook.timeout}s | Retries: {webhook.retryCount}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Zapier Integration Tab */}
        <TabsContent value="zapier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Zapier Integration Setup
              </CardTitle>
              <CardDescription>
                Connect Savrii with 5,000+ apps through Zapier automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Setup</CardTitle>
                    <CardDescription>
                      Connect Savrii to Zapier in a few clicks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" asChild>
                      <a href="https://zapier.com/apps/savrii/integrations" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Zapier Integration
                      </a>
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      This will open Zapier where you can create automations using Savrii triggers and actions.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Custom Webhook</CardTitle>
                    <CardDescription>
                      Set up a custom Zapier webhook URL
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      zapierMutation.mutate({
                        name: formData.get('zapierName') as string,
                        trigger: formData.get('zapierTrigger') as string,
                        zapierWebhookUrl: formData.get('zapierUrl') as string,
                        active: true,
                        executionCount: 0
                      });
                    }}>
                      <div>
                        <Label htmlFor="zapier-name">Integration Name</Label>
                        <Input
                          id="zapier-name"
                          name="zapierName"
                          placeholder="My Zapier Integration"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="zapier-trigger">Trigger Event</Label>
                        <Select name="zapierTrigger" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trigger event" />
                          </SelectTrigger>
                          <SelectContent>
                            {webhookEvents.map(event => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="zapier-url">Zapier Webhook URL</Label>
                        <Input
                          id="zapier-url"
                          name="zapierUrl"
                          placeholder="https://hooks.zapier.com/hooks/catch/..."
                          required
                        />
                      </div>
                      
                      <Button type="submit" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Integration
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {zapierIntegrations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Active Integrations</h3>
                  {zapierIntegrations.map(integration => (
                    <Card key={integration.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{integration.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Trigger: {integration.trigger} • Executions: {integration.executionCount}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={integration.active ? "default" : "secondary"}>
                              {integration.active ? "Active" : "Disabled"}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Logs Tab */}
        <TabsContent value="deliveries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Webhook Delivery Logs
              </CardTitle>
              <CardDescription>
                Monitor webhook delivery status and debug issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deliveries.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Deliveries Yet</h3>
                  <p className="text-muted-foreground">
                    Webhook deliveries will appear here once your webhooks start receiving events
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveries.map(delivery => (
                    <div key={delivery.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {delivery.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : delivery.status === 'failed' ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="font-medium">{delivery.event}</span>
                          <Badge variant="outline">HTTP {delivery.httpStatus}</Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {new Date(delivery.timestamp).toLocaleString()} • {delivery.duration}ms
                        </div>
                      </div>
                      
                      {delivery.response && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium">Response</summary>
                          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                            {delivery.response}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Webhook Events</CardTitle>
              <CardDescription>
                Events that can trigger webhook notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {webhookEvents.map(event => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{event.label}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-2 inline-block">
                          {event.id}
                        </code>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        <Code className="w-4 h-4 mr-2" />
                        View Payload
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Webhook Dialog */}
      <Dialog open={!!testingWebhook} onOpenChange={() => setTestingWebhook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Webhook</DialogTitle>
            <DialogDescription>
              Send a test payload to verify your webhook is working correctly
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Test Event</Label>
              <Select defaultValue="response.generated">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {webhookEvents.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Test Payload</Label>
              <Textarea
                className="font-mono text-sm"
                rows={6}
                readOnly
                value={JSON.stringify({
                  event: "response.generated",
                  timestamp: new Date().toISOString(),
                  data: {
                    userId: "user123",
                    responseId: "resp456",
                    content: "This is a test AI response",
                    confidence: 0.95
                  }
                }, null, 2)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestingWebhook(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => testingWebhook && testWebhookMutation.mutate(testingWebhook)}
              disabled={testWebhookMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {testWebhookMutation.isPending ? 'Sending...' : 'Send Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Webhook Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingWebhook ? 'Edit Webhook' : 'Add New Webhook'}
            </DialogTitle>
            <DialogDescription>
              Configure webhook endpoint to receive event notifications
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmitWebhook(new FormData(e.currentTarget));
          }}>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Webhook Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingWebhook?.name}
                    placeholder="My Webhook"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="url">Endpoint URL</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    defaultValue={editingWebhook?.url}
                    placeholder="https://your-api.com/webhook"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label>Events to Subscribe</Label>
                <div className="grid gap-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {webhookEvents.map(event => (
                    <label key={event.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.id)}
                        onChange={() => handleEventToggle(event.id)}
                        className="rounded"
                      />
                      <div>
                        <div className="font-medium text-sm">{event.label}</div>
                        <div className="text-xs text-muted-foreground">{event.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="secret">Webhook Secret</Label>
                  <Input
                    id="secret"
                    name="secret"
                    defaultValue={editingWebhook?.secret}
                    placeholder="Auto-generated"
                  />
                </div>
                
                <div>
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    name="timeout"
                    type="number"
                    defaultValue={editingWebhook?.timeout || 30}
                    min="5"
                    max="300"
                  />
                </div>
                
                <div>
                  <Label htmlFor="retryCount">Retry Count</Label>
                  <Input
                    id="retryCount"
                    name="retryCount"
                    type="number"
                    defaultValue={editingWebhook?.retryCount || 3}
                    min="0"
                    max="10"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={webhookMutation.isPending}>
                {webhookMutation.isPending ? 'Saving...' : editingWebhook ? 'Update' : 'Create'} Webhook
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}