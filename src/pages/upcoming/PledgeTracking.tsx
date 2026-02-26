import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  FolderKanban,
  FileEdit,
  TrendingUp,
  Bell,
  FileBarChart,
  CalendarClock,
  DollarSign,
  Users,
  CheckCircle2,
} from "lucide-react";

export default function PledgeTracking() {
  const plannedFeatures = [
    {
      icon: FolderKanban,
      title: "Campaign Management",
      description: "Create and manage fundraising campaigns with goals, timelines, and progress tracking.",
    },
    {
      icon: FileEdit,
      title: "Pledge Recording",
      description: "Record member pledges with flexible payment schedules and commitment details.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Real-time dashboards showing campaign progress and individual pledge fulfillment.",
    },
    {
      icon: Bell,
      title: "Automated Reminders",
      description: "Send gentle reminders to members about upcoming pledge payments.",
    },
    {
      icon: FileBarChart,
      title: "Fulfillment Reports",
      description: "Detailed reports on pledge completion rates, outstanding balances, and trends.",
    },
    {
      icon: CalendarClock,
      title: "Multi-year Pledges",
      description: "Support for capital campaigns and long-term commitments spanning multiple years.",
    },
  ];

  const campaignTypes = [
    { type: "Building Fund", count: "--", color: "text-blue-500" },
    { type: "Annual Stewardship", count: "--", color: "text-green-500" },
    { type: "Mission Support", count: "--", color: "text-purple-500" },
    { type: "Special Projects", count: "--", color: "text-amber-500" },
    { type: "Debt Reduction", count: "--", color: "text-red-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-emerald-500" />
            Pledge & Commitment Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage pledges and track campaign progress
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Planned Features
          </CardTitle>
          <CardDescription>
            Comprehensive pledge management for your stewardship campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-emerald-500/30 transition-colors"
              >
                <feature.icon className="h-8 w-8 text-emerald-500 mb-3" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Types</CardTitle>
            <CardDescription>Categories of pledge campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaignTypes.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <span className="font-medium">{item.type}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracking Capabilities</CardTitle>
            <CardDescription>What you'll be able to track</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-600 font-medium mb-2">
                <DollarSign className="h-5 w-5" />
                Payment Schedules
              </div>
              <p className="text-sm text-muted-foreground">
                Weekly, monthly, quarterly, or custom payment frequencies
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                <Users className="h-5 w-5" />
                Family Pledges
              </div>
              <p className="text-sm text-muted-foreground">
                Track pledges at family or individual level with combined totals
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                <CheckCircle2 className="h-5 w-5" />
                Fulfillment Status
              </div>
              <p className="text-sm text-muted-foreground">
                Monitor on-track, behind, and completed pledges at a glance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <FolderKanban className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Active Campaigns</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <FileEdit className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Total Pledges</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Pledged Amount</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Fulfillment Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
