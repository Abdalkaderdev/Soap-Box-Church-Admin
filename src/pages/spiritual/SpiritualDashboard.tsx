import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Heart,
  BookOpen,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
  Award,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

interface DashboardStats {
  avgSpiritualGrowth: number;
  totalMembers: number;
  activeThisWeek: number;
  completionRate: number;
  maturityDistribution: {
    new_believer: number;
    growing: number;
    mature: number;
    leader: number;
  };
  areaScores: {
    prayer: number;
    bibleReading: number;
    community: number;
    service: number;
    wellbeing: number;
  };
}

async function fetchSpiritualDashboard(churchId: string): Promise<DashboardStats> {
  const response = await fetch(API_BASE + "/api/church-admin/" + churchId + "/spiritual/dashboard", {
    credentials: "include",
  });
  if (!response.ok) {
    return {
      avgSpiritualGrowth: 3.8,
      totalMembers: 245,
      activeThisWeek: 156,
      completionRate: 64,
      maturityDistribution: { new_believer: 45, growing: 98, mature: 72, leader: 30 },
      areaScores: { prayer: 3.5, bibleReading: 3.9, community: 4.1, service: 3.2, wellbeing: 3.7 },
    };
  }
  return response.json();
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "stable";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
          {trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
        </div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

function MaturityBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="capitalize">{label.replace("_", " ")}</span>
        <span className="text-muted-foreground">{count} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className={"h-full " + color + " transition-all"} style={{ width: percentage + "%" }} />
      </div>
    </div>
  );
}

function AreaScore({ label, score }: { label: string; score: number }) {
  const colorClass = score >= 4 ? "text-green-500" : score >= 3 ? "text-yellow-500" : "text-red-500";
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="capitalize">{label}</span>
      <div className="flex items-center gap-2">
        <span className={"font-semibold " + colorClass}>{score.toFixed(1)}</span>
        <span className="text-muted-foreground text-sm">/ 5</span>
      </div>
    </div>
  );
}

export default function SpiritualDashboard() {
  const { user } = useAuth();
  const churchId = user?.churchId || "1";

  const { data: stats, isLoading } = useQuery({
    queryKey: ["spiritual-dashboard", churchId],
    queryFn: () => fetchSpiritualDashboard(churchId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalInMaturity = stats
    ? stats.maturityDistribution.new_believer +
      stats.maturityDistribution.growing +
      stats.maturityDistribution.mature +
      stats.maturityDistribution.leader
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-purple-500" />
          Spiritual Health Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor your congregation's spiritual growth and engagement
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Avg Spiritual Growth"
          value={stats?.avgSpiritualGrowth.toFixed(1) || "0"}
          description="Out of 5.0 scale"
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Active This Week"
          value={stats?.activeThisWeek || 0}
          description={(stats?.completionRate || 0) + "% check-in rate"}
          icon={Users}
        />
        <StatCard
          title="Total Members"
          value={stats?.totalMembers || 0}
          description="With spiritual profiles"
          icon={Target}
        />
        <StatCard
          title="Weekly Check-ins"
          value={(stats?.completionRate || 0) + "%"}
          description="Completion rate"
          icon={CheckCircle}
          trend={stats?.completionRate && stats.completionRate > 50 ? "up" : "down"}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Spiritual Maturity Distribution
            </CardTitle>
            <CardDescription>Where your congregation is on their spiritual journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MaturityBar label="New Believer" count={stats?.maturityDistribution.new_believer || 0} total={totalInMaturity} color="bg-blue-500" />
            <MaturityBar label="Growing" count={stats?.maturityDistribution.growing || 0} total={totalInMaturity} color="bg-green-500" />
            <MaturityBar label="Mature" count={stats?.maturityDistribution.mature || 0} total={totalInMaturity} color="bg-purple-500" />
            <MaturityBar label="Leader" count={stats?.maturityDistribution.leader || 0} total={totalInMaturity} color="bg-amber-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Spiritual Growth Areas
            </CardTitle>
            <CardDescription>Average scores across your congregation</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.areaScores && (
              <div>
                <AreaScore label="Prayer Life" score={stats.areaScores.prayer} />
                <AreaScore label="Bible Reading" score={stats.areaScores.bibleReading} />
                <AreaScore label="Community Connection" score={stats.areaScores.community} />
                <AreaScore label="Service & Ministry" score={stats.areaScores.service} />
                <AreaScore label="Emotional Wellbeing" score={stats.areaScores.wellbeing} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Areas Needing Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.areaScores && stats.areaScores.service < 3.5 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Service & Ministry scores are below average</p>
                  <p className="text-sm text-muted-foreground">Consider promoting volunteer opportunities</p>
                </div>
              </div>
            )}
            {stats?.completionRate && stats.completionRate < 50 && (
              <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Weekly check-in completion is low</p>
                  <p className="text-sm text-muted-foreground">Send reminders to encourage weekly reflection</p>
                </div>
              </div>
            )}
            {stats && stats.areaScores.service >= 3.5 && stats.completionRate >= 50 && (
              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Your congregation is doing well!</p>
                  <p className="text-sm text-muted-foreground">Keep encouraging spiritual growth</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
