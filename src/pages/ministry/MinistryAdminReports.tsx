import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  BarChart3,
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Clock,
  Mail,
  Settings,
  Plus,
  Eye
} from "lucide-react";
import { format } from "date-fns";

export default function MinistryAdminReports() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("this-month");
  const [customDateStart, setCustomDateStart] = useState<Date | undefined>(undefined);
  const [customDateEnd, setCustomDateEnd] = useState<Date | undefined>(undefined);
  const [generateReportOpen, setGenerateReportOpen] = useState(false);

  // Mock ministry analytics data
  const ministryAnalytics = {
    overview: {
      totalMembers: 156,
      activeMembers: 134,
      newMembersThisMonth: 12,
      memberGrowth: "+8.3%",
      totalGroups: 8,
      activeGroups: 7,
      newGroupsThisMonth: 1,
      groupGrowth: "+14.3%",
      totalEvents: 23,
      eventsThisMonth: 8,
      eventAttendance: "87%",
      attendanceChange: "+5.2%",
      totalVolunteers: 42,
      activeVolunteers: 38,
      volunteerHours: 234,
      hoursChange: "+12.1%"
    },
    groupMetrics: [
      {
        name: "Young Adults",
        members: 24,
        attendance: "92%",
        engagement: "high",
        growth: "+15%",
        events: 6,
        posts: 45
      },
      {
        name: "Bible Study",
        members: 18,
        attendance: "89%",
        engagement: "high",
        growth: "+8%",
        events: 4,
        posts: 32
      },
      {
        name: "Prayer Warriors",
        members: 32,
        attendance: "94%",
        engagement: "high",
        growth: "+22%",
        events: 2,
        posts: 67
      },
      {
        name: "Family Fellowship",
        members: 35,
        attendance: "78%",
        engagement: "medium",
        growth: "+5%",
        events: 8,
        posts: 28
      }
    ],
    eventMetrics: [
      {
        title: "Ministry Leadership Meeting",
        date: "2024-08-25",
        attendees: 12,
        capacity: 15,
        satisfaction: 4.8,
        feedback: "Excellent"
      },
      {
        title: "Volunteer Training Session",
        date: "2024-08-27",
        attendees: 25,
        capacity: 30,
        satisfaction: 4.6,
        feedback: "Very Good"
      },
      {
        title: "Community Outreach Event",
        date: "2024-09-01",
        attendees: 68,
        capacity: 80,
        satisfaction: 4.9,
        feedback: "Outstanding"
      }
    ],
    volunteerMetrics: {
      totalOpportunities: 12,
      filledPositions: 9,
      pendingApplications: 8,
      completionRate: "85%",
      averageRating: 4.7,
      retentionRate: "89%",
      hoursBreakdown: {
        "Youth Ministry": 89,
        "Outreach": 67,
        "Events": 45,
        "Administration": 33
      }
    },
    prayerMetrics: {
      totalPrayers: 156,
      activePrayers: 89,
      answeredPrayers: 67,
      heartsThisMonth: 234,
      commentsThisMonth: 89,
      participationRate: "78%",
      categories: {
        Health: 45,
        Family: 32,
        Career: 28,
        Spiritual: 25,
        Financial: 15,
        Other: 11
      }
    }
  };

  // Mock report templates
  const reportTemplates = [
    {
      name: "Monthly Ministry Overview",
      description: "Comprehensive overview of all ministry activities and metrics",
      lastGenerated: "2024-08-20",
      frequency: "Monthly"
    },
    {
      name: "Group Performance Report",
      description: "Detailed analysis of individual group performance and engagement",
      lastGenerated: "2024-08-15",
      frequency: "Bi-weekly"
    },
    {
      name: "Volunteer Activity Report",
      description: "Summary of volunteer opportunities, applications, and hours served",
      lastGenerated: "2024-08-18",
      frequency: "Weekly"
    },
    {
      name: "Event Analysis Report",
      description: "Analysis of event attendance, satisfaction, and engagement metrics",
      lastGenerated: "2024-08-22",
      frequency: "After Events"
    }
  ];

  const handleGenerateReport = () => {
    setGenerateReportOpen(false);
  };

  const handleExportReport = () => {
  };

  const handleScheduleReport = () => {
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getGrowthIcon = (growth: string) => {
    if (growth.includes('+')) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth.includes('-')) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <BarChart3 className="h-4 w-4 text-purple-600" />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive reporting and analytics for ministry performance
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={generateReportOpen} onOpenChange={setGenerateReportOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Generate Custom Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Ministry Overview</SelectItem>
                      <SelectItem value="groups">Group Performance</SelectItem>
                      <SelectItem value="events">Event Analysis</SelectItem>
                      <SelectItem value="volunteers">Volunteer Report</SelectItem>
                      <SelectItem value="prayer">Prayer Wall Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {dateRange === "custom" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {customDateStart ? format(customDateStart, "PPP") : "Pick start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={customDateStart}
                            onSelect={setCustomDateStart}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {customDateEnd ? format(customDateEnd, "PPP") : "Pick end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={customDateEnd}
                            onSelect={setCustomDateEnd}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="format">Export Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setGenerateReportOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateReport}>
                    Generate Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Active Members
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ministryAnalytics.overview.activeMembers}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">{ministryAnalytics.overview.memberGrowth}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Event Attendance
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ministryAnalytics.overview.eventAttendance}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">{ministryAnalytics.overview.attendanceChange}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Volunteer Hours
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ministryAnalytics.overview.volunteerHours}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">{ministryAnalytics.overview.hoursChange}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Active Groups
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ministryAnalytics.overview.activeGroups}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">{ministryAnalytics.overview.groupGrowth}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>New Members This Month:</span>
                    <span className="font-semibold">{ministryAnalytics.overview.newMembersThisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Growth Rate:</span>
                    <span className="font-semibold text-green-600">{ministryAnalytics.overview.memberGrowth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active vs Total:</span>
                    <span className="font-semibold">
                      {ministryAnalytics.overview.activeMembers}/{ministryAnalytics.overview.totalMembers}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{width: `${(ministryAnalytics.overview.activeMembers / ministryAnalytics.overview.totalMembers) * 100}%`}}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ministry Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">92</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">Excellent Health</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Member Engagement:</span>
                      <span className="font-medium">95%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Event Participation:</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volunteer Activity:</span>
                      <span className="font-medium">91%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Group Growth:</span>
                      <span className="font-medium">94%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={() => handleExportReport()}>
              <Download className="h-4 w-4 mr-2" />
              Export Overview Report
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Email Report
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="space-y-4">
            {ministryAnalytics.groupMetrics.map((group, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mt-1">
                          <span>{group.members} members</span>
                          <span>Attendance: {group.attendance}</span>
                          <span className={getEngagementColor(group.engagement)}>
                            {group.engagement} engagement
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end mb-2">
                        {getGrowthIcon(group.growth)}
                        <span className="ml-1 font-medium">{group.growth}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{group.events}</div>
                          <div className="text-gray-500">Events</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{group.posts}</div>
                          <div className="text-gray-500">Posts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="space-y-4">
            {ministryAnalytics.eventMetrics.map((event, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {format(new Date(event.date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">
                            {event.attendees}/{event.capacity}
                          </div>
                          <div className="text-gray-500">Attendance</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{event.satisfaction}</div>
                          <div className="text-gray-500">Rating</div>
                        </div>
                        <div className="text-center">
                          <Badge variant="outline">{event.feedback}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="volunteers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Total Opportunities:</span>
                    <span className="font-semibold">{ministryAnalytics.volunteerMetrics.totalOpportunities}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Filled Positions:</span>
                    <span className="font-semibold">{ministryAnalytics.volunteerMetrics.filledPositions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending Applications:</span>
                    <span className="font-semibold">{ministryAnalytics.volunteerMetrics.pendingApplications}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completion Rate:</span>
                    <span className="font-semibold text-green-600">{ministryAnalytics.volunteerMetrics.completionRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Rating:</span>
                    <span className="font-semibold">{ministryAnalytics.volunteerMetrics.averageRating}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hours by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(ministryAnalytics.volunteerMetrics.hoursBreakdown).map(([dept, hours]) => (
                    <div key={dept} className="flex justify-between items-center">
                      <span>{dept}:</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{width: `${(hours / Math.max(...Object.values(ministryAnalytics.volunteerMetrics.hoursBreakdown))) * 100}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{hours}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {reportTemplates.map((template, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Last generated: {format(new Date(template.lastGenerated), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Frequency: {template.frequency}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExportReport()}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleScheduleReport()}>
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
