import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShieldCheck,
  UserCheck,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Eye,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChurch } from "@/hooks/useChurch";
import { backgroundChecksApi, membersApi, BackgroundCheck, BackgroundCheckStats } from "@/lib/api";
import { toast } from "sonner";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

export default function BackgroundChecks() {
  const { churchId } = useChurch();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Status filter for future use
  const [statusFilter] = useState<string>("all");
  void statusFilter;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheck | null>(null);

  // Form state for new check
  const [newCheck, setNewCheck] = useState({
    userId: "",
    checkType: "standard",
    roleAppliedFor: "",
    ministryArea: "",
    notes: "",
  });

  // Fetch background checks
  const { data: checksData, isLoading: checksLoading } = useQuery({
    queryKey: ["background-checks", churchId, statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "all" ? { status: statusFilter } : undefined;
      const response = await backgroundChecksApi.list(churchId!, params);
      return response.data;
    },
    enabled: !!churchId,
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ["background-check-stats", churchId],
    queryFn: async () => {
      const response = await backgroundChecksApi.getStats(churchId!);
      return response.data;
    },
    enabled: !!churchId,
  });

  // Fetch expiring checks
  const { data: expiringData } = useQuery({
    queryKey: ["background-checks-expiring", churchId],
    queryFn: async () => {
      const response = await backgroundChecksApi.getExpiring(churchId!, 60);
      return response.data;
    },
    enabled: !!churchId,
  });

  // Fetch members for selection
  const { data: membersData } = useQuery({
    queryKey: ["members-list", churchId],
    queryFn: async () => {
      const response = await membersApi.list(churchId!, { pageSize: 500 });
      return response.data;
    },
    enabled: !!churchId && isCreateDialogOpen,
  });

  // Create check mutation
  const createCheckMutation = useMutation({
    mutationFn: (data: typeof newCheck) => backgroundChecksApi.create(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["background-checks"] });
      queryClient.invalidateQueries({ queryKey: ["background-check-stats"] });
      setIsCreateDialogOpen(false);
      setNewCheck({ userId: "", checkType: "standard", roleAppliedFor: "", ministryArea: "", notes: "" });
      toast.success("Background check request created");
    },
    onError: () => {
      toast.error("Failed to create background check request");
    },
  });

  // Update check mutation
  const updateCheckMutation = useMutation({
    mutationFn: ({ checkId, data }: { checkId: string; data: Record<string, unknown> }) =>
      backgroundChecksApi.update(churchId!, checkId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["background-checks"] });
      queryClient.invalidateQueries({ queryKey: ["background-check-stats"] });
      toast.success("Background check updated");
    },
    onError: () => {
      toast.error("Failed to update background check");
    },
  });

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: (checkId: string) => backgroundChecksApi.sendReminder(churchId!, checkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["background-checks"] });
      toast.success("Reminder sent successfully");
    },
    onError: () => {
      toast.error("Failed to send reminder");
    },
  });

  // Delete check mutation
  const deleteCheckMutation = useMutation({
    mutationFn: (checkId: string) => backgroundChecksApi.delete(churchId!, checkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["background-checks"] });
      queryClient.invalidateQueries({ queryKey: ["background-check-stats"] });
      setIsDetailDialogOpen(false);
      toast.success("Background check deleted");
    },
    onError: () => {
      toast.error("Failed to delete background check");
    },
  });

  const stats: BackgroundCheckStats = statsData || {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cleared: 0,
    actionRequired: 0,
    expiringSoon: 0,
    expired: 0,
  };

  const checks = checksData || [];
  const expiringChecks = expiringData || [];

  // Filter checks based on search and tab
  const filteredChecks = checks.filter((check) => {
    const matchesSearch =
      !searchQuery ||
      check.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      check.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      check.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      check.roleAppliedFor?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && check.status === "pending") ||
      (activeTab === "in_progress" && check.status === "in_progress") ||
      (activeTab === "completed" && check.status === "completed") ||
      (activeTab === "action_required" && check.status === "action_required") ||
      (activeTab === "expiring" && check.expiresAt && differenceInDays(new Date(check.expiresAt), new Date()) <= 60);

    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string, result?: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Pending</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">In Progress</Badge>;
      case "completed":
        if (result === "clear") {
          return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Cleared</Badge>;
        } else if (result === "consider" || result === "adverse") {
          return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">Review Required</Badge>;
        }
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Completed</Badge>;
      case "action_required":
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">Action Required</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">Expired</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCheckTypeBadge = (checkType: string) => {
    switch (checkType) {
      case "basic":
        return <Badge variant="secondary">Basic</Badge>;
      case "standard":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Standard</Badge>;
      case "enhanced":
        return <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">Enhanced</Badge>;
      case "motor_vehicle":
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">Motor Vehicle</Badge>;
      default:
        return <Badge variant="secondary">{checkType}</Badge>;
    }
  };

  const handleViewCheck = async (check: BackgroundCheck) => {
    try {
      const response = await backgroundChecksApi.get(churchId!, check.id.toString());
      setSelectedCheck(response.data);
      setIsDetailDialogOpen(true);
    } catch {
      toast.error("Failed to load background check details");
    }
  };

  const handleMarkComplete = (checkId: number, result: string) => {
    updateCheckMutation.mutate({
      checkId: checkId.toString(),
      data: { status: "completed", result },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-500" />
            Background Checks
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage volunteer and staff screening for child safety compliance
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request Background Check</DialogTitle>
              <DialogDescription>
                Send a background check request to a volunteer or staff member.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Person</Label>
                <Select
                  value={newCheck.userId}
                  onValueChange={(value) => setNewCheck({ ...newCheck, userId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {membersData?.map((member: { id: string; firstName: string; lastName: string; email: string }) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Check Type</Label>
                <Select
                  value={newCheck.checkType}
                  onValueChange={(value) => setNewCheck({ ...newCheck, checkType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - Identity verification</SelectItem>
                    <SelectItem value="standard">Standard - Criminal + identity</SelectItem>
                    <SelectItem value="enhanced">Enhanced - Full screening</SelectItem>
                    <SelectItem value="motor_vehicle">Motor Vehicle - Driving record</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role Applied For</Label>
                <Input
                  placeholder="e.g., Children's Ministry Volunteer"
                  value={newCheck.roleAppliedFor}
                  onChange={(e) => setNewCheck({ ...newCheck, roleAppliedFor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ministry Area</Label>
                <Select
                  value={newCheck.ministryArea}
                  onValueChange={(value) => setNewCheck({ ...newCheck, ministryArea: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ministry area..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="children">Children's Ministry</SelectItem>
                    <SelectItem value="youth">Youth Ministry</SelectItem>
                    <SelectItem value="worship">Worship Team</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="general">General Volunteer</SelectItem>
                    <SelectItem value="staff">Staff Position</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Any additional notes..."
                  value={newCheck.notes}
                  onChange={(e) => setNewCheck({ ...newCheck, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createCheckMutation.mutate(newCheck)}
                disabled={!newCheck.userId || createCheckMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {createCheckMutation.isPending ? "Creating..." : "Send Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cleared</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.cleared}</p>
              </div>
              <UserCheck className="h-8 w-8 text-emerald-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Action Required</p>
                <p className="text-2xl font-bold text-red-600">{stats.actionRequired}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Alert */}
      {expiringChecks.length > 0 && (
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Expiring Within 60 Days
            </CardTitle>
            <CardDescription>
              These background checks need to be renewed soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {expiringChecks.slice(0, 5).map((check) => (
                <Badge
                  key={check.id}
                  variant="outline"
                  className="bg-orange-500/10 text-orange-700 border-orange-500/30 cursor-pointer hover:bg-orange-500/20"
                  onClick={() => handleViewCheck(check)}
                >
                  {check.user?.firstName} {check.user?.lastName} - expires{" "}
                  {check.expiresAt && formatDistanceToNow(new Date(check.expiresAt), { addSuffix: true })}
                </Badge>
              ))}
              {expiringChecks.length > 5 && (
                <Badge variant="outline" className="bg-muted">
                  +{expiringChecks.length - 5} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Background Checks</CardTitle>
              <CardDescription>View and manage all screening requests</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or role..."
                  className="pl-10 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({stats.inProgress})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
              <TabsTrigger value="action_required">Action Required ({stats.actionRequired})</TabsTrigger>
              <TabsTrigger value="expiring">Expiring ({stats.expiringSoon})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {checksLoading ? (
                <div className="flex items-center justify-center h-48">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredChecks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <ShieldCheck className="h-12 w-12 mb-4 opacity-50" />
                  <p>No background checks found</p>
                  {activeTab !== "all" && (
                    <Button
                      variant="link"
                      onClick={() => setActiveTab("all")}
                      className="mt-2"
                    >
                      View all checks
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Person</TableHead>
                      <TableHead>Role / Ministry</TableHead>
                      <TableHead>Check Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredChecks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={check.user?.profileImageUrl} />
                              <AvatarFallback>
                                {check.user?.firstName?.[0]}
                                {check.user?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {check.user?.firstName} {check.user?.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {check.user?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{check.roleAppliedFor || "Not specified"}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {check.ministryArea?.replace("_", " ") || "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getCheckTypeBadge(check.checkType)}</TableCell>
                        <TableCell>{getStatusBadge(check.status, check.result)}</TableCell>
                        <TableCell>
                          {check.requestedAt
                            ? format(new Date(check.requestedAt), "MMM d, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {check.expiresAt ? (
                            <div className="flex items-center gap-1">
                              <span
                                className={
                                  differenceInDays(new Date(check.expiresAt), new Date()) <= 60
                                    ? "text-orange-600"
                                    : ""
                                }
                              >
                                {format(new Date(check.expiresAt), "MMM d, yyyy")}
                              </span>
                              {differenceInDays(new Date(check.expiresAt), new Date()) <= 60 && (
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewCheck(check)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {check.status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() => sendReminderMutation.mutate(check.id.toString())}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Reminder
                                </DropdownMenuItem>
                              )}
                              {check.status === "in_progress" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleMarkComplete(check.id, "clear")}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                    Mark as Cleared
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleMarkComplete(check.id, "consider")}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                                    Mark for Review
                                  </DropdownMenuItem>
                                </>
                              )}
                              {check.reportUrl && (
                                <DropdownMenuItem asChild>
                                  <a href={check.reportUrl} target="_blank" rel="noopener noreferrer">
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Report
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this background check?")) {
                                    deleteCheckMutation.mutate(check.id.toString());
                                  }
                                }}
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Background Check Details</DialogTitle>
          </DialogHeader>
          {selectedCheck && (
            <div className="space-y-6">
              {/* Person Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedCheck.user?.profileImageUrl} />
                  <AvatarFallback className="text-lg">
                    {selectedCheck.user?.firstName?.[0]}
                    {selectedCheck.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedCheck.user?.firstName} {selectedCheck.user?.lastName}
                  </h3>
                  <p className="text-muted-foreground">{selectedCheck.user?.email}</p>
                  {selectedCheck.user?.phone && (
                    <p className="text-sm text-muted-foreground">{selectedCheck.user.phone}</p>
                  )}
                </div>
                <div className="ml-auto">{getStatusBadge(selectedCheck.status, selectedCheck.result)}</div>
              </div>

              {/* Check Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Check Type</Label>
                  <p className="font-medium capitalize">{selectedCheck.checkType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Role Applied For</Label>
                  <p className="font-medium">{selectedCheck.roleAppliedFor || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ministry Area</Label>
                  <p className="font-medium capitalize">
                    {selectedCheck.ministryArea?.replace("_", " ") || "Not specified"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Result</Label>
                  <p className="font-medium capitalize">{selectedCheck.result || "Pending"}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Requested</Label>
                  <p className="font-medium">
                    {selectedCheck.requestedAt
                      ? format(new Date(selectedCheck.requestedAt), "MMM d, yyyy")
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Completed</Label>
                  <p className="font-medium">
                    {selectedCheck.completedAt
                      ? format(new Date(selectedCheck.completedAt), "MMM d, yyyy")
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expires</Label>
                  <p
                    className={`font-medium ${
                      selectedCheck.expiresAt &&
                      differenceInDays(new Date(selectedCheck.expiresAt), new Date()) <= 60
                        ? "text-orange-600"
                        : ""
                    }`}
                  >
                    {selectedCheck.expiresAt
                      ? format(new Date(selectedCheck.expiresAt), "MMM d, yyyy")
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedCheck.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedCheck.notes}</p>
                </div>
              )}

              {/* Review Notes */}
              {selectedCheck.reviewNotes && (
                <div>
                  <Label className="text-muted-foreground">Review Notes</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedCheck.reviewNotes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedCheck.status === "pending" && (
                  <Button
                    variant="outline"
                    onClick={() => sendReminderMutation.mutate(selectedCheck.id.toString())}
                    disabled={sendReminderMutation.isPending}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                )}
                {selectedCheck.status === "in_progress" && (
                  <>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleMarkComplete(selectedCheck.id, "clear")}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Cleared
                    </Button>
                    <Button
                      variant="outline"
                      className="text-orange-600 border-orange-600"
                      onClick={() => handleMarkComplete(selectedCheck.id, "consider")}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Mark for Review
                    </Button>
                  </>
                )}
                {selectedCheck.reportUrl && (
                  <Button variant="outline" asChild>
                    <a href={selectedCheck.reportUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      View Report
                    </a>
                  </Button>
                )}
                <Button
                  variant="destructive"
                  className="ml-auto"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this background check?")) {
                      deleteCheckMutation.mutate(selectedCheck.id.toString());
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
