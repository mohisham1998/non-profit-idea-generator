import { useSlideStore, CardStyle, CardType } from '@/stores/slideStore';
import { Button } from '@/components/ui/button';
import {
  X, Trash2, List, LayoutGrid, Quote, Hash, CheckSquare, ArrowRight,
  Dot, Star, CreditCard, AlignLeft, AlignCenter, Type, Rows3,
} from 'lucide-react';

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
}[] = [
  { id: 'cards',    label: 'بطاقات',      icon: <CreditCard className="h-4 w-4" />,   forTypes: ['custom'] },
  { id: 'list',     label: 'قائمة',       icon: <List className="h-4 w-4" />,         forTypes: ['custom'] },
  { id: 'grid',     label: 'شبكة',        icon: <LayoutGrid className="h-4 w-4" />,   forTypes: ['custom'] },
  { id: 'numbered', label: 'مرقّم',       icon: <Hash className="h-4 w-4" />,         forTypes: ['custom'] },
  { id: 'quote',    label: 'اقتباس',      icon: <Quote className="h-4 w-4" />,        forTypes: ['custom'] },
  { id: 'timeline', label: 'جدول زمني',   icon: <Rows3 className="h-4 w-4" />,        forTypes: ['custom'] },
  { id: 'compact',  label: 'مضغوط',       icon: <AlignLeft className="h-4 w-4" />,    forTypes: ['custom'] },
  { id: 'table',    label: 'جدول',        icon: <AlignCenter className="h-4 w-4" />,  forTypes: ['custom'] },
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

// ─── Component ───────────────────────────────────────────────────
interface StylePanelProps {
  cardId: string;
  cardType: CardType;
  currentStyle: CardStyle;
  onClose: () => void;
  onDeleteCard: () => void;
}

export function StylePanel({ cardId, cardType, currentStyle, onClose, onDeleteCard }: StylePanelProps) {
  const { updateCardStyle } = useSlideStore();

  const update = (updates: Partial<CardStyle>) => {
    updateCardStyle(cardId, updates);
  };

  // Available layouts for this card type
  const availableLayouts = LAYOUT_OPTIONS.filter(l =>
    l.forTypes.includes(cardType as any)
  );

  return (
    <div className="w-72 bg-white border-l border-gray-200 shadow-xl flex flex-col" style={{ height: '100%', maxHeight: '100vh' }} dir="rtl">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm">تنسيق البطاقة</h3>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-6">

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

          {/* ── Item Style (only for custom cards with list-based layouts) ── */}
          {cardType === 'custom' && (
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
