/**
 * StatCard — Reusable statistics card for dashboard
 *
 * Features:
 * - Icon, title, value, change percentage
 * - Mini chart support (pie, line, bar)
 * - Hover lift effect
 * - Color theme variants
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

export type StatCardTheme = 'blue' | 'green' | 'purple' | 'orange';

export interface StatCardChange {
  value: number;
  trend: 'up' | 'down';
}

export interface StatCardChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: StatCardChange;
  chart?: {
    type: 'pie' | 'line' | 'bar';
    data: StatCardChartData[];
  };
  theme?: StatCardTheme;
  className?: string;
}

const THEME_COLORS: Record<StatCardTheme, { bg: string; text: string; chart: string[] }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    chart: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    chart: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
    chart: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
  },
  orange: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    chart: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
  },
};

export function StatCard({
  icon,
  title,
  value,
  change,
  chart,
  theme = 'blue',
  className,
}: StatCardProps) {
  const colors = THEME_COLORS[theme];
  const chartColors = chart ? colors.chart : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        'dashboard-card rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'text-xs font-medium',
                  change.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {change.trend === 'up' ? '+' : ''}
                {change.value}%
              </span>
              <span className="text-xs text-muted-foreground">من الشهر الماضي</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
            colors.bg,
            colors.text
          )}
        >
          {icon}
        </div>
      </div>
      {chart && chart.data.length > 0 && (
        <div className="mt-4 h-[80px] w-full">
          {chart.type === 'line' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chart.data}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={`stat-area-${theme}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors[0]} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={chartColors[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartColors[0]}
                  fill={`url(#stat-area-${theme})`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {chart.type === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart.data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={chartColors[0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chart.type === 'pie' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chart.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={32}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chart.data.map((_, index) => (
                    <Cell key={index} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default StatCard;
