import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Shield,
  Star,
  User,
  Layers,
  CheckCircle,
} from 'lucide-react';
import {
  useTeams,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
  useTeamMembers,
  useAddTeamMember,
  useRemoveTeamMember,
  useDepartments,
  type Team,
  type TeamCreateInput,
  type TeamUpdateInput,
  type TeamMember,
} from '@/hooks/useOrganization';

// ============================================================================
// Types
// ============================================================================

interface TeamFormData {
  name: string;
  description: string;
  departmentId: string;
  leaderId: string;
}

// ============================================================================
// Constants
// ============================================================================

const statusColors: Record<string, string> = {
  active: 'bg-[hsl(150,25%,40%)] text-white',
  inactive: 'bg-muted text-muted-foreground',
};

const roleConfig: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  team_leader: { label: 'Team Leader', color: 'bg-amber-100 text-amber-800', icon: Shield },
  assistant_leader: { label: 'Assistant Leader', color: 'bg-blue-100 text-blue-800', icon: Star },
  member: { label: 'Member', color: 'bg-gray-100 text-gray-700', icon: User },
};

const emptyFormData: TeamFormData = {
  name: '',
  description: '',
  departmentId: '',
  leaderId: '',
};

// ============================================================================
// Skeleton Components
// ============================================================================

