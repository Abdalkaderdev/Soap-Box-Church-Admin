import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  Users,
  Download,
  FileText,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Flame,
  Calendar,
  Building2,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  MapPin,
  Bell
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
// Note: AccountingIntegrations component needs to be migrated
// import AccountingIntegrations from "@/components/AccountingIntegrations";

interface DonorSummary {
  donorId: string | null;
  donorName: string;
  donorEmail: string | null;
  donorAddress: string | null;
  fiatTotal: number;
  candleTotal: number;
  candleUsdValue: number;
  totalTaxDeductible: number;
  donationCount: number;
  firstDonation: string | null;
  lastDonation: string | null;
}

interface TaxStatementBatch {
  id: number;
  batchId: string;
  statementYear: number;
  totalStatements: number;
  totalFiatAmount: string;
  totalCandleAmount: number;
  totalCandleUsdValue: string;
  status: string;
  generatedAt: string;
}

interface DonorTrend {
  donorId: string;
  donorName: string;
  donorEmail: string | null;
  currentPeriodTotal: number;
  previousPeriodTotal: number;
  percentChange: number;
  trend: 'growing' | 'stable' | 'declining' | 'lapsed' | 'new';
  lastDonation: string | null;
  donationFrequency: number;
  averageGift: number;
}

interface TrendSummary {
  growing: number;
  stable: number;
  declining: number;
  lapsed: number;
  new: number;
  total: number;
}

interface ReportingSummary {
  totalDonors: number;
  totalFiatAmount: number;
  totalCandleAmount: number;
  totalCandleUsdValue: number;
  totalTaxDeductible: number;
  byCategory: { category: string; amount: number; count: number }[];
  byMonth: { month: string; fiat: number; candle: number; count: number }[];
}

interface ChurchTaxSettings {
  id?: number;
  legalName: string | null;
  ein: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  statementHeaderText: string | null;
  statementFooterText: string | null;
  noGoodsServicesText: string | null;
}

interface Campus {
  id: number;
  name: string;
  campusCode: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  isMainCampus: boolean;
  memberCount: number;
}

interface TaxDeadline {
  name: string;
  date: string;
  description: string;
  daysUntil: number;
}

interface StatementPreview {
  donorName: string;
  donorEmail: string;
  totalFiat: number;
  totalCandles: number;
  totalCandleUsd: number;
  totalDeductible: number;
  donationCount: number;
}

interface Community {
  id: number;
  name: string;
  type: string;
}

// Candle conversion rate (used in Super App)
// const CANDLE_USD_RATE = 0.01;

const TREND_COLORS = {
  growing: '#10B981',
  stable: '#6B7280',
  declining: '#EF4444',
  lapsed: '#F59E0B',
  new: '#3B82F6',
};

const TREND_ICONS = {
  growing: ArrowUpRight,
  stable: Minus,
  declining: ArrowDownRight,
  lapsed: Clock,
  new: Users,
};

