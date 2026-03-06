import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Church,
  Layers,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import {
  useMinistries,
  useCreateMinistry,
  useUpdateMinistry,
  useDeleteMinistry,
} from '@/hooks/useOrganization';
import type { Ministry, MinistryCreateInput } from '@/hooks/useOrganization';

// ============================================================================
// Types & Constants
// ============================================================================

type MinistryCategory =
  | 'youth'
  | 'children'
  | 'women'
  | 'men'
  | 'prayer'
  | 'outreach'
  | 'worship'
  | 'pastoral_care'
  | 'evangelism'
  | 'missions'
  | 'education'
  | 'other';

const categoryLabels: Record<MinistryCategory, string> = {
  youth: 'Youth',
  children: 'Children',
  women: 'Women',
  men: 'Men',
  prayer: 'Prayer',
  outreach: 'Outreach',
  worship: 'Worship',
  pastoral_care: 'Pastoral Care',
  evangelism: 'Evangelism',
  missions: 'Missions',
  education: 'Education',
  other: 'Other',
};

const categoryColors: Record<MinistryCategory, string> = {
  youth: 'bg-spirit-500 text-white',
  children: 'bg-golden-500 text-white',
  women: 'bg-grace-500 text-white',
  men: 'bg-sanctuary-600 text-white',
  prayer: 'bg-vesper-500 text-white',
  outreach: 'bg-spirit-600 text-white',
  worship: 'bg-golden-600 text-white',
  pastoral_care: 'bg-grace-600 text-white',
  evangelism: 'bg-sanctuary-500 text-white',
  missions: 'bg-vesper-600 text-white',
  education: 'bg-spirit-400 text-white',
  other: 'bg-muted text-muted-foreground',
};

interface MinistryFormData {
  name: string;
  description: string;
  category: MinistryCategory;
  leaderId: string;
  imageUrl: string;
}

const emptyFormData: MinistryFormData = {
  name: '',
  description: '',
  category: 'other',
  leaderId: '',
  imageUrl: '',
};

// ============================================================================
// Helper to extract category from ministry description/name
// ============================================================================

