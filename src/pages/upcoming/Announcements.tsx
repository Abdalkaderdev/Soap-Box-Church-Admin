import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  Calendar,
  Send,
  Users,
  Image,
  BarChart3,
  CheckCircle,
  Mail,
  MessageSquare,
  Smartphone,
} from "lucide-react";

export default function Announcements() {
  const plannedFeatures = [
    {
      icon: Calendar,
      title: "Announcement Scheduling",
      description: "Schedule announcements in advance. Set publish dates and auto-expire content.",
    },
    {
      icon: Send,
      title: "Multi-channel Publishing",
      description: "Publish to app, email, and SMS simultaneously from one place.",
    },
    {
      icon: Users,
      title: "Audience Targeting",
      description: "Target specific groups, ministries, or demographics with relevant messages.",
    },
    {
      icon: Image,
      title: "Rich Media Support",
      description: "Add images, videos, and attachments to make announcements engaging.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Engagement",
      description: "Track open rates, clicks, and engagement metrics for each announcement.",
    },
    {
      icon: CheckCircle,
      title: "Approval Workflow",
      description: "Route announcements through approvers before publishing to ensure quality.",
    },
  ];

  const channels = [
    { channel: "Mobile App", count: "--", color: "text-blue-500", icon: Smartphone },
    { channel: "Email", count: "--", color: "text-green-500", icon: Mail },
    { channel: "SMS", count: "--", color: "text-purple-500", icon: MessageSquare },
    { channel: "Website", count: "--", color: "text-amber-500", icon: Megaphone },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-orange-500" />
            Announcements
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage church-wide announcements and news
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Planned Features
          </CardTitle>
          <CardDescription>
            Powerful announcement tools to keep your congregation informed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-orange-500/30 transition-colors"
              >
                <feature.icon className="h-8 w-8 text-orange-500 mb-3" />
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
            <CardTitle>Publishing Channels</CardTitle>
            <CardDescription>Reach your congregation everywhere</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {channels.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <span className="font-medium">{item.channel}</span>
                  </div>
                  <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Smart Features</CardTitle>
            <CardDescription>Enhance your communications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 text-orange-600 font-medium mb-2">
                <Calendar className="h-5 w-5" />
                Scheduled Publishing
              </div>
              <p className="text-sm text-muted-foreground">
                Write now, publish later. Perfect for weekend announcements
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                <Users className="h-5 w-5" />
                Audience Segmentation
              </div>
              <p className="text-sm text-muted-foreground">
                Send targeted messages to specific groups or ministries
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                <BarChart3 className="h-5 w-5" />
                Engagement Tracking
              </div>
              <p className="text-sm text-muted-foreground">
                See who opened, clicked, and engaged with your announcements
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
              <Megaphone className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Active Announcements</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Scheduled</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Send className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Sent This Month</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">--%</div>
              <div className="text-xs text-muted-foreground">Avg. Open Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
