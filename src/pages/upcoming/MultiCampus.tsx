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
import { useToast } from "@/hooks/use-toast";
import { useChurch } from "@/hooks/use-church";
import { campusApi, Campus, membersApi } from "@/lib/api";
import {
  Building2,
  MapPin,
  BarChart3,
  Settings,
  Users,
  Share2,
  Globe,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Clock,
  UserPlus,
  Loader2,
  Eye,
} from "lucide-react";

export default function MultiCampus() {
  const { church } = useChurch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const churchId = church?.id?.toString() || "";

  const [activeTab, setActiveTab] = useState("campuses");
  const [campusDialogOpen, setCampusDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  const [selectedCampusId, setSelectedCampusId] = useState<string>("");
  const [viewingCampusId, setViewingCampusId] = useState<string>("");

  // Campus form state
  const [campusForm, setCampusForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phoneNumber: "",
    website: "",
    email: "",
    campusAdminName: "",
    campusAdminEmail: "",
    campusAdminMobile: "",
    capacity: "",
    timeZone: "America/New_York",
  });

  // Member assignment form state
  const [memberForm, setMemberForm] = useState({
    userId: "",
    isPrimaryCampus: false,
    notes: "",
  });

  // Queries
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["campus-stats", churchId],
    queryFn: () => campusApi.getStats(churchId),
    enabled: !!churchId,
  });

  const { data: campuses = [], isLoading: loadingCampuses } = useQuery({
    queryKey: ["campuses", churchId],
    queryFn: () => campusApi.listCampuses(churchId),
    enabled: !!churchId,
  });

  const { data: campusMembers = [], isLoading: loadingCampusMembers } = useQuery({
    queryKey: ["campus-members", churchId, viewingCampusId],
    queryFn: () => campusApi.listCampusMembers(churchId, viewingCampusId),
    enabled: !!churchId && !!viewingCampusId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members-simple", churchId],
    queryFn: async () => {
      const result = await membersApi.getMembers(churchId, { pageSize: 500 });
      return result.data || [];
    },
    enabled: !!churchId,
  });

  // Mutations
  const createCampusMutation = useMutation({
    mutationFn: (data: Partial<Campus>) => campusApi.createCampus(churchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses", churchId] });
      queryClient.invalidateQueries({ queryKey: ["campus-stats", churchId] });
      toast({ title: "Campus created successfully" });
      setCampusDialogOpen(false);
      resetCampusForm();
    },
    onError: () => {
      toast({ title: "Failed to create campus", variant: "destructive" });
    },
  });

  const updateCampusMutation = useMutation({
    mutationFn: ({ campusId, data }: { campusId: string; data: Partial<Campus> }) =>
      campusApi.updateCampus(churchId, campusId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses", churchId] });
      queryClient.invalidateQueries({ queryKey: ["campus-stats", churchId] });
      toast({ title: "Campus updated successfully" });
      setCampusDialogOpen(false);
      setEditingCampus(null);
      resetCampusForm();
    },
    onError: () => {
      toast({ title: "Failed to update campus", variant: "destructive" });
    },
  });

  const deleteCampusMutation = useMutation({
    mutationFn: (campusId: string) => campusApi.deleteCampus(churchId, campusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses", churchId] });
      queryClient.invalidateQueries({ queryKey: ["campus-stats", churchId] });
      toast({ title: "Campus deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete campus", variant: "destructive" });
    },
  });

  const assignMemberMutation = useMutation({
    mutationFn: (data: { userId: string; isPrimaryCampus?: boolean; notes?: string }) =>
      campusApi.assignMemberToCampus(churchId, selectedCampusId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campus-members", churchId, selectedCampusId] });
      queryClient.invalidateQueries({ queryKey: ["campus-stats", churchId] });
      toast({ title: "Member assigned to campus" });
      setMemberDialogOpen(false);
      resetMemberForm();
    },
    onError: () => {
      toast({ title: "Failed to assign member", variant: "destructive" });
    },
  });

  const resetCampusForm = () => {
    setCampusForm({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      phoneNumber: "",
      website: "",
      email: "",
      campusAdminName: "",
      campusAdminEmail: "",
      campusAdminMobile: "",
      capacity: "",
      timeZone: "America/New_York",
    });
  };

  const resetMemberForm = () => {
    setMemberForm({
      userId: "",
      isPrimaryCampus: false,
      notes: "",
    });
  };

  const handleEditCampus = (campus: Campus) => {
    setEditingCampus(campus);
    setCampusForm({
      name: campus.name,
      address: campus.address || "",
      city: campus.city || "",
      state: campus.state || "",
      zipCode: campus.zipCode || "",
      country: campus.country || "United States",
      phoneNumber: campus.phoneNumber || "",
      website: campus.website || "",
      email: campus.email || "",
      campusAdminName: campus.campusAdminName || "",
      campusAdminEmail: campus.campusAdminEmail || "",
      campusAdminMobile: campus.campusAdminMobile || "",
      capacity: campus.capacity?.toString() || "",
      timeZone: campus.timeZone || "America/New_York",
    });
    setCampusDialogOpen(true);
  };

  const handleSaveCampus = () => {
    const data: Partial<Campus> = {
      name: campusForm.name,
      address: campusForm.address || undefined,
      city: campusForm.city || undefined,
      state: campusForm.state || undefined,
      zipCode: campusForm.zipCode || undefined,
      country: campusForm.country,
      phoneNumber: campusForm.phoneNumber || undefined,
      website: campusForm.website || undefined,
      email: campusForm.email || undefined,
      campusAdminName: campusForm.campusAdminName || undefined,
      campusAdminEmail: campusForm.campusAdminEmail || undefined,
      campusAdminMobile: campusForm.campusAdminMobile || undefined,
      capacity: campusForm.capacity ? parseInt(campusForm.capacity) : undefined,
      timeZone: campusForm.timeZone,
    };

    if (editingCampus) {
      updateCampusMutation.mutate({ campusId: editingCampus.id.toString(), data });
    } else {
      createCampusMutation.mutate(data);
    }
  };

  const handleAssignMember = () => {
    assignMemberMutation.mutate({
      userId: memberForm.userId,
      isPrimaryCampus: memberForm.isPrimaryCampus,
      notes: memberForm.notes || undefined,
    });
  };

  if (!churchId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please select a church to manage campuses.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-500" />
            Multi-Campus Support
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage multiple church locations from one platform
          </p>
        </div>
        <Dialog open={campusDialogOpen} onOpenChange={(open) => {
          setCampusDialogOpen(open);
          if (!open) {
            setEditingCampus(null);
            resetCampusForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Campus
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCampus ? "Edit Campus" : "Add New Campus"}</DialogTitle>
              <DialogDescription>
                {editingCampus ? "Update campus information." : "Create a new campus location."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label>Campus Name *</Label>
                <Input
                  value={campusForm.name}
                  onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })}
                  placeholder="e.g., Downtown Campus"
                />
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <Input
                  value={campusForm.address}
                  onChange={(e) => setCampusForm({ ...campusForm, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>City</Label>
                  <Input
                    value={campusForm.city}
                    onChange={(e) => setCampusForm({ ...campusForm, city: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>State</Label>
                  <Input
                    value={campusForm.state}
                    onChange={(e) => setCampusForm({ ...campusForm, state: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Zip Code</Label>
                  <Input
                    value={campusForm.zipCode}
                    onChange={(e) => setCampusForm({ ...campusForm, zipCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input
                    value={campusForm.phoneNumber}
                    onChange={(e) => setCampusForm({ ...campusForm, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={campusForm.email}
                    onChange={(e) => setCampusForm({ ...campusForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Website</Label>
                <Input
                  value={campusForm.website}
                  onChange={(e) => setCampusForm({ ...campusForm, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={campusForm.capacity}
                    onChange={(e) => setCampusForm({ ...campusForm, capacity: e.target.value })}
                    placeholder="Seating capacity"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Time Zone</Label>
                  <Select
                    value={campusForm.timeZone}
                    onValueChange={(v) => setCampusForm({ ...campusForm, timeZone: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern</SelectItem>
                      <SelectItem value="America/Chicago">Central</SelectItem>
                      <SelectItem value="America/Denver">Mountain</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="border-t pt-4 mt-2">
                <h4 className="font-medium mb-4">Campus Administrator</h4>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Admin Name</Label>
                    <Input
                      value={campusForm.campusAdminName}
                      onChange={(e) => setCampusForm({ ...campusForm, campusAdminName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Admin Email</Label>
                      <Input
                        type="email"
                        value={campusForm.campusAdminEmail}
                        onChange={(e) => setCampusForm({ ...campusForm, campusAdminEmail: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Admin Phone</Label>
                      <Input
                        value={campusForm.campusAdminMobile}
                        onChange={(e) => setCampusForm({ ...campusForm, campusAdminMobile: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCampusDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveCampus}
                disabled={createCampusMutation.isPending || updateCampusMutation.isPending || !campusForm.name}
              >
                {(createCampusMutation.isPending || updateCampusMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingCampus ? "Update" : "Create"} Campus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campuses</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : stats?.totalCampuses || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : stats?.totalMembers || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Share2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : stats?.totalStaff || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <BarChart3 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : stats?.totalCapacity?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campuses">Campuses</TabsTrigger>
          <TabsTrigger value="members">Members by Campus</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="campuses" className="space-y-4">
          {loadingCampuses ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : campuses.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Campuses Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first campus location to get started.
                  </p>
                  <Button onClick={() => setCampusDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Campus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campuses.map((campus) => (
                <Card key={campus.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{campus.name}</CardTitle>
                        {campus.city && campus.state && (
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {campus.city}, {campus.state}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant={campus.isActive ? "default" : "secondary"}>
                        {campus.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {campus.address && (
                      <p className="text-sm text-muted-foreground mb-4">{campus.address}</p>
                    )}
                    <div className="space-y-2 mb-4">
                      {campus.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {campus.phoneNumber}
                        </div>
                      )}
                      {campus.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {campus.email}
                        </div>
                      )}
                      {campus.capacity && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          Capacity: {campus.capacity.toLocaleString()}
                        </div>
                      )}
                      {campus.timeZone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {campus.timeZone.replace("America/", "").replace("_", " ")}
                        </div>
                      )}
                    </div>
                    {campus.campusAdminName && (
                      <div className="p-3 rounded-lg bg-muted/50 mb-4">
                        <div className="text-xs text-muted-foreground mb-1">Campus Admin</div>
                        <div className="font-medium text-sm">{campus.campusAdminName}</div>
                        {campus.campusAdminEmail && (
                          <div className="text-xs text-muted-foreground">{campus.campusAdminEmail}</div>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditCampus(campus)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewingCampusId(campus.id.toString());
                          setActiveTab("members");
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this campus?")) {
                            deleteCampusMutation.mutate(campus.id.toString());
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <Select value={viewingCampusId} onValueChange={setViewingCampusId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a campus" />
              </SelectTrigger>
              <SelectContent>
                {campuses.map((campus) => (
                  <SelectItem key={campus.id} value={campus.id.toString()}>
                    {campus.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {viewingCampusId && (
              <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedCampusId(viewingCampusId)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Member to Campus</DialogTitle>
                    <DialogDescription>
                      Add a member to this campus location.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Member</Label>
                      <Select
                        value={memberForm.userId}
                        onValueChange={(v) => setMemberForm({ ...memberForm, userId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((m: { id: string; firstName: string; lastName: string; email: string }) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.firstName} {m.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPrimary"
                        checked={memberForm.isPrimaryCampus}
                        onChange={(e) => setMemberForm({ ...memberForm, isPrimaryCampus: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="isPrimary">Set as Primary Campus</Label>
                    </div>
                    <div className="grid gap-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={memberForm.notes}
                        onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })}
                        placeholder="Optional notes..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMemberDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAssignMember}
                      disabled={assignMemberMutation.isPending || !memberForm.userId}
                    >
                      {assignMemberMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Assign
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {!viewingCampusId ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Campus</h3>
                  <p className="text-muted-foreground">
                    Choose a campus to view its members.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : loadingCampusMembers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : campusMembers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Members Assigned</h3>
                  <p className="text-muted-foreground mb-4">
                    Assign members to this campus to track attendance.
                  </p>
                  <Button onClick={() => {
                    setSelectedCampusId(viewingCampusId);
                    setMemberDialogOpen(true);
                  }}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign First Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Campus Members</CardTitle>
                <CardDescription>
                  {campusMembers.length} members assigned to this campus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Primary</TableHead>
                      <TableHead>Assigned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campusMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {member.user.profileImageUrl ? (
                              <img
                                src={member.user.profileImageUrl}
                                alt=""
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                {member.user.firstName[0]}
                              </div>
                            )}
                            <div>
                              <div className="font-medium">
                                {member.user.firstName} {member.user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {member.user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.membershipStatus === "active" ? "default" : "secondary"}>
                            {member.membershipStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.isPrimaryCampus ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Primary
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(member.assignedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campus Breakdown</CardTitle>
              <CardDescription>Member distribution across campuses</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : stats?.campusBreakdown?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No data available
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.campusBreakdown?.map((campus) => {
                    const percentage = stats.totalMembers > 0
                      ? Math.round((campus.memberCount / stats.totalMembers) * 100)
                      : 0;
                    return (
                      <div key={campus.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{campus.name}</span>
                          <span className="text-muted-foreground">
                            {campus.memberCount} members ({percentage}%)
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Benefits</CardTitle>
                <CardDescription>Why multi-campus management matters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                    <Globe className="h-5 w-5" />
                    Centralized Control
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manage all campuses from a single dashboard with unified reporting
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                    <MapPin className="h-5 w-5" />
                    Location Flexibility
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Each campus maintains its unique identity while sharing resources
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 text-purple-600 font-medium mb-2">
                    <Users className="h-5 w-5" />
                    Seamless Collaboration
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Staff and volunteers can serve across multiple locations easily
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common campus management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setCampusDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Campus
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab("members")}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Members to Campus
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab("campuses")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Campus Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
