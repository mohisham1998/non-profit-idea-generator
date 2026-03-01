/**
 * Profile — صفحة الملف الشخصي (US8)
 * Displays consumption metrics: AI usage, quota, slide decks count (display only, no enforcement).
 */
import { motion } from 'framer-motion';
import { User, BarChart3, FileText, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function Profile() {
  const { user } = useAuth();
  const { data: overview, isLoading } = trpc.adminDashboard.getUsageOverview.useQuery();

  const currentUsd = overview?.currentUsageUsd ?? 0;
  const limitUsd = overview?.quotaLimitUsd ?? 50;
  const percent = limitUsd > 0 ? Math.min(100, (currentUsd / limitUsd) * 100) : 0;
  const totalDecks = overview?.totalDecks ?? 0;
  const totalIdeas = overview?.totalIdeas ?? 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-7 w-7 text-cyan-500" />
          الملف الشخصي
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          معلومات الحساب ومقاييس الاستخدام (للعرض فقط)
        </p>
      </div>

      {/* User info */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الحساب</CardTitle>
          <CardDescription>الاسم والبريد الإلكتروني</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-slate-900 dark:text-white">{user?.name || '—'}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email || '—'}</p>
        </CardContent>
      </Card>

      {/* Consumption metrics (US8) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            مقاييس الاستخدام
          </CardTitle>
          <CardDescription>
            استهلاك الذكاء الاصطناعي وعدد العروض والأفكار
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${currentUsd.toFixed(2)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    من ${limitUsd.toFixed(2)} (استهلاك الذكاء الاصطناعي)
                  </span>
                </div>
                <Progress value={percent} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <FileText className="h-8 w-8 text-cyan-500" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalDecks}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">عروض شرائح</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <FileText className="h-8 w-8 text-emerald-500" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalIdeas}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">أفكار مولدة</p>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
