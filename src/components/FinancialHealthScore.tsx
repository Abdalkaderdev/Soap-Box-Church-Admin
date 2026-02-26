import { memo, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowUpRight,
  Heart,
  Target,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types for financial health data
export interface FinancialHealthData {
  // Giving trends
  givingTrend: {
    direction: 'up' | 'down' | 'stable';
    percentageChange: number;
    comparisonPeriod: string; // e.g., "vs last month"
  };

  // Donor retention
  donorRetention: {
    rate: number; // 0-100
    totalDonors: number;
    retainedDonors: number;
    lostDonors: number;
  };

  // Recurring giving
  recurringGiving: {
    percentage: number; // 0-100
    recurringDonors: number;
    totalDonors: number;
    monthlyRecurringRevenue: number;
  };

  // New donor growth
  newDonorGrowth: {
    rate: number; // percentage growth
    newDonorsThisPeriod: number;
    newDonorsLastPeriod: number;
  };

  // Optional: historical data for trend display
  historicalScores?: number[];
}

interface FinancialHealthScoreProps {
  data: FinancialHealthData;
  isLoading?: boolean;
  className?: string;
}

// Calculate overall health score (0-100)
const calculateHealthScore = (data: FinancialHealthData): number => {
  // Weight factors for different metrics
  const weights = {
    givingTrend: 0.25,
    donorRetention: 0.30,
    recurringGiving: 0.25,
    newDonorGrowth: 0.20
  };

  // Calculate individual scores (normalized to 0-100)
  let givingTrendScore = 50; // baseline for stable
  if (data.givingTrend.direction === 'up') {
    givingTrendScore = Math.min(100, 50 + data.givingTrend.percentageChange);
  } else if (data.givingTrend.direction === 'down') {
    givingTrendScore = Math.max(0, 50 - Math.abs(data.givingTrend.percentageChange));
  }

  const retentionScore = data.donorRetention.rate;
  const recurringScore = data.recurringGiving.percentage;

  let growthScore = 50; // baseline
  if (data.newDonorGrowth.rate > 0) {
    growthScore = Math.min(100, 50 + data.newDonorGrowth.rate);
  } else {
    growthScore = Math.max(0, 50 + data.newDonorGrowth.rate);
  }

  // Calculate weighted average
  const score =
    givingTrendScore * weights.givingTrend +
    retentionScore * weights.donorRetention +
    recurringScore * weights.recurringGiving +
    growthScore * weights.newDonorGrowth;

  return Math.round(Math.max(0, Math.min(100, score)));
};

// Get color based on score
const getScoreColor = (score: number): { bg: string; text: string; ring: string } => {
  if (score >= 80) {
    return { bg: 'bg-green-500', text: 'text-green-600', ring: 'ring-green-500/20' };
  } else if (score >= 60) {
    return { bg: 'bg-yellow-500', text: 'text-yellow-600', ring: 'ring-yellow-500/20' };
  } else {
    return { bg: 'bg-red-500', text: 'text-red-600', ring: 'ring-red-500/20' };
  }
};

// Get score label
const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
};

