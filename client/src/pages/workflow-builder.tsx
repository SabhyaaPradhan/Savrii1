import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FeatureGate } from "@/components/FeatureGate";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Settings,
  Trash2,
  Copy,
  Edit,
  Save,
  ArrowRight,
  Zap,
  Mail,
  MessageCircle,
  FileText,
  Calendar,
  Globe,
  Database,
  Code,
  Webhook,
  GitBranch,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreVertical
} from "lucide-react";

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  title: string;
  description: string;
  icon: any;
  service: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[];
}

interface WorkflowData {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  nodes: WorkflowNode[];
  triggers: number;
  actions: number;
  lastRun?: string;
  createdAt: string;
  runs: number;
  successRate: number;
}

const TRIGGER_TYPES = [
  { id: 'form_submit', name: 'Form Submission', icon: FileText, service: 'forms' },
  { id: 'email_received', name: 'Email Received', icon: Mail, service: 'email' },
  { id: 'webhook', name: 'Webhook', icon: Webhook, service: 'webhook' },
  { id: 'schedule', name: 'Schedule', icon: Clock, service: 'scheduler' },
  { id: 'new_lead', name: 'New Lead', icon: Database, service: 'crm' },
  { id: 'chat_message', name: 'Chat Message', icon: MessageCircle, service: 'chat' },
];

const ACTION_TYPES = [
  { id: 'send_email', name: 'Send Email', icon: Mail, service: 'email' },
  { id: 'slack_message', name: 'Send Slack Message', icon: MessageCircle, service: 'slack' },
  { id: 'create_task', name: 'Create Task', icon: Calendar, service: 'project' },
  { id: 'update_crm', name: 'Update CRM', icon: Database, service: 'crm' },
  { id: 'send_webhook', name: 'Send Webhook', icon: Webhook, service: 'webhook' },
  { id: 'generate_ai_response', name: 'Generate AI Response', icon: Zap, service: 'ai' },
  { id: 'save_to_database', name: 'Save to Database', icon: Database, service: 'database' },
];

