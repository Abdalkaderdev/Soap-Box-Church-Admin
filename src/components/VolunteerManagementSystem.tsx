import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  UserPlus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  TrendingUp,
  Search,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  AlertTriangle,
  BarChart3,
  MoreVertical,
  Mail
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Safe date formatting utility
const formatSafeDate = (dateString: string | null | undefined, formatStr: string = "MMM dd, yyyy"): string => {
  if (!dateString) return "Date TBD";

  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return "Invalid Date";
    return format(date, formatStr);
  } catch {
    return "Invalid Date";
  }
};

// Background Check Status Badge Component
const BackgroundCheckStatusBadge = ({ volunteer }: { volunteer: Volunteer }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'expired': return <AlertTriangle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      default: return <Shield className="h-3 w-3" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'expired': return 'Expired';
      case 'rejected': return 'Rejected';
      default: return 'Not Started';
    }
  };

  const isExpiringSoon = volunteer.backgroundCheckExpiry ?
    new Date(volunteer.backgroundCheckExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false;

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={`${getStatusColor(volunteer.backgroundCheckStatus)} border text-xs`}
      >
        <span className="flex items-center gap-1">
          {getStatusIcon(volunteer.backgroundCheckStatus)}
          {getStatusText(volunteer.backgroundCheckStatus)}
        </span>
      </Badge>

      {isExpiringSoon && volunteer.backgroundCheckStatus === 'approved' && (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Expires Soon
        </Badge>
      )}
    </div>
  );
};

interface Volunteer {
  id: number;
  userId: string;
  churchId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skills: string[];
  interests: string[];
  status: string;
  joinedAt: string;
  totalHours: number;
  backgroundCheck: boolean;
  orientation: boolean;
  backgroundCheckStatus?: 'pending' | 'approved' | 'rejected' | 'expired' | 'none';
  backgroundCheckExpiry?: string;
}

interface VolunteerOpportunity {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  volunteersNeeded: number;
  volunteersRegistered: number;
  status: string;
  priority: string;
  roleId: number;
  roleName?: string;
}


