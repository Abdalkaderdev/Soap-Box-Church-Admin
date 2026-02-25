import React from "react";
import { Link } from "wouter";
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
  Calendar,
  Heart,
  UserPlus,
  PlusCircle,
  CalendarPlus,
  Send,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2
} from "lucide-react";
import { routes } from "@/routes";
import { useDashboard } from "@/hooks/useDashboard";

// Placeholder data
const churchName = "Grace Community Church";

type ChangeType = "positive" | "negative" | "neutral";

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  changeType: ChangeType;
  description: string;
  icon: React.ReactNode;
}

interface RecentDonation {
  id: number;
  donor: string;
  amount: string;
  date: string;
  type: string;
  avatar: string;
}

interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  status: "confirmed" | "pending";
}

const quickActions = [
  {
    label: "Add Member",
    href: routes.members.new,
    icon: UserPlus,
    color: "bg-blue-500 hover:bg-blue-600",
    iconBg: "bg-blue-600/20",
  },
  {
    label: "Record Donation",
    href: routes.donations.new,
    icon: PlusCircle,
    color: "bg-emerald-500 hover:bg-emerald-600",
    iconBg: "bg-emerald-600/20",
  },
  {
    label: "Create Event",
    href: routes.events,
    icon: CalendarPlus,
    color: "bg-violet-500 hover:bg-violet-600",
    iconBg: "bg-violet-600/20",
  },
  {
    label: "Send Message",
    href: routes.communications,
    icon: Send,
    color: "bg-amber-500 hover:bg-amber-600",
    iconBg: "bg-amber-600/20",
  },
];

const statConfig = [
  { icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { icon: DollarSign, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  { icon: Calendar, color: "text-violet-500", bgColor: "bg-violet-500/10" },
  { icon: Heart, color: "text-rose-500", bgColor: "bg-rose-500/10" },
];

function StatCardSkeleton() {
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}

function DonationItemSkeleton() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

function EventItemSkeleton() {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <Skeleton className="h-14 w-14 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-4 w-40 mb-2" />
        <Skeleton className="h-3 w-32 mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, error } = useDashboard();

  const stats: DashboardStat[] = data?.stats ?? [];
  const recentDonations: RecentDonation[] = data?.recentDonations ?? [];
  const upcomingEvents: UpcomingEvent[] = data?.upcomingEvents ?? [];
  const systemStatus = data?.systemStatus ?? {
    operational: true,
    lastSync: "2 minutes ago",
    services: {
      database: true,
      email: true,
      payments: true,
    },
  };

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-8 text-white">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400 text-sm font-medium">Welcome back</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{churchName}</h1>
          <p className="text-slate-400 max-w-xl mb-6">
            Manage your congregation, track donations, organize events, and stay
            connected with your church community.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-white/10 text-white border-0 hover:bg-white/20 px-3 py-1">
              <Calendar className="h-3 w-3 mr-1.5" />
              Sunday Service: 10:00 AM
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-300 border-0 hover:bg-amber-500/30 px-3 py-1">
              <Users className="h-3 w-3 mr-1.5" />
              Next Event: Youth Group (Wed)
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group">
              <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-xl ${action.iconBg}`}>
                  <action.icon className={`h-5 w-5 ${action.color.includes('blue') ? 'text-blue-500' : action.color.includes('emerald') ? 'text-emerald-500' : action.color.includes('violet') ? 'text-violet-500' : 'text-amber-500'}`} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats.length === 0 ? (
          <Card className="col-span-full border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 text-center text-muted-foreground">
              No statistics available.
            </CardContent>
          </Card>
        ) : (
          stats.map((stat, index) => {
            const config = statConfig[index] || statConfig[0];
            const IconComponent = config.icon;
            return (
              <Card key={stat.title} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl ${config.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${config.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {stat.changeType === "positive" ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    ) : stat.changeType === "negative" ? (
                      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      <span
                        className={
                          stat.changeType === "positive"
                            ? "text-emerald-600 font-medium"
                            : stat.changeType === "neutral"
                            ? "text-muted-foreground"
                            : "text-red-600 font-medium"
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

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Donations */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Donations</CardTitle>
              <CardDescription>Latest contributions received</CardDescription>
            </div>
            <Link href={routes.donations.list}>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950">
                View All
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <>
                  <DonationItemSkeleton />
                  <DonationItemSkeleton />
                  <DonationItemSkeleton />
                  <DonationItemSkeleton />
                  <DonationItemSkeleton />
                </>
              ) : recentDonations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No recent donations.
                </p>
              ) : (
                recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                        {donation.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{donation.donor}</p>
                        <p className="text-xs text-muted-foreground">
                          {donation.type} &middot; {donation.date}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">
                      {donation.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
              <CardDescription>Events scheduled this week</CardDescription>
            </div>
            <Link href={routes.events}>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950">
                View All
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {isLoading ? (
                <>
                  <EventItemSkeleton />
                  <EventItemSkeleton />
                  <EventItemSkeleton />
                  <EventItemSkeleton />
                </>
              ) : upcomingEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No upcoming events.
                </p>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-200 dark:border-violet-800 px-3 py-2 min-w-[60px]">
                      <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase">
                        {event.date.split(" ")[0]}
                      </span>
                      <span className="text-xl font-bold text-slate-900 dark:text-white">
                        {event.date.split(" ")[1].replace(",", "")}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.time} &middot; {event.location}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge
                          variant={
                            event.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                          className={event.status === "confirmed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100" : ""}
                        >
                          {event.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {event.attendees} expected
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Footer */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="py-4">
          {isLoading ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${systemStatus.operational ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'} flex items-center justify-center`}>
                  {systemStatus.operational ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {systemStatus.operational ? 'All Systems Operational' : 'System Issues Detected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last sync: {systemStatus.lastSync}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${systemStatus.services.database ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span className="text-muted-foreground">Database</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${systemStatus.services.email ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span className="text-muted-foreground">Email Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${systemStatus.services.payments ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span className="text-muted-foreground">Payment Gateway</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
