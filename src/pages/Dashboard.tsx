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
} from "lucide-react";
import { routes } from "@/routes";
import { useAuth } from "@/hooks/useAuth";
import { reportsApi, eventsApi, donationsApi, prayerApi } from "@/lib/api";
import type { DashboardStats, Event, Donation, PrayerRequest } from "@/types";

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

const quickActions = [
  {
    label: "Add Member",
    href: routes.members.new,
    icon: UserPlus,
    bgColor: "bg-burgundy-100",
    iconColor: "text-burgundy-700",
    hoverBg: "hover:bg-burgundy-200",
  },
  {
    label: "Record Donation",
    href: routes.donations.new,
    icon: PlusCircle,
    bgColor: "bg-sage-100",
    iconColor: "text-sage-700",
    hoverBg: "hover:bg-sage-200",
  },
  {
    label: "Schedule Event",
    href: routes.events,
    icon: CalendarPlus,
    bgColor: "bg-ivory-200",
    iconColor: "text-walnut-700",
    hoverBg: "hover:bg-ivory-300",
  },
];

const statConfig = [
  {
    icon: Users,
    color: "text-burgundy-700",
    bgColor: "bg-burgundy-100",
    label: "Total Members",
  },
  {
    icon: UserPlus,
    color: "text-sage-600",
    bgColor: "bg-sage-100",
    label: "New This Month",
  },
  {
    icon: Percent,
    color: "text-walnut-700",
    bgColor: "bg-ivory-200",
    label: "Attendance %",
  },
  {
    icon: DollarSign,
    color: "text-sage-700",
    bgColor: "bg-sage-100",
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
    <Card className="border-ivory-300 bg-ivory-50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24 bg-ivory-200" />
        <Skeleton className="h-10 w-10 rounded-xl bg-ivory-200" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2 bg-ivory-200" />
        <Skeleton className="h-4 w-32 bg-ivory-200" />
      </CardContent>
    </Card>
  );
}

function DonationItemSkeleton() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full bg-ivory-200" />
        <div>
          <Skeleton className="h-4 w-32 mb-1 bg-ivory-200" />
          <Skeleton className="h-3 w-24 bg-ivory-200" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 bg-ivory-200" />
    </div>
  );
}

