import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle,
  ArrowRightLeft,
  Wrench,
  Eye,
  ClipboardCheck,
  RotateCcw,
  Box,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useEquipment,
  useEquipmentStats,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
  useCheckoutEquipment,
  useCreateMaintenanceLog,
  useReturnEquipment,
} from '@/hooks/useEquipment';
import type {
  Equipment,
  EquipmentCategory,
  EquipmentStatus,
  EquipmentCreateInput,
  EquipmentUpdateInput,
  MaintenanceLog,
} from '@/hooks/useEquipment';

// ============================================================================
// Types
// ============================================================================

type CategoryFilter = EquipmentCategory | 'all';
type StatusFilter = EquipmentStatus | 'all';
type ConditionFilter = 'all' | 'excellent' | 'good' | 'fair' | 'poor';

// ============================================================================
// Constants & Configuration
// ============================================================================

const categoryLabels: Record<EquipmentCategory, string> = {
  audio_visual: 'Audio/Visual',
  musical_instruments: 'Musical Instruments',
  furniture: 'Furniture',
  lighting: 'Lighting',
  computing: 'Technology',
  kitchen: 'Kitchen',
  outdoor: 'Outdoor',
  vehicles: 'Vehicles',
  other: 'Other',
};

const categoryColors: Record<EquipmentCategory, string> = {
  audio_visual: 'bg-sanctuary-100 text-sanctuary-700',
  musical_instruments: 'bg-golden-100 text-golden-700',
  furniture: 'bg-vesper-100 text-vesper-700',
  lighting: 'bg-dawn-100 text-dawn-700',
  computing: 'bg-hymnal-100 text-hymnal-700',
  kitchen: 'bg-ember-100 text-ember-700',
  outdoor: 'bg-spirit-100 text-spirit-700',
  vehicles: 'bg-coral-100 text-coral-700',
  other: 'bg-gray-100 text-gray-700',
};

const statusConfig: Record<EquipmentStatus, { label: string; color: string }> = {
  available: { label: 'Available', color: 'bg-[hsl(150,25%,40%)] text-white' },
  in_use: { label: 'In Use', color: 'bg-blue-100 text-blue-800' },
  checked_out: { label: 'Checked Out', color: 'bg-amber-100 text-amber-800' },
  maintenance: { label: 'Maintenance', color: 'bg-red-100 text-red-800' },
  retired: { label: 'Retired', color: 'bg-gray-200 text-gray-600' },
  lost: { label: 'Lost', color: 'bg-red-200 text-red-700' },
};

const conditionColors: Record<string, string> = {
  excellent: 'text-[hsl(150,25%,40%)]',
  good: 'text-blue-600',
  fair: 'text-amber-600',
  poor: 'text-red-600',
};

const ITEMS_PER_PAGE = 20;

// ============================================================================
// Skeleton Components
// ============================================================================

