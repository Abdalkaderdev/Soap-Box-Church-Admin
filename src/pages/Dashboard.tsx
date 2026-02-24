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
import { routes } from "@/routes";

// Placeholder data
const churchName = "Grace Community Church";

type ChangeType = "positive" | "negative" | "neutral";

const stats: Array<{
  title: string;
  value: string;
  change: string;
  changeType: ChangeType;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    title: "Total Members",
    value: "1,247",
    change: "+12%",
    changeType: "positive" as const,
    description: "from last month",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "This Month's Giving",
    value: "$42,850",
    change: "+8.2%",
    changeType: "positive" as const,
    description: "from last month",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Upcoming Events",
    value: "8",
    change: "3 this week",
    changeType: "neutral" as const,
    description: "scheduled",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    title: "Active Volunteers",
    value: "89",
    change: "+5",
    changeType: "positive" as const,
    description: "from last month",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
];

const recentDonations = [
  {
    id: 1,
    donor: "John & Sarah Mitchell",
    amount: "$500.00",
    date: "Today",
    type: "Tithe",
    avatar: "JM",
  },
  {
    id: 2,
    donor: "Michael Thompson",
    amount: "$250.00",
    date: "Today",
    type: "Building Fund",
    avatar: "MT",
  },
  {
    id: 3,
    donor: "Anonymous",
    amount: "$1,000.00",
    date: "Yesterday",
    type: "Missions",
    avatar: "AN",
  },
  {
    id: 4,
    donor: "Grace Family",
    amount: "$150.00",
    date: "Yesterday",
    type: "Tithe",
    avatar: "GF",
  },
  {
    id: 5,
    donor: "Robert Chen",
    amount: "$75.00",
    date: "2 days ago",
    type: "Youth Ministry",
    avatar: "RC",
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Sunday Worship Service",
    date: "Feb 25, 2026",
    time: "10:00 AM",
    location: "Main Sanctuary",
    attendees: 450,
    status: "confirmed" as const,
  },
  {
    id: 2,
    title: "Youth Group Meeting",
    date: "Feb 26, 2026",
    time: "6:30 PM",
    location: "Youth Center",
    attendees: 45,
    status: "confirmed" as const,
  },
  {
    id: 3,
    title: "Women's Bible Study",
    date: "Feb 27, 2026",
    time: "9:00 AM",
    location: "Fellowship Hall",
    attendees: 32,
    status: "confirmed" as const,
  },
  {
    id: 4,
    title: "Community Outreach",
    date: "Feb 28, 2026",
    time: "2:00 PM",
    location: "Community Center",
    attendees: 25,
    status: "pending" as const,
  },
];

const quickActions = [
  {
    label: "Add Member",
    href: routes.members.new,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" x2="19" y1="8" y2="14" />
        <line x1="22" x2="16" y1="11" y2="11" />
      </svg>
    ),
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    label: "Record Donation",
    href: routes.donations.new,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="16" />
        <line x1="8" x2="16" y1="12" y2="12" />
      </svg>
    ),
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    label: "Create Event",
    href: routes.events,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <line x1="12" x2="12" y1="14" y2="18" />
        <line x1="10" x2="14" y1="16" y2="16" />
      </svg>
    ),
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    label: "Send Message",
    href: routes.communications,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
    ),
    color: "bg-orange-500 hover:bg-orange-600",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Welcome to {churchName}</h1>
          <p className="mt-2 text-primary-foreground/80 max-w-xl">
            Manage your congregation, track donations, organize events, and stay
            connected with your church community all in one place.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              Sunday Service: 10:00 AM
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              Next Event: Youth Group (Wed)
            </Badge>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
          <svg
            viewBox="0 0 200 200"
            className="h-full w-full"
            fill="currentColor"
          >
            <path d="M100 0L120 60H180L130 100L150 160L100 120L50 160L70 100L20 60H80L100 0Z" />
          </svg>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Button
              variant="outline"
              className={`w-full h-auto flex-col gap-2 py-4 ${action.color} text-white border-0`}
            >
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span
                  className={
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "neutral"
                      ? "text-muted-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {stat.change}
                </span>{" "}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Donations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Donations</CardTitle>
              <CardDescription>Latest contributions received</CardDescription>
            </div>
            <Link href={routes.donations.list}>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {donation.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{donation.donor}</p>
                      <p className="text-xs text-muted-foreground">
                        {donation.type} - {donation.date}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {donation.amount}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <CardDescription>Events scheduled this week</CardDescription>
            </div>
            <Link href={routes.events}>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center justify-center rounded-lg bg-muted px-3 py-2 min-w-[60px]">
                      <span className="text-xs font-medium text-muted-foreground">
                        {event.date.split(" ")[0]}
                      </span>
                      <span className="text-lg font-bold">
                        {event.date.split(" ")[1].replace(",", "")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.time} - {event.location}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant={
                            event.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {event.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {event.attendees} expected
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-green-600"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <p className="font-medium">All Systems Operational</p>
                <p className="text-sm text-muted-foreground">
                  Last sync: 2 minutes ago
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-muted-foreground">Database</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-muted-foreground">Email Service</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-muted-foreground">Payment Gateway</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
