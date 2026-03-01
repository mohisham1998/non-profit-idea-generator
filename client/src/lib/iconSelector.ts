import * as LucideIcons from 'lucide-react';

/** Keyword-to-Lucide icon mapping (English + Arabic) - includes Saudi/charity context */
const CONTENT_ICON_MAP: Record<string, string> = {
  budget: 'DollarSign', ميزانية: 'DollarSign',
  cost: 'Coins', تكلفة: 'Coins',
  kpi: 'Gauge', مؤشر: 'Gauge',
  performance: 'TrendingUp', أداء: 'TrendingUp',
  challenge: 'AlertCircle', تحدي: 'AlertCircle',
  risk: 'AlertTriangle', مخاطر: 'AlertTriangle',
  goal: 'Target', هدف: 'Target',
  vision: 'Eye', رؤية: 'Eye',
  mission: 'Flag', رسالة: 'Flag',
  timeline: 'Calendar', جدول: 'Calendar',
  team: 'Users', فريق: 'Users',
  impact: 'Zap', أثر: 'Zap',
  idea: 'Lightbulb', فكرة: 'Lightbulb',
  features: 'Sparkles', مميزات: 'Sparkles',
  strength: 'TrendingUp', قوة: 'TrendingUp',
  output: 'Zap', مخرجات: 'Zap',
  result: 'CheckCircle2', نتيجة: 'CheckCircle2',
  justification: 'FileText', مبررات: 'FileText',
  charity: 'Heart', جمعية: 'Heart', nonprofit: 'Heart',
  donation: 'HandCoins', تبرع: 'HandCoins',
  community: 'Users2', مجتمع: 'Users2',
  saudi: 'MapPin', السعودية: 'MapPin',
};

const CATEGORY_FALLBACKS: Record<string, string> = {
  vision: 'Eye', generalObjective: 'Target', detailedObjectives: 'CheckCircle',
  idea: 'Lightbulb', justifications: 'FileText', features: 'Sparkles',
  strengths: 'TrendingUp', outputs: 'Zap', expectedResults: 'TrendingUp',
  risks: 'AlertTriangle', kpis: 'Gauge', budget: 'DollarSign',
  swot: 'Grid3X3', default: 'Circle',
};

export interface IconSelectionOptions {
  content: string;
  title?: string;
  category?: string;
  fallback?: string;
}

/** Select contextually appropriate Lucide icon by keyword. */
export function selectContextualIcon(options: IconSelectionOptions): React.ComponentType<{ className?: string }> {
  const { content = '', title = '', category, fallback = 'Circle' } = options;
  const searchText = `${title} ${content}`.toLowerCase();

  for (const [keyword, iconName] of Object.entries(CONTENT_ICON_MAP)) {
    if (searchText.includes(keyword.toLowerCase())) {
      const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
      if (Icon && typeof Icon === 'function') return Icon;
    }
  }

  if (category && CATEGORY_FALLBACKS[category]) {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[CATEGORY_FALLBACKS[category]];
    if (Icon && typeof Icon === 'function') return Icon;
  }

  const FallbackIcon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[fallback];
  return FallbackIcon || (LucideIcons.Circle as unknown as React.ComponentType<{ className?: string }>);
}

/** Get icon NAME for a content type (for use in content blocks). */
export function getIconNameForCategory(category: string): string {
  return CATEGORY_FALLBACKS[category] ?? 'Circle';
}

/** Saudi/charity context keywords for image generation prompts */
export const KEYWORDS_BY_CONTENT: Record<string, string[]> = {
  kpis: ['analytics', 'Saudi Arabia', 'professional', 'nonprofit', 'charity'],
  budget: ['financial', 'Saudi Arabia', 'professional', 'nonprofit', 'charity'],
  swot: ['strategic planning', 'Saudi Arabia', 'professional', 'nonprofit'],
  vision: ['inspiring', 'Saudi Arabia', 'professional', 'nonprofit', 'charity'],
  features: ['innovation', 'Saudi Arabia', 'professional', 'nonprofit'],
  timeline: ['calendar', 'Saudi Arabia', 'professional', 'nonprofit'],
  team: ['collaboration', 'Saudi Arabia', 'professional', 'community'],
  impact: ['community', 'Saudi Arabia', 'charity', 'donation'],
  default: ['Saudi Arabia', 'professional', 'nonprofit', 'charity', 'community'],
};

export function getKeywordsForContentType(contentType: string): string[] {
  const key = contentType.toLowerCase().replace(/\s+/g, '');
  for (const [k, kw] of Object.entries(KEYWORDS_BY_CONTENT)) {
    if (k !== 'default' && (key.includes(k) || k.includes(key))) return kw;
  }
  return KEYWORDS_BY_CONTENT.default;
}

/** Get icon component by name with fallback. */
export function getIconByName(iconName: string | undefined, category?: string): React.ComponentType<{ className?: string }> {
  if (iconName) {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    if (Icon && typeof Icon === 'function') return Icon;
  }
  if (category && CATEGORY_FALLBACKS[category]) {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[CATEGORY_FALLBACKS[category]];
    if (Icon && typeof Icon === 'function') return Icon;
  }
  return LucideIcons.Circle as unknown as React.ComponentType<{ className?: string }>;
}
