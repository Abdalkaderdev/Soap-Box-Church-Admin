import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  Calendar,
  PieChart,
  Target,
  CheckCircle2,
} from "lucide-react";

/**
 * Represents a single budget category with allocation and actual spending
 */
export interface BudgetCategory {
  id: number;
  name: string;
  allocatedAmount: number;
  actualAmount: number;
  description?: string;
}

/**
 * Budget data for the overview widget
 */
export interface BudgetData {
  /** Budget period label (e.g., "Q1 2026" or "January 2026") */
  period: string;
  /** Start date of the budget period */
  startDate?: string;
  /** End date of the budget period */
  endDate?: string;
  /** Total budget amount for the period */
  totalBudget: number;
  /** Amount spent/received so far */
  spentAmount: number;
  /** Remaining budget (calculated: totalBudget - spentAmount) */
  remainingAmount: number;
  /** List of budget categories with allocations and actuals */
  categories: BudgetCategory[];
}

/**
 * Variance alert configuration thresholds
 */
export interface VarianceThresholds {
  /** Percentage over budget to trigger warning (default: 10) */
  warningOverPercent?: number;
  /** Percentage over budget to trigger critical alert (default: 20) */
  criticalOverPercent?: number;
  /** Percentage under budget to trigger under-budget notice (default: 30) */
  underBudgetPercent?: number;
}

export interface BudgetOverviewProps {
  /** Budget data to display */
  data: BudgetData;
  /** Variance thresholds for alerts */
  thresholds?: VarianceThresholds;
  /** Whether to show the category breakdown section */
  showCategoryBreakdown?: boolean;
  /** Whether to show variance alerts */
  showVarianceAlerts?: boolean;
  /** Custom className for the root element */
  className?: string;
}

/**
 * Calculate the variance percentage for a category
 */
function calculateVariance(allocated: number, actual: number): number {
  if (allocated === 0) return actual > 0 ? 100 : 0;
  return ((actual - allocated) / allocated) * 100;
}

/**
 * Get the variance status based on thresholds
 */
function getVarianceStatus(
  variance: number,
  thresholds: Required<VarianceThresholds>
): "critical" | "warning" | "under" | "on-track" {
  if (variance >= thresholds.criticalOverPercent) return "critical";
  if (variance >= thresholds.warningOverPercent) return "warning";
  if (variance <= -thresholds.underBudgetPercent) return "under";
  return "on-track";
}

/**
 * Get color classes for variance indicators
 */
function getVarianceColor(status: ReturnType<typeof getVarianceStatus>): string {
  switch (status) {
    case "critical":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
    case "warning":
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950";
    case "under":
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950";
    case "on-track":
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950";
  }
}

/**
 * Get badge variant for variance status
 */
function getVarianceBadgeVariant(status: ReturnType<typeof getVarianceStatus>): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "critical":
      return "destructive";
    case "warning":
      return "secondary";
    default:
      return "outline";
  }
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

const DEFAULT_THRESHOLDS: Required<VarianceThresholds> = {
  warningOverPercent: 10,
  criticalOverPercent: 20,
  underBudgetPercent: 30,
};

