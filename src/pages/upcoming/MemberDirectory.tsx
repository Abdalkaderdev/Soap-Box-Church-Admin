import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookUser,
  Search,
  Shield,
  Camera,
  Users,
  Mail,
  Download,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

export default function MemberDirectory() {
  const plannedFeatures = [
    {
      icon: Search,
      title: "Searchable Directory",
      description: "Quickly find members by name, email, phone, or custom fields with advanced search.",
    },
    {
      icon: Shield,
      title: "Privacy Controls",
      description: "Member-controlled visibility settings. Each member decides what info to share.",
    },
    {
      icon: Camera,
      title: "Photo Directory",
      description: "Visual directory with member photos for easy identification and connection.",
    },
    {
      icon: Users,
      title: "Family Groupings",
      description: "View members organized by family units with household relationships.",
    },
    {
      icon: Mail,
      title: "Contact Preferences",
      description: "Respect member communication preferences for calls, texts, and emails.",
    },
    {
      icon: Download,
      title: "Export Options",
      description: "Export filtered directories for print, PDF, or integration with other tools.",
    },
  ];

  const privacyLevels = [
    { level: "Public", count: "--", color: "text-green-500", icon: Eye },
    { level: "Members Only", count: "--", color: "text-blue-500", icon: Users },
    { level: "Staff Only", count: "--", color: "text-amber-500", icon: Lock },
    { level: "Hidden", count: "--", color: "text-red-500", icon: EyeOff },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookUser className="h-8 w-8 text-blue-500" />
            Member Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            Searchable directory with member-controlled privacy settings
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookUser className="h-5 w-5" />
            Planned Features
          </CardTitle>
          <CardDescription>
            A modern directory that puts privacy in the hands of your members
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
            <CardTitle>Privacy Levels</CardTitle>
            <CardDescription>Member visibility settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {privacyLevels.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <span className="font-medium">{item.level}</span>
                  </div>
                  <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy-First Design</CardTitle>
            <CardDescription>Empowering members with control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                <Shield className="h-5 w-5" />
                Member-Controlled
              </div>
              <p className="text-sm text-muted-foreground">
                Each member chooses exactly what information is visible and to whom
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                <Eye className="h-5 w-5" />
                Granular Settings
              </div>
              <p className="text-sm text-muted-foreground">
                Control visibility of phone, email, address, and photo separately
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-600 font-medium mb-2">
                <Lock className="h-5 w-5" />
                Secure by Default
              </div>
              <p className="text-sm text-muted-foreground">
                New members start with private settings until they choose otherwise
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
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Total Members</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Camera className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">With Photos</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Public Profiles</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Family Units</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
