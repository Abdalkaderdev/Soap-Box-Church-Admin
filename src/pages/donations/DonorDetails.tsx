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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Mock donor data
const mockDonor = {
  id: 1,
  name: "Michael Johnson",
  email: "michael.johnson@email.com",
  phone: "(555) 123-4567",
  address: "123 Main Street, Springfield, IL 62701",
  memberSince: "2019-03-15",
  avatar: null,
  status: "active",
  preferredMethod: "Online",
  isRecurring: true,
  recurringAmount: 500,
  recurringFrequency: "Monthly",
};

// Mock donation history
const mockDonationHistory = [
  { id: 1, date: "2024-01-15", amount: 500, category: "Tithes", method: "Online", status: "completed" },
  { id: 2, date: "2024-01-08", amount: 2500, category: "Building Fund", method: "Check", status: "completed" },
  { id: 3, date: "2023-12-15", amount: 500, category: "Tithes", method: "Online", status: "completed" },
  { id: 4, date: "2023-12-10", amount: 200, category: "Missions", method: "Online", status: "completed" },
  { id: 5, date: "2023-11-15", amount: 500, category: "Tithes", method: "Online", status: "completed" },
  { id: 6, date: "2023-11-01", amount: 1000, category: "Youth Ministry", method: "Check", status: "completed" },
  { id: 7, date: "2023-10-15", amount: 500, category: "Tithes", method: "Online", status: "completed" },
  { id: 8, date: "2023-09-15", amount: 500, category: "Tithes", method: "Online", status: "completed" },
  { id: 9, date: "2023-08-15", amount: 500, category: "Tithes", method: "Online", status: "completed" },
  { id: 10, date: "2023-07-15", amount: 500, category: "Tithes", method: "Online", status: "completed" },
  { id: 11, date: "2023-06-20", amount: 750, category: "General Offering", method: "Cash", status: "completed" },
  { id: 12, date: "2023-06-15", amount: 500, category: "Tithes", method: "Online", status: "completed" },
];

// Monthly giving data
const monthlyGivingData = [
  { month: "Jan '23", amount: 500 },
  { month: "Feb '23", amount: 500 },
  { month: "Mar '23", amount: 750 },
  { month: "Apr '23", amount: 500 },
  { month: "May '23", amount: 650 },
  { month: "Jun '23", amount: 1250 },
  { month: "Jul '23", amount: 500 },
  { month: "Aug '23", amount: 500 },
  { month: "Sep '23", amount: 500 },
  { month: "Oct '23", amount: 500 },
  { month: "Nov '23", amount: 1500 },
  { month: "Dec '23", amount: 700 },
  { month: "Jan '24", amount: 3000 },
];

// Category breakdown
const categoryBreakdown = [
  { name: "Tithes", value: 6000, color: "#6366f1" },
  { name: "Building Fund", value: 2500, color: "#22c55e" },
  { name: "Youth Ministry", value: 1000, color: "#f59e0b" },
  { name: "General Offering", value: 750, color: "#ef4444" },
  { name: "Missions", value: 200, color: "#8b5cf6" },
];

// Year-over-year comparison
const yearComparison = [
  { year: "2021", amount: 8500 },
  { year: "2022", amount: 9200 },
  { year: "2023", amount: 8350 },
  { year: "2024", amount: 3000 },
];

export default function DonorDetails() {
  // Note: params.id will be used when connecting to API
  useParams();

  const [timeRange, setTimeRange] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate stats
  const totalLifetimeGiving = 12500;
  const thisYearGiving = 3000;
  const lastYearGiving = 8350;
  const averageDonation = 520;
  const totalDonations = 24;
  const yearOverYearChange = ((thisYearGiving / 12 * 12 - lastYearGiving) / lastYearGiving * 100);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
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
            <AvatarImage src={mockDonor.avatar || undefined} />
            <AvatarFallback className="text-lg">
              {getInitials(mockDonor.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{mockDonor.name}</h1>
              <Badge variant={mockDonor.status === "active" ? "default" : "secondary"}>
                {mockDonor.status === "active" ? "Active Donor" : "Inactive"}
              </Badge>
              {mockDonor.isRecurring && (
                <Badge variant="outline" className="border-green-500 text-green-600">
                  Recurring Donor
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Member since {new Date(mockDonor.memberSince).toLocaleDateString()}
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
              <DropdownMenuItem>
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
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${mockDonor.email}`} className="hover:text-primary">
                {mockDonor.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{mockDonor.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{mockDonor.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>Preferred: {mockDonor.preferredMethod}</span>
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
            <div className="text-2xl font-bold">${totalLifetimeGiving.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Since {new Date(mockDonor.memberSince).getFullYear()}
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
            <div className="text-2xl font-bold">${thisYearGiving.toLocaleString()}</div>
            <div className="flex items-center text-sm mt-1">
              {yearOverYearChange > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">Trending up</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-amber-500">Year in progress</span>
                </>
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
            <div className="text-2xl font-bold">${averageDonation.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">
              ${mockDonor.recurringAmount.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {mockDonor.recurringFrequency} - Tithes
            </p>
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
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyGivingData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" angle={-45} textAnchor="end" height={60} />
                      <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
                      <Tooltip
                        formatter={(value) => [`$${(value ?? 0).toLocaleString()}`, "Amount"]}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Giving by Category</CardTitle>
                <CardDescription>Distribution of donations by fund</CardDescription>
              </CardHeader>
              <CardContent>
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
                        formatter={(value) => [`$${(value ?? 0).toLocaleString()}`, ""]}
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
                      <span className="font-medium">${category.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
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
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearComparison}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip
                      formatter={(value) => [`$${(value ?? 0).toLocaleString()}`, "Total"]}
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
              <div className="space-y-4">
                {mockDonationHistory.slice(0, 5).map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <Gift className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{donation.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(donation.date).toLocaleDateString()} - {donation.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${donation.amount.toLocaleString()}</p>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Complete Donation History</CardTitle>
                  <CardDescription>All donations from {mockDonor.name}</CardDescription>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Category</th>
                      <th className="text-left py-3 px-4 font-medium">Method</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDonationHistory.map((donation) => (
                      <tr key={donation.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {new Date(donation.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          ${donation.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{donation.category}</Badge>
                        </td>
                        <td className="py-3 px-4">{donation.method}</td>
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
                        ${mockDonationHistory.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                      </td>
                      <td colSpan={3} className="py-3 px-4 text-muted-foreground">
                        {mockDonationHistory.length} donations
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
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
                {[2024, 2023, 2022, 2021].map((year) => (
                  <div
                    key={year}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{year} Year-End Statement</p>
                        <p className="text-sm text-muted-foreground">
                          Total: ${year === 2024 ? thisYearGiving.toLocaleString() :
                                  year === 2023 ? lastYearGiving.toLocaleString() :
                                  year === 2022 ? "9,200" : "8,500"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                ))}
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
