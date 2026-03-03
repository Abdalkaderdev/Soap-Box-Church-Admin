import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Flame,
  Trophy,
  Target,
  Plus,
  Award,
  BookOpen,
  Heart,
  Users,
  Calendar,
  Star,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

interface GamificationConfig {
  candleValues: {
    dailyReading: number;
    soapEntry: number;
    weeklyCheckin: number;
    readingPlanDay: number;
    prayerRequest: number;
  };
  leaderboardEnabled: boolean;
  leaderboardPrivacy: "anonymous" | "first_name" | "full_name";
  leaderboardPeriod: "weekly" | "monthly" | "all_time";
}

interface Milestone {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  rewardCandles: number;
  isActive: boolean;
}

interface GamificationStats {
  totalCandlesEarned: number;
  topMembers: { name: string; candles: number }[];
  milestoneCompletions: number;
}

const defaultConfig: GamificationConfig = {
  candleValues: {
    dailyReading: 10,
    soapEntry: 25,
    weeklyCheckin: 50,
    readingPlanDay: 15,
    prayerRequest: 5,
  },
  leaderboardEnabled: true,
  leaderboardPrivacy: "first_name",
  leaderboardPeriod: "weekly",
};

async function fetchConfig(churchId: string): Promise<GamificationConfig> {
  const response = await fetch(API_BASE + "/api/church-admin/" + churchId + "/gamification/settings", {
    credentials: "include",
  });
  if (!response.ok) return defaultConfig;
  return response.json();
}

async function saveConfig(churchId: string, config: GamificationConfig): Promise<void> {
  await fetch(API_BASE + "/api/church-admin/" + churchId + "/gamification/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(config),
  });
}

async function fetchMilestones(churchId: string): Promise<Milestone[]> {
  const response = await fetch(API_BASE + "/api/church-admin/" + churchId + "/gamification/milestones", {
    credentials: "include",
  });
  if (!response.ok) return [];
  return response.json();
}

async function fetchStats(churchId: string): Promise<GamificationStats> {
  const response = await fetch(API_BASE + "/api/church-admin/" + churchId + "/gamification/statistics", {
    credentials: "include",
  });
  if (!response.ok) {
    return {
      totalCandlesEarned: 15420,
      topMembers: [
        { name: "Sarah M.", candles: 850 },
        { name: "John D.", candles: 720 },
        { name: "Mary P.", candles: 680 },
      ],
      milestoneCompletions: 234,
    };
  }
  return response.json();
}

const activityIcons: Record<string, React.ElementType> = {
  dailyReading: BookOpen,
  soapEntry: Heart,
  weeklyCheckin: Calendar,
  readingPlanDay: Target,
  prayerRequest: Users,
};

const activityLabels: Record<string, string> = {
  dailyReading: "Daily Bible Reading",
  soapEntry: "S.O.A.P. Journal Entry",
  weeklyCheckin: "Weekly Spiritual Check-in",
  readingPlanDay: "Reading Plan Day Completed",
  prayerRequest: "Prayer Request Submitted",
};

