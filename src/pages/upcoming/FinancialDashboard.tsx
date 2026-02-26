import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  DollarSign,
  Target,
  Bell,
  Download,
  FileText,
} from "lucide-react";

export default function FinancialDashboard() {
  const plannedFeatures = [
    {
      icon: BarChart3,
      title: "Donation Trends",
      description: "Interactive line charts showing monthly donation patterns and year-over-year comparisons",
    },
    {
      icon: PieChart,
      title: "Category Breakdown",
      description: "Visual breakdown of donations by fund type: General, Building, Missions, Youth Ministry",
    },
    {
      icon: TrendingUp,
      title: "Financial Health Score",
      description: "Overall church financial health metric with giving trends, retention rates, and recommendations",
    },
    {
      icon: Target,
      title: "Budget Overview",
      description: "Track budget vs actual spending with category breakdowns and variance alerts",
    },
    {
      icon: Bell,
      title: "Real-time Notifications",
      description: "Live donation alerts and dashboard updates as gifts come in",
    },
    {
      icon: Download,
      title: "Export Reports",
      description: "Generate CSV/Excel reports for accounting, year-end giving statements, and audits",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive financial analytics and reporting
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            What's Coming
          </CardTitle>
          <CardDescription>
            A powerful financial dashboard to help you track, analyze, and grow your church's giving
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-green-500/30 transition-colors"
              >
                <feature.icon className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Metrics Preview</CardTitle>
          <CardDescription>Sample data structure for the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-green-500">$--,---</div>
              <div className="text-sm text-muted-foreground">Total This Month</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-blue-500">---</div>
              <div className="text-sm text-muted-foreground">Active Donors</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-purple-500">$---</div>
              <div className="text-sm text-muted-foreground">Avg Gift Size</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-amber-500">--%</div>
              <div className="text-sm text-muted-foreground">Recurring Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
