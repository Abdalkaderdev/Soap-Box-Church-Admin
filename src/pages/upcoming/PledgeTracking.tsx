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
import { Progress } from "@/components/ui/progress";
import {
  Target,
  FolderKanban,
  Plus,
  DollarSign,
  TrendingUp,
  Users,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Search,
  BarChart3,
  PiggyBank,
} from "lucide-react";
import { useChurch } from "@/hooks/useChurch";
import { pledgeApi, membersApi, type PledgeCampaign, type Pledge, type PledgePayment } from "@/lib/api";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

const CAMPAIGN_TYPES = [
  { value: 'annual_stewardship', label: 'Annual Stewardship' },
  { value: 'building_fund', label: 'Building Fund' },
  { value: 'mission_support', label: 'Mission Support' },
  { value: 'capital_campaign', label: 'Capital Campaign' },
  { value: 'special_project', label: 'Special Project' },
  { value: 'other', label: 'Other' },
];

const PLEDGE_FREQUENCIES = [
  { value: 'one_time', label: 'One-Time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num || 0);
}

function getStatusBadge(status: string) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    draft: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
    active: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
    paused: { variant: "outline", icon: <AlertCircle className="h-3 w-3" /> },
    completed: { variant: "secondary", icon: <CheckCircle2 className="h-3 w-3" /> },
    cancelled: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
    fulfilled: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
    defaulted: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  };
  const config = variants[status] || { variant: "secondary" as const, icon: null };
  return (
    <Badge variant={config.variant} className="gap-1 capitalize">
      {config.icon}
      {status}
    </Badge>
  );
}

