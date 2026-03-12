import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useChurch } from "@/hooks/use-church";
import { volunteerSchedulingApi, volunteersApi, VolunteerRole } from "@/lib/api";
import {
  Users,
  Calendar,
  Clock,
  UserCheck,
  BarChart3,
  Heart,
  Plus,
  AlertCircle,
  UserPlus,
  Loader2,
  LogIn,
  LogOut,
  Edit,
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";

const departmentColors: Record<string, string> = {
  worship: "bg-purple-500",
  children: "bg-pink-500",
  youth: "bg-blue-500",
  hospitality: "bg-green-500",
  tech: "bg-orange-500",
  admin: "bg-gray-500",
};

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500",
  confirmed: "bg-green-500",
  completed: "bg-gray-500",
  cancelled: "bg-red-500",
  no_show: "bg-yellow-500",
};

export default function VolunteerScheduling() {
  const { church } = useChurch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const churchId = church?.id?.toString() || "";

  const [activeTab, setActiveTab] = useState("overview");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  // Role form state
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    department: "",
    timeCommitment: "weekly",
    hoursPerWeek: "",
    isLeadershipRole: false,
    backgroundCheckRequired: false,
    minimumAge: "16",
    maximumVolunteers: "",
  });

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    volunteerRoleId: "",
    userId: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    volunteerAssignmentId: "",
    scheduledDate: "",
    startTime: "",
    endTime: "",
    location: "",
    specialInstructions: "",
  });

  // Queries
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["volunteer-scheduling-stats", churchId],
    queryFn: () => volunteerSchedulingApi.getStats(churchId),
    enabled: !!churchId,
  });

  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["volunteer-roles", churchId],
    queryFn: () => volunteerSchedulingApi.listRoles(churchId),
    enabled: !!churchId,
  });

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ["volunteer-assignments", churchId, selectedRoleId],
    queryFn: () => volunteerSchedulingApi.listAssignments(churchId, selectedRoleId ? { roleId: selectedRoleId } : undefined),
    enabled: !!churchId,
  });

  const thisWeekStart = startOfWeek(new Date());
  const thisWeekEnd = endOfWeek(new Date());

  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ["volunteer-schedules", churchId, thisWeekStart.toISOString()],
    queryFn: () => volunteerSchedulingApi.listSchedules(churchId, {
      startDate: thisWeekStart.toISOString(),
      endDate: thisWeekEnd.toISOString(),
    }),
    enabled: !!churchId,
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ["volunteers-list", churchId],
    queryFn: async () => {
      const result = await volunteersApi.list(churchId, { pageSize: 500 });
      return result.data || [];
    },
    enabled: !!churchId,
  });

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: (data: Partial<VolunteerRole>) => volunteerSchedulingApi.createRole(churchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-roles", churchId] });
      queryClient.invalidateQueries({ queryKey: ["volunteer-scheduling-stats", churchId] });
      toast({ title: "Role created successfully" });
      setRoleDialogOpen(false);
      resetRoleForm();
    },
    onError: () => {
      toast({ title: "Failed to create role", variant: "destructive" });
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (data: { volunteerRoleId: number; userId: string; startDate: string; endDate?: string; notes?: string }) =>
      volunteerSchedulingApi.createAssignment(churchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-assignments", churchId] });
      queryClient.invalidateQueries({ queryKey: ["volunteer-scheduling-stats", churchId] });
      queryClient.invalidateQueries({ queryKey: ["volunteer-roles", churchId] });
      toast({ title: "Volunteer assigned successfully" });
      setAssignmentDialogOpen(false);
      resetAssignmentForm();
    },
    onError: () => {
      toast({ title: "Failed to assign volunteer", variant: "destructive" });
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => volunteerSchedulingApi.createSchedule(churchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-schedules", churchId] });
      queryClient.invalidateQueries({ queryKey: ["volunteer-scheduling-stats", churchId] });
      toast({ title: "Shift scheduled successfully" });
      setScheduleDialogOpen(false);
      resetScheduleForm();
    },
    onError: () => {
      toast({ title: "Failed to schedule shift", variant: "destructive" });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: (scheduleId: string) => volunteerSchedulingApi.checkIn(churchId, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-schedules", churchId] });
      toast({ title: "Volunteer checked in" });
    },
    onError: () => {
      toast({ title: "Failed to check in", variant: "destructive" });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (scheduleId: string) => volunteerSchedulingApi.checkOut(churchId, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-schedules", churchId] });
      toast({ title: "Volunteer checked out" });
    },
    onError: () => {
      toast({ title: "Failed to check out", variant: "destructive" });
    },
  });

  const resetRoleForm = () => {
    setRoleForm({
      name: "",
      description: "",
      department: "",
      timeCommitment: "weekly",
      hoursPerWeek: "",
      isLeadershipRole: false,
      backgroundCheckRequired: false,
      minimumAge: "16",
      maximumVolunteers: "",
    });
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      volunteerRoleId: "",
      userId: "",
      startDate: "",
      endDate: "",
      notes: "",
    });
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      volunteerAssignmentId: "",
      scheduledDate: "",
      startTime: "",
      endTime: "",
      location: "",
      specialInstructions: "",
    });
  };

  const handleCreateRole = () => {
    createRoleMutation.mutate({
      name: roleForm.name,
      description: roleForm.description || undefined,
      department: roleForm.department || undefined,
      timeCommitment: roleForm.timeCommitment,
      hoursPerWeek: roleForm.hoursPerWeek ? parseInt(roleForm.hoursPerWeek) : undefined,
      isLeadershipRole: roleForm.isLeadershipRole,
      backgroundCheckRequired: roleForm.backgroundCheckRequired,
      minimumAge: parseInt(roleForm.minimumAge) || 16,
      maximumVolunteers: roleForm.maximumVolunteers ? parseInt(roleForm.maximumVolunteers) : undefined,
    });
  };

  const handleCreateAssignment = () => {
    createAssignmentMutation.mutate({
      volunteerRoleId: parseInt(assignmentForm.volunteerRoleId),
      userId: assignmentForm.userId,
      startDate: assignmentForm.startDate,
      endDate: assignmentForm.endDate || undefined,
      notes: assignmentForm.notes || undefined,
    });
  };

  const handleCreateSchedule = () => {
    createScheduleMutation.mutate({
      volunteerAssignmentId: parseInt(scheduleForm.volunteerAssignmentId),
      scheduledDate: scheduleForm.scheduledDate,
      startTime: `${scheduleForm.scheduledDate}T${scheduleForm.startTime}`,
      endTime: `${scheduleForm.scheduledDate}T${scheduleForm.endTime}`,
      location: scheduleForm.location || undefined,
      specialInstructions: scheduleForm.specialInstructions || undefined,
    });
  };

  if (!churchId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please select a church to manage volunteer scheduling.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="h-8 w-8 text-rose-500" />
            Volunteer Scheduling
          </h1>
          <p className="text-muted-foreground mt-1">
            Coordinate volunteers across all ministry teams
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule a Shift</DialogTitle>
                <DialogDescription>
                  Assign a volunteer to a specific time slot.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Volunteer Assignment</Label>
                  <Select
                    value={scheduleForm.volunteerAssignmentId}
                    onValueChange={(v) => setScheduleForm({ ...scheduleForm, volunteerAssignmentId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an assignment" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignments.map((a) => (
                        <SelectItem key={a.id} value={a.id.toString()}>
                          {a.volunteer.firstName} {a.volunteer.lastName} - {a.role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                    placeholder="e.g., Main Sanctuary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Special Instructions</Label>
                  <Textarea
                    value={scheduleForm.specialInstructions}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, specialInstructions: e.target.value })}
                    placeholder="Any special notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSchedule}
                  disabled={createScheduleMutation.isPending || !scheduleForm.volunteerAssignmentId || !scheduleForm.scheduledDate}
                >
                  {createScheduleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Volunteer Role</DialogTitle>
                <DialogDescription>
                  Define a new volunteer position for your ministry.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label>Role Name</Label>
                  <Input
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    placeholder="e.g., Sound Technician"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    placeholder="Describe the role responsibilities..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Department</Label>
                    <Select
                      value={roleForm.department}
                      onValueChange={(v) => setRoleForm({ ...roleForm, department: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="worship">Worship</SelectItem>
                        <SelectItem value="children">Children's Ministry</SelectItem>
                        <SelectItem value="youth">Youth</SelectItem>
                        <SelectItem value="hospitality">Hospitality</SelectItem>
                        <SelectItem value="tech">Tech/AV</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Time Commitment</Label>
                    <Select
                      value={roleForm.timeCommitment}
                      onValueChange={(v) => setRoleForm({ ...roleForm, timeCommitment: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="event-based">Event-based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Hours Per Week</Label>
                    <Input
                      type="number"
                      value={roleForm.hoursPerWeek}
                      onChange={(e) => setRoleForm({ ...roleForm, hoursPerWeek: e.target.value })}
                      placeholder="2"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Max Volunteers</Label>
                    <Input
                      type="number"
                      value={roleForm.maximumVolunteers}
                      onChange={(e) => setRoleForm({ ...roleForm, maximumVolunteers: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Minimum Age</Label>
                  <Input
                    type="number"
                    value={roleForm.minimumAge}
                    onChange={(e) => setRoleForm({ ...roleForm, minimumAge: e.target.value })}
                  />
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={roleForm.isLeadershipRole}
                      onCheckedChange={(c) => setRoleForm({ ...roleForm, isLeadershipRole: c })}
                    />
                    <Label>Leadership Role</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={roleForm.backgroundCheckRequired}
                      onCheckedChange={(c) => setRoleForm({ ...roleForm, backgroundCheckRequired: c })}
                    />
                    <Label>Background Check</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRole}
                  disabled={createRoleMutation.isPending || !roleForm.name}
                >
                  {createRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
            <Users className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : stats?.activeVolunteers || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : stats?.openPositions || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : `${stats?.coverageRate || 0}%`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : stats?.upcomingShifts || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="schedule">This Week</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ministry Teams Coverage</CardTitle>
              <CardDescription>Current volunteer coverage by role</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : stats?.roles?.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Roles Defined</h3>
                  <p className="text-muted-foreground mb-4">
                    Create volunteer roles to start scheduling.
                  </p>
                  <Button onClick={() => setRoleDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Role
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.roles?.map((role) => (
                    <div key={role.id} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{role.name}</div>
                          {role.department && (
                            <Badge className={`${departmentColors[role.department] || "bg-gray-500"} text-white`}>
                              {role.department}
                            </Badge>
                          )}
                        </div>
                        <Badge variant={role.needed === 0 ? "default" : "destructive"}>
                          {role.needed === 0 ? "Fully Staffed" : `Need ${role.needed} more`}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{role.current} assigned</span>
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${role.needed === 0 ? "bg-green-500" : "bg-amber-500"}`}
                          style={{ width: `${role.current + role.needed > 0 ? (role.current / (role.current + role.needed)) * 100 : 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          {loadingRoles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : roles.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Volunteer Roles</h3>
                  <p className="text-muted-foreground mb-4">
                    Define volunteer positions for your ministry teams.
                  </p>
                  <Button onClick={() => setRoleDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        {role.department && (
                          <Badge className={`${departmentColors[role.department] || "bg-gray-500"} text-white mt-1`}>
                            {role.department}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline">
                        {role.currentVolunteers || 0}/{role.maximumVolunteers || "--"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {role.description && (
                      <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {role.timeCommitment && (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {role.timeCommitment}
                        </Badge>
                      )}
                      {role.hoursPerWeek && (
                        <Badge variant="secondary">
                          {role.hoursPerWeek} hrs/week
                        </Badge>
                      )}
                      {role.backgroundCheckRequired && (
                        <Badge variant="secondary">Background Check</Badge>
                      )}
                      {role.isLeadershipRole && (
                        <Badge variant="secondary">Leadership</Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setAssignmentForm({ ...assignmentForm, volunteerRoleId: role.id.toString() });
                        setAssignmentDialogOpen(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Volunteer
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>This Week's Schedule</CardTitle>
              <CardDescription>
                {format(thisWeekStart, "MMM d")} - {format(thisWeekEnd, "MMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSchedules ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : schedules.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Shifts Scheduled</h3>
                  <p className="text-muted-foreground mb-4">
                    Schedule volunteers for upcoming services and events.
                  </p>
                  <Button onClick={() => setScheduleDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Shift
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          {format(new Date(schedule.scheduledDate), "EEE, MMM d")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(schedule.startTime), "h:mm a")} -{" "}
                          {format(new Date(schedule.endTime), "h:mm a")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{schedule.role.name}</span>
                            {schedule.role.department && (
                              <Badge className={`${departmentColors[schedule.role.department] || "bg-gray-500"} text-white text-xs`}>
                                {schedule.role.department}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{schedule.location || "-"}</TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[schedule.status]} text-white`}>
                            {schedule.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {schedule.status === "scheduled" && !schedule.checkInTime && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => checkInMutation.mutate(schedule.id.toString())}
                                disabled={checkInMutation.isPending}
                              >
                                <LogIn className="h-4 w-4" />
                              </Button>
                            )}
                            {schedule.status === "confirmed" && schedule.checkInTime && !schedule.checkOutTime && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => checkOutMutation.mutate(schedule.id.toString())}
                                disabled={checkOutMutation.isPending}
                              >
                                <LogOut className="h-4 w-4" />
                              </Button>
                            )}
                            {schedule.actualHours && (
                              <span className="text-sm text-muted-foreground px-2">
                                {schedule.actualHours} hrs
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volunteers" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Volunteer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Volunteer to Role</DialogTitle>
                  <DialogDescription>
                    Add a volunteer to a ministry position.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Role</Label>
                    <Select
                      value={assignmentForm.volunteerRoleId}
                      onValueChange={(v) => setAssignmentForm({ ...assignmentForm, volunteerRoleId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Volunteer</Label>
                    <Select
                      value={assignmentForm.userId}
                      onValueChange={(v) => setAssignmentForm({ ...assignmentForm, userId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a volunteer" />
                      </SelectTrigger>
                      <SelectContent>
                        {volunteers.map((v: { id: string; firstName: string; lastName: string; email: string }) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.firstName} {v.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={assignmentForm.startDate}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>End Date (optional)</Label>
                      <Input
                        type="date"
                        value={assignmentForm.endDate}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={assignmentForm.notes}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                      placeholder="Any notes about this assignment..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAssignmentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAssignment}
                    disabled={createAssignmentMutation.isPending || !assignmentForm.volunteerRoleId || !assignmentForm.userId || !assignmentForm.startDate}
                  >
                    {createAssignmentMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Assign
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {loadingAssignments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Volunteer Assignments</h3>
                  <p className="text-muted-foreground mb-4">
                    Assign volunteers to roles to get started.
                  </p>
                  <Button onClick={() => setAssignmentDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign First Volunteer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Assignments</CardTitle>
                <CardDescription>Currently assigned volunteers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {assignment.volunteer.profileImageUrl ? (
                              <img
                                src={assignment.volunteer.profileImageUrl}
                                alt=""
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                {assignment.volunteer.firstName[0]}
                              </div>
                            )}
                            <div>
                              <div className="font-medium">
                                {assignment.volunteer.firstName} {assignment.volunteer.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {assignment.volunteer.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {assignment.role.name}
                            {assignment.role.department && (
                              <Badge className={`${departmentColors[assignment.role.department] || "bg-gray-500"} text-white text-xs`}>
                                {assignment.role.department}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(assignment.startDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{assignment.totalHours || "0"}</TableCell>
                        <TableCell>
                          <Badge variant={assignment.status === "active" ? "default" : "secondary"}>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
