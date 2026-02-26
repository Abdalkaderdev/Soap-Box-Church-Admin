import { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Consistent color palette matching app theme
const COLORS = {
  currentYear: '#7c3aed', // primary purple
  previousYear: '#c084fc', // lighter purple
  grid: '#e5e7eb',
  text: '#9ca3af',
};

export interface MonthlyComparisonDataPoint {
  month: string;
  currentYear: number;
  previousYear: number;
  growth?: number;
}

export interface MonthlyComparisonChartProps {
  data: MonthlyComparisonDataPoint[];
  title?: string;
  description?: string;
  currentYearLabel?: string;
  previousYearLabel?: string;
  height?: number;
  className?: string;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value}`;
};

const formatFullCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    name: string;
  }>;
  label?: string;
  currentYearLabel: string;
  previousYearLabel: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  currentYearLabel,
  previousYearLabel,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const currentYearData = payload.find(p => p.dataKey === 'currentYear');
    const previousYearData = payload.find(p => p.dataKey === 'previousYear');

    const currentValue = currentYearData?.value ?? 0;
    const previousValue = previousYearData?.value ?? 0;
    const growth = previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0;

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
        <p className="font-medium text-foreground mb-2">{label}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: COLORS.currentYear }}
              />
              <span className="text-muted-foreground">{currentYearLabel}</span>
            </div>
            <span className="font-medium text-foreground">
              {formatFullCurrency(currentValue)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: COLORS.previousYear }}
              />
              <span className="text-muted-foreground">{previousYearLabel}</span>
            </div>
            <span className="font-medium text-foreground">
              {formatFullCurrency(previousValue)}
            </span>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">YoY Growth</span>
              <span className={`font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const MonthlyComparisonChartComponent = ({
  data,
  title = 'Monthly Comparison',
  description = 'Year-over-year monthly donation comparison',
  currentYearLabel = 'Current Year',
  previousYearLabel = 'Previous Year',
  height = 300,
  className = '',
}: MonthlyComparisonChartProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis
              dataKey="month"
              stroke={COLORS.text}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: COLORS.grid }}
            />
            <YAxis
              stroke={COLORS.text}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: COLORS.grid }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              content={
                <CustomTooltip
                  currentYearLabel={currentYearLabel}
                  previousYearLabel={previousYearLabel}
                />
              }
              cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
              iconSize={10}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">
                  {value === 'currentYear' ? currentYearLabel : previousYearLabel}
                </span>
              )}
            />
            <Bar
              dataKey="previousYear"
              name="previousYear"
              fill={COLORS.previousYear}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="currentYear"
              name="currentYear"
              fill={COLORS.currentYear}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const MonthlyComparisonChart = memo(MonthlyComparisonChartComponent);
