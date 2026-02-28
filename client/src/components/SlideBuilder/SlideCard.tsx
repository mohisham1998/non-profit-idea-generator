import React, { useState, useEffect } from 'react';
import { SlideCard as SlideCardType } from '@/stores/slideStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Gauge, 
  DollarSign, 
  Grid3X3, 
  Table2, 
  Calendar,
  FolderKanban,
  Lightbulb,
  Megaphone,
  Sparkles,
  Edit3,
  Palette,
  MessageSquare,
  MoreVertical,
  Target,
  Eye,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  FileText,
  Users,
  Clock,
  Save,
  X,
  Plus,
  Trash2,
  ArrowRight
} from 'lucide-react';

interface SlideCardProps {
  card: SlideCardType;
  isSelected?: boolean;
  isEditing?: boolean;
  onClick?: () => void;
  logo?: string;
  logoPosition?: string;
  logoSize?: string;
  applyLogoToAllSlides?: boolean;
  globalBackgroundColor?: string;
  globalBackgroundImage?: string;
  applyGlobalBackground?: boolean;
  coverSlide?: { backgroundColor?: string; backgroundImage?: string; layout?: 'centered' | 'left-aligned' | 'minimal' | 'bold' };
  onEdit?: () => void;
  onStyle?: () => void;
  onAIChat?: () => void;
  onSave?: (title: string, content: any) => void;
  onCancel?: () => void;
}

