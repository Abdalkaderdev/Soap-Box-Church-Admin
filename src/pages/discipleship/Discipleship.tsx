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
  AlertCircle,
  Sparkles,
  ChevronRight,
  UserPlus,
  Crown,
  Compass,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import {
  discipleshipApi,
  type DiscipleshipPlan,
  type DiscipleProgress,
  type DiscipleshipSmallGroup,
  type DiscipleshipFilters,
} from '@/lib/api';

// ===================================================================
// TYPES
// ===================================================================

interface DiscipleshipStats {
  totalPlans: number;
  activeParticipants: number;
  completedJourneys: number;
  smallGroups: number;
  weeklyEngagement: number;
}

// ===================================================================
// CATEGORY STYLING
// ===================================================================

const categoryIcons: Record<DiscipleshipPlan['category'], React.ReactNode> = {
  doctrine: <Book className="h-4 w-4" />,
  conduct: <Heart className="h-4 w-4" />,
  character: <Flame className="h-4 w-4" />,
  service: <Users className="h-4 w-4" />,
};

const categoryColors: Record<DiscipleshipPlan['category'], string> = {
  doctrine: 'bg-primary/10 text-primary border-primary/20',
  conduct: 'bg-accent/10 text-accent border-accent/20',
  character: 'bg-amber-100 text-amber-700 border-amber-200',
  service: 'bg-blue-100 text-blue-700 border-blue-200',
};

const statusColors: Record<DiscipleProgress['status'], string> = {
  active: 'bg-accent/10 text-accent border-accent/20',
  completed: 'bg-primary/10 text-primary border-primary/20',
  paused: 'bg-muted text-muted-foreground border-border',
  dropped: 'bg-destructive/10 text-destructive border-destructive/20',
};

const categoryPathwayConfig: Record<DiscipleshipPlan['category'], { icon: React.ReactNode; color: string; bgColor: string; borderColor: string; name: string; description: string }> = {
  doctrine: {
    icon: <Sparkles className="h-6 w-6" />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    name: 'Foundational Beliefs',
    description: 'Understand the core doctrines of the Christian faith',
  },
  character: {
    icon: <Flame className="h-6 w-6" />,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary/20',
    name: 'Spiritual Growth',
    description: 'Develop Christ-like character and spiritual disciplines',
  },
  conduct: {
    icon: <Heart className="h-6 w-6" />,
    color: 'text-accent',
    bgColor: 'bg-accent/5',
    borderColor: 'border-accent/20',
    name: 'Christian Living',
    description: 'Apply faith to everyday life and relationships',
  },
  service: {
    icon: <Crown className="h-6 w-6" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    name: 'Leadership & Service',
    description: 'Prepare to serve and lead in ministry',
  },
};

// ===================================================================
// SKELETON COMPONENTS
// ===================================================================

