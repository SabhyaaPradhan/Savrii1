import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FeatureGate } from "@/components/FeatureGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  Mail, 
  Shield, 
  Edit, 
  Trash2, 
  UserPlus,
  Crown,
  Settings,
  Building
} from "lucide-react";

export default function TeamCollaboration() {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState("");

  const proTeamMembers = [
    { id: 1, name: "John Smith", email: "john@company.com", role: "Admin", avatar: null, status: "active" },
    { id: 2, name: "Sarah Johnson", email: "sarah@company.com", role: "Editor", avatar: null, status: "active" },
    { id: 3, name: "Mike Chen", email: "mike@company.com", role: "Viewer", avatar: null, status: "pending" }
  ];

  const enterpriseTeamMembers = [
    ...proTeamMembers,
    { id: 4, name: "Emily Davis", email: "emily@company.com", role: "Admin", avatar: null, status: "active" },
    { id: 5, name: "Alex Rodriguez", email: "alex@company.com", role: "Editor", avatar: null, status: "active" },
    { id: 6, name: "Lisa Wang", email: "lisa@company.com", role: "Editor", avatar: null, status: "active" },
    { id: 7, name: "David Brown", email: "david@company.com", role: "Viewer", avatar: null, status: "active" },
    { id: 8, name: "Jessica Lee", email: "jessica@company.com", role: "Viewer", avatar: null, status: "pending" }
  ];

  const getRoleBadge = (role: string) => {
    const variants = {
      Admin: "bg-red-100 text-red-800",
      Editor: "bg-blue-100 text-blue-800", 
      Viewer: "bg-gray-100 text-gray-800"
    };
    return variants[role as keyof typeof variants] || variants.Viewer;
  };

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800" 
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Team Collaboration
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage team members and collaboration settings
          </p>
        </div>
        <Badge variant="outline" className="text-blue-700 border-blue-300">
          <Users className="w-3 h-3 mr-1" />
          Pro Feature
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Team Overview */}
        <FeatureGate 
          feature="team_collaboration"
          title="Team Collaboration Hub"
          description="Collaborate with up to 3 team members on Pro plan or unlimited members on Enterprise"
        >
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Active Members</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">2</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Admins</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">1</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Pending Invites</div>
              </CardContent>
            </Card>
          </div>

          {/* Invite New Member */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Invite Team Member
              </CardTitle>
              <CardDescription>
                Add new team members to collaborate on client responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <select className="mt-2 px-3 py-2 border rounded-md">
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Send Invite
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your team members and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proTeamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleBadge(member.role)}>
                        {member.role}
                      </Badge>
                      <Badge className={getStatusBadge(member.status)}>
                        {member.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Enterprise Team Features */}
        <FeatureGate 
          feature="unlimited_team"
          title="Enterprise Team Management"
          description="Unlimited team members with advanced permission controls and audit logs"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                Enterprise Team Features
                <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>
              </CardTitle>
              <CardDescription>
                Advanced team management with unlimited members and enterprise controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Advanced Permissions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Custom role definitions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-600" />
                      <span>Department-based access control</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <span>Super admin privileges</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Enterprise Controls</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>Unlimited team members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span>Audit logs and compliance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-600" />
                      <span>SSO integration</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  Enterprise Team Structure
                </h4>
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  Organize unlimited team members across departments with granular permissions and enterprise-grade security controls.
                </div>
              </div>
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Team Activity & Analytics */}
        <FeatureGate 
          feature="team_collaboration"
          title="Team Activity Dashboard"
          description="Monitor team productivity and collaboration metrics"
        >
          <Card>
            <CardHeader>
              <CardTitle>Team Activity</CardTitle>
              <CardDescription>
                Track team performance and collaboration insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">157</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Responses This Month</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">94%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Average Quality Score</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">12m</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Avg Response Time</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">23</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Templates Created</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FeatureGate>
      </div>
    </div>
  );
}