import { useState, useMemo, useCallback } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Book,
  Plus,
  Search,
  Award,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  BookOpen,
  AlertCircle,
  Link as LinkIcon,
  Video,
  FileText,
  Globe,
  ClipboardCheck,
  GraduationCap,
  Trophy,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

// ===================================================================
// TYPES
// ===================================================================

interface DiscipleshipClass {
  id: string;
  title: string;
  mainScripture: { reference: string; text: string };
  teachingContent: string;
  supportingScriptures: { reference: string; text: string }[];
  resources: { title: string; url: string; type: 'video' | 'article' | 'document' | 'other' }[];
  order: number;
  status: 'draft' | 'published';
  quizId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Quiz {
  id: string;
  classId: string;
  className: string;
  passMark: number;
  timeLimit?: number;
  availableFrom?: string;
  availableUntil?: string;
  questions: QuizQuestion[];
  status: 'draft' | 'published';
  createdAt: string;
}

interface QuizQuestion {
  id: string;
  questionText: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  points: number;
}

interface MemberProgress {
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  classesCompleted: number;
  totalClasses: number;
  overallProgress: number;
  quizResults: {
    classId: string;
    className: string;
    score: number;
    passMark: number;
    passed: boolean;
    completedAt: string;
  }[];
  status: 'in_progress' | 'completed' | 'failed';
  enrolledAt: string;
  completedAt?: string;
}

interface Certificate {
  id: string;
  memberId: string;
  memberName: string;
  courseName: string;
  completionDate: string;
  status: 'pending' | 'issued';
  issuedAt?: string;
  certificateUrl?: string;
}

// ===================================================================
// API FUNCTIONS
// ===================================================================

function classesApi(churchId: string | number) {
  const base = `/church/${churchId}/discipleship/classes`;
  return {
    list: () => api.get<DiscipleshipClass[]>(base),
    create: (data: Omit<DiscipleshipClass, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<DiscipleshipClass>(base, data),
    update: (id: string, data: Partial<DiscipleshipClass>) =>
      api.patch<DiscipleshipClass>(`${base}/${id}`, data),
    remove: (id: string) => api.delete(`${base}/${id}`),
  };
}

function quizzesApi(churchId: string | number) {
  const base = `/church/${churchId}/discipleship/quizzes`;
  return {
    list: () => api.get<Quiz[]>(base),
    create: (data: Omit<Quiz, 'id' | 'createdAt'>) => api.post<Quiz>(base, data),
    update: (id: string, data: Partial<Quiz>) => api.patch<Quiz>(`${base}/${id}`, data),
    remove: (id: string) => api.delete(`${base}/${id}`),
  };
}

function progressApi(churchId: string | number) {
  const base = `/church/${churchId}/discipleship/member-progress`;
  return {
    list: (filters?: { classId?: string; status?: string }) =>
      api.get<MemberProgress[]>(base, filters as Record<string, string>),
  };
}

function certificatesApi(churchId: string | number) {
  const base = `/church/${churchId}/discipleship/certificates`;
  return {
    list: () => api.get<Certificate[]>(base),
    issue: (memberId: string) => api.post<Certificate>(`${base}/issue`, { memberId }),
    download: (id: string) => api.get<{ url: string }>(`${base}/${id}/download`),
  };
}

// ===================================================================
// QUERY KEYS
// ===================================================================

const dKeys = {
  classes: (cid: string | number | null) => ['discipleship', cid, 'classes'] as const,
  quizzes: (cid: string | number | null) => ['discipleship', cid, 'quizzes'] as const,
  progress: (cid: string | number | null) => ['discipleship', cid, 'member-progress'] as const,
  certificates: (cid: string | number | null) => ['discipleship', cid, 'certificates'] as const,
};

// ===================================================================
// HELPERS
// ===================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

function emptyQuestion(): QuizQuestion {
  return {
    id: generateId(),
    questionText: '',
    options: OPTION_LABELS.map((l) => ({ label: l, text: '' })),
    correctAnswer: 'A',
    points: 1,
  };
}

function emptyClassForm(): Omit<DiscipleshipClass, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: '',
    mainScripture: { reference: '', text: '' },
    teachingContent: '',
    supportingScriptures: [],
    resources: [],
    order: 1,
    status: 'draft',
  };
}

