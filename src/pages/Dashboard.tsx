import {} from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Users,
  DollarSign,
  Heart,
  UserPlus,
  PlusCircle,
  CalendarPlus,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  HandHeart,
  Percent,
  Cake,
  BarChart3,
} from "lucide-react";
import { routes } from "@/routes";
import { useAuth } from "@/hooks/useAuth";
import { api, reportsApi, eventsApi, donationsApi, prayerApi } from "@/lib/api";
import type { DashboardStats, Event, Donation, PrayerRequest, Member } from "@/types";

// Get formatted date
function getFormattedDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("en-US", options);
}

// Get greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type ChangeType = "positive" | "negative" | "neutral";

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  changeType: ChangeType;
  description: string;
}

// Demographics types
interface AgeDistribution {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface GenderDistribution {
  male: number;
  female: number;
  other: number;
  total: number;
}

interface BirthdayMember {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

interface NewMemberEntry {
  id: string;
  firstName: string;
  lastName: string;
  memberSince: string;
}

// Age group config with brand colors
const ageGroupConfig: { label: string; min: number; max: number; color: string }[] = [
  { label: "0-12", min: 0, max: 12, color: "bg-spirit-400" },
  { label: "13-17", min: 13, max: 17, color: "bg-spirit-600" },
  { label: "18-25", min: 18, max: 25, color: "bg-sanctuary-400" },
  { label: "26-35", min: 26, max: 35, color: "bg-sanctuary-600" },
  { label: "36-45", min: 36, max: 45, color: "bg-golden-400" },
  { label: "46-55", min: 46, max: 55, color: "bg-golden-600" },
  { label: "56-65", min: 56, max: 65, color: "bg-vesper-400" },
  { label: "65+", min: 65, max: 200, color: "bg-vesper-600" },
];

// Helper to calculate age from date of birth
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Helper to compute age distribution from member data
function computeAgeDistribution(members: Member[]): AgeDistribution[] {
  const membersWithDob = members.filter((m) => m.dateOfBirth);
  const total = membersWithDob.length;

  return ageGroupConfig.map((group) => {
    const count = membersWithDob.filter((m) => {
      const age = calculateAge(m.dateOfBirth!);
      return group.label === "65+"
        ? age >= 65
        : age >= group.min && age <= group.max;
    }).length;
    return {
      label: group.label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: group.color,
    };
  });
}

// Helper to compute gender distribution from member data
function computeGenderDistribution(members: Member[]): GenderDistribution {
  const male = members.filter((m) => m.gender === "male").length;
  const female = members.filter((m) => m.gender === "female").length;
  const other = members.filter(
    (m) => m.gender === "other" || m.gender === "prefer_not_to_say"
  ).length;
  return { male, female, other, total: members.length };
}

// Helper to get members with birthdays this month
function getBirthdaysThisMonth(members: Member[]): BirthdayMember[] {
  const currentMonth = new Date().getMonth();
  return members
    .filter((m) => {
      if (!m.dateOfBirth) return false;
      const birthMonth = new Date(m.dateOfBirth).getMonth();
      return birthMonth === currentMonth;
    })
    .sort((a, b) => {
      const dayA = new Date(a.dateOfBirth!).getDate();
      const dayB = new Date(b.dateOfBirth!).getDate();
      return dayA - dayB;
    })
    .slice(0, 5)
    .map((m) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      dateOfBirth: m.dateOfBirth!,
    }));
}

// Helper to get newest members this month
function getNewMembersThisMonth(members: Member[]): NewMemberEntry[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  return members
    .filter((m) => {
      const joinDate = new Date(m.memberSince || m.createdAt);
      return (
        joinDate.getMonth() === currentMonth &&
        joinDate.getFullYear() === currentYear
      );
    })
    .sort(
      (a, b) =>
        new Date(b.memberSince || b.createdAt).getTime() -
        new Date(a.memberSince || a.createdAt).getTime()
    )
    .slice(0, 5)
    .map((m) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      memberSince: m.memberSince || m.createdAt,
    }));
}

