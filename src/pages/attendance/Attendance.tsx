import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Users,
  UserPlus,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: number;
  name: string;
  serviceDate: string;
  startTime: string;
  endTime?: string;
  serviceType: string;
  expectedAttendance?: number;
  actualAttendance: number;
  childrenAttendance: number;
  firstTimeVisitors: number;
  status: string;
}

interface AttendanceMetrics {
  summary: {
    avgAttendance: number;
    totalFirstTimeVisitors: number;
    servicesCount: number;
    totalAttendance: number;
  };
  recentServices: Service[];
}

export default function Attendance() {
  const { churchId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [period, setPeriod] = useState("6months");

  // Form states
  const [newService, setNewService] = useState({
    name: "",
    serviceDate: "",
    startTime: "",
    serviceType: "sunday_worship",
    expectedAttendance: "",
  });

  const [checkInData, setCheckInData] = useState({
    userId: "",
    guestCount: "0",
    isFirstTimeVisitor: false,
  });

  // Fetch attendance metrics
  const { data: metricsData, isLoading: loadingMetrics } = useQuery({
    queryKey: ["attendance-metrics", churchId, period],
    queryFn: () => api.get<{ data: AttendanceMetrics }>(`/church/${churchId}/attendance/metrics?period=${period}`),
    enabled: !!churchId,
  });

  // Fetch services
  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ["attendance-services", churchId],
    queryFn: () => api.get<{ data: Service[] }>(`/church/${churchId}/attendance/services`),
    enabled: !!churchId,
  });

  // Create service mutation
  const createService = useMutation({
    mutationFn: (data: typeof newService) =>
      api.post(`/church/${churchId}/attendance/services`, {
        ...data,
        expectedAttendance: data.expectedAttendance ? parseInt(data.expectedAttendance) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-services"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-metrics"] });
      setIsCreateOpen(false);
      setNewService({
        name: "",
        serviceDate: "",
        startTime: "",
        serviceType: "sunday_worship",
        expectedAttendance: "",
      });
      toast({ title: "Service created", description: "Service has been scheduled." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create service.", variant: "destructive" });
    },
  });

  // Check-in mutation
  const recordCheckIn = useMutation({
    mutationFn: (data: { serviceId: number; userId: string; guestCount: number; isFirstTimeVisitor: boolean }) =>
      api.post(`/church/${churchId}/attendance/checkin`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-services"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-metrics"] });
      setIsCheckInOpen(false);
      setCheckInData({ userId: "", guestCount: "0", isFirstTimeVisitor: false });
      toast({ title: "Check-in recorded", description: "Attendance has been recorded." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record check-in.", variant: "destructive" });
    },
  });

  const metrics = metricsData?.data;
  const services = servicesData?.data || [];

  // Transform data for chart
  const chartData = metrics?.recentServices?.slice(0, 12).reverse().map((s) => ({
    date: new Date(s.serviceDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    attendance: s.actualAttendance || 0,
    visitors: s.firstTimeVisitors || 0,
  })) || [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sunday_worship: "Sunday Worship",
      wednesday_night: "Wednesday Night",
      youth_service: "Youth Service",
      special_event: "Special Event",
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Attendance Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track service attendance and analyze trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="12months">12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Service</DialogTitle>
                <DialogDescription>
                  Create a new service to track attendance.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input
                    placeholder="e.g., Sunday Morning Worship"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newService.serviceDate}
                      onChange={(e) => setNewService({ ...newService, serviceDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={newService.startTime}
                      onChange={(e) => setNewService({ ...newService, startTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service Type</Label>
                    <Select
                      value={newService.serviceType}
                      onValueChange={(v) => setNewService({ ...newService, serviceType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunday_worship">Sunday Worship</SelectItem>
                        <SelectItem value="wednesday_night">Wednesday Night</SelectItem>
                        <SelectItem value="youth_service">Youth Service</SelectItem>
                        <SelectItem value="special_event">Special Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Attendance</Label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={newService.expectedAttendance}
                      onChange={(e) => setNewService({ ...newService, expectedAttendance: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createService.mutate(newService)}
                  disabled={!newService.name || !newService.serviceDate || !newService.startTime}
                >
                  Create Service
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Attendance
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.summary.avgAttendance || 0}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">Per service</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Services
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.summary.servicesCount || 0}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              First-Time Visitors
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.summary.totalFirstTimeVisitors || 0}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">New guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Attendance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.summary.totalAttendance || 0}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">All services</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trends</CardTitle>
          <CardDescription>Service attendance over time</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMetrics ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No attendance data available
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar dataKey="attendance" name="Attendance" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="visitors" name="First-Time Visitors" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Services</CardTitle>
              <CardDescription>Track and record attendance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingServices ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No services scheduled</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreateOpen(true)}
              >
                Schedule First Service
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead className="text-center">Visitors</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(service.serviceDate)}
                        <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                        {service.startTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getServiceTypeLabel(service.serviceType)}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold">{service.actualAttendance || 0}</span>
                      {service.expectedAttendance && (
                        <span className="text-muted-foreground"> / {service.expectedAttendance}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {service.firstTimeVisitors || 0}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          service.status === "completed"
                            ? "default"
                            : service.status === "in_progress"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {service.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedService(service);
                          setIsCheckInOpen(true);
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Check-in
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Check-in Dialog */}
      <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Check-in</DialogTitle>
            <DialogDescription>
              {selectedService?.name} - {selectedService && formatDate(selectedService.serviceDate)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Member ID or Name</Label>
              <Input
                placeholder="Enter member ID or search"
                value={checkInData.userId}
                onChange={(e) => setCheckInData({ ...checkInData, userId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Additional Guests</Label>
              <Input
                type="number"
                min="0"
                value={checkInData.guestCount}
                onChange={(e) => setCheckInData({ ...checkInData, guestCount: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="firstTime"
                checked={checkInData.isFirstTimeVisitor}
                onChange={(e) => setCheckInData({ ...checkInData, isFirstTimeVisitor: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="firstTime">First-time visitor</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckInOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedService) {
                  recordCheckIn.mutate({
                    serviceId: selectedService.id,
                    userId: checkInData.userId,
                    guestCount: parseInt(checkInData.guestCount) || 0,
                    isFirstTimeVisitor: checkInData.isFirstTimeVisitor,
                  });
                }
              }}
              disabled={!checkInData.userId}
            >
              Record Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
