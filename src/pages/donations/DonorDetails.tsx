import { useState } from "react";
import { Link, useParams } from "wouter";
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
  LineChart,
  Line,
} from "recharts";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Download,
  FileText,
  Send,
  Edit,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  Heart,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDonorDetails, useGenerateGivingStatements } from "@/hooks/useDonations";

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DonorDetails() {
  const params = useParams();
  const memberId = params.id;

  const [timeRange, setTimeRange] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch donor details from API
  const { data: donorDetails, isLoading, error } = useDonorDetails(memberId);

  // Generate statements mutation
  const generateStatementsMutation = useGenerateGivingStatements();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (error || !donorDetails) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/donations/list">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Donor Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">
              The donor you are looking for could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { member, donations, recurringDonations, totalAmount, totalDonations, averageAmount, firstDonationDate } = donorDetails;

  // Calculate stats
  const currentYear = new Date().getFullYear();
  const thisYearDonations = donations.filter(d => new Date(d.date).getFullYear() === currentYear);
  const lastYearDonations = donations.filter(d => new Date(d.date).getFullYear() === currentYear - 1);

  const thisYearTotal = thisYearDonations.reduce((sum, d) => sum + d.amount, 0);
  const lastYearTotal = lastYearDonations.reduce((sum, d) => sum + d.amount, 0);

  const yearOverYearChange = lastYearTotal > 0
    ? ((thisYearTotal - lastYearTotal) / lastYearTotal) * 100
    : 0;

  // Build monthly giving data
  const monthlyGivingMap = new Map<string, number>();
  donations.forEach((d) => {
    const date = new Date(d.date);
    const key = `${date.toLocaleDateString("en-US", { month: "short" })} '${date.getFullYear().toString().slice(-2)}`;
    monthlyGivingMap.set(key, (monthlyGivingMap.get(key) || 0) + d.amount);
  });
  const monthlyGivingData = Array.from(monthlyGivingMap.entries())
    .map(([month, amount]) => ({ month, amount }))
    .slice(-13); // Last 13 months

  // Build category breakdown
  const categoryMap = new Map<string, number>();
  donations.forEach((d) => {
    categoryMap.set(d.fund, (categoryMap.get(d.fund) || 0) + d.amount);
  });
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  // Build year-over-year comparison
  const yearMap = new Map<number, number>();
  donations.forEach((d) => {
    const year = new Date(d.date).getFullYear();
    yearMap.set(year, (yearMap.get(year) || 0) + d.amount);
  });
  const yearComparison = Array.from(yearMap.entries())
    .map(([year, amount]) => ({ year: year.toString(), amount }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year))
    .slice(-4); // Last 4 years

  // Filter donations by time range
  const filteredDonations = donations.filter((d) => {
    if (timeRange === "all") return true;
    const date = new Date(d.date);
    const now = new Date();
    if (timeRange === "year") {
      return date.getFullYear() === now.getFullYear();
    }
    if (timeRange === "quarter") {
      const quarter = Math.floor(now.getMonth() / 3);
      const donationQuarter = Math.floor(date.getMonth() / 3);
      return date.getFullYear() === now.getFullYear() && donationQuarter === quarter;
    }
    if (timeRange === "month") {
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }
    return true;
  });

  const hasRecurring = recurringDonations && recurringDonations.length > 0;
  const activeRecurring = recurringDonations?.find(r => r.status === "active");

  const handleGenerateStatement = async (year: number) => {
    await generateStatementsMutation.mutateAsync({
      year,
      sendEmail: true,
      memberIds: [memberId!],
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/donations/list">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Avatar className="h-16 w-16">
            <AvatarImage src={member.photoUrl || undefined} />
            <AvatarFallback className="text-lg">
              {getInitials(member.firstName, member.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{member.firstName} {member.lastName}</h1>
              <Badge variant={member.membershipStatus === "active" ? "default" : "secondary"}>
                {member.membershipStatus === "active" ? "Active Donor" : "Inactive"}
              </Badge>
              {hasRecurring && (
                <Badge variant="outline" className="border-green-500 text-green-600">
                  Recurring Donor
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Member since {new Date(member.memberSince || member.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleGenerateStatement(currentYear)}>
                <Send className="h-4 w-4 mr-2" />
                Send Year-End Statement
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Generate Tax Receipt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Donor Info
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contact Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6">
            {member.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${member.email}`} className="hover:text-primary">
                  {member.email}
                </a>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{member.phone}</span>
              </div>
            )}
            {member.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {[member.address.street, member.address.city, member.address.state, member.address.zipCode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>Preferred: Online</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lifetime Giving
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Since {new Date(firstDonationDate).getFullYear()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Year
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(thisYearTotal)}</div>
            <div className="flex items-center text-sm mt-1">
              {yearOverYearChange > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">{Math.abs(yearOverYearChange).toFixed(1)}% vs last year</span>
                </>
              ) : yearOverYearChange < 0 ? (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-red-500">{Math.abs(yearOverYearChange).toFixed(1)}% vs last year</span>
                </>
              ) : (
                <span className="text-muted-foreground">Year in progress</span>
              )}
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
            <div className="text-2xl font-bold">{formatCurrency(averageAmount)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Across {totalDonations} donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recurring Gift
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {activeRecurring ? (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(activeRecurring.amount)}
                </div>
                <p className="text-sm text-muted-foreground mt-1 capitalize">
                  {activeRecurring.frequency} - {activeRecurring.fund}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground">-</div>
                <p className="text-sm text-muted-foreground mt-1">
                  No active recurring
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Donation History</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Giving Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Giving Trend</CardTitle>
                <CardDescription>Donation amounts over the past 13 months</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyGivingData.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No donation history
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyGivingData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" angle={-45} textAnchor="end" height={60} />
                        <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
                        <Tooltip
                          formatter={(value) => [formatCurrency(value as number), "Amount"]}
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        />
                        <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Giving by Category</CardTitle>
                <CardDescription>Distribution of donations by fund</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryBreakdown.length === 0 ? (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    No category data
                  </div>
                ) : (
                  <>
                    <div className="h-[200px]">
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
                            formatter={(value) => [formatCurrency(value as number), ""]}
                            contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {categoryBreakdown.map((category, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(category.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Year-over-Year Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Comparison</CardTitle>
              <CardDescription>Annual giving totals</CardDescription>
            </CardHeader>
            <CardContent>
              {yearComparison.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  No year-over-year data
                </div>
              ) : (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearComparison}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="year" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value as number), "Total"]}
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
              )}
            </CardContent>
          </Card>

          {/* Recent Donations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Donations</CardTitle>
                  <CardDescription>Latest 5 donations from this donor</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("history")}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No donations recorded
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <Gift className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{donation.fund}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(donation.date).toLocaleDateString()} - <span className="capitalize">{donation.method}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(donation.amount)}</p>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700"
                        >
                          {donation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Complete Donation History</CardTitle>
                  <CardDescription>All donations from {member.firstName} {member.lastName}</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDonations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No donations found for the selected period
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Fund</th>
                        <th className="text-left py-3 px-4 font-medium">Method</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDonations.map((donation) => (
                        <tr key={donation.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            {new Date(donation.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {formatCurrency(donation.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{donation.fund}</Badge>
                          </td>
                          <td className="py-3 px-4 capitalize">{donation.method}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              {donation.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 bg-muted/50">
                        <td className="py-3 px-4 font-semibold">Total</td>
                        <td className="py-3 px-4 font-bold text-lg">
                          {formatCurrency(filteredDonations.reduce((sum, d) => sum + d.amount, 0))}
                        </td>
                        <td colSpan={3} className="py-3 px-4 text-muted-foreground">
                          {filteredDonations.length} donations
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Statements</CardTitle>
              <CardDescription>Generate and download year-end giving statements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map((year) => {
                  const yearTotal = donations
                    .filter(d => new Date(d.date).getFullYear() === year)
                    .reduce((sum, d) => sum + d.amount, 0);

                  return (
                    <div
                      key={year}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{year} Year-End Statement</p>
                          <p className="text-sm text-muted-foreground">
                            Total: {formatCurrency(yearTotal)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateStatement(year)}
                          disabled={generateStatementsMutation.isPending}
                        >
                          {generateStatementsMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Email
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Individual Receipts</CardTitle>
              <CardDescription>Download receipts for individual donations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Select a donation from the history tab to generate an individual receipt.
              </p>
              <Button variant="outline" onClick={() => setActiveTab("history")}>
                View Donation History
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
