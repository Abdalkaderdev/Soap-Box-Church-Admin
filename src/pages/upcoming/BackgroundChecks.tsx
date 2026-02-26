import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  UserCheck,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

export default function BackgroundChecks() {
  const plannedFeatures = [
    {
      icon: ShieldCheck,
      title: "Checkr/Sterling Integration",
      description: "Direct integration with leading background check providers for seamless screening.",
    },
    {
      icon: Send,
      title: "Automated Screening Requests",
      description: "Send background check requests directly to volunteers and staff from the system.",
    },
    {
      icon: Clock,
      title: "Status Tracking Dashboard",
      description: "Real-time status updates on all pending and completed background checks.",
    },
    {
      icon: AlertTriangle,
      title: "Expiration Alerts",
      description: "Automatic notifications when background checks are approaching expiration.",
    },
    {
      icon: FileText,
      title: "Compliance Reports",
      description: "Generate reports for audits and compliance verification requirements.",
    },
    {
      icon: Users,
      title: "Role-based Requirements",
      description: "Configure which roles and ministries require background checks.",
    },
  ];

  const checkStatuses = [
    { status: "Pending", count: "--", color: "text-amber-500" },
    { status: "In Progress", count: "--", color: "text-blue-500" },
    { status: "Completed", count: "--", color: "text-green-500" },
    { status: "Expiring Soon", count: "--", color: "text-orange-500" },
    { status: "Action Required", count: "--", color: "text-red-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-500" />
            Background Checks
          </h1>
          <p className="text-muted-foreground mt-1">
            Streamline volunteer and staff screening for child safety compliance
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Planned Features
          </CardTitle>
          <CardDescription>
            Comprehensive background check management for your ministry
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
            <CardTitle>Check Status Overview</CardTitle>
            <CardDescription>Current background check statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checkStatuses.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <span className="font-medium">{item.status}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance & Safety</CardTitle>
            <CardDescription>Protecting your congregation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-600 font-medium mb-2">
                <CheckCircle2 className="h-5 w-5" />
                Automated Reminders
              </div>
              <p className="text-sm text-muted-foreground">
                Never miss a renewal with automated expiration alerts and reminders
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                <RefreshCw className="h-5 w-5" />
                Recurring Checks
              </div>
              <p className="text-sm text-muted-foreground">
                Set up recurring background checks based on your church policies
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-600 font-medium mb-2">
                <FileText className="h-5 w-5" />
                Audit Ready
              </div>
              <p className="text-sm text-muted-foreground">
                Maintain complete records for insurance and compliance audits
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
              <UserCheck className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Total Cleared</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Clock className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Pending Review</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Expiring Soon</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <XCircle className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Needs Attention</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