// Helper to format birthday display
function formatBirthday(dateOfBirth: string): string {
  const date = new Date(dateOfBirth);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Helper to format join date display
function formatJoinDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Helper to get initials from name
function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

const quickActions = [
  {
    label: "Add Member",
    href: routes.members.new,
    icon: UserPlus,
    bgColor: "bg-sanctuary-100",
    iconColor: "text-sanctuary-700",
    hoverBg: "hover:bg-sanctuary-200",
  },
  {
    label: "Record Donation",
    href: routes.donations.new,
    icon: PlusCircle,
    bgColor: "bg-spirit-100",
    iconColor: "text-spirit-700",
    hoverBg: "hover:bg-spirit-200",
  },
  {
    label: "Schedule Event",
    href: routes.events,
    icon: CalendarPlus,
    bgColor: "bg-grace-200",
    iconColor: "text-vesper-700",
    hoverBg: "hover:bg-grace-300",
  },
];

const statConfig = [
  {
    icon: Users,
    color: "text-sanctuary-700",
    bgColor: "bg-sanctuary-100",
    label: "Total Members",
  },
  {
    icon: UserPlus,
    color: "text-spirit-600",
    bgColor: "bg-spirit-100",
    label: "New This Month",
  },
  {
    icon: Percent,
    color: "text-vesper-700",
    bgColor: "bg-grace-200",
    label: "Attendance %",
  },
  {
    icon: DollarSign,
    color: "text-spirit-700",
    bgColor: "bg-spirit-100",
    label: "Giving This Month",
  },
];

// Helper to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to format event date for display
function formatEventDate(dateString: string): { day: string; date: string } {
  const date = new Date(dateString);
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = date.getDate().toString();
  return { day: dayName, date: dayNum };
}

// Helper to format event time
function formatEventTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper to get donor initials
function getDonorInitials(donation: Donation): string {
  if (donation.isAnonymous) return "AN";
  if (donation.member?.firstName && donation.member?.lastName) {
    return `${donation.member.firstName[0]}${donation.member.lastName[0]}`.toUpperCase();
  }
  return "??";
}

// Helper to get donor name
function getDonorName(donation: Donation): string {
  if (donation.isAnonymous) return "Anonymous";
  if (donation.member?.firstName && donation.member?.lastName) {
    return `${donation.member.firstName} ${donation.member.lastName}`;
  }
  return "Unknown Donor";
}

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Transform API data to dashboard stats
function transformToDashboardStats(data: DashboardStats): DashboardStat[] {
  return [
    {
      title: "Total Members",
      value: data.membership.total.toString(),
      change: data.membership.growthPercentage >= 0
        ? `+${data.membership.growthPercentage}%`
        : `${data.membership.growthPercentage}%`,
      changeType: data.membership.growthPercentage >= 0 ? "positive" : "negative",
      description: "from last month",
    },
    {
      title: "New This Month",
      value: data.membership.newThisMonth.toString(),
      change: data.membership.newThisMonth > 0 ? `+${data.membership.newThisMonth}` : "0",
      changeType: data.membership.newThisMonth > 0 ? "positive" : "neutral",
      description: "new members",
    },
    {
      title: "Attendance",
      value: `${Math.round((data.attendance.lastWeek / data.membership.total) * 100)}%`,
      change: data.attendance.growthPercentage >= 0
        ? `+${data.attendance.growthPercentage}%`
        : `${data.attendance.growthPercentage}%`,
      changeType: data.attendance.growthPercentage >= 0 ? "positive" : "negative",
      description: "from last week",
    },
    {
      title: "Giving This Month",
      value: formatCurrency(data.giving.thisMonth),
      change: data.giving.growthPercentage >= 0
        ? `+${data.giving.growthPercentage}%`
        : `${data.giving.growthPercentage}%`,
      changeType: data.giving.growthPercentage >= 0 ? "positive" : "negative",
      description: "from last month",
    },
  ];
}

function StatCardSkeleton() {
  return (
    <Card className="border-grace-300 bg-grace-50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24 bg-grace-200" />
        <Skeleton className="h-10 w-10 rounded-xl bg-grace-200" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2 bg-grace-200" />
        <Skeleton className="h-4 w-32 bg-grace-200" />
      </CardContent>
    </Card>
  );
}

function DonationItemSkeleton() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full bg-grace-200" />
        <div>
          <Skeleton className="h-4 w-32 mb-1 bg-grace-200" />
          <Skeleton className="h-3 w-24 bg-grace-200" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 bg-grace-200" />
    </div>
  );
}

