import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  Calendar,
  DollarSign,
  CreditCard,
  Mail,
  FileText,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDonations,
  useDeleteDonation,
  useSendDonationReceipt,
  useFunds,
  type DonationFilters,
} from "@/hooks/useDonations";
import type { Donation, DonationMethod, DonationStatus } from "@/types";

const paymentMethods: { value: string; label: string }[] = [
  { value: "all", label: "All Methods" },
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "card", label: "Card" },
  { value: "ach", label: "ACH" },
  { value: "online", label: "Online" },
  { value: "other", label: "Other" },
];

const statuses: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

type SortField = "date" | "amount" | "donorName" | "fund";
type SortDirection = "asc" | "desc";

export default function DonationsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [fundFilter, setFundFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Build filters for API
  const filters: DonationFilters = useMemo(() => {
    const f: DonationFilters = {
      page: currentPage,
      pageSize: itemsPerPage,
      sortBy: sortField === "donorName" ? "member.lastName" : sortField,
      sortOrder: sortDirection,
    };

    if (fundFilter !== "all") f.fundId = fundFilter;
    if (methodFilter !== "all") f.method = methodFilter as DonationMethod;
    if (statusFilter !== "all") f.status = statusFilter as DonationStatus;
    if (dateFrom) f.dateFrom = dateFrom;
    if (dateTo) f.dateTo = dateTo;

    return f;
  }, [currentPage, sortField, sortDirection, fundFilter, methodFilter, statusFilter, dateFrom, dateTo]);

  // Fetch donations
  const { data: donationsData, isLoading, refetch } = useDonations(filters);

  // Fetch funds for filter dropdown
  const { data: funds } = useFunds();

  // Mutations
  const deleteMutation = useDeleteDonation();
  const sendReceiptMutation = useSendDonationReceipt();

  // Get donations and pagination info
  const donations = donationsData?.data || [];
  const pagination = donationsData?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalItems || 0;

  // Filter by search query (client-side since API may not support full-text search)
  const filteredDonations = useMemo(() => {
    if (!searchQuery) return donations;

    const query = searchQuery.toLowerCase();
    return donations.filter(
      (d) =>
        (d.member?.firstName + " " + d.member?.lastName)?.toLowerCase().includes(query) ||
        d.member?.email?.toLowerCase().includes(query) ||
        d.notes?.toLowerCase().includes(query)
    );
  }, [donations, searchQuery]);

  // Calculate totals from filtered results
  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    setDonationToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (donationToDelete) {
      await deleteMutation.mutateAsync(donationToDelete);
      setShowDeleteDialog(false);
      setDonationToDelete(null);
      refetch();
    }
  };

  const handleSendReceipt = async (donationId: string) => {
    await sendReceiptMutation.mutateAsync({ donationId });
    refetch();
  };

  const getStatusBadge = (status: DonationStatus) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "refunded":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Refunded</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFundFilter("all");
    setMethodFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    fundFilter !== "all" ||
    methodFilter !== "all" ||
    statusFilter !== "all" ||
    dateFrom ||
    dateTo;

  const getDonorName = (donation: Donation) => {
    if (donation.isAnonymous) return "Anonymous";
    if (donation.member) {
      return `${donation.member.firstName} ${donation.member.lastName}`;
    }
    return "Unknown Donor";
  };

  const getDonorEmail = (donation: Donation) => {
    return donation.member?.email || "";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Donations</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all recorded donations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/donations/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Donation
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Showing</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : filteredDonations.length}
                </p>
                <p className="text-sm text-muted-foreground">donations</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-24" /> : `$${totalAmount.toLocaleString()}`}
                </p>
                <p className="text-sm text-muted-foreground">filtered results</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    `$${filteredDonations.length > 0 ? Math.round(totalAmount / filteredDonations.length).toLocaleString() : 0}`
                  )}
                </p>
                <p className="text-sm text-muted-foreground">per donation</p>
              </div>
              <ArrowUpDown className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by donor name, email, or notes..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-accent" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Fund</Label>
                  <Select
                    value={fundFilter}
                    onValueChange={(value) => {
                      setFundFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Funds</SelectItem>
                      {funds?.map((fund) => (
                        <SelectItem key={fund.id} value={fund.id}>
                          {fund.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={methodFilter}
                    onValueChange={(value) => {
                      setMethodFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-primary"
                        onClick={() => handleSort("date")}
                      >
                        Date
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-primary"
                        onClick={() => handleSort("donorName")}
                      >
                        Donor
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-primary"
                        onClick={() => handleSort("amount")}
                      >
                        Amount
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-primary"
                        onClick={() => handleSort("fund")}
                      >
                        Fund
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Method</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Receipt</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-muted-foreground">
                        No donations found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map((donation) => (
                      <tr key={donation.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(donation.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {donation.memberId && !donation.isAnonymous ? (
                            <Link href={`/donations/donor/${donation.memberId}`}>
                              <span className="font-medium hover:text-primary cursor-pointer">
                                {getDonorName(donation)}
                              </span>
                            </Link>
                          ) : (
                            <span className="font-medium text-muted-foreground">
                              {getDonorName(donation)}
                            </span>
                          )}
                          {getDonorEmail(donation) && (
                            <p className="text-sm text-muted-foreground">{getDonorEmail(donation)}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">${donation.amount.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{donation.fund}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{donation.method}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(donation.status)}</td>
                        <td className="py-3 px-4">
                          {donation.receiptSent ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Sent
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Not Sent</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedDonation(donation)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {!donation.receiptSent && getDonorEmail(donation) && (
                                <DropdownMenuItem
                                  onClick={() => handleSendReceipt(donation.id)}
                                  disabled={sendReceiptMutation.isPending}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  {sendReceiptMutation.isPending ? "Sending..." : "Send Receipt"}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(donation.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} donations
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Donation Details Dialog */}
      <Dialog open={!!selectedDonation} onOpenChange={() => setSelectedDonation(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
            <DialogDescription>
              Detailed information about this donation.
            </DialogDescription>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Donor</Label>
                  <p className="font-medium">{getDonorName(selectedDonation)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium text-lg">${selectedDonation.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {new Date(selectedDonation.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fund</Label>
                  <p className="font-medium">{selectedDonation.fund}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <p className="font-medium capitalize">{selectedDonation.method}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedDonation.status)}</div>
                </div>
                {getDonorEmail(selectedDonation) && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{getDonorEmail(selectedDonation)}</p>
                  </div>
                )}
                {selectedDonation.transactionId && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Transaction ID</Label>
                    <p className="font-medium font-mono text-sm">{selectedDonation.transactionId}</p>
                  </div>
                )}
                {selectedDonation.notes && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="font-medium">{selectedDonation.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDonation(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Donation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this donation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