function inferCategory(ministry: Ministry): MinistryCategory {
  const text = `${ministry.name} ${ministry.description ?? ''}`.toLowerCase();
  for (const key of Object.keys(categoryLabels) as MinistryCategory[]) {
    if (text.includes(key.replace('_', ' ')) || text.includes(key)) {
      return key;
    }
  }
  return 'other';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================================================
// Component
// ============================================================================

function MinistriesManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [formData, setFormData] = useState<MinistryFormData>(emptyFormData);

  // API hooks
  const { data: ministriesResponse, isLoading, isError } = useMinistries();
  const createMinistry = useCreateMinistry();
  const updateMinistry = useUpdateMinistry();
  const deleteMinistry = useDeleteMinistry();

  const ministries = useMemo(() => ministriesResponse?.data ?? [], [ministriesResponse]);

  // Derived stats
  const stats = useMemo(() => {
    const totalMinistries = ministries.length;
    const activeMembers = ministries.reduce((sum, m) => sum + (m.memberCount || 0), 0);
    const totalDepartments = ministries.reduce((sum, m) => sum + (m.departmentCount || 0), 0);
    return { totalMinistries, activeMembers, totalDepartments };
  }, [ministries]);

  // Filtered ministries
  const filteredMinistries = useMemo(() => {
    return ministries.filter((m) => {
      const matchesSearch =
        !searchQuery ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());

      const category = inferCategory(m);
      const matchesCategory = categoryFilter === 'all' || category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [ministries, searchQuery, categoryFilter]);

  // Form handlers
  function openAddDialog() {
    setEditingMinistry(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  }

  function openEditDialog(ministry: Ministry) {
    setEditingMinistry(ministry);
    setFormData({
      name: ministry.name,
      description: ministry.description ?? '',
      category: inferCategory(ministry),
      leaderId: ministry.leaderId ?? '',
      imageUrl: ministry.imageUrl ?? '',
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload: MinistryCreateInput = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      leaderId: formData.leaderId.trim() || undefined,
      imageUrl: formData.imageUrl.trim() || undefined,
      isActive: true,
    };

    if (editingMinistry) {
      updateMinistry.mutate(
        { id: editingMinistry.id, data: payload },
        {
          onSuccess: () => setDialogOpen(false),
        }
      );
    } else {
      createMinistry.mutate(payload, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  }

  function handleDelete(id: string) {
    deleteMinistry.mutate(id);
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif text-sanctuary-700">
            Ministries
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your church ministries and organizational structure.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openAddDialog}
              className="bg-sanctuary-700 hover:bg-sanctuary-800 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Ministry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-sanctuary-700">
                {editingMinistry ? 'Edit Ministry' : 'Add Ministry'}
              </DialogTitle>
              <DialogDescription>
                {editingMinistry
                  ? 'Update the ministry details below.'
                  : 'Create a new ministry for your church.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Youth Ministry"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this ministry..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val as MinistryCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(categoryLabels) as MinistryCategory[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {categoryLabels[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaderId">Leader ID</Label>
                <Input
                  id="leaderId"
                  placeholder="Member ID of the ministry leader"
                  value={formData.leaderId}
                  onChange={(e) => setFormData({ ...formData, leaderId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-sanctuary-700 hover:bg-sanctuary-800 text-white"
                  disabled={createMinistry.isPending || updateMinistry.isPending}
                >
                  {createMinistry.isPending || updateMinistry.isPending
                    ? 'Saving...'
                    : editingMinistry
                      ? 'Update Ministry'
                      : 'Create Ministry'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-sanctuary-100 p-2.5">
              <Church className="h-5 w-5 text-sanctuary-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Ministries</p>
              <p className="text-2xl font-bold text-sanctuary-700">
                {isLoading ? <Skeleton className="h-7 w-10 inline-block" /> : stats.totalMinistries}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-golden-100 p-2.5">
              <UserCheck className="h-5 w-5 text-golden-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Members</p>
              <p className="text-2xl font-bold text-golden-700">
                {isLoading ? <Skeleton className="h-7 w-10 inline-block" /> : stats.activeMembers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-spirit-100 p-2.5">
              <Layers className="h-5 w-5 text-spirit-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Departments</p>
              <p className="text-2xl font-bold text-spirit-700">
                {isLoading ? (
                  <Skeleton className="h-7 w-10 inline-block" />
                ) : (
                  stats.totalDepartments
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ministries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(Object.keys(categoryLabels) as MinistryCategory[]).map((key) => (
              <SelectItem key={key} value={key}>
                {categoryLabels[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-1/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-destructive">
          <CardContent className="p-6 text-center text-destructive">
            Failed to load ministries. Please try again later.
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredMinistries.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-sanctuary-100 p-4 mb-4">
              <BookOpen className="h-8 w-8 text-sanctuary-500" />
            </div>
            <h3 className="text-lg font-semibold text-sanctuary-700 font-serif">
              No ministries found
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first ministry.'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <Button
                onClick={openAddDialog}
                className="mt-4 bg-sanctuary-700 hover:bg-sanctuary-800 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Ministry
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ministry Cards Grid */}
      {!isLoading && !isError && filteredMinistries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMinistries.map((ministry) => {
            const category = inferCategory(ministry);
            const leaderName = ministry.leader
              ? `${ministry.leader.firstName} ${ministry.leader.lastName}`
              : null;

            return (
              <Card
                key={ministry.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-lg font-serif text-sanctuary-700 truncate">
                        {ministry.name}
                      </CardTitle>
                      <Badge className={categoryColors[category]} variant="secondary">
                        {categoryLabels[category]}
                      </Badge>
                    </div>
                    <Badge
                      variant={ministry.isActive ? 'default' : 'outline'}
                      className={
                        ministry.isActive
                          ? 'bg-[hsl(150,25%,40%)] text-white shrink-0'
                          : 'shrink-0'
                      }
                    >
                      {ministry.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  {ministry.description && (
                    <CardDescription className="line-clamp-2 text-sm">
                      {ministry.description}
                    </CardDescription>
                  )}

                  {/* Leader */}
                  {leaderName && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-sanctuary-100 text-sanctuary-700 text-xs">
                          {getInitials(leaderName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground truncate">
                        {leaderName}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{ministry.memberCount ?? 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      <span>{ministry.departmentCount ?? 0} depts</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(ministry)}
                    >
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(ministry.id)}
                      disabled={deleteMinistry.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MinistriesManagement;
