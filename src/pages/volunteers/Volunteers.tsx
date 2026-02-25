import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useVolunteers, useMinistryTeams } from '@/hooks/useVolunteers';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  teams: string[];
  status: 'active' | 'inactive' | 'pending';
  hoursThisMonth: number;
  totalHours: number;
  joinedDate: string;
  skills: string[];
  availability: string[];
}

interface MinistryTeam {
  id: string;
  name: string;
  description: string;
  leader: string;
  memberCount: number;
  color: string;
}

const statusColors: Record<Volunteer['status'], string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

function VolunteerCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <Skeleton className="h-9 w-full mt-4" />
      </CardContent>
    </Card>
  );
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

export default function Volunteers() {
  const { data: volunteersResponse, isLoading: volunteersLoading, error: volunteersError } = useVolunteers();
  const { data: teamsData, isLoading: teamsLoading } = useMinistryTeams();

  // Map API volunteers to UI format
  const volunteers: Volunteer[] = (volunteersResponse?.data ?? []).map((v) => ({
    id: v.id,
    name: v.member ? `${v.member.firstName} ${v.member.lastName}` : 'Unknown',
    email: v.member?.email ?? '',
    phone: v.member?.phone ?? '',
    teams: v.teams?.map((t) => t.name) ?? [],
    status: v.status as Volunteer['status'],
    hoursThisMonth: 0, // Calculate from assignments if needed
    totalHours: v.totalHours,
    joinedDate: v.createdAt,
    skills: v.skills ?? [],
    availability: Object.values(v.availability ?? {}).flat(),
  }));

  // Map API teams to UI format with default colors
  const teamColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
  const teams: MinistryTeam[] = (teamsData ?? []).map((t, idx) => ({
    id: t.id,
    name: t.name,
    description: t.description ?? '',
    leader: t.leader ? `${t.leader.firstName} ${t.leader.lastName}` : 'No leader',
    memberCount: t.memberCount,
    color: teamColors[idx % teamColors.length],
  }));

  const isLoading = volunteersLoading || teamsLoading;
  const error = volunteersError;

  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam =
      teamFilter === 'all' || volunteer.teams.includes(teamFilter);
    return matchesSearch && matchesTeam;
  });

  const totalHoursThisMonth = volunteers.reduce(
    (sum, v) => sum + v.hoursThisMonth,
    0
  );
  const activeVolunteers = volunteers.filter((v) => v.status === 'active').length;

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load volunteers. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Volunteers</h1>
          <p className="text-muted-foreground mt-1">
            Manage volunteers and ministry teams
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Volunteer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Volunteer</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="(555) 000-0000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="team">Primary Team</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.name}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Availability</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Sunday Morning',
                    'Sunday Evening',
                    'Wednesday Evening',
                    'Friday Evening',
                    'Saturday',
                  ].map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <Checkbox id={time} />
                      <label htmlFor={time} className="text-sm">
                        {time}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input id="skills" placeholder="e.g., Music, Teaching, Tech" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Add Volunteer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{volunteers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeVolunteers} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ministry Teams</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teams.length}</div>
                <p className="text-xs text-muted-foreground">Active teams</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHoursThisMonth}</div>
                <p className="text-xs text-muted-foreground">Volunteer hours</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {volunteers.filter((v) => v.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">New applications</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="volunteers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="teams">Ministry Teams</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="volunteers" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search volunteers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.name}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Volunteer List */}
          <div className="grid gap-4">
            {isLoading ? (
              <>
                <VolunteerCardSkeleton />
                <VolunteerCardSkeleton />
                <VolunteerCardSkeleton />
              </>
            ) : filteredVolunteers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No volunteers found.
                </CardContent>
              </Card>
            ) : (
              filteredVolunteers.map((volunteer) => (
                <Card key={volunteer.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {volunteer.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{volunteer.name}</h3>
                            <Badge className={statusColors[volunteer.status]}>
                              {volunteer.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {volunteer.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {volunteer.phone}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {volunteer.teams.map((team) => (
                              <Badge key={team} variant="outline" className="text-xs">
                                {team}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                          <div className="text-sm font-medium">
                            {volunteer.hoursThisMonth} hrs
                          </div>
                          <div className="text-xs text-muted-foreground">
                            This month
                          </div>
                        </div>
                        <div className="text-right hidden md:block">
                          <div className="text-sm font-medium">
                            {volunteer.totalHours} hrs
                          </div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              View Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                <TeamCardSkeleton />
                <TeamCardSkeleton />
                <TeamCardSkeleton />
                <TeamCardSkeleton />
                <TeamCardSkeleton />
                <TeamCardSkeleton />
              </>
            ) : teams.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No ministry teams found.
                </CardContent>
              </Card>
            ) : (
              teams.map((team) => (
                <Card key={team.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${team.color}`} />
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {team.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Led by {team.leader}
                      </span>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {team.memberCount}
                      </Badge>
                    </div>
                    <Button variant="outline" className="w-full mt-4" size="sm">
                      View Team
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>This Week's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    {
                      day: 'Sunday, March 1',
                      shifts: [
                        { time: '8:00 AM', team: 'Greeting Ministry', volunteers: 4 },
                        { time: '8:30 AM', team: 'Worship Team', volunteers: 8 },
                        { time: '8:30 AM', team: 'Tech Team', volunteers: 3 },
                        { time: '9:00 AM', team: "Children's Ministry", volunteers: 6 },
                      ],
                    },
                    {
                      day: 'Wednesday, March 4',
                      shifts: [
                        { time: '6:30 PM', team: 'Tech Team', volunteers: 2 },
                        { time: '6:30 PM', team: 'Greeting Ministry', volunteers: 2 },
                      ],
                    },
                    {
                      day: 'Friday, March 6',
                      shifts: [
                        { time: '6:00 PM', team: 'Youth Ministry', volunteers: 5 },
                      ],
                    },
                  ].map((schedule) => (
                    <div key={schedule.day} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{schedule.day}</h4>
                      <div className="space-y-2">
                        {schedule.shifts.map((shift, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground w-20">
                                {shift.time}
                              </span>
                              <span className="font-medium">{shift.team}</span>
                            </div>
                            <Badge variant="outline">
                              {shift.volunteers} volunteers
                            </Badge>
                          </div>
                        ))}
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
  );
}
