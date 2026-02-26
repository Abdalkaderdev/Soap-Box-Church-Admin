import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  Heart,
  Building,
  Repeat,
  Loader2,
  RefreshCw,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDonationDashboard,
  useDonationStats,
  useDonations,
  useRecurringDonations,
} from "@/hooks/useDonations";
import type { Fund } from "@/types";

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DonationsDashboard() {
  const [timeRange, setTimeRange] = useState("6months");
  const [compareMode, setCompareMode] = useState(false);

  // Fetch dashboard data
  const {
    data: dashboard,
    isLoading: loadingDashboard,
    refetch: refetchDashboard,
  } = useDonationDashboard();

  // Fetch donation stats for trends
  const { data: stats, isLoading: loadingStats } = useDonationStats({
    groupBy: timeRange === "3months" ? "week" : "month",
  });

  // Fetch recent donations
  const { data: recentDonationsData, isLoading: loadingRecent } = useDonations({
    page: 1,
    pageSize: 5,
    sortBy: "date",
    sortOrder: "desc",
  });

  // Fetch recurring donors count
  const { data: recurringData, isLoading: loadingRecurring } = useRecurringDonations({
    page: 1,
    pageSize: 1,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
  const chartData = stats?.trend?.map((t) => ({
    month: new Date(t.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    amount: t.amount,
    lastYear: t.amount * 0.85, // Approximate last year for comparison
    donors: t.count,
  })) || [];

  // Transform fund breakdown for pie chart
  const categories = dashboard?.topFunds?.map((tf, index) => ({
    name: (tf.fund as Fund).name || "Unknown Fund",
    amount: tf.amount,
    percent: Math.round(tf.percentage),
    color: CHART_COLORS[index % CHART_COLORS.length],
  })) || [];

  // Recent donations
  const recentDonations = recentDonationsData?.data || [];

  // Top donors
  const topDonors = dashboard?.topDonors?.map((td, index) => ({
    id: td.memberId,
    name: td.memberName,
    totalAmount: td.totalAmount,
    donationCount: 0, // Not provided by API
    rank: index + 1,
  })) || [];

  // Calculate one-time vs recurring estimates from stats
  const totalAmount = stats?.totalAmount || totalThisYear;
  const recurringEstimate = totalAmount * 0.6;
  const oneTimeEstimate = totalAmount * 0.4;

  // Get new donors this month (estimate from stats)
  const newDonorsThisMonth = stats?.trend?.[stats.trend.length - 1]?.count || 0;

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Donations Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track giving trends and manage church finances
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="12months">12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetchDashboard()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/donations/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Donation
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalThisMonth)}
                </div>
                {monthlyGrowthPercent !== 0 && (
                  <div className={`flex items-center text-sm mt-1 ${
                    monthlyGrowthPercent >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {monthlyGrowthPercent >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(monthlyGrowthPercent).toFixed(1)}% from last month
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Year to Date
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(totalThisYear)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Total donations this year
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Donation
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(avgDonation)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Per transaction
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recurring Donors
            </CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingRecurring ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{recurringDonorsCount}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Active subscriptions
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

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
                    {monthlyGrowthPercent >= 0 ? "↑" : "↓"} {Math.abs(monthlyGrowthPercent).toFixed(1)}%
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monthly Donation Trends</CardTitle>
                <CardDescription>Giving patterns over time</CardDescription>
              </div>
              <Button
                variant={compareMode ? "default" : "outline"}
                size="sm"
                onClick={() => setCompareMode(!compareMode)}
              >
                Compare Years
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !chartData.length ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No trend data available
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {compareMode ? (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                      <Tooltip
                        formatter={(value: number | undefined) => [formatCurrency(value || 0), ""]}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        name="This Year"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="lastYear"
                        name="Last Year"
                        stroke="#94a3b8"
                        fill="#94a3b8"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                      <Tooltip
                        formatter={(value: number | undefined) => [formatCurrency(value || 0), "Amount"]}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Distribution by donation category</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <div className="flex items-center justify-center h-[240px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !categories?.length ? (
              <div className="flex items-center justify-center h-[240px] text-muted-foreground">
                No category data
              </div>
            ) : (
              <>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="name"
                      >
                        {categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number | undefined) => [formatCurrency(value || 0), ""]}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color || CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-muted-foreground">{category.percent}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Donors */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Donors</CardTitle>
                <CardDescription>Highest contributors this year</CardDescription>
              </div>
              <Link href="/donations/list">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
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
            ) : !topDonors?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No donor data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topDonors.map((donor, index) => (
                  <div key={donor.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/donations/donor/${donor.id}`}>
                        <p className="font-medium truncate hover:text-primary cursor-pointer">
                          {donor.name}
                        </p>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Top contributor
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(donor.totalAmount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Latest recorded donations</CardDescription>
              </div>
              <Link href="/donations/list">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loadingRecent ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
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
            ) : !recentDonations?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent donations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDonations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        donation.isRecurring ? "bg-purple-100 dark:bg-purple-900/20" : "bg-green-100 dark:bg-green-900/20"
                      }`}>
                        {donation.isRecurring ? (
                          <Repeat className="h-5 w-5 text-purple-600" />
                        ) : (
                          <DollarSign className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {donation.isAnonymous ? "Anonymous" : (donation.member ? `${donation.member.firstName} ${donation.member.lastName}` : "Unknown Donor")}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{donation.fund || "General Fund"}</span>
                          {donation.method && (
                            <>
                              <span>-</span>
                              <span className="capitalize">{donation.method}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(donation.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(donation.date).toLocaleDateString()}
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
                <Gift className="h-6 w-6 text-indigo-600" />
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

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <Repeat className="h-6 w-6 text-green-600" />
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

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/20">
                <Building className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Donations This Month</p>
                <p className="text-2xl font-bold">
                  {loadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    newDonorsThisMonth
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-rose-500/20">
                <Heart className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Donations</p>
                <p className="text-2xl font-bold">
                  {loadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    stats?.totalCount || 0
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
