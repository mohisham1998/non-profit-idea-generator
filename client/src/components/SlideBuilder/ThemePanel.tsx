import { useState, useRef } from 'react';
import { useSlideStore, PresentationTheme } from '@/stores/slideStore';
import { Button } from '@/components/ui/button';
import { X, Image, Layout, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type LogoPosition = PresentationTheme['logoPosition'];
type LogoSize = PresentationTheme['logoSize'];
type CoverLayout = PresentationTheme['coverSlide']['layout'];

const LOGO_POSITIONS: { id: LogoPosition; label: string }[] = [
  { id: 'top-left', label: 'أعلى يسار' },
  { id: 'top-right', label: 'أعلى يمين' },
  { id: 'bottom-left', label: 'أسفل يسار' },
  { id: 'bottom-right', label: 'أسفل يمين' },
  { id: 'center', label: 'وسط' },
];

const LOGO_SIZES: { id: LogoSize; label: string }[] = [
  { id: 'small', label: 'صغير' },
  { id: 'medium', label: 'متوسط' },
  { id: 'large', label: 'كبير' },
];

const COVER_LAYOUTS: { id: CoverLayout; label: string }[] = [
  { id: 'centered', label: 'مركزي' },
  { id: 'left-aligned', label: 'محاذاة لليسار' },
  { id: 'minimal', label: 'بسيط' },
  { id: 'bold', label: 'واضح' },
];

interface ThemePanelProps {
  onClose: () => void;
}

export function ThemePanel({ onClose }: ThemePanelProps) {
  const { theme, updateTheme, updateCoverSlide } = useSlideStore();
  const { logo, logoPosition, logoSize, applyLogoToAllSlides, coverSlide } = theme;
  
  const [uploading, setUploading] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingGlobalBg, setUploadingGlobalBg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverBgInputRef = useRef<HTMLInputElement>(null);
  const globalBgInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة فقط');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      updateTheme({ logo: data.url });
      toast.success('تم رفع الشعار بنجاح');
    } catch (error) {
      toast.error('فشل رفع الصورة');
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'global') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة فقط');
      return;
    }
    if (target === 'cover') setUploadingBg(true);
    else setUploadingGlobalBg(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      if (target === 'cover') {
        updateCoverSlide({ backgroundImage: data.url });
        toast.success('تم رفع صورة الغلاف بنجاح');
      } else {
        updateTheme({ globalBackgroundImage: data.url });
        toast.success('تم رفع صورة الخلفية بنجاح');
      }
    } catch (error) {
      toast.error('فشل رفع الصورة');
      console.error(error);
    } finally {
      if (target === 'cover') {
        setUploadingBg(false);
        if (coverBgInputRef.current) coverBgInputRef.current.value = '';
      } else {
        setUploadingGlobalBg(false);
        if (globalBgInputRef.current) globalBgInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      className="w-72 bg-white border-l border-gray-200 shadow-xl flex flex-col"
      style={{ height: '100%', maxHeight: '100vh' }}
      dir="rtl"
    >
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm">إعدادات العرض والغلاف</h3>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Image className="h-4 w-4 text-gray-500" />
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">الشعار</h4>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-2">رفع صورة الشعار</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploading ? 'جاري الرفع...' : 'رفع صورة'}
                  </Button>
                  {logo && (
                    <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">أو أدخل رابط صورة</label>
                <input
                  type="url"
                  value={logo ?? ''}
                  onChange={e => updateTheme({ logo: e.target.value || undefined })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-2">موضع الشعار</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {LOGO_POSITIONS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => updateTheme({ logoPosition: p.id })}
                      className={`py-2 rounded-lg border-2 text-[11px] font-medium transition-all ${
                        logoPosition === p.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-2">حجم الشعار</label>
                <div className="flex gap-2">
                  {LOGO_SIZES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => updateTheme({ logoSize: s.id })}
                      className={`flex-1 py-2 rounded-lg border-2 text-[11px] font-medium transition-all ${
                        logoSize === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">إظهار الشعار على كل الشرائح</span>
                <button
                  type="button"
                  role="switch"
                  onClick={() => updateTheme({ applyLogoToAllSlides: !applyLogoToAllSlides })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${applyLogoToAllSlides ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${applyLogoToAllSlides ? 'translate-x-0.5 left-0.5' : 'translate-x-5 right-0.5'}`} />
                </button>
              </label>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Layout className="h-4 w-4 text-gray-500" />
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">شريحة الغلاف</h4>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-2">تخطيط الغلاف</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {COVER_LAYOUTS.map(l => (
                    <button
                      key={l.id}
                      onClick={() => updateCoverSlide({ layout: l.id })}
                      className={`py-2 rounded-lg border-2 text-[11px] font-medium transition-all ${
                        coverSlide.layout === l.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">لون خلفية الغلاف</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={coverSlide.backgroundColor || '#ffffff'}
                    onChange={e => updateCoverSlide({ backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={coverSlide.backgroundColor || '#ffffff'}
                    onChange={e => updateCoverSlide({ backgroundColor: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">صورة خلفية (اختياري)</label>
                <input
                  ref={coverBgInputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => handleBackgroundUpload(e, 'cover')}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => coverBgInputRef.current?.click()}
                    disabled={uploadingBg}
                  >
                    {uploadingBg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploadingBg ? 'جاري الرفع...' : 'رفع صورة'}
                  </Button>
                </div>
                <input
                  type="url"
                  value={coverSlide.backgroundImage ?? ''}
                  onChange={e => updateCoverSlide({ backgroundImage: e.target.value || undefined })}
                  placeholder="أو أدخل رابط الصورة..."
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {coverSlide.backgroundImage && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-2">حجم الصورة</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'cover', label: 'تغطية كاملة' },
                        { id: 'contain', label: 'احتواء' },
                        { id: 'auto', label: 'تلقائي' },
                      ].map(size => (
                        <button
                          key={size.id}
                          onClick={() => updateCoverSlide({ backgroundSize: size.id as any })}
                          className={`
                            px-2 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${(coverSlide.backgroundSize || 'cover') === size.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-2">موضع الصورة</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'center', label: 'وسط' },
                        { id: 'top', label: 'أعلى' },
                        { id: 'bottom', label: 'أسفل' },
                        { id: 'left', label: 'يسار' },
                        { id: 'right', label: 'يمين' },
                      ].map(pos => (
                        <button
                          key={pos.id}
                          onClick={() => updateCoverSlide({ backgroundPosition: pos.id })}
                          className={`
                            px-2 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${(coverSlide.backgroundPosition || 'center') === pos.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ── Global Background for All Slides ────────────── */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">خلفية جميع الشرائح</h4>
            
            {/* Apply Global Background Toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700">تطبيق خلفية موحدة</span>
              <button
                onClick={() => updateTheme({ applyGlobalBackground: !theme.applyGlobalBackground })}
                className={`
                  relative w-11 h-6 rounded-full transition-colors
                  ${theme.applyGlobalBackground ? 'bg-blue-500' : 'bg-gray-300'}
                `}
              >
                <span className={`
                  absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                  ${theme.applyGlobalBackground ? 'translate-x-0.5' : 'translate-x-5'}
                `} />
              </button>
            </label>

            {theme.applyGlobalBackground && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">لون الخلفية</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.globalBackgroundColor || '#ffffff'}
                      onChange={e => updateTheme({ globalBackgroundColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.globalBackgroundColor || '#ffffff'}
                      onChange={e => updateTheme({ globalBackgroundColor: e.target.value })}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">صورة خلفية (اختياري)</label>
                  <input
                    ref={globalBgInputRef}
                    type="file"
                    accept="image/*"
                    onChange={e => handleBackgroundUpload(e, 'global')}
                    className="hidden"
                  />
                  <div className="flex gap-2 mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => globalBgInputRef.current?.click()}
                      disabled={uploadingGlobalBg}
                    >
                      {uploadingGlobalBg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadingGlobalBg ? 'جاري الرفع...' : 'رفع صورة'}
                    </Button>
                  </div>
                  <input
                    type="url"
                    value={theme.globalBackgroundImage ?? ''}
                    onChange={e => updateTheme({ globalBackgroundImage: e.target.value || undefined })}
                    placeholder="أو أدخل رابط الصورة..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
