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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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

// Mock donations data
const mockDonations = [
  {
    id: 1,
    donorId: 1,
    donorName: "Michael Johnson",
    email: "michael.johnson@email.com",
    amount: 500,
    category: "Tithes",
    paymentMethod: "Online",
    date: "2024-01-15",
    status: "completed",
    receiptSent: true,
    notes: "Monthly tithe",
  },
  {
    id: 2,
    donorId: 2,
    donorName: "Sarah Williams",
    email: "sarah.williams@email.com",
    amount: 250,
    category: "Missions",
    paymentMethod: "Check",
    date: "2024-01-15",
    status: "completed",
    receiptSent: true,
    notes: "",
  },
  {
    id: 3,
    donorId: null,
    donorName: "Anonymous",
    email: "",
    amount: 1000,
    category: "Building Fund",
    paymentMethod: "Cash",
    date: "2024-01-14",
    status: "completed",
    receiptSent: false,
    notes: "Anonymous donation - cash in offering plate",
  },
  {
    id: 4,
    donorId: 3,
    donorName: "David Thompson",
    email: "david.thompson@email.com",
    amount: 350,
    category: "General Offering",
    paymentMethod: "Online",
    date: "2024-01-14",
    status: "completed",
    receiptSent: true,
    notes: "",
  },
  {
    id: 5,
    donorId: 4,
    donorName: "Jennifer Davis",
    email: "jennifer.davis@email.com",
    amount: 200,
    category: "Youth Ministry",
    paymentMethod: "Online",
    date: "2024-01-13",
    status: "completed",
    receiptSent: true,
    notes: "For youth camp",
  },
  {
    id: 6,
    donorId: 5,
    donorName: "Robert Brown",
    email: "robert.brown@email.com",
    amount: 750,
    category: "Tithes",
    paymentMethod: "Bank Transfer",
    date: "2024-01-12",
    status: "pending",
    receiptSent: false,
    notes: "Recurring monthly",
  },
  {
    id: 7,
    donorId: 6,
    donorName: "Emily Martinez",
    email: "emily.martinez@email.com",
    amount: 150,
    category: "General Offering",
    paymentMethod: "Check",
    date: "2024-01-12",
    status: "completed",
    receiptSent: true,
    notes: "",
  },
  {
    id: 8,
    donorId: 7,
    donorName: "James Wilson",
    email: "james.wilson@email.com",
    amount: 1200,
    category: "Building Fund",
    paymentMethod: "Online",
    date: "2024-01-11",
    status: "completed",
    receiptSent: true,
    notes: "Special gift for building project",
  },
  {
    id: 9,
    donorId: 8,
    donorName: "Lisa Anderson",
    email: "lisa.anderson@email.com",
    amount: 300,
    category: "Missions",
    paymentMethod: "Online",
    date: "2024-01-10",
    status: "completed",
    receiptSent: true,
    notes: "Africa missions trip",
  },
  {
    id: 10,
    donorId: 9,
    donorName: "Christopher Lee",
    email: "chris.lee@email.com",
    amount: 450,
    category: "Tithes",
    paymentMethod: "Cash",
    date: "2024-01-10",
    status: "completed",
    receiptSent: false,
    notes: "",
  },
  {
    id: 11,
    donorId: 10,
    donorName: "Amanda Taylor",
    email: "amanda.taylor@email.com",
    amount: 100,
    category: "Youth Ministry",
    paymentMethod: "Online",
    date: "2024-01-09",
    status: "failed",
    receiptSent: false,
    notes: "Payment failed - card declined",
  },
  {
    id: 12,
    donorId: 1,
    donorName: "Michael Johnson",
    email: "michael.johnson@email.com",
    amount: 2500,
    category: "Building Fund",
    paymentMethod: "Check",
    date: "2024-01-08",
    status: "completed",
    receiptSent: true,
    notes: "Special pledge payment",
  },
];

const categories = [
  "All Categories",
  "Tithes",
  "General Offering",
  "Building Fund",
  "Missions",
  "Youth Ministry",
];

const paymentMethods = [
  "All Methods",
  "Online",
  "Check",
  "Cash",
  "Bank Transfer",
];

const statuses = ["All Statuses", "completed", "pending", "failed"];

type SortField = "date" | "amount" | "donorName" | "category";
type SortDirection = "asc" | "desc";

export default function DonationsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<typeof mockDonations[0] | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<number | null>(null);

  const itemsPerPage = 10;

  // Filter and sort donations
  const filteredDonations = useMemo(() => {
    let result = [...mockDonations];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.donorName.toLowerCase().includes(query) ||
          d.email.toLowerCase().includes(query) ||
          d.notes.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "All Categories") {
      result = result.filter((d) => d.category === categoryFilter);
    }

    // Payment method filter
    if (methodFilter !== "All Methods") {
      result = result.filter((d) => d.paymentMethod === methodFilter);
    }

    // Status filter
    if (statusFilter !== "All Statuses") {
      result = result.filter((d) => d.status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      result = result.filter((d) => d.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((d) => d.date <= dateTo);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "donorName":
          comparison = a.donorName.localeCompare(b.donorName);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, categoryFilter, methodFilter, statusFilter, dateFrom, dateTo, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate totals
  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleDelete = (id: number) => {
    setDonationToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    // In a real app, this would call an API to delete the donation
    console.log("Deleting donation:", donationToDelete);
    setShowDeleteDialog(false);
    setDonationToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All Categories");
    setMethodFilter("All Methods");
    setStatusFilter("All Statuses");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    categoryFilter !== "All Categories" ||
    methodFilter !== "All Methods" ||
    statusFilter !== "All Statuses" ||
    dateFrom ||
    dateTo;

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
                <p className="text-2xl font-bold">{filteredDonations.length}</p>
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
                <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
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
                  ${filteredDonations.length > 0
                    ? Math.round(totalAmount / filteredDonations.length).toLocaleString()
                    : 0}
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
                  <Label>Category</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={(value) => {
                      setCategoryFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
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
                        <SelectItem key={method} value={method}>
                          {method}
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
                        <SelectItem key={status} value={status}>
                          {status === "All Statuses" ? status : status.charAt(0).toUpperCase() + status.slice(1)}
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
                      onClick={() => handleSort("category")}
                    >
                      Category
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
                {paginatedDonations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      No donations found matching your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedDonations.map((donation) => (
                    <tr key={donation.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(donation.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {donation.donorId ? (
                          <Link href={`/donations/donor/${donation.donorId}`}>
                            <span className="font-medium hover:text-primary cursor-pointer">
                              {donation.donorName}
                            </span>
                          </Link>
                        ) : (
                          <span className="font-medium text-muted-foreground">
                            {donation.donorName}
                          </span>
                        )}
                        {donation.email && (
                          <p className="text-sm text-muted-foreground">{donation.email}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">${donation.amount.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{donation.category}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          {donation.paymentMethod}
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
                            {!donation.receiptSent && donation.email && (
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Receipt
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredDonations.length)} of{" "}
                {filteredDonations.length} donations
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  ))}
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
                  <p className="font-medium">{selectedDonation.donorName}</p>
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
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">{selectedDonation.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <p className="font-medium">{selectedDonation.paymentMethod}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedDonation.status)}</div>
                </div>
                {selectedDonation.email && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedDonation.email}</p>
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
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
