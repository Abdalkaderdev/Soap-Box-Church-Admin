import { useState } from "react";
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  Heart,
  Building,
  Repeat,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for monthly donation trends
const monthlyTrends = [
  { month: "Jan", amount: 12500, donors: 85, lastYear: 11200 },
  { month: "Feb", amount: 14200, donors: 92, lastYear: 12800 },
  { month: "Mar", amount: 13800, donors: 88, lastYear: 13100 },
  { month: "Apr", amount: 16500, donors: 105, lastYear: 14200 },
  { month: "May", amount: 15200, donors: 98, lastYear: 13900 },
  { month: "Jun", amount: 14800, donors: 95, lastYear: 14500 },
  { month: "Jul", amount: 13200, donors: 82, lastYear: 12600 },
  { month: "Aug", amount: 14500, donors: 90, lastYear: 13800 },
  { month: "Sep", amount: 15800, donors: 102, lastYear: 14200 },
  { month: "Oct", amount: 17200, donors: 112, lastYear: 15500 },
  { month: "Nov", amount: 18500, donors: 125, lastYear: 16800 },
  { month: "Dec", amount: 22000, donors: 145, lastYear: 19500 },
];

// Mock data for category breakdown
const categoryBreakdown = [
  { name: "Tithes", value: 85000, percentage: 45, color: "#6366f1" },
  { name: "General Offering", value: 45000, percentage: 24, color: "#22c55e" },
  { name: "Building Fund", value: 28000, percentage: 15, color: "#f59e0b" },
  { name: "Missions", value: 18000, percentage: 10, color: "#ef4444" },
  { name: "Youth Ministry", value: 11000, percentage: 6, color: "#8b5cf6" },
];

// Mock data for top donors
const topDonors = [
  { id: 1, name: "Michael Johnson", amount: 12500, donations: 12, trend: "up" },
  { id: 2, name: "Sarah Williams", amount: 9800, donations: 15, trend: "up" },
  { id: 3, name: "David Thompson", amount: 8500, donations: 10, trend: "down" },
  { id: 4, name: "Jennifer Davis", amount: 7200, donations: 12, trend: "up" },
  { id: 5, name: "Robert Brown", amount: 6800, donations: 8, trend: "same" },
  { id: 6, name: "Emily Martinez", amount: 5500, donations: 11, trend: "up" },
  { id: 7, name: "James Wilson", amount: 5200, donations: 6, trend: "down" },
  { id: 8, name: "Lisa Anderson", amount: 4800, donations: 9, trend: "up" },
];

// Mock data for recent donations
const recentDonations = [
  { id: 1, donor: "Michael Johnson", amount: 500, category: "Tithes", date: "2024-01-15", method: "Online" },
  { id: 2, donor: "Sarah Williams", amount: 250, category: "Missions", date: "2024-01-15", method: "Check" },
  { id: 3, donor: "Anonymous", amount: 1000, category: "Building Fund", date: "2024-01-14", method: "Cash" },
  { id: 4, donor: "David Thompson", amount: 350, category: "General Offering", date: "2024-01-14", method: "Online" },
  { id: 5, donor: "Jennifer Davis", amount: 200, category: "Youth Ministry", date: "2024-01-13", method: "Online" },
];

// Weekly donation data
const weeklyData = [
  { day: "Sun", amount: 4500 },
  { day: "Mon", amount: 320 },
  { day: "Tue", amount: 280 },
  { day: "Wed", amount: 890 },
  { day: "Thu", amount: 450 },
  { day: "Fri", amount: 380 },
  { day: "Sat", amount: 220 },
];

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DonationsDashboard() {
  const [timeRange, setTimeRange] = useState("year");
  const [compareMode, setCompareMode] = useState(false);

  const totalThisYear = 188200;
  const totalLastYear = 162100;
  const growthPercentage = ((totalThisYear - totalLastYear) / totalLastYear * 100).toFixed(1);
  const avgDonation = 156;
  const totalDonors = 342;
  const recurringDonors = 128;

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
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
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
              Total Donations
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalThisYear.toLocaleString()}</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              {growthPercentage}% from last year
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Donors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDonors}</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              23 new this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Donation
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgDonation}</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              8% increase
            </div>
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
            <div className="text-2xl font-bold">{recurringDonors}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {((recurringDonors / totalDonors) * 100).toFixed(0)}% of total donors
            </div>
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
                <CardDescription>Comparing current year with previous year</CardDescription>
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
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {compareMode ? (
                  <AreaChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
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
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    />
                    <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Distribution by donation category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {categoryBreakdown.map((category, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <span className="text-muted-foreground">{category.percentage}%</span>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              {topDonors.slice(0, 6).map((donor, index) => (
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
                      {donor.donations} donations
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${donor.amount.toLocaleString()}</p>
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
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{donation.donor}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{donation.category}</span>
                        <span>-</span>
                        <span>{donation.method}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${donation.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{donation.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Donations</CardTitle>
          <CardDescription>Daily breakdown of donations received</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

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
                <p className="text-2xl font-bold">$68,500</p>
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
                <p className="text-2xl font-bold">$119,700</p>
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
                <p className="text-sm text-muted-foreground">Building Fund</p>
                <p className="text-2xl font-bold">$28,000</p>
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
                <p className="text-sm text-muted-foreground">Missions Support</p>
                <p className="text-2xl font-bold">$18,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