function StatsCardSkeleton() {
  return (
    <Card className="church-glow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

function TeamCardSkeleton() {
  return (
    <Card className="church-glow border-[hsl(35,20%,88%)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function TeamsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [managingTeam, setManagingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>(emptyFormData);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');

  // API hooks
  const { data: teamsResponse, isLoading: teamsLoading } = useTeams({
    search: searchQuery || undefined,
    departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
  });
  const { data: departmentsResponse } = useDepartments({ pageSize: 100 });
  const { data: teamMembers, isLoading: membersLoading } = useTeamMembers(managingTeam?.id);

  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();

  const teams = useMemo(() => teamsResponse?.data ?? [], [teamsResponse]);
  const departments = departmentsResponse?.data ?? [];

  // Stats
  const stats = useMemo(() => ({
    totalTeams: teams.length,
    totalMembers: teams.reduce((sum, t) => sum + t.memberCount, 0),
    activeTeams: teams.filter((t) => t.isActive).length,
  }), [teams]);

  // Handlers
  const handleOpenAdd = () => {
    setFormData(emptyFormData);
    setEditingTeam(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (team: Team) => {
    setFormData({
      name: team.name,
      description: team.description ?? '',
      departmentId: team.departmentId,
      leaderId: team.leaderId ?? '',
    });
    setEditingTeam(team);
    setIsAddDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.departmentId) return;

    if (editingTeam) {
      const data: TeamUpdateInput = {
        name: formData.name,
        description: formData.description || undefined,
        departmentId: formData.departmentId,
        leaderId: formData.leaderId || undefined,
      };
      updateTeam.mutate(
        { id: editingTeam.id, data },
        { onSuccess: () => setIsAddDialogOpen(false) }
      );
    } else {
      const data: TeamCreateInput = {
        departmentId: formData.departmentId,
        name: formData.name,
        description: formData.description || undefined,
        leaderId: formData.leaderId || undefined,
      };
      createTeam.mutate(data, {
        onSuccess: () => setIsAddDialogOpen(false),
      });
    }
  };

  const handleDelete = (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      deleteTeam.mutate(teamId);
    }
  };

  const handleAddMember = () => {
    if (!managingTeam || !newMemberId) return;
    addMember.mutate(
      { teamId: managingTeam.id, memberId: newMemberId, role: newMemberRole },
      {
        onSuccess: () => {
          setNewMemberId('');
          setNewMemberRole('member');
        },
      }
    );
  };

  const handleRemoveMember = (memberId: string) => {
    if (!managingTeam) return;
    removeMember.mutate({ teamId: managingTeam.id, memberId });
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find((d) => d.id === departmentId)?.name ?? 'Unknown';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleInfo = (role: string) => {
    return roleConfig[role] ?? roleConfig.member;
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(35,25%,15%)]">Teams</h1>
          <p className="text-muted-foreground mt-1">
            Manage teams within your departments. Assign leaders and members to each team.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleOpenAdd}
              className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Edit Team' : 'Add New Team'}</DialogTitle>
              <DialogDescription>
                {editingTeam
                  ? 'Update the team details below.'
                  : 'Create a new team within a department.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name *</Label>
                <Input
                  id="team-name"
                  placeholder="e.g., Rubbish Collection"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-description">Description</Label>
                <Textarea
                  id="team-description"
                  placeholder="Brief description of the team's purpose..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-department">Department *</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                >
                  <SelectTrigger id="team-department">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-leader">Leader ID</Label>
                <Input
                  id="team-leader"
                  placeholder="Enter leader member ID"
                  value={formData.leaderId}
                  onChange={(e) => setFormData({ ...formData, leaderId: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.departmentId || createTeam.isPending || updateTeam.isPending}
                  className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)] text-white"
                >
                  {createTeam.isPending || updateTeam.isPending
                    ? 'Saving...'
                    : editingTeam
                      ? 'Update Team'
                      : 'Create Team'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {teamsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card className="church-glow border-[hsl(35,20%,88%)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Teams
                </CardTitle>
                <Layers className="h-5 w-5 text-[hsl(345,45%,32%)]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[hsl(35,25%,15%)]">{stats.totalTeams}</div>
              </CardContent>
            </Card>
            <Card className="church-glow border-[hsl(35,20%,88%)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Members
                </CardTitle>
                <Users className="h-5 w-5 text-[hsl(345,45%,32%)]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[hsl(35,25%,15%)]">{stats.totalMembers}</div>
              </CardContent>
            </Card>
            <Card className="church-glow border-[hsl(35,20%,88%)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Teams
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-[hsl(150,25%,40%)]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[hsl(35,25%,15%)]">{stats.activeTeams}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Teams Grid */}
      {teamsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TeamCardSkeleton key={i} />
          ))}
        </div>
      ) : teams.length === 0 ? (
        /* Empty State */
        <Card className="church-glow border-[hsl(35,20%,88%)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-[hsl(35,30%,95%)] p-4 mb-4">
              <Layers className="h-10 w-10 text-[hsl(345,45%,32%)]" />
            </div>
            <h3 className="text-lg font-semibold text-[hsl(35,25%,15%)] mb-1">No teams found</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              {searchQuery || departmentFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first team within a department.'}
            </p>
            {!searchQuery && departmentFilter === 'all' && (
              <Button
                onClick={handleOpenAdd}
                className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)] text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Team
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="church-glow border-[hsl(35,20%,88%)] hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-[hsl(345,45%,32%)] text-white text-xs">
                        {getInitials(team.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{team.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {getDepartmentName(team.departmentId)}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(team)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setManagingTeam(team)}>
                        <Users className="mr-2 h-4 w-4" />
                        Manage Members
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(team.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {team.description && (
                  <CardDescription className="mb-3 line-clamp-2">
                    {team.description}
                  </CardDescription>
                )}

                {/* Leader */}
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {team.leader
                      ? `${team.leader.firstName} ${team.leader.lastName}`
                      : 'No leader assigned'}
                  </span>
                </div>

                {/* Member count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <Badge className={team.isActive ? statusColors.active : statusColors.inactive}>
                    {team.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Member count visual indicator */}
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-[hsl(345,45%,32%)] transition-all"
                      style={{ width: `${Math.min((team.memberCount / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Manage Members Dialog */}
      <Dialog open={!!managingTeam} onOpenChange={(open) => !open && setManagingTeam(null)}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Manage Members - {managingTeam?.name}</DialogTitle>
            <DialogDescription>
              Add or remove members from this team. Assign roles to each member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Add member form */}
            <div className="flex gap-2">
              <Input
                placeholder="Member ID"
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                className="flex-1"
              />
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team_leader">Team Leader</SelectItem>
                  <SelectItem value="assistant_leader">Asst. Leader</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddMember}
                disabled={!newMemberId || addMember.isPending}
                size="icon"
                className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)] text-white shrink-0"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>

            {/* Members list */}
            <div className="max-h-[360px] overflow-y-auto space-y-2">
              {membersLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                ))
              ) : !teamMembers || teamMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No members in this team yet.</p>
                </div>
              ) : (
                teamMembers.map((tm: TeamMember) => {
                  const roleInfo = getRoleInfo(tm.role);
                  const RoleIcon = roleInfo.icon;
                  const memberName = tm.member
                    ? `${tm.member.firstName} ${tm.member.lastName}`
                    : tm.memberId;

                  return (
                    <div
                      key={tm.id}
                      className="flex items-center gap-3 rounded-lg border border-[hsl(35,20%,88%)] p-3"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-[hsl(35,30%,90%)] text-[hsl(35,25%,15%)] text-xs">
                          {getInitials(memberName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{memberName}</p>
                        <Badge className={`${roleInfo.color} text-xs mt-0.5`}>
                          <RoleIcon className="mr-1 h-3 w-3" />
                          {roleInfo.label}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                        onClick={() => handleRemoveMember(tm.memberId)}
                        disabled={removeMember.isPending}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
