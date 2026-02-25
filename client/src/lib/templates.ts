// تعريف أنواع القوالب
export type TemplateId = 'classic' | 'modern' | 'formal' | 'creative';

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  border: string;
  gradient?: string;
  gradientStart?: string;
  gradientEnd?: string;
  highlight?: string;
}

export interface TemplateStyle {
  id: TemplateId;
  name: string;
  nameAr: string;
  description: string;
  colors: TemplateColors;
  fontFamily: string;
  borderRadius: string;
  shadowStyle: string;
  headerStyle: string;
  titlePageBg: string;
  contentPageBg: string;
  accentShape?: string;
  decorativeElements?: string[];
  previewGradient: string;
  iconBg: string;
  badgeStyle: string;
}

// القالب الكلاسيكي - تصميم فاخر وأنيق
export const classicTemplate: TemplateStyle = {
  id: 'classic',
  name: 'Classic Elegance',
  nameAr: 'الأناقة الكلاسيكية',
  description: 'تصميم فاخر يجمع بين الأصالة والرقي، مثالي للمؤسسات العريقة',
  colors: {
    primary: '#1a365d',
    secondary: '#2d4a6f',
    accent: '#d4af37',
    background: '#fdfcfa',
    text: '#1a1a2e',
    muted: '#64748b',
    border: '#cbd5e1',
    gradient: 'linear-gradient(145deg, #1a365d 0%, #2d4a6f 50%, #3d5a80 100%)',
    gradientStart: '#1a365d',
    gradientEnd: '#3d5a80',
    highlight: '#f0e6d3',
  },
  fontFamily: 'Amiri, Georgia, serif',
  borderRadius: '8px',
  shadowStyle: 'shadow-lg shadow-slate-300/50',
  headerStyle: 'border-b-4 border-amber-500 bg-gradient-to-r from-slate-50 to-amber-50',
  titlePageBg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900',
  contentPageBg: 'bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100',
  decorativeElements: ['corner-ornament', 'gold-line'],
  previewGradient: 'linear-gradient(135deg, #1a365d 0%, #d4af37 100%)',
  iconBg: 'bg-gradient-to-br from-slate-800 to-blue-900',
  badgeStyle: 'bg-amber-100 text-amber-800 border border-amber-300',
};

// القالب العصري - تصميم حديث ومتطور
export const modernTemplate: TemplateStyle = {
  id: 'modern',
  name: 'Modern Fusion',
  nameAr: 'الحداثة المتطورة',
  description: 'تصميم عصري بتدرجات لونية جذابة وتأثيرات بصرية مبهرة',
  colors: {
    primary: '#4f46e5',
    secondary: '#7c3aed',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#0f172a',
    muted: '#94a3b8',
    border: '#e2e8f0',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #a855f7 70%, #ec4899 100%)',
    gradientStart: '#4f46e5',
    gradientEnd: '#ec4899',
    highlight: '#ede9fe',
  },
  fontFamily: 'Tajawal, Inter, sans-serif',
  borderRadius: '16px',
  shadowStyle: 'shadow-xl shadow-indigo-200/50',
  headerStyle: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-xl',
  titlePageBg: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500',
  contentPageBg: 'bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30',
  accentShape: 'polygon(0 0, 100% 0, 100% 80%, 85% 100%, 0 100%)',
  decorativeElements: ['gradient-blob', 'floating-circles'],
  previewGradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
  iconBg: 'bg-gradient-to-br from-indigo-600 to-purple-600',
  badgeStyle: 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200',
};

// القالب الرسمي - تصميم احترافي للجهات الرسمية
export const formalTemplate: TemplateStyle = {
  id: 'formal',
  name: 'Official Premium',
  nameAr: 'الرسمي المتميز',
  description: 'تصميم احترافي راقٍ مناسب للجهات الحكومية والمؤسسات الكبرى',
  colors: {
    primary: '#064e3b',
    secondary: '#047857',
    accent: '#ca8a04',
    background: '#ffffff',
    text: '#0f172a',
    muted: '#475569',
    border: '#94a3b8',
    gradient: 'linear-gradient(145deg, #064e3b 0%, #047857 50%, #059669 100%)',
    gradientStart: '#064e3b',
    gradientEnd: '#059669',
    highlight: '#ecfdf5',
  },
  fontFamily: 'Tajawal, Times New Roman, serif',
  borderRadius: '6px',
  shadowStyle: 'shadow-md shadow-emerald-200/30',
  headerStyle: 'border-b-4 border-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50',
  titlePageBg: 'bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900',
  contentPageBg: 'bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20',
  decorativeElements: ['official-seal', 'green-stripe'],
  previewGradient: 'linear-gradient(135deg, #064e3b 0%, #ca8a04 100%)',
  iconBg: 'bg-gradient-to-br from-emerald-800 to-teal-800',
  badgeStyle: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
};

