import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Loader2,
  Upload,
  Trash2,
  Building2,
  Image as ImageIcon,
  Save,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function OrganizationSettings() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [organizationName, setOrganizationName] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // جلب معلومات المؤسسة الحالية
  const { data: orgInfo, isLoading: isLoadingInfo, refetch } = trpc.organization.getInfo.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // تحديث الحالة عند تحميل البيانات
  useEffect(() => {
    if (orgInfo) {
      setOrganizationName(orgInfo.name || "");
      setLogoPreview(orgInfo.logo || null);
    }
  }, [orgInfo]);

  // Mutations
  const uploadLogoMutation = trpc.organization.uploadLogo.useMutation({
    onSuccess: (data) => {
      setLogoPreview(data.logoUrl);
      toast.success("تم رفع الشعار بنجاح!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل رفع الشعار");
    },
  });

  const updateNameMutation = trpc.organization.updateName.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ اسم المؤسسة بنجاح!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل حفظ اسم المؤسسة");
    },
  });

  const deleteLogoMutation = trpc.organization.deleteLogo.useMutation({
    onSuccess: () => {
      setLogoPreview(null);
      toast.success("تم حذف الشعار بنجاح!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل حذف الشعار");
    },
  });

  // التعامل مع رفع الملف
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة");
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    setIsUploading(true);

    try {
      // تحويل الملف إلى base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setLogoPreview(base64);
        
        await uploadLogoMutation.mutateAsync({
          logoBase64: base64,
          mimeType: file.type,
        });
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error("فشل قراءة الملف");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
    }
  };

  // حفظ اسم المؤسسة
  const handleSaveName = async () => {
    if (!organizationName.trim()) {
      toast.error("يرجى إدخال اسم المؤسسة");
      return;
    }

    setIsSaving(true);
    try {
      await updateNameMutation.mutateAsync({ name: organizationName.trim() });
    } finally {
      setIsSaving(false);
    }
  };

  // حذف الشعار
  const handleDeleteLogo = async () => {
    if (!logoPreview) return;
    await deleteLogoMutation.mutateAsync();
  };

  // إعادة التوجيه إذا لم يكن مسجل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (authLoading || isLoadingInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30" dir="rtl">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30" dir="rtl">
      <Navbar />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إعدادات المؤسسة
          </h1>
          <p className="text-gray-600">
            قم بتخصيص معلومات مؤسستك لتظهر في جميع الملفات المصدرة
          </p>
        </div>

        <div className="grid gap-6">
          {/* بطاقة الشعار */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-l from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                شعار المؤسسة
              </CardTitle>
              <CardDescription className="text-green-100">
                سيظهر الشعار في جميع الملفات المصدرة (Word, PDF, PowerPoint)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* معاينة الشعار */}
                <div className="flex-shrink-0">
                  <div 
                    className={`w-40 h-40 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
                      logoPreview 
                        ? "border-green-300 bg-white" 
                        : "border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50/50"
                    }`}
                  >
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="شعار المؤسسة" 
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <span className="text-sm">لا يوجد شعار</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* أزرار التحكم */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">رفع شعار جديد</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      يُفضل استخدام صورة بخلفية شفافة (PNG) بأبعاد 512×512 بكسل أو أكبر
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 ml-2" />
                          رفع شعار
                        </>
                      )}
                    </Button>

                    {logoPreview && (
                      <Button
                        variant="outline"
                        onClick={handleDeleteLogo}
                        disabled={deleteLogoMutation.isPending}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {deleteLogoMutation.isPending ? (
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 ml-2" />
                        )}
                        حذف الشعار
                      </Button>
                    )}
                  </div>

                  {logoPreview && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تم رفع الشعار بنجاح</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* بطاقة اسم المؤسسة */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-l from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                اسم المؤسسة
              </CardTitle>
              <CardDescription className="text-blue-100">
                سيظهر اسم المؤسسة في ترويسة الملفات المصدرة
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orgName" className="text-gray-700 font-medium">
                    اسم المؤسسة أو الجمعية
                  </Label>
                  <Input
                    id="orgName"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="مثال: جمعية الإحسان الخيرية"
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleSaveName}
                  disabled={isSaving || !organizationName.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      حفظ الاسم
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* معاينة كيف سيظهر في الملفات */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">معاينة الترويسة</CardTitle>
              <CardDescription>
                هكذا ستظهر معلومات مؤسستك في الملفات المصدرة
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gradient-to-l from-gray-50 to-white border rounded-xl p-6">
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="شعار المؤسسة" 
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {organizationName || "اسم المؤسسة"}
                    </h3>
                    <p className="text-gray-500 text-sm">مقترح تمويل للجهات المانحة</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