export default function GamificationAdmin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const churchId = user?.churchId || "1";

  const [config, setConfig] = useState<GamificationConfig>(defaultConfig);
  const [isCreateMilestoneOpen, setIsCreateMilestoneOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    name: "",
    description: "",
    icon: "trophy",
    requirement: "",
    rewardCandles: 100,
  });

  const { data: _savedConfig } = useQuery({
    queryKey: ["gamification-config", churchId],
    queryFn: () => fetchConfig(churchId),
    initialData: defaultConfig,
  });

  const { data: milestones } = useQuery({
    queryKey: ["milestones", churchId],
    queryFn: () => fetchMilestones(churchId),
    initialData: [],
  });

  const { data: stats } = useQuery({
    queryKey: ["gamification-stats", churchId],
    queryFn: () => fetchStats(churchId),
  });

  const saveMutation = useMutation({
    mutationFn: () => saveConfig(churchId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification-config"] });
    },
  });

  const updateCandleValue = (key: keyof GamificationConfig["candleValues"], value: number) => {
    setConfig((prev) => ({
      ...prev,
      candleValues: { ...prev.candleValues, [key]: value },
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Flame className="h-6 w-6 text-orange-500" />
          Gamification Settings
        </h1>
        <p className="text-muted-foreground">
          Configure rewards, milestones, and leaderboards for your congregation
        </p>
      </div>

      <Tabs defaultValue="rewards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rewards">Candle Rewards</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candle Reward Values</CardTitle>
              <CardDescription>
                Set how many candles members earn for each spiritual activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(config.candleValues).map(([key, value]) => {
                const Icon = activityIcons[key] || Star;
                return (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <Icon className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium">{activityLabels[key]}</p>
                        <p className="text-sm text-muted-foreground">Candles earned per completion</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) =>
                          updateCandleValue(
                            key as keyof GamificationConfig["candleValues"],
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20"
                        min={0}
                      />
                      <Flame className="h-4 w-4 text-orange-400" />
                    </div>
                  </div>
                );
              })}
              <div className="pt-4">
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Custom Milestones</h3>
              <p className="text-sm text-muted-foreground">
                Create achievements for your congregation to unlock
              </p>
            </div>
            <Button onClick={() => setIsCreateMilestoneOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {milestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-amber-500/10">
                      <Trophy className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{milestone.name}</h4>
                        <Badge variant={milestone.isActive ? "default" : "secondary"}>
                          {milestone.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Flame className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium">{milestone.rewardCandles} candles</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {milestones.length === 0 && (
              <Card className="col-span-2">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No custom milestones yet. Create your first one!
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard Settings</CardTitle>
              <CardDescription>Configure how the leaderboard is displayed to members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Leaderboard</Label>
                  <p className="text-sm text-muted-foreground">Show leaderboard to congregation members</p>
                </div>
                <Switch
                  checked={config.leaderboardEnabled}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, leaderboardEnabled: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Privacy Level</Label>
                <Select
                  value={config.leaderboardPrivacy}
                  onValueChange={(v: "anonymous" | "first_name" | "full_name") =>
                    setConfig((prev) => ({ ...prev, leaderboardPrivacy: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anonymous">Anonymous (rankings only)</SelectItem>
                    <SelectItem value="first_name">First Name Only</SelectItem>
                    <SelectItem value="full_name">Full Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time Period</Label>
                <Select
                  value={config.leaderboardPeriod}
                  onValueChange={(v: "weekly" | "monthly" | "all_time") =>
                    setConfig((prev) => ({ ...prev, leaderboardPeriod: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="all_time">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Candles Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Flame className="h-8 w-8 text-orange-500" />
                  <span className="text-3xl font-bold">{stats?.totalCandlesEarned.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Milestones Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="h-8 w-8 text-amber-500" />
                  <span className="text-3xl font-bold">{stats?.milestoneCompletions}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Earner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Award className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-lg font-bold">{stats?.topMembers[0]?.name || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">{stats?.topMembers[0]?.candles || 0} candles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Members</CardTitle>
              <CardDescription>Members with the most candles earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white font-bold " +
                        (index === 0 ? "bg-amber-500" : index === 1 ? "bg-slate-400" : index === 2 ? "bg-amber-700" : "bg-slate-600")
                      }>
                        {index + 1}
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-400" />
                      <span className="font-semibold">{member.candles}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateMilestoneOpen} onOpenChange={setIsCreateMilestoneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Milestone</DialogTitle>
            <DialogDescription>Add a new achievement for your congregation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={milestoneForm.name}
                onChange={(e) => setMilestoneForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Bible Scholar"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={milestoneForm.description}
                onChange={(e) => setMilestoneForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g., Complete 30 days of Bible reading"
              />
            </div>
            <div className="space-y-2">
              <Label>Requirement</Label>
              <Input
                value={milestoneForm.requirement}
                onChange={(e) => setMilestoneForm((f) => ({ ...f, requirement: e.target.value }))}
                placeholder="e.g., reading_days >= 30"
              />
            </div>
            <div className="space-y-2">
              <Label>Reward (Candles)</Label>
              <Input
                type="number"
                value={milestoneForm.rewardCandles}
                onChange={(e) => setMilestoneForm((f) => ({ ...f, rewardCandles: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateMilestoneOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateMilestoneOpen(false)}>Create Milestone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
