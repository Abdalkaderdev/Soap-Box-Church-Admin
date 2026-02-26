import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  BarChart3,
  Settings,
  Users,
  Share2,
  Calendar,
  Globe,
} from "lucide-react";

export default function MultiCampus() {
  const plannedFeatures = [
    {
      icon: Building2,
      title: "Campus Management",
      description: "Create and manage multiple campus locations with unique settings and information.",
    },
    {
      icon: BarChart3,
      title: "Centralized Reporting",
      description: "Unified dashboards and reports across all campuses with drill-down capabilities.",
    },
    {
      icon: Settings,
      title: "Campus-specific Settings",
      description: "Customize service times, staff, and configurations for each campus location.",
    },
    {
      icon: Users,
      title: "Staff Assignments",
      description: "Assign staff members to specific campuses with role-based permissions.",
    },
    {
      icon: Share2,
      title: "Resource Sharing",
      description: "Share volunteers, equipment, and materials across campus locations.",
    },
    {
      icon: Calendar,
      title: "Cross-campus Events",
      description: "Coordinate events that span multiple campuses with unified registration.",
    },
  ];

  const campusStats = [
    { stat: "Campuses", count: "--", color: "text-blue-500" },
    { stat: "Total Members", count: "--", color: "text-green-500" },
    { stat: "Staff Across All", count: "--", color: "text-purple-500" },
    { stat: "Weekly Services", count: "--", color: "text-amber-500" },
    { stat: "Shared Resources", count: "--", color: "text-red-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-500" />
            Multi-Campus Support
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage multiple church locations from one platform
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Planned Features
          </CardTitle>
          <CardDescription>
            Unified management for churches with multiple locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-blue-500/30 transition-colors"
              >
                <feature.icon className="h-8 w-8 text-blue-500 mb-3" />
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
            <CardTitle>Campus Overview</CardTitle>
            <CardDescription>Statistics across all locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campusStats.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <span className="font-medium">{item.stat}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Benefits</CardTitle>
            <CardDescription>Why multi-campus management matters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                <Globe className="h-5 w-5" />
                Centralized Control
              </div>
              <p className="text-sm text-muted-foreground">
                Manage all campuses from a single dashboard with unified reporting
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                <MapPin className="h-5 w-5" />
                Location Flexibility
              </div>
              <p className="text-sm text-muted-foreground">
                Each campus maintains its unique identity while sharing resources
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-600 font-medium mb-2">
                <Users className="h-5 w-5" />
                Seamless Collaboration
              </div>
              <p className="text-sm text-muted-foreground">
                Staff and volunteers can serve across multiple locations easily
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
              <Building2 className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Active Campuses</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Total Attendance</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Events This Month</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Share2 className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Shared Resources</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
