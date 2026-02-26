import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Visitor {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  firstVisitDate: string;
  lastVisitDate?: string;
  visitCount: number;
  status: string;
  source?: string;
  assignedTo?: string;
  assignedStaffName?: string;
  nextFollowUpDate?: string;
  interestedIn?: string[];
  convertedToMember: boolean;
}

interface VisitorStats {
  statusBreakdown: Record<string, number>;
  newThisMonth: number;
  converted: number;
  pendingFollowUps: number;
}

interface FollowUp {
  id: number;
  contactMethod: string;
  contactDate: string;
  outcome?: string;
  notes?: string;
  nextAction?: string;
  nextActionDate?: string;
  staffName?: string;
}

export default function Visitors() {
  const { churchId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [newVisitor, setNewVisitor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "",
    interestedIn: [] as string[],
    notes: "",
  });

  const [followUpData, setFollowUpData] = useState({
    contactMethod: "call",
    contactDate: new Date().toISOString().split("T")[0],
    outcome: "",
    notes: "",
    nextAction: "",
    nextActionDate: "",
  });

  // Fetch visitors
  const { data: visitorsData, isLoading: loadingVisitors } = useQuery({
    queryKey: ["visitors", churchId, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      return api.get<{ data: Visitor[]; pagination: any }>(
        `/church/${churchId}/visitors?${params.toString()}`
      );
    },
    enabled: !!churchId,
  });

  // Fetch stats
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ["visitor-stats", churchId],
    queryFn: () => api.get<{ data: VisitorStats }>(`/church/${churchId}/visitors/stats`),
    enabled: !!churchId,
  });

  // Fetch follow-ups for selected visitor
  const { data: followUpsData, isLoading: loadingFollowUps } = useQuery({
    queryKey: ["visitor-followups", selectedVisitor?.id],
    queryFn: () =>
      api.get<{ data: FollowUp[] }>(
        `/church/${churchId}/visitors/${selectedVisitor?.id}/followups`
      ),
    enabled: !!selectedVisitor && isDetailsOpen,
  });

  // Add visitor mutation
  const addVisitor = useMutation({
    mutationFn: (data: typeof newVisitor) => api.post(`/church/${churchId}/visitors`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      queryClient.invalidateQueries({ queryKey: ["visitor-stats"] });
      setIsAddOpen(false);
      setNewVisitor({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        source: "",
        interestedIn: [],
        notes: "",
      });
      toast({ title: "Visitor added", description: "New visitor has been recorded." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add visitor.", variant: "destructive" });
    },
  });

  // Record follow-up mutation
  const recordFollowUp = useMutation({
    mutationFn: (data: typeof followUpData) =>
      api.post(`/church/${churchId}/visitors/${selectedVisitor?.id}/followup`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      queryClient.invalidateQueries({ queryKey: ["visitor-stats"] });
      queryClient.invalidateQueries({ queryKey: ["visitor-followups"] });
      setIsFollowUpOpen(false);
      setFollowUpData({
        contactMethod: "call",
        contactDate: new Date().toISOString().split("T")[0],
        outcome: "",
        notes: "",
        nextAction: "",
        nextActionDate: "",
      });
      toast({ title: "Follow-up recorded", description: "Contact has been logged." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record follow-up.", variant: "destructive" });
    },
  });

  // Update visitor mutation
  const updateVisitor = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Visitor> }) =>
      api.patch(`/church/${churchId}/visitors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      queryClient.invalidateQueries({ queryKey: ["visitor-stats"] });
      toast({ title: "Visitor updated", description: "Changes have been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update visitor.", variant: "destructive" });
    },
  });

  const visitors = visitorsData?.data || [];
  const stats = statsData?.data;
  const followUps = followUpsData?.data || [];

  const filteredVisitors = visitors.filter((v) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.firstName.toLowerCase().includes(query) ||
      v.lastName.toLowerCase().includes(query) ||
      v.email?.toLowerCase().includes(query) ||
      v.phone?.includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      follow_up: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      converted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    };
    return colors[status] || colors.new;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Visitor Follow-up</h1>
          <p className="text-muted-foreground mt-1">
            Track and connect with first-time visitors
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Visitor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Visitor</DialogTitle>
              <DialogDescription>Record a new first-time visitor.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={newVisitor.firstName}
                    onChange={(e) => setNewVisitor({ ...newVisitor, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={newVisitor.lastName}
                    onChange={(e) => setNewVisitor({ ...newVisitor, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newVisitor.email}
                  onChange={(e) => setNewVisitor({ ...newVisitor, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={newVisitor.phone}
                  onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>How did they hear about us?</Label>
                <Select
                  value={newVisitor.source}
                  onValueChange={(v) => setNewVisitor({ ...newVisitor, source: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friend">Friend/Family</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="drive_by">Drove By</SelectItem>
                    <SelectItem value="event">Special Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={newVisitor.notes}
                  onChange={(e) => setNewVisitor({ ...newVisitor, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => addVisitor.mutate(newVisitor)}
                disabled={!newVisitor.firstName || !newVisitor.lastName}
              >
                Add Visitor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New This Month
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.newThisMonth || 0}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">First-time visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Follow-ups
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">
                {stats?.pendingFollowUps || 0}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">Need contact</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Converted to Members
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats?.converted || 0}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">Joined church</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awaiting Contact
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.statusBreakdown?.new || 0}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">Not yet contacted</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search visitors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visitors</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="follow_up">Follow-up Needed</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Visitors List */}
      <Card>
        <CardHeader>
          <CardTitle>Visitors</CardTitle>
          <CardDescription>
            {filteredVisitors.length} visitor{filteredVisitors.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingVisitors ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredVisitors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No visitors found</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddOpen(true)}>
                Add First Visitor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVisitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-semibold">
                      {visitor.firstName[0]}
                      {visitor.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {visitor.firstName} {visitor.lastName}
                        </p>
                        <Badge className={getStatusColor(visitor.status)}>{visitor.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {visitor.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {visitor.email}
                          </span>
                        )}
                        {visitor.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {visitor.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          First visit: {formatDate(visitor.firstVisitDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVisitor(visitor);
                        setIsFollowUpOpen(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Follow-up
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedVisitor(visitor);
                            setIsDetailsOpen(true);
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!visitor.convertedToMember && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateVisitor.mutate({
                                id: visitor.id,
                                data: { convertedToMember: true, status: "converted" },
                              })
                            }
                          >
                            Mark as Converted
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            updateVisitor.mutate({
                              id: visitor.id,
                              data: { status: "inactive" },
                            })
                          }
                        >
                          Mark as Inactive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow-up Dialog */}
      <Dialog open={isFollowUpOpen} onOpenChange={setIsFollowUpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Follow-up</DialogTitle>
            <DialogDescription>
              Log contact with {selectedVisitor?.firstName} {selectedVisitor?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Method</Label>
                <Select
                  value={followUpData.contactMethod}
                  onValueChange={(v) => setFollowUpData({ ...followUpData, contactMethod: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="text">Text Message</SelectItem>
                    <SelectItem value="visit">In-Person Visit</SelectItem>
                    <SelectItem value="mail">Mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={followUpData.contactDate}
                  onChange={(e) => setFollowUpData({ ...followUpData, contactDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Outcome</Label>
              <Select
                value={followUpData.outcome}
                onValueChange={(v) => setFollowUpData({ ...followUpData, outcome: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="connected">Connected - Good conversation</SelectItem>
                  <SelectItem value="left_message">Left Message</SelectItem>
                  <SelectItem value="no_answer">No Answer</SelectItem>
                  <SelectItem value="scheduled_visit">Scheduled to visit again</SelectItem>
                  <SelectItem value="declined">Not interested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={followUpData.notes}
                onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                placeholder="Details about the conversation..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Next Action</Label>
                <Input
                  value={followUpData.nextAction}
                  onChange={(e) => setFollowUpData({ ...followUpData, nextAction: e.target.value })}
                  placeholder="e.g., Call again"
                />
              </div>
              <div className="space-y-2">
                <Label>Next Follow-up Date</Label>
                <Input
                  type="date"
                  value={followUpData.nextActionDate}
                  onChange={(e) => setFollowUpData({ ...followUpData, nextActionDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFollowUpOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => recordFollowUp.mutate(followUpData)}>Save Follow-up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedVisitor?.firstName} {selectedVisitor?.lastName}
            </DialogTitle>
            <DialogDescription>Visitor details and follow-up history</DialogDescription>
          </DialogHeader>
          {selectedVisitor && (
            <Tabs defaultValue="info" className="py-4">
              <TabsList>
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="history">Follow-up History</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedVisitor.email || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p>{selectedVisitor.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">First Visit</Label>
                    <p>{formatDate(selectedVisitor.firstVisitDate)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Visits</Label>
                    <p>{selectedVisitor.visitCount}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Source</Label>
                    <p className="capitalize">{selectedVisitor.source?.replace("_", " ") || "Unknown"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge className={getStatusColor(selectedVisitor.status)}>
                      {selectedVisitor.status}
                    </Badge>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                {loadingFollowUps ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : followUps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No follow-up history yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {followUps.map((fu) => (
                      <div key={fu.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {fu.contactMethod}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(fu.contactDate)}
                            </span>
                          </div>
                          {fu.outcome && (
                            <Badge
                              variant={fu.outcome === "connected" ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {fu.outcome.replace("_", " ")}
                            </Badge>
                          )}
                        </div>
                        {fu.notes && <p className="mt-2 text-sm">{fu.notes}</p>}
                        {fu.nextAction && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Next: {fu.nextAction}
                            {fu.nextActionDate && ` (${formatDate(fu.nextActionDate)})`}
                          </p>
                        )}
                        {fu.staffName && (
                          <p className="mt-1 text-xs text-muted-foreground">By: {fu.staffName}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