function EventItemSkeleton() {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-grace-200 last:border-0">
      <Skeleton className="h-14 w-14 rounded-xl bg-grace-200" />
      <div className="flex-1">
        <Skeleton className="h-4 w-40 mb-2 bg-grace-200" />
        <Skeleton className="h-3 w-32 mb-2 bg-grace-200" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full bg-grace-200" />
          <Skeleton className="h-5 w-20 bg-grace-200" />
        </div>
      </div>
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3">
      <Skeleton className="h-8 w-8 rounded-full bg-grace-200" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1 bg-grace-200" />
        <Skeleton className="h-3 w-48 bg-grace-200" />
      </div>
    </div>
  );
}

function InsightCardSkeleton() {
  return (
    <Card className="border-grace-300 bg-white">
      <CardHeader className="pb-4">
        <Skeleton className="h-5 w-36 bg-grace-200" />
        <Skeleton className="h-3 w-48 bg-grace-200" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full bg-grace-200" />
        <Skeleton className="h-4 w-4/5 bg-grace-200" />
        <Skeleton className="h-4 w-3/5 bg-grace-200" />
        <Skeleton className="h-4 w-2/5 bg-grace-200" />
      </CardContent>
    </Card>
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Skeleton className="h-9 w-9 rounded-full bg-grace-200" />
      <div className="flex-1">
        <Skeleton className="h-4 w-28 mb-1 bg-grace-200" />
        <Skeleton className="h-3 w-20 bg-grace-200" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { church, churchId } = useAuth();
  const churchName = church?.name || "Your Church";

  // Fetch dashboard stats
  const {
    data: dashboardStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboard", "stats", churchId],
    queryFn: () => reportsApi.getDashboard(churchId!),
    enabled: !!churchId,
  });

  // Fetch upcoming events
  const {
    data: upcomingEvents,
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useQuery({
    queryKey: ["dashboard", "events", churchId],
    queryFn: () => eventsApi.getUpcoming(churchId!, 3),
    enabled: !!churchId,
  });

  // Fetch recent donations
  const {
    data: donationsDashboard,
    isLoading: isLoadingDonations,
    error: donationsError,
  } = useQuery({
    queryKey: ["dashboard", "donations", churchId],
    queryFn: () => donationsApi.getDashboard(churchId!),
    enabled: !!churchId,
  });

  // Fetch urgent prayer requests
  const {
    data: urgentPrayers,
    isLoading: isLoadingPrayers,
    error: prayersError,
  } = useQuery({
    queryKey: ["dashboard", "prayers", churchId],
    queryFn: () => prayerApi.getUrgent(churchId!, 5),
    enabled: !!churchId,
  });

  // Fetch all members for demographics insights
  const {
    data: allMembersData,
    isLoading: isLoadingMembers,
  } = useQuery({
    queryKey: ["dashboard", "members-demographics", churchId],
    queryFn: () =>
      api.get<{ data: Member[]; pagination: { totalItems: number } }>(
        `/church/${churchId}/members`,
        { pageSize: 500, page: 1 }
      ),
    enabled: !!churchId,
  });

  // Derive insights from member data
  const allMembers: Member[] = allMembersData?.data ?? [];
  const ageDistribution = computeAgeDistribution(allMembers);
  const genderDistribution = computeGenderDistribution(allMembers);
  const birthdaysThisMonth = getBirthdaysThisMonth(allMembers);
  const newMembersThisMonth = getNewMembersThisMonth(allMembers);

  // Transform stats data
  const stats: DashboardStat[] = dashboardStats
    ? transformToDashboardStats(dashboardStats)
    : [];

  // Get recent donations from dashboard data
  const recentDonations: Donation[] = donationsDashboard?.recentDonations ?? [];

  // Check for any errors
  const hasError = statsError || eventsError || donationsError || prayersError;

  if (hasError) {
    return (
      <div className="space-y-6 p-6 bg-grace-50 min-h-screen">
        <Alert variant="destructive" className="border-sanctuary-300 bg-sanctuary-50">
          <AlertCircle className="h-4 w-4 text-sanctuary-700" />
          <AlertTitle className="text-sanctuary-900 font-serif">Error</AlertTitle>
          <AlertDescription className="text-sanctuary-700">
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-grace-50 min-h-screen">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sanctuary-800 via-sanctuary-700 to-sanctuary-900 p-8 text-white shadow-warm-lg">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-grace-100/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-spirit-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-grace-200/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-grace-200 text-sm font-medium">{getGreeting()}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 font-serif">{churchName}</h1>
          <p className="text-grace-200 max-w-xl mb-4">
            {getFormattedDate()}
          </p>
          <p className="text-grace-300/80 text-sm max-w-xl">
            Serving our community with love and grace. May this day bring blessings to all who enter.
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoadingStats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats.length === 0 ? (
          // Show empty state
          statConfig.map((config) => {
            const IconComponent = config.icon;
            return (
              <Card
                key={config.label}
                className="border-grace-300 bg-white hover:shadow-warm transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-vesper-600">
                    {config.label}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl ${config.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${config.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-vesper-900 font-serif">
                    --
                  </div>
                  <p className="text-xs text-vesper-500 mt-1">
                    No data available
                  </p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          stats.map((stat, index) => {
            const config = statConfig[index] || statConfig[0];
            const IconComponent = config.icon;
            return (
              <Card
                key={stat.title}
                className="border-grace-300 bg-white hover:shadow-warm transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-vesper-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl ${config.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${config.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-vesper-900 font-serif">
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {stat.changeType === "positive" ? (
                      <TrendingUp className="h-3.5 w-3.5 text-spirit-600" />
                    ) : stat.changeType === "negative" ? (
                      <TrendingDown className="h-3.5 w-3.5 text-sanctuary-600" />
                    ) : null}
                    <p className="text-xs text-vesper-600">
                      <span
                        className={
                          stat.changeType === "positive"
                            ? "text-spirit-600 font-medium"
                            : stat.changeType === "neutral"
                            ? "text-vesper-500"
                            : "text-sanctuary-600 font-medium"
                        }
                      >
                        {stat.change}
                      </span>{" "}
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Quick Actions */}
      <Card className="border-grace-300 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-vesper-900 font-serif">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-vesper-600">
            Common tasks at your fingertips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Button
                  variant="outline"
                  className={`${action.bgColor} ${action.hoverBg} border-grace-300 text-vesper-800 gap-2`}
                >
                  <action.icon className={`h-4 w-4 ${action.iconColor}`} />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Member Insights - Age & Gender Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Age Distribution */}
        {isLoadingMembers ? (
          <InsightCardSkeleton />
        ) : (
          <Card className="border-grace-300 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-vesper-900 font-serif flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-sanctuary-700" />
                Age Distribution
              </CardTitle>
              <CardDescription className="text-vesper-600">
                Member breakdown by age group
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allMembers.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-10 w-10 text-vesper-300 mx-auto mb-3" />
                  <p className="text-sm text-vesper-600">No member data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ageDistribution.map((group) => (
                    <div key={group.label} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-vesper-700 w-10 text-right">
                        {group.label}
                      </span>
                      <div className="flex-1 h-5 bg-grace-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${group.color} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(group.percentage, 2)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-vesper-800 w-14 text-right">
                        {group.percentage}%
                        <span className="text-vesper-500 font-normal ml-1">
                          ({group.count})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Gender Distribution */}
        {isLoadingMembers ? (
          <InsightCardSkeleton />
        ) : (
          <Card className="border-grace-300 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-vesper-900 font-serif flex items-center gap-2">
                <Users className="h-5 w-5 text-spirit-700" />
                Gender Distribution
              </CardTitle>
              <CardDescription className="text-vesper-600">
                Community gender breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 text-vesper-300 mx-auto mb-3" />
                  <p className="text-sm text-vesper-600">No member data available</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  {/* Donut visual using CSS */}
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      {(() => {
                        const total = genderDistribution.total || 1;
                        const malePercent = (genderDistribution.male / total) * 100;
                        const femalePercent = (genderDistribution.female / total) * 100;
                        const otherPercent = (genderDistribution.other / total) * 100;
                        const maleOffset = 0;
                        const femaleOffset = malePercent;
                        const otherOffset = malePercent + femalePercent;
                        return (
                          <>
                            <circle
                              cx="18"
                              cy="18"
                              r="15.9155"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              className="text-sanctuary-500"
                              strokeDasharray={`${malePercent} ${100 - malePercent}`}
                              strokeDashoffset={`${-maleOffset}`}
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="15.9155"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              className="text-spirit-500"
                              strokeDasharray={`${femalePercent} ${100 - femalePercent}`}
                              strokeDashoffset={`${-femaleOffset}`}
                            />
                            {otherPercent > 0 && (
                              <circle
                                cx="18"
                                cy="18"
                                r="15.9155"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3.5"
                                className="text-golden-500"
                                strokeDasharray={`${otherPercent} ${100 - otherPercent}`}
                                strokeDashoffset={`${-otherOffset}`}
                              />
                            )}
                          </>
                        );
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-vesper-900 font-serif">
                          {genderDistribution.total}
                        </span>
                        <p className="text-[10px] text-vesper-500 uppercase tracking-wide">
                          Total
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-sanctuary-500" />
                      <div>
                        <p className="text-sm font-semibold text-vesper-900">
                          {genderDistribution.male}
                        </p>
                        <p className="text-xs text-vesper-600">
                          Male ({genderDistribution.total > 0 ? Math.round((genderDistribution.male / genderDistribution.total) * 100) : 0}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-spirit-500" />
                      <div>
                        <p className="text-sm font-semibold text-vesper-900">
                          {genderDistribution.female}
                        </p>
                        <p className="text-xs text-vesper-600">
                          Female ({genderDistribution.total > 0 ? Math.round((genderDistribution.female / genderDistribution.total) * 100) : 0}%)
                        </p>
                      </div>
                    </div>
                    {genderDistribution.other > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-golden-500" />
                        <div>
                          <p className="text-sm font-semibold text-vesper-900">
                            {genderDistribution.other}
                          </p>
                          <p className="text-xs text-vesper-600">
                            Other ({Math.round((genderDistribution.other / genderDistribution.total) * 100)}%)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Member Insights - Birthdays & New Members */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Birthdays This Month */}
        {isLoadingMembers ? (
          <Card className="border-grace-300 bg-white">
            <CardHeader className="pb-4">
              <Skeleton className="h-5 w-40 bg-grace-200" />
              <Skeleton className="h-3 w-48 bg-grace-200" />
            </CardHeader>
            <CardContent className="space-y-1">
              <ListItemSkeleton />
              <ListItemSkeleton />
              <ListItemSkeleton />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-grace-300 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-semibold text-vesper-900 font-serif flex items-center gap-2">
                  <Cake className="h-5 w-5 text-golden-600" />
                  Birthdays This Month
                </CardTitle>
                <CardDescription className="text-vesper-600">
                  Celebrate with your community
                </CardDescription>
              </div>
              <Link href={routes.members.list}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sanctuary-700 hover:text-sanctuary-800 hover:bg-sanctuary-50"
                >
                  View All
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {birthdaysThisMonth.length === 0 ? (
                <div className="text-center py-8">
                  <Cake className="h-10 w-10 text-vesper-300 mx-auto mb-3" />
                  <p className="text-sm text-vesper-600">No birthdays this month</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {birthdaysThisMonth.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 py-2.5 border-b border-grace-200 last:border-0"
                    >
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-golden-400 to-golden-600 flex items-center justify-center text-xs font-semibold text-white shadow-sm">
                        {getInitials(member.firstName, member.lastName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-vesper-900 truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-vesper-600">
                          {formatBirthday(member.dateOfBirth)}
                        </p>
                      </div>
                      <Badge className="bg-golden-100 text-golden-700 border-golden-200 hover:bg-golden-100 text-xs">
                        {formatBirthday(member.dateOfBirth)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* New Members This Month */}
        {isLoadingMembers ? (
          <Card className="border-grace-300 bg-white">
            <CardHeader className="pb-4">
              <Skeleton className="h-5 w-36 bg-grace-200" />
              <Skeleton className="h-3 w-48 bg-grace-200" />
            </CardHeader>
            <CardContent className="space-y-1">
              <ListItemSkeleton />
              <ListItemSkeleton />
              <ListItemSkeleton />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-grace-300 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-semibold text-vesper-900 font-serif flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-spirit-700" />
                  New Members
                </CardTitle>
                <CardDescription className="text-vesper-600">
                  Recently joined this month
                </CardDescription>
              </div>
              <Link href={routes.members.list}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sanctuary-700 hover:text-sanctuary-800 hover:bg-sanctuary-50"
                >
                  View All
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {newMembersThisMonth.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-10 w-10 text-vesper-300 mx-auto mb-3" />
                  <p className="text-sm text-vesper-600">No new members this month</p>
                  <Link href={routes.members.new}>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-sanctuary-700 mt-2"
                    >
                      Add a member
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {newMembersThisMonth.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 py-2.5 border-b border-grace-200 last:border-0"
                    >
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-spirit-400 to-spirit-600 flex items-center justify-center text-xs font-semibold text-white shadow-sm">
                        {getInitials(member.firstName, member.lastName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-vesper-900 truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-vesper-600">
                          Joined {formatJoinDate(member.memberSince)}
                        </p>
                      </div>
                      <Badge className="bg-spirit-100 text-spirit-700 border-spirit-200 hover:bg-spirit-100 text-xs">
                        New
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Grid - Three Column */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Events - Takes 1 column */}
        <Card className="border-grace-300 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-vesper-900 font-serif">
                Upcoming Events
              </CardTitle>
              <CardDescription className="text-vesper-600">
                Next 3 events
              </CardDescription>
            </div>
            <Link href={routes.events}>
              <Button
                variant="ghost"
                size="sm"
                className="text-sanctuary-700 hover:text-sanctuary-800 hover:bg-sanctuary-50"
              >
                View All
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {isLoadingEvents ? (
                <>
                  <EventItemSkeleton />
                  <EventItemSkeleton />
                  <EventItemSkeleton />
                </>
              ) : !upcomingEvents || upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarPlus className="h-10 w-10 text-vesper-300 mx-auto mb-3" />
                  <p className="text-sm text-vesper-600">No upcoming events</p>
                  <Link href={routes.events}>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-sanctuary-700 mt-2"
                    >
                      Schedule an event
                    </Button>
                  </Link>
                </div>
              ) : (
                upcomingEvents.slice(0, 3).map((event: Event) => {
                  const { day, date } = formatEventDate(event.startDate);
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 py-3 border-b border-grace-200 last:border-0"
                    >
                      <div className="flex flex-col items-center justify-center rounded-xl bg-sanctuary-100 border border-sanctuary-200 px-3 py-2 min-w-[56px]">
                        <span className="text-[10px] font-semibold text-sanctuary-700 uppercase">
                          {day}
                        </span>
                        <span className="text-lg font-bold text-vesper-900">
                          {date}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-vesper-900 truncate">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-vesper-600 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatEventTime(event.startDate)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-vesper-600 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                        <div className="mt-2">
                          <Badge
                            className={
                              event.status === "published"
                                ? "bg-spirit-100 text-spirit-700 border-spirit-200 hover:bg-spirit-100"
                                : "bg-grace-200 text-vesper-700 border-grace-300 hover:bg-grace-200"
                            }
                          >
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Donations Summary - Takes 1 column */}
        <Card className="border-grace-300 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-vesper-900 font-serif">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-vesper-600">
              Latest donations received
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {isLoadingDonations ? (
                <>
                  <ActivityItemSkeleton />
                  <ActivityItemSkeleton />
                  <ActivityItemSkeleton />
                  <ActivityItemSkeleton />
                </>
              ) : recentDonations.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-10 w-10 text-vesper-300 mx-auto mb-3" />
                  <p className="text-sm text-vesper-600">No recent donations</p>
                  <Link href={routes.donations.new}>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-sanctuary-700 mt-2"
                    >
                      Record a donation
                    </Button>
                  </Link>
                </div>
              ) : (
                recentDonations.slice(0, 4).map((donation: Donation) => (
                  <div
                    key={donation.id}
                    className="flex items-start gap-3 py-3 border-b border-grace-200 last:border-0"
                  >
                    <div className="p-2 rounded-full bg-spirit-100">
                      <DollarSign className="h-4 w-4 text-spirit-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-vesper-900">
                        {getDonorName(donation)}
                      </p>
                      <p className="text-xs text-vesper-600 truncate">
                        {donation.fund} - {formatCurrency(donation.amount)}
                      </p>
                      <p className="text-xs text-vesper-500 mt-1">
                        {formatRelativeTime(donation.date)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prayer Requests Summary - Takes 1 column */}
        <Card className="border-grace-300 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-vesper-900 font-serif flex items-center gap-2">
                <HandHeart className="h-5 w-5 text-sanctuary-700" />
                Prayer Requests
              </CardTitle>
              <CardDescription className="text-vesper-600">
                Lift these up in prayer
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoadingPrayers ? (
                <>
                  <ActivityItemSkeleton />
                  <ActivityItemSkeleton />
                  <ActivityItemSkeleton />
                </>
              ) : !urgentPrayers || urgentPrayers.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-10 w-10 text-vesper-300 mx-auto mb-3" />
                  <p className="text-sm text-vesper-600">No urgent prayer requests</p>
                  <p className="text-xs text-vesper-500 mt-1">
                    Check back later for prayer needs
                  </p>
                </div>
              ) : (
                urgentPrayers.slice(0, 3).map((prayer: PrayerRequest) => (
                  <div
                    key={prayer.id}
                    className="p-3 rounded-lg bg-grace-100 border border-grace-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-vesper-900">
                        {prayer.title}
                      </p>
                      {prayer.isUrgent && (
                        <Badge className="bg-sanctuary-100 text-sanctuary-700 border-sanctuary-200 text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-vesper-600 mt-1">
                      Requested by {prayer.isAnonymous ? "Anonymous" : prayer.submitterName || prayer.member?.firstName || "Unknown"}
                    </p>
                    <p className="text-xs text-vesper-500 mt-0.5">
                      {formatRelativeTime(prayer.createdAt)}
                    </p>
                  </div>
                ))
              )}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-sanctuary-200 text-sanctuary-700 hover:bg-sanctuary-50"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  View All Prayer Requests
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Donations */}
      <Card className="border-grace-300 bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-vesper-900 font-serif">
              Recent Giving
            </CardTitle>
            <CardDescription className="text-vesper-600">
              Thank you for your generous contributions
            </CardDescription>
          </div>
          <Link href={routes.donations.list}>
            <Button
              variant="ghost"
              size="sm"
              className="text-sanctuary-700 hover:text-sanctuary-800 hover:bg-sanctuary-50"
            >
              View All
              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoadingDonations ? (
              <>
                <DonationItemSkeleton />
                <DonationItemSkeleton />
                <DonationItemSkeleton />
                <DonationItemSkeleton />
              </>
            ) : recentDonations.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <DollarSign className="h-10 w-10 text-vesper-300 mx-auto mb-3" />
                <p className="text-sm text-vesper-600">No recent donations to display</p>
                <Link href={routes.donations.new}>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-sanctuary-700 mt-2"
                  >
                    Record a donation
                  </Button>
                </Link>
              </div>
            ) : (
              recentDonations.slice(0, 4).map((donation: Donation) => (
                <div
                  key={donation.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-grace-100 border border-grace-200"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sanctuary-600 to-sanctuary-800 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                    {getDonorInitials(donation)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-vesper-900 truncate">
                      {getDonorName(donation)}
                    </p>
                    <p className="text-xs text-vesper-600">
                      {donation.fund} &middot; {formatRelativeTime(donation.date)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-spirit-700">
                    {formatCurrency(donation.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