const resourceTypeIcon: Record<string, React.ReactNode> = {
  video: <Video className="h-4 w-4" />,
  article: <Globe className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  other: <LinkIcon className="h-4 w-4" />,
};

// ===================================================================
// SKELETON LOADERS
// ===================================================================

function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function StatCardSkeleton() {
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

// ===================================================================
// COLLAPSIBLE SECTION
// ===================================================================

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg">
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-left hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ===================================================================
// TAB 1: CLASSES
// ===================================================================

function ClassesTab() {
  const { churchId } = useAuth();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<DiscipleshipClass | null>(null);
  const [form, setForm] = useState(emptyClassForm());
  const [searchQuery, setSearchQuery] = useState('');

  const { data: classes = [], isLoading } = useQuery<DiscipleshipClass[]>({
    queryKey: dKeys.classes(churchId),
    queryFn: () => classesApi(churchId!).list(),
    enabled: !!churchId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<DiscipleshipClass, 'id' | 'createdAt' | 'updatedAt'>) =>
      classesApi(churchId!).create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dKeys.classes(churchId) });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<DiscipleshipClass> & { id: string }) =>
      classesApi(churchId!).update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dKeys.classes(churchId) });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => classesApi(churchId!).remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: dKeys.classes(churchId) }),
  });

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingClass(null);
    setForm(emptyClassForm());
  }, []);

  const openCreate = useCallback(() => {
    setEditingClass(null);
    setForm({ ...emptyClassForm(), order: classes.length + 1 });
    setDialogOpen(true);
  }, [classes.length]);

  const openEdit = useCallback((cls: DiscipleshipClass) => {
    setEditingClass(cls);
    setForm({
      title: cls.title,
      mainScripture: { ...cls.mainScripture },
      teachingContent: cls.teachingContent,
      supportingScriptures: cls.supportingScriptures.map((s) => ({ ...s })),
      resources: cls.resources.map((r) => ({ ...r })),
      order: cls.order,
      status: cls.status,
    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.title.trim()) return;
    if (editingClass) {
      updateMutation.mutate({ id: editingClass.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  }, [form, editingClass, updateMutation, createMutation]);

  const addSupportingScripture = useCallback(() => {
    setForm((f) => ({
      ...f,
      supportingScriptures: [...f.supportingScriptures, { reference: '', text: '' }],
    }));
  }, []);

  const removeSupportingScripture = useCallback((idx: number) => {
    setForm((f) => ({
      ...f,
      supportingScriptures: f.supportingScriptures.filter((_, i) => i !== idx),
    }));
  }, []);

  const updateSupportingScripture = useCallback(
    (idx: number, field: 'reference' | 'text', value: string) => {
      setForm((f) => ({
        ...f,
        supportingScriptures: f.supportingScriptures.map((s, i) =>
          i === idx ? { ...s, [field]: value } : s
        ),
      }));
    },
    []
  );

  const addResource = useCallback(() => {
    setForm((f) => ({
      ...f,
      resources: [...f.resources, { title: '', url: '', type: 'article' as const }],
    }));
  }, []);

  const removeResource = useCallback((idx: number) => {
    setForm((f) => ({
      ...f,
      resources: f.resources.filter((_, i) => i !== idx),
    }));
  }, []);

  const updateResource = useCallback(
    (idx: number, field: string, value: string) => {
      setForm((f) => ({
        ...f,
        resources: f.resources.map((r, i) =>
          i === idx ? { ...r, [field]: value } : r
        ),
      }));
    },
    []
  );

  const sortedClasses = useMemo(() => {
    let filtered = [...classes].sort((a, b) => a.order - b.order);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.mainScripture.reference.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [classes, searchQuery]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate} className="bg-sanctuary-700 hover:bg-sanctuary-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Class
        </Button>
      </div>

      {/* Classes List */}
      {sortedClasses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No classes yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first discipleship class to get started.
            </p>
            <Button onClick={openCreate} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedClasses.map((cls) => (
            <Card key={cls.id} className="group hover:shadow-warm transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-sanctuary-100 text-sanctuary-700 text-xs font-bold">
                      {cls.order}
                    </span>
                    <Badge
                      variant={cls.status === 'published' ? 'default' : 'secondary'}
                      className={
                        cls.status === 'published'
                          ? 'bg-spirit-100 text-spirit-700 border-spirit-200'
                          : ''
                      }
                    >
                      {cls.status}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(cls)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(cls.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-base mt-2">{cls.title}</CardTitle>
                {cls.mainScripture.reference && (
                  <CardDescription className="flex items-center gap-1">
                    <Book className="h-3 w-3" />
                    {cls.mainScripture.reference}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {cls.teachingContent && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {cls.teachingContent}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {cls.supportingScriptures.length > 0 && (
                    <span>{cls.supportingScriptures.length} supporting scriptures</span>
                  )}
                  {cls.resources.length > 0 && (
                    <span>{cls.resources.length} resources</span>
                  )}
                </div>
                {cls.quizId && (
                  <Badge variant="outline" className="text-xs border-golden-300 text-golden-700">
                    <ClipboardCheck className="h-3 w-3 mr-1" />
                    Quiz attached
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClass ? 'Edit Class' : 'Create New Class'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            {/* Title & Order */}
            <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
              <div className="space-y-2">
                <Label htmlFor="cls-title">
                  Class Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cls-title"
                  placeholder="e.g. Foundations of Faith"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cls-order">Order</Label>
                <Input
                  id="cls-order"
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, order: parseInt(e.target.value) || 1 }))
                  }
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as 'draft' | 'published' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Main Scripture */}
            <CollapsibleSection title="Main Scripture" defaultOpen>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Reference</Label>
                  <Input
                    placeholder="e.g. John 3:16"
                    value={form.mainScripture.reference}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        mainScripture: { ...f.mainScripture, reference: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Text</Label>
                  <Input
                    placeholder="Scripture text..."
                    value={form.mainScripture.text}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        mainScripture: { ...f.mainScripture, text: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Teaching Content */}
            <div className="space-y-2">
              <Label>Teaching Content</Label>
              <Textarea
                rows={6}
                placeholder="Enter the teaching content for this class..."
                value={form.teachingContent}
                onChange={(e) => setForm((f) => ({ ...f, teachingContent: e.target.value }))}
              />
            </div>

            {/* Supporting Scriptures */}
            <CollapsibleSection title={`Supporting Scriptures (${form.supportingScriptures.length})`}>
              <div className="space-y-3">
                {form.supportingScriptures.map((s, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="grid gap-2 sm:grid-cols-2 flex-1">
                      <Input
                        placeholder="Reference"
                        value={s.reference}
                        onChange={(e) =>
                          updateSupportingScripture(idx, 'reference', e.target.value)
                        }
                      />
                      <Input
                        placeholder="Text"
                        value={s.text}
                        onChange={(e) =>
                          updateSupportingScripture(idx, 'text', e.target.value)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSupportingScripture(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addSupportingScripture}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Scripture
                </Button>
              </div>
            </CollapsibleSection>

            {/* Study Resources */}
            <CollapsibleSection title={`Study Resources (${form.resources.length})`}>
              <div className="space-y-3">
                {form.resources.map((r, idx) => (
                  <div key={idx} className="border border-border rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        {resourceTypeIcon[r.type]}
                        Resource {idx + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeResource(idx)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                      <Input
                        placeholder="Title"
                        value={r.title}
                        onChange={(e) => updateResource(idx, 'title', e.target.value)}
                      />
                      <Input
                        placeholder="URL"
                        value={r.url}
                        onChange={(e) => updateResource(idx, 'url', e.target.value)}
                      />
                      <Select
                        value={r.type}
                        onValueChange={(v) => updateResource(idx, 'type', v)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addResource}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Resource
                </Button>
              </div>
            </CollapsibleSection>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!form.title.trim() || isSaving}
                className="bg-sanctuary-700 hover:bg-sanctuary-800 text-white"
              >
                {isSaving ? 'Saving...' : editingClass ? 'Update Class' : 'Create Class'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===================================================================
// TAB 2: QUIZZES
// ===================================================================

function QuizzesTab() {
  const { churchId } = useAuth();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Quiz form state
  const [quizClassId, setQuizClassId] = useState('');
  const [quizPassMark, setQuizPassMark] = useState(70);
  const [quizTimeLimit, setQuizTimeLimit] = useState('');
  const [quizAvailableFrom, setQuizAvailableFrom] = useState('');
  const [quizAvailableUntil, setQuizAvailableUntil] = useState('');
  const [quizStatus, setQuizStatus] = useState<'draft' | 'published'>('draft');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);

  const { data: classes = [] } = useQuery<DiscipleshipClass[]>({
    queryKey: dKeys.classes(churchId),
    queryFn: () => classesApi(churchId!).list(),
    enabled: !!churchId,
  });

  const { data: quizzes = [], isLoading } = useQuery<Quiz[]>({
    queryKey: dKeys.quizzes(churchId),
    queryFn: () => quizzesApi(churchId!).list(),
    enabled: !!churchId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Quiz, 'id' | 'createdAt'>) => quizzesApi(churchId!).create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dKeys.quizzes(churchId) });
      qc.invalidateQueries({ queryKey: dKeys.classes(churchId) });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Quiz> & { id: string }) =>
      quizzesApi(churchId!).update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dKeys.quizzes(churchId) });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quizzesApi(churchId!).remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dKeys.quizzes(churchId) });
      qc.invalidateQueries({ queryKey: dKeys.classes(churchId) });
    },
  });

  const resetForm = useCallback(() => {
    setQuizClassId('');
    setQuizPassMark(70);
    setQuizTimeLimit('');
    setQuizAvailableFrom('');
    setQuizAvailableUntil('');
    setQuizStatus('draft');
    setQuizQuestions([emptyQuestion()]);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingQuiz(null);
    resetForm();
  }, [resetForm]);

  const openCreate = useCallback(() => {
    setEditingQuiz(null);
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizClassId(quiz.classId);
    setQuizPassMark(quiz.passMark);
    setQuizTimeLimit(quiz.timeLimit ? String(quiz.timeLimit) : '');
    setQuizAvailableFrom(quiz.availableFrom || '');
    setQuizAvailableUntil(quiz.availableUntil || '');
    setQuizStatus(quiz.status);
    setQuizQuestions(quiz.questions.length > 0 ? quiz.questions.map((q) => ({ ...q, options: q.options.map((o) => ({ ...o })) })) : [emptyQuestion()]);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!quizClassId) return;
    const validQuestions = quizQuestions.filter((q) => q.questionText.trim());
    if (validQuestions.length === 0) return;

    const selectedClass = classes.find((c) => c.id === quizClassId);
    const payload = {
      classId: quizClassId,
      className: selectedClass?.title || '',
      passMark: quizPassMark,
      timeLimit: quizTimeLimit ? parseInt(quizTimeLimit) : undefined,
      availableFrom: quizAvailableFrom || undefined,
      availableUntil: quizAvailableUntil || undefined,
      questions: validQuestions,
      status: quizStatus,
    };

    if (editingQuiz) {
      updateMutation.mutate({ id: editingQuiz.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }, [
    quizClassId,
    quizPassMark,
    quizTimeLimit,
    quizAvailableFrom,
    quizAvailableUntil,
    quizQuestions,
    quizStatus,
    classes,
    editingQuiz,
    updateMutation,
    createMutation,
  ]);

  const updateQuestion = useCallback(
    (qIdx: number, field: keyof QuizQuestion, value: unknown) => {
      setQuizQuestions((qs) =>
        qs.map((q, i) => (i === qIdx ? { ...q, [field]: value } : q))
      );
    },
    []
  );

  const updateOption = useCallback(
    (qIdx: number, oIdx: number, text: string) => {
      setQuizQuestions((qs) =>
        qs.map((q, i) =>
          i === qIdx
            ? { ...q, options: q.options.map((o, oi) => (oi === oIdx ? { ...o, text } : o)) }
            : q
        )
      );
    },
    []
  );

  const addQuestion = useCallback(() => {
    setQuizQuestions((qs) => [...qs, emptyQuestion()]);
  }, []);

  const removeQuestion = useCallback((idx: number) => {
    setQuizQuestions((qs) => (qs.length > 1 ? qs.filter((_, i) => i !== idx) : qs));
  }, []);

  const moveQuestion = useCallback((idx: number, direction: 'up' | 'down') => {
    setQuizQuestions((qs) => {
      const newQs = [...qs];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= newQs.length) return qs;
      [newQs[idx], newQs[swapIdx]] = [newQs[swapIdx], newQs[idx]];
      return newQs;
    });
  }, []);

  const filteredQuizzes = useMemo(() => {
    if (!searchQuery.trim()) return quizzes;
    const q = searchQuery.toLowerCase();
    return quizzes.filter((quiz) => quiz.className.toLowerCase().includes(q));
  }, [quizzes, searchQuery]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return <TableSkeleton rows={4} cols={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes by class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate} className="bg-golden-500 hover:bg-golden-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Quiz
        </Button>
      </div>

      {/* Quiz Table */}
      {filteredQuizzes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No quizzes yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a quiz to assess members on class material.
            </p>
            <Button onClick={openCreate} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead className="text-center">Questions</TableHead>
                <TableHead className="text-center">Pass Mark</TableHead>
                <TableHead className="text-center">Time Limit</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.className}</TableCell>
                  <TableCell className="text-center">{quiz.questions.length}</TableCell>
                  <TableCell className="text-center">{quiz.passMark}%</TableCell>
                  <TableCell className="text-center">
                    {quiz.timeLimit ? `${quiz.timeLimit} min` : '--'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={quiz.status === 'published' ? 'default' : 'secondary'}
                      className={
                        quiz.status === 'published'
                          ? 'bg-spirit-100 text-spirit-700 border-spirit-200'
                          : ''
                      }
                    >
                      {quiz.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(quiz)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(quiz.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create / Edit Quiz Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            {/* Quiz Settings */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Linked Class <span className="text-destructive">*</span>
                </Label>
                <Select value={quizClassId} onValueChange={setQuizClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.order}. {cls.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pass Mark (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={quizPassMark}
                  onChange={(e) => setQuizPassMark(parseInt(e.target.value) || 70)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Time Limit (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="No limit"
                  value={quizTimeLimit}
                  onChange={(e) => setQuizTimeLimit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Available From</Label>
                <Input
                  type="date"
                  value={quizAvailableFrom}
                  onChange={(e) => setQuizAvailableFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Available Until</Label>
                <Input
                  type="date"
                  value={quizAvailableUntil}
                  onChange={(e) => setQuizAvailableUntil(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={quizStatus}
                onValueChange={(v) => setQuizStatus(v as 'draft' | 'published')}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">
                  Questions ({quizQuestions.length})
                </h4>
                <Button variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Question
                </Button>
              </div>

              {quizQuestions.map((q, qIdx) => (
                <Card key={q.id} className="border-border/60">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Question {qIdx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          disabled={qIdx === 0}
                          onClick={() => moveQuestion(qIdx, 'up')}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          disabled={qIdx === quizQuestions.length - 1}
                          onClick={() => moveQuestion(qIdx, 'down')}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeQuestion(qIdx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      placeholder="Enter your question..."
                      rows={2}
                      value={q.questionText}
                      onChange={(e) =>
                        updateQuestion(qIdx, 'questionText', e.target.value)
                      }
                    />

                    <div className="grid gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={opt.label} className="flex items-center gap-2">
                          <button
                            type="button"
                            className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-colors ${
                              q.correctAnswer === opt.label
                                ? 'bg-spirit-400 text-white'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                            onClick={() =>
                              updateQuestion(qIdx, 'correctAnswer', opt.label)
                            }
                            title={`Mark ${opt.label} as correct answer`}
                          >
                            {opt.label}
                          </button>
                          <Input
                            placeholder={`Option ${opt.label}`}
                            value={opt.text}
                            onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Points:</Label>
                      <Input
                        type="number"
                        min={1}
                        className="w-20 h-8"
                        value={q.points}
                        onChange={(e) =>
                          updateQuestion(qIdx, 'points', parseInt(e.target.value) || 1)
                        }
                      />
                      <span className="text-xs text-muted-foreground ml-2">
                        Correct answer:{' '}
                        <span className="font-semibold text-spirit-600">{q.correctAnswer}</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  !quizClassId ||
                  quizQuestions.filter((q) => q.questionText.trim()).length === 0 ||
                  isSaving
                }
                className="bg-golden-500 hover:bg-golden-600 text-white"
              >
                {isSaving ? 'Saving...' : editingQuiz ? 'Update Quiz' : 'Create Quiz'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===================================================================
// TAB 3: PROGRESS & RESULTS
// ===================================================================

function ProgressTab() {
  const { churchId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [viewingMember, setViewingMember] = useState<MemberProgress | null>(null);

  const { data: classes = [] } = useQuery<DiscipleshipClass[]>({
    queryKey: dKeys.classes(churchId),
    queryFn: () => classesApi(churchId!).list(),
    enabled: !!churchId,
  });

  const { data: members = [], isLoading } = useQuery<MemberProgress[]>({
    queryKey: [...dKeys.progress(churchId), statusFilter, classFilter],
    queryFn: () => {
      const filters: Record<string, string> = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (classFilter !== 'all') filters.classId = classFilter;
      return progressApi(churchId!).list(filters);
    },
    enabled: !!churchId,
  });

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter((m) => m.memberName.toLowerCase().includes(q));
  }, [members, searchQuery]);

  const statusBadge = (status: MemberProgress['status']) => {
    const config: Record<
      MemberProgress['status'],
      { label: string; className: string }
    > = {
      in_progress: {
        label: 'In Progress',
        className: 'bg-golden-100 text-golden-700 border-golden-200',
      },
      completed: {
        label: 'Completed',
        className: 'bg-spirit-100 text-spirit-700 border-spirit-200',
      },
      failed: {
        label: 'Failed',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
      },
    };
    const c = config[status];
    return (
      <Badge variant="outline" className={c.className}>
        {c.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Members Table */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No progress data</p>
            <p className="text-sm text-muted-foreground mt-1">
              Member progress will appear here once they begin classes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead className="text-center">Classes</TableHead>
                <TableHead className="text-center">Progress</TableHead>
                <TableHead className="text-center">Avg Quiz Score</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((member) => {
                const avgScore =
                  member.quizResults.length > 0
                    ? Math.round(
                        member.quizResults.reduce((acc, r) => acc + r.score, 0) /
                          member.quizResults.length
                      )
                    : null;

                return (
                  <TableRow key={member.memberId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-sanctuary-100 text-sanctuary-700 text-xs">
                            {member.memberName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.memberName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {member.classesCompleted}/{member.totalClasses}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-center">
                        <Progress value={member.overallProgress} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {member.overallProgress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {avgScore !== null ? (
                        <span
                          className={
                            avgScore >= 70
                              ? 'text-spirit-600 font-medium'
                              : 'text-destructive font-medium'
                          }
                        >
                          {avgScore}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{statusBadge(member.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingMember(member)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Member Detail Dialog */}
      <Dialog
        open={viewingMember !== null}
        onOpenChange={(o) => !o && setViewingMember(null)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {viewingMember && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-sanctuary-100 text-sanctuary-700">
                      {viewingMember.memberName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{viewingMember.memberName}</p>
                    <p className="text-sm font-normal text-muted-foreground">
                      Enrolled {new Date(viewingMember.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Overall Progress */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  {statusBadge(viewingMember.status)}
                </div>
                <Progress value={viewingMember.overallProgress} className="h-3" />
                <p className="text-xs text-muted-foreground text-center">
                  {viewingMember.classesCompleted} of {viewingMember.totalClasses} classes
                  completed ({viewingMember.overallProgress}%)
                </p>

                <Separator />

                {/* Quiz Results */}
                <h4 className="text-sm font-semibold">Quiz Results</h4>
                {viewingMember.quizResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No quiz results yet.</p>
                ) : (
                  <div className="space-y-2">
                    {viewingMember.quizResults.map((result) => (
                      <div
                        key={result.classId}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="text-sm font-medium">{result.className}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(result.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              result.passed ? 'text-spirit-600' : 'text-destructive'
                            }`}
                          >
                            {result.score}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / {result.passMark}%
                          </span>
                          {result.passed ? (
                            <CheckCircle className="h-4 w-4 text-spirit-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===================================================================
// TAB 4: CERTIFICATES
// ===================================================================

function CertificatesTab() {
  const { churchId } = useAuth();
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: certificates = [], isLoading } = useQuery<Certificate[]>({
    queryKey: dKeys.certificates(churchId),
    queryFn: () => certificatesApi(churchId!).list(),
    enabled: !!churchId,
  });

  const issueMutation = useMutation({
    mutationFn: (memberId: string) => certificatesApi(churchId!).issue(memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: dKeys.certificates(churchId) }),
  });

  const filtered = useMemo(() => {
    let list = certificates;
    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.memberName.toLowerCase().includes(q));
    }
    return list;
  }, [certificates, statusFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Certificates Table */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No certificates</p>
            <p className="text-sm text-muted-foreground mt-1">
              Certificates appear here when members complete all classes and pass all quizzes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-center">Completion Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-golden-100 text-golden-700 text-xs">
                          {cert.memberName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{cert.memberName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{cert.courseName}</TableCell>
                  <TableCell className="text-center">
                    {new Date(cert.completionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        cert.status === 'issued'
                          ? 'bg-spirit-100 text-spirit-700 border-spirit-200'
                          : 'bg-golden-100 text-golden-700 border-golden-200'
                      }
                    >
                      {cert.status === 'issued' ? 'Issued' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {cert.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => issueMutation.mutate(cert.memberId)}
                          disabled={issueMutation.isPending}
                          className="text-spirit-700 border-spirit-300 hover:bg-spirit-50"
                        >
                          <Award className="h-4 w-4 mr-1" />
                          Issue
                        </Button>
                      )}
                      {cert.status === 'issued' && cert.certificateUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </a>
                        </Button>
                      )}
                      {cert.status === 'issued' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const res = await certificatesApi(churchId!).download(cert.id);
                            if (res?.url) window.open(res.url, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// ===================================================================
// MAIN PAGE COMPONENT
// ===================================================================

export default function Discipleship() {
  const { churchId } = useAuth();
  const [activeTab, setActiveTab] = useState('classes');

  // Stats queries
  const { data: classes = [] } = useQuery<DiscipleshipClass[]>({
    queryKey: dKeys.classes(churchId),
    queryFn: () => classesApi(churchId!).list(),
    enabled: !!churchId,
  });

  const { data: quizzes = [] } = useQuery<Quiz[]>({
    queryKey: dKeys.quizzes(churchId),
    queryFn: () => quizzesApi(churchId!).list(),
    enabled: !!churchId,
  });

  const { data: members = [] } = useQuery<MemberProgress[]>({
    queryKey: dKeys.progress(churchId),
    queryFn: () => progressApi(churchId!).list(),
    enabled: !!churchId,
  });

  const { data: certificates = [] } = useQuery<Certificate[]>({
    queryKey: dKeys.certificates(churchId),
    queryFn: () => certificatesApi(churchId!).list(),
    enabled: !!churchId,
  });

  const statsLoading = !classes && !quizzes && !members && !certificates;

  const publishedClasses = classes.filter((c) => c.status === 'published').length;
  const activeMembers = members.filter((m) => m.status === 'in_progress').length;
  const completedMembers = members.filter((m) => m.status === 'completed').length;
  const issuedCerts = certificates.filter((c) => c.status === 'issued').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-sanctuary-800">
          Discipleship
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage discipleship classes, quizzes, track progress, and issue certificates.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Published Classes</CardDescription>
                <BookOpen className="h-4 w-4 text-sanctuary-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-sanctuary-800">{publishedClasses}</div>
                <p className="text-xs text-muted-foreground">{classes.length} total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Active Members</CardDescription>
                <GraduationCap className="h-4 w-4 text-golden-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-golden-700">{activeMembers}</div>
                <p className="text-xs text-muted-foreground">{members.length} enrolled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Completed</CardDescription>
                <CheckCircle className="h-4 w-4 text-spirit-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-spirit-700">{completedMembers}</div>
                <p className="text-xs text-muted-foreground">all classes passed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Certificates Issued</CardDescription>
                <Award className="h-4 w-4 text-vesper-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-vesper-600">{issuedCerts}</div>
                <p className="text-xs text-muted-foreground">{certificates.length} total</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Classes</span>
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Quizzes</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Certificates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="mt-6">
          <ClassesTab />
        </TabsContent>

        <TabsContent value="quizzes" className="mt-6">
          <QuizzesTab />
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <ProgressTab />
        </TabsContent>

        <TabsContent value="certificates" className="mt-6">
          <CertificatesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
