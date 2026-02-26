import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Clock,
  Bell,
  RefreshCw,
  UserCheck,
  BarChart3,
  Heart,
} from "lucide-react";

export default function VolunteerScheduling() {
  const plannedFeatures = [
    {
      icon: Calendar,
      title: "Visual Scheduler",
      description: "Drag-and-drop volunteer scheduling with calendar views (day, week, month).",
    },
    {
      icon: UserCheck,
      title: "Role-Based Assignments",
      description: "Define ministry roles with required skills, training, and background checks.",
    },
    {
      icon: Clock,
      title: "Availability Calendar",
      description: "Volunteers set their availability. Auto-match open positions with available people.",
    },
    {
      icon: Bell,
      title: "Automatic Reminders",
      description: "SMS/email reminders before scheduled shifts. Confirmation requests and follow-ups.",
    },
    {
      icon: RefreshCw,
      title: "Shift Swapping",
      description: "Volunteers can request to swap shifts. Find and confirm replacements easily.",
    },
    {
      icon: BarChart3,
      title: "Coverage Reports",
      description: "Track coverage gaps, volunteer hours, and ministry team engagement.",
    },
  ];

  const sampleTeams = [
    { name: "Worship Team", members: 15, scheduled: 8, needed: 2 },
    { name: "Greeters", members: 20, scheduled: 12, needed: 0 },
    { name: "Children's Ministry", members: 25, scheduled: 18, needed: 4 },
    { name: "Tech/AV Team", members: 8, scheduled: 4, needed: 1 },
    { name: "Hospitality", members: 12, scheduled: 6, needed: 2 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="h-8 w-8 text-rose-500" />
            Volunteer Scheduling
          </h1>
          <p className="text-muted-foreground mt-1">
            Coordinate volunteers across all ministry teams
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Planned Features
          </CardTitle>
          <CardDescription>
            Comprehensive volunteer management and scheduling tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-rose-500/30 transition-colors"
              >
                <feature.icon className="h-8 w-8 text-rose-500 mb-3" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ministry Teams Preview</CardTitle>
          <CardDescription>This Sunday's volunteer coverage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleTeams.map((team, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{team.name}</div>
                  <Badge variant={team.needed === 0 ? "default" : "destructive"}>
                    {team.needed === 0 ? "Fully Staffed" : `Need ${team.needed} more`}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{team.members} total members</span>
                  <span>|</span>
                  <span>{team.scheduled} scheduled</span>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${team.needed === 0 ? "bg-green-500" : "bg-amber-500"}`}
                    style={{ width: `${(team.scheduled / (team.scheduled + team.needed)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-rose-500">--</div>
            <div className="text-sm text-muted-foreground">Active Volunteers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-amber-500">--</div>
            <div className="text-sm text-muted-foreground">Open Positions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-green-500">--%</div>
            <div className="text-sm text-muted-foreground">Coverage Rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
