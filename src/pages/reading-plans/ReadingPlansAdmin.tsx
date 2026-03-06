/**
 * Reading Plans Admin Page for Church Admin
 * Manage church-specific and global reading plans
 * Enhanced with structured templates for plan day content
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Globe,
  Church,
  BookMarked,
  Clock,
  Image,
  FileText,
  MessageSquare,
  Heart,
  ListOrdered,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  PlusCircle,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type PlanCategory = 'topical' | 'chronological' | 'book_study' | 'devotional';
type Testament = 'OT' | 'NT' | 'Both';
type SubscriptionTier = 'disciple' | 'servant' | 'torchbearer';
type PlanStatus = 'draft' | 'active' | 'archived';

interface ScriptureEntry {
  reference: string;
  text: string;
}

interface ReadingPlan {
  id: string;
  churchId: string | null;
  name: string;
  description: string;
  duration: number;
  difficulty: Difficulty;
  category: PlanCategory;
  testament: Testament;
  subscriptionTier: SubscriptionTier;
  coverImageUrl?: string;
  status: PlanStatus;
  subscriberCount: number;
  daysCount: number;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReadingPlanDay {
  id: string;
  planId: string;
  dayNumber: number;
  title: string;
  mainScripture: ScriptureEntry;
  supportingScriptures: ScriptureEntry[];
  devotionalContent?: string;
  reflectionQuestion?: string;
  prayerPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReadingPlanCreateInput {
  name: string;
  description: string;
  duration: number;
  difficulty: Difficulty;
  category: PlanCategory;
  testament: Testament;
  subscriptionTier: SubscriptionTier;
  coverImageUrl?: string;
  status: PlanStatus;
}

interface ReadingPlanDayInput {
  dayNumber: number;
  title: string;
  mainScripture: ScriptureEntry;
  supportingScriptures: ScriptureEntry[];
  devotionalContent?: string;
  reflectionQuestion?: string;
  prayerPrompt?: string;
}

interface ReadingPlansResponse {
  data: ReadingPlan[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

interface ReadingPlanDaysResponse {
  data: ReadingPlanDay[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'bg-green-100 text-green-700 border-green-200' },
  intermediate: { label: 'Intermediate', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  advanced: { label: 'Advanced', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

const CATEGORY_CONFIG: Record<PlanCategory, { label: string; color: string }> = {
  topical: { label: 'Topical', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  chronological: { label: 'Chronological', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  book_study: { label: 'Book Study', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  devotional: { label: 'Devotional', color: 'bg-pink-100 text-pink-700 border-pink-200' },
};

const TESTAMENT_CONFIG: Record<Testament, { label: string; color: string }> = {
  OT: { label: 'Old Testament', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  NT: { label: 'New Testament', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  Both: { label: 'Both Testaments', color: 'bg-violet-100 text-violet-700 border-violet-200' },
};

const TIER_CONFIG: Record<SubscriptionTier, { label: string; color: string }> = {
  disciple: { label: 'Disciple', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  servant: { label: 'Servant', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  torchbearer: { label: 'Torchbearer', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const STATUS_CONFIG: Record<PlanStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
  archived: { label: 'Archived', color: 'bg-red-100 text-red-700 border-red-200' },
};

const EMPTY_SCRIPTURE: ScriptureEntry = { reference: '', text: '' };

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

function PlanCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

// ============================================================================
// DAY PREVIEW COMPONENT
// ============================================================================

function DayPreviewDialog({
  day,
  open,
  onOpenChange,
}: {
  day: ReadingPlanDay | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!day) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Day {day.dayNumber} Preview</DialogTitle>
          <DialogDescription className="sr-only">
            Preview of day {day.dayNumber} content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Day Header */}
          <div className="text-center border-b border-golden-200 pb-6">
            <p className="text-sm font-medium tracking-widest uppercase text-sanctuary-500 mb-2">
              Day {day.dayNumber}
            </p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-sanctuary-800">
              {day.title}
            </h2>
          </div>

          {/* Main Scripture Blockquote */}
          {day.mainScripture.reference && (
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-golden-400 rounded-full" />
              <blockquote className="pl-6 py-2">
                <p className="text-base italic text-sanctuary-700 leading-relaxed whitespace-pre-wrap">
                  {day.mainScripture.text || '(Scripture text not provided)'}
                </p>
                <footer className="mt-3 text-sm font-semibold text-golden-600">
                  -- {day.mainScripture.reference}
                </footer>
              </blockquote>
            </div>
          )}

          {/* Devotional Content */}
          {day.devotionalContent && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-spirit-600">
                <FileText className="w-4 h-4" />
                Devotional
              </h3>
              <div className="text-sanctuary-700 leading-relaxed whitespace-pre-wrap">
                {day.devotionalContent}
              </div>
            </div>
          )}

          {/* Supporting Scriptures */}
          {day.supportingScriptures.length > 0 && day.supportingScriptures.some((s) => s.reference) && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-spirit-600">
                <BookMarked className="w-4 h-4" />
                Supporting Scriptures
              </h3>
              <ul className="space-y-3">
                {day.supportingScriptures
                  .filter((s) => s.reference)
                  .map((scripture, idx) => (
                    <li
                      key={idx}
                      className="rounded-lg border border-grace-300 bg-grace-50 p-4"
                    >
                      <p className="text-sm font-semibold text-sanctuary-600 mb-1">
                        {scripture.reference}
                      </p>
                      {scripture.text && (
                        <p className="text-sm italic text-sanctuary-600 leading-relaxed whitespace-pre-wrap">
                          {scripture.text}
                        </p>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Reflection Question */}
          {day.reflectionQuestion && (
            <div className="rounded-lg border-2 border-golden-300 bg-golden-50 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-golden-700 mb-2">
                <MessageSquare className="w-4 h-4" />
                Reflect
              </h3>
              <p className="text-sanctuary-700 leading-relaxed whitespace-pre-wrap">
                {day.reflectionQuestion}
              </p>
            </div>
          )}

          {/* Prayer Prompt */}
          {day.prayerPrompt && (
            <div className="rounded-lg bg-sanctuary-50 border border-sanctuary-200 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-vesper-500 mb-2">
                <Heart className="w-4 h-4" />
                Prayer
              </h3>
              <p className="text-sanctuary-700 italic leading-relaxed whitespace-pre-wrap">
                {day.prayerPrompt}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReadingPlansAdmin() {
  const { isAuthenticated, churchId, hasRole, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // -- Tab & list state --
  const [activeTab, setActiveTab] = useState<'plans' | 'days'>('plans');
  const [plansPage, setPlansPage] = useState(1);
  const [plansSearch, setPlansSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // -- Plan dialog state --
  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ReadingPlan | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  const [clonePlanId, setClonePlanId] = useState<string | null>(null);

  // -- Day state --
  const [selectedPlan, setSelectedPlan] = useState<ReadingPlan | null>(null);
  const [daysPage, setDaysPage] = useState(1);
  const [dayFormOpen, setDayFormOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<ReadingPlanDay | null>(null);
  const [deleteDayId, setDeleteDayId] = useState<string | null>(null);
  const [previewDay, setPreviewDay] = useState<ReadingPlanDay | null>(null);

  // -- Plan form --
  const [planForm, setPlanForm] = useState<ReadingPlanCreateInput>({
    name: '',
    description: '',
    duration: 7,
    difficulty: 'beginner',
    category: 'devotional',
    testament: 'Both',
    subscriptionTier: 'disciple',
    coverImageUrl: '',
    status: 'draft',
  });

  // -- Day form --
  const [dayForm, setDayForm] = useState<ReadingPlanDayInput>({
    dayNumber: 1,
    title: '',
    mainScripture: { reference: '', text: '' },
    supportingScriptures: [],
    devotionalContent: '',
    reflectionQuestion: '',
    prayerPrompt: '',
  });

  const isChurchAdmin = hasRole(['admin', 'pastor', 'staff']);

  // ========================================================================
  // QUERIES
  // ========================================================================

  const { data: plansData, isLoading: loadingPlans } = useQuery<ReadingPlansResponse>({
    queryKey: ['reading-plans', churchId, plansPage, plansSearch, categoryFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', plansPage.toString());
      params.set('pageSize', '20');
      if (plansSearch) params.set('search', plansSearch);
      if (categoryFilter) params.set('category', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);
      return api.get<ReadingPlansResponse>(
        `/church-admin/${churchId}/reading-plans?${params.toString()}`,
      );
    },
    enabled: !!churchId && isChurchAdmin,
  });

  const { data: daysData, isLoading: loadingDays } = useQuery<ReadingPlanDaysResponse>({
    queryKey: ['reading-plan-days', selectedPlan?.id, daysPage],
    queryFn: async () => {
      if (!selectedPlan)
        return {
          data: [],
          pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
        };
      const params = new URLSearchParams();
      params.set('page', daysPage.toString());
      params.set('pageSize', '50');
      return api.get<ReadingPlanDaysResponse>(
        `/church-admin/${churchId}/reading-plans/${selectedPlan.id}/days?${params.toString()}`,
      );
    },
    enabled: !!selectedPlan && !!churchId,
  });

  // ========================================================================
  // MUTATIONS
  // ========================================================================

  const createPlanMutation = useMutation({
    mutationFn: async (data: ReadingPlanCreateInput) =>
      api.post<ReadingPlan>(`/church-admin/${churchId}/reading-plans`, data),
    onSuccess: () => {
      toast({ title: 'Plan Created', description: 'The reading plan has been created successfully.', variant: 'success' });
      setPlanFormOpen(false);
      resetPlanForm();
      queryClient.invalidateQueries({ queryKey: ['reading-plans'] });
    },
    onError: (error: Error) =>
      toast({ title: 'Failed to Create Plan', description: error.message, variant: 'destructive' }),
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReadingPlanCreateInput> }) =>
      api.put<ReadingPlan>(`/church-admin/${churchId}/reading-plans/${id}`, data),
    onSuccess: () => {
      toast({ title: 'Plan Updated', description: 'The reading plan has been updated successfully.', variant: 'success' });
      setPlanFormOpen(false);
      setEditingPlan(null);
      resetPlanForm();
      queryClient.invalidateQueries({ queryKey: ['reading-plans'] });
    },
    onError: (error: Error) =>
      toast({ title: 'Failed to Update Plan', description: error.message, variant: 'destructive' }),
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) =>
      api.delete(`/church-admin/${churchId}/reading-plans/${id}`),
    onSuccess: () => {
      toast({ title: 'Plan Deleted', description: 'The reading plan has been deleted.', variant: 'success' });
      setDeletePlanId(null);
      if (selectedPlan?.id === deletePlanId) setSelectedPlan(null);
      queryClient.invalidateQueries({ queryKey: ['reading-plans'] });
    },
    onError: (error: Error) =>
      toast({ title: 'Failed to Delete Plan', description: error.message, variant: 'destructive' }),
  });

  const clonePlanMutation = useMutation({
    mutationFn: async (id: string) =>
      api.post<ReadingPlan>(`/church-admin/${churchId}/reading-plans/${id}/clone`),
    onSuccess: (data) => {
      toast({ title: 'Plan Cloned', description: `Created a copy: "${data.name}"`, variant: 'success' });
      setClonePlanId(null);
      queryClient.invalidateQueries({ queryKey: ['reading-plans'] });
    },
    onError: (error: Error) =>
      toast({ title: 'Failed to Clone Plan', description: error.message, variant: 'destructive' }),
  });

  const createDayMutation = useMutation({
    mutationFn: async (data: ReadingPlanDayInput) => {
      if (!selectedPlan) throw new Error('No plan selected');
      return api.post<ReadingPlanDay>(
        `/church-admin/${churchId}/reading-plans/${selectedPlan.id}/days`,
        data,
      );
    },
    onSuccess: () => {
      toast({ title: 'Day Added', description: 'The day has been added to the plan.', variant: 'success' });
      setDayFormOpen(false);
      resetDayForm();
      queryClient.invalidateQueries({ queryKey: ['reading-plan-days'] });
      queryClient.invalidateQueries({ queryKey: ['reading-plans'] });
    },
    onError: (error: Error) =>
      toast({ title: 'Failed to Add Day', description: error.message, variant: 'destructive' }),
  });

  const updateDayMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReadingPlanDayInput> }) => {
      if (!selectedPlan) throw new Error('No plan selected');
      return api.put<ReadingPlanDay>(
        `/church-admin/${churchId}/reading-plans/${selectedPlan.id}/days/${id}`,
        data,
      );
    },
    onSuccess: () => {
      toast({ title: 'Day Updated', description: 'The day has been updated successfully.', variant: 'success' });
      setDayFormOpen(false);
      setEditingDay(null);
      resetDayForm();
      queryClient.invalidateQueries({ queryKey: ['reading-plan-days'] });
    },
    onError: (error: Error) =>
      toast({ title: 'Failed to Update Day', description: error.message, variant: 'destructive' }),
  });

  const deleteDayMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!selectedPlan) throw new Error('No plan selected');
      return api.delete(
        `/church-admin/${churchId}/reading-plans/${selectedPlan.id}/days/${id}`,
      );
    },
    onSuccess: () => {
      toast({ title: 'Day Deleted', description: 'The day has been removed from the plan.', variant: 'success' });
      setDeleteDayId(null);
      queryClient.invalidateQueries({ queryKey: ['reading-plan-days'] });
      queryClient.invalidateQueries({ queryKey: ['reading-plans'] });
    },
    onError: (error: Error) =>
      toast({ title: 'Failed to Delete Day', description: error.message, variant: 'destructive' }),
  });

  // ========================================================================
  // HELPERS
  // ========================================================================

  const resetPlanForm = useCallback(() => {
    setPlanForm({
      name: '',
      description: '',
      duration: 7,
      difficulty: 'beginner',
      category: 'devotional',
      testament: 'Both',
      subscriptionTier: 'disciple',
      coverImageUrl: '',
      status: 'draft',
    });
  }, []);

  const resetDayForm = useCallback(() => {
    setDayForm({
      dayNumber: (daysData?.data.length || 0) + 1,
      title: '',
      mainScripture: { reference: '', text: '' },
      supportingScriptures: [],
      devotionalContent: '',
      reflectionQuestion: '',
      prayerPrompt: '',
    });
  }, [daysData?.data.length]);

  const openEditPlan = (plan: ReadingPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      duration: plan.duration,
      difficulty: plan.difficulty,
      category: plan.category,
      testament: plan.testament,
      subscriptionTier: plan.subscriptionTier,
      coverImageUrl: plan.coverImageUrl || '',
      status: plan.status,
    });
    setPlanFormOpen(true);
  };

  const openEditDay = (day: ReadingPlanDay) => {
    setEditingDay(day);
    setDayForm({
      dayNumber: day.dayNumber,
      title: day.title,
      mainScripture: day.mainScripture ?? { reference: '', text: '' },
      supportingScriptures: day.supportingScriptures ?? [],
      devotionalContent: day.devotionalContent || '',
      reflectionQuestion: day.reflectionQuestion || '',
      prayerPrompt: day.prayerPrompt || '',
    });
    setDayFormOpen(true);
  };

  const handlePlanSubmit = () => {
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data: planForm });
    } else {
      createPlanMutation.mutate(planForm);
    }
  };

  const handleDaySubmit = () => {
    // Clean up empty supporting scriptures before submit
    const cleaned: ReadingPlanDayInput = {
      ...dayForm,
      supportingScriptures: dayForm.supportingScriptures.filter(
        (s) => s.reference.trim() !== '',
      ),
    };
    if (editingDay) {
      updateDayMutation.mutate({ id: editingDay.id, data: cleaned });
    } else {
      createDayMutation.mutate(cleaned);
    }
  };

  const handleViewDays = (plan: ReadingPlan) => {
    setSelectedPlan(plan);
    setActiveTab('days');
    setDaysPage(1);
  };

  // -- Supporting scriptures helpers --
  const addSupportingScripture = () => {
    setDayForm((prev) => ({
      ...prev,
      supportingScriptures: [...prev.supportingScriptures, { ...EMPTY_SCRIPTURE }],
    }));
  };

  const removeSupportingScripture = (index: number) => {
    setDayForm((prev) => ({
      ...prev,
      supportingScriptures: prev.supportingScriptures.filter((_, i) => i !== index),
    }));
  };

  const updateSupportingScripture = (
    index: number,
    field: keyof ScriptureEntry,
    value: string,
  ) => {
    setDayForm((prev) => ({
      ...prev,
      supportingScriptures: prev.supportingScriptures.map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      ),
    }));
  };

  // ========================================================================
  // DERIVED DATA
  // ========================================================================

  const plans = plansData?.data || [];
  const plansPagination = plansData?.pagination;
  const days = useMemo(
    () => [...(daysData?.data || [])].sort((a, b) => a.dayNumber - b.dayNumber),
    [daysData?.data],
  );
  const daysPagination = daysData?.pagination;

  // ========================================================================
  // AUTH GUARDS
  // ========================================================================

  if (authLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-sanctuary-500" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <BookOpen className="w-12 h-12 mx-auto text-sanctuary-500 mb-4" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in with admin credentials to manage reading plans.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isChurchAdmin) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <BookOpen className="w-12 h-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to manage reading plans.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-sanctuary-500" />
            Reading Plans
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage Bible reading plans for your congregation
          </p>
        </div>
        <Button
          className="bg-sanctuary-600 hover:bg-sanctuary-700 text-white"
          onClick={() => {
            resetPlanForm();
            setEditingPlan(null);
            setPlanFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'plans' | 'days')}>
        <TabsList>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Reading Plans
          </TabsTrigger>
          <TabsTrigger value="days" className="flex items-center gap-2" disabled={!selectedPlan}>
            <ListOrdered className="w-4 h-4" />
            Plan Days
            {selectedPlan && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {selectedPlan.name}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* PLANS TAB */}
        {/* ================================================================ */}
        <TabsContent value="plans" className="space-y-4 mt-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search plans..."
                    className="pl-10"
                    value={plansSearch}
                    onChange={(e) => {
                      setPlansSearch(e.target.value);
                      setPlansPage(1);
                    }}
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={(v) => {
                    setCategoryFilter(v);
                    setPlansPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {Object.entries(CATEGORY_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v);
                    setPlansPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Plans List */}
          <Card>
            <CardContent className="pt-6">
              {loadingPlans ? (
                <div className="space-y-4">
                  <PlanCardSkeleton />
                  <PlanCardSkeleton />
                  <PlanCardSkeleton />
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No reading plans</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first reading plan to help your congregation grow in faith.
                  </p>
                  <Button
                    className="bg-sanctuary-600 hover:bg-sanctuary-700 text-white"
                    onClick={() => {
                      resetPlanForm();
                      setEditingPlan(null);
                      setPlanFormOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Plan
                  </Button>
                </div>
              ) : (
                <>
                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {plans.map((plan) => (
                      <div key={plan.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {plan.isGlobal ? (
                                <Globe className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Church className="w-4 h-4 text-sanctuary-500" />
                              )}
                              <p className="font-medium">{plan.name}</p>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {plan.description}
                            </p>
                          </div>
                          <Badge className={`${STATUS_CONFIG[plan.status].color} border shrink-0`}>
                            {STATUS_CONFIG[plan.status].label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className={CATEGORY_CONFIG[plan.category].color}>
                            {CATEGORY_CONFIG[plan.category].label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={DIFFICULTY_CONFIG[plan.difficulty].color}
                          >
                            {DIFFICULTY_CONFIG[plan.difficulty].label}
                          </Badge>
                          <Badge variant="outline">
                            <Calendar className="w-3 h-3 mr-1" />
                            {plan.duration} days
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {plan.subscriberCount} subscribers
                          </span>
                          <span>{plan.daysCount} days configured</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditPlan(plan)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDays(plan)}
                          >
                            <ListOrdered className="w-3 h-3 mr-1" />
                            Days
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setClonePlanId(plan.id)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Clone Plan
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeletePlanId(plan.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead className="text-center">Subscribers</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plans.map((plan) => (
                          <TableRow key={plan.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {plan.coverImageUrl ? (
                                  <img
                                    src={plan.coverImageUrl}
                                    alt={plan.name}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded bg-grace-200 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-sanctuary-500" />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    {plan.isGlobal ? (
                                      <Globe className="w-4 h-4 text-blue-500" />
                                    ) : (
                                      <Church className="w-4 h-4 text-sanctuary-500" />
                                    )}
                                    <p className="font-medium">{plan.name}</p>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                                    {plan.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${CATEGORY_CONFIG[plan.category].color} border`}>
                                {CATEGORY_CONFIG[plan.category].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${DIFFICULTY_CONFIG[plan.difficulty].color} border`}
                              >
                                {DIFFICULTY_CONFIG[plan.difficulty].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {plan.duration} days
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${TIER_CONFIG[plan.subscriptionTier].color} border`}
                              >
                                {TIER_CONFIG[plan.subscriptionTier].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">
                                <Users className="w-3 h-3 mr-1" />
                                {plan.subscriberCount}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${STATUS_CONFIG[plan.status].color} border`}>
                                {STATUS_CONFIG[plan.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditPlan(plan)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Plan
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewDays(plan)}>
                                    <ListOrdered className="w-4 h-4 mr-2" />
                                    Manage Days
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setClonePlanId(plan.id)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Clone Plan
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => setDeletePlanId(plan.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {plansPagination && plansPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {(plansPage - 1) * 20 + 1} to{' '}
                        {Math.min(plansPage * 20, plansPagination.totalItems)} of{' '}
                        {plansPagination.totalItems} plans
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={plansPage <= 1}
                          onClick={() => setPlansPage(plansPage - 1)}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {plansPage} of {plansPagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={plansPage >= plansPagination.totalPages}
                          onClick={() => setPlansPage(plansPage + 1)}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* DAYS TAB */}
        {/* ================================================================ */}
        <TabsContent value="days" className="space-y-4 mt-4">
          {selectedPlan ? (
            <>
              {/* Days Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPlan(null);
                          setActiveTab('plans');
                        }}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Plans
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                      <div>
                        <h3 className="font-semibold">{selectedPlan.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedPlan.duration} days planned, {days.length} configured
                        </p>
                      </div>
                    </div>
                    <Button
                      className="bg-sanctuary-600 hover:bg-sanctuary-700 text-white"
                      onClick={() => {
                        resetDayForm();
                        setEditingDay(null);
                        setDayFormOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Day
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Days List */}
              <Card>
                <CardContent className="pt-6">
                  {loadingDays ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : days.length === 0 ? (
                    <div className="text-center py-12">
                      <ListOrdered className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No days configured</h3>
                      <p className="text-muted-foreground mb-4">
                        Add days to your reading plan with scripture and devotional content.
                      </p>
                      <Button
                        className="bg-sanctuary-600 hover:bg-sanctuary-700 text-white"
                        onClick={() => {
                          resetDayForm();
                          setEditingDay(null);
                          setDayFormOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Day
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {days.map((day, index) => (
                        <div
                          key={day.id}
                          className="border rounded-lg p-4 hover:bg-grace-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sanctuary-100 text-sanctuary-700 font-bold shrink-0">
                                {day.dayNumber}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium">{day.title}</h4>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                  <BookMarked className="w-4 h-4" />
                                  {day.mainScripture?.reference || 'No scripture reference'}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {day.mainScripture?.text && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-golden-300 text-golden-700 bg-golden-50"
                                    >
                                      <BookOpen className="w-3 h-3 mr-1" />
                                      Scripture
                                    </Badge>
                                  )}
                                  {day.devotionalContent && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-spirit-300 text-spirit-700 bg-spirit-50"
                                    >
                                      <FileText className="w-3 h-3 mr-1" />
                                      Devotional
                                    </Badge>
                                  )}
                                  {day.supportingScriptures &&
                                    day.supportingScriptures.length > 0 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs border-vesper-300 text-vesper-600 bg-vesper-50"
                                      >
                                        <BookMarked className="w-3 h-3 mr-1" />
                                        {day.supportingScriptures.length} supporting
                                      </Badge>
                                    )}
                                  {day.reflectionQuestion && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-golden-300 text-golden-700 bg-golden-50"
                                    >
                                      <MessageSquare className="w-3 h-3 mr-1" />
                                      Reflection
                                    </Badge>
                                  )}
                                  {day.prayerPrompt && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-sanctuary-300 text-sanctuary-600 bg-sanctuary-50"
                                    >
                                      <Heart className="w-3 h-3 mr-1" />
                                      Prayer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-spirit-500 hover:text-spirit-700"
                                onClick={() => setPreviewDay(day)}
                                title="Preview day"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={index === 0}
                                onClick={() =>
                                  toast({
                                    title: 'Coming Soon',
                                    description: 'Reordering will be available soon.',
                                  })
                                }
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={index === days.length - 1}
                                onClick={() =>
                                  toast({
                                    title: 'Coming Soon',
                                    description: 'Reordering will be available soon.',
                                  })
                                }
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDay(day)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => setDeleteDayId(day.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Days Pagination */}
                  {daysPagination && daysPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {(daysPage - 1) * 50 + 1} to{' '}
                        {Math.min(daysPage * 50, daysPagination.totalItems)} of{' '}
                        {daysPagination.totalItems} days
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={daysPage <= 1}
                          onClick={() => setDaysPage(daysPage - 1)}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {daysPage} of {daysPagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={daysPage >= daysPagination.totalPages}
                          onClick={() => setDaysPage(daysPage + 1)}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Plan</h3>
                  <p className="text-muted-foreground">
                    Choose a reading plan from the list to manage its daily content.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab('plans')}
                  >
                    View Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ================================================================== */}
      {/* PLAN CREATE/EDIT DIALOG */}
      {/* ================================================================== */}
      <Dialog
        open={planFormOpen}
        onOpenChange={(open) => {
          setPlanFormOpen(open);
          if (!open) {
            setEditingPlan(null);
            resetPlanForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Reading Plan' : 'Create New Reading Plan'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? 'Update the reading plan details.'
                : 'Fill in the details to create a new reading plan.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                placeholder="e.g., 30 Days of Psalms"
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this reading plan covers..."
                className="min-h-[100px]"
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    max={365}
                    placeholder="7"
                    className="pl-10"
                    value={planForm.duration}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, duration: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={planForm.difficulty}
                  onValueChange={(v) =>
                    setPlanForm({ ...planForm, difficulty: v as Difficulty })
                  }
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIFFICULTY_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={planForm.category}
                  onValueChange={(v) =>
                    setPlanForm({ ...planForm, category: v as PlanCategory })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="testament">Testament</Label>
                <Select
                  value={planForm.testament}
                  onValueChange={(v) =>
                    setPlanForm({ ...planForm, testament: v as Testament })
                  }
                >
                  <SelectTrigger id="testament">
                    <SelectValue placeholder="Select testament" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TESTAMENT_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subscriptionTier">Subscription Tier</Label>
                <Select
                  value={planForm.subscriptionTier}
                  onValueChange={(v) =>
                    setPlanForm({ ...planForm, subscriptionTier: v as SubscriptionTier })
                  }
                >
                  <SelectTrigger id="subscriptionTier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIER_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={planForm.status}
                  onValueChange={(v) => setPlanForm({ ...planForm, status: v as PlanStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft - Save for later</SelectItem>
                    <SelectItem value="active">Active - Publish now</SelectItem>
                    <SelectItem value="archived">Archived - Hide from users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Cover Image URL (optional)</Label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="coverImageUrl"
                  placeholder="https://example.com/image.jpg"
                  className="pl-10"
                  value={planForm.coverImageUrl}
                  onChange={(e) => setPlanForm({ ...planForm, coverImageUrl: e.target.value })}
                />
              </div>
              {planForm.coverImageUrl && (
                <div className="mt-2">
                  <img
                    src={planForm.coverImageUrl}
                    alt="Cover preview"
                    className="w-32 h-20 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPlanFormOpen(false);
                setEditingPlan(null);
                resetPlanForm();
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-sanctuary-600 hover:bg-sanctuary-700 text-white"
              onClick={handlePlanSubmit}
              disabled={
                !planForm.name ||
                createPlanMutation.isPending ||
                updatePlanMutation.isPending
              }
            >
              {(createPlanMutation.isPending || updatePlanMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingPlan
                ? 'Save Changes'
                : planForm.status === 'active'
                  ? 'Publish Plan'
                  : 'Save as Draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================== */}
      {/* DAY CREATE/EDIT DIALOG - STRUCTURED TEMPLATE */}
      {/* ================================================================== */}
      <Dialog
        open={dayFormOpen}
        onOpenChange={(open) => {
          setDayFormOpen(open);
          if (!open) {
            setEditingDay(null);
            resetDayForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-sanctuary-500" />
              {editingDay ? 'Edit Day' : 'Add New Day'}
            </DialogTitle>
            <DialogDescription>
              {editingDay
                ? 'Update the day content using the structured template below.'
                : 'Fill in the structured template to create a new day for this reading plan.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Section 1: Day Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-sanctuary-100 text-sanctuary-700 text-xs font-bold">
                  1
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-sanctuary-600">
                  Day Info
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-9">
                <div className="space-y-2">
                  <Label htmlFor="dayNumber">Day Number *</Label>
                  <Input
                    id="dayNumber"
                    type="number"
                    min={1}
                    placeholder="1"
                    value={dayForm.dayNumber}
                    onChange={(e) =>
                      setDayForm({ ...dayForm, dayNumber: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="dayTitle">Title *</Label>
                  <Input
                    id="dayTitle"
                    placeholder="e.g., Day 1: The Beginning"
                    value={dayForm.title}
                    onChange={(e) => setDayForm({ ...dayForm, title: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-grace-300" />

            {/* Section 2: Main Scripture */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-golden-100 text-golden-700 text-xs font-bold">
                  2
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-golden-700">
                  Main Scripture
                </h3>
              </div>
              <div className="space-y-4 pl-9">
                <div className="space-y-2">
                  <Label htmlFor="mainScriptureRef">Scripture Reference *</Label>
                  <div className="relative">
                    <BookMarked className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="mainScriptureRef"
                      placeholder="e.g., Psalm 23:1-6"
                      className="pl-10"
                      value={dayForm.mainScripture.reference}
                      onChange={(e) =>
                        setDayForm({
                          ...dayForm,
                          mainScripture: {
                            ...dayForm.mainScripture,
                            reference: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mainScriptureText">Scripture Text</Label>
                  <Textarea
                    id="mainScriptureText"
                    placeholder="Paste the full scripture passage here..."
                    className="min-h-[100px] border-golden-200 focus-visible:ring-golden-400"
                    value={dayForm.mainScripture.text}
                    onChange={(e) =>
                      setDayForm({
                        ...dayForm,
                        mainScripture: {
                          ...dayForm.mainScripture,
                          text: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-grace-300" />

            {/* Section 3: Devotional Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-spirit-100 text-spirit-700 text-xs font-bold">
                  3
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-spirit-600">
                  Devotional Content
                </h3>
              </div>
              <div className="pl-9">
                <Textarea
                  id="devotionalContent"
                  placeholder="Write devotional thoughts, commentary, or teaching for this day. Use line breaks for paragraphs..."
                  className="min-h-[160px] border-spirit-200 focus-visible:ring-spirit-400"
                  value={dayForm.devotionalContent}
                  onChange={(e) =>
                    setDayForm({ ...dayForm, devotionalContent: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tip: Use blank lines between paragraphs for clear formatting in the preview.
                </p>
              </div>
            </div>

            <Separator className="bg-grace-300" />

            {/* Section 4: Supporting Scriptures */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-vesper-100 text-vesper-600 text-xs font-bold">
                    4
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-vesper-500">
                    Supporting Scriptures
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {dayForm.supportingScriptures.length}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-vesper-300 text-vesper-600 hover:bg-vesper-50"
                  onClick={addSupportingScripture}
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Add Scripture
                </Button>
              </div>
              <div className="space-y-3 pl-9">
                {dayForm.supportingScriptures.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">
                    No supporting scriptures added yet. Click &quot;Add Scripture&quot; to include
                    additional references.
                  </p>
                ) : (
                  dayForm.supportingScriptures.map((scripture, index) => (
                    <div
                      key={index}
                      className="border border-vesper-200 rounded-lg p-4 bg-grace-50 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-vesper-500">
                          Supporting Scripture #{index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeSupportingScripture(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`supportRef-${index}`}>Reference</Label>
                        <Input
                          id={`supportRef-${index}`}
                          placeholder="e.g., Romans 8:28"
                          value={scripture.reference}
                          onChange={(e) =>
                            updateSupportingScripture(index, 'reference', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`supportText-${index}`}>Text</Label>
                        <Textarea
                          id={`supportText-${index}`}
                          placeholder="Paste the scripture text (optional)..."
                          className="min-h-[60px]"
                          value={scripture.text}
                          onChange={(e) =>
                            updateSupportingScripture(index, 'text', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Separator className="bg-grace-300" />

            {/* Section 5: Reflection Question */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-golden-100 text-golden-700 text-xs font-bold">
                  5
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-golden-700">
                  Reflection Question
                </h3>
              </div>
              <div className="pl-9">
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="reflectionQuestion"
                    placeholder="e.g., How does this passage speak to your current situation? What is God revealing to you today?"
                    className="pl-10 min-h-[80px] border-golden-200 focus-visible:ring-golden-400"
                    value={dayForm.reflectionQuestion}
                    onChange={(e) =>
                      setDayForm({ ...dayForm, reflectionQuestion: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-grace-300" />

            {/* Section 6: Prayer Prompt */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-sanctuary-100 text-sanctuary-600 text-xs font-bold">
                  6
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-sanctuary-600">
                  Prayer Prompt
                </h3>
              </div>
              <div className="pl-9">
                <div className="relative">
                  <Heart className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="prayerPrompt"
                    placeholder="e.g., Lord, help me to trust in Your provision today. Open my eyes to see Your hand at work..."
                    className="pl-10 min-h-[80px] border-sanctuary-200 focus-visible:ring-sanctuary-400"
                    value={dayForm.prayerPrompt}
                    onChange={(e) => setDayForm({ ...dayForm, prayerPrompt: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDayFormOpen(false);
                setEditingDay(null);
                resetDayForm();
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-sanctuary-600 hover:bg-sanctuary-700 text-white"
              onClick={handleDaySubmit}
              disabled={
                !dayForm.title ||
                !dayForm.mainScripture.reference ||
                createDayMutation.isPending ||
                updateDayMutation.isPending
              }
            >
              {(createDayMutation.isPending || updateDayMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingDay ? 'Save Changes' : 'Add Day'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================== */}
      {/* DAY PREVIEW DIALOG */}
      {/* ================================================================== */}
      <DayPreviewDialog
        day={previewDay}
        open={!!previewDay}
        onOpenChange={(open) => {
          if (!open) setPreviewDay(null);
        }}
      />

      {/* ================================================================== */}
      {/* CONFIRM DIALOGS */}
      {/* ================================================================== */}

      {/* Delete Plan */}
      <AlertDialog open={!!deletePlanId} onOpenChange={() => setDeletePlanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Reading Plan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reading plan? This action cannot be undone.
              All days and subscriber data will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePlanId && deletePlanMutation.mutate(deletePlanId)}
              className="bg-red-500 hover:bg-red-600"
              disabled={deletePlanMutation.isPending}
            >
              {deletePlanMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clone Plan */}
      <AlertDialog open={!!clonePlanId} onOpenChange={() => setClonePlanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-sanctuary-500" />
              Clone Reading Plan
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will create a copy of the reading plan including all its days. The cloned
              plan will be saved as a draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clonePlanId && clonePlanMutation.mutate(clonePlanId)}
              disabled={clonePlanMutation.isPending}
            >
              {clonePlanMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Clone Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Day */}
      <AlertDialog open={!!deleteDayId} onOpenChange={() => setDeleteDayId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Day
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this day from the reading plan? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDayId && deleteDayMutation.mutate(deleteDayId)}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteDayMutation.isPending}
            >
              {deleteDayMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete Day
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
