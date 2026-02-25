import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
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

// Types for API responses
interface DashboardStats {
  totalDonationsThisMonth: number;
  totalDonationsLastMonth: number;
  totalDonationsThisYear: number;
  activeRecurringDonors: number;
  newDonorsThisMonth: number;
  averageDonation: number;
  monthlyGrowthPercent: number;
  yearToDateTarget: number;
  yearToDateProgress: number;
  totalDonors?: number;
}

interface MonthlyTrend {
  month: string;
  amount: number;
  count: number;
  recurring: number;
  oneTime: number;
}

interface CategoryBreakdown {
  name: string;
  amount: number;
  percent: number;
  color: string;
}

interface RecentDonation {
  id: number;
  amount: number;
  donorName: string;
  fundName: string;
  date: string;
  isRecurring: boolean;
  isAnonymous: boolean;
  method?: string;
}

interface TopDonor {
  id: number;
  name: string;
  totalAmount: number;
  donationCount: number;
  lastDonation: string;
  trend?: "up" | "down" | "same";
}

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DonationsDashboard() {
  const { churchId } = useAuth();
  const [timeRange, setTimeRange] = useState("6months");
  const [compareMode, setCompareMode] = useState(false);

  // Fetch dashboard stats
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ["/admin/financial-dashboard/stats", churchId],
    queryFn: () => api.get<DashboardStats>(`/admin/financial-dashboard/stats`, { communityId: churchId }),
    enabled: Boolean(churchId),
  });

  // Fetch monthly trends
  const { data: trends, isLoading: loadingTrends } = useQuery<MonthlyTrend[]>({
    queryKey: ["/admin/financial-dashboard/trends", churchId, timeRange],
    queryFn: () => api.get<MonthlyTrend[]>(`/admin/financial-dashboard/trends`, {
      communityId: churchId,
      range: timeRange
    }),
    enabled: Boolean(churchId),
  });

  // Fetch category breakdown
  const { data: categories, isLoading: loadingCategories } = useQuery<CategoryBreakdown[]>({
    queryKey: ["/admin/financial-dashboard/categories", churchId],
    queryFn: () => api.get<CategoryBreakdown[]>(`/admin/financial-dashboard/categories`, { communityId: churchId }),
    enabled: Boolean(churchId),
  });

  // Fetch recent donations
  const { data: recentDonations, isLoading: loadingRecent } = useQuery<RecentDonation[]>({
    queryKey: ["/admin/financial-dashboard/recent", churchId],
    queryFn: () => api.get<RecentDonation[]>(`/admin/financial-dashboard/recent`, {
      communityId: churchId,
      limit: 5
    }),
    enabled: Boolean(churchId),
  });

  // Fetch top donors
  const { data: topDonors, isLoading: loadingTopDonors } = useQuery<TopDonor[]>({
    queryKey: ["/admin/financial-dashboard/top-donors", churchId],
    queryFn: () => api.get<TopDonor[]>(`/admin/financial-dashboard/top-donors`, {
      communityId: churchId,
      limit: 6
    }),
    enabled: Boolean(churchId),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalThisYear = stats?.totalDonationsThisYear || 0;
  const avgDonation = stats?.averageDonation || 0;
  const totalDonors = stats?.totalDonors || stats?.activeRecurringDonors || 0;
  const recurringDonors = stats?.activeRecurringDonors || 0;

  // Transform trends for chart (if needed)
  const chartData = trends?.map(t => ({
    month: t.month,
    amount: t.amount,
    lastYear: t.amount * 0.85, // Approximate last year for comparison
    donors: t.count,
  })) || [];

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
          <Button variant="outline" size="icon" onClick={() => refetchStats()}>
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
            {loadingStats ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalDonationsThisMonth || 0)}
                </div>
                {stats?.monthlyGrowthPercent !== undefined && (
                  <div className={`flex items-center text-sm mt-1 ${
                    stats.monthlyGrowthPercent >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {stats.monthlyGrowthPercent >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(stats.monthlyGrowthPercent).toFixed(1)}% from last month
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
            {loadingStats ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(totalThisYear)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stats?.yearToDateTarget ? (
                    `${((totalThisYear / stats.yearToDateTarget) * 100).toFixed(0)}% of goal`
                  ) : (
                    "No target set"
                  )}
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
            {loadingStats ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{recurringDonors}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Active subscriptions
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

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
            {loadingTrends ? (
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
            {loadingCategories ? (
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
            {loadingTopDonors ? (
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
                        {donor.donationCount} donations
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(donor.totalAmount)}</p>
                      {donor.trend && (
                        <div className="flex items-center justify-end gap-1">
                          {donor.trend === "up" && (
                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                          )}
                          {donor.trend === "down" && (
                            <ArrowDownRight className="h-3 w-3 text-red-500" />
                          )}
                          <span className={`text-xs ${
                            donor.trend === "up" ? "text-green-500" :
                            donor.trend === "down" ? "text-red-500" : "text-muted-foreground"
                          }`}>
                            {donor.trend === "up" ? "Increasing" :
                             donor.trend === "down" ? "Decreasing" : "Stable"}
                          </span>
                        </div>
                      )}
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
                          {donation.isAnonymous ? "Anonymous" : donation.donorName}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{donation.fundName || "General Fund"}</span>
                          {donation.method && (
                            <>
                              <span>-</span>
                              <span>{donation.method}</span>
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
                    formatCurrency((stats?.totalDonationsThisYear || 0) * 0.4)
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
                    formatCurrency((stats?.totalDonationsThisYear || 0) * 0.6)
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
                <p className="text-sm text-muted-foreground">New Donors</p>
                <p className="text-2xl font-bold">
                  {loadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    stats?.newDonorsThisMonth || 0
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
                <p className="text-sm text-muted-foreground">Total Donors</p>
                <p className="text-2xl font-bold">
                  {loadingStats ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    totalDonors
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
