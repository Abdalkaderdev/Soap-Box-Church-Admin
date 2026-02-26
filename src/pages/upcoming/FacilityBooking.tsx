import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Projector,
  Users,
} from "lucide-react";

export default function FacilityBooking() {
  const plannedFeatures = [
    {
      icon: Calendar,
      title: "Interactive Calendar",
      description: "Visual calendar view showing all room bookings. Drag-and-drop to schedule events.",
    },
    {
      icon: Clock,
      title: "Availability Checking",
      description: "Real-time availability for all facilities. Instant conflict detection and resolution.",
    },
    {
      icon: CheckCircle2,
      title: "Approval Workflow",
      description: "Submit booking requests for review. Admins can approve, deny, or request changes.",
    },
    {
      icon: Projector,
      title: "Resource Management",
      description: "Book equipment along with rooms: projectors, sound systems, tables, chairs, and more.",
    },
    {
      icon: AlertCircle,
      title: "Conflict Detection",
      description: "Automatic alerts for double-bookings, setup time overlaps, and resource conflicts.",
    },
    {
      icon: Users,
      title: "Capacity Planning",
      description: "Room capacity limits, setup configurations, and attendance tracking.",
    },
  ];

  const sampleRooms = [
    { name: "Main Sanctuary", capacity: 500, status: "available" },
    { name: "Fellowship Hall", capacity: 200, status: "booked" },
    { name: "Youth Room", capacity: 50, status: "available" },
    { name: "Conference Room A", capacity: 20, status: "pending" },
    { name: "Kitchen", capacity: 15, status: "available" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building className="h-8 w-8 text-indigo-500" />
            Facility Booking
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage room reservations and equipment scheduling
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planned Features
          </CardTitle>
          <CardDescription>
            Complete facility management for churches of all sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-indigo-500/30 transition-colors"
              >
                <feature.icon className="h-8 w-8 text-indigo-500 mb-3" />
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
            <CardTitle>Facilities Preview</CardTitle>
            <CardDescription>Sample room list structure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sampleRooms.map((room, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <div className="font-medium">{room.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Capacity: {room.capacity}
                    </div>
                  </div>
                  <Badge
                    variant={
                      room.status === "available"
                        ? "default"
                        : room.status === "booked"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {room.status === "available" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {room.status === "booked" && <XCircle className="h-3 w-3 mr-1" />}
                    {room.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                    {room.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment Available</CardTitle>
            <CardDescription>Resources that can be reserved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Projector className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
                <div className="text-sm font-medium">Projectors</div>
                <div className="text-xs text-muted-foreground">5 available</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="h-6 w-6 mx-auto mb-2 text-indigo-500 font-bold">PA</div>
                <div className="text-sm font-medium">Sound Systems</div>
                <div className="text-xs text-muted-foreground">3 available</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="h-6 w-6 mx-auto mb-2 text-2xl">🪑</div>
                <div className="text-sm font-medium">Extra Chairs</div>
                <div className="text-xs text-muted-foreground">100 available</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="h-6 w-6 mx-auto mb-2 text-2xl">🎤</div>
                <div className="text-sm font-medium">Microphones</div>
                <div className="text-xs text-muted-foreground">10 available</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
