import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Baby,
  QrCode,
  Shield,
  Printer,
  Bell,
  Users,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function ChildCheckin() {
  const plannedFeatures = [
    {
      icon: QrCode,
      title: "Secure Check-in Codes",
      description: "Generate unique pickup codes for each family. Parents scan to check in/out their children safely.",
    },
    {
      icon: Shield,
      title: "Guardian Verification",
      description: "Authorized pickup list with photo verification. Only approved adults can pick up children.",
    },
    {
      icon: AlertTriangle,
      title: "Allergy & Medical Alerts",
      description: "Prominent display of allergies, medications, and special needs for caregivers.",
    },
    {
      icon: Printer,
      title: "Printable Name Tags",
      description: "Custom name tags with matching parent/child codes, room assignments, and safety info.",
    },
    {
      icon: Bell,
      title: "Parent Paging",
      description: "Send instant notifications to parents if their child needs attention during service.",
    },
    {
      icon: Users,
      title: "Room Management",
      description: "Assign children to age-appropriate rooms, track capacity, and manage volunteers.",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Baby className="h-8 w-8 text-pink-500" />
            Child Check-in System
          </h1>
          <p className="text-muted-foreground mt-1">
            Secure, streamlined check-in for children's ministry
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Planned Features
          </CardTitle>
          <CardDescription>
            A complete child check-in solution prioritizing safety and ease of use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-pink-500/30 transition-colors"
              >
                <feature.icon className="h-8 w-8 text-pink-500 mb-3" />
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
            <CardTitle>Check-in Flow Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">1</div>
              <div>
                <div className="font-medium">Family Arrives</div>
                <div className="text-sm text-muted-foreground">Scan QR code or search by name</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">2</div>
              <div>
                <div className="font-medium">Verify & Assign</div>
                <div className="text-sm text-muted-foreground">Confirm children, review alerts, assign rooms</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">3</div>
              <div>
                <div className="font-medium">Print & Go</div>
                <div className="text-sm text-muted-foreground">Print matching tags for child and parent</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">4</div>
              <div>
                <div className="font-medium">Secure Pickup</div>
                <div className="text-sm text-muted-foreground">Match codes, verify identity, release child</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety First</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
                <AlertTriangle className="h-5 w-5" />
                Allergy Alerts
              </div>
              <p className="text-sm text-muted-foreground">
                Prominently display allergies and medical conditions on name tags and volunteer screens
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                <Shield className="h-5 w-5" />
                Authorized Pickup Only
              </div>
              <p className="text-sm text-muted-foreground">
                Maintain a list of approved guardians with photo ID verification
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                <CheckCircle2 className="h-5 w-5" />
                Background Checked Volunteers
              </div>
              <p className="text-sm text-muted-foreground">
                Integration with background check system for all children's ministry workers
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