export default function TaxReporting() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_location] = useLocation();

  const [selectedChurchId, setSelectedChurchId] = useState<number | null>(null);

  const { data: communitiesData, isLoading: loadingCommunities } = useQuery<{ communities: Community[] }>({
    queryKey: ['/api/stripe/connect/communities'],
    enabled: isAuthenticated,
  });

  const churches = communitiesData?.communities?.filter(c => c.type === 'church') || [];
  const selectedChurch = churches.find(c => c.id === selectedChurchId);

  useEffect(() => {
    if (churches.length > 0 && !selectedChurchId) {
      const firstChurch = churches[0];
      if (firstChurch) {
        setSelectedChurchId(firstChurch.id);
      }
    }
  }, [churches, selectedChurchId]);

  const handleChurchChange = (value: string) => {
    setSelectedChurchId(parseInt(value, 10));
  };

  const communityId = selectedChurchId;

  // Check if user has admin access (used for feature gates)
  // const isChurchOrSoapBoxAdmin = (user?.role as string) === 'super_admin' ||
  //   (user?.role as string) === 'soapbox_admin' ||
  //   churches.length > 0;

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeadlinesDialog, setShowDeadlinesDialog] = useState(false);
  const [selectedCampusIds, setSelectedCampusIds] = useState<number[]>([]);
  const [generateOptions, setGenerateOptions] = useState({
    includeFiat: true,
    includeCandle: true,
    includeItemizedList: true,
    candleDisplayMode: 'separate' as 'separate' | 'combined' | 'usd_only',
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const { data: donorSummaries, isLoading: loadingDonors } = useQuery<{ summaries: DonorSummary[]; totalDonors: number }>({
    queryKey: ['/api/tax-reporting', communityId, 'donors', selectedYear],
    queryFn: () => fetch(`/api/tax-reporting/${communityId}/donors?year=${selectedYear}`).then(res => res.json()),
    enabled: !!communityId,
  });

  const previewQueryKey = [
    '/api/tax-reporting', communityId, 'donors', selectedYear, 'preview',
    selectedCampusIds.join(','),
    generateOptions.includeFiat,
    generateOptions.includeCandle
  ];
  const { data: filteredDonorSummaries, isLoading: _loadingPreview, refetch: _refetchPreview } = useQuery<{ summaries: DonorSummary[]; totalDonors: number }>({
    queryKey: previewQueryKey,
    queryFn: () => {
      const params = new URLSearchParams({
        year: String(selectedYear),
        includeFiat: String(generateOptions.includeFiat),
        includeCandle: String(generateOptions.includeCandle),
      });
      if (selectedCampusIds.length > 0) {
        params.set('campusIds', selectedCampusIds.join(','));
      }
      return fetch(`/api/tax-reporting/${communityId}/donors?${params}`).then(res => res.json());
    },
    enabled: !!communityId && showPreviewDialog,
  });

  const { data: reportingSummary, isLoading: loadingSummary } = useQuery<{ summary: ReportingSummary }>({
    queryKey: ['/api/tax-reporting', communityId, 'summary', selectedYear],
    queryFn: () => fetch(`/api/tax-reporting/${communityId}/summary?year=${selectedYear}`).then(res => res.json()),
    enabled: !!communityId,
  });

  const { data: trendData, isLoading: loadingTrends } = useQuery<{ trends: DonorTrend[]; summary: TrendSummary }>({
    queryKey: ['/api/tax-reporting', communityId, 'trends'],
    queryFn: () => fetch(`/api/tax-reporting/${communityId}/trends`).then(res => res.json()),
    enabled: !!communityId,
  });

  const { data: batches, isLoading: loadingBatches } = useQuery<{ batches: TaxStatementBatch[] }>({
    queryKey: ['/api/tax-reporting', communityId, 'statements', 'batches'],
    queryFn: () => fetch(`/api/tax-reporting/${communityId}/statements/batches`).then(res => res.json()),
    enabled: !!communityId,
  });

  const { data: taxSettings } = useQuery<{ settings: ChurchTaxSettings | null }>({
    queryKey: ['/api/tax-reporting', communityId, 'settings'],
    queryFn: () => fetch(`/api/tax-reporting/${communityId}/settings`).then(res => res.json()),
    enabled: !!communityId,
  });

  const { data: campusData } = useQuery<{ campuses: Campus[] }>({
    queryKey: ['/api/churches', communityId, 'campuses'],
    queryFn: () => fetch(`/api/churches/${communityId}/campuses`).then(res => res.json()),
    enabled: !!communityId,
  });

  const { data: deadlinesData } = useQuery<{ deadlines: TaxDeadline[]; upcoming: TaxDeadline[] }>({
    queryKey: ['/api/tax-reporting/deadlines', selectedYear],
    queryFn: () => fetch(`/api/tax-reporting/deadlines?year=${selectedYear}`).then(res => res.json()),
  });

  const campuses = campusData?.campuses || [];
  const hasMultipleCampuses = campuses.length > 1;

  const getStatementPreview = (): StatementPreview[] => {
    const summaries = showPreviewDialog && filteredDonorSummaries?.summaries
      ? filteredDonorSummaries.summaries
      : donorSummaries?.summaries;

    if (!summaries) return [];

    return summaries.map(donor => ({
      donorName: donor.donorName,
      donorEmail: donor.donorEmail || '',
      totalFiat: donor.fiatTotal,
      totalCandles: donor.candleTotal,
      totalCandleUsd: donor.candleUsdValue,
      totalDeductible: donor.fiatTotal + donor.candleUsdValue,
      donationCount: donor.donationCount,
    })).filter(donor => donor.totalFiat > 0 || donor.totalCandles > 0);
  };

  const generateStatementsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/tax-reporting/${communityId}/statements/generate`, {
        method: 'POST',
        body: JSON.stringify({
          year: selectedYear,
          ...generateOptions,
          ...(selectedCampusIds.length > 0 && { campusIds: selectedCampusIds }),
        }),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Statements Generated",
        description: `Successfully generated ${data.batch?.totalStatements || 0} tax statements.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tax-reporting', communityId] });
      setShowGenerateDialog(false);
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate tax statements. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<ChurchTaxSettings>) => {
      return apiRequest(`/api/tax-reporting/${communityId}/settings`, {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Tax settings updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tax-reporting', communityId, 'settings'] });
      setShowSettingsDialog(false);
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save tax settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleExport = async (format: string) => {
    try {
      const response = await fetch(`/api/tax-reporting/${communityId}/export?year=${selectedYear}&format=${format}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-report-${selectedYear}.${format === 'excel' ? 'csv' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Downloaded ${format.toUpperCase()} export successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please sign in to access tax reporting.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const summary = reportingSummary?.summary;
  const trends = trendData?.summary;

  const trendPieData = trends ? [
    { name: 'Growing', value: trends.growing, color: TREND_COLORS.growing },
    { name: 'Stable', value: trends.stable, color: TREND_COLORS.stable },
    { name: 'Declining', value: trends.declining, color: TREND_COLORS.declining },
    { name: 'Lapsed', value: trends.lapsed, color: TREND_COLORS.lapsed },
    { name: 'New', value: trends.new, color: TREND_COLORS.new },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
              Tax Reporting & Analytics
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">IRS-compliant tax documentation and donor analytics</p>
        </div>

        {loadingCommunities ? (
          <Skeleton className="h-16 w-full max-w-md mb-6" />
        ) : churches.length === 0 ? (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have admin access to any churches. Contact your community administrator for access.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="mb-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Church</Label>
                  <Select
                    value={selectedChurchId?.toString() || ''}
                    onValueChange={handleChurchChange}
                  >
                    <SelectTrigger className="w-64 mt-1" data-testid="select-church">
                      <SelectValue placeholder="Select a church..." />
                    </SelectTrigger>
                    <SelectContent>
                      {churches.map((church) => (
                        <SelectItem
                          key={church.id}
                          value={church.id.toString()}
                          data-testid={`select-church-${church.id}`}
                        >
                          {church.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedChurch && (
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                    {churches.length} {churches.length === 1 ? 'church' : 'churches'} available
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {communityId && (
          <>
            <div className="flex justify-between items-center">
              <div></div>
              <div className="flex items-center space-x-3">
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-32" data-testid="select-year">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="button-settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Church Tax Settings</DialogTitle>
                      <DialogDescription>Configure your organization's tax information for statements</DialogDescription>
                    </DialogHeader>
                    <TaxSettingsForm
                      settings={taxSettings?.settings}
                      onSave={(settings) => saveSettingsMutation.mutate(settings)}
                      isPending={saveSettingsMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-generate-statements">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Statements
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Tax Statements</DialogTitle>
                      <DialogDescription>Create IRS-compliant tax statements for {selectedYear}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeFiat"
                          checked={generateOptions.includeFiat}
                          onCheckedChange={(checked) => setGenerateOptions(prev => ({ ...prev, includeFiat: !!checked }))}
                        />
                        <Label htmlFor="includeFiat">Include fiat donations (USD)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeCandle"
                          checked={generateOptions.includeCandle}
                          onCheckedChange={(checked) => setGenerateOptions(prev => ({ ...prev, includeCandle: !!checked }))}
                        />
                        <Label htmlFor="includeCandle">Include Candle token donations (valued at $0.01/Candle)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeItemized"
                          checked={generateOptions.includeItemizedList}
                          onCheckedChange={(checked) => setGenerateOptions(prev => ({ ...prev, includeItemizedList: !!checked }))}
                        />
                        <Label htmlFor="includeItemized">Include itemized donation list</Label>
                      </div>
                      <div className="space-y-2">
                        <Label>Candle Display Mode</Label>
                        <Select
                          value={generateOptions.candleDisplayMode}
                          onValueChange={(v) => setGenerateOptions(prev => ({ ...prev, candleDisplayMode: v as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="separate">Show separately (Candles + USD value)</SelectItem>
                            <SelectItem value="combined">Combined with fiat total</SelectItem>
                            <SelectItem value="usd_only">USD value only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {hasMultipleCampuses && (
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Filter by Campus (Optional)
                          </Label>
                          <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                            {campuses.map((campus) => (
                              <div key={campus.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`campus-${campus.id}`}
                                  checked={selectedCampusIds.includes(campus.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedCampusIds(prev => [...prev, campus.id]);
                                    } else {
                                      setSelectedCampusIds(prev => prev.filter(id => id !== campus.id));
                                    }
                                  }}
                                />
                                <Label htmlFor={`campus-${campus.id}`} className="flex items-center gap-2 cursor-pointer">
                                  {campus.name}
                                  {campus.isMainCampus && <Badge variant="secondary" className="text-xs">Main</Badge>}
                                  <span className="text-xs text-muted-foreground">({campus.memberCount} members)</span>
                                </Label>
                              </div>
                            ))}
                          </div>
                          {selectedCampusIds.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Filtering to {selectedCampusIds.length} campus{selectedCampusIds.length > 1 ? 'es' : ''}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowGenerateDialog(false);
                          setShowPreviewDialog(true);
                        }}
                        data-testid="button-preview-statements"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Cancel</Button>
                        <Button
                          onClick={() => generateStatementsMutation.mutate()}
                          disabled={generateStatementsMutation.isPending}
                          data-testid="button-confirm-generate"
                        >
                          {generateStatementsMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                          Generate Statements
                        </Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={() => setShowDeadlinesDialog(true)} data-testid="button-deadlines">
                  <Bell className="h-4 w-4 mr-2" />
                  Deadlines
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loadingSummary ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold" data-testid="text-total-donors">{summary?.totalDonors || 0}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fiat Donations</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loadingSummary ? (
                    <Skeleton className="h-8 w-32" />
                  ) : (
                    <div className="text-2xl font-bold" data-testid="text-fiat-total">{formatCurrency(summary?.totalFiatAmount || 0)}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Candle Donations</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loadingSummary ? (
                    <Skeleton className="h-8 w-32" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold" data-testid="text-candle-total">{(summary?.totalCandleAmount || 0).toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">{formatCurrency(summary?.totalCandleUsdValue || 0)} USD value</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tax Deductible</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loadingSummary ? (
                    <Skeleton className="h-8 w-32" />
                  ) : (
                    <div className="text-2xl font-bold text-green-600" data-testid="text-tax-deductible">
                      {formatCurrency(summary?.totalTaxDeductible || 0)}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Combined Total</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loadingSummary ? (
                    <Skeleton className="h-8 w-32" />
                  ) : (
                    <div className="text-2xl font-bold" data-testid="text-combined-total">
                      {formatCurrency((summary?.totalFiatAmount || 0) + (summary?.totalCandleUsdValue || 0))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="donors" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="donors" data-testid="tab-donors">Donors</TabsTrigger>
                <TabsTrigger value="trends" data-testid="tab-trends">Trends</TabsTrigger>
                <TabsTrigger value="statements" data-testid="tab-statements">Statements</TabsTrigger>
                <TabsTrigger value="exports" data-testid="tab-exports">Exports</TabsTrigger>
                <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
                <TabsTrigger value="integrations" data-testid="tab-integrations">Integrations</TabsTrigger>
              </TabsList>

              <TabsContent value="donors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Donor Summary for {selectedYear}</CardTitle>
                    <CardDescription>Complete list of donors with their giving totals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingDonors ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : donorSummaries?.summaries?.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Donor Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Fiat Total</TableHead>
                            <TableHead className="text-right">Candles</TableHead>
                            <TableHead className="text-right">Candle USD</TableHead>
                            <TableHead className="text-right">Tax Deductible</TableHead>
                            <TableHead className="text-center">Donations</TableHead>
                            <TableHead>Last Gift</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {donorSummaries.summaries.map((donor, index) => (
                            <TableRow key={donor.donorId || index} data-testid={`row-donor-${index}`}>
                              <TableCell className="font-medium">{donor.donorName}</TableCell>
                              <TableCell className="text-muted-foreground">{donor.donorEmail || '-'}</TableCell>
                              <TableCell className="text-right">{formatCurrency(donor.fiatTotal)}</TableCell>
                              <TableCell className="text-right">{donor.candleTotal.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{formatCurrency(donor.candleUsdValue)}</TableCell>
                              <TableCell className="text-right text-green-600">{formatCurrency(donor.totalTaxDeductible)}</TableCell>
                              <TableCell className="text-center">{donor.donationCount}</TableCell>
                              <TableCell>{formatDate(donor.lastDonation)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No donations found for {selectedYear}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Donor Trend Distribution</CardTitle>
                      <CardDescription>Year-over-year giving patterns analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingTrends ? (
                        <Skeleton className="h-64 w-full" />
                      ) : trendPieData.length > 0 ? (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={trendPieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                              >
                                {trendPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No trend data available</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Trend Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingTrends ? (
                        <div className="space-y-3">
                          {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                          ))}
                        </div>
                      ) : trends ? (
                        <div className="space-y-3">
                          {Object.entries(TREND_COLORS).map(([key, color]) => {
                            const Icon = TREND_ICONS[key as keyof typeof TREND_ICONS];
                            const count = trends[key as keyof TrendSummary] as number;
                            return (
                              <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" style={{ color }} />
                                  <span className="capitalize">{key}</span>
                                </div>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            );
                          })}
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between font-medium">
                              <span>Total Donors</span>
                              <span>{trends.total}</span>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Donor Trend Details</CardTitle>
                    <CardDescription>Individual donor giving patterns compared to previous year</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingTrends ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : trendData?.trends?.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Donor</TableHead>
                            <TableHead className="text-right">Current Year</TableHead>
                            <TableHead className="text-right">Previous Year</TableHead>
                            <TableHead className="text-right">Change</TableHead>
                            <TableHead>Trend</TableHead>
                            <TableHead className="text-right">Avg Gift</TableHead>
                            <TableHead>Last Donation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trendData.trends.slice(0, 20).map((donor, index) => {
                            const TrendIcon = TREND_ICONS[donor.trend];
                            return (
                              <TableRow key={donor.donorId || index} data-testid={`row-trend-${index}`}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{donor.donorName}</div>
                                    <div className="text-sm text-muted-foreground">{donor.donorEmail || ''}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(donor.currentPeriodTotal)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(donor.previousPeriodTotal)}</TableCell>
                                <TableCell className="text-right">
                                  <span style={{ color: donor.percentChange >= 0 ? TREND_COLORS.growing : TREND_COLORS.declining }}>
                                    {donor.percentChange >= 0 ? '+' : ''}{donor.percentChange.toFixed(1)}%
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="gap-1"
                                    style={{ borderColor: TREND_COLORS[donor.trend], color: TREND_COLORS[donor.trend] }}
                                  >
                                    <TrendIcon className="h-3 w-3" />
                                    {donor.trend}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(donor.averageGift)}</TableCell>
                                <TableCell>{formatDate(donor.lastDonation)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No trend data available</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="statements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Statement Batches</CardTitle>
                    <CardDescription>History of tax statement generation batches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingBatches ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : batches?.batches?.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Batch ID</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead className="text-center">Statements</TableHead>
                            <TableHead className="text-right">Fiat Total</TableHead>
                            <TableHead className="text-right">Candle Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Generated</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {batches.batches.map((batch) => (
                            <TableRow key={batch.id} data-testid={`row-batch-${batch.batchId}`}>
                              <TableCell className="font-mono text-sm">{batch.batchId}</TableCell>
                              <TableCell>{batch.statementYear}</TableCell>
                              <TableCell className="text-center">{batch.totalStatements}</TableCell>
                              <TableCell className="text-right">{formatCurrency(parseFloat(batch.totalFiatAmount))}</TableCell>
                              <TableCell className="text-right">{batch.totalCandleAmount.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant={batch.status === 'completed' ? 'default' : 'secondary'}>
                                  {batch.status === 'completed' ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Clock className="h-3 w-3 mr-1" />
                                  )}
                                  {batch.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(batch.generatedAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Statements Generated</h3>
                        <p className="text-muted-foreground mb-4">Generate your first batch of tax statements</p>
                        <Button onClick={() => setShowGenerateDialog(true)} data-testid="button-generate-first">
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Statements
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="exports" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        CSV Export
                      </CardTitle>
                      <CardDescription>Standard comma-separated values format</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Export all donation data in CSV format, compatible with Excel, Google Sheets, and most spreadsheet applications.
                      </p>
                      <Button className="w-full" onClick={() => handleExport('csv')} data-testid="button-export-csv">
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Excel Export
                      </CardTitle>
                      <CardDescription>Excel-compatible format with UTF-8 encoding</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        CSV with BOM (Byte Order Mark) for proper UTF-8 character display in Microsoft Excel.
                      </p>
                      <Button className="w-full" onClick={() => handleExport('excel')} data-testid="button-export-excel">
                        <Download className="h-4 w-4 mr-2" />
                        Download Excel CSV
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        QuickBooks IIF
                      </CardTitle>
                      <CardDescription>Intuit Interchange Format for QuickBooks Desktop</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Export in IIF format for direct import into QuickBooks Desktop for accounting integration.
                      </p>
                      <Button className="w-full" onClick={() => handleExport('iif')} data-testid="button-export-iif">
                        <Download className="h-4 w-4 mr-2" />
                        Download IIF
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                {summary?.byMonth && summary.byMonth.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Giving Breakdown</CardTitle>
                      <CardDescription>Fiat and Candle donations by month for {selectedYear}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={summary.byMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                              formatter={(value, name) => [
                                name === 'candle' ? `${Number(value ?? 0).toLocaleString()} Candles` : formatCurrency(Number(value ?? 0)),
                                name === 'fiat' ? 'Fiat' : 'Candle (USD value)'
                              ]}
                            />
                            <Legend />
                            <Bar dataKey="fiat" fill="#3B82F6" name="Fiat Donations" />
                            <Bar dataKey="candle" fill="#F59E0B" name="Candle Value" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {summary?.byCategory && summary.byCategory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Giving by Category</CardTitle>
                      <CardDescription>Distribution of donations across different funds</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {summary.byCategory.map((cat, index) => (
                          <div key={index} className="p-4 border rounded-lg" data-testid={`card-category-${index}`}>
                            <h4 className="font-medium">{cat.category}</h4>
                            <div className="text-2xl font-bold mt-1">{formatCurrency(cat.amount)}</div>
                            <div className="text-sm text-muted-foreground">{cat.count} donations</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!loadingSummary && (!summary?.byMonth?.length && !summary?.byCategory?.length) && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">No Analytics Data</h3>
                      <p className="text-muted-foreground">No donation data found for {selectedYear}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="integrations" className="space-y-6">
                {/* TODO: Migrate AccountingIntegrations component */}
                <Card>
                  <CardHeader>
                    <CardTitle>Accounting Integrations</CardTitle>
                    <CardDescription>Connect to QuickBooks, Xero, and other accounting software</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      AccountingIntegrations component needs to be migrated from SoapBox-Super-App.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Statement Preview Dialog */}
            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Statement Preview - {selectedYear}
                  </DialogTitle>
                  <DialogDescription>
                    Preview of donors who will receive tax statements based on current filters
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Donor Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Fiat ($)</TableHead>
                        <TableHead className="text-right">Candles</TableHead>
                        <TableHead className="text-right">Total Deductible</TableHead>
                        <TableHead className="text-center"># Donations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getStatementPreview().map((preview, index) => (
                        <TableRow key={index} data-testid={`preview-row-${index}`}>
                          <TableCell className="font-medium">{preview.donorName}</TableCell>
                          <TableCell className="text-muted-foreground">{preview.donorEmail || 'No email'}</TableCell>
                          <TableCell className="text-right">{formatCurrency(preview.totalFiat)}</TableCell>
                          <TableCell className="text-right">
                            {preview.totalCandles.toLocaleString()}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({formatCurrency(preview.totalCandleUsd)})
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {formatCurrency(preview.totalDeductible)}
                          </TableCell>
                          <TableCell className="text-center">{preview.donationCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {getStatementPreview().length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No donors found for the selected criteria
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{getStatementPreview().length}</span> statements will be generated
                      {selectedCampusIds.length > 0 && (
                        <span className="ml-2">
                          (filtered by {selectedCampusIds.length} campus{selectedCampusIds.length > 1 ? 'es' : ''})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          setShowPreviewDialog(false);
                          setShowGenerateDialog(true);
                        }}
                      >
                        Back to Generate
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Tax Deadlines Dialog */}
            <Dialog open={showDeadlinesDialog} onOpenChange={setShowDeadlinesDialog}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Tax Deadlines - {selectedYear}
                  </DialogTitle>
                  <DialogDescription>
                    Important IRS tax filing deadlines and reminders
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {deadlinesData?.upcoming && deadlinesData.upcoming.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Upcoming Deadlines</h4>
                        {deadlinesData.upcoming.map((deadline, index) => (
                          <div
                            key={index}
                            className={`p-4 border rounded-lg ${deadline.daysUntil <= 30 ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : ''}`}
                            data-testid={`deadline-${index}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium">{deadline.name}</h5>
                                <p className="text-sm text-muted-foreground mt-1">{deadline.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {new Date(deadline.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                                <Badge
                                  variant={deadline.daysUntil <= 30 ? "destructive" : "secondary"}
                                  className="mt-1"
                                >
                                  {deadline.daysUntil} days
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming deadlines for {selectedYear}</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowDeadlinesDialog(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}

function TaxSettingsForm({
  settings,
  onSave,
  isPending
}: {
  settings: ChurchTaxSettings | null | undefined;
  onSave: (settings: Partial<ChurchTaxSettings>) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState<Partial<ChurchTaxSettings>>({
    legalName: settings?.legalName || '',
    ein: settings?.ein || '',
    address: settings?.address || '',
    city: settings?.city || '',
    state: settings?.state || '',
    zipCode: settings?.zipCode || '',
    statementHeaderText: settings?.statementHeaderText || '',
    statementFooterText: settings?.statementFooterText || '',
    noGoodsServicesText: settings?.noGoodsServicesText || 'No goods or services were provided in exchange for these contributions.',
  });

  const handleChange = (field: keyof ChurchTaxSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="legalName">Legal Organization Name</Label>
          <Input
            id="legalName"
            value={formData.legalName || ''}
            onChange={(e) => handleChange('legalName', e.target.value)}
            placeholder="First Church of Example"
            data-testid="input-legal-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ein">EIN (Tax ID)</Label>
          <Input
            id="ein"
            value={formData.ein || ''}
            onChange={(e) => handleChange('ein', e.target.value)}
            placeholder="XX-XXXXXXX"
            data-testid="input-ein"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          value={formData.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="123 Church Street"
          data-testid="input-address"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="City"
            data-testid="input-city"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="State"
            data-testid="input-state"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={formData.zipCode || ''}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            placeholder="12345"
            data-testid="input-zip"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="statementHeaderText">Statement Header Text</Label>
        <Textarea
          id="statementHeaderText"
          value={formData.statementHeaderText || ''}
          onChange={(e) => handleChange('statementHeaderText', e.target.value)}
          placeholder="Thank you for your generous support..."
          rows={2}
          data-testid="input-header-text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="noGoodsServicesText">No Goods/Services Statement</Label>
        <Textarea
          id="noGoodsServicesText"
          value={formData.noGoodsServicesText || ''}
          onChange={(e) => handleChange('noGoodsServicesText', e.target.value)}
          placeholder="No goods or services were provided..."
          rows={2}
          data-testid="input-no-goods-text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="statementFooterText">Statement Footer Text</Label>
        <Textarea
          id="statementFooterText"
          value={formData.statementFooterText || ''}
          onChange={(e) => handleChange('statementFooterText', e.target.value)}
          placeholder="Please retain this statement for your tax records..."
          rows={2}
          data-testid="input-footer-text"
        />
      </div>

      <DialogFooter>
        <Button onClick={() => onSave(formData)} disabled={isPending} data-testid="button-save-settings">
          {isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
          Save Settings
        </Button>
      </DialogFooter>
    </div>
  );
}
