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
import { pastoralApi, PastoralVisit, CrisisAlert, CounselingRecord, membersApi } from "@/lib/api";
import {
  HeartHandshake,
  Calendar,
  Lock,
  Users,
  Bell,
  FileText,
  Stethoscope,
  Home,
  Plus,
  AlertTriangle,
  Phone,
  Video,
  Building,
  CheckCircle2,
  Clock,
  UserPlus,
  Loader2,
  Edit,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

const visitTypeLabels: Record<string, { label: string; icon: any }> = {
  hospital: { label: "Hospital Visit", icon: Stethoscope },
  home: { label: "Home Visit", icon: Home },
  office: { label: "Office Visit", icon: Building },
  hospice: { label: "Hospice Visit", icon: HeartHandshake },
  prison: { label: "Prison Visit", icon: Lock },
  phone: { label: "Phone Call", icon: Phone },
  video: { label: "Video Call", icon: Video },
};

const purposeLabels: Record<string, string> = {
  illness: "Illness",
  grief: "Grief Support",
  crisis: "Crisis Care",
  encouragement: "Encouragement",
  discipleship: "Discipleship",
  reconciliation: "Reconciliation",
  counseling: "Counseling",
};

const alertTypeLabels: Record<string, string> = {
  hospitalization: "Hospitalization",
  death: "Death",
  accident: "Accident",
  family_emergency: "Family Emergency",
  spiritual_crisis: "Spiritual Crisis",
  financial_crisis: "Financial Crisis",
  other: "Other",
};

const severityColors: Record<string, string> = {
  critical: "bg-red-600",
  urgent: "bg-orange-500",
  moderate: "bg-yellow-500",
  low: "bg-blue-500",
};

const statusColors: Record<string, string> = {
  new: "bg-purple-500",
  assigned: "bg-blue-500",
  in_progress: "bg-yellow-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
};

const counselingTypeLabels: Record<string, string> = {
  premarital: "Premarital",
  marital: "Marital",
  grief: "Grief",
  addiction: "Addiction",
  depression: "Depression",
  anxiety: "Anxiety",
  family: "Family",
  spiritual: "Spiritual",
};

export default function PastoralCare() {
  const { church } = useChurch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const churchId = church?.id?.toString() || "";

  const [activeTab, setActiveTab] = useState("visits");
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [counselingDialogOpen, setCounselingDialogOpen] = useState(false);

  // Visit form state
  const [visitForm, setVisitForm] = useState({
    memberId: "",
    visitType: "home" as string,
    visitDate: "",
    duration: "",
    location: "",
    purpose: "",
    summary: "",
    prayerPoints: "",
    communionGiven: false,
    anointing: false,
    followUpNeeded: false,
    followUpDate: "",
    followUpNotes: "",
    isConfidential: true,
  });

  // Alert form state
  const [alertForm, setAlertForm] = useState({
    memberId: "",
    memberName: "",
    alertType: "hospitalization",
    severity: "moderate",
    title: "",
    description: "",
    location: "",
    contactPerson: "",
    contactPhone: "",
    notifyPastors: true,
    notifyPrayerTeam: false,
    notifyDeacons: false,
  });

  // Counseling form state
  const [counselingForm, setCounselingForm] = useState({
    memberId: "",
    caseType: "",
    startDate: "",
    nextSessionDate: "",
    presentingIssue: "",
    goals: "",
    isConfidential: true,
  });

  // Queries
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["pastoral-stats", churchId],
    queryFn: () => pastoralApi.getStats(churchId),
    enabled: !!churchId,
  });

  const { data: visits = [], isLoading: loadingVisits } = useQuery({
    queryKey: ["pastoral-visits", churchId],
    queryFn: () => pastoralApi.listVisits(churchId),
    enabled: !!churchId,
  });

  const { data: crisisAlerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ["crisis-alerts", churchId],
    queryFn: () => pastoralApi.listCrisisAlerts(churchId),
    enabled: !!churchId,
  });

  const { data: counselingRecords = [], isLoading: loadingCounseling } = useQuery({
    queryKey: ["counseling-records", churchId],
    queryFn: () => pastoralApi.listCounselingRecords(churchId),
    enabled: !!churchId,
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
  const createVisitMutation = useMutation({
    mutationFn: (data: Partial<PastoralVisit>) => pastoralApi.createVisit(churchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastoral-visits", churchId] });
      queryClient.invalidateQueries({ queryKey: ["pastoral-stats", churchId] });
      toast({ title: "Visit logged successfully" });
      setVisitDialogOpen(false);
      resetVisitForm();
    },
    onError: () => {
      toast({ title: "Failed to log visit", variant: "destructive" });
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: (data: Partial<CrisisAlert>) => pastoralApi.createCrisisAlert(churchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crisis-alerts", churchId] });
      queryClient.invalidateQueries({ queryKey: ["pastoral-stats", churchId] });
      toast({ title: "Crisis alert created" });
      setAlertDialogOpen(false);
      resetAlertForm();
    },
    onError: () => {
      toast({ title: "Failed to create alert", variant: "destructive" });
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: ({ alertId, resolution }: { alertId: string; resolution: string }) =>
      pastoralApi.resolveCrisisAlert(churchId, alertId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crisis-alerts", churchId] });
      queryClient.invalidateQueries({ queryKey: ["pastoral-stats", churchId] });
      toast({ title: "Alert resolved" });
    },
    onError: () => {
      toast({ title: "Failed to resolve alert", variant: "destructive" });
    },
  });

  const createCounselingMutation = useMutation({
    mutationFn: (data: Partial<CounselingRecord>) => pastoralApi.createCounselingRecord(churchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counseling-records", churchId] });
      queryClient.invalidateQueries({ queryKey: ["pastoral-stats", churchId] });
      toast({ title: "Counseling case created" });
      setCounselingDialogOpen(false);
      resetCounselingForm();
    },
    onError: () => {
      toast({ title: "Failed to create case", variant: "destructive" });
    },
  });

  const logSessionMutation = useMutation({
    mutationFn: ({ recordId, notes, nextDate }: { recordId: string; notes: string; nextDate?: string }) =>
      pastoralApi.logCounselingSession(churchId, recordId, notes, nextDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counseling-records", churchId] });
      toast({ title: "Session logged" });
    },
    onError: () => {
      toast({ title: "Failed to log session", variant: "destructive" });
    },
  });

  const resetVisitForm = () => {
    setVisitForm({
      memberId: "",
      visitType: "home",
      visitDate: "",
      duration: "",
      location: "",
      purpose: "",
      summary: "",
      prayerPoints: "",
      communionGiven: false,
      anointing: false,
      followUpNeeded: false,
      followUpDate: "",
      followUpNotes: "",
      isConfidential: true,
    });
  };

  const resetAlertForm = () => {
    setAlertForm({
      memberId: "",
      memberName: "",
      alertType: "hospitalization",
      severity: "moderate",
      title: "",
      description: "",
      location: "",
      contactPerson: "",
      contactPhone: "",
      notifyPastors: true,
      notifyPrayerTeam: false,
      notifyDeacons: false,
    });
  };

  const resetCounselingForm = () => {
    setCounselingForm({
      memberId: "",
      caseType: "",
      startDate: "",
      nextSessionDate: "",
      presentingIssue: "",
      goals: "",
      isConfidential: true,
    });
  };

  const handleCreateVisit = () => {
    createVisitMutation.mutate({
      memberId: visitForm.memberId,
      visitType: visitForm.visitType as PastoralVisit["visitType"],
      visitDate: visitForm.visitDate,
      duration: visitForm.duration ? parseInt(visitForm.duration) : undefined,
      location: visitForm.location || undefined,
      purpose: visitForm.purpose as PastoralVisit["purpose"] || undefined,
      summary: visitForm.summary || undefined,
      prayerPoints: visitForm.prayerPoints || undefined,
      communionGiven: visitForm.communionGiven,
      anointing: visitForm.anointing,
      followUpNeeded: visitForm.followUpNeeded,
      followUpDate: visitForm.followUpDate || undefined,
      followUpNotes: visitForm.followUpNotes || undefined,
      isConfidential: visitForm.isConfidential,
    });
  };

  const handleCreateAlert = () => {
    createAlertMutation.mutate({
      memberId: alertForm.memberId || undefined,
      memberName: alertForm.memberName || undefined,
      alertType: alertForm.alertType as CrisisAlert["alertType"],
      severity: alertForm.severity as CrisisAlert["severity"],
      title: alertForm.title,
      description: alertForm.description || undefined,
      location: alertForm.location || undefined,
      contactPerson: alertForm.contactPerson || undefined,
      contactPhone: alertForm.contactPhone || undefined,
      notifyPastors: alertForm.notifyPastors,
      notifyPrayerTeam: alertForm.notifyPrayerTeam,
      notifyDeacons: alertForm.notifyDeacons,
    });
  };

  const handleCreateCounseling = () => {
    createCounselingMutation.mutate({
      memberId: counselingForm.memberId,
      caseType: counselingForm.caseType as CounselingRecord["caseType"] || undefined,
      startDate: counselingForm.startDate,
      nextSessionDate: counselingForm.nextSessionDate || undefined,
      presentingIssue: counselingForm.presentingIssue || undefined,
      goals: counselingForm.goals || undefined,
      isConfidential: counselingForm.isConfidential,
    });
  };

  const activeAlerts = crisisAlerts.filter((a) => ["new", "assigned", "in_progress"].includes(a.status));
  const activeCases = counselingRecords.filter((c) => c.status === "active");

  if (!churchId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please select a church to manage pastoral care.</p>
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
            <HeartHandshake className="h-8 w-8 text-purple-500" />
            Pastoral Care
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and coordinate care for your congregation
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Crisis
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Report Crisis Alert</DialogTitle>
                <DialogDescription>
                  Create an urgent alert for pastoral response.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label>Member (optional)</Label>
                  <Select
                    value={alertForm.memberId}
                    onValueChange={(v) => setAlertForm({ ...alertForm, memberId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not a member</SelectItem>
                      {members.map((m: any) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.firstName} {m.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!alertForm.memberId && (
                  <div className="grid gap-2">
                    <Label>Person's Name</Label>
                    <Input
                      value={alertForm.memberName}
                      onChange={(e) => setAlertForm({ ...alertForm, memberName: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Alert Type</Label>
                    <Select
                      value={alertForm.alertType}
                      onValueChange={(v) => setAlertForm({ ...alertForm, alertType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(alertTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Severity</Label>
                    <Select
                      value={alertForm.severity}
                      onValueChange={(v) => setAlertForm({ ...alertForm, severity: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input
                    value={alertForm.title}
                    onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                    placeholder="Brief description of the situation"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Details</Label>
                  <Textarea
                    value={alertForm.description}
                    onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
                    placeholder="Additional details..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input
                    value={alertForm.location}
                    onChange={(e) => setAlertForm({ ...alertForm, location: e.target.value })}
                    placeholder="Hospital, address, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Contact Person</Label>
                    <Input
                      value={alertForm.contactPerson}
                      onChange={(e) => setAlertForm({ ...alertForm, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Contact Phone</Label>
                    <Input
                      value={alertForm.contactPhone}
                      onChange={(e) => setAlertForm({ ...alertForm, contactPhone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notifications</Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={alertForm.notifyPastors}
                        onCheckedChange={(c) => setAlertForm({ ...alertForm, notifyPastors: c })}
                      />
                      <Label>Pastors</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={alertForm.notifyPrayerTeam}
                        onCheckedChange={(c) => setAlertForm({ ...alertForm, notifyPrayerTeam: c })}
                      />
                      <Label>Prayer Team</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={alertForm.notifyDeacons}
                        onCheckedChange={(c) => setAlertForm({ ...alertForm, notifyDeacons: c })}
                      />
                      <Label>Deacons</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAlertDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCreateAlert}
                  disabled={createAlertMutation.isPending || !alertForm.title}
                >
                  {createAlertMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Alert
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Log Visit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Log Pastoral Visit</DialogTitle>
                <DialogDescription>
                  Record a pastoral care visit or interaction.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label>Member</Label>
                  <Select
                    value={visitForm.memberId}
                    onValueChange={(v) => setVisitForm({ ...visitForm, memberId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m: any) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.firstName} {m.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Visit Type</Label>
                    <Select
                      value={visitForm.visitType}
                      onValueChange={(v) => setVisitForm({ ...visitForm, visitType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(visitTypeLabels).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Purpose</Label>
                    <Select
                      value={visitForm.purpose}
                      onValueChange={(v) => setVisitForm({ ...visitForm, purpose: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(purposeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Visit Date</Label>
                    <Input
                      type="datetime-local"
                      value={visitForm.visitDate}
                      onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={visitForm.duration}
                      onChange={(e) => setVisitForm({ ...visitForm, duration: e.target.value })}
                      placeholder="60"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input
                    value={visitForm.location}
                    onChange={(e) => setVisitForm({ ...visitForm, location: e.target.value })}
                    placeholder="Address or facility"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Summary</Label>
                  <Textarea
                    value={visitForm.summary}
                    onChange={(e) => setVisitForm({ ...visitForm, summary: e.target.value })}
                    placeholder="Notes about the visit..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Prayer Points</Label>
                  <Textarea
                    value={visitForm.prayerPoints}
                    onChange={(e) => setVisitForm({ ...visitForm, prayerPoints: e.target.value })}
                    placeholder="Items to pray for..."
                  />
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={visitForm.communionGiven}
                      onCheckedChange={(c) => setVisitForm({ ...visitForm, communionGiven: c })}
                    />
                    <Label>Communion Given</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={visitForm.anointing}
                      onCheckedChange={(c) => setVisitForm({ ...visitForm, anointing: c })}
                    />
                    <Label>Anointing</Label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={visitForm.followUpNeeded}
                    onCheckedChange={(c) => setVisitForm({ ...visitForm, followUpNeeded: c })}
                  />
                  <Label>Follow-up Needed</Label>
                </div>
                {visitForm.followUpNeeded && (
                  <>
                    <div className="grid gap-2">
                      <Label>Follow-up Date</Label>
                      <Input
                        type="date"
                        value={visitForm.followUpDate}
                        onChange={(e) => setVisitForm({ ...visitForm, followUpDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Follow-up Notes</Label>
                      <Textarea
                        value={visitForm.followUpNotes}
                        onChange={(e) => setVisitForm({ ...visitForm, followUpNotes: e.target.value })}
                        placeholder="What needs to happen..."
                      />
                    </div>
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={visitForm.isConfidential}
                    onCheckedChange={(c) => setVisitForm({ ...visitForm, isConfidential: c })}
                  />
                  <Label className="flex items-center gap-1">
                    <Lock className="h-4 w-4" /> Mark as Confidential
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setVisitDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateVisit}
                  disabled={createVisitMutation.isPending || !visitForm.memberId || !visitForm.visitDate}
                >
                  {createVisitMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Log Visit
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
            <CardTitle className="text-sm font-medium">Visits This Month</CardTitle>
            <Home className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : stats?.visitsThisMonth || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : stats?.pendingFollowUps || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : stats?.activeAlerts || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Counseling</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : stats?.activeCounseling || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="alerts">
            Crisis Alerts
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {activeAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="counseling">Counseling</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="space-y-4">
          {loadingVisits ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : visits.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <HeartHandshake className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Visits Logged</h3>
                  <p className="text-muted-foreground mb-4">
                    Start logging pastoral visits to track your care ministry.
                  </p>
                  <Button onClick={() => setVisitDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Log First Visit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recent Visits</CardTitle>
                <CardDescription>Pastoral care visits and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Follow-up</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map((visit) => {
                      const TypeIcon = visitTypeLabels[visit.visitType]?.icon || Home;
                      return (
                        <TableRow key={visit.id}>
                          <TableCell>
                            {format(new Date(visit.visitDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-4 w-4 text-purple-500" />
                              {visitTypeLabels[visit.visitType]?.label || visit.visitType}
                            </div>
                          </TableCell>
                          <TableCell>
                            {visit.purpose ? purposeLabels[visit.purpose] || visit.purpose : "-"}
                          </TableCell>
                          <TableCell>
                            {visit.duration ? `${visit.duration} min` : "-"}
                          </TableCell>
                          <TableCell>
                            {visit.followUpNeeded ? (
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                {visit.followUpDate
                                  ? format(new Date(visit.followUpDate), "MMM d")
                                  : "Needed"}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {visit.isConfidential && (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
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

        <TabsContent value="alerts" className="space-y-4">
          {loadingAlerts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : crisisAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Crisis Alerts</h3>
                  <p className="text-muted-foreground">
                    Crisis alerts will appear here when reported.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeAlerts.length > 0 && (
                <Card className="border-red-500/50">
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activeAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-start justify-between p-4 rounded-lg border bg-card"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${severityColors[alert.severity]} text-white`}>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline">
                                {alertTypeLabels[alert.alertType]}
                              </Badge>
                              <Badge className={`${statusColors[alert.status]} text-white`}>
                                {alert.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <h4 className="font-semibold">{alert.title}</h4>
                            {alert.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {alert.description}
                              </p>
                            )}
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                              {alert.location && <span>Location: {alert.location}</span>}
                              {alert.contactPerson && (
                                <span>
                                  Contact: {alert.contactPerson}
                                  {alert.contactPhone && ` (${alert.contactPhone})`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const resolution = prompt("Resolution notes:");
                                if (resolution) {
                                  resolveAlertMutation.mutate({
                                    alertId: alert.id.toString(),
                                    resolution,
                                  });
                                }
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>All Alerts</CardTitle>
                  <CardDescription>Complete history of crisis alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {crisisAlerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            {format(new Date(alert.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{alertTypeLabels[alert.alertType]}</TableCell>
                          <TableCell>{alert.title}</TableCell>
                          <TableCell>
                            <Badge className={`${severityColors[alert.severity]} text-white`}>
                              {alert.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusColors[alert.status]} text-white`}>
                              {alert.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="counseling" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={counselingDialogOpen} onOpenChange={setCounselingDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Case
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Counseling Case</DialogTitle>
                  <DialogDescription>
                    Start a new counseling record for a member.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Member</Label>
                    <Select
                      value={counselingForm.memberId}
                      onValueChange={(v) => setCounselingForm({ ...counselingForm, memberId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((m: any) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.firstName} {m.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Case Type</Label>
                    <Select
                      value={counselingForm.caseType}
                      onValueChange={(v) => setCounselingForm({ ...counselingForm, caseType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(counselingTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={counselingForm.startDate}
                        onChange={(e) => setCounselingForm({ ...counselingForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>First Session</Label>
                      <Input
                        type="datetime-local"
                        value={counselingForm.nextSessionDate}
                        onChange={(e) => setCounselingForm({ ...counselingForm, nextSessionDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Presenting Issue</Label>
                    <Textarea
                      value={counselingForm.presentingIssue}
                      onChange={(e) => setCounselingForm({ ...counselingForm, presentingIssue: e.target.value })}
                      placeholder="Describe the primary concern..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Goals</Label>
                    <Textarea
                      value={counselingForm.goals}
                      onChange={(e) => setCounselingForm({ ...counselingForm, goals: e.target.value })}
                      placeholder="Counseling goals..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={counselingForm.isConfidential}
                      onCheckedChange={(c) => setCounselingForm({ ...counselingForm, isConfidential: c })}
                    />
                    <Label className="flex items-center gap-1">
                      <Lock className="h-4 w-4" /> Mark as Confidential
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCounselingDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCounseling}
                    disabled={createCounselingMutation.isPending || !counselingForm.memberId || !counselingForm.startDate}
                  >
                    {createCounselingMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Case
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {loadingCounseling ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : counselingRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Counseling Cases</h3>
                  <p className="text-muted-foreground mb-4">
                    Start a new counseling case to track sessions and progress.
                  </p>
                  <Button onClick={() => setCounselingDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create First Case
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Counseling Cases</CardTitle>
                <CardDescription>Track counseling sessions and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Next Session</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {counselingRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {record.isConfidential && <Lock className="h-3 w-3 text-muted-foreground" />}
                            {record.caseNumber || `#${record.id}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.caseType ? counselingTypeLabels[record.caseType] : "-"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(record.startDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{record.sessionCount || 0}</TableCell>
                        <TableCell>
                          {record.nextSessionDate
                            ? format(new Date(record.nextSessionDate), "MMM d, h:mm a")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={record.status === "active" ? "default" : "secondary"}
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const notes = prompt("Session notes:");
                                if (notes) {
                                  const nextDate = prompt("Next session date (YYYY-MM-DD HH:MM):");
                                  logSessionMutation.mutate({
                                    recordId: record.id.toString(),
                                    notes,
                                    nextDate: nextDate || undefined,
                                  });
                                }
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Session
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