const BudgetOverviewComponent = ({
  data,
  thresholds = {},
  showCategoryBreakdown = true,
  showVarianceAlerts = true,
  className = "",
}: BudgetOverviewProps) => {
  const resolvedThresholds: Required<VarianceThresholds> = {
    ...DEFAULT_THRESHOLDS,
    ...thresholds,
  };

  // Calculate overall budget progress percentage
  const progressPercent = data.totalBudget > 0
    ? Math.min((data.spentAmount / data.totalBudget) * 100, 100)
    : 0;

  // Calculate category variances and determine alerts
  const categoryVariances = data.categories.map((category) => {
    const variance = calculateVariance(category.allocatedAmount, category.actualAmount);
    const status = getVarianceStatus(variance, resolvedThresholds);
    return {
      ...category,
      variance,
      status,
    };
  });

  // Filter categories that need alerts
  const alertCategories = categoryVariances.filter(
    (cat) => cat.status === "critical" || cat.status === "warning" || cat.status === "under"
  );

  const overBudgetCategories = alertCategories.filter(
    (cat) => cat.status === "critical" || cat.status === "warning"
  );
  const underBudgetCategories = alertCategories.filter((cat) => cat.status === "under");

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Budget Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg font-semibold">Budget Overview</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              {data.period}
            </CardDescription>
          </div>
          <PieChart className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Total Budget</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.totalBudget)}
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Spent/Received</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(data.spentAmount)}
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Remaining</span>
              <span className={`text-2xl font-bold ${
                data.remainingAmount >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                {formatCurrency(data.remainingAmount)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget Utilization</span>
              <span className="font-medium">{progressPercent.toFixed(1)}%</span>
            </div>
            <Progress
              value={progressPercent}
              className={`h-3 ${progressPercent > 100 ? "[&>div]:bg-red-500" : progressPercent > 90 ? "[&>div]:bg-yellow-500" : ""}`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>{formatCurrency(data.totalBudget)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variance Alerts */}
      {showVarianceAlerts && alertCategories.length > 0 && (
        <div className="space-y-3">
          {overBudgetCategories.length > 0 && (
            <Alert variant="destructive" className="border-red-200 dark:border-red-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Over Budget Warning</AlertTitle>
              <AlertDescription>
                <span className="font-medium">{overBudgetCategories.length} {overBudgetCategories.length === 1 ? "category is" : "categories are"}</span> exceeding allocated budget:
                <ul className="mt-2 space-y-1">
                  {overBudgetCategories.map((cat) => (
                    <li key={cat.id} className="flex items-center gap-2">
                      <span className="font-medium">{cat.name}:</span>
                      <span>{formatCurrency(cat.actualAmount)} / {formatCurrency(cat.allocatedAmount)}</span>
                      <Badge variant="destructive" className="text-xs">
                        {formatPercent(cat.variance)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {underBudgetCategories.length > 0 && (
            <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800 dark:text-blue-200">Under Budget Notice</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <span className="font-medium">{underBudgetCategories.length} {underBudgetCategories.length === 1 ? "category is" : "categories are"}</span> significantly under budget:
                <ul className="mt-2 space-y-1">
                  {underBudgetCategories.map((cat) => (
                    <li key={cat.id} className="flex items-center gap-2">
                      <span className="font-medium">{cat.name}:</span>
                      <span>{formatCurrency(cat.actualAmount)} / {formatCurrency(cat.allocatedAmount)}</span>
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                        {formatPercent(cat.variance)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Category Breakdown */}
      {showCategoryBreakdown && data.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Category Breakdown
            </CardTitle>
            <CardDescription>
              Budget allocation vs actual amounts by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryVariances.map((category) => {
                const categoryProgress = category.allocatedAmount > 0
                  ? (category.actualAmount / category.allocatedAmount) * 100
                  : 0;
                const badgeVariant = getVarianceBadgeVariant(category.status);

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{category.name}</span>
                        <Badge variant={badgeVariant} className="text-xs">
                          {category.status === "on-track" ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : category.status === "under" ? (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          )}
                          {formatPercent(category.variance)}
                        </Badge>
                      </div>
                      <div className="text-sm text-right">
                        <span className="font-semibold">{formatCurrency(category.actualAmount)}</span>
                        <span className="text-muted-foreground"> / {formatCurrency(category.allocatedAmount)}</span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            category.status === "critical"
                              ? "bg-red-500"
                              : category.status === "warning"
                                ? "bg-yellow-500"
                                : category.status === "under"
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(categoryProgress, 100)}%` }}
                        />
                        {categoryProgress > 100 && (
                          <div
                            className="absolute top-0 h-2 bg-red-600 rounded-r-full opacity-70"
                            style={{
                              left: "100%",
                              width: `${Math.min(categoryProgress - 100, 50)}%`,
                              marginLeft: "-1px"
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {category.description && (
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {data.categories.length === 0 && showCategoryBreakdown && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No budget categories defined yet
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const BudgetOverview = memo(BudgetOverviewComponent);
export default BudgetOverview;
