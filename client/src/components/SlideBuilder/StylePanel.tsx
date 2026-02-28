import { useState, useRef } from 'react';
import { useSlideStore, CardStyle, CardType } from '@/stores/slideStore';
import { Button } from '@/components/ui/button';
import {
  X, Trash2, List, LayoutGrid, Quote, Hash, CheckSquare, ArrowRight,
  Dot, Star, CreditCard, AlignLeft, AlignCenter, Type, Rows3, Eye, EyeOff,
  Layout, Upload, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Color Themes ────────────────────────────────────────────────
const COLOR_THEMES: {
  id: CardStyle['colorTheme'];
  label: string;
  header: string;   // Tailwind gradient classes
  bg: string;       // Tailwind bg class
  dot: string;      // Preview dot hex
}[] = [
  { id: 'gray',       label: 'رمادي',     header: 'from-gray-600 to-gray-800',       bg: 'bg-gray-50',    dot: '#6b7280' },
  { id: 'blue',      label: 'أزرق',       header: 'from-blue-500 to-blue-700',       bg: 'bg-blue-50',    dot: '#3b82f6' },
  { id: 'green',     label: 'أخضر',       header: 'from-emerald-500 to-green-700',   bg: 'bg-emerald-50', dot: '#10b981' },
  { id: 'purple',    label: 'بنفسجي',    header: 'from-purple-500 to-violet-700',   bg: 'bg-purple-50',  dot: '#8b5cf6' },
  { id: 'orange',    label: 'برتقالي',   header: 'from-orange-500 to-orange-700',   bg: 'bg-orange-50',  dot: '#f97316' },
  { id: 'amber',     label: 'ذهبي',      header: 'from-amber-400 to-amber-600',     bg: 'bg-amber-50',   dot: '#f59e0b' },
  { id: 'teal',      label: 'فيروزي',     header: 'from-teal-500 to-cyan-700',       bg: 'bg-teal-50',    dot: '#14b8a6' },
  { id: 'rose',      label: 'وردي',       header: 'from-rose-500 to-pink-600',       bg: 'bg-rose-50',    dot: '#f43f5e' },
  { id: 'midnight',  label: 'أزرق غامق', header: 'from-slate-700 to-blue-900',      bg: 'bg-slate-50',   dot: '#1e40af' },
];

// ─── Layout Variants ─────────────────────────────────────────────
// Only 'custom' card types support layout switching via renderItemList.
// kpis / budget / swot / logframe have their own fixed renderers that
// do NOT read layoutVariant, so we hide those options for those types.
const LAYOUT_OPTIONS: {
  id: CardStyle['layoutVariant'];
  label: string;
  icon: React.ReactNode;
  forTypes: (CardType | 'custom')[];
  supportsItemIcons: boolean; // whether this layout uses item icons (numbered, check, arrow, dot, etc.)
}[] = [
  { id: 'cards',    label: 'بطاقات',      icon: <CreditCard className="h-4 w-4" />,   forTypes: ['custom'], supportsItemIcons: true },
  { id: 'list',     label: 'قائمة',       icon: <List className="h-4 w-4" />,         forTypes: ['custom'], supportsItemIcons: true },
  { id: 'grid',     label: 'شبكة',        icon: <LayoutGrid className="h-4 w-4" />,   forTypes: ['custom'], supportsItemIcons: true },
  { id: 'numbered', label: 'مرقّم',       icon: <Hash className="h-4 w-4" />,         forTypes: ['custom'], supportsItemIcons: true },
  { id: 'quote',    label: 'اقتباس',      icon: <Quote className="h-4 w-4" />,        forTypes: ['custom'], supportsItemIcons: false },
  { id: 'timeline', label: 'جدول زمني',   icon: <Rows3 className="h-4 w-4" />,        forTypes: ['custom'], supportsItemIcons: true },
  { id: 'compact',  label: 'مضغوط',       icon: <AlignLeft className="h-4 w-4" />,    forTypes: ['custom'], supportsItemIcons: true },
  { id: 'table',    label: 'جدول',        icon: <AlignCenter className="h-4 w-4" />,  forTypes: ['custom'], supportsItemIcons: false },
];

// ─── Item Styles ─────────────────────────────────────────────────
const ITEM_STYLES: { id: CardStyle['itemStyle']; label: string; icon: React.ReactNode }[] = [
  { id: 'numbered', label: 'أرقام',      icon: <Hash className="h-3.5 w-3.5" /> },
  { id: 'check',    label: 'صح',         icon: <CheckSquare className="h-3.5 w-3.5" /> },
  { id: 'arrow',    label: 'سهم',        icon: <ArrowRight className="h-3.5 w-3.5" /> },
  { id: 'dot',      label: 'نقطة',       icon: <Dot className="h-3.5 w-3.5" /> },
  { id: 'star',     label: 'نجمة',       icon: <Star className="h-3.5 w-3.5" /> },
  { id: 'card',     label: 'بطاقة',      icon: <CreditCard className="h-3.5 w-3.5" /> },
];

// ─── Text Sizes ──────────────────────────────────────────────────
const TEXT_SIZES: { id: CardStyle['textSize']; label: string }[] = [
  { id: 'sm', label: 'صغير' },
  { id: 'md', label: 'متوسط' },
  { id: 'lg', label: 'كبير' },
];

// ─── Cover Layouts ───────────────────────────────────────────────
const COVER_LAYOUTS: { id: 'centered' | 'left-aligned' | 'minimal' | 'bold'; label: string }[] = [
  { id: 'centered', label: 'مركزي' },
  { id: 'left-aligned', label: 'محاذاة لليسار' },
  { id: 'minimal', label: 'بسيط' },
  { id: 'bold', label: 'واضح' },
];

// Custom cards with list content use layout & item icons (Vision, Idea, etc. don't)
const LIST_CONTENT_KEYS = ['detailedObjectives','justifications','features','strengths','outputs','expectedResults','risks'];

// ─── Component ───────────────────────────────────────────────────
interface StylePanelProps {
  cardId: string;
  cardType: CardType;
  currentStyle: CardStyle;
  contentKey?: string;
  onClose: () => void;
  onDeleteCard: () => void;
}

export function StylePanel({ cardId, cardType, currentStyle, contentKey = '', onClose, onDeleteCard }: StylePanelProps) {
  const { updateCardStyle, theme, updateCoverSlide } = useSlideStore();
  const [uploadingCoverBg, setUploadingCoverBg] = useState(false);
  const coverBgInputRef = useRef<HTMLInputElement>(null);

  const update = (updates: Partial<CardStyle>) => {
    updateCardStyle(cardId, updates);
  };

  const handleCoverBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      if (file) toast.error('يرجى اختيار ملف صورة فقط');
      return;
    }
    setUploadingCoverBg(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      updateCoverSlide({ backgroundImage: data.url });
      toast.success('تم رفع صورة الغلاف بنجاح');
    } catch (err) {
      toast.error('فشل رفع الصورة');
      console.error(err);
    } finally {
      setUploadingCoverBg(false);
      if (coverBgInputRef.current) coverBgInputRef.current.value = '';
    }
  };

  // Layout & Item Icon only apply to custom cards with list content (outputs, risks, etc.)
  const hasListContent = cardType === 'custom' && LIST_CONTENT_KEYS.includes(contentKey);

  // Available layouts for this card type (only when content uses them)
  const availableLayouts = hasListContent ? LAYOUT_OPTIONS.filter(l => l.forTypes.includes(cardType as any)) : [];

  // Item icons only make sense for layouts that support them (quote and table don't)
  const effectiveLayout = currentStyle.layoutVariant ?? 'cards';
  const selectedLayout = availableLayouts.find(l => l.id === effectiveLayout);
  const showItemIcons = hasListContent && (selectedLayout?.supportsItemIcons ?? true);

  const coverSlide = theme.coverSlide;

  return (
    <div className="w-72 bg-white border-l border-gray-200 shadow-xl flex flex-col" style={{ height: '100%', maxHeight: '100vh' }} dir="rtl">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm">
          {cardType === 'cover' ? 'تنسيق الغلاف' : 'تنسيق البطاقة'}
        </h3>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-6">

          {/* ── Cover Slide Formatting (when cover is selected) ── */}
          {cardType === 'cover' ? (
            <>
              <section>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Layout className="h-3.5 w-3.5" /> تخطيط الغلاف
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {COVER_LAYOUTS.map(l => (
                    <button
                      key={l.id}
                      onClick={() => updateCoverSlide({ layout: l.id })}
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                        coverSlide.layout === l.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">لون خلفية الغلاف</h4>
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
              </section>
              <section>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">صورة خلفية (اختياري)</h4>
                <input ref={coverBgInputRef} type="file" accept="image/*" onChange={handleCoverBgUpload} className="hidden" />
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => coverBgInputRef.current?.click()}
                    disabled={uploadingCoverBg}
                  >
                    {uploadingCoverBg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploadingCoverBg ? 'جاري الرفع...' : 'رفع صورة'}
                  </Button>
                </div>
                <input
                  type="url"
                  value={coverSlide.backgroundImage ?? ''}
                  onChange={e => updateCoverSlide({ backgroundImage: e.target.value || undefined })}
                  placeholder="أو أدخل رابط الصورة..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </section>
              {coverSlide.backgroundImage && (
                <>
                  <section>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">حجم الصورة</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'cover', label: 'تغطية كاملة' },
                        { id: 'contain', label: 'احتواء' },
                        { id: 'auto', label: 'تلقائي' },
                      ].map(s => (
                        <button
                          key={s.id}
                          onClick={() => updateCoverSlide({ backgroundSize: s.id as any })}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            (coverSlide.backgroundSize || 'cover') === s.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">موضع الصورة</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'center', label: 'وسط' },
                        { id: 'top', label: 'أعلى' },
                        { id: 'bottom', label: 'أسفل' },
                        { id: 'left', label: 'يسار' },
                        { id: 'right', label: 'يمين' },
                      ].map(p => (
                        <button
                          key={p.id}
                          onClick={() => updateCoverSlide({ backgroundPosition: p.id })}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            (coverSlide.backgroundPosition || 'center') === p.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </>
          ) : (
          <>
          {/* ── Color Theme ─────────────────────────────────── */}
          <section>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">لون البطاقة</h4>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => update({ colorTheme: theme.id })}
                  className={`
                    flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all
                    ${currentStyle.colorTheme === theme.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  {/* Mini preview of the gradient header */}
                  <div className={`w-full h-6 rounded-lg bg-gradient-to-r ${theme.header}`} />
                  <span className="text-[10px] text-gray-600 font-medium">{theme.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Layout Variant ──────────────────────────────── */}
          {availableLayouts.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">تخطيط المحتوى</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableLayouts.map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => update({ layoutVariant: layout.id })}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm transition-all
                      ${currentStyle.layoutVariant === layout.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                      }
                    `}
                  >
                    {layout.icon}
                    <span className="text-xs font-medium">{layout.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ── Item Style (only when layout supports icons: cards, list, grid, numbered, timeline, compact) ── */}
          {showItemIcons && (
            <section>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">أيقونة العناصر</h4>
              <div className="grid grid-cols-3 gap-2">
                {ITEM_STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => update({ itemStyle: s.id })}
                    className={`
                      flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all
                      ${currentStyle.itemStyle === s.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-500 bg-white'
                      }
                    `}
                  >
                    {s.icon}
                    <span className="text-[10px] font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ── Text Size ───────────────────────────────────── */}
          <section>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">حجم النص</h4>
            <div className="flex gap-2">
              {TEXT_SIZES.map(s => (
                <button
                  key={s.id}
                  onClick={() => update({ textSize: s.id })}
                  className={`
                    flex-1 py-2 rounded-xl border-2 text-sm transition-all font-medium
                    ${currentStyle.textSize === s.id || (!currentStyle.textSize && s.id === 'md')
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-500 bg-white'
                    }
                  `}
                >
                  <Type className={`mx-auto mb-0.5 ${s.id === 'sm' ? 'h-3 w-3' : s.id === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  <span className="text-[10px]">{s.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Content Alignment ───────────────────────────── */}
          <section>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">محاذاة المحتوى</h4>
            <div className="flex gap-2">
              {(['top', 'center', 'bottom'] as const).map(align => {
                const labels = { top: 'أعلى', center: 'وسط', bottom: 'أسفل' };
                return (
                  <button
                    key={align}
                    onClick={() => update({ contentAlignment: align })}
                    className={`
                      flex-1 py-2 rounded-xl border-2 text-xs transition-all font-medium
                      ${currentStyle.contentAlignment === align
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-500 bg-white'
                      }
                    `}
                  >
                    {labels[align]}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Header Visibility ───────────────────────────── */}
          <section>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">خيارات الرأس</h4>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">إظهار رأس البطاقة</span>
              <button
                onClick={() => update({ showHeader: !currentStyle.showHeader })}
                className={`
                  relative w-11 h-6 rounded-full transition-colors
                  ${currentStyle.showHeader ? 'bg-blue-500' : 'bg-gray-300'}
                `}
              >
                <span className={`
                  absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                  ${currentStyle.showHeader ? 'translate-x-0.5' : 'translate-x-5'}
                `} />
              </button>
            </label>
          </section>

          {/* ── Per-Slide Logo Control ─────────────────────── */}
          {theme.logo && (
            <section className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">الشعار</h4>
              
              {/* Show/Hide Logo */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700">إظهار الشعار</span>
                <button
                  onClick={() => update({ showLogo: !currentStyle.showLogo })}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors
                    ${currentStyle.showLogo ? 'bg-blue-500' : 'bg-gray-300'}
                  `}
                >
                  <span className={`
                    absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                    ${currentStyle.showLogo ? 'translate-x-0.5' : 'translate-x-5'}
                  `} />
                </button>
              </label>

              {currentStyle.showLogo && (
                <>
                  {/* Logo Position */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">موضع الشعار</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'top-left', label: 'أعلى يسار' },
                        { id: 'top-right', label: 'أعلى يمين' },
                        { id: 'center', label: 'وسط' },
                        { id: 'bottom-left', label: 'أسفل يسار' },
                        { id: 'bottom-right', label: 'أسفل يمين' },
                      ].map(pos => (
                        <button
                          key={pos.id}
                          onClick={() => update({ logoPosition: pos.id as any })}
                          className={`
                            px-2 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${(currentStyle.logoPosition || theme.logoPosition) === pos.id
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

                  {/* Logo Size */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">حجم الشعار</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'small', label: 'صغير' },
                        { id: 'medium', label: 'متوسط' },
                        { id: 'large', label: 'كبير' },
                      ].map(size => (
                        <button
                          key={size.id}
                          onClick={() => update({ logoSize: size.id as any })}
                          className={`
                            px-2 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${(currentStyle.logoSize || theme.logoSize) === size.id
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
                </>
              )}
            </section>
          )}

          </>
          )}

        </div>
      </div>

      {/* Delete card */}
      <div className="flex-shrink-0 p-4 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-red-500 border-red-200 hover:bg-red-50"
          onClick={onDeleteCard}
        >
          <Trash2 className="h-4 w-4" />
          حذف البطاقة
        </Button>
      </div>
    </div>
  );
}
