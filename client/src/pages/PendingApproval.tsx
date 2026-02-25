import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail, RefreshCw, LogOut, Sparkles, Shield } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function PendingApproval() {
  const { user, loading: isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  // إذا تمت الموافقة على المستخدم، إعادة توجيهه للصفحة الرئيسية
  useEffect(() => {
    if (!isLoading && user && user.status === 'approved') {
      setLocation('/');
    }
  }, [user, isLoading, setLocation]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = '/';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* خلفية متدرجة */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-amber-50 to-cyan-100"></div>
      
      {/* عناصر زخرفية */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-orange-300/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-3xl"></div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* الشعار */}
        <div className="mb-8 flex items-center gap-3">
          <img 
            src="/logo-masar.png" 
            alt="مسار الابتكار" 
            className="w-16 h-16 object-contain"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-cyan-500 bg-clip-text text-transparent">
            مسار الابتكار
          </span>
        </div>

        {/* البطاقة الرئيسية */}
        <Card className="glass-card-interactive w-full max-w-lg border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            {/* أيقونة الانتظار */}
            <div className="mx-auto mb-4 relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <Clock className="w-12 h-12 text-amber-600 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-800">
              حسابك قيد المراجعة
            </CardTitle>
            <CardDescription className="text-base text-gray-600 mt-2">
              شكراً لتسجيلك في مسار الابتكار
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {/* رسالة توضيحية */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">ماذا يحدث الآن؟</h3>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    يقوم مدير الموقع حالياً بمراجعة طلب تسجيلك. سيتم إشعارك فور الموافقة على حسابك وستتمكن من الوصول لجميع ميزات المنصة.
                  </p>
                </div>
              </div>
            </div>

            {/* معلومات المستخدم */}
            {user && (
              <div className="bg-white/50 rounded-xl p-4 border border-gray-200/50">
                <h4 className="text-sm font-medium text-gray-500 mb-3">معلومات حسابك</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الاسم:</span>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">البريد الإلكتروني:</span>
                    <span className="font-medium text-gray-800 text-sm">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الحالة:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      في انتظار الموافقة
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* نصائح */}
            <div className="bg-gradient-to-r from-cyan-50 to-orange-50 rounded-xl p-4 border border-cyan-200/50">
              <h4 className="text-sm font-semibold text-cyan-800 mb-2">💡 في انتظارك</h4>
              <ul className="text-sm text-cyan-700 space-y-1.5">
                <li>• عادةً ما تتم المراجعة خلال 24 ساعة</li>
                <li>• ستتلقى إشعاراً عند الموافقة على حسابك</li>
                <li>• يمكنك التحقق من حالة حسابك بالضغط على "تحديث"</li>
              </ul>
            </div>

            {/* الأزرار */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={handleRefresh}
                className="flex-1 bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-600 hover:to-cyan-600 text-white border-0 h-12"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                تحديث الحالة
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 h-12"
              >
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* نص أسفل البطاقة */}
        <p className="mt-6 text-sm text-gray-500 text-center max-w-md">
          إذا كانت لديك أي استفسارات، يرجى التواصل مع مدير الموقع
        </p>
      </div>
    </div>
  );
}
