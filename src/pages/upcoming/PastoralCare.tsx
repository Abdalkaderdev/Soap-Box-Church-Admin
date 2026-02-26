import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HeartHandshake,
  Calendar,
  Lock,
  Users,
  Bell,
  FileText,
  Stethoscope,
  Home,
} from "lucide-react";

export default function PastoralCare() {
  const plannedFeatures = [
    {
      icon: Calendar,
      title: "Counseling Sessions",
      description: "Schedule and track pastoral counseling appointments with private notes.",
    },
    {
      icon: Stethoscope,
      title: "Hospital Visits",
      description: "Log hospital and home visits. Track patient status and follow-up needs.",
    },
    {
      icon: Bell,
      title: "Care Requests",
      description: "Members can submit care requests. Staff can triage and assign visits.",
    },
    {
      icon: Users,
      title: "Staff Assignment",
      description: "Assign care cases to pastoral staff or trained lay ministers.",
    },
    {
      icon: Lock,
      title: "Confidential Notes",
      description: "Secure, encrypted notes for sensitive pastoral conversations.",
    },
    {
      icon: FileText,
      title: "Care History",
      description: "Complete history of pastoral care interactions for continuity.",
    },
  ];

  const careTypes = [
    { type: "Hospital Visit", count: "--", color: "text-red-500" },
    { type: "Counseling", count: "--", color: "text-blue-500" },
    { type: "Home Visit", count: "--", color: "text-green-500" },
    { type: "Grief Support", count: "--", color: "text-purple-500" },
    { type: "Crisis Care", count: "--", color: "text-amber-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <HeartHandshake className="h-8 w-8 text-purple-500" />
            Pastoral Care
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and coordinate care for your congregation
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5" />
            Planned Features
          </CardTitle>
          <CardDescription>
            Compassionate care tracking with confidentiality built in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-purple-500/30 transition-colors"
              >
                <feature.icon className="h-8 w-8 text-purple-500 mb-3" />
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
            <CardTitle>Care Types</CardTitle>
            <CardDescription>Categories of pastoral care</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {careTypes.map((item, index) => (
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
            <CardTitle>Privacy & Security</CardTitle>
            <CardDescription>Protecting sensitive information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-600 font-medium mb-2">
                <Lock className="h-5 w-5" />
                End-to-End Encryption
              </div>
              <p className="text-sm text-muted-foreground">
                All pastoral notes are encrypted and only accessible by authorized staff
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                <Users className="h-5 w-5" />
                Role-Based Access
              </div>
              <p className="text-sm text-muted-foreground">
                Define who can view different types of care records
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                <FileText className="h-5 w-5" />
                Audit Trail
              </div>
              <p className="text-sm text-muted-foreground">
                Complete history of who accessed what records and when
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
              <Home className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Visits This Month</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Active Cases</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Bell className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Pending Requests</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Scheduled Follow-ups</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
