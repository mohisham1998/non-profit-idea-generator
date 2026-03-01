/**
 * UsageQuota — الاستخدام والحصة
 *
 * Displays total AI token cost (USD) vs plan limit and image storage usage.
 */

import { motion } from 'framer-motion';
import { BarChart3, Loader2, AlertTriangle, HardDrive } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useImageStorage } from '@/hooks/useImageStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const DEFAULT_LIMIT = 50;

export default function UsageQuota() {
  const { data, isLoading, error } = trpc.adminDashboard.getUsageQuota.useQuery();
  const { usedBytes, limitBytes, usedPercentage, formatBytes } = useImageStorage();

  const currentUsd = data?.currentUsageUsd ?? 0;
  const limitUsd = data?.quotaLimitUsd ?? DEFAULT_LIMIT;
  const percent = limitUsd > 0 ? Math.min(100, (currentUsd / limitUsd) * 100) : 0;
  const remaining = Math.max(0, limitUsd - currentUsd);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-cyan-500" />
          الاستخدام والحصة
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          تتبع استهلاك الذكاء الاصطناعي والحد المتبقي لحصتك الشهرية.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-amber-800 dark:text-amber-200">تعذر جلب بيانات الاستخدام</p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{error.message}</p>
          </div>
        </motion.div>
      )}

      {isLoading && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            <p className="text-slate-600 dark:text-slate-400">جاري جلب البيانات...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>استهلاك الذكاء الاصطناعي</CardTitle>
              <CardDescription>
                إجمالي تكلفة الرموز (بالدولار) للحصّة الحالية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    ${currentUsd.toFixed(2)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    من ${limitUsd.toFixed(2)} مستخدم
                  </span>
                </div>
                <div
                  className={cn(
                    'text-sm font-medium px-3 py-1 rounded-full',
                    percent >= 90
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : percent >= 70
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                  )}
                >
                  {percent >= 90 ? 'شبه مُستنفذ' : percent >= 70 ? 'استخدام متوسط' : 'متاح'}
                </div>
              </div>

              <div className="space-y-2">
                <Progress value={percent} className="h-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  المتبقي: ${remaining.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                تخزين الصور
              </CardTitle>
              <CardDescription>
                مساحة تخزين الصور المولدة بالذكاء الاصطناعي (حد أقصى 10 جيجابايت). يمكن مراقبة الاستخدام هنا.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatBytes(usedBytes)} ج.ب
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    من {formatBytes(limitBytes)} ج.ب
                  </span>
                </div>
                <div
                  className={cn(
                    'text-sm font-medium px-3 py-1 rounded-full',
                    usedPercentage >= 90
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : usedPercentage >= 70
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                  )}
                >
                  {usedPercentage >= 90 ? 'شبه مُستنفذ' : usedPercentage >= 70 ? 'استخدام متوسط' : 'متاح'}
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={Math.min(100, usedPercentage)} className="h-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  المتبقي: {formatBytes(Math.max(0, limitBytes - usedBytes))} ج.ب
                </p>
                {usedPercentage >= 100 && (
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    وصلت للحد الأقصى. لن تتمكن من إنشاء صور جديدة حتى تحذف بعض الصور.
                  </p>
                )}
                {usedPercentage >= 90 && usedPercentage < 100 && (
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    اقتربت من الحد الأقصى. يُنصح بحذف الصور غير المستخدمة.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