export function SlideCard({ card, isSelected, isEditing, onClick, logo, logoPosition, logoSize, applyLogoToAllSlides, globalBackgroundColor, globalBackgroundImage, applyGlobalBackground, coverSlide, onEdit, onStyle, onAIChat, onSave, onCancel }: SlideCardProps) {
  const { style, title, type, content } = card;

  // Draft state for editing
  const [draftTitle, setDraftTitle] = useState(title);
  const [draft, setDraft] = useState<any>(null);

  // Sync draft when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setDraftTitle(title);
      setDraft(JSON.parse(JSON.stringify(content)));
    }
  }, [isEditing, title, content]);

  // Helper to update a nested field in draft
  const updateDraft = (field: string, value: any) => {
    setDraft((prev: any) => ({ ...prev, [field]: value }));
  };

  // Helper to update an item in a draft array
  const updateDraftArrayItem = (arrayField: string, idx: number, field: string, value: any) => {
    setDraft((prev: any) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (Array.isArray(copy[arrayField]) && copy[arrayField][idx] !== undefined) {
        if (field === '_self') {
          copy[arrayField][idx] = value;
        } else {
          copy[arrayField][idx][field] = value;
        }
      }
      return copy;
    });
  };

  const addDraftArrayItem = (arrayField: string, newItem: any) => {
    setDraft((prev: any) => ({
      ...prev,
      [arrayField]: [...(prev[arrayField] || []), newItem],
    }));
  };

  const removeDraftArrayItem = (arrayField: string, idx: number) => {
    setDraft((prev: any) => ({
      ...prev,
      [arrayField]: (prev[arrayField] || []).filter((_: any, i: number) => i !== idx),
    }));
  };
  
  // ─── Per-section theme lookup for custom (initial idea) cards ─────
  const contentKey = type === 'custom' ? (Object.keys(content || {})[0] ?? '') : '';

  const CUSTOM_THEMES: Record<string, { header: string; bg: string; icon: React.ReactNode }> = {
    vision:             { header: 'bg-gradient-to-r from-purple-600 to-violet-700 text-white',  bg: 'bg-gradient-to-br from-purple-50 to-violet-50',  icon: <Eye className="h-5 w-5" /> },
    generalObjective:   { header: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white',       bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',    icon: <Target className="h-5 w-5" /> },
    detailedObjectives: { header: 'bg-gradient-to-r from-indigo-500 to-indigo-700 text-white',   bg: 'bg-gradient-to-br from-indigo-50 to-blue-50',    icon: <CheckCircle className="h-5 w-5" /> },
    idea:               { header: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',   icon: <Lightbulb className="h-5 w-5" /> },
    justifications:     { header: 'bg-gradient-to-r from-teal-500 to-teal-700 text-white',       bg: 'bg-gradient-to-br from-teal-50 to-emerald-50',   icon: <FileText className="h-5 w-5" /> },
    features:           { header: 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white',  bg: 'bg-gradient-to-br from-fuchsia-50 to-purple-50', icon: <Sparkles className="h-5 w-5" /> },
    strengths:          { header: 'bg-gradient-to-r from-green-600 to-emerald-700 text-white',   bg: 'bg-gradient-to-br from-green-50 to-emerald-50',  icon: <TrendingUp className="h-5 w-5" /> },
    outputs:            { header: 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white',        bg: 'bg-gradient-to-br from-sky-50 to-cyan-50',       icon: <Zap className="h-5 w-5" /> },
    expectedResults:    { header: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white',       bg: 'bg-gradient-to-br from-rose-50 to-pink-50',      icon: <TrendingUp className="h-5 w-5" /> },
    risks:              { header: 'bg-gradient-to-r from-red-500 to-rose-700 text-white',        bg: 'bg-gradient-to-br from-red-50 to-rose-50',       icon: <AlertTriangle className="h-5 w-5" /> },
    proposedNames:      { header: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white',   bg: 'bg-gradient-to-br from-violet-50 to-purple-50',  icon: <Sparkles className="h-5 w-5" /> },
  };

  const customTheme = CUSTOM_THEMES[contentKey];

  // Get icon based on card type
  const getIcon = () => {
    const iconClass = "h-5 w-5";
    if (type === 'custom' && customTheme) return <>{customTheme.icon}</>;
    switch (type) {
      case 'cover': return <Sparkles className={iconClass} />;
      case 'kpis': return <Gauge className={iconClass} />;
      case 'budget': return <DollarSign className={iconClass} />;
      case 'swot': return <Grid3X3 className={iconClass} />;
      case 'logframe': return <Table2 className={iconClass} />;
      case 'timeline': return <Calendar className={iconClass} />;
      case 'pmdpro': return <FolderKanban className={iconClass} />;
      case 'designThinking': return <Lightbulb className={iconClass} />;
      case 'marketing': return <Megaphone className={iconClass} />;
      default: return <FileText className={iconClass} />;
    }
  };
  
  // Theme gradient map (matches StylePanel COLOR_THEMES)
  // 'default' means "use card-type default styling" (no explicit user choice).
  // 'gray' is a real explicit color the user can pick in the format panel.
  const THEME_HEADER: Record<string, string> = {
    gray:     'bg-gradient-to-r from-gray-600 to-gray-800 text-white',
    blue:     'bg-gradient-to-r from-blue-500 to-blue-700 text-white',
    green:    'bg-gradient-to-r from-emerald-500 to-green-700 text-white',
    purple:   'bg-gradient-to-r from-purple-500 to-violet-700 text-white',
    orange:   'bg-gradient-to-r from-orange-500 to-orange-700 text-white',
    amber:    'bg-gradient-to-r from-amber-400 to-amber-600 text-white',
    teal:     'bg-gradient-to-r from-teal-500 to-cyan-700 text-white',
    rose:     'bg-gradient-to-r from-rose-500 to-pink-600 text-white',
    midnight: 'bg-gradient-to-r from-slate-700 to-blue-900 text-white',
  };

  const THEME_BG: Record<string, string> = {
    gray:     'bg-gray-50',
    blue:     'bg-blue-50',
    green:    'bg-emerald-50',
    purple:   'bg-purple-50',
    orange:   'bg-orange-50',
    amber:    'bg-amber-50',
    teal:     'bg-teal-50',
    rose:     'bg-rose-50',
    midnight: 'bg-slate-50',
  };

  // Get header color — explicit colorTheme always overrides per-type default
  const getHeaderColor = (): string => {
    const ct = style.colorTheme;
    // Any explicit user choice (including 'gray') overrides the per-type default
    if (ct && ct !== 'default' && THEME_HEADER[ct]) return THEME_HEADER[ct];
    // For custom cards with no explicit theme, use the section's own theme
    if (type === 'custom' && customTheme && ct === 'default') return customTheme.header;
    // Per-type defaults (only reached when ct === 'default')
    switch (type) {
      case 'cover':         return 'bg-gradient-to-r from-gray-700 to-gray-900 text-white';
      case 'kpis':          return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'budget':        return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
      case 'swot':          return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'logframe':      return 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white';
      case 'timeline':      return 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white';
      case 'pmdpro':        return 'bg-gradient-to-r from-violet-500 to-violet-600 text-white';
      case 'designThinking':return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
      case 'marketing':     return 'bg-gradient-to-r from-pink-500 to-pink-600 text-white';
      default:              return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  // Get background color — explicit colorTheme always overrides per-type default
  const getCardBg = (): string => {
    const ct = style.colorTheme;
    if (ct && ct !== 'default' && THEME_BG[ct]) return THEME_BG[ct];
    if (type === 'custom' && customTheme && ct === 'default') return customTheme.bg;
    // Per-type defaults (only reached when ct === 'default')
    switch (type) {
      case 'budget':   return 'bg-gradient-to-br from-emerald-50 to-green-50';
      case 'swot':     return 'bg-gradient-to-br from-purple-50 to-violet-50';
      case 'kpis':     return 'bg-gradient-to-br from-blue-50 to-cyan-50';
      case 'logframe': return 'bg-gradient-to-br from-indigo-50 to-blue-50';
      default:         return 'bg-white';
    }
  };
  
  // ─── Edit Mode Renderers (removed – editing now happens inline) ──


  // Render content based on card type
  // ─── Inline Edit Helpers ─────────────────────────────────────
  // ET: inline-editable text block (textarea). Only shown when isEditing.
  const ET = (text: string, field: string, extraCls = '', rows = 3) =>
    isEditing ? (
      <textarea
        value={draft?.[field] !== undefined ? String(draft[field]) : text}
        onChange={e => updateDraft(field, e.target.value)}
        rows={rows}
        dir="rtl"
        onClick={e => e.stopPropagation()}
        placeholder={text || 'أدخل النص هنا...'}
        className={`block w-full bg-blue-50 border border-dashed border-blue-400 rounded-xl px-4 py-3 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 ${extraCls}`}
      />
    ) : <>{text}</>;

  // EI: inline-editable single-line input
  const EI = (text: string, field: string, extraCls = '') =>
    isEditing ? (
      <input
        value={draft?.[field] !== undefined ? String(draft[field]) : text}
        onChange={e => updateDraft(field, e.target.value)}
        dir="rtl"
        onClick={e => e.stopPropagation()}
        placeholder={text || '...'}
        className={`block w-full bg-blue-50 border border-dashed border-blue-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${extraCls}`}
      />
    ) : <>{text}</>;

  // EList: inline-editable list. Content stored as \n-separated string in draft.
  // Uses a stable draft-key so React doesn't recreate inputs on each keystroke.
  const EList = (items: string[], field: string, acMain: string) => {
    if (!isEditing) return null;
    // Read from draft if available; otherwise seed from items
    // IMPORTANT: do NOT filter(Boolean) here – we need to keep empty strings so
    // newly added rows remain visible for the user to type into.
    const draftText: string = draft?.[field] !== undefined
      ? String(draft[field])
      : items.join('\n');
    // Split but keep empty strings (needed for new rows)
    const draftItems: string[] = draftText === '' ? [''] : draftText.split('\n');

    const setItems = (newItems: string[]) => updateDraft(field, newItems.join('\n'));

    return (
      <div className="px-6 pb-4 pt-3 space-y-2 bg-blue-50/60 border-t-2 border-dashed border-blue-300">
        <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-2">تعديل العناصر</p>
        {draftItems.map((item, idx) => (
          // Use field+idx as key so item inputs are stable
          <div key={`${field}-${idx}`} className="flex gap-2 items-center">
            <div style={{ background: acMain, color: '#fff' }}
                 className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
              {idx + 1}
            </div>
            <input
              autoFocus={idx === draftItems.length - 1 && item === ''}
              value={item}
              onChange={e => {
                const copy = [...draftItems];
                copy[idx] = e.target.value;
                setItems(copy);
              }}
              dir="rtl"
              onClick={e => e.stopPropagation()}
              placeholder="اكتب هنا..."
              className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={e => { e.stopPropagation(); setItems(draftItems.filter((_, i) => i !== idx)); }}
              className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={e => { e.stopPropagation(); setItems([...draftItems, '']); }}
          className="flex items-center gap-1.5 text-blue-600 text-sm font-medium hover:text-blue-800 pt-1 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> إضافة عنصر
        </button>
      </div>
    );
  };

  // EArrField: editable array of objects (for KPIs, budget categories, SWOT items)
  const EArrField = (arr: any[], arrKey: string, itemField: string, placeholder = '', idx: number) =>
    isEditing ? (
      <input
        value={draft?.[arrKey]?.[idx]?.[itemField] ?? arr[idx]?.[itemField] ?? ''}
        onChange={e => updateDraftArrayItem(arrKey, idx, itemField, e.target.value)}
        dir="rtl"
        onClick={e => e.stopPropagation()}
        placeholder={placeholder}
        className="block w-full bg-blue-50 border border-dashed border-blue-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
    ) : null;

  const renderContent = () => {
    switch (type) {
      case 'cover':      return renderCoverContent();
      case 'kpis':       return renderKPIsContent();
      case 'budget':     return renderBudgetContent();
      case 'swot':       return renderSWOTContent();
      case 'logframe':   return renderLogFrameContent();
      case 'custom':     return renderCustomContent();
      default:           return renderGenericContent();
    }
  };
  
  const renderCoverContent = () => {
    const d = isEditing ? draft ?? content : content;
    const layout = coverSlide?.layout ?? 'centered';
    const layoutCls = layout === 'centered' ? 'flex flex-col items-center justify-center text-center min-h-[200px]' :
                      layout === 'left-aligned' ? 'flex flex-col items-start justify-center text-right min-h-[200px]' :
                      layout === 'minimal' ? 'flex flex-col items-center justify-center text-center min-h-[200px] py-12' :
                      'flex flex-col items-center justify-center text-center min-h-[200px]';
    return (
    <div className={`py-8 px-6 ${layoutCls}`}>
      <h1 className={`font-bold mb-4 text-gray-900 ${layout === 'bold' ? 'text-4xl' : layout === 'minimal' ? 'text-2xl' : 'text-3xl'}`}>
        {isEditing
          ? <EI text={d.title ?? ''} field="title" extraCls="font-bold text-gray-900 w-full" />
          : d.title}
      </h1>
      {(isEditing || d.subtitle) && (
        <p className={`text-gray-600 mb-6 leading-relaxed ${layout === 'bold' ? 'text-xl' : layout === 'minimal' ? 'text-base' : 'text-lg'}`}>
          {isEditing
            ? <ET text={d.subtitle ?? ''} field="subtitle" extraCls="text-gray-600 w-full" rows={2} />
            : d.subtitle}
        </p>
      )}
      <div className="flex flex-wrap gap-4 mt-6">
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
          <Users className="h-4 w-4 flex-shrink-0" />
          {isEditing
            ? <EI text={d.targetAudience ?? ''} field="targetAudience" extraCls="text-sm font-medium" />
            : d.targetAudience && <span className="text-sm font-medium">{d.targetAudience}</span>}
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
          <Clock className="h-4 w-4 flex-shrink-0" />
          {isEditing
            ? <EI text={d.duration ?? ''} field="duration" extraCls="text-sm font-medium" />
            : d.duration && <span className="text-sm font-medium">{d.duration}</span>}
        </div>
      </div>
    </div>
    );
  };
  
  const renderKPIsContent = () => {
    // Use theme color; default to blue for KPIs
    const kpiAccentKey = (themeAccent as string) || 'blue';
    const kpiTC = (TC as any)[kpiAccentKey] ?? (TC as any).blue;

    // Helper to safely get text value
    const getText = (val: any): string => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'number') return String(val);
      if (typeof val === 'object') return val.text || val.value || val.name || JSON.stringify(val);
      return String(val);
    };

    // Get KPIs array - could be in different formats
    const kpis = content.kpis || content.indicators || content.metrics || [];
    
    const draftKpis: any[] = isEditing ? (draft?.kpis ?? draft?.indicators ?? kpis) : kpis;
    return (
      <div className="p-6">
        {Array.isArray(draftKpis) && draftKpis.length > 0 ? (
          <div className="space-y-4">
            {draftKpis.map((kpi: any, idx: number) => (
              <div key={idx} style={{ borderColor: isEditing ? '#bfdbfe' : kpiTC.border }}
                   className="bg-white rounded-xl p-4 border shadow-sm">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                       style={{ background: kpiTC.lighter }}>
                    <Target className="h-4 w-4" style={{ color: kpiTC.main }} />
                  </div>
                  <div className="flex-1 space-y-2">
                    {isEditing ? (
                      <input
                        value={kpi.name ?? kpi.indicator ?? kpi.title ?? ''}
                        onChange={e => updateDraftArrayItem('kpis', idx, 'name', e.target.value)}
                        dir="rtl" onClick={e => e.stopPropagation()}
                        placeholder={`مؤشر ${idx + 1}`}
                        className="font-semibold text-gray-900 w-full bg-blue-50 border border-dashed border-blue-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    ) : (
                      <h4 className="font-semibold text-gray-900">{getText(kpi.name || kpi.indicator || kpi.title || `مؤشر ${idx + 1}`)}</h4>
                    )}
                    {isEditing ? (
                      <textarea
                        value={kpi.description ?? ''}
                        onChange={e => updateDraftArrayItem('kpis', idx, 'description', e.target.value)}
                        dir="rtl" onClick={e => e.stopPropagation()}
                        placeholder="وصف المؤشر" rows={2}
                        className="text-sm text-gray-600 w-full bg-blue-50 border border-dashed border-blue-400 rounded-lg px-3 py-1.5 resize-none focus:outline-none"
                      />
                    ) : kpi.description ? (
                      <p className="text-sm text-gray-600">{getText(kpi.description)}</p>
                    ) : null}
                    <div className="flex gap-3 flex-wrap">
                      {isEditing ? (
                        <>
                          <input value={kpi.target ?? ''} onChange={e => updateDraftArrayItem('kpis', idx, 'target', e.target.value)}
                            dir="rtl" onClick={e => e.stopPropagation()} placeholder="الهدف"
                            style={{ color: kpiTC.main }}
                            className="text-sm font-bold bg-blue-50 border border-dashed border-blue-400 rounded px-2 py-1 w-28 focus:outline-none" />
                          <input value={kpi.frequency ?? ''} onChange={e => updateDraftArrayItem('kpis', idx, 'frequency', e.target.value)}
                            dir="rtl" onClick={e => e.stopPropagation()} placeholder="التكرار"
                            className="text-xs text-gray-500 bg-blue-50 border border-dashed border-blue-400 rounded px-2 py-1 w-24 focus:outline-none" />
                          <button onClick={e => { e.stopPropagation(); removeDraftArrayItem('kpis', idx); }}
                            className="text-red-400 hover:text-red-600 ml-auto">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {kpi.target && <span className="text-sm font-bold" style={{ color: kpiTC.main }}>{getText(kpi.target)}</span>}
                          {kpi.frequency && <span className="text-xs text-gray-500">التكرار: {getText(kpi.frequency)}</span>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isEditing && (
              <button onClick={e => { e.stopPropagation(); addDraftArrayItem('kpis', { name: '', description: '', target: '', frequency: '' }); }}
                className="w-full py-2 border-2 border-dashed border-blue-300 rounded-xl text-blue-500 hover:bg-blue-50 text-sm flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> إضافة مؤشر
              </button>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">لا توجد مؤشرات أداء</p>
        )}
        {(isEditing || content.summary) && (
          <div className="mt-6 bg-blue-100 rounded-xl p-4">
            {isEditing
              ? <textarea value={draft?.summary ?? content.summary ?? ''} onChange={e => updateDraft('summary', e.target.value)}
                  dir="rtl" onClick={e => e.stopPropagation()} rows={2} placeholder="الملخص"
                  className="w-full bg-transparent text-sm text-blue-800 resize-none focus:outline-none border border-dashed border-blue-400 rounded p-1" />
              : <p className="text-sm text-blue-800">{getText(content.summary)}</p>}
          </div>
        )}
      </div>
    );
  };
  
  const renderBudgetContent = () => {
    // Use the theme color; fall back to green (natural for budget)
    // TC and themeAccent are defined later in component scope but available at call time
    const budgetAccentKey = (themeAccent as string) || 'green';
    const budgetTC = (TC as any)[budgetAccentKey] ?? (TC as any).green;
    const d = isEditing ? (draft ?? content) : content;
    const cats: any[] = d.categories ?? content.categories ?? [];
    return (
    <div className="p-6">
      <div className="text-center mb-8">
        <p className="text-sm text-gray-600 mb-2">الميزانية الإجمالية</p>
        {isEditing ? (
          <input type="number" dir="ltr" onClick={e => e.stopPropagation()}
            value={d.totalBudget ?? ''}
            onChange={e => updateDraft('totalBudget', Number(e.target.value))}
            style={{ color: budgetTC.main }}
            className="text-4xl font-bold text-center bg-blue-50 border border-dashed border-blue-400 rounded-xl px-4 py-2 w-full focus:outline-none" />
        ) : (
          <p style={{ color: budgetTC.main }} className="text-5xl font-bold">
            {typeof d.totalBudget === 'number' ? d.totalBudget.toLocaleString('ar-SA') : d.totalBudget}
          </p>
        )}
        {isEditing ? (
          <input dir="rtl" onClick={e => e.stopPropagation()} value={d.currency ?? 'ريال سعودي'}
            onChange={e => updateDraft('currency', e.target.value)}
            style={{ color: budgetTC.main }}
            className="text-lg mt-1 text-center bg-blue-50 border border-dashed border-blue-400 rounded-lg px-3 py-1 w-full focus:outline-none" />
        ) : (
          <p style={{ color: budgetTC.main }} className="text-lg mt-1 opacity-80">{d.currency || 'ريال سعودي'}</p>
        )}
      </div>
      {cats.length > 0 && (
        <div className="space-y-4">
          {cats.map((cat: any, idx: number) => (
            <div key={idx} style={{ borderColor: isEditing ? '#bfdbfe' : budgetTC.border }}
                 className="bg-white rounded-xl p-4 border">
              <div className="flex items-center justify-between mb-3 gap-3">
                {isEditing ? (
                  <>
                    <input dir="rtl" onClick={e => e.stopPropagation()} value={cat.name ?? ''}
                      onChange={e => updateDraftArrayItem('categories', idx, 'name', e.target.value)} placeholder="اسم الفئة"
                      className="flex-1 font-medium text-gray-900 bg-blue-50 border border-dashed border-blue-400 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                    <input type="number" dir="ltr" onClick={e => e.stopPropagation()} value={cat.amount ?? ''}
                      onChange={e => updateDraftArrayItem('categories', idx, 'amount', Number(e.target.value))} placeholder="المبلغ"
                      style={{ color: budgetTC.main }}
                      className="w-32 font-bold bg-blue-50 border border-dashed border-blue-400 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                    <button onClick={e => { e.stopPropagation(); removeDraftArrayItem('categories', idx); }} className="text-red-400 hover:text-red-600">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-gray-900">{cat.name}</span>
                    <span style={{ color: budgetTC.main }} className="font-bold">
                      {typeof cat.amount === 'number' ? cat.amount.toLocaleString('ar-SA') : cat.amount} ر.س
                    </span>
                  </>
                )}
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="h-3 rounded-full"
                     style={{ background: `linear-gradient(to right, ${budgetTC.main}, ${budgetTC.dark})`, width: `${Math.min(cat.percentage || 25, 100)}%` }} />
              </div>
            </div>
          ))}
          {isEditing && (
            <button onClick={e => { e.stopPropagation(); addDraftArrayItem('categories', { name: '', amount: 0, percentage: 0 }); }}
              style={{ borderColor: budgetTC.border, color: budgetTC.main }}
              className="w-full py-2 border-2 border-dashed rounded-xl hover:opacity-80 text-sm flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> إضافة فئة
            </button>
          )}
        </div>
      )}
    </div>
    );
  };
  
  const renderSWOTContent = () => {
    const swotQuadrants = [
      { key: 'strengths',    label: 'نقاط القوة',  bg: 'from-green-50 to-emerald-50', border: 'border-green-200', textColor: 'text-green-700', headerColor: 'text-green-800', iconBg: 'bg-green-500', Icon: TrendingUp },
      { key: 'weaknesses',   label: 'نقاط الضعف',  bg: 'from-red-50 to-rose-50',     border: 'border-red-200',   textColor: 'text-red-700',   headerColor: 'text-red-800',   iconBg: 'bg-red-500',   Icon: TrendingDown },
      { key: 'opportunities',label: 'الفرص',        bg: 'from-blue-50 to-cyan-50',     border: 'border-blue-200',  textColor: 'text-blue-700',  headerColor: 'text-blue-800',  iconBg: 'bg-blue-500',  Icon: Zap },
      { key: 'threats',      label: 'التهديدات',    bg: 'from-amber-50 to-orange-50',  border: 'border-amber-200', textColor: 'text-amber-700', headerColor: 'text-amber-800', iconBg: 'bg-amber-500', Icon: AlertTriangle },
    ] as const;

    const getSwotItems = (key: string): string[] => {
      const arr = (isEditing ? draft : content)?.[key] ?? content[key] ?? [];
      return (Array.isArray(arr) ? arr : []).map((i: any) => typeof i === 'string' ? i : i.title || i.point || '');
    };

    const setSwotItems = (key: string, items: string[]) => updateDraft(key, items);

    return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        {swotQuadrants.map(({ key, label, bg, border, textColor, headerColor, iconBg, Icon }) => {
          const items = getSwotItems(key);
          return (
            <div key={key} className={`bg-gradient-to-br ${bg} rounded-xl p-5 border ${border}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <h4 className={`font-bold ${headerColor}`}>{label}</h4>
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-1.5 items-center">
                      <input value={item} dir="rtl" onClick={e => e.stopPropagation()}
                        onChange={e => { const c = [...items]; c[idx] = e.target.value; setSwotItems(key, c); }}
                        className={`flex-1 text-sm ${textColor} bg-white/70 border border-dashed border-current rounded px-2 py-1 focus:outline-none`} />
                      <button onClick={e => { e.stopPropagation(); setSwotItems(key, items.filter((_, i) => i !== idx)); }}
                        className="text-red-400 hover:text-red-600 flex-shrink-0"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <button onClick={e => { e.stopPropagation(); setSwotItems(key, [...items, '']); }}
                    className={`flex items-center gap-1 text-xs ${textColor} hover:opacity-80`}>
                    <Plus className="h-3 w-3" /> إضافة
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {items.map((item, idx) => (
                    <li key={idx} className={`flex items-start gap-2 text-sm ${textColor}`}>
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
    );
  };

  const renderLogFrameContent = () => {
    // Helper function to safely render any value
    const safeRender = (value: any): string => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return String(value);
      if (Array.isArray(value)) return value.map(safeRender).join('، ');
      if (typeof value === 'object') {
        // Try common text fields
        return value.text || value.description || value.title || value.name || JSON.stringify(value);
      }
      return String(value);
    };

    return (
      <div className="p-6">
        {/* Goal/Impact */}
        {(content.goal || content.impact) && (
          <div className="mb-6 bg-indigo-100 rounded-xl p-4 border border-indigo-200">
            <h4 className="font-bold text-indigo-800 mb-2">الهدف الرئيسي</h4>
            <p className="text-indigo-700">{safeRender(content.goal || content.impact)}</p>
          </div>
        )}
        
        {/* Outcomes */}
        {content.outcomes && content.outcomes.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-gray-800 mb-3">النتائج</h4>
            <div className="space-y-3">
              {content.outcomes.map((outcome: any, idx: number) => (
                <div key={idx} className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="font-medium text-blue-800 mb-2">
                    {safeRender(outcome.narrative || outcome.description || outcome.title || outcome)}
                  </p>
                  {outcome.indicators && (
                    <p className="text-sm text-blue-600">
                      <span className="font-medium">المؤشرات:</span> {safeRender(outcome.indicators)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Outputs */}
        {content.outputs && content.outputs.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-gray-800 mb-3">المخرجات</h4>
            <div className="space-y-3">
              {content.outputs.map((output: any, idx: number) => (
                <div key={idx} className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="font-medium text-green-800 mb-2">
                    {safeRender(output.narrative || output.description || output.title || output)}
                  </p>
                  {output.indicators && (
                    <p className="text-sm text-green-600">
                      <span className="font-medium">المؤشرات:</span> {safeRender(output.indicators)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Activities */}
        {content.activities && content.activities.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-gray-800 mb-3">الأنشطة</h4>
            <div className="space-y-2">
              {content.activities.map((activity: any, idx: number) => (
                <div key={idx} className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-amber-800">
                    {safeRender(activity.narrative || activity.description || activity.title || activity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Objectives (alternative format) */}
        {content.objectives && content.objectives.length > 0 && (
          <div className="space-y-4">
            {content.objectives.map((obj: any, idx: number) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                <h5 className="font-semibold text-gray-900 mb-2">
                  {safeRender(obj.objective || obj.title || obj.narrative || `الهدف ${idx + 1}`)}
                </h5>
                {obj.indicators && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">المؤشرات:</span> {safeRender(obj.indicators)}
                  </div>
                )}
                {obj.activities && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">الأنشطة:</span> {safeRender(obj.activities)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Fallback for other logframe formats */}
        {!content.objectives && !content.goal && !content.impact && !content.outcomes && !content.outputs && (
          <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
            {JSON.stringify(content, null, 2)}
          </pre>
        )}
      </div>
    );
  };
  
  // ─── Shared helpers for custom card renderers ────────────────
  const parseLines = (text: any): string[] => {
    if (!text) return [];
    const str = typeof text === 'string' ? text : (Array.isArray(text) ? text.join('\n') : String(text));
    return str
      .split(/[\n\r]+/)
      .map((l: string) => l.replace(/^[-•*·▪▸►✦]\s*/, '').replace(/^\d+[.)]\s*/, '').trim())
      .filter(Boolean);
  };

  // ─── Hex color palette – avoids dynamic Tailwind class generation ─
  const TC: Record<string, { main: string; dark: string; light: string; lighter: string; border: string }> = {
    gray:    { main: '#6b7280', dark: '#374151', light: '#f3f4f6', lighter: '#f9fafb', border: '#e5e7eb' },
    blue:    { main: '#3b82f6', dark: '#1d4ed8', light: '#eff6ff', lighter: '#dbeafe', border: '#bfdbfe' },
    green:   { main: '#10b981', dark: '#059669', light: '#ecfdf5', lighter: '#d1fae5', border: '#a7f3d0' },
    purple:  { main: '#8b5cf6', dark: '#6d28d9', light: '#f5f3ff', lighter: '#ede9fe', border: '#ddd6fe' },
    orange:  { main: '#f97316', dark: '#ea580c', light: '#fff7ed', lighter: '#fed7aa', border: '#fdba74' },
    amber:   { main: '#f59e0b', dark: '#d97706', light: '#fffbeb', lighter: '#fde68a', border: '#fcd34d' },
    teal:    { main: '#14b8a6', dark: '#0d9488', light: '#f0fdfa', lighter: '#99f6e4', border: '#5eead4' },
    rose:    { main: '#f43f5e', dark: '#e11d48', light: '#fff1f2', lighter: '#fecdd3', border: '#fda4af' },
    slate:   { main: '#475569', dark: '#1e40af', light: '#f1f5f9', lighter: '#e2e8f0', border: '#cbd5e1' },
    indigo:  { main: '#6366f1', dark: '#4338ca', light: '#eef2ff', lighter: '#c7d2fe', border: '#a5b4fc' },
    fuchsia: { main: '#d946ef', dark: '#a21caf', light: '#fdf4ff', lighter: '#f0abfc', border: '#e879f9' },
    sky:     { main: '#0ea5e9', dark: '#0284c7', light: '#f0f9ff', lighter: '#bae6fd', border: '#7dd3fc' },
    red:     { main: '#ef4444', dark: '#dc2626', light: '#fef2f2', lighter: '#fecaca', border: '#fca5a5' },
    violet:  { main: '#7c3aed', dark: '#5b21b6', light: '#f5f3ff', lighter: '#ede9fe', border: '#c4b5fd' },
    cyan:    { main: '#06b6d4', dark: '#0e7490', light: '#ecfeff', lighter: '#cffafe', border: '#a5f3fc' },
  };

  // Map the card's colorTheme to an accent key, used to override per-section defaults
  const THEME_TO_ACCENT: Record<string, string> = {
    default:  '',       // empty = use per-section default color
    gray:     'gray',
    blue:     'blue',
    green:    'green',
    purple:   'purple',
    orange:   'orange',
    amber:    'amber',
    teal:     'teal',
    rose:     'rose',
    midnight: 'slate',
  };
  const themeAccent = THEME_TO_ACCENT[style.colorTheme] || '';

  // Derive rendering preferences from the card style
  const layoutVariant = style.layoutVariant ?? 'cards';
  const itemStyle     = style.itemStyle ?? 'numbered';
  const textSize      = style.textSize ?? 'md';
  const textSizeCls   = textSize === 'sm' ? 'text-sm' : textSize === 'lg' ? 'text-xl' : 'text-base';

  // Render a list of items applying the current itemStyle + layoutVariant
  // accentKey: color key from TC (e.g. 'blue', 'teal') — overridden by themeAccent when set
  const renderItemList = (items: string[], accentKey = 'blue') => {
    const key = themeAccent || accentKey;
    const c = TC[key] ?? TC.blue;

    const iconEl = (idx: number): React.ReactNode => {
      switch (itemStyle) {
        case 'check':    return <CheckCircle style={{ color: c.main }} className="h-5 w-5 flex-shrink-0 mt-0.5" />;
        case 'arrow':    return <ArrowRight  style={{ color: c.main }} className="h-5 w-5 flex-shrink-0 mt-0.5" />;
        case 'star':     return <Sparkles    style={{ color: c.main }} className="h-4 w-4 flex-shrink-0 mt-0.5" />;
        case 'dot':      return <div style={{ backgroundColor: c.main }} className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5" />;
        case 'card':
        case 'numbered':
        default:         return (
          <div style={{ background: `linear-gradient(135deg, ${c.main}, ${c.dark})`, color: '#fff' }}
               className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
            {idx + 1}
          </div>
        );
      }
    };

    if (layoutVariant === 'list') {
      return (
        <ul className="space-y-2 px-6 py-4">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              {itemStyle === 'numbered'
                ? <span style={{ color: c.main }} className="flex-shrink-0 font-bold w-5">{idx + 1}.</span>
                : iconEl(idx)
              }
              <span className={`text-gray-700 leading-relaxed ${textSizeCls}`}>{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (layoutVariant === 'grid') {
      return (
        <div className="p-4 grid grid-cols-2 gap-3">
          {items.map((item, idx) => (
            <div key={idx} style={{ borderColor: c.border }} className="bg-white rounded-xl p-4 border shadow-sm flex items-start gap-2">
              {iconEl(idx)}
              <span className={`text-gray-700 leading-relaxed ${textSizeCls}`}>{item}</span>
            </div>
          ))}
        </div>
      );
    }

    if (layoutVariant === 'numbered') {
      return (
        <div className="p-6 space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-5">
              {itemStyle === 'numbered' ? (
                <div style={{ background: `linear-gradient(135deg, ${c.main}, ${c.dark})`, color: '#fff' }}
                     className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow">
                  {idx + 1}
                </div>
              ) : (
                <div className="flex-shrink-0 mt-0.5">{iconEl(idx)}</div>
              )}
              <p className={`text-gray-800 leading-relaxed pt-2 ${textSizeCls}`}>{item}</p>
            </div>
          ))}
        </div>
      );
    }

    if (layoutVariant === 'timeline') {
      return (
        <div className="p-6">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 z-10 mt-0.5">
                  {itemStyle === 'dot' ? (
                    <div style={{ backgroundColor: c.main }} className="w-4 h-4 rounded-full" />
                  ) : (
                    iconEl(idx)
                  )}
                </div>
                {idx < items.length - 1 && <div style={{ backgroundColor: c.lighter }} className="w-0.5 flex-1 min-h-[32px]" />}
              </div>
              <div style={{ borderColor: c.border }} className="bg-white rounded-xl p-4 border shadow-sm flex-1 mb-3">
                <p className={`text-gray-700 leading-relaxed ${textSizeCls}`}>{item}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (layoutVariant === 'quote') {
      return (
        <div className="p-8 space-y-4">
          {items.map((item, idx) => (
            <blockquote key={idx} style={{ borderRightColor: c.main }} className="border-r-4 pr-5 text-gray-800 italic leading-relaxed">
              <span className={textSizeCls}>{item}</span>
            </blockquote>
          ))}
        </div>
      );
    }

    if (layoutVariant === 'compact') {
      return (
        <ul className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-3 px-6 py-2.5">
              {itemStyle === 'numbered'
                ? <span style={{ color: c.main }} className="w-5 text-xs font-bold">{idx + 1}</span>
                : iconEl(idx)
              }
              <span className={`text-gray-700 ${textSizeCls}`}>{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (layoutVariant === 'table') {
      return (
        <div className="p-4 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? c.light : '#fff' }}>
                  <td style={{ color: c.main, borderColor: c.border }} className="border px-4 py-2 font-bold w-10 text-center">{idx + 1}</td>
                  <td style={{ borderColor: c.border }} className="border px-4 py-2 text-gray-700">{item}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Default: 'cards'
    return (
      <div className="p-6 space-y-3">
        {items.map((item, idx) => (
          <div key={idx} style={{ borderColor: c.border }} className="flex items-start gap-3 bg-white rounded-xl p-4 border shadow-sm">
            {iconEl(idx)}
            <p className={`text-gray-700 leading-relaxed ${textSizeCls}`}>{item}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderCustomContent = () => {
    const key = contentKey;
    // Use draft value when editing, otherwise use content value
    const val = isEditing && draft ? (draft[key] ?? content[key]) : content[key];

    const DEFAULT_ACCENT: Record<string, string> = {
      vision: 'purple', generalObjective: 'blue', detailedObjectives: 'indigo',
      idea: 'amber', justifications: 'teal', features: 'fuchsia',
      strengths: 'green', outputs: 'sky', expectedResults: 'rose',
      risks: 'red', proposedNames: 'violet',
    };
    const sectionAccent = DEFAULT_ACCENT[key] ?? 'blue';
    const ac = TC[themeAccent || sectionAccent] ?? TC.blue;

    // If user explicitly chose a layout variant (other than default 'cards'),
    // apply it universally for all custom types
    const hasCustomLayout = style.layoutVariant && style.layoutVariant !== 'cards';

    // List types: always show as a list regardless of layout
    const LIST_KEYS = ['detailedObjectives','justifications','features','strengths','outputs','expectedResults','risks'];
    const isListType = LIST_KEYS.includes(key);

    // For list types or when a custom layout is chosen, use renderItemList
    // (edit mode is handled via EList appended below)
    if (isListType || hasCustomLayout) {
      const rawVal = isEditing && draft ? (draft[key] ?? content[key]) : content[key];
      const items = parseLines(rawVal);
      return (
        <div>
          {(!isEditing || items.length > 0) && renderItemList(items, sectionAccent)}
          {EList(items, key, ac.main)}
        </div>
      );
    }

    switch (key) {
      // ── Vision ──────────────────────────────────────────────
      case 'vision': {
        const text = String(val || '');
        return (
          <div className="p-8 flex flex-col items-center text-center">
            <div style={{ background: `linear-gradient(135deg, ${ac.main}, ${ac.dark})` }}
                 className="w-20 h-20 mb-6 rounded-full flex items-center justify-center shadow-lg">
              <Eye className="h-10 w-10 text-white" />
            </div>
            {isEditing ? (
              <ET text={text} field={key} extraCls="text-xl font-medium text-right" rows={4} />
            ) : (
              <blockquote style={{ borderRightColor: ac.main }}
                          className="text-xl text-gray-800 leading-relaxed font-medium max-w-3xl border-r-4 pr-6 text-right w-full">
                {text}
              </blockquote>
            )}
          </div>
        );
      }

      // ── General Objective ────────────────────────────────────
      case 'generalObjective': {
        const text = String(val || '');
        return (
          <div className="p-8">
            <div style={{ borderColor: ac.border }} className="bg-white rounded-2xl p-8 border-2 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div style={{ background: `linear-gradient(135deg, ${ac.main}, ${ac.dark})` }}
                     className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <p style={{ color: ac.main }} className="text-xs font-medium uppercase tracking-wider">الهدف الرئيسي للبرنامج</p>
              </div>
              {isEditing ? (
                <ET text={text} field={key} extraCls="text-gray-800 text-lg" rows={4} />
              ) : (
                <p className="text-gray-800 text-lg leading-relaxed">{text}</p>
              )}
            </div>
          </div>
        );
      }

      // ── Main Idea ────────────────────────────────────────────
      case 'idea': {
        const ideaLines = parseLines(val);
        if (ideaLines.length > 1) {
          return (
            <div>
              {(!isEditing || ideaLines.length > 0) && renderItemList(ideaLines, sectionAccent)}
              {EList(ideaLines, key, ac.main)}
            </div>
          );
        }
        const text = String(val || '');
        return (
          <div className="p-8">
            <div className="relative">
              <div style={{ background: `linear-gradient(135deg, ${ac.main}, ${ac.dark})` }}
                   className="absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center shadow">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div style={{ borderColor: ac.border }} className="bg-white rounded-2xl p-8 border-2 shadow-sm pt-10">
                {isEditing ? (
                  <ET text={text} field={key} extraCls="text-gray-800" rows={4} />
                ) : (
                  <p className={`text-gray-800 leading-relaxed ${textSizeCls}`}>{text}</p>
                )}
              </div>
            </div>
          </div>
        );
      }

      // ── Proposed Names ───────────────────────────────────────
      case 'proposedNames': {
        const rawNames = isEditing && draft ? (draft[key] ?? content[key]) : content[key];
        const names: string[] = Array.isArray(rawNames)
          ? rawNames
          : typeof rawNames === 'string'
            ? (() => { try { return JSON.parse(rawNames); } catch { return parseLines(rawNames); } })()
            : [];

        if (isEditing) {
          return (
            <div className="p-6 space-y-3">
              {names.map((name: string, idx: number) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div style={{ background: ac.main, color: '#fff' }}
                       className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <input value={name} dir="rtl" onClick={e => e.stopPropagation()}
                    onChange={e => {
                      const copy = [...names];
                      copy[idx] = e.target.value;
                      updateDraft(key, copy);
                    }}
                    className="flex-1 bg-blue-50 border border-dashed border-blue-400 rounded-xl px-4 py-2.5 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <button onClick={e => { e.stopPropagation(); const copy = names.filter((_, i) => i !== idx); updateDraft(key, copy); }}
                    className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                </div>
              ))}
              <button onClick={e => { e.stopPropagation(); updateDraft(key, [...names, '']); }}
                className="flex items-center gap-1.5 text-blue-500 text-sm hover:text-blue-700 pt-1">
                <Plus className="h-3.5 w-3.5" /> إضافة اسم
              </button>
            </div>
          );
        }

        return (
          <div className="p-6">
            <div className="flex flex-wrap gap-4 justify-center">
              {names.map((name: string, idx: number) => (
                <button key={idx} onClick={e => e.stopPropagation()}
                  style={{ borderColor: ac.border, background: ac.light }}
                  className="group relative border-2 rounded-2xl px-6 py-5 shadow-sm text-center min-w-[180px]
                             cursor-pointer hover:shadow-md active:scale-95 transition-all duration-150 focus:outline-none">
                  <span style={{ color: ac.main }} className="text-[11px] font-semibold block mb-1.5 uppercase tracking-widest">
                    الاسم {idx + 1}
                  </span>
                  <span className="text-gray-900 font-bold text-xl leading-snug">{name}</span>
                  <div style={{ background: ac.main }}
                       className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        );
      }

      // ── Fallback ─────────────────────────────────────────────
      default: {
        const keys = Object.keys(content);
        if (keys.length === 0) return <div className="p-6 text-gray-500 text-center">لا يوجد محتوى</div>;
        const firstKey = keys[0];
        const rawVal = isEditing && draft ? (draft[firstKey] ?? content[firstKey]) : content[firstKey];
        const items = parseLines(rawVal);
        if (items.length > 1) {
          return (
            <div>
              {(!isEditing || items.length > 0) && renderItemList(items, 'gray')}
              {EList(items, firstKey, ac.main)}
            </div>
          );
        }
        const text = String(rawVal ?? '');
        return (
          <div className="p-6">
            {isEditing
              ? <ET text={text} field={firstKey} rows={4} />
              : <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">{text}</p>}
          </div>
        );
      }
    }
  };
  
  const renderGenericContent = () => (
    <div className="p-6">
      <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
  
  return (
    <div className="relative group">
      {/* Smart Action Buttons - Always visible, cleaner design */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
        {isEditing ? (
          /* Editing mode toolbar */
          <div className="flex items-center gap-1 bg-blue-600 rounded-lg shadow-lg border border-blue-500 p-1">
            <span className="text-xs text-white font-medium px-2">وضع التحرير</span>
            <Button
              size="sm"
              className="h-7 gap-1 text-xs bg-white text-blue-700 hover:bg-blue-50 border-0"
              onClick={(e) => {
                e.stopPropagation();
                const cleanDraft = draft ? Object.fromEntries(
                  Object.entries(draft).map(([k, v]) =>
                    typeof v === 'string'
                      ? [k, v.split('\n').map((s: string) => s.trim()).filter(Boolean).join('\n')]
                      : [k, v]
                  )
                ) : draft;
                onSave?.(draftTitle, cleanDraft);
              }}
            >
              <Save className="h-3.5 w-3.5" />
              حفظ
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-white hover:bg-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.();
              }}
            >
              <X className="h-3.5 w-3.5" />
              إلغاء
            </Button>
          </div>
        ) : (
          /* Normal action buttons */
          <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs hover:bg-blue-50 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
            >
              <Edit3 className="h-3.5 w-3.5" />
              تعديل
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs hover:bg-purple-50 hover:text-purple-600"
              onClick={(e) => {
                e.stopPropagation();
                onStyle?.();
              }}
            >
              <Palette className="h-3.5 w-3.5" />
              تنسيق
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs hover:bg-green-50 hover:text-green-600"
              onClick={(e) => {
                e.stopPropagation();
                onAIChat?.();
              }}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              AI
            </Button>
          </div>
        )}
      </div>
      
      <Card
        className={`
          relative overflow-hidden transition-all duration-200
          ${isEditing
            ? 'ring-2 ring-blue-500 shadow-xl cursor-default'
            : isSelected
              ? 'ring-2 ring-blue-300 shadow-lg cursor-pointer'
              : 'hover:shadow-md cursor-pointer'
          }
          border border-gray-200
          ${type === 'cover' && coverSlide ? '' : getCardBg()}
        `}
        style={
          type === 'cover' && coverSlide ? {
            backgroundColor: coverSlide.backgroundColor || '#ffffff',
            backgroundImage: coverSlide.backgroundImage ? `url(${coverSlide.backgroundImage})` : undefined,
            backgroundSize: coverSlide.backgroundSize || 'cover',
            backgroundPosition: coverSlide.backgroundPosition || 'center',
          } : applyGlobalBackground ? {
            backgroundColor: globalBackgroundColor || style.backgroundColor || '#ffffff',
            backgroundImage: globalBackgroundImage ? `url(${globalBackgroundImage})` : (style.backgroundImage ? `url(${style.backgroundImage})` : undefined),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined
        }
        onClick={isEditing ? undefined : onClick}
      >
        {/* Logo on slides (per-slide control or global) */}
        {logo && (style.showLogo !== false) && (applyLogoToAllSlides || style.showLogo) && (
          <div
            className={`absolute z-10 pointer-events-none ${
              (() => {
                const pos = style.logoPosition || logoPosition || 'top-right';
                return pos === 'top-left' ? 'top-3 left-3' :
                  pos === 'top-right' ? 'top-3 right-3' :
                  pos === 'bottom-left' ? 'bottom-3 left-3' :
                  pos === 'bottom-right' ? 'bottom-3 right-3' :
                  'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
              })()
            } ${(() => {
              const sz = style.logoSize || logoSize || 'medium';
              return sz === 'small' ? 'w-10 h-10' : sz === 'large' ? 'w-20 h-20' : 'w-14 h-14';
            })()}`}
          >
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
        )}
        {/* Card Header */}
        {type !== 'cover' && (
          <div className={`flex items-center gap-3 px-6 py-4 ${getHeaderColor()}`}>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              {getIcon()}
            </div>
            {isEditing ? (
              <input
                className="flex-1 bg-white/20 border border-white/40 rounded-lg px-3 py-1 text-xl font-bold text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                value={draftTitle}
                onChange={e => setDraftTitle(e.target.value)}
                dir="rtl"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <h2 className="text-xl font-bold">{title}</h2>
            )}
          </div>
        )}
        
        {/* Main Content — textSize and contentAlignment applied here for ALL card types */}
        <div
          className={textSizeCls}
          style={
            style.contentAlignment === 'center'
              ? { display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '180px' }
              : style.contentAlignment === 'bottom'
              ? { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '180px' }
              : undefined
          }
        >
          {renderContent()}
        </div>

        {/* Edit mode: blue bottom bar */}
        {isEditing && (
          <div className="sticky bottom-0 bg-blue-50 border-t border-blue-200 px-6 py-3 flex items-center justify-end gap-3">
            <p className="text-xs text-blue-600 flex-1">
              جميع التغييرات مؤقتة حتى تضغط على حفظ
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.();
              }}
            >
              <X className="h-3.5 w-3.5" />
              إلغاء
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              onClick={(e) => {
                e.stopPropagation();
                const cleanDraft = draft ? Object.fromEntries(
                  Object.entries(draft).map(([k, v]) =>
                    typeof v === 'string'
                      ? [k, v.split('\n').map((s: string) => s.trim()).filter(Boolean).join('\n')]
                      : [k, v]
                  )
                ) : draft;
                onSave?.(draftTitle, cleanDraft);
              }}
            >
              <Save className="h-3.5 w-3.5" />
              حفظ التغييرات
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