function StatsCardSkeleton() {
  return (
    <Card className="church-glow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
    </TableRow>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  iconBg,
}: {
  title: string;
  value: number;
  icon: typeof Package;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  iconBg: string;
}) {
  return (
    <Card className="church-glow border-[hsl(35,20%,88%)] bg-gradient-to-br from-card to-[hsl(40,33%,96%)]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground font-serif">
          {title}
        </CardTitle>
        <div className={`h-9 w-9 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-serif">{value}</div>
        {trendLabel && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-[hsl(150,25%,40%)]" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {trendLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryBadge({ category }: { category: EquipmentCategory }) {
  return (
    <Badge className={`${categoryColors[category]} font-serif text-xs`}>
      {categoryLabels[category]}
    </Badge>
  );
}

function StatusBadge({ status }: { status: EquipmentStatus }) {
  const config = statusConfig[status];
  return (
    <Badge className={`${config.color} font-serif text-xs`}>
      {config.label}
    </Badge>
  );
}

function ConditionIndicator({ condition }: { condition?: string }) {
  if (!condition) return <span className="text-muted-foreground text-sm">--</span>;
  const colorClass = conditionColors[condition.toLowerCase()] || 'text-gray-600';
  return (
    <span className={`text-sm font-medium capitalize ${colorClass}`}>
      {condition}
    </span>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-sanctuary-100 flex items-center justify-center mb-4">
        <Box className="h-8 w-8 text-sanctuary-600" />
      </div>
      <h3 className="text-lg font-semibold font-serif text-foreground mb-2">
        No equipment found
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        Start tracking your church's equipment and assets. Add items to manage inventory,
        checkouts, and maintenance schedules.
      </p>
      <Button onClick={onAdd} className="bg-sanctuary-700 hover:bg-sanctuary-800 text-white">
        <Plus className="h-4 w-4 mr-2" />
        Add Equipment
      </Button>
    </div>
  );
}

// ============================================================================
// Dialog Components
// ============================================================================

interface AddEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: Equipment | null;
  onSubmit: (data: EquipmentCreateInput | EquipmentUpdateInput) => void;
  isLoading: boolean;
}

function AddEditEquipmentDialog({ open, onOpenChange, equipment, onSubmit, isLoading }: AddEditDialogProps) {
  const [name, setName] = useState(equipment?.name ?? '');
  const [description, setDescription] = useState(equipment?.description ?? '');
  const [category, setCategory] = useState<EquipmentCategory>(equipment?.category ?? 'other');
  const [serialNumber, setSerialNumber] = useState(equipment?.serialNumber ?? '');
  const [purchaseDate, setPurchaseDate] = useState(equipment?.purchaseDate?.split('T')[0] ?? '');
  const [purchasePrice, setPurchasePrice] = useState(equipment?.purchasePrice?.toString() ?? '');
  const [location, setLocation] = useState(equipment?.location ?? '');
  const [notes, setNotes] = useState(equipment?.notes ?? '');
  const [warrantyExpiration, setWarrantyExpiration] = useState(equipment?.warrantyExpiration?.split('T')[0] ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: EquipmentCreateInput = {
      name,
      description: description || undefined,
      category,
      serialNumber: serialNumber || undefined,
      purchaseDate: purchaseDate || undefined,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      location: location || undefined,
      notes: notes || undefined,
      warrantyExpiration: warrantyExpiration || undefined,
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {equipment ? 'Edit Equipment' : 'Add Equipment'}
          </DialogTitle>
          <DialogDescription>
            {equipment
              ? 'Update the details for this equipment item.'
              : 'Add a new piece of equipment or asset to your inventory.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="eq-name">Name *</Label>
              <Input
                id="eq-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Yamaha Acoustic Guitar"
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="eq-description">Description</Label>
              <Textarea
                id="eq-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the item..."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="eq-category">Category *</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as EquipmentCategory)}>
                <SelectTrigger id="eq-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="eq-serial">Serial Number</Label>
              <Input
                id="eq-serial"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="S/N"
              />
            </div>
            <div>
              <Label htmlFor="eq-purchase-date">Purchase Date</Label>
              <Input
                id="eq-purchase-date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="eq-purchase-price">Purchase Price ($)</Label>
              <Input
                id="eq-purchase-price"
                type="number"
                step="0.01"
                min="0"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="eq-location">Location</Label>
              <Input
                id="eq-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Sanctuary, Storage Room B"
              />
            </div>
            <div>
              <Label htmlFor="eq-warranty">Warranty Expiration</Label>
              <Input
                id="eq-warranty"
                type="date"
                value={warrantyExpiration}
                onChange={(e) => setWarrantyExpiration(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="eq-notes">Notes</Label>
              <Textarea
                id="eq-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="bg-sanctuary-700 hover:bg-sanctuary-800 text-white"
            >
              {isLoading ? 'Saving...' : equipment ? 'Update Equipment' : 'Add Equipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSubmit: (data: { memberId: string; expectedReturnDate?: string; notes?: string }) => void;
  isLoading: boolean;
}

function CheckoutDialog({ open, onOpenChange, equipment, onSubmit, isLoading }: CheckoutDialogProps) {
  const [memberId, setMemberId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      memberId,
      expectedReturnDate: expectedReturnDate || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Checkout Equipment
          </DialogTitle>
          <DialogDescription>
            Check out "{equipment?.name}" to a member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="co-member">Member ID *</Label>
            <Input
              id="co-member"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="Enter member ID"
              required
            />
          </div>
          <div>
            <Label htmlFor="co-return-date">Expected Return Date</Label>
            <Input
              id="co-return-date"
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="co-notes">Notes</Label>
            <Textarea
              id="co-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Purpose of checkout, special instructions..."
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!memberId.trim() || isLoading}
              className="bg-sanctuary-700 hover:bg-sanctuary-800 text-white"
            >
              {isLoading ? 'Processing...' : 'Checkout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSubmit: (data: {
    type: MaintenanceLog['type'];
    description: string;
    cost?: number;
    completedDate?: string;
  }) => void;
  isLoading: boolean;
}

function MaintenanceLogDialog({ open, onOpenChange, equipment, onSubmit, isLoading }: MaintenanceDialogProps) {
  const [type, setType] = useState<MaintenanceLog['type']>('preventive');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      description,
      cost: cost ? parseFloat(cost) : undefined,
      completedDate: completedDate || undefined,
    });
  };

  const maintenanceTypes: { value: MaintenanceLog['type']; label: string }[] = [
    { value: 'preventive', label: 'Routine / Preventive' },
    { value: 'repair', label: 'Repair' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'calibration', label: 'Upgrade / Calibration' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Log Maintenance
          </DialogTitle>
          <DialogDescription>
            Record maintenance for "{equipment?.name}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="mt-type">Maintenance Type *</Label>
            <Select value={type} onValueChange={(val) => setType(val as MaintenanceLog['type'])}>
              <SelectTrigger id="mt-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {maintenanceTypes.map((mt) => (
                  <SelectItem key={mt.value} value={mt.value}>{mt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="mt-description">Description *</Label>
            <Textarea
              id="mt-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the work performed..."
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mt-cost">Cost ($)</Label>
              <Input
                id="mt-cost"
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="mt-date">Date Completed</Label>
              <Input
                id="mt-date"
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!description.trim() || isLoading}
              className="bg-sanctuary-700 hover:bg-sanctuary-800 text-white"
            >
              {isLoading ? 'Saving...' : 'Log Maintenance'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function EquipmentManagement() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>('all');
  const [page, setPage] = useState(1);

  // Dialog state
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutEquipment, setCheckoutEquipment] = useState<Equipment | null>(null);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [maintenanceEquipment, setMaintenanceEquipment] = useState<Equipment | null>(null);

  // API hooks
  const { data: equipmentData, isLoading, isError, error } = useEquipment({
    search: searchQuery || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    pageSize: ITEMS_PER_PAGE,
  });
  const { data: stats, isLoading: statsLoading } = useEquipmentStats();
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();
  const deleteEquipment = useDeleteEquipment();
  const checkoutMutation = useCheckoutEquipment();
  const returnMutation = useReturnEquipment();
  const createMaintenanceLog = useCreateMaintenanceLog();

  const equipmentList = equipmentData?.data ?? [];
  const totalPages = equipmentData?.pagination?.totalPages ?? 1;
  const totalItems = equipmentData?.pagination?.totalItems ?? 0;

  // Filter by condition on the client side (not in the API)
  const filteredEquipment = conditionFilter === 'all'
    ? equipmentList
    : equipmentList.filter((item) => {
        const tag = item.tags?.find((t) =>
          ['excellent', 'good', 'fair', 'poor'].includes(t.toLowerCase())
        );
        return tag?.toLowerCase() === conditionFilter;
      });

  // Handlers
  const handleAddEquipment = () => {
    setEditingEquipment(null);
    setAddEditOpen(true);
  };

  const handleEditEquipment = (item: Equipment) => {
    setEditingEquipment(item);
    setAddEditOpen(true);
  };

  const handleSubmitEquipment = (data: EquipmentCreateInput | EquipmentUpdateInput) => {
    if (editingEquipment) {
      updateEquipment.mutate(
        { id: editingEquipment.id, data },
        { onSuccess: () => setAddEditOpen(false) }
      );
    } else {
      createEquipment.mutate(data as EquipmentCreateInput, {
        onSuccess: () => setAddEditOpen(false),
      });
    }
  };

  const handleDeleteEquipment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this equipment item? This action cannot be undone.')) {
      deleteEquipment.mutate(id);
    }
  };

  const handleCheckout = (item: Equipment) => {
    setCheckoutEquipment(item);
    setCheckoutOpen(true);
  };

  const handleReturn = (item: Equipment) => {
    // For return, we need the checkout ID. In a real app we'd look it up.
    // Here we use the equipment ID as a simplified approach.
    returnMutation.mutate({ checkoutId: item.id });
  };

  const handleSubmitCheckout = (data: { memberId: string; expectedReturnDate?: string; notes?: string }) => {
    if (!checkoutEquipment) return;
    checkoutMutation.mutate(
      {
        equipmentId: checkoutEquipment.id,
        memberId: data.memberId,
        expectedReturnDate: data.expectedReturnDate,
        notes: data.notes,
      },
      { onSuccess: () => setCheckoutOpen(false) }
    );
  };

  const handleLogMaintenance = (item: Equipment) => {
    setMaintenanceEquipment(item);
    setMaintenanceOpen(true);
  };

  const handleSubmitMaintenance = (data: {
    type: MaintenanceLog['type'];
    description: string;
    cost?: number;
    completedDate?: string;
  }) => {
    if (!maintenanceEquipment) return;
    createMaintenanceLog.mutate(
      {
        equipmentId: maintenanceEquipment.id,
        type: data.type,
        description: data.description,
        cost: data.cost,
        completedDate: data.completedDate,
        status: 'completed',
      },
      { onSuccess: () => setMaintenanceOpen(false) }
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '--' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const truncate = (str: string | undefined, len: number) => {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  // Stats values
  const totalAssets = stats?.total ?? 0;
  const available = stats?.byStatus?.available ?? 0;
  const checkedOut = stats?.checkedOut ?? 0;
  const needsMaintenance = stats?.maintenanceDue ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ================================================================ */}
      {/* Header */}
      {/* ================================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">
            Equipment & Assets
          </h1>
          <p className="text-muted-foreground mt-1">
            Track, manage, and maintain your church's equipment and assets.
          </p>
        </div>
        <Button
          onClick={handleAddEquipment}
          className="bg-sanctuary-700 hover:bg-sanctuary-800 text-white shadow-warm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* ================================================================ */}
      {/* Stats Cards */}
      {/* ================================================================ */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Assets"
            value={totalAssets}
            icon={Package}
            iconBg="bg-sanctuary-700"
            trend="up"
            trendLabel="All tracked items"
          />
          <StatsCard
            title="Available"
            value={available}
            icon={CheckCircle}
            iconBg="bg-[hsl(150,25%,40%)]"
            trend="neutral"
            trendLabel="Ready for use"
          />
          <StatsCard
            title="Checked Out"
            value={checkedOut}
            icon={ArrowRightLeft}
            iconBg="bg-amber-600"
            trend={checkedOut > 0 ? 'up' : 'neutral'}
            trendLabel={`${checkedOut} item${checkedOut !== 1 ? 's' : ''} in use`}
          />
          <StatsCard
            title="Needs Maintenance"
            value={needsMaintenance}
            icon={Wrench}
            iconBg="bg-coral-400"
            trend={needsMaintenance > 0 ? 'down' : 'neutral'}
            trendLabel={needsMaintenance > 0 ? 'Action required' : 'All up to date'}
          />
        </div>
      )}

      {/* ================================================================ */}
      {/* Error Alert */}
      {/* ================================================================ */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading equipment</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* ================================================================ */}
      {/* Filter Bar */}
      {/* ================================================================ */}
      <Card className="church-glow border-[hsl(35,20%,88%)]">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(val) => {
                setCategoryFilter(val as CategoryFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={conditionFilter}
              onValueChange={(val) => {
                setConditionFilter(val as ConditionFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Equipment Table */}
      {/* ================================================================ */}
      <Card className="church-glow border-[hsl(35,20%,88%)]">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-lg">Inventory</CardTitle>
          <CardDescription>
            {totalItems} item{totalItems !== 1 ? 's' : ''} total
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Last Maintenance</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </TableBody>
            </Table>
          ) : filteredEquipment.length === 0 ? (
            <EmptyState onAdd={handleAddEquipment} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Last Maintenance</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipment.map((item) => {
                    const conditionTag = item.tags?.find((t) =>
                      ['excellent', 'good', 'fair', 'poor'].includes(t.toLowerCase())
                    );
                    const assignedName = item.assignedMember
                      ? `${item.assignedMember.firstName} ${item.assignedMember.lastName}`
                      : item.assignedTo
                        ? item.assignedTo
                        : '--';

                    return (
                      <TableRow key={item.id} className="group">
                        <TableCell>
                          <div>
                            <p className="font-medium font-serif text-foreground">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {truncate(item.description, 50)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <CategoryBadge category={item.category} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell>
                          <ConditionIndicator condition={conditionTag} />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {item.location || '--'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {assignedName}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(item.nextMaintenanceDate)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditEquipment(item)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditEquipment(item)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {item.status === 'available' ? (
                                <DropdownMenuItem onClick={() => handleCheckout(item)}>
                                  <ClipboardCheck className="h-4 w-4 mr-2" />
                                  Checkout
                                </DropdownMenuItem>
                              ) : item.status === 'checked_out' ? (
                                <DropdownMenuItem onClick={() => handleReturn(item)}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Return
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuItem onClick={() => handleLogMaintenance(item)}>
                                <Wrench className="h-4 w-4 mr-2" />
                                Log Maintenance
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteEquipment(item.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Dialogs */}
      {/* ================================================================ */}
      <AddEditEquipmentDialog
        open={addEditOpen}
        onOpenChange={setAddEditOpen}
        equipment={editingEquipment}
        onSubmit={handleSubmitEquipment}
        isLoading={createEquipment.isPending || updateEquipment.isPending}
      />
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        equipment={checkoutEquipment}
        onSubmit={handleSubmitCheckout}
        isLoading={checkoutMutation.isPending}
      />
      <MaintenanceLogDialog
        open={maintenanceOpen}
        onOpenChange={setMaintenanceOpen}
        equipment={maintenanceEquipment}
        onSubmit={handleSubmitMaintenance}
        isLoading={createMaintenanceLog.isPending}
      />
    </div>
  );
}