export default function WorkflowBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedNode, setDraggedNode] = useState<any>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Fetch workflows
  const { data: workflows = [], isLoading } = useQuery<WorkflowData[]>({
    queryKey: ['/api/workflows'],
    enabled: !!user
  });

  // Create workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => 
      apiRequest("POST", "/api/workflows", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      toast({
        title: "Workflow Created",
        description: "Your new workflow has been created successfully"
      });
    }
  });

  // Update workflow mutation
  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkflowData> }) =>
      apiRequest("PATCH", `/api/workflows/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      toast({
        title: "Workflow Updated",
        description: "Your workflow has been saved successfully"
      });
    }
  });

  // Delete workflow mutation
  const deleteWorkflowMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/workflows/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      setSelectedWorkflow(null);
      toast({
        title: "Workflow Deleted",
        description: "Workflow has been deleted successfully"
      });
    }
  });

  const handleCreateWorkflow = () => {
    const name = prompt("Enter workflow name:");
    if (name) {
      const description = prompt("Enter workflow description (optional):") || "";
      createWorkflowMutation.mutate({ name, description });
    }
  };

  const handleDragStart = (nodeType: any) => {
    setDraggedNode(nodeType);
  };

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNode || !selectedWorkflow || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvasOffset.x) / zoom;
    const y = (e.clientY - rect.top - canvasOffset.y) / zoom;

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: draggedNode.type || 'action',
      title: draggedNode.name,
      description: `Configure ${draggedNode.name}`,
      icon: draggedNode.icon,
      service: draggedNode.service,
      config: {},
      position: { x, y },
      connections: []
    };

    const updatedWorkflow = {
      ...selectedWorkflow,
      nodes: [...selectedWorkflow.nodes, newNode]
    };

    setSelectedWorkflow(updatedWorkflow);
    setDraggedNode(null);
  }, [draggedNode, selectedWorkflow, canvasOffset, zoom]);

  const handleNodeClick = (node: WorkflowNode) => {
    setSelectedNode(node);
    setIsConfigDialogOpen(true);
  };

  const saveNodeConfig = (config: Record<string, any>) => {
    if (!selectedNode || !selectedWorkflow) return;

    const updatedNodes = selectedWorkflow.nodes.map(node =>
      node.id === selectedNode.id ? { ...node, config } : node
    );

    const updatedWorkflow = { ...selectedWorkflow, nodes: updatedNodes };
    setSelectedWorkflow(updatedWorkflow);
    setIsConfigDialogOpen(false);
  };

  const saveWorkflow = () => {
    if (!selectedWorkflow) return;
    updateWorkflowMutation.mutate({
      id: selectedWorkflow.id,
      data: selectedWorkflow
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'paused': return Pause;
      default: return XCircle;
    }
  };

  return (
    <FeatureGate 
      feature="workflow_automation"
      fallback={
        <div className="text-center py-12">
          <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Workflow Builder</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Create powerful automation workflows with our visual builder
          </p>
          <Button>Upgrade to Enterprise</Button>
        </div>
      }
    >
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">
              Workflow Builder
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Create and manage automated workflows with drag-and-drop simplicity
            </p>
          </div>
          <Button onClick={handleCreateWorkflow} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Workflow
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Workflows List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Workflows</CardTitle>
                <CardDescription>
                  {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {workflows.map((workflow: WorkflowData) => (
                  <motion.div
                    key={workflow.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedWorkflow?.id === workflow.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{workflow.name}</h3>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(workflow.status)}`} />
                        <Badge variant="outline" className="text-xs">
                          {workflow.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{workflow.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{workflow.triggers} triggers, {workflow.actions} actions</span>
                      <span>{workflow.runs} runs</span>
                    </div>
                  </motion.div>
                ))}
                
                {workflows.length === 0 && (
                  <div className="text-center py-8">
                    <Workflow className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No workflows yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCreateWorkflow}
                      className="mt-2"
                    >
                      Create First Workflow
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Node Palette */}
            {selectedWorkflow && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Components</CardTitle>
                  <CardDescription>Drag to add to workflow</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Triggers */}
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-blue-600">Triggers</h4>
                    <div className="space-y-2">
                      {TRIGGER_TYPES.map((trigger) => (
                        <motion.div
                          key={trigger.id}
                          className="flex items-center gap-2 p-2 border rounded-lg cursor-grab hover:border-blue-300 bg-blue-50 dark:bg-blue-900/20"
                          draggable
                          onDragStart={() => handleDragStart({ ...trigger, type: 'trigger' })}
                          whileHover={{ scale: 1.02 }}
                        >
                          <trigger.icon className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium">{trigger.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-green-600">Actions</h4>
                    <div className="space-y-2">
                      {ACTION_TYPES.map((action) => (
                        <motion.div
                          key={action.id}
                          className="flex items-center gap-2 p-2 border rounded-lg cursor-grab hover:border-green-300 bg-green-50 dark:bg-green-900/20"
                          draggable
                          onDragStart={() => handleDragStart({ ...action, type: 'action' })}
                          whileHover={{ scale: 1.02 }}
                        >
                          <action.icon className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium">{action.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Canvas */}
          <div className="lg:col-span-3">
            {selectedWorkflow ? (
              <Card className="h-[700px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Workflow className="w-5 h-5" />
                      {selectedWorkflow.name}
                    </CardTitle>
                    <CardDescription>{selectedWorkflow.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={saveWorkflow}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newStatus = selectedWorkflow.status === 'active' ? 'paused' : 'active';
                        updateWorkflowMutation.mutate({
                          id: selectedWorkflow.id,
                          data: { status: newStatus }
                        });
                      }}
                    >
                      {selectedWorkflow.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div
                    ref={canvasRef}
                    className="relative w-full h-[600px] bg-gray-50 dark:bg-gray-900 overflow-hidden"
                    onDrop={handleCanvasDrop}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      backgroundImage: `radial-gradient(circle, #ccc 1px, transparent 1px)`,
                      backgroundSize: '20px 20px',
                      backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`
                    }}
                  >
                    {/* Workflow Nodes */}
                    <AnimatePresence>
                      {selectedWorkflow.nodes.map((node, index) => (
                        <motion.div
                          key={node.id}
                          className={`absolute cursor-pointer ${
                            node.type === 'trigger' ? 'bg-blue-100 border-blue-300' :
                            node.type === 'action' ? 'bg-green-100 border-green-300' :
                            'bg-purple-100 border-purple-300'
                          } border-2 rounded-lg p-3 min-w-[150px] shadow-sm hover:shadow-md transition-shadow`}
                          style={{
                            left: node.position.x * zoom + canvasOffset.x,
                            top: node.position.y * zoom + canvasOffset.y,
                            transform: `scale(${zoom})`
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => handleNodeClick(node)}
                          whileHover={{ scale: zoom * 1.05 }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <node.icon className={`w-4 h-4 ${
                              node.type === 'trigger' ? 'text-blue-600' :
                              node.type === 'action' ? 'text-green-600' :
                              'text-purple-600'
                            }`} />
                            <span className="font-medium text-sm">{node.title}</span>
                          </div>
                          <p className="text-xs text-gray-600">{node.description}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {node.service}
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Empty State */}
                    {selectedWorkflow.nodes.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Start Building Your Workflow
                          </h3>
                          <p className="text-gray-500 mb-4">
                            Drag triggers and actions from the sidebar to create your automation
                          </p>
                          <ArrowRight className="w-6 h-6 text-gray-400 mx-auto animate-pulse" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[700px]">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select a Workflow</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Choose a workflow from the sidebar to start building or create a new one
                    </p>
                    <Button onClick={handleCreateWorkflow}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Node Configuration Dialog */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedNode && <selectedNode.icon className="w-5 h-5" />}
                Configure {selectedNode?.title}
              </DialogTitle>
              <DialogDescription>
                Set up the configuration for this {selectedNode?.type}
              </DialogDescription>
            </DialogHeader>
            
            {selectedNode && (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input 
                    defaultValue={selectedNode.title}
                    placeholder="Enter a name for this step"
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    defaultValue={selectedNode.description}
                    placeholder="Describe what this step does"
                    rows={2}
                  />
                </div>

                {/* Service-specific configuration */}
                {selectedNode.service === 'email' && (
                  <div className="space-y-3">
                    <div>
                      <Label>To Email</Label>
                      <Input placeholder="recipient@example.com" />
                    </div>
                    <div>
                      <Label>Subject</Label>
                      <Input placeholder="Email subject" />
                    </div>
                    <div>
                      <Label>Message</Label>
                      <Textarea placeholder="Email content" rows={3} />
                    </div>
                  </div>
                )}

                {selectedNode.service === 'slack' && (
                  <div className="space-y-3">
                    <div>
                      <Label>Channel</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">#general</SelectItem>
                          <SelectItem value="alerts">#alerts</SelectItem>
                          <SelectItem value="team">#team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Message</Label>
                      <Textarea placeholder="Slack message content" rows={3} />
                    </div>
                  </div>
                )}

                {selectedNode.service === 'webhook' && (
                  <div className="space-y-3">
                    <div>
                      <Label>Webhook URL</Label>
                      <Input placeholder="https://example.com/webhook" />
                    </div>
                    <div>
                      <Label>Method</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="HTTP Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => saveNodeConfig({})}>
                    Save Configuration
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </FeatureGate>
  );
}