export default function VolunteerManagementSystem() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddVolunteer, setShowAddVolunteer] = useState(false);
  const [showAddOpportunity, setShowAddOpportunity] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // CSV export rate limiting for volunteers
  const [lastVolunteerExportTime, setLastVolunteerExportTime] = useState<number>(0);
  const [isExporting, setIsExporting] = useState(false);
  const EXPORT_COOLDOWN_MS = 5000; // 5 second cooldown between exports

  // Fetch volunteers
  const { data: volunteers = [] } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers"],
    enabled: true,
  });

  // Fetch volunteer opportunities
  const { data: opportunities = [], isLoading: loadingOpportunities } = useQuery<VolunteerOpportunity[]>({
    queryKey: ["/api/volunteer-opportunities"],
    enabled: true,
  });

  // Fetch volunteer stats
  const { data: stats = {} } = useQuery<{
    totalVolunteers?: number;
    activeOpportunities?: number;
    hoursThisMonth?: number;
    completionRate?: number;
    volunteerTrend?: number;
    opportunitiesTrend?: number;
    hoursTrend?: number;
    completionTrend?: number;
  }>({
    queryKey: ["/api/volunteer-stats"],
    enabled: true,
  });

  // Create volunteer mutation
  const createVolunteerMutation = useMutation({
    mutationFn: async (volunteerData: Omit<Volunteer, 'id' | 'joinedAt' | 'totalHours'>) => {
      return await apiRequest("POST", "/api/volunteers", volunteerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer-stats"] });
      setShowAddVolunteer(false);
      toast({
        title: "Success",
        description: "Volunteer added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add volunteer",
        variant: "destructive",
      });
    },
  });

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (opportunityData: Omit<VolunteerOpportunity, 'id' | 'volunteersRegistered'>) => {
      return await apiRequest("POST", "/api/volunteer-opportunities", opportunityData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer-opportunities"] });
      setShowAddOpportunity(false);
      toast({
        title: "Success",
        description: "Opportunity created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create opportunity",
        variant: "destructive",
      });
    },
  });

  // Update volunteer mutation
  const updateVolunteerMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<Volunteer>) => {
      return await apiRequest("PUT", `/api/volunteers/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer-stats"] });
      setSelectedVolunteer(null);
      toast({
        title: "Success",
        description: "Volunteer updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update volunteer",
        variant: "destructive",
      });
    },
  });

  // Delete volunteer mutation
  const deleteVolunteerMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/volunteers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer-stats"] });
      toast({
        title: "Success",
        description: "Volunteer removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove volunteer",
        variant: "destructive",
      });
    },
  });

  // Filter volunteers based on search and status
  const filteredVolunteers = volunteers.filter((volunteer: Volunteer) => {
    const matchesSearch = `${volunteer.firstName} ${volunteer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || volunteer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Volunteers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalVolunteers || 0}</p>
                {stats.volunteerTrend !== undefined && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    <span className={stats.volunteerTrend >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {stats.volunteerTrend >= 0 ? '+' : ''}{stats.volunteerTrend.toFixed(1)}%
                    </span> from last month
                  </p>
                )}
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Opportunities</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeOpportunities || 0}</p>
                {stats.opportunitiesTrend !== undefined && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    <span className={stats.opportunitiesTrend >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {stats.opportunitiesTrend >= 0 ? '+' : ''}{stats.opportunitiesTrend.toFixed(1)}%
                    </span> from last month
                  </p>
                )}
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <CalendarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Hours This Month</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.hoursThisMonth || 0}</p>
                {stats.hoursTrend !== undefined && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    <span className={stats.hoursTrend >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {stats.hoursTrend >= 0 ? '+' : ''}{stats.hoursTrend.toFixed(1)}%
                    </span> from last month
                  </p>
                )}
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.completionRate || 0}%</p>
                {stats.completionTrend !== undefined && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    <span className={stats.completionTrend >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {stats.completionTrend >= 0 ? '+' : ''}{stats.completionTrend.toFixed(1)}%
                    </span> from last month
                  </p>
                )}
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Volunteer Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {volunteers.slice(0, 5).map((volunteer: Volunteer) => (
                <div key={volunteer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{volunteer.firstName} {volunteer.lastName}</p>
                      <p className="text-sm text-gray-500">{volunteer.email}</p>
                    </div>
                  </div>
                  <Badge variant={volunteer.status === "active" ? "default" : "secondary"}>
                    {volunteer.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunities.slice(0, 5).map((opportunity: VolunteerOpportunity) => (
                <div key={opportunity.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{opportunity.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatSafeDate(opportunity.startDate)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    opportunity.priority === "high" ? "destructive" :
                    opportunity.priority === "medium" ? "default" : "secondary"
                  }>
                    {opportunity.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volunteers Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Volunteers</h2>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search volunteers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-volunteers"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40" data-testid="select-filter-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              data-testid="button-export-volunteers"
              disabled={isExporting}
              onClick={() => {
                const now = Date.now();
                const timeSinceLastExport = now - lastVolunteerExportTime;

                if (timeSinceLastExport < EXPORT_COOLDOWN_MS) {
                  const remainingSeconds = Math.ceil((EXPORT_COOLDOWN_MS - timeSinceLastExport) / 1000);
                  toast({
                    title: "Please wait",
                    description: `You can export again in ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}.`,
                    variant: "default",
                  });
                  return;
                }

                if (volunteers.length === 0) {
                  toast({
                    title: "No data to export",
                    description: "There are no volunteers to export.",
                    variant: "default",
                  });
                  return;
                }

                setIsExporting(true);
                setLastVolunteerExportTime(now);

                try {
                  // Create CSV content
                  const headers = ["First Name", "Last Name", "Email", "Phone", "Status", "Total Hours", "Joined At"];
                  const csvRows = [headers.join(",")];

                  volunteers.forEach((volunteer: Volunteer) => {
                    const row = [
                      `"${volunteer.firstName || ''}"`,
                      `"${volunteer.lastName || ''}"`,
                      `"${volunteer.email || ''}"`,
                      `"${volunteer.phone || ''}"`,
                      `"${volunteer.status || ''}"`,
                      volunteer.totalHours || 0,
                      `"${volunteer.joinedAt ? new Date(volunteer.joinedAt).toLocaleDateString() : ''}"`,
                    ];
                    csvRows.push(row.join(","));
                  });

                  const csvContent = csvRows.join("\n");
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `volunteers-export-${new Date().toISOString().split('T')[0]}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);

                  toast({
                    title: "Export successful",
                    description: `Exported ${volunteers.length} volunteers.`,
                  });
                } catch {
                  toast({
                    title: "Export failed",
                    description: "Failed to export volunteers. Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setIsExporting(false);
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
            <Button
              data-testid="button-add-volunteer"
              onClick={() => setShowAddVolunteer(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Volunteer
            </Button>
          </div>
        </div>

        {/* Volunteers Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Background Check</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVolunteers.map((volunteer: Volunteer) => (
                  <TableRow key={volunteer.id} data-testid={`row-volunteer-${volunteer.id}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{volunteer.firstName} {volunteer.lastName}</p>
                        <p className="text-sm text-gray-500">
                          Joined {formatSafeDate(volunteer.joinedAt, "MMM yyyy")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{volunteer.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {volunteer.skills?.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {volunteer.skills?.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{volunteer.skills.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {volunteer.totalHours || 0}h
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        volunteer.status === "active" ? "default" :
                        volunteer.status === "inactive" ? "secondary" : "outline"
                      }>
                        {volunteer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <BackgroundCheckStatusBadge volunteer={volunteer} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-actions-volunteer-${volunteer.id}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedVolunteer(volunteer)}
                            data-testid={`button-edit-volunteer-${volunteer.id}`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem data-testid={`button-email-volunteer-${volunteer.id}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${volunteer.firstName} ${volunteer.lastName} as a volunteer?`)) {
                                deleteVolunteerMutation.mutate(volunteer.id);
                              }
                            }}
                            data-testid={`button-delete-volunteer-${volunteer.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
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
      </div>
    </div>
  );

  const OpportunitiesTab = () => (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Volunteer Opportunities</h2>
          <p className="text-gray-600">Manage volunteer opportunities and scheduling</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/volunteer-opportunities"] });
              queryClient.refetchQueries({ queryKey: ["/api/volunteer-opportunities"] });
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddOpportunity(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Create Opportunity
          </Button>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((opportunity: VolunteerOpportunity) => (
          <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {opportunity.location || 'Location TBD'}
                  </CardDescription>
                </div>
                <Badge
                  variant={opportunity.status === 'active' ? 'default' : 'secondary'}
                >
                  {opportunity.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-3">{opportunity.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {opportunity.volunteersRegistered || 0}/{opportunity.volunteersNeeded || 1}
                </span>
                <span className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {formatSafeDate(opportunity.startDate)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="flex gap-1">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {opportunities.length === 0 && !loadingOpportunities && (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Opportunities Yet</h3>
          <p className="text-gray-500 mb-4">Create your first volunteer opportunity to get started</p>
          <Button onClick={() => setShowAddOpportunity(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Create Opportunity
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loadingOpportunities && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const AddVolunteerForm = () => {
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      skills: [] as string[],
      interests: [] as string[],
      address: "",
      orientation: false,
      userId: "0",
      churchId: 1,
      status: "active",
      backgroundCheck: false,
      backgroundCheckStatus: "pending" as const,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createVolunteerMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowAddVolunteer(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createVolunteerMutation.isPending}>
            {createVolunteerMutation.isPending ? "Adding..." : "Add Volunteer"}
          </Button>
        </div>
      </form>
    );
  };

  const AddOpportunityForm = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      location: "",
      startDate: "",
      endDate: "",
      volunteersNeeded: 1,
      status: "active",
      priority: "medium",
      roleId: 1,
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      createOpportunityMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Opportunity Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="volunteersNeeded">Volunteers Needed</Label>
            <Input
              id="volunteersNeeded"
              type="number"
              min="1"
              value={formData.volunteersNeeded}
              onChange={(e) => setFormData({ ...formData, volunteersNeeded: parseInt(e.target.value) || 1 })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowAddOpportunity(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createOpportunityMutation.isPending}>
            {createOpportunityMutation.isPending ? "Creating..." : "Create Opportunity"}
          </Button>
        </div>
      </form>
    );
  };

  // Hours Tracking Tab Component - Placeholder
  const HoursTrackingTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hours Tracking</CardTitle>
            <CardDescription>Track and manage volunteer service hours</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Hours tracking functionality coming soon</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Statistics Tab - Placeholder
  const StatisticsTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Statistics</CardTitle>
            <CardDescription>Analytics and reporting for volunteer activities</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Statistics and analytics coming soon</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Bulk Operations Tab - Placeholder
  const BulkOperationsTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bulk Operations</CardTitle>
            <CardDescription>Perform bulk actions on volunteers</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Bulk operations coming soon</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Edit Volunteer Form Component
  function EditVolunteerForm({
    volunteer,
    onSave,
    onCancel,
    isPending
  }: {
    volunteer: Volunteer;
    onSave: (updates: Partial<Volunteer>) => void;
    onCancel: () => void;
    isPending: boolean;
  }) {
    const [formData, setFormData] = useState({
      firstName: volunteer.firstName,
      lastName: volunteer.lastName,
      email: volunteer.email,
      phone: volunteer.phone || '',
      status: volunteer.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-firstName">First Name</Label>
            <Input
              id="edit-firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-lastName">Last Name</Label>
            <Input
              id="edit-lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="edit-email">Email</Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-phone">Phone</Label>
          <Input
            id="edit-phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Volunteer Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage volunteers, opportunities, and track service hours</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-muted p-1">
          <TabsTrigger value="dashboard" data-testid="tab-volunteer-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="opportunities" data-testid="tab-volunteer-opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="hours" data-testid="tab-volunteer-hours">Hours</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-volunteer-reports">Statistics</TabsTrigger>
          <TabsTrigger value="bulk" data-testid="tab-volunteer-bulk">Bulk Ops</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="opportunities">
          <OpportunitiesTab />
        </TabsContent>

        <TabsContent value="hours">
          <HoursTrackingTab />
        </TabsContent>

        <TabsContent value="reports">
          <StatisticsTab />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkOperationsTab />
        </TabsContent>
      </Tabs>

      {/* Add Volunteer Dialog */}
      <Dialog open={showAddVolunteer} onOpenChange={setShowAddVolunteer}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Volunteer</DialogTitle>
          </DialogHeader>
          <AddVolunteerForm />
        </DialogContent>
      </Dialog>

      {/* Add Opportunity Dialog */}
      <Dialog open={showAddOpportunity} onOpenChange={setShowAddOpportunity}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Volunteer Opportunity</DialogTitle>
          </DialogHeader>
          <AddOpportunityForm />
        </DialogContent>
      </Dialog>

      {/* Edit Volunteer Dialog */}
      <Dialog open={!!selectedVolunteer} onOpenChange={(open) => !open && setSelectedVolunteer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Volunteer</DialogTitle>
          </DialogHeader>
          {selectedVolunteer && (
            <EditVolunteerForm
              volunteer={selectedVolunteer}
              onSave={(updates) => {
                updateVolunteerMutation.mutate({ id: selectedVolunteer.id, ...updates });
              }}
              onCancel={() => setSelectedVolunteer(null)}
              isPending={updateVolunteerMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
