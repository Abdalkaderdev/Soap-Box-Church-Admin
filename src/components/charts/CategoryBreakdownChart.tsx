import { memo, useState, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Sector,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Consistent color palette matching app theme
const CHART_COLORS = [
  '#7c3aed', // primary purple
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
];

export interface CategoryDataPoint {
  name: string;
  amount: number;
  percent?: number;
  color?: string;
}

export interface CategoryBreakdownChartProps {
  data: CategoryDataPoint[];
  title?: string;
  description?: string;
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
}

const formatCurrency = (value: number): string => {
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
    payload: CategoryDataPoint & { fill: string };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = data.percent ?? 0;
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[140px]">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.fill || data.color }}
          />
          <span className="font-medium text-foreground">{data.name}</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">{formatCurrency(data.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Share:</span>
            <span className="font-medium">{total.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface ActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: CategoryDataPoint;
  percent: number;
}

const renderActiveShape = (props: unknown) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
  } = props as ActiveShapeProps;

  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="currentColor" className="text-sm font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" fill="currentColor" className="text-lg font-bold">
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 14}
        fill={fill}
      />
    </g>
  );
};

interface LegendPayload {
  value: string;
  color: string;
}

interface CustomLegendProps {
  payload?: LegendPayload[];
  data: CategoryDataPoint[];
}

const CustomLegend = ({ payload, data }: CustomLegendProps) => {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload.map((entry, index) => {
        const dataItem = data.find(d => d.name === entry.value);
        return (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">{entry.value}</span>
            {dataItem && (
              <span className="text-sm font-medium">
                ({dataItem.percent?.toFixed(0) ?? 0}%)
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const CategoryBreakdownChartComponent = ({
  data,
  title = 'Donations by Category',
  description = 'Breakdown of donations by fund/category',
  height = 300,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
  className = '',
}: CategoryBreakdownChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(undefined);
  }, []);

  // Calculate percentages if not provided
  const processedData = data.map((item, index) => {
    const total = data.reduce((sum, d) => sum + d.amount, 0);
    return {
      ...item,
      percent: item.percent ?? (total > 0 ? (item.amount / total) * 100 : 0),
      color: item.color || CHART_COLORS[index % CHART_COLORS.length],
    };
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey="amount"
              nameKey="name"
              activeShape={activeIndex !== null ? renderActiveShape : undefined}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {processedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                content={<CustomLegend data={processedData} />}
                verticalAlign="bottom"
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const CategoryBreakdownChart = memo(CategoryBreakdownChartComponent);
