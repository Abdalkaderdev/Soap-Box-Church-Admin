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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useChurch } from "@/hooks/use-church";
import { facilityApi } from "@/lib/api";
import type { Facility } from "@/lib/api";
import {
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Users,
  Projector,
  Music,
  Wifi,
  Car,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

type FacilityType = 'sanctuary' | 'fellowship_hall' | 'classroom' | 'gym' | 'kitchen' | 'office' | 'outdoor';

const facilityTypeLabels: Record<FacilityType, string> = {
  sanctuary: "Sanctuary",
  fellowship_hall: "Fellowship Hall",
  classroom: "Classroom",
  gym: "Gymnasium",
  kitchen: "Kitchen",
  office: "Office",
  outdoor: "Outdoor Space",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  denied: "bg-red-500",
  cancelled: "bg-gray-500",
};

export default function FacilityBooking() {
  const { church } = useChurch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const churchId = church?.id?.toString() || "";

  const [activeTab, setActiveTab] = useState("facilities");
  const [facilityDialogOpen, setFacilityDialogOpen] = useState(false);
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  // Selected facility for future use
  const [selectedFacilityId] = useState<string>("");
  void selectedFacilityId;

  // Form states for facility
  const [facilityForm, setFacilityForm] = useState({
    name: "",
    facilityType: "classroom" as FacilityType,
    description: "",
    capacity: "",
    hasAV: false,
    hasWifi: false,
    hasSoundSystem: false,
    hasParking: false,
    hourlyRate: "",
    rules: "",
  });

  // Form states for reservation
  const [reservationForm, setReservationForm] = useState({
    facilityId: "",
    eventName: "",
    eventDescription: "",
    startTime: "",
    endTime: "",
    setupTime: "",
    cleanupTime: "",
    attendeeCount: "",
    needsAV: false,
    needsSoundSystem: false,
    specialRequests: "",
  });

  // Queries
  const { data: facilities = [], isLoading: loadingFacilities } = useQuery({
    queryKey: ["facilities", churchId],
    queryFn: () => facilityApi.listFacilities(churchId),
    enabled: !!churchId,
  });

  const { data: reservationsResponse, isLoading: loadingReservations } = useQuery({
    queryKey: ["reservations", churchId],
    queryFn: () => facilityApi.listReservations(churchId),
    enabled: !!churchId,
  });
  const reservations = reservationsResponse?.data || [];

  // Mutations for facilities
  const createFacilityMutation = useMutation({
    mutationFn: (data: Partial<Facility>) => facilityApi.createFacility(churchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities", churchId] });
      toast({ title: "Facility created successfully" });
      setFacilityDialogOpen(false);
      resetFacilityForm();
    },
    onError: () => {
      toast({ title: "Failed to create facility", variant: "destructive" });
    },
  });

  const updateFacilityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Facility> }) =>
      facilityApi.updateFacility(churchId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities", churchId] });
      toast({ title: "Facility updated successfully" });
      setFacilityDialogOpen(false);
      setEditingFacility(null);
      resetFacilityForm();
    },
    onError: () => {
      toast({ title: "Failed to update facility", variant: "destructive" });
    },
  });

  const deleteFacilityMutation = useMutation({
    mutationFn: (id: string) => facilityApi.deleteFacility(churchId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities", churchId] });
      toast({ title: "Facility deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete facility", variant: "destructive" });
    },
  });

  // Mutations for reservations
  const createReservationMutation = useMutation({
    mutationFn: (data: {
      facilityId: number;
      eventName: string;
      eventType?: string;
      startDate: string;
      endDate: string;
      setupTime?: number;
      teardownTime?: number;
      expectedAttendance?: number;
      avNeeds?: string;
      specialInstructions?: string;
    }) =>
      facilityApi.createReservation(churchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations", churchId] });
      toast({ title: "Reservation request submitted" });
      setReservationDialogOpen(false);
      resetReservationForm();
    },
    onError: () => {
      toast({ title: "Failed to create reservation", variant: "destructive" });
    },
  });

  const approveReservationMutation = useMutation({
    mutationFn: (id: string) => facilityApi.approveReservation(churchId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations", churchId] });
      toast({ title: "Reservation approved" });
    },
    onError: () => {
      toast({ title: "Failed to approve reservation", variant: "destructive" });
    },
  });

  const denyReservationMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      facilityApi.denyReservation(churchId, id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations", churchId] });
      toast({ title: "Reservation denied" });
    },
    onError: () => {
      toast({ title: "Failed to deny reservation", variant: "destructive" });
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: (id: string) => facilityApi.cancelReservation(churchId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations", churchId] });
      toast({ title: "Reservation cancelled" });
    },
    onError: () => {
      toast({ title: "Failed to cancel reservation", variant: "destructive" });
    },
  });

  const resetFacilityForm = () => {
    setFacilityForm({
      name: "",
      facilityType: "classroom",
      description: "",
      capacity: "",
      hasAV: false,
      hasWifi: false,
      hasSoundSystem: false,
      hasParking: false,
      hourlyRate: "",
      rules: "",
    });
  };

  const resetReservationForm = () => {
    setReservationForm({
      facilityId: "",
      eventName: "",
      eventDescription: "",
      startTime: "",
      endTime: "",
      setupTime: "",
      cleanupTime: "",
      attendeeCount: "",
      needsAV: false,
      needsSoundSystem: false,
      specialRequests: "",
    });
  };

  const handleEditFacility = (facility: Facility) => {
    setEditingFacility(facility);
    setFacilityForm({
      name: facility.name,
      facilityType: facility.facilityType,
      description: facility.description || "",
      capacity: facility.capacity?.toString() || "",
      hasAV: facility.hasAV || false,
      hasWifi: facility.hasWifi || false,
      hasSoundSystem: facility.hasSoundSystem || false,
      hasParking: facility.hasParking || false,
      hourlyRate: facility.hourlyRate?.toString() || "",
      rules: facility.rules || "",
    });
    setFacilityDialogOpen(true);
  };

  const handleSaveFacility = () => {
    const data: Partial<Facility> = {
      name: facilityForm.name,
      facilityType: facilityForm.facilityType,
      description: facilityForm.description || undefined,
      capacity: facilityForm.capacity ? parseInt(facilityForm.capacity) : undefined,
      hasAV: facilityForm.hasAV,
      hasWifi: facilityForm.hasWifi,
      hasSoundSystem: facilityForm.hasSoundSystem,
      hasParking: facilityForm.hasParking,
      hourlyRate: facilityForm.hourlyRate || undefined,
      rules: facilityForm.rules || undefined,
    };

    if (editingFacility) {
      updateFacilityMutation.mutate({ id: editingFacility.id.toString(), data });
    } else {
      createFacilityMutation.mutate(data);
    }
  };

  const handleCreateReservation = () => {
    createReservationMutation.mutate({
      facilityId: parseInt(reservationForm.facilityId),
      eventName: reservationForm.eventName,
      eventType: 'meeting' as const,
      startDate: reservationForm.startTime,
      endDate: reservationForm.endTime,
      setupTime: reservationForm.setupTime ? parseInt(reservationForm.setupTime) : undefined,
      teardownTime: reservationForm.cleanupTime ? parseInt(reservationForm.cleanupTime) : undefined,
      expectedAttendance: reservationForm.attendeeCount ? parseInt(reservationForm.attendeeCount) : undefined,
      avNeeds: reservationForm.needsAV ? "AV required" : undefined,
      specialInstructions: reservationForm.specialRequests || undefined,
    });
  };

  const pendingReservations = reservations.filter((r) => r.reservation.status === "pending");
  const approvedReservations = reservations.filter((r) => r.reservation.status === "approved");

  if (!churchId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please select a church to manage facilities.</p>
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
            <Building className="h-8 w-8 text-indigo-500" />
            Facility Booking
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage room reservations and equipment scheduling
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={reservationDialogOpen} onOpenChange={setReservationDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                New Reservation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Reservation</DialogTitle>
                <DialogDescription>
                  Request a facility reservation for your event.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Facility</Label>
                  <Select
                    value={reservationForm.facilityId}
                    onValueChange={(v) => setReservationForm({ ...reservationForm, facilityId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map((f) => (
                        <SelectItem key={f.id} value={f.id.toString()}>
                          {f.name} (Cap: {f.capacity || "N/A"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Event Name</Label>
                  <Input
                    value={reservationForm.eventName}
                    onChange={(e) => setReservationForm({ ...reservationForm, eventName: e.target.value })}
                    placeholder="e.g., Youth Group Meeting"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Event Description</Label>
                  <Textarea
                    value={reservationForm.eventDescription}
                    onChange={(e) => setReservationForm({ ...reservationForm, eventDescription: e.target.value })}
                    placeholder="Describe your event..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Time</Label>
                    <Input
                      type="datetime-local"
                      value={reservationForm.startTime}
                      onChange={(e) => setReservationForm({ ...reservationForm, startTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Time</Label>
                    <Input
                      type="datetime-local"
                      value={reservationForm.endTime}
                      onChange={(e) => setReservationForm({ ...reservationForm, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Setup Time (minutes)</Label>
                    <Input
                      type="number"
                      value={reservationForm.setupTime}
                      onChange={(e) => setReservationForm({ ...reservationForm, setupTime: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Cleanup Time (minutes)</Label>
                    <Input
                      type="number"
                      value={reservationForm.cleanupTime}
                      onChange={(e) => setReservationForm({ ...reservationForm, cleanupTime: e.target.value })}
                      placeholder="15"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Expected Attendees</Label>
                  <Input
                    type="number"
                    value={reservationForm.attendeeCount}
                    onChange={(e) => setReservationForm({ ...reservationForm, attendeeCount: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={reservationForm.needsAV}
                      onCheckedChange={(c) => setReservationForm({ ...reservationForm, needsAV: c })}
                    />
                    <Label>Needs A/V Equipment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={reservationForm.needsSoundSystem}
                      onCheckedChange={(c) => setReservationForm({ ...reservationForm, needsSoundSystem: c })}
                    />
                    <Label>Needs Sound System</Label>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Special Requests</Label>
                  <Textarea
                    value={reservationForm.specialRequests}
                    onChange={(e) => setReservationForm({ ...reservationForm, specialRequests: e.target.value })}
                    placeholder="Any special requirements or notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReservationDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateReservation}
                  disabled={createReservationMutation.isPending || !reservationForm.facilityId || !reservationForm.eventName || !reservationForm.startTime || !reservationForm.endTime}
                >
                  {createReservationMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={facilityDialogOpen} onOpenChange={(open) => {
            setFacilityDialogOpen(open);
            if (!open) {
              setEditingFacility(null);
              resetFacilityForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Facility
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingFacility ? "Edit Facility" : "Add New Facility"}</DialogTitle>
                <DialogDescription>
                  {editingFacility ? "Update facility details." : "Add a new room or space to your facility list."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Facility Name</Label>
                  <Input
                    value={facilityForm.name}
                    onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                    placeholder="e.g., Main Sanctuary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select
                    value={facilityForm.facilityType}
                    onValueChange={(v) => setFacilityForm({ ...facilityForm, facilityType: v as FacilityType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(facilityTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={facilityForm.description}
                    onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })}
                    placeholder="Describe the facility..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      value={facilityForm.capacity}
                      onChange={(e) => setFacilityForm({ ...facilityForm, capacity: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Hourly Rate ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={facilityForm.hourlyRate}
                      onChange={(e) => setFacilityForm({ ...facilityForm, hourlyRate: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={facilityForm.hasAV}
                      onCheckedChange={(c) => setFacilityForm({ ...facilityForm, hasAV: c })}
                    />
                    <Label className="flex items-center gap-1">
                      <Projector className="h-4 w-4" /> A/V Equipment
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={facilityForm.hasWifi}
                      onCheckedChange={(c) => setFacilityForm({ ...facilityForm, hasWifi: c })}
                    />
                    <Label className="flex items-center gap-1">
                      <Wifi className="h-4 w-4" /> WiFi
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={facilityForm.hasSoundSystem}
                      onCheckedChange={(c) => setFacilityForm({ ...facilityForm, hasSoundSystem: c })}
                    />
                    <Label className="flex items-center gap-1">
                      <Music className="h-4 w-4" /> Sound System
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={facilityForm.hasParking}
                      onCheckedChange={(c) => setFacilityForm({ ...facilityForm, hasParking: c })}
                    />
                    <Label className="flex items-center gap-1">
                      <Car className="h-4 w-4" /> Parking
                    </Label>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Rules & Guidelines</Label>
                  <Textarea
                    value={facilityForm.rules}
                    onChange={(e) => setFacilityForm({ ...facilityForm, rules: e.target.value })}
                    placeholder="Usage rules and guidelines..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFacilityDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveFacility}
                  disabled={createFacilityMutation.isPending || updateFacilityMutation.isPending || !facilityForm.name}
                >
                  {(createFacilityMutation.isPending || updateFacilityMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingFacility ? "Update" : "Create"} Facility
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facilities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReservations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Reservations</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedReservations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {facilities.reduce((sum, f) => sum + (f.capacity || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="reservations">
            Reservations
            {pendingReservations.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingReservations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facilities" className="space-y-4">
          {loadingFacilities ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : facilities.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Facilities Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first facility to start accepting reservations.
                  </p>
                  <Button onClick={() => setFacilityDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Facility
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facilities.map((facility) => (
                <Card key={facility.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{facility.name}</CardTitle>
                        <CardDescription>{facilityTypeLabels[facility.facilityType]}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {facility.capacity || "N/A"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {facility.description && (
                      <p className="text-sm text-muted-foreground mb-4">{facility.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {facility.hasAV && (
                        <Badge variant="secondary">
                          <Projector className="h-3 w-3 mr-1" /> A/V
                        </Badge>
                      )}
                      {facility.hasWifi && (
                        <Badge variant="secondary">
                          <Wifi className="h-3 w-3 mr-1" /> WiFi
                        </Badge>
                      )}
                      {facility.hasSoundSystem && (
                        <Badge variant="secondary">
                          <Music className="h-3 w-3 mr-1" /> Sound
                        </Badge>
                      )}
                      {facility.hasParking && (
                        <Badge variant="secondary">
                          <Car className="h-3 w-3 mr-1" /> Parking
                        </Badge>
                      )}
                    </div>
                    {facility.hourlyRate && (
                      <p className="text-sm font-medium">${facility.hourlyRate}/hour</p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditFacility(facility)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this facility?")) {
                            deleteFacilityMutation.mutate(facility.id.toString());
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          {loadingReservations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reservations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reservations Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Reservations will appear here when members request facility bookings.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>All Reservations</CardTitle>
                <CardDescription>Manage facility booking requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Facility</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Attendees</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((item) => {
                      const res = item.reservation;
                      return (
                        <TableRow key={res.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{res.eventName}</div>
                              {res.specialInstructions && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {res.specialInstructions}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.facility?.name || "Unknown"}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{format(new Date(res.startDate), "MMM d, yyyy")}</div>
                              <div className="text-muted-foreground">
                                {format(new Date(res.startDate), "h:mm a")} -{" "}
                                {format(new Date(res.endDate), "h:mm a")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{res.expectedAttendance || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${statusColors[res.status]} text-white`}
                            >
                              {res.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {res.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600"
                                    onClick={() => approveReservationMutation.mutate(res.id.toString())}
                                    disabled={approveReservationMutation.isPending}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600"
                                    onClick={() => {
                                      const reason = prompt("Reason for denial:");
                                      if (reason) {
                                        denyReservationMutation.mutate({
                                          id: res.id.toString(),
                                          reason,
                                        });
                                      }
                                    }}
                                    disabled={denyReservationMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {res.status === "approved" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (confirm("Cancel this reservation?")) {
                                      cancelReservationMutation.mutate(res.id.toString());
                                    }
                                  }}
                                  disabled={cancelReservationMutation.isPending}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
