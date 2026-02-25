import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Shield, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Lightbulb,
  Target,
  DollarSign,
  BarChart,
  BarChart3,
  Table,
  Briefcase,
  Palette,
  MessageSquare,
  FileDown,
  ClipboardCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

// أيقونات الميزات
const featureIcons: Record<string, any> = {
  Lightbulb,
  Target,
  DollarSign,
  BarChart,
  Table,
  Briefcase,
  Palette,
  MessageSquare,
  FileDown,
  ClipboardCheck,
};

// ألوان الفئات
const categoryColors: Record<string, string> = {
  generation: 'bg-blue-100 text-blue-700',
  analysis: 'bg-purple-100 text-purple-700',
  methodology: 'bg-green-100 text-green-700',
  interaction: 'bg-amber-100 text-amber-700',
  export: 'bg-gray-100 text-gray-700',
};

const categoryNames: Record<string, string> = {
  generation: 'التوليد',
  analysis: 'التحليل',
  methodology: 'المنهجيات',
  interaction: 'التفاعل',
  export: 'التصدير',
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, loading: isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('features');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // جلب الإحصائيات
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.admin.getStats.useQuery(
    undefined,
    { enabled: user?.role === 'admin' }
  );
  
  // جلب المستخدمين
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.getUsers.useQuery(
    { status: 'all' },
    { enabled: user?.role === 'admin' }
  );

  // جلب الميزات العامة
  const { data: features, isLoading: featuresLoading, refetch: refetchFeatures } = trpc.admin.getSystemFeatures.useQuery(
    undefined,
    { enabled: user?.role === 'admin' }
  );

  // جلب المستخدمين مع صلاحياتهم
  const { data: usersWithPermissions, isLoading: permissionsLoading, refetch: refetchPermissions } = trpc.admin.getUsersWithPermissions.useQuery(
    undefined,
    { enabled: user?.role === 'admin' }
  );

  // Mutations
  const approveMutation = trpc.admin.approveUser.useMutation({
    onSuccess: () => {
      toast.success('تمت الموافقة على المستخدم بنجاح');
      refetchUsers();
      refetchStats();
      refetchPermissions();
    },
    onError: (error) => {
      toast.error(error.message || 'فشل في الموافقة على المستخدم');
    },
  });

  const rejectMutation = trpc.admin.rejectUser.useMutation({
    onSuccess: () => {
      toast.success('تم رفض المستخدم بنجاح');
      refetchUsers();
      refetchStats();
    },
    onError: (error) => {
      toast.error(error.message || 'فشل في رفض المستخدم');
    },
  });

  const suspendMutation = trpc.admin.suspendUser.useMutation({
    onSuccess: () => {
      toast.success('تم تعليق المستخدم بنجاح');
      refetchUsers();
      refetchStats();
    },
    onError: (error) => {
      toast.error(error.message || 'فشل في تعليق المستخدم');
    },
  });

  // تفعيل/تعطيل ميزة
  const toggleFeatureMutation = trpc.admin.toggleFeature.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchFeatures();
    },
    onError: (error) => {
      toast.error(error.message || 'فشل في تحديث حالة الميزة');
    },
  });

  // تحديث صلاحية مستخدم
  const updatePermissionMutation = trpc.admin.updateSinglePermission.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث الصلاحية بنجاح');
      refetchPermissions();
    },
    onError: (error) => {
      toast.error(error.message || 'فشل في تحديث الصلاحية');
    },
  });

  // التحقق من صلاحيات المدير
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-emerald-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-4">
        <Card className="w-full max-w-md glass glass-card-enhanced border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl text-red-600">غير مصرح</CardTitle>
            <CardDescription>ليس لديك صلاحية الوصول إلى هذه الصفحة</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full" variant="outline">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">موافق عليه</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">مرفوض</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">في الانتظار</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // تجميع الميزات حسب الفئة
  const groupedFeatures = features?.reduce((acc, feature) => {
    const category = feature.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, typeof features>);

  // الصلاحيات المتاحة
  const permissionKeys = [
    { key: 'canGenerateIdea', label: 'توليد الأفكار', icon: Lightbulb },
    { key: 'canGenerateKPIs', label: 'مؤشرات الأداء', icon: Target },
    { key: 'canEstimateBudget', label: 'تقدير الميزانية', icon: DollarSign },
    { key: 'canGenerateSWOT', label: 'تحليل SWOT', icon: BarChart },
    { key: 'canGenerateLogFrame', label: 'الإطار المنطقي', icon: Table },
    { key: 'canGeneratePMDPro', label: 'PMDPro', icon: Briefcase },
    { key: 'canGenerateDesignThinking', label: 'التفكير التصميمي', icon: Palette },
    { key: 'canChat', label: 'المحادثة التفاعلية', icon: MessageSquare },
    { key: 'canExportPDF', label: 'تصدير PDF', icon: FileDown },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <Navbar />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
        {/* الهيدر */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">لوحة تحكم المدير</h1>
            <p className="text-muted-foreground">إدارة الميزات والصلاحيات والمستخدمين</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setLocation('/admin/analytics')}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <BarChart3 className="h-4 w-4" />
              لوحة الإحصائيات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { refetchStats(); refetchUsers(); refetchFeatures(); refetchPermissions(); }}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث
            </Button>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass glass-card-enhanced border-0">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.total || 0}</p>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-card-enhanced border-0">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.pending || 0}</p>
                <p className="text-sm text-muted-foreground">في الانتظار</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-card-enhanced border-0">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.approved || 0}</p>
                <p className="text-sm text-muted-foreground">موافق عليهم</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-card-enhanced border-0">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{featuresLoading ? '...' : features?.filter(f => f.isEnabled).length || 0}</p>
                <p className="text-sm text-muted-foreground">ميزات مفعلة</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات الرئيسية */}
        <Card className="glass glass-card-enhanced border-0">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="features" className="gap-2">
                  <Settings className="h-4 w-4" />
                  الميزات العامة
                </TabsTrigger>
                <TabsTrigger value="permissions" className="gap-2">
                  <Shield className="h-4 w-4" />
                  صلاحيات المستخدمين
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-2">
                  <Users className="h-4 w-4" />
                  إدارة المستخدمين
                  {stats?.pending ? <Badge variant="secondary" className="mr-1">{stats.pending}</Badge> : null}
                </TabsTrigger>
              </TabsList>

              {/* تبويب الميزات العامة */}
              <TabsContent value="features" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">التحكم في ميزات النظام</h3>
                  <p className="text-muted-foreground text-sm">قم بتفعيل أو تعطيل الميزات المتاحة لجميع المستخدمين</p>
                </div>

                {featuresLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : groupedFeatures && Object.keys(groupedFeatures).length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge className={categoryColors[category] || 'bg-gray-100 text-gray-700'}>
                            {categoryNames[category] || category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">({categoryFeatures?.length || 0} ميزات)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryFeatures?.map((feature) => {
                            const IconComponent = featureIcons[feature.icon || 'Settings'] || Settings;
                            return (
                              <Card key={feature.id} className={`border transition-all duration-300 ${feature.isEnabled ? 'bg-white' : 'bg-gray-50 opacity-75'}`}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${feature.isEnabled ? 'bg-primary/10' : 'bg-gray-200'}`}>
                                        <IconComponent className={`h-5 w-5 ${feature.isEnabled ? 'text-primary' : 'text-gray-400'}`} />
                                      </div>
                                      <div>
                                        <h4 className={`font-medium ${feature.isEnabled ? 'text-foreground' : 'text-gray-500'}`}>{feature.nameAr}</h4>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{feature.description}</p>
                                      </div>
                                    </div>
                                    <Switch
                                      checked={feature.isEnabled === 1}
                                      onCheckedChange={(checked) => toggleFeatureMutation.mutate({ featureKey: feature.featureKey, isEnabled: checked })}
                                      disabled={toggleFeatureMutation.isPending}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">لا توجد ميزات مسجلة في النظام</div>
                )}
              </TabsContent>

              {/* تبويب صلاحيات المستخدمين */}
              <TabsContent value="permissions" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">إدارة صلاحيات المستخدمين</h3>
                  <p className="text-muted-foreground text-sm">تحكم في الميزات المتاحة لكل مستخدم على حدة</p>
                </div>

                {permissionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : usersWithPermissions && usersWithPermissions.length > 0 ? (
                  <div className="space-y-4">
                    {usersWithPermissions.filter(u => u.role !== 'admin').map((u) => (
                      <Card key={u.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between cursor-pointer" onClick={() => setSelectedUserId(selectedUserId === u.id ? null : u.id)}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-semibold">{u.name?.charAt(0) || u.email?.charAt(0) || '؟'}</span>
                              </div>
                              <div>
                                <h4 className="font-medium">{u.name || 'بدون اسم'}</h4>
                                <p className="text-sm text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(u.status)}
                              <Button variant="ghost" size="sm">
                                {selectedUserId === u.id ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5" />}
                              </Button>
                            </div>
                          </div>

                          {selectedUserId === u.id && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {permissionKeys.map((perm) => {
                                  const IconComponent = perm.icon;
                                  const isEnabled = u.permissions?.[perm.key as keyof typeof u.permissions] === 1;
                                  return (
                                    <div key={perm.key} className={`flex items-center justify-between p-3 rounded-lg border ${isEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                      <div className="flex items-center gap-2">
                                        <IconComponent className={`h-4 w-4 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                                        <span className={`text-sm ${isEnabled ? 'text-green-700' : 'text-gray-500'}`}>{perm.label}</span>
                                      </div>
                                      <Switch
                                        checked={isEnabled}
                                        onCheckedChange={(checked) => updatePermissionMutation.mutate({ userId: u.id, permissionKey: perm.key, value: checked ? 1 : 0 })}
                                        disabled={updatePermissionMutation.isPending}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">لا يوجد مستخدمون مسجلون</div>
                )}
              </TabsContent>

              {/* تبويب إدارة المستخدمين */}
              <TabsContent value="users" className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">إدارة المستخدمين</h3>
                  <p className="text-muted-foreground text-sm">الموافقة أو رفض طلبات التسجيل الجديدة</p>
                </div>

                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="space-y-3">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-white/50 border hover:bg-white/80 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">{u.name?.charAt(0) || u.email?.charAt(0) || '؟'}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{u.name || 'بدون اسم'}</h4>
                              {getStatusBadge(u.status)}
                              {u.role === 'admin' && <Badge className="bg-purple-100 text-purple-700">مدير</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">انضم في {formatDate(u.createdAt)}</p>
                          </div>
                        </div>
                        
                        {u.role !== 'admin' && (
                          <div className="flex items-center gap-2">
                            {u.status === 'pending' && (
                              <>
                                <Button size="sm" onClick={() => approveMutation.mutate({ userId: u.id })} disabled={approveMutation.isPending} className="gap-1 bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="h-4 w-4" />
                                  موافقة
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => rejectMutation.mutate({ userId: u.id })} disabled={rejectMutation.isPending} className="gap-1">
                                  <XCircle className="h-4 w-4" />
                                  رفض
                                </Button>
                              </>
                            )}
                            {u.status === 'approved' && (
                              <Button size="sm" variant="outline" onClick={() => suspendMutation.mutate({ userId: u.id })} disabled={suspendMutation.isPending} className="gap-1">
                                <Clock className="h-4 w-4" />
                                تعليق
                              </Button>
                            )}
                            {u.status === 'rejected' && (
                              <Button size="sm" onClick={() => approveMutation.mutate({ userId: u.id })} disabled={approveMutation.isPending} className="gap-1 bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-4 w-4" />
                                إعادة تفعيل
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">لا يوجد مستخدمون</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
