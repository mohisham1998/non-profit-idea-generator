/**
 * BrandingSettings — العلامة التجارية
 *
 * Logo upload (max 2MB), placement toggles (Cover, Footer, Hidden),
 * and primary color picker with presets + hex that updates CSS variables in real time.
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Palette, Image, Loader2, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDashboardStore } from '@/store/useStore';
import { toast } from 'sonner';

const LOGO_MAX_BYTES = 2 * 1024 * 1024;

const COLOR_PRESETS = [
  { name: 'أزرق', value: '#0891b2' },
  { name: 'سماوي', value: '#06b6d4' },
  { name: 'أخضر', value: '#059669' },
  { name: 'بنفسجي', value: '#7c3aed' },
  { name: 'وردي', value: '#db2777' },
  { name: 'برتقالي', value: '#ea580c' },
];

export default function BrandingSettings() {
  const { data: branding, isLoading } = trpc.adminDashboard.getBranding.useQuery();
  const updateMutation = trpc.adminDashboard.updateBranding.useMutation({
    onSuccess: () => {
      toast.success('تم حفظ الإعدادات');
    },
    onError: (e) => toast.error(e.message),
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPlacement, setLogoPlacement] = useState<'cover' | 'footer' | 'hidden'>('cover');
  const [primaryColor, setPrimaryColor] = useState('#0891b2');
  const [hexInput, setHexInput] = useState('#0891b2');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateBrandingStore = useDashboardStore((s) => s.updateBranding);

  useEffect(() => {
    if (branding) {
      setLogoUrl(branding.logoUrl ?? null);
      setLogoPlacement((branding.logoPlacement as 'cover' | 'footer' | 'hidden') ?? 'cover');
      const pc = branding.primaryColor || '#0891b2';
      setPrimaryColor(pc);
      setHexInput(pc);
      updateBrandingStore({
        organizationLogo: branding.logoUrl ?? null,
        logoPlacement: (branding.logoPlacement as 'cover' | 'footer' | 'hidden') ?? 'cover',
        primaryColor: pc,
      });
    }
  }, [branding, updateBrandingStore]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--primary-foreground', '#ffffff');
    updateBrandingStore({ primaryColor });
  }, [primaryColor, updateBrandingStore]);

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      toast.error('يجب أن تكون الصورة PNG أو JPEG أو SVG');
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      toast.error('حجم الصورة يجب ألا يتجاوز 2 ميجابايت');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoUrl(dataUrl);
      updateMutation.mutate({ logoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    updateMutation.mutate({ logoUrl: '' });
  };

  const handlePlacementChange = (v: 'cover' | 'footer' | 'hidden') => {
    setLogoPlacement(v);
    updateMutation.mutate({ logoPlacement: v });
    updateBrandingStore({ logoPlacement: v });
  };

  const handleColorSelect = (hex: string) => {
    setPrimaryColor(hex);
    setHexInput(hex);
    updateMutation.mutate({ primaryColor: hex });
  };

  const handleHexChange = (v: string) => {
    setHexInput(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
      setPrimaryColor(v);
      updateMutation.mutate({ primaryColor: v });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette className="h-7 w-7 text-cyan-500" />
          العلامة التجارية
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          تخصيص الشعار والألوان للمؤسسة
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              شعار المؤسسة
            </CardTitle>
            <CardDescription>
              PNG أو JPEG أو SVG، بحد أقصى 2 ميجابايت
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt="شعار" className="w-full h-full object-contain" />
                ) : (
                  <Image className="h-10 w-10 text-slate-400" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoFile}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  رفع شعار
                </Button>
                {logoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={handleRemoveLogo}
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    إزالة
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>موضع الشعار</CardTitle>
            <CardDescription>
              مكان ظهور الشعار في العروض التقديمية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(['cover', 'footer', 'hidden'] as const).map((v) => (
                <Button
                  key={v}
                  variant={logoPlacement === v ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePlacementChange(v)}
                >
                  {v === 'cover' && 'الغلاف'}
                  {v === 'footer' && 'التذييل'}
                  {v === 'hidden' && 'مخفي'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>اللون الأساسي</CardTitle>
            <CardDescription>
              اللون الرئيسي المستخدم في الواجهة والعروض
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleColorSelect(p.value)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    primaryColor === p.value
                      ? 'border-slate-900 dark:border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: p.value }}
                  title={p.name}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#0891b2"
                className="font-mono w-32"
              />
              <div
                className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
