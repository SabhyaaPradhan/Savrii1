import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Settings, 
  Crown, 
  Shield, 
  User, 
  Edit3, 
  Trash2, 
  Send, 
  Copy, 
  Share2,
  FileText,
  Lock,
  Unlock,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FeatureGate } from "@/components/FeatureGate";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'invited' | 'pending';
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  permissions: {
    canEditPrompts: boolean;
    canInviteMembers: boolean;
    canManageRoles: boolean;
    canDeletePrompts: boolean;
  };
}

interface SharedPrompt {
  id: string;
  title: string;
  category: string;
  sharedBy: string;
  sharedAt: string;
  permissions: 'view' | 'edit';
  collaborators: number;
  isPublic: boolean;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  sentAt: string;
  status: 'pending' | 'accepted' | 'expired';
}

const ROLE_DESCRIPTIONS = {
  owner: "Full access to all features and settings",
  admin: "Can manage team members and all prompts",
  editor: "Can create and edit shared prompts",
  viewer: "Can view and use shared prompts only"
};

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  editor: Edit3,
  viewer: User
};

export default function Collaboration() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviteMessage, setInviteMessage] = useState("");
  const [searchMembers, setSearchMembers] = useState("");
  const [searchPrompts, setSearchPrompts] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: teamMembers = [], isLoading: loadingMembers } = useQuery({
    queryKey: ['/api/team/members'],
    queryFn: async () => {
      const response = await fetch('/api/team/members');
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      return response.json();
    }
  });

  const { data: sharedPrompts = [], isLoading: loadingPrompts } = useQuery({
    queryKey: ['/api/team/prompts'],
    queryFn: async () => {
      const response = await fetch('/api/team/prompts');
      if (!response.ok) {
        throw new Error('Failed to fetch shared prompts');
      }
      return response.json();
    }
  });

  const { data: pendingInvitations = [] } = useQuery({
    queryKey: ['/api/team/invitations'],
    queryFn: async () => {
      const response = await fetch('/api/team/invitations');
      if (!response.ok) {
        throw new Error('Failed to fetch team invitations');
      }
      return response.json();
    }
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async (data: { email: string; role: string; message?: string }) => {
      return apiRequest("POST", "/api/team/invite", data);
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
        description: "Team member invitation has been sent successfully.",
      });
      setInviteEmail("");
      setInviteMessage("");
      setIsInviteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/team/invitations'] });
    },
    onError: () => {
      toast({
        title: "Invitation Failed",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: { memberId: string; role: string }) => {
      return apiRequest("PATCH", `/api/team/members/${data.memberId}/role`, { role: data.role });
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "Team member role has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/team/members'] });
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return apiRequest("DELETE", `/api/team/members/${memberId}`);
    },
    onSuccess: () => {
      toast({
        title: "Member Removed",
        description: "Team member has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/team/members'] });
    }
  });

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return;
    
    inviteMemberMutation.mutate({
      email: inviteEmail,
      role: inviteRole,
      message: inviteMessage
    });
  };

  const formatDate = (dateString: string | Date) => {
    if (dateString === "Never" || !dateString) return "Never";
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  const formatLastActive = (dateString: string | Date) => {
    if (dateString === "Never" || !dateString) return "Never";
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    updateRoleMutation.mutate({ memberId, role: newRole });
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      removeMemberMutation.mutate(memberId);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      invited: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      pending: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      owner: "text-purple-600 dark:text-purple-400",
      admin: "text-blue-600 dark:text-blue-400",
      editor: "text-green-600 dark:text-green-400",
      viewer: "text-gray-600 dark:text-gray-400"
    };
    return colors[role as keyof typeof colors] || colors.viewer;
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchMembers.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchMembers.toLowerCase());
    const matchesRole = filterRole === "all" || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredPrompts = sharedPrompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchPrompts.toLowerCase()) ||
    prompt.category.toLowerCase().includes(searchPrompts.toLowerCase())
  );

  return (
    <FeatureGate 
      feature="team_collaboration" 
      fallback={
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            Invite team members, assign roles, and collaborate on shared prompts. Upgrade to Pro to unlock team features.
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
              <Users className="w-8 h-8 text-emerald-600" />
              Collaboration Tools
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your team members and shared prompt templates
            </p>
          </div>
          
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team and collaborate on prompts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer - {ROLE_DESCRIPTIONS.viewer}</SelectItem>
                      <SelectItem value="editor">Editor - {ROLE_DESCRIPTIONS.editor}</SelectItem>
                      <SelectItem value="admin">Admin - {ROLE_DESCRIPTIONS.admin}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Welcome to our team! Looking forward to collaborating..."
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleInviteMember} 
                  disabled={!inviteEmail.trim() || inviteMemberMutation.isPending}
                  className="w-full"
                >
                  {inviteMemberMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="prompts">Shared Prompts</TabsTrigger>
            <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="members" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search team members..."
                  value={searchMembers}
                  onChange={(e) => setSearchMembers(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Team Members List */}
            <div className="grid gap-4">
              {loadingMembers ? (
                [...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse flex items-center space-x-4">
                        <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                filteredMembers.map((member) => {
                  const RoleIcon = ROLE_ICONS[member.role];
                  return (
                    <Card key={member.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                                <Badge className={getStatusBadge(member.status)}>
                                  {member.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{member.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <RoleIcon className={`w-4 h-4 ${getRoleColor(member.role)}`} />
                                <span className={`text-sm font-medium ${getRoleColor(member.role)}`}>
                                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                </span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500">Last active: {member.lastActive}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {member.role !== 'owner' && (
                              <>
                                <Select 
                                  value={member.role} 
                                  onValueChange={(value) => handleRoleChange(member.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                    <SelectItem value="editor">Editor</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem 
                                      onClick={() => handleRemoveMember(member.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Remove Member
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Shared Prompts Tab */}
          <TabsContent value="prompts" className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search shared prompts..."
                value={searchPrompts}
                onChange={(e) => setSearchPrompts(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Shared Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingPrompts ? (
                [...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                filteredPrompts.map((prompt) => (
                  <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{prompt.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{prompt.category}</Badge>
                            {prompt.isPublic ? (
                              <Unlock className="w-3 h-3 text-green-600" />
                            ) : (
                              <Lock className="w-3 h-3 text-gray-500" />
                            )}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Prompt
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            {prompt.permissions === 'edit' && (
                              <DropdownMenuItem>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                          <span>Shared by {prompt.sharedBy}</span>
                          <span>{prompt.sharedAt}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant={prompt.permissions === 'edit' ? 'default' : 'secondary'}>
                            {prompt.permissions === 'edit' ? 'Can Edit' : 'View Only'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {prompt.collaborators} collaborators
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Pending Invitations Tab */}
          <TabsContent value="invitations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Pending Invitations
                </CardTitle>
                <CardDescription>
                  Manage sent invitations and track their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingInvitations.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Pending Invitations</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      All team invitations have been accepted or expired.
                    </p>
                    <Button onClick={() => setIsInviteDialogOpen(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Send New Invitation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingInvitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{invitation.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{invitation.role}</Badge>
                            <span className="text-sm text-gray-500">Sent {invitation.sentAt}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusBadge(invitation.status)}>
                            {invitation.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Resend
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FeatureGate>
  );
}