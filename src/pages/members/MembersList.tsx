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
  Upload,
  LayoutGrid,
  List,
  Heart,
  Cake,
  Calendar,
  Clock,
  UserPlus,
  CheckSquare,
  X,
  Home,
  Gift,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useMembers,
  useMemberStats,
  useFamilies,
  useDeleteMember,
  useBulkUpdateMembers,
  useExportMembers,
  type MemberFilters,
} from "@/hooks/useMembers";
import { useAuth } from "@/hooks/useAuth";
import type { Member, MembershipStatus, Family } from "@/types";

// Warm church color palette CSS classes
const churchColors = {
  burgundy: {
    bg: "bg-[#722F37]",
    bgLight: "bg-[#722F37]/10",
    text: "text-[#722F37]",
    border: "border-[#722F37]",
    hover: "hover:bg-[#722F37]/90",
  },
  sage: {
    bg: "bg-[#9CAF88]",
    bgLight: "bg-[#9CAF88]/10",
    text: "text-[#9CAF88]",
    border: "border-[#9CAF88]",
  },
  ivory: {
    bg: "bg-[#FFFFF0]",
    bgLight: "bg-[#FFFFF0]/50",
    text: "text-[#FFFFF0]",
  },
  walnut: {
    bg: "bg-[#5D4037]",
    bgLight: "bg-[#5D4037]/10",
    text: "text-[#5D4037]",
    border: "border-[#5D4037]",
  },
};

type ViewMode = "list" | "grid" | "family";

const ITEMS_PER_PAGE = 10;

// Get avatar background color based on name (warm tones)
function getAvatarColor(firstName: string, lastName: string): string {
  const colors = [
    "bg-[#722F37]", // burgundy
    "bg-[#9CAF88]", // sage
    "bg-[#5D4037]", // walnut
    "bg-[#8B6914]", // gold
    "bg-[#6B4423]", // brown
    "bg-[#7B5141]", // sienna
  ];
  const hash = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length;
  return colors[hash];
}

