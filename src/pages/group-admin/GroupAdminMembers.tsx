import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { api } from "../../lib/api";
import { useToast } from "../../hooks/use-toast";
import {
  Users,
  UserPlus,
  Mail,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  UserX,
  MessageSquare,
  Calendar,
  MapPin,
  Loader2
} from "lucide-react";

interface GroupMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
  lastActivity: string;
  phone: string;
  location: string;
  attendance: string;
  posts: number;
  comments: number;
}

// Default data for when API returns empty
const defaultMembers: GroupMember[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      role: "Co-Leader",
      status: "Active",
      joinDate: "2024-01-15",
      lastActivity: "2 hours ago",
      phone: "(555) 123-4567",
      location: "San Francisco, CA",
      attendance: "95%",
      posts: 23,
      comments: 45
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike.chen@email.com",
      role: "Member",
      status: "Active",
      joinDate: "2024-02-20",
      lastActivity: "1 day ago",
      phone: "(555) 234-5678",
      location: "San Jose, CA",
      attendance: "87%",
      posts: 12,
      comments: 28
    },
    {
      id: 3,
      name: "Emma Wilson",
      email: "emma.w@email.com",
      role: "Member",
      status: "Inactive",
      joinDate: "2023-11-10",
      lastActivity: "2 weeks ago",
      phone: "(555) 345-6789",
      location: "Oakland, CA",
      attendance: "45%",
      posts: 5,
      comments: 12
    },
    {
      id: 4,
      name: "David Rodriguez",
      email: "david.r@email.com",
      role: "Moderator",
      status: "Active",
      joinDate: "2024-03-05",
      lastActivity: "5 hours ago",
      phone: "(555) 456-7890",
      location: "Berkeley, CA",
      attendance: "92%",
      posts: 18,
      comments: 67
    }
  ];

export default function GroupAdminMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch members from API
  const { data: membersData, isLoading } = useQuery<GroupMember[]>({
    queryKey: ['/api/group-admin/members'],
    queryFn: () => api.get<GroupMember[]>('/api/group-admin/members').catch(() => defaultMembers),
  });

  const members = membersData || defaultMembers;

  // Mutation for inviting members - must be declared before any conditional returns
  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; role: string; message?: string }) =>
      api.post('/api/group-admin/members/invite', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/group-admin/members'] });
      toast({ title: "Invitation Sent", description: "Member invitation has been sent successfully." });
      setInviteDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to send invitation", description: "Please try again.", variant: "destructive" });
    },
  });

  // Mutation for changing roles
  const roleChangeMutation = useMutation({
    mutationFn: ({ memberId, newRole }: { memberId: number; newRole: string }) =>
      api.patch(`/api/group-admin/members/${memberId}/role`, { role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/group-admin/members'] });
      toast({ title: "Role Updated", description: "Member role has been updated successfully." });
    },
    onError: () => {
      toast({ title: "Failed to update role", description: "Please try again.", variant: "destructive" });
    },
  });

  // Mutation for removing members
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: number) => api.delete(`/api/group-admin/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/group-admin/members'] });
      toast({ title: "Member Removed", description: "Member has been removed from the group." });
    },
    onError: () => {
      toast({ title: "Failed to remove member", description: "Please try again.", variant: "destructive" });
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleInviteMember = () => {
    inviteMutation.mutate({ email: '', role: 'member' });
  };

  const handleRoleChange = (memberId: number, newRole: string) => {
    roleChangeMutation.mutate({ memberId, newRole });
  };

  const handleRemoveMember = (memberId: number) => {
    removeMemberMutation.mutate(memberId);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Group Members
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your group members, roles, and permissions
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New Members</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" placeholder="Enter email address" />
              </div>
              <div>
                <Label htmlFor="role">Initial Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="co-leader">Co-Leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea id="message" placeholder="Add a personal invitation message..." />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteMember}>
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Members
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  24
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Active Members
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  21
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Leaders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  3
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Pending Invites
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Leader">Leader</SelectItem>
                  <SelectItem value="Co-Leader">Co-Leader</SelectItem>
                  <SelectItem value="Moderator">Moderator</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Member Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {member.location}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      member.role === 'Leader' || member.role === 'Co-Leader'
                        ? 'default'
                        : member.role === 'Moderator'
                        ? 'secondary'
                        : 'outline'
                    }>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {member.attendance} attendance
                      </div>
                      <div className="flex items-center text-sm">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {member.posts} posts, {member.comments} comments
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {member.lastActivity}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Select onValueChange={(value) => handleRoleChange(member.id, value)}>
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue placeholder="Change role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="co-leader">Co-Leader</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
