import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Video,
  BookOpen,
  Award,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function OnlineClasses() {
  const plannedFeatures = [
    {
      icon: Video,
      title: "Video Courses",
      description: "Upload and organize video lessons with chapters, descriptions, and resources.",
    },
    {
      icon: Users,
      title: "Enrollment Tracking",
      description: "Track who's enrolled in each class, when they started, and their progress.",
    },
    {
      icon: TrendingUp,
      title: "Progress Monitoring",
      description: "Visual progress bars, completion percentages, and milestone achievements.",
    },
    {
      icon: Award,
      title: "Certificates",
      description: "Auto-generate and issue certificates upon course completion.",
    },
    {
      icon: BookOpen,
      title: "Discipleship Paths",
      description: "Create learning tracks that guide members through spiritual growth journeys.",
    },
    {
      icon: Calendar,
      title: "Scheduled Classes",
      description: "Set up cohort-based classes with start dates, deadlines, and live sessions.",
    },
  ];

  const sampleCourses = [
    { name: "New Believers Foundations", enrolled: 45, completed: 28, lessons: 8 },
    { name: "Bible Study Methods", enrolled: 32, completed: 15, lessons: 6 },
    { name: "Marriage Enrichment", enrolled: 24, completed: 8, lessons: 10 },
    { name: "Spiritual Gifts Discovery", enrolled: 56, completed: 41, lessons: 4 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-blue-500" />
            Online Classes
          </h1>
          <p className="text-muted-foreground mt-1">
            Digital discipleship and education platform
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Planned Features
          </CardTitle>
          <CardDescription>
            A complete learning management system for your church
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

      <Card>
        <CardHeader>
          <CardTitle>Course Catalog Preview</CardTitle>
          <CardDescription>Sample course list structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleCourses.map((course, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{course.name}</div>
                  <Badge variant="outline">{course.lessons} lessons</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.enrolled} enrolled
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {course.completed} completed
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(course.completed / course.enrolled) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {Math.round((course.completed / course.enrolled) * 100)}% completion rate
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-500">--</div>
            <div className="text-sm text-muted-foreground">Total Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-cyan-500">---</div>
            <div className="text-sm text-muted-foreground">Active Learners</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-500">---</div>
            <div className="text-sm text-muted-foreground">Completions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-amber-500">---</div>
            <div className="text-sm text-muted-foreground">Certificates Issued</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