function EventItemSkeleton() {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-ivory-200 last:border-0">
      <Skeleton className="h-14 w-14 rounded-xl bg-ivory-200" />
      <div className="flex-1">
        <Skeleton className="h-4 w-40 mb-2 bg-ivory-200" />
        <Skeleton className="h-3 w-32 mb-2 bg-ivory-200" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full bg-ivory-200" />
          <Skeleton className="h-5 w-20 bg-ivory-200" />
        </div>
      </div>
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3">
      <Skeleton className="h-8 w-8 rounded-full bg-ivory-200" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1 bg-ivory-200" />
        <Skeleton className="h-3 w-48 bg-ivory-200" />
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
      <div className="space-y-6 p-6 bg-ivory-50 min-h-screen">
        <Alert variant="destructive" className="border-burgundy-300 bg-burgundy-50">
          <AlertCircle className="h-4 w-4 text-burgundy-700" />
          <AlertTitle className="text-burgundy-900 font-serif">Error</AlertTitle>
          <AlertDescription className="text-burgundy-700">
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-ivory-50 min-h-screen">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-burgundy-800 via-burgundy-700 to-burgundy-900 p-8 text-white shadow-warm-lg">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-ivory-100/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-sage-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-ivory-200/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-ivory-200 text-sm font-medium">{getGreeting()}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 font-serif">{churchName}</h1>
          <p className="text-ivory-200 max-w-xl mb-4">
            {getFormattedDate()}
          </p>
          <p className="text-ivory-300/80 text-sm max-w-xl">
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
                className="border-ivory-300 bg-white hover:shadow-warm transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-walnut-600">
                    {config.label}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl ${config.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${config.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-walnut-900 font-serif">
                    --
                  </div>
                  <p className="text-xs text-walnut-500 mt-1">
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
                className="border-ivory-300 bg-white hover:shadow-warm transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-walnut-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl ${config.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${config.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-walnut-900 font-serif">
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {stat.changeType === "positive" ? (
                      <TrendingUp className="h-3.5 w-3.5 text-sage-600" />
                    ) : stat.changeType === "negative" ? (
                      <TrendingDown className="h-3.5 w-3.5 text-burgundy-600" />
                    ) : null}
                    <p className="text-xs text-walnut-600">
                      <span
                        className={
                          stat.changeType === "positive"
                            ? "text-sage-600 font-medium"
                            : stat.changeType === "neutral"
                            ? "text-walnut-500"
                            : "text-burgundy-600 font-medium"
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
      <Card className="border-ivory-300 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-walnut-900 font-serif">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-walnut-600">
            Common tasks at your fingertips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Button
                  variant="outline"
                  className={`${action.bgColor} ${action.hoverBg} border-ivory-300 text-walnut-800 gap-2`}
                >
                  <action.icon className={`h-4 w-4 ${action.iconColor}`} />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid - Three Column */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Events - Takes 1 column */}
        <Card className="border-ivory-300 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-walnut-900 font-serif">
                Upcoming Events
              </CardTitle>
              <CardDescription className="text-walnut-600">
                Next 3 events
              </CardDescription>
            </div>
            <Link href={routes.events}>
              <Button
                variant="ghost"
                size="sm"
                className="text-burgundy-700 hover:text-burgundy-800 hover:bg-burgundy-50"
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
                  <CalendarPlus className="h-10 w-10 text-walnut-300 mx-auto mb-3" />
                  <p className="text-sm text-walnut-600">No upcoming events</p>
                  <Link href={routes.events}>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-burgundy-700 mt-2"
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
                      className="flex items-start gap-3 py-3 border-b border-ivory-200 last:border-0"
                    >
                      <div className="flex flex-col items-center justify-center rounded-xl bg-burgundy-100 border border-burgundy-200 px-3 py-2 min-w-[56px]">
                        <span className="text-[10px] font-semibold text-burgundy-700 uppercase">
                          {day}
                        </span>
                        <span className="text-lg font-bold text-walnut-900">
                          {date}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-walnut-900 truncate">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-walnut-600 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatEventTime(event.startDate)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-walnut-600 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                        <div className="mt-2">
                          <Badge
                            className={
                              event.status === "published"
                                ? "bg-sage-100 text-sage-700 border-sage-200 hover:bg-sage-100"
                                : "bg-ivory-200 text-walnut-700 border-ivory-300 hover:bg-ivory-200"
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
        <Card className="border-ivory-300 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-walnut-900 font-serif">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-walnut-600">
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
                  <DollarSign className="h-10 w-10 text-walnut-300 mx-auto mb-3" />
                  <p className="text-sm text-walnut-600">No recent donations</p>
                  <Link href={routes.donations.new}>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-burgundy-700 mt-2"
                    >
                      Record a donation
                    </Button>
                  </Link>
                </div>
              ) : (
                recentDonations.slice(0, 4).map((donation: Donation) => (
                  <div
                    key={donation.id}
                    className="flex items-start gap-3 py-3 border-b border-ivory-200 last:border-0"
                  >
                    <div className="p-2 rounded-full bg-sage-100">
                      <DollarSign className="h-4 w-4 text-sage-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-walnut-900">
                        {getDonorName(donation)}
                      </p>
                      <p className="text-xs text-walnut-600 truncate">
                        {donation.fund} - {formatCurrency(donation.amount)}
                      </p>
                      <p className="text-xs text-walnut-500 mt-1">
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
        <Card className="border-ivory-300 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-walnut-900 font-serif flex items-center gap-2">
                <HandHeart className="h-5 w-5 text-burgundy-700" />
                Prayer Requests
              </CardTitle>
              <CardDescription className="text-walnut-600">
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
                  <Heart className="h-10 w-10 text-walnut-300 mx-auto mb-3" />
                  <p className="text-sm text-walnut-600">No urgent prayer requests</p>
                  <p className="text-xs text-walnut-500 mt-1">
                    Check back later for prayer needs
                  </p>
                </div>
              ) : (
                urgentPrayers.slice(0, 3).map((prayer: PrayerRequest) => (
                  <div
                    key={prayer.id}
                    className="p-3 rounded-lg bg-ivory-100 border border-ivory-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-walnut-900">
                        {prayer.title}
                      </p>
                      {prayer.isUrgent && (
                        <Badge className="bg-burgundy-100 text-burgundy-700 border-burgundy-200 text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-walnut-600 mt-1">
                      Requested by {prayer.isAnonymous ? "Anonymous" : prayer.submitterName || prayer.member?.firstName || "Unknown"}
                    </p>
                    <p className="text-xs text-walnut-500 mt-0.5">
                      {formatRelativeTime(prayer.createdAt)}
                    </p>
                  </div>
                ))
              )}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-burgundy-200 text-burgundy-700 hover:bg-burgundy-50"
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
      <Card className="border-ivory-300 bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-walnut-900 font-serif">
              Recent Giving
            </CardTitle>
            <CardDescription className="text-walnut-600">
              Thank you for your generous contributions
            </CardDescription>
          </div>
          <Link href={routes.donations.list}>
            <Button
              variant="ghost"
              size="sm"
              className="text-burgundy-700 hover:text-burgundy-800 hover:bg-burgundy-50"
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
                <DollarSign className="h-10 w-10 text-walnut-300 mx-auto mb-3" />
                <p className="text-sm text-walnut-600">No recent donations to display</p>
                <Link href={routes.donations.new}>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-burgundy-700 mt-2"
                  >
                    Record a donation
                  </Button>
                </Link>
              </div>
            ) : (
              recentDonations.slice(0, 4).map((donation: Donation) => (
                <div
                  key={donation.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-ivory-100 border border-ivory-200"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-burgundy-600 to-burgundy-800 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                    {getDonorInitials(donation)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-walnut-900 truncate">
                      {getDonorName(donation)}
                    </p>
                    <p className="text-xs text-walnut-600">
                      {donation.fund} &middot; {formatRelativeTime(donation.date)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-sage-700">
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
