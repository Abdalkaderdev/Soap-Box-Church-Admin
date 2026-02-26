/**
 * Donations Management Page for Church Admin
 * Comprehensive donation management with search, filters, export, and admin actions
 */

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  useDonations,
  useFunds,
  useRefundDonation,
  useSendDonationReceipt,
  type DonationFilters,
} from '@/hooks/useDonations';
import { api } from '@/lib/api';
import type { Donation, DonationStatus } from '@/types';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  DollarSign,
  Search,
  Download,
  Filter,
  MoreVertical,
  Eye,
  Mail,
  Receipt,
  RotateCcw,
  Loader2,
  Heart,
  Repeat,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  AlertCircle,
  X,
  TrendingUp,
  Hash,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';

// Status configuration for display
const STATUS_CONFIG: Record<DonationStatus, { icon: typeof CheckCircle; color: string; bg: string }> = {
  completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
  refunded: { icon: RotateCcw, color: 'text-gray-500', bg: 'bg-gray-100' },
  cancelled: { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
};

// Donations summary interface
interface DonationsSummary {
  totalAmount: number;
  donationCount: number;
  averageAmount: number;
  recurringCount: number;
  oneTimeCount: number;
}

// Filter state interface
interface ManagementFilters {
  search: string;
  status: string;
  fundId: string;
  isRecurring: string;
  dateFrom: string;
  dateTo: string;
}

export default function DonationsManagement() {
  const { user, isAuthenticated, churchId, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedDonations, setSelectedDonations] = useState<string[]>([]);
  const [detailDonation, setDetailDonation] = useState<Donation | null>(null);
  const [refundDonation, setRefundDonation] = useState<Donation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ManagementFilters>({
    search: '',
    status: '',
    fundId: '',
    isRecurring: '',
    dateFrom: '',
    dateTo: '',
  });

  // Build API filters
  const apiFilters: DonationFilters = useMemo(() => {
    const f: DonationFilters = {
      page,
      pageSize,
      sortBy: 'date',
      sortOrder: 'desc',
    };

    if (filters.status) f.status = filters.status as DonationStatus;
    if (filters.fundId) f.fundId = filters.fundId;
    if (filters.isRecurring) f.isRecurring = filters.isRecurring === 'true';
    if (filters.dateFrom) f.dateFrom = filters.dateFrom;
    if (filters.dateTo) f.dateTo = filters.dateTo;

    return f;
  }, [page, pageSize, filters]);

  // Fetch donations
  const { data: donationsData, isLoading: loadingDonations, refetch } = useDonations(apiFilters);

  // Fetch funds for filter
  const { data: funds } = useFunds();

  // Get donations and pagination info
  const donations = donationsData?.data || [];
  const pagination = donationsData?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalItems || 0;

  // Filter by search query (client-side)
  const filteredDonations = useMemo(() => {
    if (!filters.search) return donations;

    const query = filters.search.toLowerCase();
    return donations.filter(
      (d) =>
        (d.member?.firstName + ' ' + d.member?.lastName)?.toLowerCase().includes(query) ||
        d.member?.email?.toLowerCase().includes(query) ||
        d.transactionId?.toLowerCase().includes(query) ||
        d.notes?.toLowerCase().includes(query)
    );
  }, [donations, filters.search]);

  // Calculate summary statistics
  const summaryData: DonationsSummary = useMemo(() => {
    const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
    const recurringCount = filteredDonations.filter((d) => d.isRecurring).length;
    const oneTimeCount = filteredDonations.filter((d) => !d.isRecurring).length;

    return {
      totalAmount,
      donationCount: filteredDonations.length,
      averageAmount: filteredDonations.length > 0 ? totalAmount / filteredDonations.length : 0,
      recurringCount,
      oneTimeCount,
    };
  }, [filteredDonations]);

  // Mutations
  const refundMutation = useRefundDonation();
  const resendReceiptMutation = useSendDonationReceipt();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handleExportCSV = async () => {
    if (!churchId) return;

    try {
      const params = new URLSearchParams();
      params.set('format', 'csv');
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      if (filters.status) params.set('status', filters.status);
      if (filters.fundId) params.set('fundId', filters.fundId);

      // Open export URL in new tab
      const baseUrl = import.meta.env.VITE_API_URL || 'https://soapboxsuperapp.com/api';
      window.open(`${baseUrl}/church/${churchId}/donations/export?${params.toString()}`, '_blank');

      toast({
        title: 'Export Started',
        description: 'Your CSV file will download shortly.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export donations. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExportExcel = async () => {
    if (!churchId) return;

    try {
      const params = new URLSearchParams();
      params.set('format', 'xlsx');
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);

      const baseUrl = import.meta.env.VITE_API_URL || 'https://soapboxsuperapp.com/api';
      window.open(`${baseUrl}/church/${churchId}/donations/export?${params.toString()}`, '_blank');

      toast({
        title: 'Export Started',
        description: 'Your Excel file will download shortly.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export donations. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRefund = async (donation: Donation) => {
    try {
      await refundMutation.mutateAsync({ donationId: donation.id });
      toast({
        title: 'Refund Initiated',
        description: 'The refund has been initiated and will be processed shortly.',
        variant: 'success',
      });
      setRefundDonation(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Refund Failed',
        description: error.message || 'Failed to process refund. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleResendReceipt = async (donationId: string) => {
    try {
      await resendReceiptMutation.mutateAsync({ donationId });
      toast({
        title: 'Receipt Sent',
        description: 'The donation receipt has been sent to the donor.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Failed to Send',
        description: 'Could not send the receipt. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedDonations.length === filteredDonations.length) {
      setSelectedDonations([]);
    } else {
      setSelectedDonations(filteredDonations.map((d) => d.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedDonations((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      fundId: '',
      isRecurring: '',
      dateFrom: '',
      dateTo: '',
    });
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const getDonorName = (donation: Donation) => {
    if (donation.isAnonymous) return 'Anonymous';
    if (donation.member) {
      return `${donation.member.firstName} ${donation.member.lastName}`;
    }
    return 'Unknown Donor';
  };

  const getDonorEmail = (donation: Donation) => {
    return donation.member?.email || '';
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <Building2 className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in with admin credentials to manage donations.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-primary" />
            Donations Management
          </h1>
          <p className="text-muted-foreground mt-1">
            View, search, and manage all donations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {filters.dateFrom || filters.dateTo ? 'Total in Range' : 'Total Donations'}
                </p>
                <p className="text-2xl font-bold mt-1">
                  {loadingDonations ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    formatCurrency(summaryData.totalAmount)
                  )}
                </p>
                {summaryData.recurringCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {summaryData.recurringCount} recurring, {summaryData.oneTimeCount} one-time
                  </p>
                )}
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Number of Donations</p>
                <p className="text-2xl font-bold mt-1">
                  {loadingDonations ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    summaryData.donationCount.toLocaleString()
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeFilterCount > 0 ? 'Matching filters' : 'All time'}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Hash className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Donation</p>
                <p className="text-2xl font-bold mt-1">
                  {loadingDonations ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    formatCurrency(summaryData.averageAmount)
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Per donation</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by donor name, email, or transaction ID..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setPage(1);
                }}
              />
            </div>
            <Button
              variant={showFilters ? 'secondary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(v) => {
                      setFilters({ ...filters, status: v });
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fund</Label>
                  <Select
                    value={filters.fundId}
                    onValueChange={(v) => {
                      setFilters({ ...filters, fundId: v });
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All funds" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All funds</SelectItem>
                      {funds?.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={filters.isRecurring}
                    onValueChange={(v) => {
                      setFilters({ ...filters, isRecurring: v });
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="true">Recurring</SelectItem>
                      <SelectItem value="false">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => {
                      setFilters({ ...filters, dateFrom: e.target.value });
                      setPage(1);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => {
                      setFilters({ ...filters, dateTo: e.target.value });
                      setPage(1);
                    }}
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Clear all
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardContent className="pt-6">
          {loadingDonations ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !filteredDonations.length ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No donations found</h3>
              <p className="text-muted-foreground">
                {activeFilterCount > 0
                  ? 'Try adjusting your filters'
                  : 'Donations will appear here once received'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden space-y-3">
                {filteredDonations.map((donation) => {
                  const statusConfig = STATUS_CONFIG[donation.status];
                  return (
                    <div
                      key={donation.id}
                      className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => setDetailDonation(donation)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{getDonorName(donation)}</p>
                          <p className="text-sm text-muted-foreground">
                            {donation.fund || 'General Fund'}
                          </p>
                        </div>
                        <Badge variant="outline" className={statusConfig.color}>
                          {donation.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">
                          {formatCurrency(donation.amount)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(donation.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {donation.isRecurring && (
                        <Badge variant="secondary">
                          <Repeat className="w-3 h-3 mr-1" />
                          Recurring
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedDonations.length === filteredDonations.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Fund</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonations.map((donation) => {
                      const statusConfig = STATUS_CONFIG[donation.status];
                      const StatusIcon = statusConfig.icon;
                      return (
                        <TableRow key={donation.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedDonations.includes(donation.id)}
                              onCheckedChange={() => toggleSelect(donation.id)}
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(donation.date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{getDonorName(donation)}</p>
                              {!donation.isAnonymous && getDonorEmail(donation) && (
                                <p className="text-sm text-muted-foreground">
                                  {getDonorEmail(donation)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{donation.fund || 'General Fund'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(donation.amount)}
                          </TableCell>
                          <TableCell>
                            {donation.isRecurring ? (
                              <Badge variant="secondary">
                                <Repeat className="w-3 h-3 mr-1" />
                                Recurring
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">One-time</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1 ${statusConfig.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              <span className="capitalize">{donation.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setDetailDonation(donation)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {donation.status === 'completed' && !donation.isAnonymous && getDonorEmail(donation) && (
                                  <DropdownMenuItem
                                    onClick={() => handleResendReceipt(donation.id)}
                                    disabled={resendReceiptMutation.isPending}
                                  >
                                    <Mail className="w-4 h-4 mr-2" />
                                    {resendReceiptMutation.isPending ? 'Sending...' : 'Send Receipt'}
                                  </DropdownMenuItem>
                                )}
                                {donation.status === 'completed' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => setRefundDonation(donation)}
                                    >
                                      <RotateCcw className="w-4 h-4 mr-2" />
                                      Issue Refund
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * pageSize + 1} to{' '}
                    {Math.min(page * pageSize, totalItems)} of {totalItems} donations
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
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

      {/* Donation Details Modal */}
      <Dialog open={!!detailDonation} onOpenChange={() => setDetailDonation(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
            <DialogDescription>
              Transaction #{detailDonation?.id?.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          {detailDonation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="text-2xl font-bold">{formatCurrency(detailDonation.amount)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className={`flex items-center gap-1 ${STATUS_CONFIG[detailDonation.status].color}`}>
                    {(() => {
                      const Icon = STATUS_CONFIG[detailDonation.status].icon;
                      return <Icon className="w-5 h-5" />;
                    })()}
                    <span className="text-lg capitalize">{detailDonation.status}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donor</span>
                  <span className="font-medium">{getDonorName(detailDonation)}</span>
                </div>
                {!detailDonation.isAnonymous && getDonorEmail(detailDonation) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{getDonorEmail(detailDonation)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fund</span>
                  <span>{detailDonation.fund || 'General Fund'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>
                    {format(new Date(detailDonation.date), 'MMMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{detailDonation.isRecurring ? 'Recurring' : 'One-time'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="capitalize">{detailDonation.method}</span>
                </div>
                {detailDonation.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-sm">{detailDonation.transactionId}</span>
                  </div>
                )}
                {detailDonation.notes && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Notes</span>
                    <p className="text-sm bg-muted p-2 rounded">{detailDonation.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetailDonation(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Confirmation Dialog */}
      <AlertDialog open={!!refundDonation} onOpenChange={() => setRefundDonation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Confirm Refund
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refund this donation of{' '}
              <strong>{formatCurrency(refundDonation?.amount || 0)}</strong> to{' '}
              <strong>
                {refundDonation?.isAnonymous ? 'Anonymous Donor' : getDonorName(refundDonation!)}
              </strong>
              ?
              <br />
              <br />
              This action cannot be undone. The funds will be returned to the donor's original payment method.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => refundDonation && handleRefund(refundDonation)}
              className="bg-red-500 hover:bg-red-600"
              disabled={refundMutation.isPending}
            >
              {refundMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-2" />
              )}
              Issue Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
