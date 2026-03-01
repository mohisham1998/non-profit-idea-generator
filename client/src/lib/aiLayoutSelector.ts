/** Layout selection result (AI or rule-based). */
export interface LayoutSelection {
  layout: 'cards' | 'list' | 'grid' | 'numbered' | 'quote' | 'timeline' | 'compact' | 'table' | 'two-column' | 'quadrant' | 'flow' | 'stat-blocks';
  itemStyle: 'numbered' | 'check' | 'arrow' | 'dot' | 'star' | 'card';
  textSize: 'sm' | 'md' | 'lg';
  rationale?: string;
}

/** Image placement in layout */
export interface ImagePlacement {
  position: 'background' | 'left-panel' | 'right-panel' | 'top-banner' | 'inline-between' | 'center-overlay';
  size: 'full' | 'half' | 'third' | 'quarter';
  zIndex: 0 | 10 | 20;
  contentPrompt: string;
  priority: 'high' | 'medium' | 'low';
}

/** Content zone in layout */
export interface ContentZone {
  type: 'header' | 'body' | 'stat' | 'card' | 'badge' | 'quote' | 'list';
  gridArea?: string;
  flexOrder?: number;
  width: string;
  alignment: 'left' | 'right' | 'center';
}

/** AI layout decision with image placements */
export interface AILayoutDecision {
  layoutType: string;
  reasoning?: string;
  imagePlacements: ImagePlacement[];
  contentZones?: ContentZone[];
  estimatedHeight?: 'standard' | 'tall' | 'multi-slide';
}

/** Rule-based layout mapping per content type. */
const LAYOUT_BY_CONTENT: Record<string, LayoutSelection> = {
  vision: { layout: 'quote', itemStyle: 'card', textSize: 'lg' },
  generalObjective: { layout: 'quote', itemStyle: 'card', textSize: 'lg' },
  detailedObjectives: { layout: 'numbered', itemStyle: 'numbered', textSize: 'md' },
  idea: { layout: 'quote', itemStyle: 'card', textSize: 'lg' },
  justifications: { layout: 'cards', itemStyle: 'card', textSize: 'md' },
  features: { layout: 'grid', itemStyle: 'star', textSize: 'md' },
  strengths: { layout: 'cards', itemStyle: 'card', textSize: 'md' },
  outputs: { layout: 'numbered', itemStyle: 'numbered', textSize: 'md' },
  expectedResults: { layout: 'list', itemStyle: 'check', textSize: 'md' },
  risks: { layout: 'numbered', itemStyle: 'arrow', textSize: 'md' },
  kpis: { layout: 'stat-blocks', itemStyle: 'card', textSize: 'lg' },
  budget: { layout: 'table', itemStyle: 'card', textSize: 'md' },
  swot: { layout: 'quadrant', itemStyle: 'card', textSize: 'md' },
  timeline: { layout: 'timeline', itemStyle: 'arrow', textSize: 'md' },
  goals: { layout: 'numbered', itemStyle: 'numbered', textSize: 'md' },
  challenges: { layout: 'cards', itemStyle: 'card', textSize: 'md' },
};

const DEFAULT_LAYOUT: LayoutSelection = { layout: 'list', itemStyle: 'dot', textSize: 'md' };

/**
 * Select layout for a slide using rule-based mapping.
 * AI integration can be added via optional async fn (e.g. trpc.ideas.selectLayout.mutate).
 */
export function selectLayout(
  contentType: string,
  _content?: string,
  _blockCount?: number
): LayoutSelection {
  const key = contentType.toLowerCase().replace(/\s+/g, '');
  for (const [k, v] of Object.entries(LAYOUT_BY_CONTENT)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return LAYOUT_BY_CONTENT[contentType] ?? DEFAULT_LAYOUT;
}

/**
 * Select layout with optional AI override. Pass an async fn to call AI.
 */
export async function selectLayoutWithFallback(
  contentType: string,
  content?: string,
  blockCount?: number,
  aiSelector?: (contentType: string, content?: string, blockCount?: number) => Promise<LayoutSelection>
): Promise<LayoutSelection> {
  try {
    if (aiSelector) {
      const result = await Promise.race([
        aiSelector(contentType, content, blockCount),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000)),
      ]);
      return result;
    }
  } catch {
    // Fall through to rule-based
  }
  return selectLayout(contentType, content, blockCount);
}

