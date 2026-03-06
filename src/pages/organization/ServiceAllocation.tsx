import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  CalendarDays,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  ClipboardList,
  UserCheck,
  UserX,
  Trash2,
} from 'lucide-react';
import {
  useServiceAllocations,
  useCreateAllocation,
  useUpdateAllocation,
  useDeleteAllocation,
  useDepartments,
  useTeams,
  useTeamMembers,
} from '@/hooks/useOrganization';
import type {
  ServiceAllocation,
  AllocationCreateInput,
  Department,
  Team,
} from '@/hooks/useOrganization';

// SoapBox brand color palette
const colors = {
  burgundy: {
    bg: 'bg-[#1B3A4B]',
    bgLight: 'bg-[#1B3A4B]/10',
    text: 'text-[#1B3A4B]',
    border: 'border-[#1B3A4B]',
    hover: 'hover:bg-[#1B3A4B]/90',
  },
  sage: {
    bg: 'bg-[#5B8C7E]',
    bgLight: 'bg-[#5B8C7E]/10',
    text: 'text-[#5B8C7E]',
    border: 'border-[#5B8C7E]',
  },
  walnut: {
    bg: 'bg-[#8B6E5A]',
    bgLight: 'bg-[#8B6E5A]/10',
    text: 'text-[#8B6E5A]',
    border: 'border-[#8B6E5A]',
  },
};

type AllocationStatus = ServiceAllocation['status'];

const STATUS_CONFIG: Record<
  AllocationStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; className: string }
