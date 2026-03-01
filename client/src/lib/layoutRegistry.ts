/**
 * Smart Layout Registry - 45 Gamma-inspired layouts
 * @see specs/007-gamma-smart-layout-engine/spec.md
 */
import { getLayoutComponent } from '../components/SlideBuilder/layouts';
import { stubPdfMapper, stubPptxMapper } from './layoutStubMappers';
import type { LayoutDefinition, LayoutFamily } from './types/layouts';

function def(
  id: string,
  family: LayoutFamily,
  name: string,
  description: string,
  bestFor: string[],
  minItems: number,
  maxItems: number,
  supportsImages: boolean,
  densityLevel: 'low' | 'medium' | 'high',
  estimatedHeight: number,
  denserVariant?: string
): LayoutDefinition {
  const component = getLayoutComponent(id)!;
  return {
    id,
    family,
    name,
    description,
    bestFor: bestFor as LayoutDefinition['bestFor'],
    minItems,
    maxItems,
    supportsImages,
    densityLevel,
    estimatedHeight,
    denserVariant,
    component,
    pptxMapper: stubPptxMapper,
    pdfMapper: stubPdfMapper,
  };
}

export const LAYOUT_REGISTRY: Record<string, LayoutDefinition> = {
  // C1 — Cover & Section
  'cover-hero': def('cover-hero', 'cover', 'Cover Hero', 'Title + subtitle + background/image', ['title-only', 'title-subtitle', '1-item'], 1, 2, true, 'low', 1080),
  'cover-split': def('cover-split', 'cover', 'Cover Split', 'Text on one side + image on other', ['title-subtitle', '2-items'], 1, 2, true, 'low', 1080),
  'section-divider': def('section-divider', 'cover', 'Section Divider', 'Chapter/section breaks', ['title-only', '1-item'], 1, 1, false, 'low', 400),
  'agenda-outline': def('agenda-outline', 'cover', 'Agenda / Outline', 'List of topics or agenda items', ['bullet-list', '3-items', '4-items', '5-items', '6-items'], 2, 10, false, 'medium', 900),

  // C2 — Text + Media
  'split-50-50': def('split-50-50', 'text-media', 'Split Layout (50/50)', 'Equal text and media balance', ['balanced', '2-items', 'image-heavy'], 1, 6, true, 'medium', 900),
  'split-30-70': def('split-30-70', 'text-media', 'Split Layout (30/70)', 'Media-heavy with supporting text', ['image-heavy', '1-item', '2-items'], 1, 4, true, 'low', 900),
  'text-overlay': def('text-overlay', 'text-media', 'Text Overlay on Image', 'Narrative with visual background', ['narrative', 'quote', '1-item'], 1, 2, true, 'low', 1080),
  'gallery-captions': def('gallery-captions', 'text-media', 'Gallery + Captions', 'Multiple images with descriptions', ['image-heavy', '4-items', '5-items', '6-items'], 2, 8, true, 'medium', 900),
  'visual-callout': def('visual-callout', 'text-media', 'Visual + Key Callout', 'Single image with emphasized point', ['1-item', '2-items', 'hero-number'], 1, 2, true, 'low', 900),

  // C3 — Cards / Features
  'feature-cards-3': def('feature-cards-3', 'cards', 'Feature Cards (3-up)', '3 key features/points', ['3-items', 'features', 'benefits'], 3, 3, true, 'medium', 900),
  'feature-cards-4': def('feature-cards-4', 'cards', 'Feature Cards (4-up)', '4 key features/points', ['4-items', 'features', 'benefits'], 4, 4, true, 'medium', 900),
  'icon-cards-3': def('icon-cards-3', 'cards', 'Icon Cards (3-up)', '3 items with icons', ['3-items', 'features', 'benefits', 'steps'], 3, 3, true, 'medium', 900, 'icon-cards-6'),
  'icon-cards-6': def('icon-cards-6', 'cards', 'Icon Cards (6-up compact)', '6 items in dense grid', ['6-items', '7+-items', 'features', 'benefits'], 6, 8, true, 'high', 1080),
  'problem-solution': def('problem-solution', 'cards', 'Problem → Solution', 'Before/after or challenge/resolution', ['before-after', '2-items', 'comparison'], 2, 2, true, 'medium', 900),
  'benefits-grid': def('benefits-grid', 'cards', 'Benefits Grid', 'Multiple benefits in visual grid', ['benefits', '4-items', '5-items', '6-items'], 3, 8, true, 'medium', 900),

  // C4 — KPIs / Stats
  'stat-blocks-3': def('stat-blocks-3', 'kpis', 'Stat Blocks (3)', '3 key metrics prominently displayed', ['3-items', 'stats', 'kpis', 'metrics'], 3, 3, false, 'low', 700),
  'stat-blocks-4': def('stat-blocks-4', 'kpis', 'Stat Blocks (4)', '4 key metrics prominently displayed', ['4-items', 'stats', 'kpis', 'metrics'], 4, 4, false, 'low', 800),
  'kpi-table': def('kpi-table', 'kpis', 'KPI Table', 'Detailed metrics in tabular format', ['stats', 'kpis', 'metrics', '7+-items'], 4, 20, false, 'high', 1080),
  'kpi-list-icons': def('kpi-list-icons', 'kpis', 'KPI List with Icons', 'Metrics as list with visual icons', ['stats', 'kpis', '3-items', '4-items', '5-items', '6-items'], 3, 8, true, 'medium', 900),
  'progress-bars': def('progress-bars', 'kpis', 'Progress Bars / Targets', 'Goals with progress indicators', ['progress', '3-items', '4-items', '5-items'], 2, 8, false, 'medium', 800),
  'big-number-breakdown': def('big-number-breakdown', 'kpis', 'Big Number + Breakdown', 'Hero number with supporting details', ['hero-number', '1-item', '2-items', 'stats'], 1, 4, false, 'low', 800),

  // C5 — Comparison & Decision
  'compare-2col': def('compare-2col', 'comparison', 'Two-Column Comparison', 'Side-by-side comparison of 2 options', ['comparison', '2-items', 'before-after'], 2, 2, true, 'medium', 900),
  'compare-3col': def('compare-3col', 'comparison', 'Three-Column Comparison', 'Comparison of 3 options', ['comparison', '3-items', 'options'], 3, 3, true, 'medium', 900),
  'pros-cons': def('pros-cons', 'comparison', 'Pros / Cons', 'Advantages vs disadvantages', ['pros-cons', '2-items', 'comparison'], 2, 4, false, 'medium', 900),
  'before-after': def('before-after', 'comparison', 'Before / After', 'State change or transformation', ['before-after', '2-items'], 2, 2, true, 'medium', 900),
  'options-table': def('options-table', 'comparison', 'Options Table with Highlight', 'Decision matrix with recommended option', ['options', 'comparison', '4-items', '5-items', '6-items'], 3, 12, false, 'high', 1080),

  // C6 — Process / Journey / Timeline
  'steps-horizontal': def('steps-horizontal', 'process', 'Steps Flow (Horizontal)', 'Sequential process left-to-right', ['steps', '3-items', '4-items', '5-items'], 2, 8, true, 'medium', 800),
  'steps-vertical': def('steps-vertical', 'process', 'Steps Flow (Vertical)', 'Sequential process top-to-bottom', ['steps', '3-items', '4-items', '5-items', '6-items'], 2, 8, true, 'medium', 900),
  'timeline-horizontal': def('timeline-horizontal', 'process', 'Timeline (Horizontal)', 'Chronological events horizontal', ['timeline', '3-items', '4-items', '5-items'], 2, 8, true, 'medium', 800),
  'timeline-vertical': def('timeline-vertical', 'process', 'Timeline (Vertical)', 'Chronological events vertical', ['timeline', '3-items', '4-items', '5-items', '6-items'], 2, 8, true, 'medium', 900),
  'phases-deliverables': def('phases-deliverables', 'process', 'Phases + Deliverables', 'Project phases with outputs', ['phases', 'steps', '3-items', '4-items'], 2, 8, true, 'medium', 900),
  'funnel-journey': def('funnel-journey', 'process', 'Funnel / Journey Stages', 'Conversion funnel or user journey', ['funnel', 'journey', '3-items', '4-items', '5-items'], 3, 6, true, 'medium', 800),

  // C7 — Frameworks / Matrices
  'swot-grid': def('swot-grid', 'frameworks', 'SWOT 2x2 Grid', 'Strengths/Weaknesses/Opportunities/Threats', ['swot', 'matrix', '4-items'], 4, 4, false, 'medium', 900),
  'matrix-2x2': def('matrix-2x2', 'frameworks', 'Generic 2x2 Matrix', 'Impact/effort, priority matrix', ['matrix', 'grid', '4-items'], 4, 4, false, 'medium', 900),
  'pillars-3': def('pillars-3', 'frameworks', '3 Pillars', 'Three foundational elements', ['pillars', '3-items'], 3, 3, true, 'medium', 800),
  'pillars-4': def('pillars-4', 'frameworks', '4 Pillars', 'Four foundational elements', ['pillars', '4-items'], 4, 4, true, 'medium', 900),

  // C8 — Budget / Allocation
  'budget-category-bars': def('budget-category-bars', 'budget', 'Total + Category Bars', 'Budget overview with category breakdown', ['budget', 'allocation', '3-items', '4-items', '5-items'], 2, 8, false, 'medium', 800),
  'budget-table': def('budget-table', 'budget', 'Budget Table + Totals', 'Detailed budget in table format', ['budget', 'costs', '7+-items'], 4, 20, false, 'high', 1080),
  'allocation-visual': def('allocation-visual', 'budget', 'Allocation Visual Block', 'Donut-style or visual budget distribution', ['allocation', 'budget', '3-items', '4-items', '5-items'], 2, 8, false, 'medium', 800),
  'cost-breakdown-cards': def('cost-breakdown-cards', 'budget', 'Cost Breakdown Cards', 'Costs displayed as cards', ['costs', 'budget', '3-items', '4-items', '5-items', '6-items'], 3, 8, true, 'medium', 900),

  // C9 — Lists / Content Density
  'bullet-hierarchy': def('bullet-hierarchy', 'lists', 'Bullet List (Formatted Hierarchy)', 'Structured text with hierarchy', ['bullet-list', 'text-heavy', '7+-items'], 2, 15, false, 'high', 1080),
  'numbered-badges': def('numbered-badges', 'lists', 'Numbered List (Badges)', 'Ordered items with visual numbers', ['numbered-list', 'steps', '3-items', '4-items', '5-items'], 2, 10, false, 'medium', 900),
  'checklist-icons': def('checklist-icons', 'lists', 'Checklist (Icons)', 'To-do or checklist items', ['checklist', '3-items', '4-items', '5-items', '6-items'], 2, 10, true, 'medium', 900),
  'quote-testimonial': def('quote-testimonial', 'lists', 'Quote / Testimonial', 'Featured quote or testimonial', ['quote', 'testimonial', '1-item'], 1, 2, true, 'low', 700),
  'call-to-action': def('call-to-action', 'lists', 'Call to Action Slide', 'Final CTA or next steps', ['cta', '1-item', '2-items'], 1, 3, true, 'low', 600),
};

export function getLayout(id: string): LayoutDefinition | undefined {
  return LAYOUT_REGISTRY[id];
}

export function getLayoutsByFamily(family: LayoutFamily): LayoutDefinition[] {
  return Object.values(LAYOUT_REGISTRY).filter((l) => l.family === family);
}

export function getDenserVariant(layoutId: string): LayoutDefinition | undefined {
  const layout = LAYOUT_REGISTRY[layoutId];
  if (!layout?.denserVariant) return undefined;
  return LAYOUT_REGISTRY[layout.denserVariant];
}

export function getAllLayoutIds(): string[] {
  return Object.keys(LAYOUT_REGISTRY);
}

export function isValidLayoutId(id: string): boolean {
  return id in LAYOUT_REGISTRY;
}
