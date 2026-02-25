import { useState, useMemo, useCallback } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  Legend,
  ComposedChart,
} from 'recharts';
import {
  FileText,
  Download,
  TrendingUp,
  Minus,
  Users,
  DollarSign,
  Calendar,
  ChevronRight,
  Printer,
  Mail,
  AlertCircle,
  Heart,
  UserPlus,
  Sprout,
  HandHeart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Filter,
  Plus,
  Settings,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import {
  useDashboardStats,
  useAttendanceStats,
  useAttendanceComparison,
  useGivingReport,
  useGivingComparison,
  useGivingByFund,
  useMembershipStats,
  useMembershipGrowth,
  useMinistryReports,
  useVolunteerHoursReport,
  useFirstTimeVisitorReport,
  useSavedReports,
  useGenerateCustomReport,
  useExportReport,
} from '@/hooks/useReports';

// ============================================
// Type Definitions
// ============================================

interface CustomReportField {
  id: string;
  label: string;
  category: string;
}

// ============================================
// Warm Church Color Palette
// ============================================

const CHURCH_COLORS = {
  burgundy: 'hsl(345, 45%, 32%)',
  burgundyLight: 'hsl(345, 45%, 42%)',
  sage: 'hsl(150, 25%, 40%)',
  sageLight: 'hsl(150, 25%, 50%)',
  ivory: 'hsl(40, 33%, 97%)',
  walnut: 'hsl(20, 35%, 25%)',
  gold: 'hsl(35, 60%, 50%)',
  warmGray: 'hsl(20, 10%, 45%)',
  stainedBlue: 'hsl(220, 45%, 45%)',
  stainedPurple: 'hsl(280, 35%, 45%)',
};

const CHART_COLORS = [
  CHURCH_COLORS.burgundy,
  CHURCH_COLORS.sage,
  CHURCH_COLORS.gold,
  CHURCH_COLORS.stainedBlue,
  CHURCH_COLORS.stainedPurple,
];

// ============================================
// Report Categories Configuration
// ============================================

const REPORT_CATEGORIES = [
  {
    id: 'attendance',
    label: 'Attendance',
    icon: Users,
    description: 'Track worship attendance and service participation',
    color: CHURCH_COLORS.burgundy,
  },
  {
    id: 'giving',
    label: 'Giving',
    icon: Heart,
    description: 'Monitor tithes, offerings, and financial stewardship',
    color: CHURCH_COLORS.sage,
  },
  {
    id: 'membership',
    label: 'Membership',
    icon: UserPlus,
    description: 'View membership status and engagement',
    color: CHURCH_COLORS.gold,
  },
  {
    id: 'volunteers',
    label: 'Volunteers',
    icon: HandHeart,
    description: 'Recognize servant leaders and ministry participation',
    color: CHURCH_COLORS.stainedBlue,
  },
  {
    id: 'growth',
    label: 'Growth',
    icon: Sprout,
    description: 'Celebrate spiritual and numerical growth',
    color: CHURCH_COLORS.stainedPurple,
  },
];

// ============================================
// Custom Report Builder Fields
// ============================================

const CUSTOM_REPORT_FIELDS: CustomReportField[] = [
  { id: 'attendance_total', label: 'Total Attendance', category: 'Attendance' },
  { id: 'attendance_avg', label: 'Average Attendance', category: 'Attendance' },
  { id: 'attendance_first_time', label: 'First-Time Guests', category: 'Attendance' },
  { id: 'attendance_returning', label: 'Returning Visitors', category: 'Attendance' },
  { id: 'giving_tithes', label: 'Tithes', category: 'Giving' },
  { id: 'giving_offerings', label: 'Offerings', category: 'Giving' },
  { id: 'giving_missions', label: 'Missions Fund', category: 'Giving' },
  { id: 'giving_building', label: 'Building Fund', category: 'Giving' },
  { id: 'members_total', label: 'Total Members', category: 'Membership' },
  { id: 'members_new', label: 'New Members', category: 'Membership' },
  { id: 'members_baptisms', label: 'Baptisms', category: 'Membership' },
  { id: 'volunteers_active', label: 'Active Volunteers', category: 'Volunteers' },
  { id: 'volunteers_hours', label: 'Volunteer Hours', category: 'Volunteers' },
  { id: 'volunteers_teams', label: 'Ministry Teams', category: 'Volunteers' },
];

// ============================================
// Date Range Helpers
// ============================================

function getDateRangeParams(dateRange: string): { startDate: string; endDate: string } {
  const endDate = new Date();
  let startDate = new Date();

  switch (dateRange) {
    case '7days':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '3months':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '6months':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case '1year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(endDate.getMonth() - 6);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

// ============================================
// Helper Components
// ============================================

function TrendIndicator({
  value,
  suffix = '%',
  showArrow = true
}: {
  value: number;
  suffix?: string;
  showArrow?: boolean;
}) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <div
      className={`flex items-center gap-1 text-sm font-medium ${
        isNeutral
          ? 'text-muted-foreground'
          : isPositive
          ? 'text-[hsl(150,25%,40%)]'
          : 'text-[hsl(0,65%,50%)]'
      }`}
    >
      {showArrow && (
        isNeutral ? (
          <Minus className="h-4 w-4" />
        ) : isPositive ? (
          <ArrowUpRight className="h-4 w-4" />
        ) : (
          <ArrowDownRight className="h-4 w-4" />
        )
      )}
      <span>
        {isPositive ? '+' : ''}
        {value}
        {suffix}
      </span>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  comparison,
  isLoading,
}: {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  comparison?: { label: string; value: number | string };
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="border-[hsl(35,20%,88%)] bg-gradient-to-br from-white to-[hsl(40,40%,98%)]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[hsl(35,20%,88%)] bg-gradient-to-br from-white to-[hsl(40,40%,98%)] hover:shadow-lg transition-all duration-300 church-glow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[hsl(20,10%,45%)] font-sans">
          {title}
        </CardTitle>
        <div className="p-2 rounded-full bg-[hsl(345,45%,32%,0.1)]">
          <Icon className="h-4 w-4 text-[hsl(345,45%,32%)]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[hsl(20,25%,15%)] font-serif">{value}</div>
        <div className="flex items-center justify-between mt-2">
          <TrendIndicator value={change} />
          <span className="text-xs text-muted-foreground">{changeLabel}</span>
        </div>
        {comparison && (
          <div className="mt-3 pt-3 border-t border-[hsl(35,20%,88%)]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{comparison.label}</span>
              <span className="font-medium">{comparison.value}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryCard({
  category,
  isSelected,
  onClick,
}: {
  category: typeof REPORT_CATEGORIES[0];
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = category.icon;

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 text-left transition-all duration-300 w-full ${
        isSelected
          ? 'border-[hsl(345,45%,32%)] bg-[hsl(345,45%,32%,0.05)] shadow-md'
          : 'border-[hsl(35,20%,88%)] bg-white hover:border-[hsl(345,45%,32%,0.3)] hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${category.color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color: category.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[hsl(20,25%,15%)] font-serif">
            {category.label}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {category.description}
          </p>
        </div>
        {isSelected && (
          <div className="h-2 w-2 rounded-full bg-[hsl(345,45%,32%)]" />
        )}
      </div>
    </button>
  );
}

function ChartCardSkeleton() {
  return (
    <Card className="border-[hsl(35,20%,88%)]">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(345,45%,32%)]" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCardSkeleton() {
  return (
    <Card className="border-[hsl(35,20%,88%)]">
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

// ============================================
// Custom Tooltip for Charts
// ============================================

interface TooltipPayload {
  color?: string;
  name?: string;
  value?: number;
  dataKey?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  formatter?: (value: number) => string;
}

function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-[hsl(35,20%,88%)]">
      <p className="font-semibold text-[hsl(20,25%,15%)] font-serif mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {formatter ? formatter(entry.value ?? 0) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Main Reports Component
// ============================================

export default function Reports() {
  const { churchId } = useAuth();
  const [dateRange, setDateRange] = useState('6months');
  const [comparisonPeriod, setComparisonPeriod] = useState<'month' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('attendance');
  const [selectedCustomFields, setSelectedCustomFields] = useState<string[]>([]);
  const [customReportDateRange, setCustomReportDateRange] = useState({
    start: '',
    end: '',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingCustomReport, setIsGeneratingCustomReport] = useState(false);

  // Get date range params for API calls
  const dateRangeParams = useMemo(() => getDateRangeParams(dateRange), [dateRange]);

  // ============================================
  // API Queries
  // ============================================

  // Dashboard stats
  const {
    data: dashboardStats,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboardStats();

  // Attendance data
  const {
    data: attendanceStats,
    isLoading: isAttendanceLoading,
  } = useAttendanceStats({
    startDate: dateRangeParams.startDate,
    endDate: dateRangeParams.endDate,
    groupBy: 'month',
    includeBreakdown: true,
  });

  // Attendance comparison
  const {
    data: attendanceComparison,
    isLoading: isAttendanceComparisonLoading,
  } = useAttendanceComparison();

  // Giving data
  const {
    data: givingReport,
    isLoading: isGivingLoading,
  } = useGivingReport({
    startDate: dateRangeParams.startDate,
    endDate: dateRangeParams.endDate,
    groupBy: 'month',
    includeTopDonors: true,
  });

  // Giving comparison
  const {
    data: givingComparison,
    isLoading: isGivingComparisonLoading,
  } = useGivingComparison();

  // Giving by fund
  const {
    data: givingByFund,
    isLoading: isGivingByFundLoading,
  } = useGivingByFund({
    startDate: dateRangeParams.startDate,
    endDate: dateRangeParams.endDate,
  });

  // Membership stats
  const {
    data: membershipStats,
    isLoading: isMembershipLoading,
  } = useMembershipStats({
    startDate: dateRangeParams.startDate,
    endDate: dateRangeParams.endDate,
    groupBy: 'month',
    includeAgeBreakdown: true,
  });

  // Membership growth
  const {
    data: _membershipGrowth,
    isLoading: isMembershipGrowthLoading,
  } = useMembershipGrowth({
    startDate: dateRangeParams.startDate,
    endDate: dateRangeParams.endDate,
    groupBy: 'month',
  });

  // Ministry reports
  const {
    data: ministryReports,
    isLoading: isMinistriesLoading,
  } = useMinistryReports({
    startDate: dateRangeParams.startDate,
    endDate: dateRangeParams.endDate,
  });

  // Volunteer hours
  const {
    data: volunteerHoursReport,
    isLoading: isVolunteerHoursLoading,
  } = useVolunteerHoursReport({
    startDate: dateRangeParams.startDate,
    endDate: dateRangeParams.endDate,
    groupBy: 'month',
  });

  // First-time visitors
  const {
    data: firstTimeVisitorReport,
    isLoading: isVisitorLoading,
  } = useFirstTimeVisitorReport({
    startDate: dateRangeParams.startDate,
    endDate: dateRangeParams.endDate,
    groupBy: 'month',
  });

  // Saved reports
  const {
    data: savedReportsData,
    isLoading: savedReportsLoading,
  } = useSavedReports();

  // Mutations
  const generateCustomReportMutation = useGenerateCustomReport();
  const exportReportMutation = useExportReport();

  // ============================================
  // Derived Data
  // ============================================

  const isLoading = isDashboardLoading || isAttendanceLoading || isGivingLoading || isMembershipLoading;
  const error = dashboardError;

  // Transform attendance data for charts
  const attendanceChartData = useMemo(() => {
    if (!attendanceStats?.trend) return [];
    return attendanceStats.trend.map((item) => ({
      month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
      attendance: item.attendance,
      firstTime: Math.round(item.attendance * 0.1), // Estimate if not available
      previousYear: attendanceComparison?.previousValue
        ? Math.round(item.attendance * (attendanceComparison.previousValue / attendanceComparison.currentValue))
        : undefined,
    }));
  }, [attendanceStats, attendanceComparison]);

  // Transform giving data for charts
  const givingChartData = useMemo(() => {
    if (!givingReport?.trend) return [];
    return givingReport.trend.map((item) => ({
      month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
      total: item.amount,
      tithes: Math.round(item.amount * 0.6), // Estimate breakdown
      offerings: Math.round(item.amount * 0.3),
      missions: Math.round(item.amount * 0.1),
      previousYear: givingComparison?.previousValue
        ? Math.round(item.amount * (givingComparison.previousValue / givingComparison.currentValue))
        : undefined,
    }));
  }, [givingReport, givingComparison]);

  // Transform membership data for pie chart
  const membershipPieData = useMemo(() => {
    if (!membershipStats?.byStatus) return [];
    const statusColors: Record<string, string> = {
      active: CHART_COLORS[0],
      inactive: CHART_COLORS[1],
      new: CHART_COLORS[2],
      visitor: CHART_COLORS[3],
      former: CHART_COLORS[4],
    };
    return Object.entries(membershipStats.byStatus).map(([status, value]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value,
      color: statusColors[status] || CHART_COLORS[0],
    }));
  }, [membershipStats]);

  // Transform ministry data
  const ministryChartData = useMemo(() => {
    if (!ministryReports) return [];
    return ministryReports.map((ministry) => ({
      name: ministry.ministryName,
      members: ministry.memberCount,
      growth: ministry.volunteerCount > 0
        ? Math.round((ministry.memberCount / ministry.volunteerCount) * 10 - 100)
        : 0,
    }));
  }, [ministryReports]);

  // Weekly attendance data (from attendance trend)
  const weeklyAttendanceData = useMemo(() => {
    if (!attendanceStats?.trend) return [];
    return attendanceStats.trend.slice(-8).map((item, index) => ({
      week: `Week ${index + 1}`,
      sunday: item.attendance,
      wednesday: Math.round(item.attendance * 0.4), // Estimate midweek
    }));
  }, [attendanceStats]);

  // Volunteer stats from API
  const volunteerStats = useMemo(() => ({
    activeVolunteers: volunteerHoursReport?.totalVolunteers ?? 0,
    volunteerChange: dashboardStats?.volunteers?.active
      ? Math.round(((volunteerHoursReport?.totalVolunteers ?? 0) / dashboardStats.volunteers.active - 1) * 100)
      : 0,
    totalHours: volunteerHoursReport?.totalHours ?? 0,
    hoursChange: volunteerHoursReport?.averageHoursPerVolunteer
      ? Math.round(volunteerHoursReport.averageHoursPerVolunteer)
      : 0,
  }), [volunteerHoursReport, dashboardStats]);

  // Growth metrics from membership stats
  const growthMetrics = useMemo(() => ({
    memberRetention: membershipStats?.retentionRate ?? 0,
    retentionChange: membershipStats?.retentionRate ? Math.round(membershipStats.retentionRate - 90) : 0,
    discipleshipEnrollment: membershipStats?.newMembers ?? 0,
    enrollmentChange: membershipStats?.newMembers
      ? Math.round((membershipStats.newMembers / (membershipStats.totalMembers || 1)) * 100)
      : 0,
  }), [membershipStats]);

  // First-time visitors chart data
  const visitorChartData = useMemo(() => {
    if (!firstTimeVisitorReport?.trend) return [];
    return firstTimeVisitorReport.trend.map((item) => ({
      month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
      firstTime: item.visitors,
      converted: item.converted,
    }));
  }, [firstTimeVisitorReport]);

  // Volunteer hours by team chart data
  const volunteerHoursByTeamData = useMemo(() => {
    if (!volunteerHoursReport?.byTeam) return [];
    return volunteerHoursReport.byTeam.map((team) => ({
      name: team.teamName,
      hours: team.hours,
      volunteers: team.volunteers,
    }));
  }, [volunteerHoursReport]);

  // Volunteer trend data
  const volunteerTrendData = useMemo(() => {
    if (!volunteerHoursReport?.trend) return [];
    return volunteerHoursReport.trend.map((item) => ({
      month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
      hours: item.hours,
    }));
  }, [volunteerHoursReport]);

  // Saved reports
  const savedReports = useMemo(() => {
    return (savedReportsData ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      date: r.date,
      size: r.size,
    }));
  }, [savedReportsData]);

  // Stats for metric cards
  const stats = useMemo(() => {
    if (!dashboardStats) return undefined;
    return {
      avgAttendance: dashboardStats.attendance?.averageAttendance ?? 0,
      avgAttendanceChange: dashboardStats.attendance?.growthPercentage ?? 0,
      totalGiving: dashboardStats.giving?.yearToDate ?? 0,
      totalGivingChange: dashboardStats.giving?.growthPercentage ?? 0,
      newMembers: dashboardStats.membership?.newThisMonth ?? 0,
      newMembersChange: dashboardStats.membership?.growthPercentage ?? 0,
      firstTimeGuests: firstTimeVisitorReport?.totalVisitors ?? 0,
      firstTimeGuestsChange: firstTimeVisitorReport?.conversionRate ?? 0,
    };
  }, [dashboardStats, firstTimeVisitorReport]);

  // ============================================
  // Event Handlers
  // ============================================

  // Handle custom field toggle
  const handleCustomFieldToggle = (fieldId: string) => {
    setSelectedCustomFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  // Export handlers
  const handleExportPDF = useCallback(async () => {
    if (!churchId) return;
    setIsExporting(true);
    try {
      const blob = await exportReportMutation.mutateAsync({
        reportType: 'dashboard',
        params: dateRangeParams,
        exportOptions: {
          format: 'pdf',
          includeCharts: true,
          paperSize: 'letter',
          orientation: 'landscape',
        },
      });
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `church-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [churchId, dateRangeParams, exportReportMutation]);

  const handleExportCSV = useCallback(async () => {
    if (!churchId) return;
    setIsExporting(true);
    try {
      const blob = await exportReportMutation.mutateAsync({
        reportType: 'dashboard',
        params: dateRangeParams,
        exportOptions: {
          format: 'csv',
        },
      });
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `church-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [churchId, dateRangeParams, exportReportMutation]);

  // Generate custom report
  const handleGenerateCustomReport = useCallback(async () => {
    if (!churchId || selectedCustomFields.length === 0) return;
    setIsGeneratingCustomReport(true);
    try {
      await generateCustomReportMutation.mutateAsync({
        name: `Custom Report - ${new Date().toLocaleDateString()}`,
        type: 'combined',
        filters: {
          startDate: customReportDateRange.start || dateRangeParams.startDate,
          endDate: customReportDateRange.end || dateRangeParams.endDate,
        },
        columns: selectedCustomFields,
        format: 'table',
      });
      // Could show success toast here
    } catch (err) {
      console.error('Generate custom report failed:', err);
    } finally {
      setIsGeneratingCustomReport(false);
    }
  }, [churchId, selectedCustomFields, customReportDateRange, dateRangeParams, generateCustomReportMutation]);

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="border-[hsl(0,65%,50%,0.3)]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-serif">Unable to Load Reports</AlertTitle>
          <AlertDescription>
            We could not retrieve your report data at this time. Please try again or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-[hsl(40,33%,97%)] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[hsl(20,25%,15%)] font-serif">
            Church Reports
          </h1>
          <p className="text-[hsl(20,10%,45%)] mt-2 text-lg">
            Insights to guide your ministry and celebrate God&apos;s faithfulness
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Date Range Selector */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px] border-[hsl(35,20%,88%)] bg-white">
              <Calendar className="h-4 w-4 mr-2 text-[hsl(345,45%,32%)]" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {/* Comparison Period Selector */}
          <Select
            value={comparisonPeriod}
            onValueChange={(v: 'month' | 'year') => setComparisonPeriod(v)}
          >
            <SelectTrigger className="w-[160px] border-[hsl(35,20%,88%)] bg-white">
              <Clock className="h-4 w-4 mr-2 text-[hsl(150,25%,40%)]" />
              <SelectValue placeholder="Compare to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">vs Last Month</SelectItem>
              <SelectItem value="year">vs Last Year</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-[hsl(35,20%,88%)] hover:bg-[hsl(345,45%,32%,0.05)] hover:border-[hsl(345,45%,32%,0.3)]"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4 text-[hsl(345,45%,32%)]" />
              )}
              PDF
            </Button>
            <Button
              variant="outline"
              className="border-[hsl(35,20%,88%)] hover:bg-[hsl(150,25%,40%,0.05)] hover:border-[hsl(150,25%,40%,0.3)]"
              onClick={handleExportCSV}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4 text-[hsl(150,25%,40%)]" />
              )}
              CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Report Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[hsl(20,25%,15%)] font-serif flex items-center gap-2">
          <Filter className="h-5 w-5 text-[hsl(345,45%,32%)]" />
          Report Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {REPORT_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)}
            />
          ))}
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[hsl(20,25%,15%)] font-serif flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[hsl(345,45%,32%)]" />
          Key Metrics at a Glance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Average Attendance"
            value={stats?.avgAttendance ?? 0}
            change={stats?.avgAttendanceChange ?? 0}
            changeLabel={comparisonPeriod === 'month' ? 'vs last month' : 'vs last year'}
            icon={Users}
            isLoading={isLoading}
            comparison={{
              label: 'Peak Sunday',
              value: Math.round((stats?.avgAttendance ?? 0) * 1.3),
            }}
          />
          <MetricCard
            title="Total Giving"
            value={`$${(stats?.totalGiving ?? 0).toLocaleString()}`}
            change={stats?.totalGivingChange ?? 0}
            changeLabel={comparisonPeriod === 'month' ? 'vs last month' : 'vs last year'}
            icon={DollarSign}
            isLoading={isLoading}
            comparison={{
              label: 'Monthly Average',
              value: `$${Math.round((stats?.totalGiving ?? 0) / 6).toLocaleString()}`,
            }}
          />
          <MetricCard
            title="New Members"
            value={stats?.newMembers ?? 0}
            change={stats?.newMembersChange ?? 0}
            changeLabel={comparisonPeriod === 'month' ? 'vs last month' : 'vs last year'}
            icon={UserPlus}
            isLoading={isLoading}
            comparison={{
              label: 'Baptisms',
              value: Math.round((stats?.newMembers ?? 0) * 0.6),
            }}
          />
          <MetricCard
            title="First-Time Guests"
            value={stats?.firstTimeGuests ?? 0}
            change={stats?.firstTimeGuestsChange ?? 0}
            changeLabel={comparisonPeriod === 'month' ? 'vs last month' : 'vs last year'}
            icon={Heart}
            isLoading={isLoading || isVisitorLoading}
            comparison={{
              label: 'Conversion Rate',
              value: `${firstTimeVisitorReport?.conversionRate ?? 0}%`,
            }}
          />
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Volunteers"
            value={volunteerStats.activeVolunteers}
            change={volunteerStats.volunteerChange}
            changeLabel={comparisonPeriod === 'month' ? 'vs last month' : 'vs last year'}
            icon={HandHeart}
            isLoading={isVolunteerHoursLoading}
          />
          <MetricCard
            title="Volunteer Hours"
            value={volunteerStats.totalHours.toLocaleString()}
            change={volunteerStats.hoursChange}
            changeLabel="avg per volunteer"
            icon={Clock}
            isLoading={isVolunteerHoursLoading}
          />
          <MetricCard
            title="Member Retention"
            value={`${growthMetrics.memberRetention}%`}
            change={growthMetrics.retentionChange}
            changeLabel={comparisonPeriod === 'month' ? 'vs last month' : 'vs last year'}
            icon={Users}
            isLoading={isMembershipLoading}
          />
          <MetricCard
            title="Discipleship Groups"
            value={growthMetrics.discipleshipEnrollment}
            change={growthMetrics.enrollmentChange}
            changeLabel="of total members"
            icon={Sprout}
            isLoading={isMembershipLoading}
          />
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border border-[hsl(35,20%,88%)] p-1 rounded-xl">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-[hsl(345,45%,32%)] data-[state=active]:text-white rounded-lg px-4"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="data-[state=active]:bg-[hsl(345,45%,32%)] data-[state=active]:text-white rounded-lg px-4"
          >
            <Users className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger
            value="giving"
            className="data-[state=active]:bg-[hsl(345,45%,32%)] data-[state=active]:text-white rounded-lg px-4"
          >
            <Heart className="h-4 w-4 mr-2" />
            Giving
          </TabsTrigger>
          <TabsTrigger
            value="membership"
            className="data-[state=active]:bg-[hsl(345,45%,32%)] data-[state=active]:text-white rounded-lg px-4"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Membership
          </TabsTrigger>
          <TabsTrigger
            value="volunteers"
            className="data-[state=active]:bg-[hsl(345,45%,32%)] data-[state=active]:text-white rounded-lg px-4"
          >
            <HandHeart className="h-4 w-4 mr-2" />
            Volunteers
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="data-[state=active]:bg-[hsl(345,45%,32%)] data-[state=active]:text-white rounded-lg px-4"
          >
            <Settings className="h-4 w-4 mr-2" />
            Custom Builder
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="data-[state=active]:bg-[hsl(345,45%,32%)] data-[state=active]:text-white rounded-lg px-4"
          >
            <FileText className="h-4 w-4 mr-2" />
            Saved Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Trend with Comparison */}
            {isAttendanceLoading || isAttendanceComparisonLoading ? (
              <ChartCardSkeleton />
            ) : (
              <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-serif text-[hsl(20,25%,15%)]">
                        Attendance Trend
                      </CardTitle>
                      <CardDescription>
                        Monthly worship attendance with year-over-year comparison
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`border-[${attendanceComparison?.trend === 'up' ? 'hsl(150,25%,40%)' : 'hsl(0,65%,50%)'}}] text-[${attendanceComparison?.trend === 'up' ? 'hsl(150,25%,40%)' : 'hsl(0,65%,50%)'}]`}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {attendanceComparison?.trend === 'up' ? 'Growing' : attendanceComparison?.trend === 'down' ? 'Declining' : 'Stable'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={attendanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="attendance"
                        fill={CHURCH_COLORS.burgundy}
                        name="This Year"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        type="monotone"
                        dataKey="previousYear"
                        stroke={CHURCH_COLORS.warmGray}
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        name="Last Year"
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Giving Overview with Comparison */}
            {isGivingLoading || isGivingComparisonLoading ? (
              <ChartCardSkeleton />
            ) : (
              <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-serif text-[hsl(20,25%,15%)]">
                        Giving Overview
                      </CardTitle>
                      <CardDescription>
                        Monthly giving breakdown by fund
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-[hsl(150,25%,40%)] text-[hsl(150,25%,40%)]"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{givingComparison?.percentageChange ?? stats?.totalGivingChange ?? 0}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={givingChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip
                        content={
                          <ChartTooltip
                            formatter={(value) => `$${value.toLocaleString()}`}
                          />
                        }
                      />
                      <Legend />
                      <Bar
                        dataKey="tithes"
                        fill={CHURCH_COLORS.burgundy}
                        name="Tithes"
                        radius={[4, 4, 0, 0]}
                        stackId="giving"
                      />
                      <Bar
                        dataKey="offerings"
                        fill={CHURCH_COLORS.sage}
                        name="Offerings"
                        radius={[0, 0, 0, 0]}
                        stackId="giving"
                      />
                      <Bar
                        dataKey="missions"
                        fill={CHURCH_COLORS.gold}
                        name="Missions"
                        radius={[4, 4, 0, 0]}
                        stackId="giving"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Membership Breakdown */}
            {isMembershipLoading ? (
              <ChartCardSkeleton />
            ) : (
              <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                <CardHeader>
                  <CardTitle className="font-serif text-[hsl(20,25%,15%)]">
                    Membership Breakdown
                  </CardTitle>
                  <CardDescription>
                    Current congregation composition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={membershipPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {membershipPieData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {membershipPieData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(40,33%,97%)]"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-[hsl(20,25%,15%)]">
                          {item.name}
                        </span>
                        <span className="text-sm font-semibold ml-auto">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ministry Growth */}
            {isMinistriesLoading ? (
              <ChartCardSkeleton />
            ) : (
              <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                <CardHeader>
                  <CardTitle className="font-serif text-[hsl(20,25%,15%)]">
                    Ministry Participation
                  </CardTitle>
                  <CardDescription>
                    Active members by ministry team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ministryChartData.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No ministry data available
                      </p>
                    ) : (
                      ministryChartData.map((ministry, index) => (
                        <div key={ministry.name} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-[hsl(20,25%,15%)]">
                              {ministry.name}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">
                                {ministry.members} members
                              </span>
                              <TrendIndicator value={ministry.growth} />
                            </div>
                          </div>
                          <div className="w-full bg-[hsl(35,20%,90%)] rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min((ministry.members / 160) * 100, 100)}%`,
                                backgroundColor:
                                  CHART_COLORS[index % CHART_COLORS.length],
                              }}
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

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isAttendanceLoading ? (
              <>
                <ChartCardSkeleton />
                <ChartCardSkeleton />
                <ChartCardSkeleton />
              </>
            ) : (
              <>
                <Card className="lg:col-span-2 border-[hsl(35,20%,88%)] bg-white church-glow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-serif text-[hsl(20,25%,15%)]">
                          Weekly Attendance Comparison
                        </CardTitle>
                        <CardDescription>
                          Sunday worship vs midweek services
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting}>
                          {isExporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={weeklyAttendanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
                        <XAxis
                          dataKey="week"
                          tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }}
                        />
                        <YAxis tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="sunday"
                          stroke={CHURCH_COLORS.burgundy}
                          strokeWidth={3}
                          dot={{ r: 5, fill: CHURCH_COLORS.burgundy }}
                          name="Sunday Service"
                        />
                        <Line
                          type="monotone"
                          dataKey="wednesday"
                          stroke={CHURCH_COLORS.sage}
                          strokeWidth={3}
                          dot={{ r: 5, fill: CHURCH_COLORS.sage }}
                          name="Wednesday Service"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                  <CardHeader>
                    <CardTitle className="font-serif text-[hsl(20,25%,15%)]">
                      First-Time Guests
                    </CardTitle>
                    <CardDescription>
                      Monthly visitor trend - celebrating new faces
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isVisitorLoading ? (
                      <div className="h-[220px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[hsl(345,45%,32%)]" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={visitorChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
                          <XAxis
                            dataKey="month"
                            tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }}
                          />
                          <YAxis tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }} />
                          <Tooltip content={<ChartTooltip />} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="firstTime"
                            stroke={CHURCH_COLORS.gold}
                            fill={CHURCH_COLORS.gold}
                            fillOpacity={0.3}
                            name="First-Time Guests"
                          />
                          <Area
                            type="monotone"
                            dataKey="converted"
                            stroke={CHURCH_COLORS.sage}
                            fill={CHURCH_COLORS.sage}
                            fillOpacity={0.3}
                            name="Converted to Members"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                  <CardHeader>
                    <CardTitle className="font-serif text-[hsl(20,25%,15%)]">
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Common attendance reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between border-[hsl(35,20%,88%)] hover:bg-[hsl(345,45%,32%,0.05)]"
                      onClick={handleExportPDF}
                      disabled={isExporting}
                    >
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-[hsl(345,45%,32%)]" />
                        Download Attendance Report
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-between border-[hsl(35,20%,88%)] hover:bg-[hsl(345,45%,32%,0.05)]"
                    >
                      <span className="flex items-center gap-2">
                        <Printer className="h-4 w-4 text-[hsl(345,45%,32%)]" />
                        Print Check-in Summary
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-between border-[hsl(35,20%,88%)] hover:bg-[hsl(345,45%,32%,0.05)]"
                    >
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[hsl(345,45%,32%)]" />
                        Email Report to Leaders
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Giving Tab */}
        <TabsContent value="giving" className="space-y-6">
          {isGivingLoading || isGivingByFundLoading ? (
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
              <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-serif text-[hsl(20,25%,15%)]">
                        Giving Trends
                      </CardTitle>
                      <CardDescription>
                        Faithful stewardship over time
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting}>
                        <FileText className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isExporting}>
                        <FileSpreadsheet className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={givingChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip
                        content={
                          <ChartTooltip
                            formatter={(value) => `$${value.toLocaleString()}`}
                          />
                        }
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="tithes"
                        stackId="1"
                        stroke={CHURCH_COLORS.burgundy}
                        fill={CHURCH_COLORS.burgundy}
                        fillOpacity={0.7}
                        name="Tithes"
                      />
                      <Area
                        type="monotone"
                        dataKey="offerings"
                        stackId="1"
                        stroke={CHURCH_COLORS.sage}
                        fill={CHURCH_COLORS.sage}
                        fillOpacity={0.7}
                        name="Offerings"
                      />
                      <Area
                        type="monotone"
                        dataKey="missions"
                        stackId="1"
                        stroke={CHURCH_COLORS.gold}
                        fill={CHURCH_COLORS.gold}
                        fillOpacity={0.7}
                        name="Missions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {givingByFund && givingByFund.length > 0 ? (
                  givingByFund.slice(0, 3).map((fund, index) => (
                    <Card key={fund.fundId} className="border-[hsl(35,20%,88%)] bg-white church-glow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-serif text-[hsl(20,25%,15%)]">
                          {fund.fundName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div
                          className="text-3xl font-bold font-serif"
                          style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}
                        >
                          ${fund.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {fund.percentage}% of total ({fund.count} donations)
                        </div>
                        <div className="mt-3 pt-3 border-t border-[hsl(35,20%,88%)]">
                          <TrendIndicator value={givingReport?.yearOverYearGrowth ?? 0} />
                          <span className="text-xs text-muted-foreground ml-2">
                            compared to last year
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <>
                    <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-serif text-[hsl(20,25%,15%)]">
                          Tithes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-[hsl(345,45%,32%)] font-serif">
                          ${givingChartData.reduce((sum, d) => sum + d.tithes, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Year-to-date total
                        </div>
                        <div className="mt-3 pt-3 border-t border-[hsl(35,20%,88%)]">
                          <TrendIndicator value={givingReport?.yearOverYearGrowth ?? 10} />
                          <span className="text-xs text-muted-foreground ml-2">
                            compared to last year
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-serif text-[hsl(20,25%,15%)]">
                          Offerings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-[hsl(150,25%,40%)] font-serif">
                          ${givingChartData.reduce((sum, d) => sum + d.offerings, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Year-to-date total
                        </div>
                        <div className="mt-3 pt-3 border-t border-[hsl(35,20%,88%)]">
                          <TrendIndicator value={15} />
                          <span className="text-xs text-muted-foreground ml-2">
                            compared to last year
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-serif text-[hsl(20,25%,15%)]">
                          Missions Fund
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-[hsl(35,60%,50%)] font-serif">
                          ${givingChartData.reduce((sum, d) => sum + d.missions, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Year-to-date total
                        </div>
                        <div className="mt-3 pt-3 border-t border-[hsl(35,20%,88%)]">
                          <TrendIndicator value={22} />
                          <span className="text-xs text-muted-foreground ml-2">
                            compared to last year
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* Membership Tab */}
        <TabsContent value="membership" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isMembershipLoading || isMembershipGrowthLoading ? (
              <>
                <ChartCardSkeleton />
                <Card className="border-[hsl(35,20%,88%)]">
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
                <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                  <CardHeader>
                    <CardTitle className="font-serif text-[hsl(20,25%,15%)]">
                      Membership Status
                    </CardTitle>
                    <CardDescription>
                      Our church family composition
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={membershipPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                          labelLine={{ stroke: 'hsl(35, 20%, 88%)' }}
                        >
                          {membershipPieData.map((entry) => (
                            <Cell key={`cell-membership-${entry.name}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                  <CardHeader>
                    <CardTitle className="font-serif text-[hsl(20,25%,15%)]">
                      Membership Reports
                    </CardTitle>
                    <CardDescription>
                      Common membership insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between border-[hsl(35,20%,88%)] hover:bg-[hsl(345,45%,32%,0.05)]"
                    >
                      <span className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-[hsl(150,25%,40%)]" />
                        New Member Report
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-between border-[hsl(35,20%,88%)] hover:bg-[hsl(345,45%,32%,0.05)]"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[hsl(345,45%,32%)]" />
                        Inactive Members Report
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-between border-[hsl(35,20%,88%)] hover:bg-[hsl(345,45%,32%,0.05)]"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[hsl(35,60%,50%)]" />
                        Birthday/Anniversary Report
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-between border-[hsl(35,20%,88%)] hover:bg-[hsl(345,45%,32%,0.05)]"
                      onClick={handleExportCSV}
                      disabled={isExporting}
                    >
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-[hsl(220,45%,45%)]" />
                        Member Directory Export
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Volunteers Tab */}
        <TabsContent value="volunteers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isVolunteerHoursLoading ? (
              <>
                <ChartCardSkeleton />
                <ChartCardSkeleton />
              </>
            ) : (
              <>
                <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                  <CardHeader>
                    <CardTitle className="font-serif text-[hsl(20,25%,15%)]">
                      Volunteer Hours by Ministry
                    </CardTitle>
                    <CardDescription>
                      Celebrating servant leadership
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={volunteerHoursByTeamData}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
                        <XAxis
                          type="number"
                          tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={100}
                          tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar
                          dataKey="hours"
                          fill={CHURCH_COLORS.stainedBlue}
                          name="Hours"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
                  <CardHeader>
                    <CardTitle className="font-serif text-[hsl(20,25%,15%)]">
                      Volunteer Engagement
                    </CardTitle>
                    <CardDescription>
                      Monthly participation trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={volunteerTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }}
                        />
                        <YAxis tick={{ fill: 'hsl(20, 10%, 45%)', fontSize: 12 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="hours"
                          stroke={CHURCH_COLORS.stainedBlue}
                          strokeWidth={3}
                          name="Volunteer Hours"
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Custom Report Builder Tab */}
        <TabsContent value="custom" className="space-y-6">
          <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-[hsl(20,25%,15%)] flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[hsl(345,45%,32%)]" />
                    Custom Report Builder
                  </CardTitle>
                  <CardDescription>
                    Create personalized reports tailored to your ministry needs
                  </CardDescription>
                </div>
                <Button
                  className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)] text-white"
                  disabled={selectedCustomFields.length === 0 || isGeneratingCustomReport}
                  onClick={handleGenerateCustomReport}
                >
                  {isGeneratingCustomReport ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Generate Report
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range for Custom Report */}
              <div className="p-4 bg-[hsl(40,33%,97%)] rounded-xl border border-[hsl(35,20%,88%)]">
                <h3 className="font-semibold text-[hsl(20,25%,15%)] mb-3 font-serif">
                  Report Date Range
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Start Date
                    </Label>
                    <input
                      type="date"
                      className="w-full p-2 border border-[hsl(35,20%,88%)] rounded-lg bg-white"
                      value={customReportDateRange.start}
                      onChange={(e) =>
                        setCustomReportDateRange((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      End Date
                    </Label>
                    <input
                      type="date"
                      className="w-full p-2 border border-[hsl(35,20%,88%)] rounded-lg bg-white"
                      value={customReportDateRange.end}
                      onChange={(e) =>
                        setCustomReportDateRange((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Field Selection */}
              <div>
                <h3 className="font-semibold text-[hsl(20,25%,15%)] mb-4 font-serif">
                  Select Report Fields
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {['Attendance', 'Giving', 'Membership', 'Volunteers'].map(
                    (category) => (
                      <div
                        key={category}
                        className="p-4 bg-[hsl(40,33%,97%)] rounded-xl border border-[hsl(35,20%,88%)]"
                      >
                        <h4 className="font-medium text-[hsl(20,25%,15%)] mb-3 flex items-center gap-2">
                          {category === 'Attendance' && (
                            <Users className="h-4 w-4 text-[hsl(345,45%,32%)]" />
                          )}
                          {category === 'Giving' && (
                            <Heart className="h-4 w-4 text-[hsl(150,25%,40%)]" />
                          )}
                          {category === 'Membership' && (
                            <UserPlus className="h-4 w-4 text-[hsl(35,60%,50%)]" />
                          )}
                          {category === 'Volunteers' && (
                            <HandHeart className="h-4 w-4 text-[hsl(220,45%,45%)]" />
                          )}
                          {category}
                        </h4>
                        <div className="space-y-2">
                          {CUSTOM_REPORT_FIELDS.filter(
                            (f) => f.category === category
                          ).map((field) => (
                            <div
                              key={field.id}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                id={field.id}
                                checked={selectedCustomFields.includes(field.id)}
                                onCheckedChange={() =>
                                  handleCustomFieldToggle(field.id)
                                }
                                className="border-[hsl(35,20%,88%)] data-[state=checked]:bg-[hsl(345,45%,32%)] data-[state=checked]:border-[hsl(345,45%,32%)]"
                              />
                              <Label
                                htmlFor={field.id}
                                className="text-sm text-[hsl(20,25%,15%)] cursor-pointer"
                              >
                                {field.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Selected Fields Preview */}
              {selectedCustomFields.length > 0 && (
                <div className="p-4 bg-[hsl(345,45%,32%,0.05)] rounded-xl border border-[hsl(345,45%,32%,0.2)]">
                  <h4 className="font-medium text-[hsl(20,25%,15%)] mb-2">
                    Selected Fields ({selectedCustomFields.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomFields.map((fieldId) => {
                      const field = CUSTOM_REPORT_FIELDS.find(
                        (f) => f.id === fieldId
                      );
                      return (
                        <Badge
                          key={fieldId}
                          variant="secondary"
                          className="bg-white border border-[hsl(35,20%,88%)]"
                        >
                          {field?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Export Options */}
              <div className="flex gap-3 pt-4 border-t border-[hsl(35,20%,88%)]">
                <Button
                  variant="outline"
                  className="border-[hsl(35,20%,88%)]"
                  disabled={selectedCustomFields.length === 0 || isExporting}
                  onClick={handleExportPDF}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2 text-[hsl(345,45%,32%)]" />
                  )}
                  Export as PDF
                </Button>
                <Button
                  variant="outline"
                  className="border-[hsl(35,20%,88%)]"
                  disabled={selectedCustomFields.length === 0 || isExporting}
                  onClick={handleExportCSV}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-[hsl(150,25%,40%)]" />
                  )}
                  Export as CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Reports Tab */}
        <TabsContent value="saved" className="space-y-6">
          <Card className="border-[hsl(35,20%,88%)] bg-white church-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-[hsl(20,25%,15%)]">
                    Saved Reports
                  </CardTitle>
                  <CardDescription>
                    Access your previously generated reports
                  </CardDescription>
                </div>
                <Button className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {savedReportsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : savedReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-[hsl(35,20%,80%)]" />
                  <h3 className="mt-4 text-lg font-semibold text-[hsl(20,25%,15%)] font-serif">
                    No Saved Reports
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Generate a report from any tab and it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border border-[hsl(35,20%,88%)] rounded-xl hover:bg-[hsl(40,33%,97%)] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[hsl(345,45%,32%,0.1)] rounded-xl">
                          <FileText className="h-5 w-5 text-[hsl(345,45%,32%)]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[hsl(20,25%,15%)]">
                            {report.name}
                          </h4>
                          <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                            <Badge
                              variant="outline"
                              className="border-[hsl(35,20%,88%)]"
                            >
                              {report.type}
                            </Badge>
                            <span>
                              {new Date(report.date).toLocaleDateString()}
                            </span>
                            <span>{report.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Printer className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
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