> = {
  scheduled: {
    label: 'Scheduled',
    variant: 'secondary',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  confirmed: {
    label: 'Confirmed',
    variant: 'default',
    className: `bg-[#5B8C7E] text-white hover:bg-[#5B8C7E]/90`,
  },
  completed: {
    label: 'Completed',
    variant: 'outline',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
  cancelled: {
    label: 'Absent',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
};

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ServiceAllocationPage() {
  // Date & filter state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('all');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAllocation, setNewAllocation] = useState<{
    teamId: string;
    memberId: string;
    role: string;
    serviceDate: string;
    startTime: string;
    endTime: string;
    departmentFilter: string;
    teamFilter: string;
  }>({
    teamId: '',
    memberId: '',
    role: '',
    serviceDate: formatDate(new Date()),
    startTime: '09:00',
    endTime: '12:00',
    departmentFilter: 'all',
    teamFilter: '',
  });

  // Data hooks
  const {
    data: allocationsData,
    isLoading: allocationsLoading,
    error: allocationsError,
  } = useServiceAllocations({
    serviceDate: formatDate(selectedDate),
    teamId: selectedTeamId !== 'all' ? selectedTeamId : undefined,
    pageSize: 100,
  });

  const { data: departmentsData } = useDepartments({ pageSize: 100 });
  const { data: teamsData } = useTeams({
    departmentId: selectedDepartmentId !== 'all' ? selectedDepartmentId : undefined,
    pageSize: 100,
  });

  // Teams for the create dialog, filtered by department selection in dialog
  const { data: dialogTeamsData } = useTeams({
    departmentId: newAllocation.departmentFilter !== 'all' ? newAllocation.departmentFilter : undefined,
    pageSize: 100,
  });

  // Team members for selected team in dialog
  const { data: teamMembersData } = useTeamMembers(
    newAllocation.teamId || undefined
  );

  // Mutations
  const createAllocation = useCreateAllocation();
  const updateAllocation = useUpdateAllocation();
  const deleteAllocation = useDeleteAllocation();

  const departments: Department[] = departmentsData?.data || [];
  const teams: Team[] = teamsData?.data || [];
  const dialogTeams: Team[] = dialogTeamsData?.data || [];
  const allocations = useMemo<ServiceAllocation[]>(() => allocationsData?.data || [], [allocationsData]);
  const teamMembers = teamMembersData || [];

  // Filter allocations by team if selected (department filtering is handled by the teams query)
  const filteredAllocations = useMemo(() => {
    if (selectedTeamId === 'all') {
      return allocations;
    }
    return allocations.filter((a) => a.teamId === selectedTeamId);
  }, [allocations, selectedTeamId]);

  // Group allocations by team
  const groupedAllocations = useMemo(() => {
    const groups: Record<string, { teamName: string; allocations: ServiceAllocation[] }> = {};

    filteredAllocations.forEach((allocation) => {
      const teamName = allocation.team?.name || 'Unassigned Team';
      const teamId = allocation.teamId || 'unassigned-team';

      if (!groups[teamId]) {
        groups[teamId] = { teamName, allocations: [] };
      }
      groups[teamId].allocations.push(allocation);
    });

    return groups;
  }, [filteredAllocations]);

  // Summary stats
  const stats = useMemo(() => {
    const total = filteredAllocations.length;
    const confirmed = filteredAllocations.filter((a) => a.status === 'confirmed').length;
    const scheduled = filteredAllocations.filter((a) => a.status === 'scheduled').length;
    const cancelled = filteredAllocations.filter((a) => a.status === 'cancelled').length;
    return { total, confirmed, scheduled, cancelled };
  }, [filteredAllocations]);

  // Handlers
  const handleConfirm = (id: string) => {
    updateAllocation.mutate({ id, data: { status: 'confirmed' } });
  };

  const handleMarkAbsent = (id: string) => {
    updateAllocation.mutate({ id, data: { status: 'cancelled' } });
  };

  const handleRemove = (id: string) => {
    deleteAllocation.mutate(id);
  };

  const handleCreateAllocation = () => {
    if (!newAllocation.teamId || !newAllocation.memberId || !newAllocation.role) return;

    const input: AllocationCreateInput = {
      teamId: newAllocation.teamId,
      memberId: newAllocation.memberId,
      serviceDate: newAllocation.serviceDate,
      role: newAllocation.role,
      notes: `${newAllocation.startTime} - ${newAllocation.endTime}`,
    };

    createAllocation.mutate(input, {
      onSuccess: () => {
        setShowCreateDialog(false);
        resetCreateForm();
      },
    });
  };

  const resetCreateForm = () => {
    setNewAllocation({
      teamId: '',
      memberId: '',
      role: '',
      serviceDate: formatDate(new Date()),
      startTime: '09:00',
      endTime: '12:00',
      departmentFilter: 'all',
      teamFilter: '',
    });
  };

  const openCreateDialog = () => {
    resetCreateForm();
    setShowCreateDialog(true);
  };

  // Error state
  if (allocationsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Allocations</h2>
          <p className="text-gray-600">Unable to load service allocations. Please try again.</p>
        </div>
      </div>
    );
  }

  const hasAllocations = filteredAllocations.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`relative overflow-hidden rounded-2xl ${colors.burgundy.bg} p-8 text-white`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif mb-2">Service Allocation</h1>
            <p className="text-white/80 max-w-xl">
              Assign volunteers and members to specific services. Manage schedules by department and team.
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-white text-[#1B3A4B] hover:bg-white/90 font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Allocation
          </Button>
        </div>
      </div>

      {/* Date Selector & Service Filter */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarDays className="mr-2 h-4 w-4" />
                {formatDisplayDate(selectedDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Department</Label>
          <Select value={selectedDepartmentId} onValueChange={(val) => { setSelectedDepartmentId(val); setSelectedTeamId('all'); }}>
            <SelectTrigger className="w-[200px]">
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

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Team</Label>
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${colors.burgundy.bgLight}`}>
                <Users className={`h-5 w-5 ${colors.burgundy.text}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Allocated</p>
                <p className="text-2xl font-bold font-serif">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${colors.sage.bgLight}`}>
                <CheckCircle2 className={`h-5 w-5 ${colors.sage.text}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold font-serif">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-50">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold font-serif">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-50">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold font-serif">{stats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <ClipboardList className={`h-5 w-5 ${colors.burgundy.text}`} />
            Allocations for {formatDisplayDate(selectedDate)}
          </CardTitle>
          <CardDescription>
            View and manage member assignments grouped by department and team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allocationsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !hasAllocations ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className={`mx-auto w-16 h-16 rounded-full ${colors.burgundy.bgLight} flex items-center justify-center mb-4`}>
                <ClipboardList className={`h-8 w-8 ${colors.burgundy.text}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No allocations yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Get started by creating your first service allocation. Assign volunteers and members
                to teams for upcoming services to keep your ministry organized.
              </p>
              <Button
                onClick={openCreateDialog}
                className={`${colors.burgundy.bg} ${colors.burgundy.hover} text-white`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Allocation
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedAllocations).map(([teamId, teamGroup]) => (
                <div key={teamId} className="mb-6 last:mb-0">
                  <div className={`flex items-center gap-2 mb-2`}>
                    <div className={`w-2 h-2 rounded-full ${colors.burgundy.bg}`} />
                    <span className={`text-lg font-semibold font-serif ${colors.burgundy.text}`}>
                      {teamGroup.teamName}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {teamGroup.allocations.length} members
                    </Badge>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Time Slot</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamGroup.allocations.map((allocation) => {
                        const statusConfig = STATUS_CONFIG[allocation.status];
                        const memberName = allocation.member
                          ? `${allocation.member.firstName} ${allocation.member.lastName}`
                          : 'Unknown Member';

                        return (
                          <TableRow key={allocation.id}>
                            <TableCell className="font-medium">{memberName}</TableCell>
                            <TableCell>{allocation.role}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {allocation.notes || '--'}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusConfig.className}>
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {allocation.status === 'scheduled' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleConfirm(allocation.id)}
                                    className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="Confirm"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                )}
                                {(allocation.status === 'scheduled' || allocation.status === 'confirmed') && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMarkAbsent(allocation.id)}
                                    className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                    title="Mark Absent"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemove(allocation.id)}
                                  className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  title="Remove"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Allocation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Create Allocation</DialogTitle>
            <DialogDescription>
              Assign a member to a service for a specific date and time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Date */}
            <div className="space-y-1.5">
              <Label>Service Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {newAllocation.serviceDate
                      ? formatDisplayDate(new Date(newAllocation.serviceDate + 'T00:00:00'))
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(newAllocation.serviceDate + 'T00:00:00')}
                    onSelect={(date) =>
                      date &&
                      setNewAllocation((prev) => ({
                        ...prev,
                        serviceDate: formatDate(date),
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={newAllocation.startTime}
                  onChange={(e) =>
                    setNewAllocation((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={newAllocation.endTime}
                  onChange={(e) =>
                    setNewAllocation((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Department Filter (optional) */}
            <div className="space-y-1.5">
              <Label>Department <span className="text-muted-foreground text-xs">(optional filter)</span></Label>
              <Select
                value={newAllocation.departmentFilter}
                onValueChange={(val) =>
                  setNewAllocation((prev) => ({
                    ...prev,
                    departmentFilter: val,
                    teamId: '',
                    memberId: '',
                  }))
                }
              >
                <SelectTrigger>
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

            {/* Team Selector */}
            <div className="space-y-1.5">
              <Label>Team <span className="text-red-500">*</span></Label>
              <Select
                value={newAllocation.teamId}
                onValueChange={(val) =>
                  setNewAllocation((prev) => ({ ...prev, teamId: val, memberId: '' }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {dialogTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Member Selector */}
            <div className="space-y-1.5">
              <Label>Member <span className="text-red-500">*</span></Label>
              <Select
                value={newAllocation.memberId}
                onValueChange={(val) =>
                  setNewAllocation((prev) => ({ ...prev, memberId: val }))
                }
                disabled={!newAllocation.teamId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={newAllocation.teamId ? 'Select a member' : 'Select a team first'} />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((tm) => (
                    <SelectItem key={tm.memberId} value={tm.memberId}>
                      {tm.member
                        ? `${tm.member.firstName} ${tm.member.lastName}`
                        : tm.memberId}
                    </SelectItem>
                  ))}
                  {newAllocation.teamId && teamMembers.length === 0 && (
                    <div className="px-2 py-4 text-sm text-center text-muted-foreground">
                      No members in this team
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label>Role <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. Worship Leader, Greeter, Sound Tech"
                value={newAllocation.role}
                onChange={(e) =>
                  setNewAllocation((prev) => ({ ...prev, role: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAllocation}
              disabled={
                !newAllocation.teamId ||
                !newAllocation.memberId ||
                !newAllocation.role ||
                createAllocation.isPending
              }
              className={`${colors.burgundy.bg} ${colors.burgundy.hover} text-white`}
            >
              {createAllocation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