// Generate AI-style recommendations based on scores
const generateRecommendations = (data: FinancialHealthData, _score: number): Array<{
  type: 'success' | 'warning' | 'tip';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}> => {
  const recommendations: Array<{
    type: 'success' | 'warning' | 'tip';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  // Giving trend recommendations
  if (data.givingTrend.direction === 'down' && Math.abs(data.givingTrend.percentageChange) > 10) {
    recommendations.push({
      type: 'warning',
      title: 'Declining Giving Trend',
      description: 'Consider launching a giving campaign or communicating impact stories to re-engage donors.',
      priority: 'high'
    });
  } else if (data.givingTrend.direction === 'up' && data.givingTrend.percentageChange > 15) {
    recommendations.push({
      type: 'success',
      title: 'Strong Giving Momentum',
      description: 'Capitalize on this momentum by thanking donors and sharing recent achievements.',
      priority: 'low'
    });
  }

  // Donor retention recommendations
  if (data.donorRetention.rate < 50) {
    recommendations.push({
      type: 'warning',
      title: 'Low Donor Retention',
      description: 'Implement a donor appreciation program and regular impact updates to improve retention.',
      priority: 'high'
    });
  } else if (data.donorRetention.rate >= 70) {
    recommendations.push({
      type: 'success',
      title: 'Excellent Donor Retention',
      description: 'Your donors are loyal! Consider a referral program to leverage their engagement.',
      priority: 'low'
    });
  }

  // Recurring giving recommendations
  if (data.recurringGiving.percentage < 30) {
    recommendations.push({
      type: 'tip',
      title: 'Grow Recurring Giving',
      description: 'Launch a recurring giving initiative with matching donations or exclusive benefits for monthly givers.',
      priority: 'medium'
    });
  } else if (data.recurringGiving.percentage >= 50) {
    recommendations.push({
      type: 'success',
      title: 'Strong Recurring Base',
      description: 'Your recurring giving provides financial stability. Focus on increasing average gift amounts.',
      priority: 'low'
    });
  }

  // New donor growth recommendations
  if (data.newDonorGrowth.rate < 0) {
    recommendations.push({
      type: 'warning',
      title: 'Donor Acquisition Declining',
      description: 'Expand outreach through social media campaigns and community events to attract new supporters.',
      priority: 'high'
    });
  } else if (data.newDonorGrowth.rate > 20) {
    recommendations.push({
      type: 'success',
      title: 'Growing Donor Base',
      description: 'Great acquisition! Ensure new donors receive a warm welcome and clear next steps.',
      priority: 'low'
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

// Circular Progress Gauge Component
const CircularGauge = ({ score, size = 180 }: { score: number; size?: number }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const colors = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(colors.text, "transition-all duration-1000 ease-out")}
          style={{
            filter: 'drop-shadow(0 0 6px currentColor)'
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-bold", colors.text)}>
          {score}
        </span>
        <span className="text-sm text-muted-foreground font-medium">
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
};

// Trend Indicator Component
const TrendIndicator = ({ direction, change, period }: {
  direction: 'up' | 'down' | 'stable';
  change: number;
  period: string;
}) => {
  const icons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus
  };
  const colors = {
    up: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    down: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    stable: 'text-gray-600 bg-gray-100 dark:bg-gray-800'
  };

  const Icon = icons[direction];

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium",
      colors[direction]
    )}>
      <Icon className="h-4 w-4" />
      <span>
        {direction === 'up' && '+'}
        {change.toFixed(1)}%
      </span>
      <span className="text-xs opacity-75">{period}</span>
    </div>
  );
};

// Score Factor Card
const ScoreFactorCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  tooltipContent
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  trend?: { direction: 'up' | 'down' | 'stable'; change: number };
  tooltipContent?: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="group p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 cursor-default">
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "p-2 rounded-lg",
                "bg-purple-100 dark:bg-purple-900/30"
              )}>
                <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              {trend && (
                <div className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium",
                  trend.direction === 'up' ? 'text-green-600' :
                  trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
                )}>
                  {trend.direction === 'up' && <ArrowUpRight className="h-3 w-3" />}
                  {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
                  {trend.direction !== 'stable' && `${trend.direction === 'up' ? '+' : ''}${trend.change.toFixed(1)}%`}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {typeof value === 'number' ? `${value.toFixed(1)}%` : value}
              </p>
              <p className="text-sm font-medium text-foreground/80">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        </TooltipTrigger>
        {tooltipContent && (
          <TooltipContent side="bottom" className="max-w-xs">
            <p>{tooltipContent}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

// Recommendation Card
const RecommendationCard = ({
  recommendation
}: {
  recommendation: ReturnType<typeof generateRecommendations>[0]
}) => {
  const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    tip: Lightbulb
  };
  const colors = {
    success: 'border-l-green-500 bg-green-50 dark:bg-green-900/10',
    warning: 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/10',
    tip: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
  };
  const iconColors = {
    success: 'text-green-600',
    warning: 'text-amber-600',
    tip: 'text-blue-600'
  };

  const Icon = icons[recommendation.type];

  return (
    <div className={cn(
      "p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm",
      colors[recommendation.type]
    )}>
      <div className="flex gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconColors[recommendation.type])} />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-foreground">
              {recommendation.title}
            </h4>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0",
                recommendation.priority === 'high' ? 'border-red-300 text-red-600' :
                recommendation.priority === 'medium' ? 'border-amber-300 text-amber-600' :
                'border-green-300 text-green-600'
              )}
            >
              {recommendation.priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {recommendation.description}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Component
const FinancialHealthScoreComponent = ({
  data,
  isLoading = false,
  className
}: FinancialHealthScoreProps) => {
  const healthScore = useMemo(() => calculateHealthScore(data), [data]);
  const recommendations = useMemo(() => generateRecommendations(data, healthScore), [data, healthScore]);

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Calculating financial health...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Financial Health Score
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your organization's financial wellness
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>
                  This score is calculated from giving trends (25%), donor retention (30%),
                  recurring giving (25%), and new donor growth (20%).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="flex flex-col lg:flex-row items-center gap-8 p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50">
          <div className="flex-shrink-0">
            <CircularGauge score={healthScore} />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Overall Financial Health
              </h3>
              <p className="text-sm text-muted-foreground">
                Your financial health score reflects the combined performance of giving patterns,
                donor engagement, and growth metrics.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <TrendIndicator
                  direction={data.givingTrend.direction}
                  change={data.givingTrend.percentageChange}
                  period={data.givingTrend.comparisonPeriod}
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-pink-500" />
                <span className="text-muted-foreground">
                  {data.donorRetention.retainedDonors} loyal donors
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Factors Grid */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Score Factors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreFactorCard
              title="Giving Trend"
              value={data.givingTrend.direction === 'stable' ? 'Stable' :
                `${data.givingTrend.direction === 'up' ? '+' : ''}${data.givingTrend.percentageChange.toFixed(1)}%`}
              icon={data.givingTrend.direction === 'up' ? TrendingUp :
                data.givingTrend.direction === 'down' ? TrendingDown : Minus}
              description={data.givingTrend.comparisonPeriod}
              tooltipContent="Measures the change in total giving compared to the previous period"
            />

            <ScoreFactorCard
              title="Donor Retention"
              value={data.donorRetention.rate}
              icon={Heart}
              description={`${data.donorRetention.retainedDonors} of ${data.donorRetention.totalDonors} donors`}
              tooltipContent="Percentage of donors who continue giving year over year"
            />

            <ScoreFactorCard
              title="Recurring Giving"
              value={data.recurringGiving.percentage}
              icon={RefreshCw}
              description={`${data.recurringGiving.recurringDonors} monthly givers`}
              tooltipContent="Percentage of donors with active recurring donations"
            />

            <ScoreFactorCard
              title="New Donor Growth"
              value={data.newDonorGrowth.rate}
              icon={Users}
              description={`${data.newDonorGrowth.newDonorsThisPeriod} new this period`}
              trend={{
                direction: data.newDonorGrowth.rate > 0 ? 'up' :
                  data.newDonorGrowth.rate < 0 ? 'down' : 'stable',
                change: Math.abs(data.newDonorGrowth.rate)
              }}
              tooltipContent="Rate of new donor acquisition compared to previous period"
            />
          </div>
        </div>

        {/* Recommendations Section */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.slice(0, 4).map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>Your financial health looks great! Keep up the excellent work.</p>
              </div>
            )}
          </div>
        </div>

        {/* Score Breakdown Progress Bars */}
        <div className="pt-4 border-t">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Component Scores
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Giving Trend</span>
                <span className="font-medium">
                  {Math.round(data.givingTrend.direction === 'up' ?
                    Math.min(100, 50 + data.givingTrend.percentageChange) :
                    data.givingTrend.direction === 'down' ?
                    Math.max(0, 50 - Math.abs(data.givingTrend.percentageChange)) : 50)}%
                </span>
              </div>
              <Progress
                value={data.givingTrend.direction === 'up' ?
                  Math.min(100, 50 + data.givingTrend.percentageChange) :
                  data.givingTrend.direction === 'down' ?
                  Math.max(0, 50 - Math.abs(data.givingTrend.percentageChange)) : 50}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Donor Retention</span>
                <span className="font-medium">{data.donorRetention.rate.toFixed(0)}%</span>
              </div>
              <Progress value={data.donorRetention.rate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Recurring Giving</span>
                <span className="font-medium">{data.recurringGiving.percentage.toFixed(0)}%</span>
              </div>
              <Progress value={data.recurringGiving.percentage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>New Donor Growth</span>
                <span className="font-medium">
                  {Math.round(data.newDonorGrowth.rate > 0 ?
                    Math.min(100, 50 + data.newDonorGrowth.rate) :
                    Math.max(0, 50 + data.newDonorGrowth.rate))}%
                </span>
              </div>
              <Progress
                value={data.newDonorGrowth.rate > 0 ?
                  Math.min(100, 50 + data.newDonorGrowth.rate) :
                  Math.max(0, 50 + data.newDonorGrowth.rate)}
                className="h-2"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const FinancialHealthScore = memo(FinancialHealthScoreComponent);
export default FinancialHealthScore;
