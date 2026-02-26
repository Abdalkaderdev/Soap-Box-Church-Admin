import { memo } from 'react';
import {
  AreaChart,
  Area,
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
  recurring: '#7c3aed', // primary purple
  oneTime: '#10B981', // green
  recurringGradientStart: 'rgba(124, 58, 237, 0.3)',
  recurringGradientEnd: 'rgba(124, 58, 237, 0)',
  oneTimeGradientStart: 'rgba(16, 185, 129, 0.3)',
  oneTimeGradientEnd: 'rgba(16, 185, 129, 0)',
  grid: '#e5e7eb',
  text: '#9ca3af',
};

export interface RecurringVsOneTimeDataPoint {
  month: string;
  recurring: number;
  oneTime: number;
  total?: number;
}

export interface RecurringVsOneTimeChartProps {
  data: RecurringVsOneTimeDataPoint[];
  title?: string;
  description?: string;
  recurringLabel?: string;
  oneTimeLabel?: string;
  height?: number;
  stacked?: boolean;
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
  recurringLabel: string;
  oneTimeLabel: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  recurringLabel,
  oneTimeLabel,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const recurringData = payload.find(p => p.dataKey === 'recurring');
    const oneTimeData = payload.find(p => p.dataKey === 'oneTime');

    const recurringValue = recurringData?.value ?? 0;
    const oneTimeValue = oneTimeData?.value ?? 0;
    const total = recurringValue + oneTimeValue;
    const recurringPercent = total > 0 ? (recurringValue / total) * 100 : 0;

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
        <p className="font-medium text-foreground mb-2">{label}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COLORS.recurring }}
              />
              <span className="text-muted-foreground">{recurringLabel}</span>
            </div>
            <span className="font-medium text-foreground">
              {formatFullCurrency(recurringValue)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COLORS.oneTime }}
              />
              <span className="text-muted-foreground">{oneTimeLabel}</span>
            </div>
            <span className="font-medium text-foreground">
              {formatFullCurrency(oneTimeValue)}
            </span>
          </div>
          <div className="pt-2 border-t border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium text-foreground">
                {formatFullCurrency(total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Recurring %</span>
              <span className="font-medium text-purple-600">
                {recurringPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const RecurringVsOneTimeChartComponent = ({
  data,
  title = 'Recurring vs One-Time',
  description = 'Comparison of recurring and one-time donations over time',
  recurringLabel = 'Recurring',
  oneTimeLabel = 'One-Time',
  height = 300,
  stacked = true,
  className = '',
}: RecurringVsOneTimeChartProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRecurring" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.recurring} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.recurring} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOneTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.oneTime} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.oneTime} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
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
                  recurringLabel={recurringLabel}
                  oneTimeLabel={oneTimeLabel}
                />
              }
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">
                  {value === 'recurring' ? recurringLabel : oneTimeLabel}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="recurring"
              name="recurring"
              stroke={COLORS.recurring}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRecurring)"
              stackId={stacked ? '1' : undefined}
            />
            <Area
              type="monotone"
              dataKey="oneTime"
              name="oneTime"
              stroke={COLORS.oneTime}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOneTime)"
              stackId={stacked ? '1' : undefined}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const RecurringVsOneTimeChart = memo(RecurringVsOneTimeChartComponent);