function PlanCardSkeleton() {
  return (
    <Card className="border-border/60">
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
    <Card className="border-border/60">
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
    <Card className="border-border/60">
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

function PathwayCardSkeleton() {
  return (
    <Card className="border-2 border-border/60">
      <div className="px-6 py-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-border/60">
          <Skeleton className="h-3 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function GroupCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-9 w-full mt-4" />
      </CardContent>
    </Card>
  );
}

// ===================================================================
// SUB-COMPONENTS
// ===================================================================

interface PathwayCardProps {
  category: DiscipleshipPlan['category'];
  plans: DiscipleshipPlan[];
  progressData: DiscipleProgress[];
}

function PathwayCard({ category, plans, progressData }: PathwayCardProps) {
  const config = categoryPathwayConfig[category];

  // Calculate total enrolled and completed for this category
  const categoryPlanIds = new Set(plans.map(p => String(p.id)));
  const categoryProgress = progressData.filter(p => categoryPlanIds.has(String(p.planId)));
  const completedCount = categoryProgress.filter(p => p.status === 'completed').length;
  const totalCount = categoryProgress.length || 1; // Avoid division by zero
  const completionPercent = Math.round((completedCount / totalCount) * 100) || 0;

  return (
    <Card className={`border-2 ${config.borderColor} hover:shadow-lg transition-all duration-300 overflow-hidden`}>
      <div className={`${config.bgColor} px-6 py-4 border-b ${config.borderColor}`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-white/80 ${config.color}`}>
            {config.icon}
          </div>
          <div>
            <h3 className={`font-serif text-xl font-semibold ${config.color}`}>{config.name}</h3>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="space-y-4">
          {plans.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No courses in this pathway yet</p>
          ) : (
            plans.slice(0, 4).map((plan) => {
              const planProgress = progressData.find(p => String(p.planId) === String(plan.id));
              const lessonProgress = planProgress
                ? (planProgress.currentLesson / planProgress.totalLessons) * 100
                : 0;
              const status = planProgress?.status || 'not_started';

              return (
                <div key={plan.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    status === 'completed' ? 'bg-accent text-white' :
                    status === 'active' ? 'bg-primary/20 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-semibold">{planProgress?.currentLesson || 0}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.estimatedDuration || 'Self-paced'}</p>
                  </div>
                  <div className="text-right">
                    <Progress
                      value={lessonProgress}
                      className="w-20 h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {planProgress?.currentLesson || 0}/{plan.totalLessons}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Pathway Progress</span>
            <span className={`text-sm font-semibold ${config.color}`}>{completionPercent}%</span>
          </div>
          <Progress value={completionPercent} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {completedCount} of {totalCount} journeys completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface NextStepsCardProps {
  progressData: DiscipleProgress[];
  plans: DiscipleshipPlan[];
}

function NextStepsCard({ progressData, plans }: NextStepsCardProps) {
  // Generate next steps from real data
  const activeProgress = progressData.filter(p => p.status === 'active');
  const notStartedPlans = plans.filter(
    p => p.status === 'active' && !progressData.some(prog => String(prog.planId) === String(p.id))
  );

  const steps = [
    ...activeProgress.slice(0, 2).map(prog => ({
      id: String(prog.id),
      title: `Continue ${prog.planName}`,
      description: `Lesson ${prog.currentLesson} of ${prog.totalLessons} - ${Math.round(prog.progress)}% complete`,
      icon: <BookOpen className="h-5 w-5" />,
      priority: 'high' as const,
      actionLabel: 'Continue',
    })),
    ...notStartedPlans.slice(0, 2).map(plan => ({
      id: String(plan.id),
      title: `Start ${plan.name}`,
      description: plan.description,
      icon: <Sparkles className="h-5 w-5" />,
      priority: 'medium' as const,
      actionLabel: 'Begin',
    })),
  ];

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-primary/10 text-primary border-l-primary';
      case 'medium': return 'bg-amber-50 text-amber-700 border-l-amber-500';
      case 'low': return 'bg-muted text-muted-foreground border-l-muted-foreground';
    }
  };

  if (steps.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          <CardTitle className="font-serif text-lg">Your Next Steps</CardTitle>
        </div>
        <CardDescription>Personalized recommendations for your spiritual journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map(step => (
            <div key={step.id} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(step.priority)}`}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{step.description}</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0">
                  {step.actionLabel}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface BadgesDisplayProps {
  progressData: DiscipleProgress[];
}

function BadgesDisplay({ progressData }: BadgesDisplayProps) {
  // Generate badges from completed journeys
  const completedProgress = progressData.filter(p => p.status === 'completed' && p.completedAt);

  if (completedProgress.length === 0) {
    return null;
  }

  const badges = completedProgress.slice(0, 6).map(prog => ({
    id: String(prog.id),
    name: `${prog.planName} Graduate`,
    description: `Completed the ${prog.planName} course`,
    icon: <Award className="h-5 w-5" />,
    earnedDate: prog.completedAt!,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  }));

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-600" />
          <CardTitle className="font-serif text-lg">Earned Certificates</CardTitle>
        </div>
        <CardDescription>Celebrate your achievements in faith</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {badges.map(badge => (
            <div key={badge.id} className={`p-4 rounded-xl border-2 text-center ${badge.color} hover:shadow-md transition-all duration-200`}>
              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center mx-auto mb-2 shadow-sm">
                {badge.icon}
              </div>
              <p className="font-semibold text-sm">{badge.name}</p>
              <p className="text-xs opacity-80 mt-1">{badge.description}</p>
              <p className="text-xs mt-2 opacity-70">
                Earned {new Date(badge.earnedDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
        {completedProgress.length > 6 && (
          <Button variant="outline" className="w-full mt-4">
            View All Certificates ({completedProgress.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ===================================================================
// MAIN COMPONENT
// ===================================================================

export default function Discipleship() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [newPlanData, setNewPlanData] = useState({
    name: '',
    description: '',
    category: '' as DiscipleshipPlan['category'] | '',
    estimatedDuration: '',
  });

  // Fetch discipleship plans
  const plansQuery = useQuery({
    queryKey: ['discipleship', churchId, 'plans', { search: searchQuery, category: categoryFilter }],
    queryFn: async () => {
      const filters: DiscipleshipFilters = {};
      if (searchQuery) filters.search = searchQuery;
      if (categoryFilter && categoryFilter !== 'all') filters.category = categoryFilter;
      const response = await discipleshipApi.listPlans(churchId!, filters);
      return response.data;
    },
    enabled: !!churchId,
  });

  // Fetch progress data
  const progressQuery = useQuery({
    queryKey: ['discipleship', churchId, 'progress'],
    queryFn: async () => {
      const response = await discipleshipApi.listProgress(churchId!);
      return response.data;
    },
    enabled: !!churchId,
  });

  // Fetch groups
  const groupsQuery = useQuery({
    queryKey: ['discipleship', churchId, 'groups'],
    queryFn: async () => {
      const response = await discipleshipApi.listGroups(churchId!);
      return response.data;
    },
    enabled: !!churchId,
  });

  // Fetch stats
  const statsQuery = useQuery({
    queryKey: ['discipleship', churchId, 'stats'],
    queryFn: () => discipleshipApi.getStats(churchId!),
    enabled: !!churchId,
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; category: DiscipleshipPlan['category']; estimatedDuration?: string }) =>
      discipleshipApi.createPlan(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipleship', churchId, 'plans'] });
      queryClient.invalidateQueries({ queryKey: ['discipleship', churchId, 'stats'] });
      setIsCreatePlanOpen(false);
      setNewPlanData({ name: '', description: '', category: '', estimatedDuration: '' });
    },
  });

  // Enroll in plan mutation
  const enrollMutation = useMutation({
    mutationFn: (planId: number) => discipleshipApi.enrollInPlan(churchId!, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipleship', churchId, 'progress'] });
      queryClient.invalidateQueries({ queryKey: ['discipleship', churchId, 'plans'] });
      queryClient.invalidateQueries({ queryKey: ['discipleship', churchId, 'stats'] });
    },
  });

  const plans = plansQuery.data ?? [];
  const progress = progressQuery.data ?? [];
  const groups = groupsQuery.data ?? [];
  const stats = statsQuery.data as DiscipleshipStats | undefined;

  const isLoading = plansQuery.isLoading || progressQuery.isLoading || groupsQuery.isLoading || statsQuery.isLoading;
  const error = plansQuery.error || progressQuery.error || groupsQuery.error || statsQuery.error;

  const activeProgress = progress.filter((p) => p.status === 'active');
  const recentCompletions = progress.filter((p) => p.status === 'completed').slice(0, 5);

  // Group plans by category for pathways
  const plansByCategory = plans.reduce((acc, plan) => {
    if (!acc[plan.category]) {
      acc[plan.category] = [];
    }
    acc[plan.category].push(plan);
    return acc;
  }, {} as Record<DiscipleshipPlan['category'], DiscipleshipPlan[]>);

  const handleCreatePlan = () => {
    if (!newPlanData.name || !newPlanData.category) return;
    createPlanMutation.mutate({
      name: newPlanData.name,
      description: newPlanData.description || undefined,
      category: newPlanData.category as DiscipleshipPlan['category'],
      estimatedDuration: newPlanData.estimatedDuration || undefined,
    });
  };

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
    <div className="p-6 space-y-8">
      {/* Header Section with Warm Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 via-primary to-primary/80 p-8 text-white">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-amber-300" />
            <span className="text-amber-200 text-sm font-medium">Growing Together in Faith</span>
          </div>
          <h1 className="font-serif text-4xl font-bold mb-2">Discipleship Journey</h1>
          <p className="text-white/80 max-w-2xl mb-6">
            "Therefore go and make disciples of all nations, baptizing them in the name of the Father
            and of the Son and of the Holy Spirit" - Matthew 28:19
          </p>
          <div className="flex flex-wrap gap-3">
            <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-primary hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Discipleship Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Create Discipleship Plan</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="planName">Plan Name</Label>
                    <Input
                      id="planName"
                      placeholder="Enter plan name"
                      value={newPlanData.name}
                      onChange={(e) => setNewPlanData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Brief description of the plan"
                      value={newPlanData.description}
                      onChange={(e) => setNewPlanData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newPlanData.category}
                        onValueChange={(value) => setNewPlanData(prev => ({ ...prev, category: value as DiscipleshipPlan['category'] }))}
                      >
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
                      <Select
                        value={newPlanData.estimatedDuration}
                        onValueChange={(value) => setNewPlanData(prev => ({ ...prev, estimatedDuration: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4 weeks">4 Weeks</SelectItem>
                          <SelectItem value="8 weeks">8 Weeks</SelectItem>
                          <SelectItem value="12 weeks">12 Weeks</SelectItem>
                          <SelectItem value="6 months">6 Months</SelectItem>
                          <SelectItem value="1 year">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsCreatePlanOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePlan}
                      disabled={!newPlanData.name || !newPlanData.category || createPlanMutation.isPending}
                    >
                      {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <UserPlus className="mr-2 h-4 w-4" />
              Enroll Member
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
            <Card className="border-border/60 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Active Plans</CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{stats?.totalPlans ?? plans.filter(p => p.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">Available courses</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Active Learners</CardTitle>
                <div className="p-2 rounded-lg bg-accent/10">
                  <Users className="h-4 w-4 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{stats?.activeParticipants ?? activeProgress.length}</div>
                <p className="text-xs text-muted-foreground">Currently enrolled</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Completions</CardTitle>
                <div className="p-2 rounded-lg bg-amber-100">
                  <Award className="h-4 w-4 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{stats?.completedJourneys ?? recentCompletions.length}</div>
                <p className="text-xs text-muted-foreground">Journeys finished</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Small Groups</CardTitle>
                <div className="p-2 rounded-lg bg-blue-100">
                  <Heart className="h-4 w-4 text-blue-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{stats?.smallGroups ?? groups.length}</div>
                <p className="text-xs text-muted-foreground">Active groups</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Engagement</CardTitle>
                <div className="p-2 rounded-lg bg-accent/10">
                  <Target className="h-4 w-4 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{stats?.weeklyEngagement ?? 0}%</div>
                <p className="text-xs text-muted-foreground">Weekly rate</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Next Steps Recommendations */}
      {!isLoading && <NextStepsCard progressData={progress} plans={plans} />}

      {/* Main Tabs */}
      <Tabs defaultValue="pathways" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="pathways" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Compass className="h-4 w-4 mr-2" />
            Growth Pathways
          </TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="h-4 w-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Heart className="h-4 w-4 mr-2" />
            Small Groups
          </TabsTrigger>
        </TabsList>

        {/* Pathways Tab */}
        <TabsContent value="pathways" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Discipleship Pathways</h2>
              <p className="text-muted-foreground">Choose your path for spiritual growth</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PathwayCardSkeleton />
              <PathwayCardSkeleton />
              <PathwayCardSkeleton />
              <PathwayCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(['doctrine', 'character', 'conduct', 'service'] as const).map(category => (
                <PathwayCard
                  key={category}
                  category={category}
                  plans={plansByCategory[category] || []}
                  progressData={progress}
                />
              ))}
            </div>
          )}

          {/* Badges Section */}
          {!isLoading && <BadgesDisplay progressData={progress} />}
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Available Courses</h2>
              <p className="text-muted-foreground">Browse and enroll in discipleship courses</p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plansQuery.isLoading ? (
              <>
                <PlanCardSkeleton />
                <PlanCardSkeleton />
                <PlanCardSkeleton />
                <PlanCardSkeleton />
                <PlanCardSkeleton />
                <PlanCardSkeleton />
              </>
            ) : plans.length === 0 ? (
              <Card className="col-span-full border-border/60">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="font-medium">No courses found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria.</p>
                </CardContent>
              </Card>
            ) : (
              plans.map((plan) => {
                const isEnrolled = progress.some(p => String(p.planId) === String(plan.id));
                return (
                  <Card key={plan.id} className="border-border/60 hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`${categoryColors[plan.category]} border`}>
                          {categoryIcons[plan.category]}
                          <span className="ml-1 capitalize">{plan.category}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">{plan.estimatedDuration || 'Self-paced'}</Badge>
                      </div>
                      <CardTitle className="font-serif text-lg mt-2">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {plan.totalLessons} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {plan.enrolledCount} enrolled
                        </span>
                      </div>
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Completion rate</span>
                          <span className="font-medium">{plan.enrolledCount > 0 ? Math.round((plan.completedCount / plan.enrolledCount) * 100) : 0}%</span>
                        </div>
                        <Progress value={plan.enrolledCount > 0 ? (plan.completedCount / plan.enrolledCount) * 100 : 0} className="h-2" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={isEnrolled || enrollMutation.isPending}
                          onClick={() => enrollMutation.mutate(Number(plan.id))}
                        >
                          {isEnrolled ? 'Enrolled' : 'Enroll'}
                          {!isEnrolled && <ChevronRight className="h-4 w-4 ml-1" />}
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
                              Edit Course
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              Manage Participants
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Member Progress</h2>
              <p className="text-muted-foreground">Track discipleship journeys across your congregation</p>
            </div>
          </div>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="font-serif">Active Discipleship Journeys</CardTitle>
              <CardDescription>Track member progress through discipleship plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressQuery.isLoading ? (
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
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg border-border/60 hover:bg-muted/30 transition-colors">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {item.memberName.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{item.memberName}</h4>
                          <Badge className={`${statusColors[item.status]} border`}>{item.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.planName}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Progress value={item.progress} className="flex-1 h-2" />
                          <span className="text-sm font-medium text-muted-foreground">
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
          {recentCompletions.length > 0 && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="font-serif">Recent Completions</CardTitle>
                <CardDescription>Celebrate those who have completed their journeys</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCompletions.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg border-border/60 bg-accent/5">
                      <Avatar className="h-12 w-12 border-2 border-accent/20">
                        <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                          {item.memberName.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{item.memberName}</h4>
                          <Badge className="bg-accent/10 text-accent border-accent/20 border">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.planName}</p>
                        {item.completedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Completed: {new Date(item.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Award className="h-6 w-6 text-amber-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Small Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Small Groups</h2>
              <p className="text-muted-foreground">Connect and grow together in community</p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupsQuery.isLoading ? (
              <>
                <GroupCardSkeleton />
                <GroupCardSkeleton />
                <GroupCardSkeleton />
              </>
            ) : groups.length === 0 ? (
              <Card className="col-span-full border-border/60">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="font-medium">No small groups found</p>
                  <p className="text-sm">Create a group to start building community.</p>
                </CardContent>
              </Card>
            ) : (
              groups.map((group: DiscipleshipSmallGroup) => (
                <Card key={group.id} className="border-border/60 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-serif text-lg">{group.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          group.status === 'active' ? 'bg-accent/10 text-accent border-accent/20' :
                          group.status === 'forming' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-muted text-muted-foreground'
                        }
                      >
                        {group.status}
                      </Badge>
                    </div>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {group.leaderName && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Led by {group.leaderName}</span>
                        </div>
                      )}
                      {group.meetingDay && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{group.meetingDay}</span>
                        </div>
                      )}
                      {group.meetingTime && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{group.meetingTime}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
                      <Badge variant="secondary" className="bg-muted">
                        <Users className="h-3 w-3 mr-1" />
                        {group.memberCount}{group.maxMembers ? `/${group.maxMembers}` : ''} members
                      </Badge>
                      {group.currentPlanName && (
                        <Badge variant="outline" className="text-xs">
                          {group.currentPlanName}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" className="flex-1" size="sm">
                        View Group
                      </Button>
                      {group.isAcceptingMembers && (
                        <Button size="sm" className="flex-1">
                          Join Group
                        </Button>
                      )}
                    </div>
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
