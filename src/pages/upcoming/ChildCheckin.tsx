import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Baby,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  LogOut,
  Clock,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { checkInApi } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface ChildCheckIn {
  id: number;
  serviceId: number;
  childId: string;
  parentId: string;
  securityCode: string;
  roomName?: string;
  ageGroup?: string;
  allergies?: string;
  specialNeeds?: string;
  checkedInAt: string;
  checkedInBy?: string;
  checkedOutAt?: string;
  checkedOutBy?: string;
  nameTagPrinted: boolean;
  child?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  parent?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export default function ChildCheckin() {
  const { church } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<ChildCheckIn | null>(null);
  const [checkOutCode, setCheckOutCode] = useState("");

  // Form state for new check-in
  const [newCheckIn, setNewCheckIn] = useState({
    childName: "",
    parentName: "",
    parentPhone: "",
    roomName: "",
    ageGroup: "",
    allergies: "",
    specialNotes: "",
  });

  // Fetch today's services
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["todayServices", church?.id],
    queryFn: () => checkInApi.getTodaysServices(church!.id.toString()),
    enabled: !!church?.id,
  });

  // Fetch child stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["childStats", church?.id],
    queryFn: () => checkInApi.getChildStats(church!.id.toString()),
    enabled: !!church?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch child check-ins for selected service
  const { data: checkInsData, isLoading: checkInsLoading, refetch: refetchCheckIns } = useQuery({
    queryKey: ["childCheckIns", church?.id, selectedService],
    queryFn: () => checkInApi.getChildCheckIns(church!.id.toString(), selectedService),
    enabled: !!church?.id && !!selectedService,
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (data: typeof newCheckIn) =>
      checkInApi.checkInChild(church!.id.toString(), selectedService, "self", {
        childName: data.childName,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        classroomAssignment: data.roomName,
        allergies: data.allergies,
        specialNotes: data.specialNotes,
      }),
    onSuccess: () => {
      toast.success("Child checked in successfully!");
      setCheckInDialogOpen(false);
      setNewCheckIn({
        childName: "",
        parentName: "",
        parentPhone: "",
        roomName: "",
        ageGroup: "",
        allergies: "",
        specialNotes: "",
      });
      refetchCheckIns();
      queryClient.invalidateQueries({ queryKey: ["childStats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to check in child");
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: () =>
      checkInApi.checkOutChild(
        church!.id.toString(),
        selectedService,
        selectedCheckIn!.id.toString(),
        { securityCode: checkOutCode }
      ),
    onSuccess: () => {
      toast.success("Child checked out successfully!");
      setCheckOutDialogOpen(false);
      setSelectedCheckIn(null);
      setCheckOutCode("");
      refetchCheckIns();
      queryClient.invalidateQueries({ queryKey: ["childStats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid security code or check-out failed");
    },
  });

  // Print tag mutation
  const printTagMutation = useMutation({
    mutationFn: (childCheckInId: string) =>
      checkInApi.printChildTag(church!.id.toString(), childCheckInId),
    onSuccess: () => {
      toast.success("Name tag marked as printed");
      refetchCheckIns();
    },
    onError: () => {
      toast.error("Failed to mark tag as printed");
    },
  });

  const services = servicesData?.data?.services || [];
  const stats = statsData?.data;
  const checkIns = checkInsData?.data || [];

  const filteredCheckIns = checkIns.filter((checkIn: { id: number; childName: string; status: string; checkedInAt: string }) => {
    if (!searchQuery) return true;
    const childName = `${checkIn.child?.firstName || ""} ${checkIn.child?.lastName || ""}`.toLowerCase();
    const parentName = `${checkIn.parent?.firstName || ""} ${checkIn.parent?.lastName || ""}`.toLowerCase();
    return childName.includes(searchQuery.toLowerCase()) || parentName.includes(searchQuery.toLowerCase());
  });

  const activeCheckIns = filteredCheckIns.filter((c: ChildCheckIn) => !c.checkedOutAt);
  const completedCheckIns = filteredCheckIns.filter((c: ChildCheckIn) => c.checkedOutAt);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Baby className="h-8 w-8 text-pink-500" />
            Child Check-in System
          </h1>
          <p className="text-muted-foreground mt-1">
            Secure, streamlined check-in for children's ministry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetchCheckIns()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedService}>
                <Plus className="h-4 w-4 mr-2" />
                Check In Child
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Check In Child</DialogTitle>
                <DialogDescription>
                  Enter child and parent information for check-in
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Child's Name *</Label>
                  <Input
                    placeholder="Enter child's full name"
                    value={newCheckIn.childName}
                    onChange={(e) => setNewCheckIn({ ...newCheckIn, childName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Parent/Guardian Name *</Label>
                    <Input
                      placeholder="Parent name"
                      value={newCheckIn.parentName}
                      onChange={(e) => setNewCheckIn({ ...newCheckIn, parentName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      placeholder="(555) 123-4567"
                      value={newCheckIn.parentPhone}
                      onChange={(e) => setNewCheckIn({ ...newCheckIn, parentPhone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age Group</Label>
                    <Select
                      value={newCheckIn.ageGroup}
                      onValueChange={(value) => setNewCheckIn({ ...newCheckIn, ageGroup: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nursery">Nursery (0-2)</SelectItem>
                        <SelectItem value="toddler">Toddler (2-3)</SelectItem>
                        <SelectItem value="preschool">Preschool (4-5)</SelectItem>
                        <SelectItem value="elementary">Elementary (6-10)</SelectItem>
                        <SelectItem value="preteen">Preteen (11-12)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Room Assignment</Label>
                    <Select
                      value={newCheckIn.roomName}
                      onValueChange={(value) => setNewCheckIn({ ...newCheckIn, roomName: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Room 101 - Nursery">Room 101 - Nursery</SelectItem>
                        <SelectItem value="Room 102 - Toddlers">Room 102 - Toddlers</SelectItem>
                        <SelectItem value="Room 103 - Preschool">Room 103 - Preschool</SelectItem>
                        <SelectItem value="Room 104 - Elementary">Room 104 - Elementary</SelectItem>
                        <SelectItem value="Room 105 - Preteen">Room 105 - Preteen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Allergies / Medical Alerts
                  </Label>
                  <Input
                    placeholder="List any allergies or medical conditions"
                    value={newCheckIn.allergies}
                    onChange={(e) => setNewCheckIn({ ...newCheckIn, allergies: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Special Notes</Label>
                  <Textarea
                    placeholder="Any special instructions or needs"
                    value={newCheckIn.specialNotes}
                    onChange={(e) => setNewCheckIn({ ...newCheckIn, specialNotes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCheckInDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => checkInMutation.mutate(newCheckIn)}
                  disabled={!newCheckIn.childName || !newCheckIn.parentName || checkInMutation.isPending}
                >
                  {checkInMutation.isPending ? "Checking In..." : "Check In"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Currently Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-600">
              {statsLoading ? "..." : stats?.currentlyPresent || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Children in rooms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Checked In Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? "..." : stats?.totalCheckedIn || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total check-ins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Checked Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {statsLoading ? "..." : stats?.totalCheckedOut || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Safely picked up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">By Room</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.byRoom && Object.keys(stats.byRoom).length > 0 ? (
              <div className="space-y-1">
                {Object.entries(stats.byRoom).slice(0, 3).map(([room, count]) => (
                  <div key={room} className="flex justify-between text-sm">
                    <span className="truncate">{room}</span>
                    <Badge variant="secondary">{count as number}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Service</CardTitle>
          <CardDescription>Choose a service to manage child check-ins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {servicesLoading ? (
                  <SelectItem value="" disabled>Loading services...</SelectItem>
                ) : services.length === 0 ? (
                  <SelectItem value="" disabled>No services today</SelectItem>
                ) : (
                  services.map((service: { id: number; name: string; serviceType: string }) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - {format(new Date(service.serviceDate), "h:mm a")}
                      {service.status === "active" && (
                        <Badge className="ml-2" variant="default">Active</Badge>
                      )}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by child or parent name..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check-ins Table */}
      {selectedService && (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Currently Present ({activeCheckIns.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Checked Out ({completedCheckIns.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Child</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Age Group</TableHead>
                      <TableHead>Security Code</TableHead>
                      <TableHead>Allergies</TableHead>
                      <TableHead>Checked In</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkInsLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Loading check-ins...
                        </TableCell>
                      </TableRow>
                    ) : activeCheckIns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No children currently checked in
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeCheckIns.map((checkIn: ChildCheckIn) => (
                        <TableRow key={checkIn.id}>
                          <TableCell className="font-medium">
                            {checkIn.child?.firstName} {checkIn.child?.lastName}
                          </TableCell>
                          <TableCell>
                            {checkIn.parent?.firstName} {checkIn.parent?.lastName}
                            {checkIn.parent?.phone && (
                              <div className="text-xs text-muted-foreground">{checkIn.parent.phone}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{checkIn.roomName || "Unassigned"}</Badge>
                          </TableCell>
                          <TableCell>{checkIn.ageGroup || "-"}</TableCell>
                          <TableCell>
                            <code className="bg-muted px-2 py-1 rounded font-mono text-lg">
                              {checkIn.securityCode}
                            </code>
                          </TableCell>
                          <TableCell>
                            {checkIn.allergies ? (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {checkIn.allergies}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {format(new Date(checkIn.checkedInAt), "h:mm a")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => printTagMutation.mutate(checkIn.id.toString())}
                                disabled={checkIn.nameTagPrinted}
                              >
                                <Printer className="h-4 w-4 mr-1" />
                                {checkIn.nameTagPrinted ? "Printed" : "Print Tag"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedCheckIn(checkIn);
                                  setCheckOutDialogOpen(true);
                                }}
                              >
                                <LogOut className="h-4 w-4 mr-1" />
                                Check Out
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Child</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Checked In</TableHead>
                      <TableHead>Checked Out</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedCheckIns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No completed check-outs yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      completedCheckIns.map((checkIn: ChildCheckIn) => {
                        const checkInTime = new Date(checkIn.checkedInAt);
                        const checkOutTime = new Date(checkIn.checkedOutAt!);
                        const duration = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / 60000);
                        return (
                          <TableRow key={checkIn.id}>
                            <TableCell className="font-medium">
                              {checkIn.child?.firstName} {checkIn.child?.lastName}
                            </TableCell>
                            <TableCell>
                              {checkIn.parent?.firstName} {checkIn.parent?.lastName}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{checkIn.roomName || "Unassigned"}</Badge>
                            </TableCell>
                            <TableCell>{format(checkInTime, "h:mm a")}</TableCell>
                            <TableCell>{format(checkOutTime, "h:mm a")}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {duration < 60 ? `${duration} min` : `${Math.round(duration / 60)}h ${duration % 60}m`}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Check-out Dialog */}
      <Dialog open={checkOutDialogOpen} onOpenChange={setCheckOutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Out Child</DialogTitle>
            <DialogDescription>
              Enter the security code to check out {selectedCheckIn?.child?.firstName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium">
                {selectedCheckIn?.child?.firstName} {selectedCheckIn?.child?.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                Room: {selectedCheckIn?.roomName || "Unassigned"}
              </div>
              <div className="text-sm text-muted-foreground">
                Parent: {selectedCheckIn?.parent?.firstName} {selectedCheckIn?.parent?.lastName}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Security Code</Label>
              <Input
                placeholder="Enter 6-character code"
                value={checkOutCode}
                onChange={(e) => setCheckOutCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The security code was given to the parent at check-in
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckOutDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => checkOutMutation.mutate()}
              disabled={checkOutCode.length !== 6 || checkOutMutation.isPending}
            >
              {checkOutMutation.isPending ? "Verifying..." : "Verify & Check Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
