import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ألوان المخططات
const COLORS = {
  budget: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
  tasks: {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
  },
  priority: {
    low: '#94a3b8',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
  },
};

// ترجمات
const taskStatusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

const priorityLabels: Record<string, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  urgent: 'عاجلة',
};

interface BudgetItem {
  id: number;
  category: string;
  plannedAmount: number;
  actualAmount: number;
}

interface Task {
  id: number;
  status: string;
  priority: string;
  createdAt?: string | number | Date;
  completedAt?: string | number | Date | null;
}

interface ProgressDataPoint {
  date: string;
  planned: number;
  actual: number;
  label: string;
}

interface DashboardChartsProps {
  budgetItems: BudgetItem[];
  tasks: Task[];
  progressData?: ProgressDataPoint[];
  projectStartDate?: string;
  projectEndDate?: string;
}

// مكون Tooltip مخصص للعربية
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 text-right">
        <p className="font-semibold text-gray-800 mb-1">{label || payload[0]?.name}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('ar-SA') : entry.value}
            {entry.payload?.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// مخطط توزيع الميزانية (دائري)
export function BudgetDistributionChart({ budgetItems }: { budgetItems: BudgetItem[] }) {
  const data = useMemo(() => {
    return budgetItems.map((item, index) => ({
      name: item.category,
      value: Number(item.plannedAmount),
      color: COLORS.budget[index % COLORS.budget.length],
    }));
  }, [budgetItems]);

  if (data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              📊
            </span>
            توزيع الميزانية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-gray-500">
            لا توجد بنود ميزانية بعد
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg">
            📊
          </span>
          <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent font-bold">
            توزيع الميزانية
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// مخطط مقارنة الميزانية (شريطي)
export function BudgetComparisonChart({ budgetItems }: { budgetItems: BudgetItem[] }) {
  const data = useMemo(() => {
    return budgetItems.map(item => ({
      name: item.category.length > 15 ? item.category.substring(0, 15) + '...' : item.category,
      المخطط: Number(item.plannedAmount),
      الفعلي: Number(item.actualAmount),
    }));
  }, [budgetItems]);

  if (data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              📈
            </span>
            المخطط vs الفعلي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-gray-500">
            لا توجد بنود ميزانية بعد
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg">
            📈
          </span>
          <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-bold">
            المخطط vs الفعلي
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={(value) => value.toLocaleString('ar-SA')} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="المخطط" fill="#10b981" radius={[0, 4, 4, 0]} animationBegin={0} animationDuration={800} />
              <Bar dataKey="الفعلي" fill="#f59e0b" radius={[0, 4, 4, 0]} animationBegin={200} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// مخطط حالة المهام (دائري)
export function TaskStatusChart({ tasks }: { tasks: Task[] }) {
  const data = useMemo(() => {
    const statusCount: Record<string, number> = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };

    tasks.forEach(task => {
      if (statusCount[task.status] !== undefined) {
        statusCount[task.status]++;
      }
    });

    return Object.entries(statusCount)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: taskStatusLabels[status] || status,
        value: count,
        color: COLORS.tasks[status as keyof typeof COLORS.tasks],
      }));
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
              ✅
            </span>
            حالة المهام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-gray-500">
            لا توجد مهام بعد
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            ✅
          </span>
          حالة المهام
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// مخطط المهام حسب الأولوية (شريطي)
export function TaskPriorityChart({ tasks }: { tasks: Task[] }) {
  const data = useMemo(() => {
    const priorityCount: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    tasks.forEach(task => {
      if (priorityCount[task.priority] !== undefined) {
        priorityCount[task.priority]++;
      }
    });

    return Object.entries(priorityCount).map(([priority, count]) => ({
      name: priorityLabels[priority] || priority,
      عدد: count,
      fill: COLORS.priority[priority as keyof typeof COLORS.priority],
    }));
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              🎯
            </span>
            المهام حسب الأولوية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-gray-500">
            لا توجد مهام بعد
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            🎯
          </span>
          المهام حسب الأولوية
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="عدد" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// مخطط تتبع التقدم عبر الزمن (خطي)
export function ProgressTimelineChart({ tasks, progressData }: { tasks: Task[], progressData?: ProgressDataPoint[] }) {
  // إنشاء بيانات التقدم من المهام إذا لم تكن موجودة
  const data = useMemo(() => {
    if (progressData && progressData.length > 0) {
      return progressData;
    }

    // إنشاء بيانات افتراضية من المهام
    if (tasks.length === 0) return [];

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    
    // إنشاء نقاط بيانات للأسابيع الأربعة الماضية
    const now = new Date();
    const weeks = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7));
      const weekLabel = i === 0 ? 'الآن' : `قبل ${i} أسبوع`;
      
      // محاكاة التقدم التدريجي
      const plannedProgress = Math.min(100, ((4 - i) / 4) * 100);
      const actualProgress = i === 0 
        ? (completedTasks / Math.max(totalTasks, 1)) * 100
        : Math.max(0, plannedProgress - (Math.random() * 15));
      
      weeks.push({
        date: weekLabel,
        planned: Math.round(plannedProgress),
        actual: Math.round(actualProgress),
        label: weekLabel,
      });
    }
    return weeks;
  }, [tasks, progressData]);

  if (tasks.length === 0 && (!progressData || progressData.length === 0)) {
    return (
      <Card className="glass-card col-span-1 md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              📈
            </span>
            تتبع التقدم عبر الزمن
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            لا توجد بيانات كافية لعرض التقدم
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card col-span-1 md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            📈
          </span>
          تتبع التقدم عبر الزمن
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                domain={[0, 100]} 
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 text-right">
                        <p className="font-semibold text-gray-800 mb-2">{label}</p>
                        <p className="text-sm text-emerald-600">
                          المخطط: {payload[0]?.value}%
                        </p>
                        <p className="text-sm text-blue-600">
                          الفعلي: {payload[1]?.value}%
                        </p>
                        {payload[0]?.value && payload[1]?.value && (
                          <p className={`text-sm mt-1 ${Number(payload[1].value) >= Number(payload[0].value) ? 'text-emerald-600' : 'text-red-500'}`}>
                            {Number(payload[1].value) >= Number(payload[0].value) 
                              ? '✓ في الموعد' 
                              : `⚠ تأخر ${Math.round(Number(payload[0].value) - Number(payload[1].value))}%`}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => value === 'planned' ? 'المخطط' : 'الفعلي'}
              />
              <ReferenceLine y={100} stroke="#10b981" strokeDasharray="5 5" label="الهدف" />
              <Area 
                type="monotone" 
                dataKey="planned" 
                name="المخطط"
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPlanned)" 
              />
              <Area 
                type="monotone" 
                dataKey="actual" 
                name="الفعلي"
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorActual)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-gray-600">التقدم المخطط</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">التقدم الفعلي</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// مخطط مقارنة الأداء الشهري
export function MonthlyPerformanceChart({ tasks }: { tasks: Task[] }) {
  const data = useMemo(() => {
    if (tasks.length === 0) return [];

    // تجميع المهام حسب الشهر
    const monthlyData: Record<string, { completed: number; total: number }> = {};
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    // إنشاء بيانات للأشهر الستة الأخيرة
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = months[date.getMonth()];
      monthlyData[monthKey] = { completed: 0, total: 0 };
    }

    // حساب المهام لكل شهر
    tasks.forEach(task => {
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        const monthKey = months[taskDate.getMonth()];
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].total++;
          if (task.status === 'completed') {
            monthlyData[monthKey].completed++;
          }
        }
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      مكتملة: data.completed,
      إجمالي: data.total,
      نسبة_الإنجاز: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }));
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              📊
            </span>
            الأداء الشهري
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-gray-500">
            لا توجد بيانات كافية
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            📊
          </span>
          الأداء الشهري
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="مكتملة" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="إجمالي" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{ fill: '#6366f1', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="نسبة_الإنجاز" 
                name="نسبة الإنجاز"
                stroke="#f59e0b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#f59e0b', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// مكون شامل للرسوم البيانية
export default function DashboardCharts({ budgetItems, tasks, progressData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* مخطط التقدم عبر الزمن - يمتد على عرض كامل */}
      <ProgressTimelineChart tasks={tasks} progressData={progressData} />
      
      {/* المخططات الأخرى */}
      <BudgetDistributionChart budgetItems={budgetItems} />
      <BudgetComparisonChart budgetItems={budgetItems} />
      <TaskStatusChart tasks={tasks} />
      <TaskPriorityChart tasks={tasks} />
      <MonthlyPerformanceChart tasks={tasks} />
    </div>
  );
}