function getStatusBadge(status: MembershipStatus) {
  switch (status) {
    case "active":
      return (
        <Badge className={`${churchColors.sage.bgLight} ${churchColors.sage.text} border ${churchColors.sage.border} font-serif`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#9CAF88] mr-1.5" />
          Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border border-gray-300 font-serif">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5" />
          Inactive
        </Badge>
      );
    case "visitor":
      return (
        <Badge className={`${churchColors.walnut.bgLight} ${churchColors.walnut.text} border ${churchColors.walnut.border} font-serif`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#5D4037] mr-1.5" />
          Visitor
        </Badge>
      );
    case "pending":
      return (
        <Badge className={`${churchColors.burgundy.bgLight} ${churchColors.burgundy.text} border ${churchColors.burgundy.border} font-serif`}>
          <Sparkles className="w-3 h-3 mr-1" />
          New Member
        </Badge>
      );
    case "former":
      return (
        <Badge variant="secondary" className="bg-gray-50 text-gray-500 border border-gray-200 font-serif">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-1.5" />
          Former
        </Badge>
      );
    default:
      return <Badge variant="outline" className="font-serif">{status}</Badge>;
  }
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getLastAttendanceIndicator(lastAttendance: string | null | undefined) {
  if (!lastAttendance) return { label: "Never", color: "text-gray-400", icon: Clock };

  const lastDate = new Date(lastAttendance);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return { label: "This week", color: "text-[#9CAF88]", icon: CheckSquare };
  if (diffDays <= 14) return { label: "Last week", color: "text-[#9CAF88]", icon: Clock };
  if (diffDays <= 30) return { label: "This month", color: "text-[#8B6914]", icon: Clock };
  if (diffDays <= 60) return { label: "1-2 months ago", color: "text-[#B8860B]", icon: Clock };
  return { label: "Over 2 months", color: "text-[#722F37]", icon: Clock };
}

function isUpcomingDate(dateStr: string | null | undefined, daysAhead: number = 30): boolean {
  if (!dateStr) return false;
  const today = new Date();
  const date = new Date(dateStr);
  // Set to this year
  date.setFullYear(today.getFullYear());
  // If date has passed this year, check next year
  if (date < today) {
    date.setFullYear(today.getFullYear() + 1);
  }
  const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= daysAhead;
}

function formatUpcomingDate(dateStr: string): string {
  const today = new Date();
  const date = new Date(dateStr);
  date.setFullYear(today.getFullYear());
  if (date < today) {
    date.setFullYear(today.getFullYear() + 1);
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MembersList() {
  const { churchId: _churchId } = useAuth();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MembershipStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Build filters for API call
  const filters: MemberFilters = useMemo(() => ({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy: "lastName",
    sortOrder: "asc",
  }), [currentPage, searchQuery, statusFilter]);

  // API queries
  const {
    data: membersData,
    isLoading: isLoadingMembers,
    error: membersError,
  } = useMembers(filters);

  const {
    data: statsData,
    isLoading: isLoadingStats,
  } = useMemberStats();

  const {
    data: familiesData,
    isLoading: isLoadingFamilies,
  } = useFamilies();

  // Mutations
  const deleteMember = useDeleteMember();
  const bulkUpdate = useBulkUpdateMembers();
  const exportMembers = useExportMembers();

  // Derived data
  const members = membersData?.data || [];
  const pagination = membersData?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalMembers = pagination?.totalItems || 0;

  // Stats from API
  const stats = useMemo(() => {
    if (!statsData) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        visitors: 0,
        newMembers: 0,
      };
    }
    return {
      total: statsData.total,
      active: statsData.byStatus?.active || 0,
      inactive: statsData.byStatus?.inactive || 0,
      visitors: statsData.byStatus?.visitor || 0,
      newMembers: statsData.newThisMonth || 0,
    };
  }, [statsData]);

  // Build family lookup map from families data
  const familyMap = useMemo(() => {
    const map = new Map<string, Family>();
    if (familiesData?.data) {
      familiesData.data.forEach((family) => {
        map.set(family.id, family);
      });
    }
    return map;
  }, [familiesData]);

  // Group members by family for family view
  const familyGroups = useMemo(() => {
    const groups: Record<string, Member[]> = {};
    const noFamily: Member[] = [];

    members.forEach((member) => {
      if (member.familyId) {
        if (!groups[member.familyId]) {
          groups[member.familyId] = [];
        }
        groups[member.familyId].push(member);
      } else {
        noFamily.push(member);
      }
    });

    return { groups, noFamily };
  }, [members]);

  // Get upcoming birthdays from current members
  const upcomingCelebrations = useMemo(() => {
    const birthdays = members
      .filter((m) => isUpcomingDate(m.dateOfBirth, 30))
      .map((m) => ({
        ...m,
        type: "birthday" as const,
        date: m.dateOfBirth!,
      }));

    return birthdays.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      dateA.setFullYear(2024);
      dateB.setFullYear(2024);
      return dateA.getTime() - dateB.getTime();
    });
  }, [members]);

  // Selection handlers
  const toggleMemberSelection = (memberId: string) => {
    const newSelection = new Set(selectedMembers);
    if (newSelection.has(memberId)) {
      newSelection.delete(memberId);
    } else {
      newSelection.add(memberId);
    }
    setSelectedMembers(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const toggleSelectAll = () => {
    if (selectedMembers.size === members.length) {
      setSelectedMembers(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedMembers(new Set(members.map((m) => m.id)));
      setShowBulkActions(true);
    }
  };

  const clearSelection = () => {
    setSelectedMembers(new Set());
    setShowBulkActions(false);
  };

  // Handle export
  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      const blob = await exportMembers.mutateAsync({ format, filters });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `members.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Handle delete member
  const handleDeleteMember = async (memberId: string) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await deleteMember.mutateAsync(memberId);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  // Handle bulk actions
  const handleBulkStatusUpdate = async (status: MembershipStatus) => {
    try {
      await bulkUpdate.mutateAsync({
        memberIds: Array.from(selectedMembers),
        data: { membershipStatus: status },
      });
      clearSelection();
    } catch (error) {
      console.error("Bulk update failed:", error);
    }
  };

  // Member Card Component for Grid View
  const MemberCard = ({ member }: { member: Member }) => {
    const attendance = getLastAttendanceIndicator(member.updatedAt); // Using updatedAt as proxy for last activity
    const AttendanceIcon = attendance.icon;
    const family = member.familyId ? familyMap.get(member.familyId) : null;

    return (
      <Card className={`group relative overflow-hidden transition-all duration-200 hover:shadow-lg border-[#5D4037]/20 ${churchColors.ivory.bgLight}`}>
        {/* Selection checkbox */}
        <div className="absolute top-3 left-3 z-10">
          <Checkbox
            checked={selectedMembers.has(member.id)}
            onCheckedChange={() => toggleMemberSelection(member.id)}
            className="border-[#5D4037]/30 data-[state=checked]:bg-[#722F37] data-[state=checked]:border-[#722F37]"
          />
        </div>

        <CardContent className="p-6 pt-8">
          <div className="flex flex-col items-center text-center">
            {/* Avatar with initials */}
            <Avatar className={`h-20 w-20 mb-4 ring-4 ring-[#FFFFF0] shadow-md ${getAvatarColor(member.firstName, member.lastName)}`}>
              <AvatarImage src={member.photoUrl || undefined} />
              <AvatarFallback className={`text-xl font-serif text-white ${getAvatarColor(member.firstName, member.lastName)}`}>
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>

            {/* Name and status */}
            <Link href={`/members/${member.id}`}>
              <h3 className="font-serif text-lg font-semibold text-[#5D4037] hover:text-[#722F37] cursor-pointer transition-colors">
                {member.firstName} {member.lastName}
              </h3>
            </Link>

            <div className="mt-2">{getStatusBadge(member.membershipStatus)}</div>

            {/* Contact info */}
            <div className="mt-4 space-y-1.5 text-sm text-[#5D4037]/70">
              {member.email && (
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[180px]">{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{member.phone}</span>
                </div>
              )}
            </div>

            {/* Family badge */}
            {family && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-[#5D4037]/60">
                <Home className="h-3.5 w-3.5" />
                <span className="font-serif">{family.name}</span>
              </div>
            )}

            {/* Tags */}
            {member.tags && member.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-1">
                {member.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs font-serif border-[#9CAF88]/50 text-[#5D4037]">
                    {tag}
                  </Badge>
                ))}
                {member.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs font-serif border-[#9CAF88]/50 text-[#5D4037]">
                    +{member.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Last activity */}
            <div className={`mt-4 flex items-center gap-1.5 text-xs ${attendance.color}`}>
              <AttendanceIcon className="h-3.5 w-3.5" />
              <span className="font-serif">Last seen: {attendance.label}</span>
            </div>
          </div>
        </CardContent>

        {/* Actions dropdown */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5D4037]/60 hover:text-[#722F37]">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-serif">
              <DropdownMenuItem asChild>
                <Link href={`/members/${member.id}`}>View Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/members/${member.id}?edit=true`}>Edit Details</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlus className="h-4 w-4 mr-2" />
                Add to Group
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDeleteMember(member.id)}
              >
                Remove Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  };

  // Family Group Card Component
  const FamilyGroupCard = ({ familyId, members: familyMembers }: { familyId: string; members: Member[] }) => {
    const family = familyMap.get(familyId);
    const familyName = family?.name || "Unknown Family";

    return (
      <Card className={`overflow-hidden border-[#5D4037]/20 ${churchColors.ivory.bgLight}`}>
        <CardHeader className={`${churchColors.walnut.bgLight} border-b border-[#5D4037]/10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${churchColors.walnut.bg}`}>
                <Home className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="font-serif text-[#5D4037]">{familyName}</CardTitle>
            </div>
            <Badge variant="outline" className="font-serif border-[#5D4037]/30">
              {familyMembers.length} {familyMembers.length === 1 ? "member" : "members"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {familyMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/50 border border-[#5D4037]/10 hover:border-[#722F37]/30 transition-colors">
                <Avatar className={`h-12 w-12 ${getAvatarColor(member.firstName, member.lastName)}`}>
                  <AvatarImage src={member.photoUrl || undefined} />
                  <AvatarFallback className="text-white font-serif">
                    {getInitials(member.firstName, member.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/members/${member.id}`}>
                    <span className="font-serif font-medium text-[#5D4037] hover:text-[#722F37] cursor-pointer">
                      {member.firstName} {member.lastName}
                    </span>
                  </Link>
                  <div className="mt-1">{getStatusBadge(member.membershipStatus)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Loading state
  if (isLoadingMembers && !membersData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FFFFF0]/30 to-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#722F37]" />
          <p className="font-serif text-[#5D4037]">Loading members...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (membersError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FFFFF0]/30 to-white">
        <Card className="max-w-md border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <h3 className="font-serif text-lg font-semibold text-red-700">Error Loading Members</h3>
              <p className="text-red-600">{(membersError as Error).message}</p>
              <Button
                onClick={() => window.location.reload()}
                className={`${churchColors.burgundy.bg} ${churchColors.burgundy.hover}`}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-[#FFFFF0]/30 to-white min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-[#5D4037]">Our Church Family</h1>
          <p className="text-[#5D4037]/70 mt-1 font-serif">
            Caring for and connecting with every member of our community.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-[#5D4037]/30 text-[#5D4037] hover:bg-[#5D4037]/10 font-serif"
                disabled={exportMembers.isPending}
              >
                {exportMembers.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-serif">
              <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="border-[#5D4037]/30 text-[#5D4037] hover:bg-[#5D4037]/10 font-serif">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Link href="/members/new">
            <Button size="sm" className={`${churchColors.burgundy.bg} ${churchColors.burgundy.hover} font-serif`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </Link>
        </div>
      </div>

      {/* Upcoming Celebrations Section */}
      {upcomingCelebrations.length > 0 && (
        <Card className={`border-[#9CAF88]/30 ${churchColors.sage.bgLight}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-serif text-[#5D4037] flex items-center gap-2">
              <Gift className="h-5 w-5 text-[#722F37]" />
              Upcoming Celebrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {upcomingCelebrations.slice(0, 6).map((celebration) => (
                <div
                  key={`${celebration.id}-${celebration.type}`}
                  className="flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-[#9CAF88]/30 shadow-sm"
                >
                  <Avatar className={`h-8 w-8 ${getAvatarColor(celebration.firstName, celebration.lastName)}`}>
                    <AvatarFallback className="text-xs text-white font-serif">
                      {getInitials(celebration.firstName, celebration.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    {celebration.type === "birthday" ? (
                      <Cake className="h-4 w-4 text-[#722F37]" />
                    ) : (
                      <Heart className="h-4 w-4 text-[#722F37]" />
                    )}
                    <span className="font-serif text-sm text-[#5D4037]">
                      {celebration.firstName} {celebration.lastName}
                    </span>
                    <span className="text-xs text-[#5D4037]/60 font-serif">
                      {formatUpcomingDate(celebration.date)}
                    </span>
                  </div>
                </div>
              ))}
              {upcomingCelebrations.length > 6 && (
                <Button variant="ghost" size="sm" className="text-[#722F37] font-serif">
                  +{upcomingCelebrations.length - 6} more
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card
          className={`border-[#5D4037]/20 ${churchColors.ivory.bgLight} cursor-pointer transition-all hover:shadow-md ${statusFilter === "all" ? "ring-2 ring-[#722F37]" : ""}`}
          onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-serif font-medium text-[#5D4037]">Total Members</CardTitle>
            <Users className="h-4 w-4 text-[#5D4037]/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold text-[#5D4037]">
              {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.total}
            </div>
          </CardContent>
        </Card>
        <Card
          className={`border-[#9CAF88]/30 ${churchColors.sage.bgLight} cursor-pointer transition-all hover:shadow-md ${statusFilter === "active" ? "ring-2 ring-[#9CAF88]" : ""}`}
          onClick={() => { setStatusFilter("active"); setCurrentPage(1); }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-serif font-medium text-[#5D4037]">Active</CardTitle>
            <div className="h-2.5 w-2.5 rounded-full bg-[#9CAF88]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold text-[#5D4037]">
              {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.active}
            </div>
          </CardContent>
        </Card>
        <Card
          className={`border-gray-200 bg-gray-50/50 cursor-pointer transition-all hover:shadow-md ${statusFilter === "inactive" ? "ring-2 ring-gray-400" : ""}`}
          onClick={() => { setStatusFilter("inactive"); setCurrentPage(1); }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-serif font-medium text-[#5D4037]">Inactive</CardTitle>
            <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold text-[#5D4037]">
              {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.inactive}
            </div>
          </CardContent>
        </Card>
        <Card
          className={`border-[#5D4037]/20 ${churchColors.walnut.bgLight} cursor-pointer transition-all hover:shadow-md ${statusFilter === "visitor" ? "ring-2 ring-[#5D4037]" : ""}`}
          onClick={() => { setStatusFilter("visitor"); setCurrentPage(1); }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-serif font-medium text-[#5D4037]">Visitors</CardTitle>
            <div className="h-2.5 w-2.5 rounded-full bg-[#5D4037]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold text-[#5D4037]">
              {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.visitors}
            </div>
          </CardContent>
        </Card>
        <Card
          className={`border-[#722F37]/20 ${churchColors.burgundy.bgLight} cursor-pointer transition-all hover:shadow-md ${statusFilter === "pending" ? "ring-2 ring-[#722F37]" : ""}`}
          onClick={() => { setStatusFilter("pending"); setCurrentPage(1); }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-serif font-medium text-[#5D4037]">New This Month</CardTitle>
            <Sparkles className="h-4 w-4 text-[#722F37]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold text-[#5D4037]">
              {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.newMembers}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <Card className={`${churchColors.burgundy.bgLight} border-[#722F37]/30`}>
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-serif text-[#722F37] font-medium">
                  {selectedMembers.size} {selectedMembers.size === 1 ? "member" : "members"} selected
                </span>
                <Button variant="ghost" size="sm" onClick={clearSelection} className="text-[#722F37] hover:bg-[#722F37]/10">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-[#722F37]/30 text-[#722F37] hover:bg-[#722F37]/10 font-serif">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" size="sm" className="border-[#722F37]/30 text-[#722F37] hover:bg-[#722F37]/10 font-serif">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add to Group
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#722F37]/30 text-[#722F37] hover:bg-[#722F37]/10 font-serif"
                      disabled={bulkUpdate.isPending}
                    >
                      {bulkUpdate.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4 mr-2" />
                      )}
                      More Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="font-serif">
                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("active")}>
                      Set Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("inactive")}>
                      Set Inactive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExport("csv")}>Export Selected</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters, Search, and View Toggle */}
      <Card className={`border-[#5D4037]/20 ${churchColors.ivory.bgLight}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5D4037]/50" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 border-[#5D4037]/30 focus:border-[#722F37] focus:ring-[#722F37]/20 font-serif"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-[#5D4037]/30 text-[#5D4037] hover:bg-[#5D4037]/10 font-serif">
                    <Filter className="h-4 w-4 mr-2" />
                    {statusFilter === "all" ? "All Status" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="font-serif">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter("active"); setCurrentPage(1); }}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter("inactive"); setCurrentPage(1); }}>Inactive</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter("visitor"); setCurrentPage(1); }}>Visitors</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter("pending"); setCurrentPage(1); }}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter("former"); setCurrentPage(1); }}>Former</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Toggle */}
              <div className="flex items-center border border-[#5D4037]/30 rounded-lg p-1 bg-white">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? `${churchColors.burgundy.bg} ${churchColors.burgundy.hover}` : "text-[#5D4037] hover:bg-[#5D4037]/10"}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? `${churchColors.burgundy.bg} ${churchColors.burgundy.hover}` : "text-[#5D4037] hover:bg-[#5D4037]/10"}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "family" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("family")}
                  disabled={isLoadingFamilies}
                  className={viewMode === "family" ? `${churchColors.burgundy.bg} ${churchColors.burgundy.hover}` : "text-[#5D4037] hover:bg-[#5D4037]/10"}
                >
                  <Home className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading indicator for refetch */}
      {isLoadingMembers && membersData && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#722F37]" />
        </div>
      )}

      {/* Members Display */}
      {viewMode === "family" ? (
        /* Family Grouping View */
        <div className="space-y-4">
          {Object.entries(familyGroups.groups).map(([familyId, familyMembers]) => (
            <FamilyGroupCard
              key={familyId}
              familyId={familyId}
              members={familyMembers}
            />
          ))}
          {familyGroups.noFamily.length > 0 && (
            <Card className={`border-[#5D4037]/20 ${churchColors.ivory.bgLight}`}>
              <CardHeader className="border-b border-[#5D4037]/10">
                <CardTitle className="font-serif text-[#5D4037] flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Individual Members
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {familyGroups.noFamily.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        /* List View */
        <Card className={`border-[#5D4037]/20 ${churchColors.ivory.bgLight}`}>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#5D4037]/10 bg-[#5D4037]/5 text-sm font-serif font-medium text-[#5D4037]">
              <div className="col-span-1 flex items-center">
                <Checkbox
                  checked={selectedMembers.size === members.length && members.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-[#5D4037]/30 data-[state=checked]:bg-[#722F37] data-[state=checked]:border-[#722F37]"
                />
              </div>
              <div className="col-span-3">Member</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Member Since</div>
              <div className="col-span-1">Tags</div>
              <div className="col-span-1"></div>
            </div>

            {/* Member Rows */}
            {members.length > 0 ? (
              <div className="divide-y divide-[#5D4037]/10">
                {members.map((member) => {
                  const family = member.familyId ? familyMap.get(member.familyId) : null;

                  return (
                    <div
                      key={member.id}
                      className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#FFFFF0]/50 transition-colors ${selectedMembers.has(member.id) ? "bg-[#722F37]/5" : ""}`}
                    >
                      {/* Checkbox */}
                      <div className="col-span-1 hidden md:flex items-center">
                        <Checkbox
                          checked={selectedMembers.has(member.id)}
                          onCheckedChange={() => toggleMemberSelection(member.id)}
                          className="border-[#5D4037]/30 data-[state=checked]:bg-[#722F37] data-[state=checked]:border-[#722F37]"
                        />
                      </div>

                      {/* Member Info */}
                      <div className="col-span-3 flex items-center gap-3">
                        <Avatar className={`h-11 w-11 ring-2 ring-white shadow-sm ${getAvatarColor(member.firstName, member.lastName)}`}>
                          <AvatarImage src={member.photoUrl || undefined} />
                          <AvatarFallback className="text-white font-serif">
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/members/${member.id}`}>
                            <span className="font-serif font-medium text-[#5D4037] hover:text-[#722F37] cursor-pointer transition-colors">
                              {member.firstName} {member.lastName}
                            </span>
                          </Link>
                          {family && (
                            <p className="text-xs text-[#5D4037]/50 font-serif flex items-center gap-1 mt-0.5">
                              <Home className="h-3 w-3" />
                              {family.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="col-span-2 space-y-1">
                        {member.email && (
                          <div className="flex items-center gap-2 text-sm text-[#5D4037]/80">
                            <Mail className="h-3.5 w-3.5 text-[#5D4037]/50" />
                            <span className="truncate font-serif">{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-2 text-sm text-[#5D4037]/60">
                            <Phone className="h-3.5 w-3.5 text-[#5D4037]/50" />
                            <span className="font-serif">{member.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="col-span-2">{getStatusBadge(member.membershipStatus)}</div>

                      {/* Member Since */}
                      <div className="col-span-2">
                        {member.memberSince ? (
                          <div className="flex items-center gap-1.5 text-sm text-[#5D4037]/70">
                            <Calendar className="h-4 w-4" />
                            <span className="font-serif">
                              {new Date(member.memberSince).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-[#5D4037]/40 font-serif">Not set</span>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="col-span-1">
                        {member.tags && member.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {member.tags.slice(0, 1).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs font-serif border-[#9CAF88]/50 text-[#5D4037]">
                                {tag}
                              </Badge>
                            ))}
                            {member.tags.length > 1 && (
                              <Badge variant="outline" className="text-xs font-serif border-[#9CAF88]/50 text-[#5D4037]">
                                +{member.tags.length - 1}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-[#5D4037]/40 font-serif">No tags</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-[#5D4037]/60 hover:text-[#722F37] hover:bg-[#722F37]/10">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="font-serif">
                            <DropdownMenuItem asChild>
                              <Link href={`/members/${member.id}`}>View Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/members/${member.id}?edit=true`}>Edit Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="h-4 w-4 mr-2" />
                              Call Member
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add to Group
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className={`p-4 rounded-full ${churchColors.walnut.bgLight} mb-4`}>
                  <Users className="h-12 w-12 text-[#5D4037]/60" />
                </div>
                <h3 className="text-lg font-serif font-medium text-[#5D4037]">No members found</h3>
                <p className="text-sm text-[#5D4037]/60 mt-1 font-serif">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by adding your first member to the church family."}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Link href="/members/new">
                    <Button className={`mt-4 ${churchColors.burgundy.bg} ${churchColors.burgundy.hover} font-serif`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && viewMode !== "family" && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#5D4037]/60 font-serif">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalMembers)} of{" "}
            {totalMembers} members
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoadingMembers}
              className="border-[#5D4037]/30 text-[#5D4037] hover:bg-[#5D4037]/10 font-serif disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show pages around current page
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={`w-8 h-8 p-0 font-serif ${
                      currentPage === page
                        ? `${churchColors.burgundy.bg} ${churchColors.burgundy.hover}`
                        : "border-[#5D4037]/30 text-[#5D4037] hover:bg-[#5D4037]/10"
                    }`}
                    onClick={() => setCurrentPage(page)}
                    disabled={isLoadingMembers}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoadingMembers}
              className="border-[#5D4037]/30 text-[#5D4037] hover:bg-[#5D4037]/10 font-serif disabled:opacity-50"
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
