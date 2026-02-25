import { useState } from 'react';
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
import { Progress } from '@/components/ui/progress';
import {
  Book,
  Plus,
  Search,
  Users,
  Target,
  Calendar,
  Clock,
  Award,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  BookOpen,
  Heart,
  Flame,
  GraduationCap,
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
import {
  useDiscipleship,
  type DiscipleshipPlan,
  type DiscipleProgress,
} from '@/hooks/useDiscipleship';

const categoryIcons: Record<DiscipleshipPlan['category'], React.ReactNode> = {
  doctrine: <Book className="h-4 w-4" />,
  conduct: <Heart className="h-4 w-4" />,
  character: <Flame className="h-4 w-4" />,
  service: <Users className="h-4 w-4" />,
};

const categoryColors: Record<DiscipleshipPlan['category'], string> = {
  doctrine: 'bg-blue-100 text-blue-800',
  conduct: 'bg-green-100 text-green-800',
  character: 'bg-purple-100 text-purple-800',
  service: 'bg-orange-100 text-orange-800',
};

const statusColors: Record<DiscipleProgress['status'], string> = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  paused: 'bg-gray-100 text-gray-800',
  dropped: 'bg-red-100 text-red-800',
};

function PlanCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-40 mt-2" />
        <Skeleton className="h-4 w-full mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-2 w-full mb-4" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

function ProgressCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-2 w-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
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

export default function Discipleship() {
  const { plans, progress, groups, stats, isLoading, error } = useDiscipleship();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || plan.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeProgress = progress.filter((p) => p.status === 'active');
  const recentCompletions = progress.filter((p) => p.status === 'completed').slice(0, 5);

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load discipleship data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discipleship</h1>
          <p className="text-muted-foreground mt-1">
            Track spiritual growth and discipleship journeys
          </p>
        </div>
        <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Discipleship Plan</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="planName">Plan Name</Label>
                <Input id="planName" placeholder="Enter plan name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Brief description of the plan" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctrine">Doctrine</SelectItem>
                      <SelectItem value="conduct">Conduct</SelectItem>
                      <SelectItem value="character">Character</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4weeks">4 Weeks</SelectItem>
                      <SelectItem value="8weeks">8 Weeks</SelectItem>
                      <SelectItem value="12weeks">12 Weeks</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lessons">Number of Lessons</Label>
                <Input id="lessons" type="number" placeholder="Enter number of lessons" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreatePlanOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreatePlanOpen(false)}>
                  Create Plan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPlans ?? plans.length}</div>
                <p className="text-xs text-muted-foreground">Active plans</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeParticipants ?? activeProgress.length}</div>
                <p className="text-xs text-muted-foreground">Currently enrolled</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.completedJourneys ?? recentCompletions.length}</div>
                <p className="text-xs text-muted-foreground">Journeys completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Small Groups</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.smallGroups ?? groups.length}</div>
                <p className="text-xs text-muted-foreground">Active groups</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Weekly Engagement</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.weeklyEngagement ?? 0}%</div>
                <p className="text-xs text-muted-foreground">Completion rate</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="plans" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Discipleship Plans
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Member Progress
          </TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Small Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="doctrine">Doctrine</SelectItem>
                <SelectItem value="conduct">Conduct</SelectItem>
                <SelectItem value="character">Character</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                <PlanCardSkeleton />
                <PlanCardSkeleton />
                <PlanCardSkeleton />
                <PlanCardSkeleton />
                <PlanCardSkeleton />
                <PlanCardSkeleton />
              </>
            ) : filteredPlans.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No discipleship plans found.
                </CardContent>
              </Card>
            ) : (
              filteredPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={categoryColors[plan.category]}>
                        {categoryIcons[plan.category]}
                        <span className="ml-1 capitalize">{plan.category}</span>
                      </Badge>
                      <Badge variant="outline">{plan.estimatedDuration || 'Self-paced'}</Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>{plan.totalLessons} lessons</span>
                      <span>{plan.enrolledCount} enrolled</span>
                    </div>
                    <Progress value={plan.enrolledCount > 0 ? (plan.completedCount / plan.enrolledCount) * 100 : 0} className="mb-4" />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            Manage Participants
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Journeys</CardTitle>
              <CardDescription>Track member progress through discipleship plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <>
                    <ProgressCardSkeleton />
                    <ProgressCardSkeleton />
                    <ProgressCardSkeleton />
                  </>
                ) : activeProgress.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active discipleship journeys.
                  </p>
                ) : (
                  activeProgress.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {item.memberName.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{item.memberName}</h4>
                          <Badge className={statusColors[item.status]}>{item.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.planName}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Progress value={item.progress} className="flex-1" />
                          <span className="text-sm text-muted-foreground">
                            {item.currentLesson}/{item.totalLessons}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last activity: {new Date(item.lastActivityAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Completions */}
          {!isLoading && recentCompletions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Completions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentCompletions.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <p className="font-medium">{item.memberName}</p>
                        <p className="text-sm text-muted-foreground">
                          Completed {item.planName}
                        </p>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Manage small groups for accountability and discipleship
            </p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                <PlanCardSkeleton />
                <PlanCardSkeleton />
                <PlanCardSkeleton />
              </>
            ) : groups.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No small groups found.
                </CardContent>
              </Card>
            ) : (
              groups.map((group) => (
                <Card key={group.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Led by {group.leaderName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{group.meetingDay}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{group.meetingTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {group.memberCount} members
                      </Badge>
                      {group.currentPlanName && (
                        <Badge variant="outline" className="text-xs">
                          {group.currentPlanName}
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" className="w-full mt-4" size="sm">
                      View Group
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