export default function PledgeTracking() {
  const { churchId } = useChurch();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Campaign dialog state
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<PledgeCampaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    description: "",
    campaignType: "annual_stewardship" as PledgeCampaign['campaignType'],
    goalAmount: "",
    startDate: "",
    endDate: "",
    status: "draft" as PledgeCampaign['status'],
    isPublic: true,
    allowOnlinePledges: true,
    reminderFrequency: "monthly",
  });

  // Pledge dialog state
  const [pledgeDialogOpen, setPledgeDialogOpen] = useState(false);
  const [editingPledge, setEditingPledge] = useState<Pledge | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [pledgeForm, setPledgeForm] = useState({
    campaignId: "",
    userId: "",
    totalAmount: "",
    frequency: "monthly" as Pledge['frequency'],
    startDate: "",
    endDate: "",
    notes: "",
    isAnonymous: false,
  });

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPledgeForPayment, setSelectedPledgeForPayment] = useState<Pledge | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "",
    transactionReference: "",
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    notes: "",
  });

  // View payments dialog
  const [viewPaymentsDialogOpen, setViewPaymentsDialogOpen] = useState(false);
  const [viewingPledge, setViewingPledge] = useState<Pledge | null>(null);

  // Queries
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ['pledge-campaigns', churchId],
    queryFn: () => pledgeApi.listCampaigns(churchId!),
    enabled: !!churchId,
  });

  const { data: pledges = [], isLoading: loadingPledges } = useQuery({
    queryKey: ['pledges', churchId, selectedCampaignId],
    queryFn: () => pledgeApi.listPledges(churchId!, selectedCampaignId ? { campaignId: selectedCampaignId } : undefined),
    enabled: !!churchId,
  });

  const { data: stats, isLoading: _loadingStats } = useQuery({
    queryKey: ['pledge-stats', churchId],
    queryFn: () => pledgeApi.getStats(churchId!),
    enabled: !!churchId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', churchId],
    queryFn: () => membersApi.list(churchId!),
    enabled: !!churchId,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['pledge-payments', churchId, viewingPledge?.id],
    queryFn: () => pledgeApi.listPayments(churchId!, viewingPledge!.id.toString()),
    enabled: !!churchId && !!viewingPledge,
  });

  // Mutations
  const createCampaignMutation = useMutation({
    mutationFn: (data: Partial<PledgeCampaign>) => pledgeApi.createCampaign(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledge-campaigns', churchId] });
      queryClient.invalidateQueries({ queryKey: ['pledge-stats', churchId] });
      toast.success("Campaign created successfully");
      setCampaignDialogOpen(false);
      resetCampaignForm();
    },
    onError: () => toast.error("Failed to create campaign"),
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PledgeCampaign> }) =>
      pledgeApi.updateCampaign(churchId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledge-campaigns', churchId] });
      queryClient.invalidateQueries({ queryKey: ['pledge-stats', churchId] });
      toast.success("Campaign updated successfully");
      setCampaignDialogOpen(false);
      resetCampaignForm();
    },
    onError: () => toast.error("Failed to update campaign"),
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id: string) => pledgeApi.deleteCampaign(churchId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledge-campaigns', churchId] });
      queryClient.invalidateQueries({ queryKey: ['pledge-stats', churchId] });
      toast.success("Campaign deleted successfully");
    },
    onError: () => toast.error("Failed to delete campaign"),
  });

  const createPledgeMutation = useMutation({
    mutationFn: (data: Partial<Pledge>) => pledgeApi.createPledge(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledges', churchId] });
      queryClient.invalidateQueries({ queryKey: ['pledge-stats', churchId] });
      queryClient.invalidateQueries({ queryKey: ['pledge-campaigns', churchId] });
      toast.success("Pledge recorded successfully");
      setPledgeDialogOpen(false);
      resetPledgeForm();
    },
    onError: () => toast.error("Failed to record pledge"),
  });

  const updatePledgeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pledge> }) =>
      pledgeApi.updatePledge(churchId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledges', churchId] });
      queryClient.invalidateQueries({ queryKey: ['pledge-stats', churchId] });
      toast.success("Pledge updated successfully");
      setPledgeDialogOpen(false);
      resetPledgeForm();
    },
    onError: () => toast.error("Failed to update pledge"),
  });

  const deletePledgeMutation = useMutation({
    mutationFn: (id: string) => pledgeApi.deletePledge(churchId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledges', churchId] });
      queryClient.invalidateQueries({ queryKey: ['pledge-stats', churchId] });
      toast.success("Pledge deleted successfully");
    },
    onError: () => toast.error("Failed to delete pledge"),
  });

  const recordPaymentMutation = useMutation({
    mutationFn: ({ pledgeId, data }: { pledgeId: string; data: Parameters<typeof pledgeApi.recordPayment>[2] }) =>
      pledgeApi.recordPayment(churchId!, pledgeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledges', churchId] });
      queryClient.invalidateQueries({ queryKey: ['pledge-stats', churchId] });
      queryClient.invalidateQueries({ queryKey: ['pledge-payments', churchId] });
      toast.success("Payment recorded successfully");
      setPaymentDialogOpen(false);
      resetPaymentForm();
    },
    onError: () => toast.error("Failed to record payment"),
  });

  // Form handlers
  function resetCampaignForm() {
    setEditingCampaign(null);
    setCampaignForm({
      name: "",
      description: "",
      campaignType: "annual_stewardship",
      goalAmount: "",
      startDate: "",
      endDate: "",
      status: "draft",
      isPublic: true,
      allowOnlinePledges: true,
      reminderFrequency: "monthly",
    });
  }

  function resetPledgeForm() {
    setEditingPledge(null);
    setPledgeForm({
      campaignId: "",
      userId: "",
      totalAmount: "",
      frequency: "monthly",
      startDate: "",
      endDate: "",
      notes: "",
      isAnonymous: false,
    });
  }

  function resetPaymentForm() {
    setSelectedPledgeForPayment(null);
    setPaymentForm({
      amount: "",
      paymentMethod: "",
      transactionReference: "",
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      notes: "",
    });
  }

  function openCreateCampaign() {
    resetCampaignForm();
    setCampaignDialogOpen(true);
  }

  function openEditCampaign(campaign: PledgeCampaign) {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      description: campaign.description || "",
      campaignType: campaign.campaignType,
      goalAmount: campaign.goalAmount,
      startDate: campaign.startDate ? format(parseISO(campaign.startDate), 'yyyy-MM-dd') : "",
      endDate: campaign.endDate ? format(parseISO(campaign.endDate), 'yyyy-MM-dd') : "",
      status: campaign.status,
      isPublic: campaign.isPublic,
      allowOnlinePledges: campaign.allowOnlinePledges,
      reminderFrequency: campaign.reminderFrequency || "monthly",
    });
    setCampaignDialogOpen(true);
  }

  function openCreatePledge(campaignId?: string) {
    resetPledgeForm();
    if (campaignId) {
      setPledgeForm(prev => ({ ...prev, campaignId }));
    }
    setPledgeDialogOpen(true);
  }

  function openEditPledge(pledge: Pledge) {
    setEditingPledge(pledge);
    setPledgeForm({
      campaignId: pledge.campaignId.toString(),
      userId: pledge.userId,
      totalAmount: pledge.totalAmount,
      frequency: pledge.frequency,
      startDate: pledge.startDate ? format(parseISO(pledge.startDate), 'yyyy-MM-dd') : "",
      endDate: pledge.endDate ? format(parseISO(pledge.endDate), 'yyyy-MM-dd') : "",
      notes: pledge.notes || "",
      isAnonymous: pledge.isAnonymous,
    });
    setPledgeDialogOpen(true);
  }

  function openRecordPayment(pledge: Pledge) {
    setSelectedPledgeForPayment(pledge);
    setPaymentForm({
      amount: "",
      paymentMethod: "",
      transactionReference: "",
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      notes: "",
    });
    setPaymentDialogOpen(true);
  }

  function openViewPayments(pledge: Pledge) {
    setViewingPledge(pledge);
    setViewPaymentsDialogOpen(true);
  }

  function handleCampaignSubmit() {
    const data = {
      ...campaignForm,
      goalAmount: campaignForm.goalAmount,
    };
    if (editingCampaign) {
      updateCampaignMutation.mutate({ id: editingCampaign.id.toString(), data });
    } else {
      createCampaignMutation.mutate(data);
    }
  }

  function handlePledgeSubmit() {
    const data = {
      ...pledgeForm,
      campaignId: parseInt(pledgeForm.campaignId),
    };
    if (editingPledge) {
      updatePledgeMutation.mutate({ id: editingPledge.id.toString(), data });
    } else {
      createPledgeMutation.mutate(data);
    }
  }

  function handlePaymentSubmit() {
    if (!selectedPledgeForPayment) return;
    recordPaymentMutation.mutate({
      pledgeId: selectedPledgeForPayment.id.toString(),
      data: paymentForm,
    });
  }

  // Filtered data
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPledges = pledges.filter(p => {
    const userName = p.user ? `${p.user.firstName} ${p.user.lastName}`.toLowerCase() : '';
    const matchesSearch = userName.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  if (!churchId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">Please select a church to manage pledges.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-emerald-500" />
            Pledge & Commitment Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage campaigns, track pledges, and monitor giving progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateCampaign} className="gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
          <Button variant="outline" onClick={() => openCreatePledge()} className="gap-2">
            <PiggyBank className="h-4 w-4" />
            Record Pledge
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{stats?.activeCampaigns ?? campaigns.filter(c => c.status === 'active').length}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-emerald-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pledged</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalPledged ?? 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalCollected ?? 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fulfillment Rate</p>
                <p className="text-2xl font-bold">{stats?.fulfillmentRate ?? 0}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <FolderKanban className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="pledges" className="gap-2">
            <PiggyBank className="h-4 w-4" />
            Pledges
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Active Campaigns Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />
                  Active Campaigns
                </CardTitle>
                <CardDescription>Progress toward campaign goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingCampaigns ? (
                  <p className="text-muted-foreground text-center py-4">Loading...</p>
                ) : activeCampaigns.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No active campaigns</p>
                ) : (
                  activeCampaigns.map(campaign => {
                    const goal = parseFloat(campaign.goalAmount) || 0;
                    const current = parseFloat(campaign.currentAmount) || 0;
                    const pledged = parseFloat(campaign.pledgedAmount) || 0;
                    const progressPercent = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
                    const pledgedPercent = goal > 0 ? Math.min((pledged / goal) * 100, 100) : 0;

                    return (
                      <div key={campaign.id} className="space-y-2 p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {campaign.campaignType.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <Badge variant="secondary">{campaign.pledgeCount ?? 0} pledges</Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Collected: {formatCurrency(current)}</span>
                            <span>Goal: {formatCurrency(goal)}</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(pledged)} pledged ({pledgedPercent.toFixed(0)}% of goal)
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Recent Pledges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  Recent Pledges
                </CardTitle>
                <CardDescription>Latest pledge commitments</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPledges ? (
                  <p className="text-muted-foreground text-center py-4">Loading...</p>
                ) : pledges.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No pledges recorded</p>
                ) : (
                  <div className="space-y-3">
                    {pledges.slice(0, 5).map(pledge => (
                      <div key={pledge.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">
                            {pledge.isAnonymous ? 'Anonymous' : pledge.user ? `${pledge.user.firstName} ${pledge.user.lastName}` : 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {pledge.frequency.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(pledge.totalAmount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(pledge.paidAmount)} paid
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Campaign Breakdown Chart Placeholder */}
          {stats?.campaignBreakdown && stats.campaignBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Campaign Breakdown</CardTitle>
                <CardDescription>Pledged vs collected by campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {stats.campaignBreakdown.map(item => {
                    const progressPercent = item.goal > 0 ? (item.collected / item.goal) * 100 : 0;
                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span>{formatCurrency(item.collected)} / {formatCurrency(item.goal)}</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={openCreateCampaign} className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Pledged</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingCampaigns ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading campaigns...
                    </TableCell>
                  </TableRow>
                ) : filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No campaigns found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map(campaign => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          {campaign.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{campaign.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{campaign.campaignType.replace(/_/g, ' ')}</TableCell>
                      <TableCell>{formatCurrency(campaign.goalAmount)}</TableCell>
                      <TableCell>{formatCurrency(campaign.pledgedAmount)}</TableCell>
                      <TableCell>{formatCurrency(campaign.currentAmount)}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{campaign.startDate ? format(parseISO(campaign.startDate), 'MMM d, yyyy') : 'N/A'}</p>
                          {campaign.endDate && (
                            <p className="text-muted-foreground">to {format(parseISO(campaign.endDate), 'MMM d, yyyy')}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCampaignId(campaign.id.toString());
                              setActiveTab("pledges");
                            }}
                            title="View Pledges"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditCampaign(campaign)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this campaign?')) {
                                deleteCampaignMutation.mutate(campaign.id.toString());
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Pledges Tab */}
        <TabsContent value="pledges" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by member name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="All Campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Campaigns</SelectItem>
                {campaigns.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="defaulted">Defaulted</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => openCreatePledge(selectedCampaignId)} className="gap-2">
              <Plus className="h-4 w-4" />
              Record Pledge
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingPledges ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading pledges...
                    </TableCell>
                  </TableRow>
                ) : filteredPledges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No pledges found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPledges.map(pledge => {
                    const total = parseFloat(pledge.totalAmount) || 0;
                    const paid = parseFloat(pledge.paidAmount) || 0;
                    const remaining = total - paid;
                    const campaign = campaigns.find(c => c.id === pledge.campaignId);

                    return (
                      <TableRow key={pledge.id}>
                        <TableCell>
                          {pledge.isAnonymous ? (
                            <span className="text-muted-foreground italic">Anonymous</span>
                          ) : pledge.user ? (
                            <div className="flex items-center gap-2">
                              {pledge.user.profileImageUrl ? (
                                <img src={pledge.user.profileImageUrl} className="h-8 w-8 rounded-full" alt="" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{pledge.user.firstName} {pledge.user.lastName}</p>
                                <p className="text-sm text-muted-foreground">{pledge.user.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell>{campaign?.name || 'Unknown Campaign'}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(total)}</TableCell>
                        <TableCell className="text-green-600">{formatCurrency(paid)}</TableCell>
                        <TableCell className={remaining > 0 ? "text-amber-600" : "text-green-600"}>
                          {formatCurrency(remaining)}
                        </TableCell>
                        <TableCell className="capitalize">{pledge.frequency.replace(/_/g, ' ')}</TableCell>
                        <TableCell>{getStatusBadge(pledge.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openViewPayments(pledge)} title="View Payments">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openRecordPayment(pledge)} title="Record Payment">
                              <CreditCard className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditPledge(pledge)} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this pledge?')) {
                                  deletePledgeMutation.mutate(pledge.id.toString());
                                }
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Campaign Dialog */}
      <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
            <DialogDescription>
              {editingCampaign ? 'Update campaign details' : 'Set up a new pledge campaign'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., 2024 Building Fund"
                />
              </div>
              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Select
                  value={campaignForm.campaignType}
                  onValueChange={(v) => setCampaignForm(f => ({ ...f, campaignType: v as PledgeCampaign['campaignType'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={campaignForm.description}
                onChange={(e) => setCampaignForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the purpose and goals of this campaign..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Goal Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={campaignForm.goalAmount}
                    onChange={(e) => setCampaignForm(f => ({ ...f, goalAmount: e.target.value }))}
                    placeholder="50000"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={campaignForm.startDate}
                  onChange={(e) => setCampaignForm(f => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date (optional)</Label>
                <Input
                  type="date"
                  value={campaignForm.endDate}
                  onChange={(e) => setCampaignForm(f => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={campaignForm.status}
                  onValueChange={(v) => setCampaignForm(f => ({ ...f, status: v as PledgeCampaign['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reminder Frequency</Label>
                <Select
                  value={campaignForm.reminderFrequency}
                  onValueChange={(v) => setCampaignForm(f => ({ ...f, reminderFrequency: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Reminders</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampaignDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCampaignSubmit}
              disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
            >
              {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pledge Dialog */}
      <Dialog open={pledgeDialogOpen} onOpenChange={setPledgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPledge ? 'Edit Pledge' : 'Record New Pledge'}</DialogTitle>
            <DialogDescription>
              {editingPledge ? 'Update pledge details' : 'Record a member pledge commitment'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Campaign</Label>
              <Select
                value={pledgeForm.campaignId}
                onValueChange={(v) => setPledgeForm(f => ({ ...f, campaignId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.filter(c => c.status === 'active').map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Member</Label>
              <Select
                value={pledgeForm.userId}
                onValueChange={(v) => setPledgeForm(f => ({ ...f, userId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m: { id: string; firstName: string; lastName: string; email: string }) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.user?.firstName} {m.user?.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pledge Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={pledgeForm.totalAmount}
                    onChange={(e) => setPledgeForm(f => ({ ...f, totalAmount: e.target.value }))}
                    placeholder="1000"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Frequency</Label>
                <Select
                  value={pledgeForm.frequency}
                  onValueChange={(v) => setPledgeForm(f => ({ ...f, frequency: v as Pledge['frequency'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLEDGE_FREQUENCIES.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={pledgeForm.startDate}
                  onChange={(e) => setPledgeForm(f => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date (optional)</Label>
                <Input
                  type="date"
                  value={pledgeForm.endDate}
                  onChange={(e) => setPledgeForm(f => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={pledgeForm.notes}
                onChange={(e) => setPledgeForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={pledgeForm.isAnonymous}
                onChange={(e) => setPledgeForm(f => ({ ...f, isAnonymous: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="anonymous">Anonymous pledge</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPledgeDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handlePledgeSubmit}
              disabled={createPledgeMutation.isPending || updatePledgeMutation.isPending}
            >
              {editingPledge ? 'Update Pledge' : 'Record Pledge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {selectedPledgeForPayment && (
                <>
                  Recording payment for pledge of {formatCurrency(selectedPledgeForPayment.totalAmount)}
                  {' '}({formatCurrency(parseFloat(selectedPledgeForPayment.totalAmount) - parseFloat(selectedPledgeForPayment.paidAmount))} remaining)
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="100"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={paymentForm.paymentMethod}
                  onValueChange={(v) => setPaymentForm(f => ({ ...f, paymentMethod: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm(f => ({ ...f, paymentDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Transaction Reference (optional)</Label>
              <Input
                value={paymentForm.transactionReference}
                onChange={(e) => setPaymentForm(f => ({ ...f, transactionReference: e.target.value }))}
                placeholder="Check number, transaction ID, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any notes about this payment..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handlePaymentSubmit}
              disabled={recordPaymentMutation.isPending}
            >
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Payments Dialog */}
      <Dialog open={viewPaymentsDialogOpen} onOpenChange={setViewPaymentsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>
              {viewingPledge && (
                <>
                  Payments for pledge of {formatCurrency(viewingPledge.totalAmount)}
                  {' '}by {viewingPledge.isAnonymous ? 'Anonymous' : viewingPledge.user ? `${viewingPledge.user.firstName} ${viewingPledge.user.lastName}` : 'Unknown'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {viewingPledge && (
              <div className="mb-4 p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pledged</p>
                    <p className="text-xl font-semibold">{formatCurrency(viewingPledge.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-xl font-semibold text-green-600">{formatCurrency(viewingPledge.paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-xl font-semibold text-amber-600">
                      {formatCurrency(parseFloat(viewingPledge.totalAmount) - parseFloat(viewingPledge.paidAmount))}
                    </p>
                  </div>
                </div>
                <Progress
                  value={(parseFloat(viewingPledge.paidAmount) / parseFloat(viewingPledge.totalAmount)) * 100}
                  className="mt-3 h-2"
                />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No payments recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment: PledgePayment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{format(parseISO(payment.paymentDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="capitalize">{payment.paymentMethod?.replace(/_/g, ' ') || '-'}</TableCell>
                      <TableCell>{payment.transactionReference || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{payment.notes || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewPaymentsDialogOpen(false)}>Close</Button>
            {viewingPledge && (
              <Button onClick={() => {
                setViewPaymentsDialogOpen(false);
                openRecordPayment(viewingPledge);
              }}>
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
