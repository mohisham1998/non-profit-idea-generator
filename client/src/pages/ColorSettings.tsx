import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Loader2, Palette, RotateCcw, Save, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";

export default function ColorSettings() {
  const [, navigate] = useLocation();
  const [primaryColor, setPrimaryColor] = useState("#FF6B35");
  const [secondaryColor, setSecondaryColor] = useState("#004E89");
  const [backgroundColor, setBackgroundColor] = useState("#F7F7F7");

  // جلب الألوان الحالية
  const { data: colors, isLoading } = trpc.settings.getColors.useQuery();

  // تحديث الألوان
  const updateMutation = trpc.settings.updateColors.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الألوان بنجاح!");
      // تطبيق الألوان فوراً
      applyColors();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حفظ الألوان");
    },
  });

  // إعادة تعيين الألوان
  const resetMutation = trpc.settings.resetColors.useMutation({
    onSuccess: () => {
      toast.success("تم إعادة تعيين الألوان بنجاح!");
      setPrimaryColor("#FF6B35");
      setSecondaryColor("#004E89");
      setBackgroundColor("#F7F7F7");
      applyDefaultColors();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إعادة التعيين");
    },
  });

  // تحميل الألوان المحفوظة
  useEffect(() => {
    if (colors) {
      if (colors.primaryColor) setPrimaryColor(colors.primaryColor);
      if (colors.secondaryColor) setSecondaryColor(colors.secondaryColor);
      if (colors.backgroundColor) setBackgroundColor(colors.backgroundColor);
      
      // تطبيق الألوان المحفوظة
      if (colors.primaryColor || colors.secondaryColor || colors.backgroundColor) {
        applyColors(colors.primaryColor, colors.secondaryColor, colors.backgroundColor);
      }
    }
  }, [colors]);

  const applyColors = (primary?: string | null, secondary?: string | null, background?: string | null) => {
    const root = document.documentElement;
    if (primary || primaryColor) {
      root.style.setProperty('--color-primary', primary || primaryColor);
    }
    if (secondary || secondaryColor) {
      root.style.setProperty('--color-secondary', secondary || secondaryColor);
    }
    if (background || backgroundColor) {
      root.style.setProperty('--color-background', background || backgroundColor);
    }
  };

  const applyDefaultColors = () => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', '#FF6B35');
    root.style.setProperty('--color-secondary', '#004E89');
    root.style.setProperty('--color-background', '#F7F7F7');
  };

  const handleSave = () => {
    updateMutation.mutate({
      primaryColor,
      secondaryColor,
      backgroundColor,
    });
  };

  const handleReset = () => {
    resetMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-cyan-50">
        <Navbar />
        <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-orange-500 mb-4" />
            <p className="text-lg text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-cyan-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">تخصيص الألوان</CardTitle>
                <CardDescription>
                  خصص ألوان الموقع لتتناسب مع هوية مؤسستك البصرية
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* معاينة الألوان */}
            <div className="p-6 rounded-lg border-2 border-dashed border-gray-300 bg-white">
              <h3 className="text-lg font-semibold mb-4 text-center">معاينة الألوان</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div
                    className="h-24 rounded-lg shadow-md mb-2 transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <p className="text-sm font-medium">اللون الأساسي</p>
                  <p className="text-xs text-gray-500">{primaryColor}</p>
                </div>
                <div className="text-center">
                  <div
                    className="h-24 rounded-lg shadow-md mb-2 transition-colors"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <p className="text-sm font-medium">اللون الثانوي</p>
                  <p className="text-xs text-gray-500">{secondaryColor}</p>
                </div>
                <div className="text-center">
                  <div
                    className="h-24 rounded-lg shadow-md mb-2 transition-colors"
                    style={{ backgroundColor: backgroundColor }}
                  />
                  <p className="text-sm font-medium">لون الخلفية</p>
                  <p className="text-xs text-gray-500">{backgroundColor}</p>
                </div>
              </div>
            </div>

            {/* اختيار الألوان */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary">اللون الأساسي</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id="primary"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                    placeholder="#FF6B35"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  يستخدم للأزرار الرئيسية والعناصر المهمة
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary">اللون الثانوي</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id="secondary"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1"
                    placeholder="#004E89"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  يستخدم للعناوين والعناصر الثانوية
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">لون الخلفية</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id="background"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1"
                    placeholder="#F7F7F7"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  يستخدم كخلفية رئيسية للموقع
                </p>
              </div>
            </div>

            {/* أزرار الحفظ والإعادة */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ الألوان
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                disabled={resetMutation.isPending}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الإعادة...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 ml-2" />
                    إعادة التعيين
                  </>
                )}
              </Button>
            </div>

            {/* نصائح */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">💡 نصائح لاختيار الألوان:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>اختر ألواناً تتناسب مع هوية مؤسستك البصرية</li>
                <li>تأكد من وجود تباين كافٍ بين الألوان لسهولة القراءة</li>
                <li>استخدم الألوان الفاتحة للخلفيات والداكنة للنصوص</li>
                <li>يمكنك معاينة الألوان قبل الحفظ</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
