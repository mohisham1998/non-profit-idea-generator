import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Lightbulb, FolderKanban, MessageSquare, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Award, Target, AlertTriangle, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import Navbar from '@/components/Navbar';

// ألوان المخططات
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const STATUS_COLORS = {
  planning: '#3b82f6',
  inProgress: '#f59e0b',
  completed: '#10b981',
  onHold: '#8b5cf6',
  cancelled: '#ef4444',
};

export default function AdminAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const [timeRange, setTimeRange] = useState<string>('30');

  // جلب جميع الإحصائيات
  const { data: analytics, isLoading, error, refetch } = trpc.admin.getFullAnalytics.useQuery(
    { days: parseInt(timeRange) },
    { enabled: user?.role === 'admin' }
  );

  // التحقق من التحميل
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // التحقق من صلاحية المسؤول
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">غير مصرح</CardTitle>
              <CardDescription>
                هذه الصفحة متاحة للمسؤولين فقط
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="ml-2 h-4 w-4" />
                  العودة للرئيسية
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600">جاري تحميل الإحصائيات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">خطأ في التحميل</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => refetch()} className="w-full">
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { overview, activity, topUsers, featureUsage, projectStatus, tasksStats, growthRates } = analytics || {};

  // تحضير بيانات المخططات
  const projectStatusData = projectStatus ? [
    { name: 'تخطيط', value: projectStatus.planning, color: STATUS_COLORS.planning },
    { name: 'قيد التنفيذ', value: projectStatus.inProgress, color: STATUS_COLORS.inProgress },
    { name: 'مكتمل', value: projectStatus.completed, color: STATUS_COLORS.completed },
    { name: 'معلق', value: projectStatus.onHold, color: STATUS_COLORS.onHold },
    { name: 'ملغي', value: projectStatus.cancelled, color: STATUS_COLORS.cancelled },
  ].filter(item => item.value > 0) : [];

  const featureUsageData = featureUsage ? [
    { name: 'توليد الأفكار', value: featureUsage.ideaGeneration },
    { name: 'المؤشرات', value: featureUsage.kpisGeneration },
    { name: 'الإطار المنطقي', value: featureUsage.logFrameGeneration },
    { name: 'PMDPro', value: featureUsage.pmdproGeneration },
    { name: 'التفكير التصميمي', value: featureUsage.designThinking },
    { name: 'التقييم', value: featureUsage.evaluation },
  ] : [];

  const tasksStatusData = tasksStats ? [
    { name: 'قيد الانتظار', value: tasksStats.pending, color: '#3b82f6' },
    { name: 'جاري', value: tasksStats.inProgress, color: '#f59e0b' },
    { name: 'مكتمل', value: tasksStats.completed, color: '#10b981' },
    { name: 'متأخر', value: tasksStats.overdue, color: '#ef4444' },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50" dir="rtl">
      <Navbar />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">لوحة الإحصائيات</h1>
              <p className="text-sm text-gray-500">تحليلات شاملة لأداء النظام والمستخدمين</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الفترة الزمنية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">آخر 7 أيام</SelectItem>
                <SelectItem value="14">آخر 14 يوم</SelectItem>
                <SelectItem value="30">آخر 30 يوم</SelectItem>
                <SelectItem value="60">آخر 60 يوم</SelectItem>
                <SelectItem value="90">آخر 90 يوم</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}>
              تحديث
            </Button>
          </div>
        </div>

        {/* بطاقات الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="إجمالي المستخدمين"
            value={overview?.totalUsers || 0}
            icon={<Users className="h-5 w-5" />}
            trend={growthRates?.usersGrowth}
            subtitle={`${overview?.activeUsers || 0} نشط`}
            color="blue"
          />
          <StatCard
            title="إجمالي الأفكار"
            value={overview?.totalIdeas || 0}
            icon={<Lightbulb className="h-5 w-5" />}
            trend={growthRates?.ideasGrowth}
            subtitle={`${growthRates?.thisMonthIdeas || 0} هذا الشهر`}
            color="emerald"
          />
          <StatCard
            title="المشاريع"
            value={overview?.totalProjects || 0}
            icon={<FolderKanban className="h-5 w-5" />}
            subtitle={`${overview?.completedProjects || 0} مكتمل`}
            color="amber"
          />
          <StatCard
            title="المحادثات"
            value={overview?.totalConversations || 0}
            icon={<MessageSquare className="h-5 w-5" />}
            subtitle={`${overview?.totalMessages || 0} رسالة`}
            color="purple"
          />
        </div>

        {/* التبويبات */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <PieChart className="h-4 w-4" />
              الميزات
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderKanban className="h-4 w-4" />
              المشاريع
            </TabsTrigger>
          </TabsList>

          {/* تبويب النظرة العامة */}
          <TabsContent value="overview" className="space-y-6">
            {/* مخطط النشاط عبر الزمن */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  نشاط النظام عبر الزمن
                </CardTitle>
                <CardDescription>
                  تسجيلات جديدة وأفكار مولدة خلال آخر {timeRange} يوم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activity || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('ar-SA')}
                        formatter={(value: number, name: string) => [value, name === 'registrations' ? 'تسجيلات' : name === 'ideas' ? 'أفكار' : 'تسجيلات دخول']}
                      />
                      <Legend 
                        formatter={(value) => value === 'registrations' ? 'تسجيلات جديدة' : value === 'ideas' ? 'أفكار مولدة' : 'تسجيلات دخول'}
                      />
                      <Area type="monotone" dataKey="registrations" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="ideas" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="logins" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* معدلات النمو */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">نمو المستخدمين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{growthRates?.thisMonthUsers || 0}</p>
                      <p className="text-xs text-gray-500">هذا الشهر</p>
                    </div>
                    <GrowthBadge value={growthRates?.usersGrowth || 0} />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    مقارنة بـ {growthRates?.lastMonthUsers || 0} الشهر الماضي
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">نمو الأفكار</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{growthRates?.thisMonthIdeas || 0}</p>
                      <p className="text-xs text-gray-500">هذا الشهر</p>
                    </div>
                    <GrowthBadge value={growthRates?.ideasGrowth || 0} />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    مقارنة بـ {growthRates?.lastMonthIdeas || 0} الشهر الماضي
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">المستخدمين المعلقين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{overview?.pendingUsers || 0}</p>
                      <p className="text-xs text-gray-500">بانتظار الموافقة</p>
                    </div>
                    {(overview?.pendingUsers || 0) > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        يحتاج مراجعة
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب المستخدمين */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  أفضل المستخدمين أداءً
                </CardTitle>
                <CardDescription>
                  المستخدمين الأكثر نشاطاً في توليد الأفكار والمشاريع
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">#</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">المستخدم</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">المؤسسة</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الأفكار</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">المشاريع</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">المكتمل</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">آخر نشاط</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {topUsers?.map((user: any, index: number) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {index < 3 ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${
                                index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                              }`}>
                                {index + 1}
                              </span>
                            ) : (
                              <span className="text-gray-500">{index + 1}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {user.organizationName || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                              {user.ideasCount}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                              {user.projectsCount}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                              {user.completedProjectsCount}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {user.lastActive ? new Date(user.lastActive).toLocaleDateString('ar-SA') : '-'}
                          </td>
                        </tr>
                      ))}
                      {(!topUsers || topUsers.length === 0) && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            لا توجد بيانات متاحة
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الميزات */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* مخطط استخدام الميزات */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    استخدام الميزات
                  </CardTitle>
                  <CardDescription>
                    توزيع استخدام الميزات المختلفة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={featureUsageData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* إحصائيات المحادثات */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    إحصائيات المحادثات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-purple-700">{featureUsage?.chatUsage || 0}</p>
                      <p className="text-sm text-purple-600">محادثة</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-blue-700">{featureUsage?.totalMessages || 0}</p>
                      <p className="text-sm text-blue-600">رسالة</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">متوسط الرسائل لكل محادثة</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {featureUsage?.chatUsage ? Math.round((featureUsage.totalMessages || 0) / featureUsage.chatUsage) : 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب المشاريع */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* مخطط حالة المشاريع */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-amber-500" />
                    حالة المشاريع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {projectStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={projectStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {projectStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        لا توجد مشاريع بعد
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* إحصائيات المهام */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    إحصائيات المهام
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {tasksStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={tasksStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {tasksStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        لا توجد مهام بعد
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ملخص المهام */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">قيد الانتظار</p>
                      <p className="text-2xl font-bold text-blue-700">{tasksStats?.pending || 0}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 border-amber-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600">جاري التنفيذ</p>
                      <p className="text-2xl font-bold text-amber-700">{tasksStats?.inProgress || 0}</p>
                    </div>
                    <Activity className="h-8 w-8 text-amber-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-600">مكتمل</p>
                      <p className="text-2xl font-bold text-emerald-700">{tasksStats?.completed || 0}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600">متأخر</p>
                      <p className="text-2xl font-bold text-red-700">{tasksStats?.overdue || 0}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// مكون بطاقة الإحصائية
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'red';
}

function StatCard({ title, value, icon, trend, subtitle, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  const iconBgClasses = {
    blue: 'bg-blue-100',
    emerald: 'bg-emerald-100',
    amber: 'bg-amber-100',
    purple: 'bg-purple-100',
    red: 'bg-red-100',
  };

  return (
    <Card className={`${colorClasses[color]} border`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-80">{title}</p>
            <p className="text-3xl font-bold mt-1">{value.toLocaleString('ar-SA')}</p>
            {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2 rounded-lg ${iconBgClasses[color]}`}>
            {icon}
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-3 pt-3 border-t border-current/10">
            <GrowthBadge value={trend} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// مكون شارة النمو
function GrowthBadge({ value }: { value: number }) {
  if (value === 0) {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
        <span className="ml-1">—</span>
        لا تغيير
      </Badge>
    );
  }

  const isPositive = value > 0;
  return (
    <Badge 
      variant="outline" 
      className={isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3 ml-1" />
      ) : (
        <TrendingDown className="h-3 w-3 ml-1" />
      )}
      {isPositive ? '+' : ''}{value}%
    </Badge>
  );
}