/** Fallback layout + image placement when AI fails */
const FALLBACK_LAYOUTS: Record<string, AILayoutDecision> = {
  swot: {
    layoutType: 'quadrant',
    imagePlacements: [{ position: 'background', size: 'full', zIndex: 0, contentPrompt: 'Strategic planning in Saudi Arabia', priority: 'medium' }],
    estimatedHeight: 'standard',
  },
  kpis: {
    layoutType: 'stat-blocks',
    imagePlacements: [{ position: 'right-panel', size: 'third', zIndex: 10, contentPrompt: 'Analytics dashboard in Saudi Arabia', priority: 'medium' }],
    estimatedHeight: 'standard',
  },
  budget: {
    layoutType: 'table',
    imagePlacements: [{ position: 'right-panel', size: 'third', zIndex: 10, contentPrompt: 'Financial planning in Saudi Arabia', priority: 'medium' }],
    estimatedHeight: 'tall',
  },
  features: {
    layoutType: 'grid',
    imagePlacements: [{ position: 'top-banner', size: 'full', zIndex: 10, contentPrompt: 'Innovation in Saudi Arabia', priority: 'high' }],
    estimatedHeight: 'standard',
  },
  vision: {
    layoutType: 'quote',
    imagePlacements: [{ position: 'right-panel', size: 'half', zIndex: 10, contentPrompt: 'Inspiring vision in Saudi Arabia', priority: 'high' }],
    estimatedHeight: 'standard',
  },
  timeline: {
    layoutType: 'timeline',
    imagePlacements: [],
    estimatedHeight: 'tall',
  },
  default: {
    layoutType: 'cards',
    imagePlacements: [{ position: 'right-panel', size: 'half', zIndex: 10, contentPrompt: 'Professional nonprofit in Saudi Arabia', priority: 'low' }],
    estimatedHeight: 'standard',
  },
};

const VALID_LAYOUT_TYPES = [
  'cards', 'list', 'grid', 'numbered', 'quote', 'timeline', 'compact', 'table',
  'two-column', 'quadrant', 'flow', 'stat-blocks',
] as const;
const VALID_POSITIONS = ['background', 'left-panel', 'right-panel', 'top-banner', 'inline-between', 'center-overlay'] as const;
const VALID_SIZES = ['full', 'half', 'third', 'quarter'] as const;
const VALID_Z_INDEXES = [0, 10, 20] as const;

function validateLayoutType(t: string): string {
  return VALID_LAYOUT_TYPES.includes(t as (typeof VALID_LAYOUT_TYPES)[number]) ? t : 'cards';
}

function validateImagePlacement(p: Partial<ImagePlacement>): ImagePlacement | null {
  if (!p || !p.contentPrompt) return null;
  const position = VALID_POSITIONS.includes((p.position ?? 'right-panel') as (typeof VALID_POSITIONS)[number])
    ? (p.position as ImagePlacement['position']) : 'right-panel';
  const size = VALID_SIZES.includes((p.size ?? 'half') as (typeof VALID_SIZES)[number])
    ? (p.size as ImagePlacement['size']) : 'half';
  const zIndex = VALID_Z_INDEXES.includes(Number(p.zIndex) as (typeof VALID_Z_INDEXES)[number])
    ? (Number(p.zIndex) as 0 | 10 | 20) : 10;
  return { position, size, zIndex, contentPrompt: String(p.contentPrompt).slice(0, 200), priority: (p.priority as ImagePlacement['priority']) || 'medium' };
}

export function validateLayoutDecision(d: AILayoutDecision): AILayoutDecision {
  const layoutType = validateLayoutType(d.layoutType ?? 'cards');
  const raw = (d.imagePlacements ?? []).slice(0, 3);
  const imagePlacements = raw.map(validateImagePlacement).filter((p): p is ImagePlacement => p !== null);
  return { ...d, layoutType, imagePlacements };
}

/**
 * Predict slide height needs from content length and block count.
 * Used to set estimatedHeight for layout decisions.
 */
export function predictSlideHeight(content?: string, blockCount?: number): 'standard' | 'tall' | 'multi-slide' {
  const len = content?.length ?? 0;
  const blocks = blockCount ?? 0;
  if (len > 1200 || blocks > 12) return 'multi-slide';
  if (len > 800 || blocks > 8) return 'tall';
  return 'standard';
}

/**
 * Select layout with image placements (rule-based fallback).
 * Uses content length analysis to set estimatedHeight.
 * AI integration can be added via optional async fn.
 */
export function selectLayoutWithImages(
  contentType: string,
  content?: string,
  blockCount?: number
): AILayoutDecision {
  const key = contentType.toLowerCase().replace(/\s+/g, '');
  let decision: AILayoutDecision = FALLBACK_LAYOUTS.default;
  for (const [k, v] of Object.entries(FALLBACK_LAYOUTS)) {
    if (k !== 'default' && (key.includes(k) || k.includes(key))) {
      decision = v;
      break;
    }
  }
  const estimatedHeight = predictSlideHeight(content, blockCount);
  return validateLayoutDecision({ ...decision, estimatedHeight });
}
