/**
 * AreaChart — Dual-axis area chart with gradients
 *
 * Features:
 * - Recharts integration
 * - Gradient fills under lines
 * - Interactive tooltips
 * - Legend with RTL support
 * - Responsive sizing
 */

import * as React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface AreaChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface AreaChartSeries {
  dataKey: string;
  name: string;
  color: string;
  stroke?: string;
}

export interface AreaChartProps {
  data: AreaChartDataPoint[];
  series: AreaChartSeries[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
}

const defaultSeriesColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export function AreaChart({
  data,
  series,
  height = 280,
  showLegend = true,
  showGrid = true,
  className,
}: AreaChartProps) {
  const gradientIds = React.useId();

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            {series.map((s, i) => (
              <linearGradient
                key={s.dataKey}
                id={`area-gradient-${gradientIds}-${i}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
          )}
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dx={-10}
            tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              direction: 'rtl',
            }}
            labelStyle={{ fontFamily: 'Cairo, sans-serif' }}
            formatter={(value: number) => [value, undefined]}
            labelFormatter={(label) => label}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span
                  style={{
                    color: 'hsl(var(--foreground))',
                    fontFamily: 'Cairo, sans-serif',
                    marginRight: 8,
                  }}
                >
                  {value}
                </span>
              )}
            />
          )}
          {series.map((s, i) => (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.stroke || s.color}
              strokeWidth={2}
              fill={`url(#area-gradient-${gradientIds}-${i})`}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AreaChart;