// القالب الإبداعي - تصميم مبتكر وجريء
export const creativeTemplate: TemplateStyle = {
  id: 'creative',
  name: 'Creative Spark',
  nameAr: 'الإبداع المتألق',
  description: 'تصميم مبتكر بألوان نابضة بالحياة وأشكال هندسية ملفتة',
  colors: {
    primary: '#db2777',
    secondary: '#f97316',
    accent: '#0ea5e9',
    background: '#fffbfe',
    text: '#18181b',
    muted: '#71717a',
    border: '#fda4af',
    gradient: 'linear-gradient(135deg, #db2777 0%, #f97316 35%, #fbbf24 65%, #0ea5e9 100%)',
    gradientStart: '#db2777',
    gradientEnd: '#0ea5e9',
    highlight: '#fdf2f8',
  },
  fontFamily: 'Tajawal, Poppins, sans-serif',
  borderRadius: '24px',
  shadowStyle: 'shadow-2xl shadow-pink-200/50',
  headerStyle: 'bg-gradient-to-r from-pink-500 via-orange-500 to-amber-400 text-white rounded-2xl',
  titlePageBg: 'bg-gradient-to-br from-pink-600 via-rose-500 to-orange-400',
  contentPageBg: 'bg-gradient-to-br from-pink-50/50 via-orange-50/30 to-amber-50/50',
  accentShape: 'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 85%)',
  decorativeElements: ['geometric-shapes', 'color-splash', 'wave-pattern'],
  previewGradient: 'linear-gradient(135deg, #db2777 0%, #f97316 50%, #0ea5e9 100%)',
  iconBg: 'bg-gradient-to-br from-pink-500 to-orange-500',
  badgeStyle: 'bg-gradient-to-r from-pink-100 to-orange-100 text-pink-800 border border-pink-200',
};

// قائمة جميع القوالب
export const templates: TemplateStyle[] = [
  classicTemplate,
  modernTemplate,
  formalTemplate,
  creativeTemplate,
];

// دالة للحصول على قالب بناءً على المعرف
export function getTemplate(id: TemplateId): TemplateStyle {
  return templates.find(t => t.id === id) || classicTemplate;
}

// دالة للحصول على ألوان CSS للقالب
export function getTemplateCSSVars(template: TemplateStyle): Record<string, string> {
  return {
    '--template-primary': template.colors.primary,
    '--template-secondary': template.colors.secondary,
    '--template-accent': template.colors.accent,
    '--template-background': template.colors.background,
    '--template-text': template.colors.text,
    '--template-muted': template.colors.muted,
    '--template-border': template.colors.border,
    '--template-gradient-start': template.colors.gradientStart || template.colors.primary,
    '--template-gradient-end': template.colors.gradientEnd || template.colors.secondary,
    '--template-highlight': template.colors.highlight || template.colors.background,
  };
}

// دالة للحصول على أنماط Tailwind للقالب
export function getTemplateTailwindClasses(template: TemplateStyle, element: 'title' | 'content' | 'header' | 'card' | 'badge' | 'icon'): string {
  switch (element) {
    case 'title':
      return template.titlePageBg;
    case 'content':
      return template.contentPageBg;
    case 'header':
      return template.headerStyle;
    case 'card':
      return `${template.shadowStyle} rounded-[${template.borderRadius}]`;
    case 'badge':
      return template.badgeStyle;
    case 'icon':
      return template.iconBg;
    default:
      return '';
  }
}

// دالة للحصول على تدرج لوني للقالب
export function getTemplateGradient(template: TemplateStyle): string {
  return template.colors.gradient || `linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 100%)`;
}

// دالة للحصول على ألوان RGB للقالب (للاستخدام في PDF و PPT)
export function getTemplateRGB(template: TemplateStyle): {
  primary: { r: number; g: number; b: number };
  secondary: { r: number; g: number; b: number };
  accent: { r: number; g: number; b: number };
  text: { r: number; g: number; b: number };
} {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  return {
    primary: hexToRgb(template.colors.primary),
    secondary: hexToRgb(template.colors.secondary),
    accent: hexToRgb(template.colors.accent),
    text: hexToRgb(template.colors.text),
  };
}
