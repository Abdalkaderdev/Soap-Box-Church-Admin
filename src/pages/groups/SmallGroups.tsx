import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Home,
  Church,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  Mail,
  Phone,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { smallGroupsApi, membersApi } from '@/lib/api';
import type {
  SmallGroup,
  SmallGroupMember,
  SmallGroupMeeting,
  SmallGroupJoinRequest,
  SmallGroupCategory,
  SmallGroupCreateInput,
} from '@/types';

const statusConfig: Record<SmallGroup['status'], { label: string; className: string }> = {
  forming: { label: 'Forming', className: 'bg-ivory-200 text-walnut-700 border-ivory-300' },
  active: { label: 'Active', className: 'bg-sage-100 text-sage-800 border-sage-200' },
  paused: { label: 'On Break', className: 'bg-ivory-200 text-walnut-700 border-ivory-300' },
  full: { label: 'Full', className: 'bg-burgundy-100 text-burgundy-800 border-burgundy-200' },
  closed: { label: 'Closed', className: 'bg-walnut-100 text-walnut-700 border-walnut-200' },
};

const categoryLabels: Record<SmallGroupCategory, string> = {
  bible_study: 'Bible Study',
  fellowship: 'Fellowship',
  mens: "Men's Group",
  womens: "Women's Group",
  young_adults: 'Young Adults',
  couples: 'Couples',
  parents: 'Parents',
  seniors: 'Seniors',
  recovery: 'Recovery',
  other: 'Other',
};

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SmallGroups() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SmallGroup | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Form state for creating new group
  const [newGroupForm, setNewGroupForm] = useState<SmallGroupCreateInput>({
    name: '',
    description: '',
    category: 'bible_study',
    meetingDay: '',
    meetingTime: '',
    meetingLocation: '',
    meetingType: 'in_person',
    maxMembers: 12,
    isPublic: true,
    requiresApproval: true,
  });

  // Fetch all small groups
  const {
    data: groupsResponse,
    isLoading: loadingGroups,
    refetch: refetchGroups,
  } = useQuery({
    queryKey: ['small-groups', churchId, searchQuery, dayFilter, locationFilter],
    queryFn: () => smallGroupsApi.list(churchId!, {
      search: searchQuery || undefined,
      meetingDay: dayFilter !== 'all' ? dayFilter : undefined,
      meetingType: locationFilter === 'home' ? 'in_person' : locationFilter === 'church' ? 'in_person' : undefined,
    }),
    enabled: Boolean(churchId),
  });

  // Fetch group statistics
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['small-groups-stats', churchId],
    queryFn: () => smallGroupsApi.getStats(churchId!),
    enabled: Boolean(churchId),
  });

  // Fetch members for leader selection
  const { data: membersResponse } = useQuery({
    queryKey: ['members', churchId],
    queryFn: () => membersApi.list(churchId!, { pageSize: 100 }),
    enabled: Boolean(churchId),
  });

  // Fetch selected group details including members, meetings, and join requests
  const { data: selectedGroupDetails, isLoading: loadingGroupDetails } = useQuery({
    queryKey: ['small-group-details', churchId, selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup?.id || !churchId) return null;
      const [group, members, meetings, joinRequests] = await Promise.all([
        smallGroupsApi.get(churchId, selectedGroup.id),
        smallGroupsApi.getMembers(churchId, selectedGroup.id),
        smallGroupsApi.getMeetings(churchId, selectedGroup.id),
        smallGroupsApi.getJoinRequests(churchId, selectedGroup.id),
      ]);
      return { group, members, meetings, joinRequests };
    },
    enabled: Boolean(churchId) && Boolean(selectedGroup?.id) && isDetailsDialogOpen,
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: (data: SmallGroupCreateInput) => smallGroupsApi.create(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['small-groups', churchId] });
      queryClient.invalidateQueries({ queryKey: ['small-groups-stats', churchId] });
      setIsAddDialogOpen(false);
      setNewGroupForm({
        name: '',
        description: '',
        category: 'bible_study',
        meetingDay: '',
        meetingTime: '',
        meetingLocation: '',
        meetingType: 'in_person',
        maxMembers: 12,
        isPublic: true,
        requiresApproval: true,
      });
    },
  });

  // Respond to join request mutation
  const respondToRequestMutation = useMutation({
    mutationFn: ({ groupId, requestId, status }: { groupId: string; requestId: string; status: 'approved' | 'denied' }) =>
      smallGroupsApi.respondToJoinRequest(churchId!, groupId, requestId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['small-group-details', churchId, selectedGroup?.id] });
      queryClient.invalidateQueries({ queryKey: ['small-groups', churchId] });
    },
  });

  const groups = groupsResponse?.data || [];
  const members = membersResponse?.data || [];

  // Filter groups based on location type (client-side additional filtering)
  const filteredGroups = groups.filter((group) => {
    if (locationFilter === 'all') return true;
    if (locationFilter === 'home') {
      return group.meetingType === 'in_person' && group.meetingLocation && !group.meetingLocation.toLowerCase().includes('church');
    }
    if (locationFilter === 'church') {
      return group.meetingType === 'in_person' && group.meetingLocation?.toLowerCase().includes('church');
    }
    return true;
  });

  const totalMembers = stats?.totalMembers || groups.reduce((sum, g) => sum + g.memberCount, 0);
  const activeGroups = stats?.activeGroups || groups.filter((g) => g.status === 'active').length;
  const homeGroups = groups.filter((g) => g.meetingType === 'in_person' && g.meetingLocation && !g.meetingLocation.toLowerCase().includes('church')).length;

  const handleViewDetails = (group: SmallGroup) => {
    setSelectedGroup(group);
    setIsDetailsDialogOpen(true);
  };

  const handleCreateGroup = () => {
    createGroupMutation.mutate(newGroupForm);
  };

  const handleApproveRequest = (requestId: string) => {
    if (selectedGroup) {
      respondToRequestMutation.mutate({ groupId: selectedGroup.id, requestId, status: 'approved' });
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    if (selectedGroup) {
      respondToRequestMutation.mutate({ groupId: selectedGroup.id, requestId, status: 'denied' });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const getMeetingTypeIcon = (group: SmallGroup) => {
    if (group.meetingType === 'online') return <Church className="h-4 w-4 text-burgundy-500" />;
    if (group.meetingLocation?.toLowerCase().includes('church')) return <Church className="h-4 w-4 text-burgundy-500" />;
    return <Home className="h-4 w-4 text-walnut-500" />;
  };

  // Loading skeleton for stats cards
  const StatsCardSkeleton = () => (
    <Card className="bg-ivory-50 border-ivory-200 shadow-warm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );

  // Loading skeleton for group cards
  const GroupCardSkeleton = () => (
    <Card className="bg-ivory-50 border-ivory-200 overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-burgundy-50 to-ivory-100 border-b border-ivory-200">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-6 w-full rounded" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-walnut-900">Small Groups</h1>
          <p className="text-walnut-600 mt-1">
            Connect, grow, and build community through small group fellowship
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetchGroups()}
            className="border-walnut-300 text-walnut-600 hover:bg-walnut-100"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-50">
                <Plus className="mr-2 h-4 w-4" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-ivory-50">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-walnut-900">Create New Small Group</DialogTitle>
                <DialogDescription className="text-walnut-600">
                  Fill in the details to start a new small group community.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="groupName" className="text-walnut-800">Group Name</Label>
                  <Input
                    id="groupName"
                    placeholder="e.g., Young Families Fellowship"
                    className="border-walnut-200 focus:border-burgundy-400"
                    value={newGroupForm.name}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-walnut-800">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the group's purpose"
                    className="border-walnut-200 focus:border-burgundy-400"
                    value={newGroupForm.description || ''}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category" className="text-walnut-800">Category</Label>
                    <Select
                      value={newGroupForm.category}
                      onValueChange={(value: SmallGroupCategory) => setNewGroupForm({ ...newGroupForm, category: value })}
                    >
                      <SelectTrigger className="border-walnut-200">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="leader" className="text-walnut-800">Group Leader</Label>
                    <Select
                      value={newGroupForm.leaderId || ''}
                      onValueChange={(value) => setNewGroupForm({ ...newGroupForm, leaderId: value })}
                    >
                      <SelectTrigger className="border-walnut-200">
                        <SelectValue placeholder="Select a leader" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="maxCapacity" className="text-walnut-800">Max Capacity</Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      placeholder="12"
                      className="border-walnut-200 focus:border-burgundy-400"
                      value={newGroupForm.maxMembers || ''}
                      onChange={(e) => setNewGroupForm({ ...newGroupForm, maxMembers: parseInt(e.target.value) || undefined })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="meetingType" className="text-walnut-800">Meeting Type</Label>
                    <Select
                      value={newGroupForm.meetingType}
                      onValueChange={(value: 'in_person' | 'online' | 'hybrid') => setNewGroupForm({ ...newGroupForm, meetingType: value })}
                    >
                      <SelectTrigger className="border-walnut-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="meetingDay" className="text-walnut-800">Meeting Day</Label>
                    <Select
                      value={newGroupForm.meetingDay || ''}
                      onValueChange={(value) => setNewGroupForm({ ...newGroupForm, meetingDay: value })}
                    >
                      <SelectTrigger className="border-walnut-200">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="meetingTime" className="text-walnut-800">Meeting Time</Label>
                    <Input
                      id="meetingTime"
                      type="time"
                      className="border-walnut-200 focus:border-burgundy-400"
                      value={newGroupForm.meetingTime || ''}
                      onChange={(e) => setNewGroupForm({ ...newGroupForm, meetingTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location" className="text-walnut-800">Address / Room</Label>
                  <Input
                    id="location"
                    placeholder="e.g., 123 Main St or Room 201"
                    className="border-walnut-200 focus:border-burgundy-400"
                    value={newGroupForm.meetingLocation || ''}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, meetingLocation: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="border-walnut-300 text-walnut-700 hover:bg-walnut-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={createGroupMutation.isPending || !newGroupForm.name}
                    className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-50"
                  >
                    {createGroupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Group
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loadingStats || loadingGroups ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-ivory-50 border-ivory-200 shadow-warm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-walnut-700">Total Groups</CardTitle>
                <Users className="h-4 w-4 text-burgundy-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold text-walnut-900">{stats?.totalGroups || groups.length}</div>
                <p className="text-xs text-walnut-500">{activeGroups} active</p>
              </CardContent>
            </Card>
            <Card className="bg-ivory-50 border-ivory-200 shadow-warm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-walnut-700">Total Members</CardTitle>
                <UserPlus className="h-4 w-4 text-sage-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold text-walnut-900">{totalMembers}</div>
                <p className="text-xs text-walnut-500">Across all groups</p>
              </CardContent>
            </Card>
            <Card className="bg-ivory-50 border-ivory-200 shadow-warm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-walnut-700">Home Groups</CardTitle>
                <Home className="h-4 w-4 text-walnut-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold text-walnut-900">{homeGroups}</div>
                <p className="text-xs text-walnut-500">Meeting in homes</p>
              </CardContent>
            </Card>
            <Card className="bg-ivory-50 border-ivory-200 shadow-warm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-walnut-700">Avg Attendance</CardTitle>
                <AlertCircle className="h-4 w-4 text-burgundy-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold text-walnut-900">
                  {stats?.averageAttendance?.toFixed(1) || stats?.averageGroupSize?.toFixed(1) || '-'}
                </div>
                <p className="text-xs text-walnut-500">Per meeting</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-walnut-400" />
          <Input
            placeholder="Search groups by name, leader, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-walnut-200 focus:border-burgundy-400"
          />
        </div>
        <Select value={dayFilter} onValueChange={setDayFilter}>
          <SelectTrigger className="w-full sm:w-[180px] border-walnut-200">
            <SelectValue placeholder="Filter by day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Days</SelectItem>
            {daysOfWeek.map((day) => (
              <SelectItem key={day} value={day}>{day}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-full sm:w-[180px] border-walnut-200">
            <SelectValue placeholder="Location type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="home">Home Groups</SelectItem>
            <SelectItem value="church">Church Groups</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingGroups ? (
          <>
            <GroupCardSkeleton />
            <GroupCardSkeleton />
            <GroupCardSkeleton />
            <GroupCardSkeleton />
            <GroupCardSkeleton />
            <GroupCardSkeleton />
          </>
        ) : filteredGroups.length === 0 ? (
          <Card className="col-span-full bg-ivory-50 border-ivory-200">
            <CardContent className="p-8 text-center text-walnut-500">
              No small groups found matching your filters.
            </CardContent>
          </Card>
        ) : (
          filteredGroups.map((group) => (
            <Card
              key={group.id}
              className="bg-ivory-50 border-ivory-200 hover:shadow-warm-lg transition-all duration-300 overflow-hidden"
            >
              <CardHeader className="pb-3 bg-gradient-to-r from-burgundy-50 to-ivory-100 border-b border-ivory-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="font-serif text-lg text-walnut-900">{group.name}</CardTitle>
                    <CardDescription className="text-walnut-600 mt-1 line-clamp-2">
                      {group.description || categoryLabels[group.category]}
                    </CardDescription>
                  </div>
                  <Badge className={`ml-2 ${statusConfig[group.status]?.className || statusConfig.active.className}`}>
                    {statusConfig[group.status]?.label || group.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {/* Leader */}
                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="h-6 w-6 bg-burgundy-100">
                    <AvatarFallback className="text-xs text-burgundy-700 bg-burgundy-100">
                      {group.leader ? getInitials(`${group.leader.firstName} ${group.leader.lastName}`) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-walnut-700 font-medium">
                    {group.leader ? `${group.leader.firstName} ${group.leader.lastName}` : 'No leader assigned'}
                  </span>
                  {group.coLeader && (
                    <span className="text-walnut-500">& {group.coLeader.firstName} {group.coLeader.lastName}</span>
                  )}
                </div>

                {/* Meeting Info */}
                <div className="space-y-2 text-sm text-walnut-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-sage-600" />
                    <span>{group.meetingDay || 'TBD'}</span>
                    <Clock className="h-4 w-4 text-sage-600 ml-2" />
                    <span>{group.meetingTime || 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getMeetingTypeIcon(group)}
                    <span className="truncate">{group.meetingLocation || group.virtualMeetingUrl || 'Location TBD'}</span>
                  </div>
                </div>

                {/* Current Study */}
                {group.currentStudy && (
                  <div className="text-xs text-walnut-500 bg-sage-50 px-2 py-1 rounded border border-sage-200">
                    Currently studying: <span className="font-medium text-sage-700">{group.currentStudy}</span>
                  </div>
                )}

                {/* Member Count */}
                <div className="flex items-center justify-between pt-2 border-t border-ivory-200">
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-4 w-4 text-walnut-500" />
                    <span className="text-walnut-700">
                      {group.memberCount} / {group.maxMembers || 'unlimited'} members
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-walnut-300 text-walnut-700 hover:bg-walnut-100"
                    onClick={() => handleViewDetails(group)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-walnut-600 hover:bg-walnut-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Group
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <History className="mr-2 h-4 w-4" />
                        Meeting History
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-burgundy-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Group Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-ivory-50">
          {selectedGroup && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="font-serif text-2xl text-walnut-900">
                      {selectedGroup.name}
                    </DialogTitle>
                    <DialogDescription className="text-walnut-600">
                      {selectedGroup.description || categoryLabels[selectedGroup.category]}
                    </DialogDescription>
                  </div>
                  <Badge className={statusConfig[selectedGroup.status]?.className || statusConfig.active.className}>
                    {statusConfig[selectedGroup.status]?.label || selectedGroup.status}
                  </Badge>
                </div>
              </DialogHeader>

              {loadingGroupDetails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-burgundy-600" />
                </div>
              ) : (
                <Tabs defaultValue="members" className="mt-4">
                  <TabsList className="bg-ivory-200">
                    <TabsTrigger value="members" className="data-[state=active]:bg-ivory-50">
                      Members ({selectedGroupDetails?.members?.length || selectedGroup.memberCount})
                    </TabsTrigger>
                    <TabsTrigger value="meetings" className="data-[state=active]:bg-ivory-50">
                      Meeting History
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="data-[state=active]:bg-ivory-50">
                      Join Requests ({selectedGroupDetails?.joinRequests?.filter((r) => r.status === 'pending').length || 0})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="members" className="mt-4 space-y-4">
                    {/* Group Info Summary */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-ivory-100 rounded-lg border border-ivory-200">
                      <div className="space-y-1">
                        <p className="text-xs text-walnut-500 uppercase tracking-wide">Meeting Schedule</p>
                        <p className="text-sm font-medium text-walnut-800">
                          {selectedGroup.meetingDay || 'TBD'} at {selectedGroup.meetingTime || 'TBD'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-walnut-500 uppercase tracking-wide">Location</p>
                        <p className="text-sm font-medium text-walnut-800 flex items-center gap-1">
                          {getMeetingTypeIcon(selectedGroup)}
                          {selectedGroup.meetingLocation || selectedGroup.virtualMeetingUrl || 'TBD'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-walnut-500 uppercase tracking-wide">Current Study</p>
                        <p className="text-sm font-medium text-walnut-800">
                          {selectedGroup.currentStudy || 'Not set'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-walnut-500 uppercase tracking-wide">Capacity</p>
                        <p className="text-sm font-medium text-walnut-800">
                          {selectedGroup.memberCount} / {selectedGroup.maxMembers || 'unlimited'} members
                        </p>
                      </div>
                    </div>

                    {/* Members List */}
                    <div className="space-y-2">
                      <h4 className="font-serif font-semibold text-walnut-800">Group Members</h4>
                      {!selectedGroupDetails?.members || selectedGroupDetails.members.length === 0 ? (
                        <p className="text-sm text-walnut-500 py-4 text-center">No members to display.</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedGroupDetails.members.map((membership: SmallGroupMember) => (
                            <div
                              key={membership.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-ivory-200"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 bg-burgundy-100">
                                  <AvatarFallback className="text-sm text-burgundy-700 bg-burgundy-100">
                                    {membership.member ? getInitials(`${membership.member.firstName} ${membership.member.lastName}`) : '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-walnut-800">
                                    {membership.member ? `${membership.member.firstName} ${membership.member.lastName}` : 'Unknown'}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-walnut-500">
                                    {membership.member?.email && (
                                      <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {membership.member.email}
                                      </span>
                                    )}
                                    {membership.member?.phone && (
                                      <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {membership.member.phone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  membership.role === 'leader'
                                    ? 'border-burgundy-300 text-burgundy-700'
                                    : membership.role === 'co_leader'
                                    ? 'border-sage-300 text-sage-700'
                                    : 'border-walnut-200 text-walnut-600'
                                }
                              >
                                {membership.role === 'leader' ? 'Leader' : membership.role === 'co_leader' ? 'Co-Leader' : 'Member'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="meetings" className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-semibold text-walnut-800">Recent Meetings</h4>
                      <Button size="sm" className="bg-sage-600 hover:bg-sage-700 text-ivory-50">
                        <Plus className="h-4 w-4 mr-1" />
                        Log Meeting
                      </Button>
                    </div>
                    {!selectedGroupDetails?.meetings || selectedGroupDetails.meetings.length === 0 ? (
                      <p className="text-sm text-walnut-500 py-8 text-center">No meeting history recorded.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedGroupDetails.meetings.map((meeting: SmallGroupMeeting) => (
                          <div
                            key={meeting.id}
                            className="p-4 bg-white rounded-lg border border-ivory-200"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-walnut-800">{meeting.topic || meeting.title || 'Meeting'}</p>
                                <p className="text-sm text-walnut-500">
                                  {new Date(meeting.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                                {meeting.notes && (
                                  <p className="text-sm text-walnut-600 mt-2 italic">{meeting.notes}</p>
                                )}
                              </div>
                              <Badge variant="outline" className="border-sage-300 text-sage-700">
                                <Users className="h-3 w-3 mr-1" />
                                {meeting.attendanceCount} attended
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="requests" className="mt-4 space-y-4">
                    <h4 className="font-serif font-semibold text-walnut-800">Pending Join Requests</h4>
                    {!selectedGroupDetails?.joinRequests || selectedGroupDetails.joinRequests.filter((r: SmallGroupJoinRequest) => r.status === 'pending').length === 0 ? (
                      <p className="text-sm text-walnut-500 py-8 text-center">No pending join requests.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedGroupDetails.joinRequests
                          .filter((r: SmallGroupJoinRequest) => r.status === 'pending')
                          .map((request: SmallGroupJoinRequest) => (
                            <div
                              key={request.id}
                              className="p-4 bg-white rounded-lg border border-ivory-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <Avatar className="h-10 w-10 bg-walnut-100">
                                    <AvatarFallback className="text-sm text-walnut-700 bg-walnut-100">
                                      {request.member ? getInitials(`${request.member.firstName} ${request.member.lastName}`) : '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-walnut-800">
                                      {request.member ? `${request.member.firstName} ${request.member.lastName}` : 'Unknown'}
                                    </p>
                                    <p className="text-sm text-walnut-500">{request.member?.email}</p>
                                    <p className="text-xs text-walnut-400 mt-1">
                                      Requested on {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                    {request.message && (
                                      <p className="text-sm text-walnut-600 mt-2 p-2 bg-ivory-100 rounded italic">
                                        "{request.message}"
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-burgundy-300 text-burgundy-600 hover:bg-burgundy-50"
                                    onClick={() => handleDeclineRequest(request.id)}
                                    disabled={respondToRequestMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Decline
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-sage-600 hover:bg-sage-700 text-ivory-50"
                                    onClick={() => handleApproveRequest(request.id)}
                                    disabled={respondToRequestMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Past Requests */}
                    {selectedGroupDetails?.joinRequests && selectedGroupDetails.joinRequests.filter((r: SmallGroupJoinRequest) => r.status !== 'pending').length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <h4 className="font-serif font-semibold text-walnut-800">Past Requests</h4>
                        <div className="space-y-2">
                          {selectedGroupDetails.joinRequests
                            .filter((r: SmallGroupJoinRequest) => r.status !== 'pending')
                            .map((request: SmallGroupJoinRequest) => (
                              <div
                                key={request.id}
                                className="flex items-center justify-between p-3 bg-ivory-100 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-walnut-700">
                                    {request.member ? `${request.member.firstName} ${request.member.lastName}` : 'Unknown'}
                                  </span>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={
                                    request.status === 'approved'
                                      ? 'border-sage-300 text-sage-700'
                                      : 'border-burgundy-300 text-burgundy-700'
                                  }
                                >
                                  {request.status === 'approved' ? 'Approved' : 'Declined'}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
