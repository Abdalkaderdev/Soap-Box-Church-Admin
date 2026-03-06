import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  Building2,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
  Layers,
  Eye,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  useDepartments,
  useMinistries,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '@/hooks/useOrganization';
import type { Department, DepartmentCreateInput, DepartmentUpdateInput } from '@/hooks/useOrganization';

// ============================================================================
// Types
// ============================================================================

interface DepartmentFormData {
  name: string;
  description: string;
  ministryId: string;
  leaderId: string;
}

const EMPTY_FORM: DepartmentFormData = {
  name: '',
  description: '',
  ministryId: '',
  leaderId: '',
};

// ============================================================================
// Status helpers
// ============================================================================

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-[hsl(150,25%,40%)] text-white' },
  inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground' },
};

function getStatusBadge(isActive: boolean) {
  const config = isActive ? statusConfig.active : statusConfig.inactive;
  return <Badge className={config.className}>{config.label}</Badge>;
}

// ============================================================================
// Sub-components
// ============================================================================

function StatsBar({
  totalDepartments,
  totalTeams,
  activeMembers,
  isLoading,
}: {
  totalDepartments: number;
  totalTeams: number;
  activeMembers: number;
  isLoading: boolean;
}) {
  const stats = [
    { label: 'Total Departments', value: totalDepartments, icon: Building2 },
    { label: 'Total Teams', value: totalTeams, icon: Layers },
    { label: 'Active Members', value: activeMembers, icon: Users },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DepartmentFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  isEdit,
  ministries,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: DepartmentFormData;
  setFormData: (data: DepartmentFormData) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEdit: boolean;
  ministries: { id: string; name: string }[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Department' : 'Add Department'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the department details below.'
              : 'Create a new operational department for your church.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="dept-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dept-name"
              placeholder="e.g. Sanitation, Production, Security"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dept-description">Description</Label>
            <Textarea
              id="dept-description"
              placeholder="Brief description of this department's responsibilities..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dept-ministry">Parent Ministry</Label>
            <Select
              value={formData.ministryId}
              onValueChange={(value) =>
                setFormData({ ...formData, ministryId: value === 'none' ? '' : value })
              }
            >
              <SelectTrigger id="dept-ministry">
                <SelectValue placeholder="Select a ministry (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No ministry</SelectItem>
                {ministries.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dept-leader">Leader Name</Label>
            <Input
              id="dept-leader"
              placeholder="Department leader name"
              value={formData.leaderId}
              onChange={(e) => setFormData({ ...formData, leaderId: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!formData.name.trim() || isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Department'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Building2 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No departments yet</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
          Departments help you organize operational areas like Sanitation, Production, Security, and
          more. Get started by creating your first department.
        </p>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Ministry</TableHead>
              <TableHead>Leader</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function DepartmentsManagement() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>(EMPTY_FORM);

  // Data hooks
  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    isError: departmentsError,
  } = useDepartments({
    search: searchQuery || undefined,
    ministryId: ministryFilter || undefined,
  });

  const { data: ministriesData } = useMinistries();

  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  // Derived data
  const departments = useMemo(() => departmentsData?.data ?? [], [departmentsData]);
  const ministries = ministriesData?.data ?? [];

  const stats = useMemo(() => {
    const totalDepartments = departmentsData?.pagination?.totalItems ?? departments.length;
    const totalTeams = departments.reduce((sum, d) => sum + (d.teamCount ?? 0), 0);
    const activeMembers = departments.reduce((sum, d) => sum + (d.memberCount ?? 0), 0);
    return { totalDepartments, totalTeams, activeMembers };
  }, [departments, departmentsData?.pagination?.totalItems]);

  // Handlers
  function openAddDialog() {
    setEditingDepartment(null);
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEditDialog(dept: Department) {
    setEditingDepartment(dept);
    setFormData({
      name: dept.name,
      description: dept.description ?? '',
      ministryId: dept.ministryId ?? '',
      leaderId: dept.leaderId ?? '',
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!formData.name.trim()) return;

    if (editingDepartment) {
      const updateData: DepartmentUpdateInput = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        ministryId: formData.ministryId || undefined,
        leaderId: formData.leaderId.trim() || undefined,
      };
      updateDepartment.mutate(
        { id: editingDepartment.id, data: updateData },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      const createData: DepartmentCreateInput = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        ministryId: formData.ministryId || 'unassigned',
        leaderId: formData.leaderId.trim() || undefined,
      };
      createDepartment.mutate(createData, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  }

  function handleDelete(id: string) {
    deleteDepartment.mutate(id);
  }

  function getMinistryName(ministryId?: string) {
    if (!ministryId) return '-';
    const ministry = ministries.find((m) => m.id === ministryId);
    return ministry?.name ?? '-';
  }

  // Render
  const isSubmitting = createDepartment.isPending || updateDepartment.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage operational departments and link them to ministries.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Stats */}
      <StatsBar
        totalDepartments={stats.totalDepartments}
        totalTeams={stats.totalTeams}
        activeMembers={stats.activeMembers}
        isLoading={departmentsLoading}
      />

      {/* Error state */}
      {departmentsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load departments. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={ministryFilter}
            onValueChange={(value) => setMinistryFilter(value === 'all' ? '' : value)}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="All Ministries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ministries</SelectItem>
              {ministries.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Department List */}
      {departmentsLoading ? (
        <LoadingSkeleton />
      ) : departments.length === 0 && !searchQuery && !ministryFilter ? (
        <EmptyState onAdd={openAddDialog} />
      ) : departments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No departments match your filters. Try adjusting your search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Ministry</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead className="text-center">Teams</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{dept.name}</p>
                        {dept.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {dept.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dept.ministry?.name ?? getMinistryName(dept.ministryId)}
                    </TableCell>
                    <TableCell>
                      {dept.leader?.firstName
                        ? `${dept.leader.firstName} ${dept.leader.lastName ?? ''}`.trim()
                        : dept.leaderId ?? '-'}
                    </TableCell>
                    <TableCell className="text-center">{dept.teamCount ?? 0}</TableCell>
                    <TableCell className="text-center">{dept.memberCount ?? 0}</TableCell>
                    <TableCell>{getStatusBadge(dept.isActive)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(dept)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Teams
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(dept.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <DepartmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEdit={!!editingDepartment}
        ministries={ministries.map((m) => ({ id: m.id, name: m.name }))}
      />
    </div>
  );
}
