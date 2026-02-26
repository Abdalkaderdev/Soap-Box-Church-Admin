import { memo } from 'react';
import {
  LineChart,
  Line,
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
  primary: '#7c3aed',
  secondary: '#a855f7',
  tertiary: '#c084fc',
  grid: '#e5e7eb',
  text: '#9ca3af',
};

export interface DonationTrendDataPoint {
  month: string;
  amount: number;
  count?: number;
  previousYear?: number;
}

export interface DonationTrendChartProps {
  data: DonationTrendDataPoint[];
  title?: string;
  description?: string;
  showCount?: boolean;
  showPreviousYear?: boolean;
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
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[160px]">
        <p className="font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-medium text-foreground">
              {entry.dataKey === 'count' ? entry.value : formatFullCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DonationTrendChartComponent = ({
  data,
  title = 'Donation Trends',
  description = 'Monthly donation trends over the past 6 months',
  showCount = false,
  showPreviousYear = false,
  height = 300,
  className = '',
}: DonationTrendChartProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
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
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="amount"
              name="Current Year"
              stroke={COLORS.primary}
              strokeWidth={3}
              dot={{ fill: COLORS.primary, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: COLORS.primary, strokeWidth: 2, stroke: '#fff' }}
            />
            {showPreviousYear && (
              <Line
                type="monotone"
                dataKey="previousYear"
                name="Previous Year"
                stroke={COLORS.tertiary}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: COLORS.tertiary, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: COLORS.tertiary, strokeWidth: 2, stroke: '#fff' }}
              />
            )}
            {showCount && (
              <Line
                type="monotone"
                dataKey="count"
                name="Donation Count"
                stroke={COLORS.secondary}
                strokeWidth={2}
                dot={{ fill: COLORS.secondary, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: COLORS.secondary, strokeWidth: 2, stroke: '#fff' }}
                yAxisId="right"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const DonationTrendChart = memo(DonationTrendChartComponent);
