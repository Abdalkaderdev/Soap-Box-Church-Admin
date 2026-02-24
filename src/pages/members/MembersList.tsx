import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Search,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Phone,
  Users,
  Download,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for members
const mockMembers = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    status: "active",
    joinDate: "2020-03-15",
    groups: ["Worship Team", "Men's Bible Study"],
    avatarUrl: null,
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 234-5678",
    status: "active",
    joinDate: "2019-06-22",
    groups: ["Children's Ministry", "Women's Fellowship"],
    avatarUrl: null,
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Williams",
    email: "m.williams@email.com",
    phone: "(555) 345-6789",
    status: "inactive",
    joinDate: "2018-01-10",
    groups: ["Ushers"],
    avatarUrl: null,
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Brown",
    email: "emily.brown@email.com",
    phone: "(555) 456-7890",
    status: "active",
    joinDate: "2021-09-05",
    groups: ["Youth Group", "Outreach Team"],
    avatarUrl: null,
  },
  {
    id: "5",
    firstName: "David",
    lastName: "Davis",
    email: "david.d@email.com",
    phone: "(555) 567-8901",
    status: "pending",
    joinDate: "2024-01-20",
    groups: [],
    avatarUrl: null,
  },
  {
    id: "6",
    firstName: "Jennifer",
    lastName: "Miller",
    email: "jen.miller@email.com",
    phone: "(555) 678-9012",
    status: "active",
    joinDate: "2017-11-30",
    groups: ["Choir", "Prayer Team"],
    avatarUrl: null,
  },
  {
    id: "7",
    firstName: "Robert",
    lastName: "Wilson",
    email: "r.wilson@email.com",
    phone: "(555) 789-0123",
    status: "active",
    joinDate: "2022-04-18",
    groups: ["Men's Bible Study", "Finance Committee"],
    avatarUrl: null,
  },
  {
    id: "8",
    firstName: "Amanda",
    lastName: "Taylor",
    email: "amanda.t@email.com",
    phone: "(555) 890-1234",
    status: "inactive",
    joinDate: "2016-08-12",
    groups: ["Women's Fellowship"],
    avatarUrl: null,
  },
];

type MemberStatus = "all" | "active" | "inactive" | "pending";

const ITEMS_PER_PAGE = 10;

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    case "inactive":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function MembersList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MemberStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search members
  const filteredMembers = useMemo(() => {
    return mockMembers.filter((member) => {
      // Apply status filter
      if (statusFilter !== "all" && member.status !== statusFilter) {
        return false;
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
        const matchesName = fullName.includes(query);
        const matchesEmail = member.email.toLowerCase().includes(query);
        const matchesPhone = member.phone.includes(query);
        return matchesName || matchesEmail || matchesPhone;
      }

      return true;
    });
  }, [searchQuery, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Stats
  const stats = useMemo(() => ({
    total: mockMembers.length,
    active: mockMembers.filter(m => m.status === "active").length,
    inactive: mockMembers.filter(m => m.status === "inactive").length,
    pending: mockMembers.filter(m => m.status === "pending").length,
  }), []);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage your church members and their information.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Link href="/members/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <div className="h-2 w-2 rounded-full bg-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  {statusFilter === "all" ? "All Status" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("active"); setCurrentPage(1); }}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("inactive"); setCurrentPage(1); }}>
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("pending"); setCurrentPage(1); }}>
                  Pending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b bg-muted/50 text-sm font-medium text-muted-foreground">
            <div className="col-span-4">Member</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Groups</div>
            <div className="col-span-1"></div>
          </div>

          {/* Member Rows */}
          {paginatedMembers.length > 0 ? (
            <div className="divide-y">
              {paginatedMembers.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/50 transition-colors"
                >
                  {/* Member Info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/members/${member.id}`}>
                        <span className="font-medium hover:text-primary cursor-pointer">
                          {member.firstName} {member.lastName}
                        </span>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(member.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="col-span-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{member.phone}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    {getStatusBadge(member.status)}
                  </div>

                  {/* Groups */}
                  <div className="col-span-2">
                    {member.groups.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {member.groups.slice(0, 2).map((group) => (
                          <Badge key={group} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                        {member.groups.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.groups.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No groups</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/members/${member.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/members/${member.id}?edit=true`}>Edit Member</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Send Email</DropdownMenuItem>
                        <DropdownMenuItem>Add to Group</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No members found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first member."}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Link href="/members/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredMembers.length)} of {filteredMembers.length} members
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
