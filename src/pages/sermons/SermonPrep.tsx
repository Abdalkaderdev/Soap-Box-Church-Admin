import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Clock,
  FileText,
  Sparkles,
  BookMarked,
  PenTool,
  Share2,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  Lightbulb,
  Quote,
  ListChecks,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { sermonsApi } from '@/lib/api';
import type { SermonFilters } from '@/lib/api';
import type { Sermon, SermonCreateInput } from '@/types';

// Status configuration
const statusColors: Record<Sermon['status'], string> = {
  'draft': 'bg-ivory-100 text-walnut-700 border-ivory-200',
  'review': 'bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary/20',
  'approved': 'bg-sage-100 text-sage-700 border-sage-200',
  'delivered': 'bg-burgundy-100 text-burgundy-700 border-burgundy-200',
  'archived': 'bg-walnut-100 text-walnut-600 border-walnut-200',
};

const statusLabels: Record<Sermon['status'], string> = {
  'draft': 'Draft',
  'review': 'In Review',
  'approved': 'Approved',
  'delivered': 'Delivered',
  'archived': 'Archived',
};

export default function SermonPrep() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewSermonOpen, setIsNewSermonOpen] = useState(false);
  const [isNewSeriesOpen, setIsNewSeriesOpen] = useState(false);
  const [deleteSermonId, setDeleteSermonId] = useState<string | null>(null);
  const [deleteSeriesId, setDeleteSeriesId] = useState<string | null>(null);

  // Form state for new sermon
  const [newSermonTitle, setNewSermonTitle] = useState('');
  const [newSermonScripture, setNewSermonScripture] = useState('');
  const [newSermonDate, setNewSermonDate] = useState('');
  const [newSermonSeries, setNewSermonSeries] = useState('');

  // Form state for new series
  const [newSeriesTitle, setNewSeriesTitle] = useState('');
  const [newSeriesDescription, setNewSeriesDescription] = useState('');
  const [newSeriesStartDate, setNewSeriesStartDate] = useState('');

  // Build filters for API call
  const filters: SermonFilters = {
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter as Sermon['status'] : undefined,
  };

  // Fetch sermons
  const {
    data: sermonsData,
    isLoading: sermonsLoading,
    error: sermonsError,
  } = useQuery({
    queryKey: ['sermons', churchId, filters],
    queryFn: () => sermonsApi.list(churchId!, filters),
    enabled: !!churchId,
  });

  // Fetch series
  const {
    data: seriesData,
    isLoading: seriesLoading,
  } = useQuery({
    queryKey: ['sermon-series', churchId],
    queryFn: () => sermonsApi.listSeries(churchId!),
    enabled: !!churchId,
  });

  // Fetch upcoming sermons
  const {
    data: upcomingSermons,
    isLoading: upcomingLoading,
  } = useQuery({
    queryKey: ['sermons', 'upcoming', churchId],
    queryFn: () => sermonsApi.getUpcoming(churchId!, 3),
    enabled: !!churchId,
  });

  // Fetch sermon stats
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['sermons', 'stats', churchId],
    queryFn: () => sermonsApi.getStats(churchId!),
    enabled: !!churchId,
  });

  // Create sermon mutation
  const createSermonMutation = useMutation({
    mutationFn: (data: SermonCreateInput) => sermonsApi.create(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons'] });
      setIsNewSermonOpen(false);
      resetSermonForm();
    },
  });

  // Delete sermon mutation
  const deleteSermonMutation = useMutation({
    mutationFn: (sermonId: string) => sermonsApi.delete(churchId!, sermonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons'] });
      setDeleteSermonId(null);
    },
  });

  // Duplicate sermon mutation
  const duplicateSermonMutation = useMutation({
    mutationFn: (sermonId: string) => sermonsApi.duplicate(churchId!, sermonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons'] });
    },
  });

  // Create series mutation
  const createSeriesMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; startDate?: string }) =>
      sermonsApi.createSeries(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon-series'] });
      setIsNewSeriesOpen(false);
      resetSeriesForm();
    },
  });

  // Delete series mutation
  const deleteSeriesMutation = useMutation({
    mutationFn: (seriesId: string) => sermonsApi.deleteSeries(churchId!, seriesId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon-series'] });
      setDeleteSeriesId(null);
    },
  });

  const sermons = sermonsData?.data || [];
  const series = seriesData?.data || [];

  const resetSermonForm = () => {
    setNewSermonTitle('');
    setNewSermonScripture('');
    setNewSermonDate('');
    setNewSermonSeries('');
  };

  const resetSeriesForm = () => {
    setNewSeriesTitle('');
    setNewSeriesDescription('');
    setNewSeriesStartDate('');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreateSermon = () => {
    if (!newSermonTitle.trim()) return;

    const data: SermonCreateInput = {
      title: newSermonTitle,
      scriptureReferences: newSermonScripture ? [newSermonScripture] : [],
      scheduledDate: newSermonDate || undefined,
      seriesId: newSermonSeries && newSermonSeries !== 'none' ? newSermonSeries : undefined,
      status: 'draft',
    };

    createSermonMutation.mutate(data);
  };

  const handleCreateSeries = () => {
    if (!newSeriesTitle.trim()) return;

    createSeriesMutation.mutate({
      title: newSeriesTitle,
      description: newSeriesDescription || undefined,
      startDate: newSeriesStartDate || undefined,
    });
  };

  const handleDeleteSermon = (sermonId: string) => {
    deleteSermonMutation.mutate(sermonId);
  };

  const handleDuplicateSermon = (sermonId: string) => {
    duplicateSermonMutation.mutate(sermonId);
  };

  const handleDeleteSeries = (seriesId: string) => {
    deleteSeriesMutation.mutate(seriesId);
  };

  // Loading skeleton for stats cards
  const StatsCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );

  // Loading skeleton for sermon cards
  const SermonCardSkeleton = () => (
    <Card className="border-ivory-200">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Loading skeleton for series cards
  const SeriesCardSkeleton = () => (
    <Card className="border-ivory-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-40 mt-2" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full mt-4" />
      </CardContent>
    </Card>
  );

  if (!churchId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center text-walnut-500">
            Please log in to access sermon preparation.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-walnut-900">Sermon Preparation</h1>
          <p className="text-walnut-600 mt-1">
            Plan, prepare, and organize your messages
          </p>
        </div>
        <Dialog open={isNewSermonOpen} onOpenChange={setIsNewSermonOpen}>
          <DialogTrigger asChild>
            <Button className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-50">
              <Plus className="mr-2 h-4 w-4" />
              New Sermon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Create New Sermon</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Sermon Title</Label>
                <Input
                  id="title"
                  placeholder="Enter sermon title"
                  value={newSermonTitle}
                  onChange={(e) => setNewSermonTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scripture">Scripture Reference</Label>
                <Input
                  id="scripture"
                  placeholder="e.g., John 3:16-21"
                  value={newSermonScripture}
                  onChange={(e) => setNewSermonScripture(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Scheduled Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newSermonDate}
                    onChange={(e) => setNewSermonDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="series">Series (Optional)</Label>
                  <Select value={newSermonSeries} onValueChange={setNewSermonSeries}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select series" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Series</SelectItem>
                      {series.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsNewSermonOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSermon}
                  className="bg-burgundy-700 hover:bg-burgundy-800"
                  disabled={createSermonMutation.isPending || !newSermonTitle.trim()}
                >
                  {createSermonMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PenTool className="mr-2 h-4 w-4" />
                  )}
                  Create Sermon
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-gradient-to-br from-burgundy-50 to-burgundy-100/50 border-burgundy-200/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-burgundy-700">Total Sermons</CardTitle>
                <BookOpen className="h-4 w-4 text-burgundy-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif text-burgundy-900">
                  {stats?.totalSermons ?? 0}
                </div>
                <p className="text-xs text-burgundy-600">In your library</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-sidebar-primary/5 to-sidebar-primary/10 border-sidebar-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-walnut-700">In Progress</CardTitle>
                <PenTool className="h-4 w-4 text-sidebar-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif text-walnut-900">
                  {(stats?.byStatus?.draft ?? 0) + (stats?.byStatus?.review ?? 0)}
                </div>
                <p className="text-xs text-walnut-600">Being prepared</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-sage-50 to-sage-100/50 border-sage-200/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-sage-700">Ready to Deliver</CardTitle>
                <FileText className="h-4 w-4 text-sage-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif text-sage-900">
                  {stats?.byStatus?.approved ?? 0}
                </div>
                <p className="text-xs text-sage-600">Completed sermons</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-ivory-50 to-ivory-100/50 border-ivory-200/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-walnut-700">Active Series</CardTitle>
                <BookMarked className="h-4 w-4 text-walnut-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif text-walnut-900">
                  {stats?.totalSeries ?? 0}
                </div>
                <p className="text-xs text-walnut-600">Ongoing series</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Upcoming Sermons Banner */}
      {upcomingLoading ? (
        <Card className="bg-gradient-to-r from-burgundy-800 to-burgundy-900 text-ivory-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-sidebar-primary" />
              <h3 className="font-serif font-semibold text-lg">Upcoming Sermons</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <Skeleton className="h-4 w-20 mb-2 bg-white/20" />
                  <Skeleton className="h-5 w-full mb-1 bg-white/20" />
                  <Skeleton className="h-4 w-24 bg-white/20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : upcomingSermons && upcomingSermons.length > 0 ? (
        <Card className="bg-gradient-to-r from-burgundy-800 to-burgundy-900 text-ivory-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-sidebar-primary" />
              <h3 className="font-serif font-semibold text-lg">Upcoming Sermons</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingSermons.map((sermon) => (
                <div key={sermon.id} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sidebar-primary text-sm mb-2">
                    <Clock className="h-3.5 w-3.5" />
                    {sermon.scheduledDate ? formatDate(sermon.scheduledDate) : 'Not scheduled'}
                  </div>
                  <h4 className="font-semibold text-ivory-100">{sermon.title}</h4>
                  <p className="text-ivory-300 text-sm mt-1">
                    {sermon.scriptureReferences?.join(', ') || 'No scripture'}
                  </p>
                  <Badge className={`${statusColors[sermon.status]} mt-2`}>
                    {statusLabels[sermon.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="sermons" className="space-y-4">
        <TabsList className="bg-ivory-100/50 border border-ivory-200">
          <TabsTrigger value="sermons" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FileText className="mr-2 h-4 w-4" />
            Sermons
          </TabsTrigger>
          <TabsTrigger value="series" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BookMarked className="mr-2 h-4 w-4" />
            Series
          </TabsTrigger>
          <TabsTrigger value="resources" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Lightbulb className="mr-2 h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sermons" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-walnut-400" />
              <Input
                placeholder="Search sermons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-ivory-200 focus:border-burgundy-300"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] border-ivory-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sermon List */}
          <div className="space-y-3">
            {sermonsLoading ? (
              <>
                <SermonCardSkeleton />
                <SermonCardSkeleton />
                <SermonCardSkeleton />
              </>
            ) : sermonsError ? (
              <Card>
                <CardContent className="p-8 text-center text-red-500">
                  Error loading sermons. Please try again.
                </CardContent>
              </Card>
            ) : sermons.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-walnut-500">
                  No sermons found. Create your first sermon to get started.
                </CardContent>
              </Card>
            ) : (
              sermons.map((sermon) => (
                <Card key={sermon.id} className="hover:shadow-warm transition-shadow border-ivory-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-burgundy-50 rounded-xl border border-burgundy-100">
                          <BookOpen className="h-5 w-5 text-burgundy-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-serif font-semibold text-lg text-walnut-900">{sermon.title}</h3>
                            <Badge variant="outline" className={statusColors[sermon.status]}>
                              {statusLabels[sermon.status]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-walnut-600">
                            {sermon.scriptureReferences && sermon.scriptureReferences.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Quote className="h-3.5 w-3.5" />
                                {sermon.scriptureReferences.join(', ')}
                              </span>
                            )}
                            {sermon.scheduledDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(sermon.scheduledDate)}
                              </span>
                            )}
                            {sermon.series && (
                              <span className="flex items-center gap-1">
                                <BookMarked className="h-3.5 w-3.5" />
                                {sermon.series.title}
                              </span>
                            )}
                          </div>
                          {sermon.tags && sermon.tags.length > 0 && (
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <ListChecks className="h-3.5 w-3.5 text-sage-600" />
                              {sermon.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="bg-sage-50 text-sage-700 border-sage-200 text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-walnut-500 hover:text-walnut-700">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateSermon(sermon.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share with Team
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteSermonId(sermon.id)}
                          >
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

        <TabsContent value="series" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-walnut-600">
              Organize your sermons into themed series
            </p>
            <Dialog open={isNewSeriesOpen} onOpenChange={setIsNewSeriesOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-burgundy-200 text-burgundy-700 hover:bg-burgundy-50">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Series
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Create New Series</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="series-title">Series Title</Label>
                    <Input
                      id="series-title"
                      placeholder="Enter series title"
                      value={newSeriesTitle}
                      onChange={(e) => setNewSeriesTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="series-description">Description (Optional)</Label>
                    <Input
                      id="series-description"
                      placeholder="Brief description of the series"
                      value={newSeriesDescription}
                      onChange={(e) => setNewSeriesDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="series-start-date">Start Date (Optional)</Label>
                    <Input
                      id="series-start-date"
                      type="date"
                      value={newSeriesStartDate}
                      onChange={(e) => setNewSeriesStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsNewSeriesOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateSeries}
                      className="bg-burgundy-700 hover:bg-burgundy-800"
                      disabled={createSeriesMutation.isPending || !newSeriesTitle.trim()}
                    >
                      {createSeriesMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BookMarked className="mr-2 h-4 w-4" />
                      )}
                      Create Series
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seriesLoading ? (
              <>
                <SeriesCardSkeleton />
                <SeriesCardSkeleton />
              </>
            ) : series.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="p-8 text-center text-walnut-500">
                  No series found. Create your first series to organize your sermons.
                </CardContent>
              </Card>
            ) : (
              series.map((s) => (
                <Card key={s.id} className="hover:shadow-warm transition-shadow border-ivory-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={s.status === 'active' ? 'bg-sage-50 text-sage-700 border-sage-200' : 'bg-ivory-100 text-walnut-600'}
                      >
                        {s.status === 'active' ? 'Active' : s.status === 'completed' ? 'Completed' : s.status}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-walnut-500">{s.sermonCount} sermons</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteSeriesId(s.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardTitle className="font-serif text-lg text-walnut-900 mt-2">{s.title}</CardTitle>
                    <CardDescription className="text-walnut-600">{s.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-walnut-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {s.startDate ? new Date(s.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No start date'}
                        {s.endDate && ` - ${new Date(s.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </span>
                    </div>
                    <Button variant="outline" className="w-full mt-4" size="sm">
                      View Sermons
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-warm transition-shadow border-ivory-200">
              <CardHeader>
                <div className="p-3 bg-sidebar-primary/10 rounded-xl w-fit">
                  <Sparkles className="h-6 w-6 text-sidebar-primary" />
                </div>
                <CardTitle className="font-serif text-lg mt-3">AI Sermon Assistant</CardTitle>
                <CardDescription>
                  Get help with sermon outlines, illustrations, and key points
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-burgundy-700 hover:bg-burgundy-800">
                  Start Writing
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-warm transition-shadow border-ivory-200">
              <CardHeader>
                <div className="p-3 bg-sage-100 rounded-xl w-fit">
                  <Quote className="h-6 w-6 text-sage-600" />
                </div>
                <CardTitle className="font-serif text-lg mt-3">Scripture Library</CardTitle>
                <CardDescription>
                  Search and reference scripture passages for your sermons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Browse Scripture
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-warm transition-shadow border-ivory-200">
              <CardHeader>
                <div className="p-3 bg-burgundy-50 rounded-xl w-fit">
                  <MessageCircle className="h-6 w-6 text-burgundy-600" />
                </div>
                <CardTitle className="font-serif text-lg mt-3">Illustration Bank</CardTitle>
                <CardDescription>
                  Find stories and illustrations to bring your message to life
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Find Illustrations
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Sermon Confirmation Dialog */}
      <Dialog open={!!deleteSermonId} onOpenChange={() => setDeleteSermonId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sermon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sermon? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSermonId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteSermonId && handleDeleteSermon(deleteSermonId)}
              disabled={deleteSermonMutation.isPending}
            >
              {deleteSermonMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Series Confirmation Dialog */}
      <Dialog open={!!deleteSeriesId} onOpenChange={() => setDeleteSeriesId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Series</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this series? Sermons in this series will not be deleted but will no longer be associated with this series.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSeriesId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteSeriesId && handleDeleteSeries(deleteSeriesId)}
              disabled={deleteSeriesMutation.isPending}
            >
              {deleteSeriesMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
