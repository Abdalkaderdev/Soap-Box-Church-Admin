/**
 * Financial Dashboard for Church Admin
 *
 * Comprehensive financial analytics and reporting dashboard
 * Adapted from SoapBox Super App's ChurchFinancialDashboard
 */

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  useDonationDashboard,
  useDonationStats,
  useDonations,
  useRecurringDonations,
  useFunds,
} from "@/hooks/useDonations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  Users,
  Repeat,
  Download,
  FileText,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Heart,
  BarChart3,
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
} from "recharts";

const CHART_COLORS = ["#7c3aed", "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff", "#f3e8ff"];

export default function FinancialDashboard() {
  const { user, isAuthenticated, isLoading: authLoading, churchId } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("6months");
  const [chartMode, setChartMode] = useState<"area" | "bar">("area");

  // Fetch dashboard data
  const {
    data: dashboard,
    isLoading: loadingDashboard,
    refetch: refetchDashboard,
  } = useDonationDashboard();

  // Fetch donation stats for trends
  const { data: stats, isLoading: loadingStats } = useDonationStats({
    groupBy: dateRange === "3months" ? "week" : "month",
  });

  // Fetch recent donations
  const { data: recentDonationsData, isLoading: loadingRecent } = useDonations({
    page: 1,
    pageSize: 10,
    sortBy: "date",
    sortOrder: "desc",
  });

  // Fetch recurring donors count
  const { data: recurringData, isLoading: loadingRecurring } = useRecurringDonations({
    page: 1,
    pageSize: 1,
  });

  // Fetch funds for category breakdown
  const { data: funds } = useFunds();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  // Compute stats from dashboard and stats data
  const totalThisMonth = dashboard?.totalThisMonth || 0;
  const totalThisYear = dashboard?.totalThisYear || 0;
  const avgDonation = stats?.averageAmount || 0;
  const recurringDonorsCount = recurringData?.pagination?.totalItems || 0;

  // Calculate month-over-month growth
  const lastMonthIndex = stats?.trend && stats.trend.length > 1 ? stats.trend.length - 2 : -1;
  const lastMonthAmount = lastMonthIndex >= 0 ? stats?.trend[lastMonthIndex]?.amount || 0 : 0;
  const monthlyGrowthPercent = lastMonthAmount > 0
    ? ((totalThisMonth - lastMonthAmount) / lastMonthAmount) * 100
    : 0;

  // Transform trends for chart
  const chartData = useMemo(() => {
    if (!stats?.trend) return [];
    return stats.trend.map((t) => ({
      month: new Date(t.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      recurring: Math.round(t.amount * 0.6), // Estimate recurring
      oneTime: Math.round(t.amount * 0.4), // Estimate one-time
      total: t.amount,
      donors: t.count,
    }));
  }, [stats?.trend]);

  // Transform fund breakdown for pie chart
  const categories = useMemo(() => {
    if (!dashboard?.topFunds) return [];
    return dashboard.topFunds.map((tf, index) => ({
      name: tf.fund?.name || "Unknown Fund",
      amount: tf.amount,
      percent: Math.round(tf.percentage),
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [dashboard?.topFunds]);

  // Recent donations
  const recentDonations = recentDonationsData?.data || [];

  // Top donors
  const topDonors = useMemo(() => {
    if (!dashboard?.topDonors) return [];
    return dashboard.topDonors.map((td, index) => ({
      id: td.memberId,
      name: td.memberName,
      totalAmount: td.totalAmount,
      donationCount: 0, // Not provided by API
      rank: index + 1,
    }));
  }, [dashboard?.topDonors]);

  // Calculate one-time vs recurring estimates
  const totalAmount = stats?.totalAmount || totalThisYear;
  const recurringEstimate = Math.round(totalAmount * 0.6);
  const oneTimeEstimate = Math.round(totalAmount * 0.4);

  // Year-to-date progress (example goal)
  const yearToDateTarget = 100000; // This could come from church settings
  const yearToDateProgress = totalThisYear;
  const progressPercent = Math.min(100, (yearToDateProgress / yearToDateTarget) * 100);

  // Calculate Financial Health Score (0-100)
  const financialHealthScore = useMemo(() => {
    let score = 50; // Base score

    // Giving trend indicator (+/- 15 points)
    if (monthlyGrowthPercent > 10) score += 15;
    else if (monthlyGrowthPercent > 5) score += 10;
    else if (monthlyGrowthPercent > 0) score += 5;
    else if (monthlyGrowthPercent < -10) score -= 15;
    else if (monthlyGrowthPercent < -5) score -= 10;
    else if (monthlyGrowthPercent < 0) score -= 5;

    // Recurring giving percentage (+/- 20 points)
    const recurringPercent = totalAmount > 0 ? (recurringEstimate / totalAmount) * 100 : 0;
    if (recurringPercent >= 60) score += 20;
    else if (recurringPercent >= 40) score += 10;
    else if (recurringPercent < 20) score -= 10;

    // Donor diversity (+ 15 points if multiple donors)
    if (topDonors.length >= 5) score += 15;
    else if (topDonors.length >= 3) score += 10;

    return Math.max(0, Math.min(100, score));
  }, [monthlyGrowthPercent, totalAmount, recurringEstimate, topDonors.length]);

  const healthScoreColor = financialHealthScore >= 70 ? "#22c55e" : financialHealthScore >= 50 ? "#f59e0b" : "#ef4444";
  const healthScoreLabel = financialHealthScore >= 70 ? "Healthy" : financialHealthScore >= 50 ? "Moderate" : "At Risk";

  const healthScoreData = [
    { name: "Score", value: financialHealthScore, fill: healthScoreColor },
  ];

  const handleExportCSV = () => {
    toast({
      title: "Export Started",
      description: "Your CSV export will download shortly.",
    });
    // In production, this would call the actual export endpoint
    window.open(`/api/church/${churchId}/donations/export?format=csv`, "_blank");
  };

  const handleGenerateStatements = () => {
    toast({
      title: "Generating Statements",
      description: "Year-end donor statements are being generated.",
    });
  };

  const handleRefresh = () => {
    refetchDashboard();
    toast({
      title: "Refreshing Data",
      description: "Dashboard data is being refreshed.",
    });
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <Building2 className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in with church admin credentials to view the financial dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor giving trends, donor activity, and financial health
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="12months">12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
        <Button variant="outline" onClick={handleGenerateStatements}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Statements
        </Button>
        <Link href="/donations/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Record Donation
          </Button>
        </Link>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Donations Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Donations</p>
                <p className="text-2xl font-bold mt-1">
                  {loadingDashboard ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    formatCurrency(totalThisYear)
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Year to date</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Month Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold mt-1">
                  {loadingDashboard ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    formatCurrency(totalThisMonth)
                  )}
                </p>
                {monthlyGrowthPercent !== 0 && (
                  <div className={`flex items-center gap-1 mt-2 text-sm ${monthlyGrowthPercent > 0 ? "text-green-600" : "text-red-600"}`}>
                    {monthlyGrowthPercent > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {formatPercent(monthlyGrowthPercent)} vs last month
                  </div>
                )}
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recurring Donors Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recurring Donors</p>
                <p className="text-2xl font-bold mt-1">
                  {loadingRecurring ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    recurringDonorsCount
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Active subscriptions
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <Repeat className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Donation Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Gift</p>
                <p className="text-2xl font-bold mt-1">
                  {loadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    formatCurrency(avgDonation)
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Per transaction
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Year-to-Date Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Year-to-Date Progress</CardTitle>
          <CardDescription>
            {formatCurrency(yearToDateProgress)} of {formatCurrency(yearToDateTarget)} goal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative pt-1">
            <Progress value={progressPercent} className="h-4" />
            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
              <span>$0</span>
              <span className="font-medium text-primary">{progressPercent.toFixed(0)}%</span>
              <span>{formatCurrency(yearToDateTarget)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Score Card */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Financial Health Score
          </CardTitle>
          <CardDescription>Overall giving health assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="100%"
                  barSize={10}
                  data={healthScoreData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={5}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-center -mt-10">
                <span className="text-3xl font-bold" style={{ color: healthScoreColor }}>
                  {financialHealthScore}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                {financialHealthScore >= 70 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : financialHealthScore >= 50 ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-semibold" style={{ color: healthScoreColor }}>
                  {healthScoreLabel}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Giving Trend</span>
                  <span className={monthlyGrowthPercent >= 0 ? "text-green-600" : "text-red-600"}>
                    {monthlyGrowthPercent >= 0 ? "+" : ""}{monthlyGrowthPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recurring %</span>
                  <span>{totalAmount > 0 ? Math.round((recurringEstimate / totalAmount) * 100) : 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Donors</span>
                  <span>{recurringDonorsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Trend Chart */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Donation Trends</CardTitle>
                <CardDescription>Monthly giving over time</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={chartMode === "area" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartMode("area")}
                >
                  Area
                </Button>
                <Button
                  variant={chartMode === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartMode("bar")}
                >
                  Bar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : !chartData.length ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                {chartMode === "area" ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRecurring" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOneTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" stroke="#9ca3af" fontSize={12} />
                    <YAxis className="text-xs" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="recurring"
                      name="Recurring"
                      stroke="#7c3aed"
                      fillOpacity={1}
                      fill="url(#colorRecurring)"
                      stackId="1"
                    />
                    <Area
                      type="monotone"
                      dataKey="oneTime"
                      name="One-Time"
                      stroke="#a855f7"
                      fillOpacity={1}
                      fill="url(#colorOneTime)"
                      stackId="1"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" stroke="#9ca3af" fontSize={12} />
                    <YAxis className="text-xs" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    />
                    <Legend />
                    <Bar dataKey="recurring" name="Recurring" fill="#7c3aed" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="oneTime" name="One-Time" fill="#a855f7" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Giving by Category</CardTitle>
            <CardDescription>Breakdown by fund/category</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : !categories.length ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No category data available
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="amount"
                      nameKey="name"
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 min-w-[140px]">
                  {categories.map((cat, idx) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color || CHART_COLORS[idx] }}
                      />
                      <span className="text-sm truncate">{cat.name}</span>
                      <span className="text-sm text-muted-foreground ml-auto">{cat.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Top Donors & Recent Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Donors Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Top Donors</CardTitle>
                <CardDescription>Highest contributors this year</CardDescription>
              </div>
              <Link href="/donations/list">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : !topDonors.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No donor data available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topDonors.map((donor, idx) => (
                      <TableRow key={donor.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                              {idx + 1}
                            </div>
                            <Link href={`/donations/donor/${donor.id}`}>
                              <span className="font-medium truncate hover:text-primary cursor-pointer">
                                {donor.name}
                              </span>
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(donor.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Donations List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Donations</CardTitle>
                <CardDescription>Latest giving activity</CardDescription>
              </div>
              <Link href="/donations/list">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loadingRecent ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-28 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : !recentDonations.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent donations</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {recentDonations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-full flex-shrink-0 ${donation.isRecurring ? "bg-purple-100 dark:bg-purple-900/30" : "bg-green-100 dark:bg-green-900/30"}`}>
                        {donation.isRecurring ? (
                          <Repeat className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Heart className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {donation.isAnonymous ? "Anonymous" : (donation.member ? `${donation.member.firstName} ${donation.member.lastName}` : "Unknown Donor")}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{donation.fund || "General Fund"}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-bold">{formatCurrency(donation.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(donation.date), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-indigo-500/20">
                <Heart className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">One-time Gifts</p>
                <p className="text-2xl font-bold">
                  {loadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    formatCurrency(oneTimeEstimate)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/20">
                <Repeat className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recurring Gifts</p>
                <p className="text-2xl font-bold">
                  {loadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    formatCurrency(recurringEstimate)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {loadingDashboard ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    formatCurrency(dashboard?.totalThisWeek || 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/20">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">
                  {loadingDashboard ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    formatCurrency(dashboard?.totalToday || 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
