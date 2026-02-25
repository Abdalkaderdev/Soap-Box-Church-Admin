import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  ChevronRight,
  Printer,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useReports, useSavedReports } from '@/hooks/useReports';

interface AttendanceData {
  month: string;
  attendance: number;
  firstTime: number;
}

interface GivingData {
  month: string;
  tithes: number;
  offerings: number;
  missions: number;
}

interface MembershipData {
  name: string;
  value: number;
  color: string;
}

interface MinistryData {
  name: string;
  members: number;
  growth: number;
}

interface WeeklyAttendance {
  week: string;
  sunday: number;
  wednesday: number;
}

interface SavedReport {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

interface ReportsStats {
  avgAttendance: number;
  avgAttendanceChange: number;
  totalGiving: number;
  totalGivingChange: number;
  newMembers: number;
  newMembersChange: number;
  firstTimeGuests: number;
  firstTimeGuestsChange: number;
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}

function ChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full" />
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const [dateRange, setDateRange] = useState('6months');
  const { data, isLoading: reportsLoading, error: reportsError } = useReports(dateRange);
  const { data: savedReportsData, isLoading: savedReportsLoading } = useSavedReports();

  const isLoading = reportsLoading || savedReportsLoading;
  const error = reportsError;

  const attendanceData: AttendanceData[] = data?.attendanceData ?? [];
  const givingData: GivingData[] = data?.givingData ?? [];
  const membershipData: MembershipData[] = data?.membershipData ?? [];
  const ministryData: MinistryData[] = data?.ministryData ?? [];
  const weeklyAttendance: WeeklyAttendance[] = data?.weeklyAttendance ?? [];

  // Map saved reports from API
  const savedReports: SavedReport[] = (savedReportsData ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    date: r.date,
    size: r.size,
  }));

  // Map summary to stats format
  const stats: ReportsStats | undefined = data?.summary ? {
    avgAttendance: data.summary.avgAttendance,
    avgAttendanceChange: data.summary.avgAttendanceChange,
    totalGiving: data.summary.totalGiving,
    totalGivingChange: data.summary.totalGivingChange,
    newMembers: data.summary.newMembers,
    newMembersChange: data.summary.newMembersChange,
    firstTimeGuests: data.summary.firstTimeGuests,
    firstTimeGuestsChange: data.summary.firstTimeGuestsChange,
  } : undefined;

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load reports. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            View analytics and generate reports
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.avgAttendance ?? 0}</div>
                <div className={`flex items-center text-xs ${(stats?.avgAttendanceChange ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(stats?.avgAttendanceChange ?? 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {(stats?.avgAttendanceChange ?? 0) >= 0 ? '+' : ''}{stats?.avgAttendanceChange ?? 0}% from last period
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Giving</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(stats?.totalGiving ?? 0).toLocaleString()}</div>
                <div className={`flex items-center text-xs ${(stats?.totalGivingChange ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(stats?.totalGivingChange ?? 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {(stats?.totalGivingChange ?? 0) >= 0 ? '+' : ''}{stats?.totalGivingChange ?? 0}% from last period
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">New Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.newMembers ?? 0}</div>
                <div className={`flex items-center text-xs ${(stats?.newMembersChange ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(stats?.newMembersChange ?? 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {(stats?.newMembersChange ?? 0) >= 0 ? '+' : ''}{stats?.newMembersChange ?? 0}% from last period
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">First-Time Guests</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.firstTimeGuests ?? 0}</div>
                <div className={`flex items-center text-xs ${(stats?.firstTimeGuestsChange ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(stats?.firstTimeGuestsChange ?? 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {(stats?.firstTimeGuestsChange ?? 0) >= 0 ? '+' : ''}{stats?.firstTimeGuestsChange ?? 0}% from last period
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="giving" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Giving
          </TabsTrigger>
          <TabsTrigger value="membership" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Membership
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Saved Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Attendance Trend */}
            {isLoading ? (
              <ChartCardSkeleton />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trend</CardTitle>
                  <CardDescription>Monthly average attendance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="attendance"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        name="Attendance"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Giving Overview */}
            {isLoading ? (
              <ChartCardSkeleton />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Giving Overview</CardTitle>
                  <CardDescription>Monthly giving breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={givingData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                      <Bar dataKey="tithes" fill="#3b82f6" name="Tithes" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="offerings" fill="#10b981" name="Offerings" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="missions" fill="#f59e0b" name="Missions" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Membership Breakdown */}
            {isLoading ? (
              <ChartCardSkeleton />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Membership Breakdown</CardTitle>
                  <CardDescription>Current membership status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={membershipData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {membershipData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {membershipData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.name}: {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ministry Growth */}
            {isLoading ? (
              <ChartCardSkeleton />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Ministry Participation</CardTitle>
                  <CardDescription>Active members by ministry</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ministryData.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No ministry data available</p>
                    ) : (
                      ministryData.map((ministry) => (
                        <div key={ministry.name} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{ministry.name}</span>
                            <span className="text-muted-foreground">
                              {ministry.members} members
                              <span className="text-green-600 ml-2">+{ministry.growth}%</span>
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(ministry.members / 160) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {isLoading ? (
              <>
                <ChartCardSkeleton />
                <ChartCardSkeleton />
                <ChartCardSkeleton />
              </>
            ) : (
              <>
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Weekly Attendance Comparison</CardTitle>
                    <CardDescription>Sunday vs Wednesday services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weeklyAttendance}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="week" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="sunday"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name="Sunday"
                        />
                        <Line
                          type="monotone"
                          dataKey="wednesday"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name="Wednesday"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>First-Time Guests</CardTitle>
                    <CardDescription>Monthly first-time visitor trend</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="firstTime" fill="#f59e0b" name="First-Time Guests" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-between">
                      Download Attendance Report
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      Print Check-in Summary
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      Email Report to Leaders
                      <Mail className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="giving" className="space-y-4">
          {isLoading ? (
            <>
              <ChartCardSkeleton />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </div>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Giving Trends</CardTitle>
                  <CardDescription>Detailed giving breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={givingData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                      <Area
                        type="monotone"
                        dataKey="tithes"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        name="Tithes"
                      />
                      <Area
                        type="monotone"
                        dataKey="offerings"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                        name="Offerings"
                      />
                      <Area
                        type="monotone"
                        dataKey="missions"
                        stackId="1"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.6}
                        name="Missions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Tithes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${givingData.reduce((sum, d) => sum + d.tithes, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">YTD Total</div>
                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +10% vs last year
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Offerings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${givingData.reduce((sum, d) => sum + d.offerings, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">YTD Total</div>
                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +15% vs last year
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Missions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${givingData.reduce((sum, d) => sum + d.missions, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">YTD Total</div>
                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +22% vs last year
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="membership" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {isLoading ? (
              <>
                <ChartCardSkeleton />
                <Card>
                  <CardHeader>
                    <Skeleton className="h-5 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Membership Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={membershipData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                        >
                          {membershipData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Membership Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-between">
                      <span>New Member Report</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Inactive Members Report</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Birthday/Anniversary Report</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Member Directory Export</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : savedReports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saved reports found.
                </p>
              ) : (
                <div className="space-y-3">
                  {savedReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <div className="flex gap-3 text-sm text-muted-foreground">
                            <Badge variant="outline">{report.type}</Badge>
                            <span>{new Date(report.date).toLocaleDateString()}</span>
                            <span>{report.size}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
