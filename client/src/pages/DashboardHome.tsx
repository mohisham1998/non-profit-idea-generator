/**
 * DashboardHome — Analytical overview for Admin Dashboard
 *
 * Displays:
 * - StatCard grid (Total Ideas, Total Decks, Usage, Quota)
 * - AreaChart for usage trend (ideas vs decks)
 * - DataTable for recent projects/decks
 * - Responsive breakpoints
 */

import { motion } from 'framer-motion';
import {
  Users,
  Library,
  DollarSign,
  TrendingUp,
  Pencil,
  Eye,
  Loader2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { StatCard } from '@/components/StatCard';
import { AreaChart } from '@/components/AreaChart';
import { DataTable } from '@/components/DataTable';
import { useLocation } from 'wouter';
import { useDashboardStore } from '@/store/useStore';
import { useEffect } from 'react';

export default function DashboardHome() {
  const [, setLocation] = useLocation();
  const { data: overview, isLoading, error } = trpc.adminDashboard.getUsageOverview.useQuery();
  const updateUsageStats = useDashboardStore((s) => s.updateUsageStats);
  const updateDashboardStats = useDashboardStore((s) => s.updateDashboardStats);

  useEffect(() => {
    if (overview) {
      updateUsageStats({
        currentUsage: overview.currentUsageUsd,
        quotaLimit: overview.quotaLimitUsd,
      });
      updateDashboardStats({
        totalIdeas: overview.totalIdeas,
        totalDecks: overview.totalDecks,
        recentActions: overview.recentActions.map((a) => ({
          id: a.id,
          type: a.type === 'deck' ? 'create' : 'create',
          title: a.title,
          timestamp: new Date(a.timestamp),
        })),
      });
    }
  }, [overview, updateUsageStats, updateDashboardStats]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-destructive">
        <p>فشل تحميل البيانات: {error.message}</p>
      </div>
    );
  }

  const remainingPercent = overview
    ? Math.max(0, 100 - (overview.currentUsageUsd / overview.quotaLimitUsd) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground">نظرة عامة</h1>
        <p className="text-muted-foreground mt-1">
          إحصائيات الاستخدام والعروض التقديمية الأخيرة
        </p>
      </motion.div>

      {/* StatCards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-6 w-6" />}
          title="إجمالي الأفكار"
          value={isLoading ? '...' : overview?.totalIdeas ?? 0}
          theme="blue"
        />
        <StatCard
          icon={<Library className="h-6 w-6" />}
          title="عروض الشرائح"
          value={isLoading ? '...' : overview?.totalDecks ?? 0}
          theme="green"
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6" />}
          title="الاستخدام (دولار)"
          value={isLoading ? '...' : `$${overview?.currentUsageUsd ?? 0}`}
          theme="purple"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          title="المتبقي من الحصة"
          value={isLoading ? '...' : `${remainingPercent.toFixed(0)}%`}
          change={
            overview
              ? {
                  value: Math.round(
                    (overview.currentUsageUsd / overview.quotaLimitUsd) * 100
                  ),
                  trend: 'down',
                }
              : undefined
          }
          theme="orange"
        />
      </div>

      {/* AreaChart - Usage Trend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold mb-4">اتجاه النشاط</h2>
        {isLoading ? (
          <div className="h-[280px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : overview?.usageTrend && overview.usageTrend.length > 0 ? (
          <AreaChart
            data={overview.usageTrend}
            series={[
              { dataKey: 'ideas', name: 'أفكار', color: '#3b82f6' },
              { dataKey: 'decks', name: 'عروض', color: '#10b981' },
            ]}
            height={280}
            showLegend
            showGrid
          />
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            لا توجد بيانات لعرضها
          </div>
        )}
      </motion.div>

      {/* DataTable - Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold mb-4">أحدث العروض</h2>
        <DataTable
          columns={[
            { key: 'id', label: 'الرمز', className: 'font-mono text-xs' },
            { key: 'title', label: 'العنوان', sortable: true },
            { key: 'slideCount', label: 'الشرائح' },
            { key: 'status', label: 'الحالة' },
            {
              key: 'createdAt',
              label: 'التاريخ',
              render: (v) =>
                v ? new Date(v as string).toLocaleDateString('ar-SA') : '—',
            },
          ]}
          data={
            overview?.recentDecks?.map((d) => ({
              id: d.id,
              title: d.title,
              slideCount: d.slideCount,
              status: d.status,
              createdAt: d.createdAt,
            })) ?? []
          }
          actions={[
            {
              icon: Eye,
              label: 'عرض',
              onClick: (row) => setLocation(`/home?deck=${row.id}`),
            },
            {
              icon: Pencil,
              label: 'تعديل',
              onClick: (row) => setLocation(`/home?deck=${row.id}`),
            },
          ]}
          emptyMessage="لا توجد عروض شرائح بعد"
        />
      </motion.div>
    </div>
  );
}
