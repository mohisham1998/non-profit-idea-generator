import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  Target,
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  ListTodo,
  PieChart,
  Activity,
  Users,
  Loader2,
  GripVertical,
  RotateCcw,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Navbar from '@/components/Navbar';
import DashboardCharts from '@/components/DashboardCharts';
import { SortableTabTrigger } from '@/components/SortableTabTrigger';

// أنواع البيانات
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
type RiskLikelihood = 'low' | 'medium' | 'high';
type RiskStatus = 'identified' | 'mitigated' | 'occurred' | 'closed';

// ترجمات الحالات
const statusLabels: Record<ProjectStatus, string> = {
  planning: 'التخطيط',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  on_hold: 'معلق',
  cancelled: 'ملغي',
};

const taskStatusLabels: Record<TaskStatus, string> = {
  pending: 'قيد الانتظار',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  urgent: 'عاجلة',
};

const severityLabels: Record<RiskSeverity, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالي',
  critical: 'حرج',
};

const likelihoodLabels: Record<RiskLikelihood, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالي',
};

const riskStatusLabels: Record<RiskStatus, string> = {
  identified: 'محدد',
  mitigated: 'تم التخفيف',
  occurred: 'حدث',
  closed: 'مغلق',
};

// ألوان الحالات
const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  on_hold: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const severityColors: Record<RiskSeverity, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export default function ProjectDashboard() {
  const params = useParams();
  const ideaId = parseInt(params.id || '0');
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  // جلب بيانات الفكرة
  const { data: idea, isLoading: ideaLoading } = trpc.ideas.getById.useQuery(
    { id: ideaId },
    { enabled: !!ideaId && !!user }
  );

  // جلب بيانات اللوحة
  const { data: dashboard, isLoading: dashboardLoading } = trpc.dashboard.getFullDashboard.useQuery(
    { ideaId },
    { enabled: !!ideaId && !!user }
  );

  // Mutations
  const updateTrackingMutation = trpc.dashboard.updateTracking.useMutation({
    onSuccess: () => {
      utils.dashboard.getFullDashboard.invalidate({ ideaId });
      toast.success('تم تحديث حالة المشروع');
    },
  });

  const createTaskMutation = trpc.dashboard.createTask.useMutation({
    onSuccess: () => {
      utils.dashboard.getFullDashboard.invalidate({ ideaId });
      toast.success('تم إضافة المهمة');
      setNewTask({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '' });
      setShowTaskDialog(false);
    },
  });

  const updateTaskMutation = trpc.dashboard.updateTask.useMutation({
    onSuccess: () => {
      utils.dashboard.getFullDashboard.invalidate({ ideaId });
      toast.success('تم تحديث المهمة');
    },
  });

  const deleteTaskMutation = trpc.dashboard.deleteTask.useMutation({
    onSuccess: () => {
      utils.dashboard.getFullDashboard.invalidate({ ideaId });
      toast.success('تم حذف المهمة');
    },
  });

  const createBudgetMutation = trpc.dashboard.createBudgetItem.useMutation({
    onSuccess: () => {
      utils.dashboard.getFullDashboard.invalidate({ ideaId });
      toast.success('تم إضافة بند الميزانية');
      setNewBudget({ category: '', description: '', plannedAmount: 0, actualAmount: 0 });
      setShowBudgetDialog(false);
    },
  });

  const updateBudgetMutation = trpc.dashboard.updateBudgetItem.useMutation({
    onSuccess: () => {
      utils.dashboard.getFullDashboard.invalidate({ ideaId });
      toast.success('تم تحديث بند الميزانية');
    },
  });

  const deleteBudgetMutation = trpc.dashboard.deleteBudgetItem.useMutation({
    onSuccess: () => {
      utils.dashboard.getFullDashboard.invalidate({ ideaId });
      toast.success('تم حذف بند الميزانية');
    },
  });

  const createKpiMutation = trpc.dashboard.createKpi.useMutation({
    onSuccess: () => {
      utils.dashboard.getFullDashboard.invalidate({ ideaId });
      toast.success('تم إضافة المؤشر');
      setNewKpi({ kpiName: '', targetValue: '', actualValue: '', unit: '' });
      setShowKpiDialog(false);
    },
  });

  const updateKpiMutation = trpc.dashboard.updateKpi.useMutation({
    onSuccess: () => {
      utils.dashboard.getFullDashboard.invalidate({ ideaId });
      toast.success('تم تحديث المؤشر');
    },
  });

  const deleteKpiMutation = trpc.dashboard.deleteKpi.useMutation({
    onSuccess: () => {
      utils.dashboard.getFullDashboard.invalidate({ ideaId });
      toast.success('تم حذف المؤشر');
    },
  });

  const createRiskMutation = trpc.dashboard.createRisk.useMutation({
    onSuccess: () => {
      utils.dashboard.getFullDashboard.invalidate({ ideaId });
      toast.success('تم إضافة الخطر');
      setNewRisk({ riskDescription: '', severity: 'medium', likelihood: 'medium', mitigationStrategy: '', owner: '' });
      setShowRiskDialog(false);
    },
  });

  const updateRiskMutation = trpc.dashboard.updateRisk.useMutation({
    onSuccess: () => {
      utils.dashboard.getFullDashboard.invalidate({ ideaId });
      toast.success('تم تحديث الخطر');
    },
  });

  const deleteRiskMutation = trpc.dashboard.deleteRisk.useMutation({
    onSuccess: () => {
      utils.dashboard.getFullDashboard.invalidate({ ideaId });
      toast.success('تم حذف الخطر');
    },
  });

  // تخصيص لوحة المتابعة
  const [tabsOrder, setTabsOrder] = useState<string[]>(['tasks', 'budget', 'kpis', 'risks']);
  const [activeTab, setActiveTab] = useState('tasks');

  // جلب تخصيص لوحة المتابعة
  const { data: layoutData } = trpc.layout.getLayout.useQuery();
  
  // تحديث ترتيب التبويبات عند تحميل البيانات
  useEffect(() => {
    if (layoutData?.tabsOrder) {
      setTabsOrder(layoutData.tabsOrder);
    }
  }, [layoutData]);

  const saveLayoutMutation = trpc.layout.saveLayout.useMutation({
    onSuccess: () => {
      toast.success('تم حفظ ترتيب الأقسام');
    },
  });

  const resetLayoutMutation = trpc.layout.resetLayout.useMutation({
    onSuccess: (data) => {
      if (data?.tabsOrder) {
        setTabsOrder(data.tabsOrder);
        toast.success('تم إعادة تعيين ترتيب الأقسام');
      }
    },
  });

  // معالجات السحب والإفلات
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTabsOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // حفظ الترتيب الجديد
        saveLayoutMutation.mutate({ tabsOrder: newOrder });
        
        return newOrder;
      });
    }
  };

  // حالات النماذج
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showKpiDialog, setShowKpiDialog] = useState(false);
  const [showRiskDialog, setShowRiskDialog] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assignee: '',
    dueDate: '',
  });

  const [newBudget, setNewBudget] = useState({
    category: '',
    description: '',
    plannedAmount: 0,
    actualAmount: 0,
  });

  const [newKpi, setNewKpi] = useState({
    kpiName: '',
    targetValue: '',
    actualValue: '',
    unit: '',
  });

  const [newRisk, setNewRisk] = useState({
    riskDescription: '',
    severity: 'medium' as RiskSeverity,
    likelihood: 'medium' as RiskLikelihood,
    mitigationStrategy: '',
    owner: '',
  });

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || ideaLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-primary/5">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (!idea || !dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-primary/5">
        <Navbar />
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">لم يتم العثور على المشروع</h1>
          <Button onClick={() => setLocation('/history')} className="mt-4">
            العودة للسجل
          </Button>
        </div>
      </div>
    );
  }

  const { tracking, tasks, budgetItems, kpis, risks } = dashboard;

  // حسابات الإحصائيات
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalPlannedBudget = budgetItems.reduce((sum, item) => sum + Number(item.plannedAmount), 0);
  const totalActualBudget = budgetItems.reduce((sum, item) => sum + Number(item.actualAmount), 0);
  const budgetUsage = totalPlannedBudget > 0 ? Math.round((totalActualBudget / totalPlannedBudget) * 100) : 0;

  const activeRisks = risks.filter(r => r.status === 'identified' || r.status === 'occurred').length;
  const highRisks = risks.filter(r => r.severity === 'high' || r.severity === 'critical').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-primary/5">
      <Navbar />
      
      <div className="container py-8 max-w-7xl mx-auto">
        {/* رأس الصفحة المحسن */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/history')}
            className="mb-4 text-gray-600 hover:text-gray-800 hover:bg-white/50 transition-all"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للسجل
          </Button>
          
          {/* بطاقة العنوان الزجاجية */}
          <div className="glass-card p-6 rounded-2xl mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                      لوحة متابعة المشروع
                    </h1>
                    <p className="text-gray-600">
                      {idea.selectedName || idea.idea?.substring(0, 50) || 'مشروع بدون اسم'}
                    </p>
                  </div>
                </div>
              </div>
            
            <div className="flex items-center gap-3">
                <Select
                  value={tracking.status}
                  onValueChange={(value: ProjectStatus) => {
                    updateTrackingMutation.mutate({
                      trackingId: tracking.id,
                      status: value,
                    });
                  }}
                >
                  <SelectTrigger className="w-40 bg-white/70 border-emerald-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Badge className={`${statusColors[tracking.status as ProjectStatus]} px-4 py-2 text-sm font-medium`}>
                  {statusLabels[tracking.status as ProjectStatus]}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات المحسنة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    التقدم العام
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">{tracking.overallProgress}%</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {tracking.overallProgress >= 75 ? 'ممتاز' : tracking.overallProgress >= 50 ? 'جيد' : 'يحتاج تحسين'}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-slow">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
              <Progress value={tracking.overallProgress} className="mt-4 h-2" />
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    {taskProgress === 100 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : taskProgress >= 50 ? (
                      <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    )}
                    المهام المكتملة
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{completedTasks}/{totalTasks}</p>
                  <p className="text-xs text-gray-400 mt-1">{taskProgress}% منجز</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ListTodo className="w-7 h-7 text-white" />
                </div>
              </div>
              <Progress value={taskProgress} className="mt-4 h-2" />
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${budgetUsage > 90 ? 'bg-gradient-to-r from-red-400 to-red-600' : budgetUsage > 70 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gradient-to-r from-green-400 to-green-600'}`}></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    {budgetUsage > 90 ? (
                      <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                    ) : budgetUsage > 70 ? (
                      <Clock className="w-4 h-4 text-orange-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    استخدام الميزانية
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">{budgetUsage}%</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {totalActualBudget.toLocaleString('ar-SA')} من {totalPlannedBudget.toLocaleString('ar-SA')} ريال
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
              <Progress value={budgetUsage} className="mt-4 h-2" />
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${highRisks > 0 ? 'bg-gradient-to-r from-red-400 to-red-600 animate-pulse' : activeRisks > 0 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gradient-to-r from-green-400 to-green-600'}`}></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    {highRisks > 0 ? (
                      <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                    ) : activeRisks > 0 ? (
                      <Clock className="w-4 h-4 text-orange-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    المخاطر النشطة
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">{activeRisks}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {highRisks > 0 ? `${highRisks} عالية الخطورة` : 'لا توجد مخاطر عالية'}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية المحسنة */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              الرسوم البيانية والتحليلات
            </h2>
          </div>
          <DashboardCharts budgetItems={budgetItems} tasks={tasks} />
        </div>

        {/* التبويبات القابلة للسحب والإفلات */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">أقسام لوحة المتابعة</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => resetLayoutMutation.mutate()}
            disabled={resetLayoutMutation.isPending}
          >
            <RotateCcw className="w-4 h-4 ml-2" />
            إعادة الترتيب الافتراضي
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tabsOrder}
              strategy={horizontalListSortingStrategy}
            >
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
                {tabsOrder.map((tabId) => {
                  const tabConfig = {
                    tasks: { icon: <ListTodo className="w-4 h-4" />, label: 'المهام' },
                    budget: { icon: <DollarSign className="w-4 h-4" />, label: 'الميزانية' },
                    kpis: { icon: <Target className="w-4 h-4" />, label: 'المؤشرات' },
                    risks: { icon: <AlertTriangle className="w-4 h-4" />, label: 'المخاطر' },
                  }[tabId];

                  if (!tabConfig) return null;

                  return (
                    <SortableTabTrigger
                      key={tabId}
                      id={tabId}
                      value={tabId}
                      icon={tabConfig.icon}
                      label={tabConfig.label}
                    />
                  );
                })}
              </TabsList>
            </SortableContext>
          </DndContext>

          {/* تبويب المهام */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>المهام</CardTitle>
                  <CardDescription>إدارة مهام المشروع</CardDescription>
                </div>
                <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة مهمة
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة مهمة جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="عنوان المهمة"
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                      />
                      <Textarea
                        placeholder="وصف المهمة (اختياري)"
                        value={newTask.description}
                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                      />
                      <Select
                        value={newTask.priority}
                        onValueChange={(value: TaskPriority) => setNewTask({ ...newTask, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="الأولوية" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(priorityLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="المسؤول (اختياري)"
                        value={newTask.assignee}
                        onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                      />
                      <Input
                        type="date"
                        value={newTask.dueDate}
                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          createTaskMutation.mutate({
                            trackingId: tracking.id,
                            title: newTask.title,
                            description: newTask.description || undefined,
                            priority: newTask.priority,
                            assignee: newTask.assignee || undefined,
                            dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
                          });
                        }}
                        disabled={!newTask.title || createTaskMutation.isPending}
                      >
                        {createTaskMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إضافة'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد مهام بعد</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map(task => {
                      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                      const isDueSoon = task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && task.status !== 'completed';
                      
                      return (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all border-r-4 ${
                          task.status === 'completed' 
                            ? 'bg-green-50 border-green-500' 
                            : isOverdue 
                            ? 'bg-red-50 border-red-500 animate-pulse' 
                            : isDueSoon 
                            ? 'bg-orange-50 border-orange-500' 
                            : 'bg-gray-50 border-gray-300'
                        } hover:shadow-md`}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              updateTaskMutation.mutate({
                                taskId: task.id,
                                status: task.status === 'completed' ? 'pending' : 'completed',
                                completedAt: task.status === 'completed' ? null : new Date(),
                              });
                            }}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              task.status === 'completed'
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-gray-300 hover:border-emerald-500'
                            }`}
                          >
                            {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <div>
                            <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-sm text-gray-500">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={priorityColors[task.priority as TaskPriority]}>
                                {priorityLabels[task.priority as TaskPriority]}
                              </Badge>
                              {task.assignee && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {task.assignee}
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTaskMutation.mutate({ taskId: task.id })}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الميزانية */}
          <TabsContent value="budget">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>الميزانية</CardTitle>
                  <CardDescription>
                    المخطط: {totalPlannedBudget.toLocaleString()} ريال | المصروف: {totalActualBudget.toLocaleString()} ريال
                  </CardDescription>
                </div>
                <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة بند
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة بند ميزانية</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="الفئة (مثال: رواتب، معدات، تدريب)"
                        value={newBudget.category}
                        onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}
                      />
                      <Textarea
                        placeholder="الوصف (اختياري)"
                        value={newBudget.description}
                        onChange={e => setNewBudget({ ...newBudget, description: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="المبلغ المخطط"
                        value={newBudget.plannedAmount || ''}
                        onChange={e => setNewBudget({ ...newBudget, plannedAmount: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        type="number"
                        placeholder="المبلغ الفعلي (اختياري)"
                        value={newBudget.actualAmount || ''}
                        onChange={e => setNewBudget({ ...newBudget, actualAmount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          createBudgetMutation.mutate({
                            trackingId: tracking.id,
                            category: newBudget.category,
                            description: newBudget.description || undefined,
                            plannedAmount: newBudget.plannedAmount,
                            actualAmount: newBudget.actualAmount || undefined,
                          });
                        }}
                        disabled={!newBudget.category || !newBudget.plannedAmount || createBudgetMutation.isPending}
                      >
                        {createBudgetMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إضافة'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {budgetItems.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد بنود ميزانية بعد</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right py-3 px-4">الفئة</th>
                          <th className="text-right py-3 px-4">الوصف</th>
                          <th className="text-right py-3 px-4">المخطط</th>
                          <th className="text-right py-3 px-4">الفعلي</th>
                          <th className="text-right py-3 px-4">النسبة</th>
                          <th className="text-right py-3 px-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {budgetItems.map(item => {
                          const percentage = Number(item.plannedAmount) > 0
                            ? Math.round((Number(item.actualAmount) / Number(item.plannedAmount)) * 100)
                            : 0;
                          return (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{item.category}</td>
                              <td className="py-3 px-4 text-gray-500">{item.description || '-'}</td>
                              <td className="py-3 px-4">{Number(item.plannedAmount).toLocaleString()} ريال</td>
                              <td className="py-3 px-4">{Number(item.actualAmount).toLocaleString()} ريال</td>
                              <td className="py-3 px-4">
                                <Badge className={percentage > 100 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                                  {percentage}%
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteBudgetMutation.mutate({ itemId: item.id })}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب المؤشرات */}
          <TabsContent value="kpis">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>مؤشرات الأداء</CardTitle>
                  <CardDescription>تتبع مؤشرات الأداء الرئيسية للمشروع</CardDescription>
                </div>
                <Dialog open={showKpiDialog} onOpenChange={setShowKpiDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة مؤشر
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة مؤشر أداء</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="اسم المؤشر"
                        value={newKpi.kpiName}
                        onChange={e => setNewKpi({ ...newKpi, kpiName: e.target.value })}
                      />
                      <Input
                        placeholder="القيمة المستهدفة"
                        value={newKpi.targetValue}
                        onChange={e => setNewKpi({ ...newKpi, targetValue: e.target.value })}
                      />
                      <Input
                        placeholder="القيمة الفعلية (اختياري)"
                        value={newKpi.actualValue}
                        onChange={e => setNewKpi({ ...newKpi, actualValue: e.target.value })}
                      />
                      <Input
                        placeholder="الوحدة (مثال: %, شخص, ريال)"
                        value={newKpi.unit}
                        onChange={e => setNewKpi({ ...newKpi, unit: e.target.value })}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          createKpiMutation.mutate({
                            trackingId: tracking.id,
                            kpiName: newKpi.kpiName,
                            targetValue: newKpi.targetValue,
                            actualValue: newKpi.actualValue || undefined,
                            unit: newKpi.unit || undefined,
                          });
                        }}
                        disabled={!newKpi.kpiName || !newKpi.targetValue || createKpiMutation.isPending}
                      >
                        {createKpiMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إضافة'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {kpis.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد مؤشرات بعد</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kpis.map(kpi => {
                      const target = parseFloat(kpi.targetValue) || 0;
                      const actual = parseFloat(kpi.actualValue || '0') || 0;
                      const progress = target > 0 ? Math.min(Math.round((actual / target) * 100), 100) : 0;
                      return (
                        <Card key={kpi.id} className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 left-2"
                            onClick={() => deleteKpiMutation.mutate({ itemId: kpi.id })}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-5 h-5 text-emerald-600" />
                              <h4 className="font-medium">{kpi.kpiName}</h4>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-2xl font-bold text-emerald-600">
                                {kpi.actualValue || '0'}
                              </span>
                              <span className="text-gray-500">/ {kpi.targetValue}</span>
                              {kpi.unit && <span className="text-gray-400">{kpi.unit}</span>}
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">{progress}% من الهدف</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب المخاطر */}
          <TabsContent value="risks">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>المخاطر</CardTitle>
                  <CardDescription>إدارة مخاطر المشروع</CardDescription>
                </div>
                <Dialog open={showRiskDialog} onOpenChange={setShowRiskDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة خطر
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة خطر جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="وصف الخطر"
                        value={newRisk.riskDescription}
                        onChange={e => setNewRisk({ ...newRisk, riskDescription: e.target.value })}
                      />
                      <Select
                        value={newRisk.severity}
                        onValueChange={(value: RiskSeverity) => setNewRisk({ ...newRisk, severity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="الشدة" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(severityLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={newRisk.likelihood}
                        onValueChange={(value: RiskLikelihood) => setNewRisk({ ...newRisk, likelihood: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="احتمالية الحدوث" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(likelihoodLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        placeholder="استراتيجية التخفيف (اختياري)"
                        value={newRisk.mitigationStrategy}
                        onChange={e => setNewRisk({ ...newRisk, mitigationStrategy: e.target.value })}
                      />
                      <Input
                        placeholder="المسؤول (اختياري)"
                        value={newRisk.owner}
                        onChange={e => setNewRisk({ ...newRisk, owner: e.target.value })}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          createRiskMutation.mutate({
                            trackingId: tracking.id,
                            riskDescription: newRisk.riskDescription,
                            severity: newRisk.severity,
                            likelihood: newRisk.likelihood,
                            mitigationStrategy: newRisk.mitigationStrategy || undefined,
                            owner: newRisk.owner || undefined,
                          });
                        }}
                        disabled={!newRisk.riskDescription || createRiskMutation.isPending}
                      >
                        {createRiskMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إضافة'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {risks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد مخاطر محددة بعد</p>
                ) : (
                  <div className="space-y-4">
                    {risks.map(risk => (
                      <div
                        key={risk.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className={`w-5 h-5 ${
                                risk.severity === 'critical' || risk.severity === 'high'
                                  ? 'text-red-500'
                                  : risk.severity === 'medium'
                                  ? 'text-yellow-500'
                                  : 'text-green-500'
                              }`} />
                              <p className="font-medium">{risk.riskDescription}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge className={severityColors[risk.severity as RiskSeverity]}>
                                الشدة: {severityLabels[risk.severity as RiskSeverity]}
                              </Badge>
                              <Badge variant="outline">
                                الاحتمالية: {likelihoodLabels[risk.likelihood as RiskLikelihood]}
                              </Badge>
                              <Badge variant="outline">
                                {riskStatusLabels[risk.status as RiskStatus]}
                              </Badge>
                            </div>
                            {risk.mitigationStrategy && (
                              <p className="text-sm text-gray-600">
                                <strong>التخفيف:</strong> {risk.mitigationStrategy}
                              </p>
                            )}
                            {risk.owner && (
                              <p className="text-sm text-gray-500 mt-1">
                                <Users className="w-3 h-3 inline ml-1" />
                                {risk.owner}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={risk.status}
                              onValueChange={(value: RiskStatus) => {
                                updateRiskMutation.mutate({
                                  itemId: risk.id,
                                  status: value,
                                });
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(riskStatusLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteRiskMutation.mutate({ itemId: risk.id })}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* شريط التقدم العام */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>تحديث التقدم العام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="range"
                min="0"
                max="100"
                value={tracking.overallProgress}
                onChange={e => {
                  updateTrackingMutation.mutate({
                    trackingId: tracking.id,
                    overallProgress: parseInt(e.target.value),
                  });
                }}
                className="flex-1"
              />
              <span className="text-2xl font-bold text-emerald-600 w-16 text-center">
                {tracking.overallProgress}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
