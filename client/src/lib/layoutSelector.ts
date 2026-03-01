/**
 * Layout selector - scores layouts based on content analysis
 * @see specs/007-gamma-smart-layout-engine/research.md
 */
import { LAYOUT_REGISTRY, getDenserVariant } from './layoutRegistry';
import type { ContentAnalysis, LayoutDefinition } from './types/layouts';

export interface LayoutSelectionResult {
  layoutId: string;
  score: number;
  candidates: string[];
  method: 'scoring' | 'fallback';
  overflowDetected?: boolean;
  overflowStrategy?: 'denser-layout' | 'expanded' | 'split';
}

const FALLBACK_LAYOUT_ID = 'bullet-hierarchy';
const OVERFLOW_ITEM_THRESHOLD = 2;

function scoreLayout(layout: LayoutDefinition, analysis: ContentAnalysis): number {
  let score = 0;

  // Item count match (0-30 pts)
  if (analysis.itemCount >= layout.minItems && analysis.itemCount <= layout.maxItems) {
    score += 30;
  } else if (analysis.itemCount > layout.maxItems && layout.denserVariant) {
    score += 10; // Prefer layouts with denser variant for overflow
  }

  // Pattern match (0-45 pts, 15 per match)
  const patternMatches = layout.bestFor.filter((p) => analysis.patterns.includes(p)).length;
  score += Math.min(45, patternMatches * 15);

  // Density match (0-15 pts)
  if (layout.densityLevel === 'high' && analysis.densityScore > 60) score += 15;
  if (layout.densityLevel === 'low' && analysis.densityScore < 30) score += 15;
  if (layout.densityLevel === 'medium' && analysis.densityScore >= 30 && analysis.densityScore <= 60) score += 15;

  // Structure match (0-10 pts)
  const structureMap: Record<string, string[]> = {
    list: ['bullet-list', 'numbered-list', 'checklist', 'features', 'benefits'],
    stats: ['stats', 'kpis', 'metrics', 'progress'],
    matrix: ['swot', 'matrix', 'grid'],
    steps: ['steps', 'phases', 'timeline', 'journey', 'funnel'],
    narrative: ['quote', 'testimonial', 'title-only', 'title-subtitle'],
  };
  const relevant = structureMap[analysis.structureType] || [];
  if (layout.bestFor.some((p) => relevant.includes(p))) score += 10;

  return score;
}

export function selectLayout(
  analysis: ContentAnalysis,
  slideType?: string
): LayoutSelectionResult {
  const scores: Record<string, number> = {};
  for (const [id, layout] of Object.entries(LAYOUT_REGISTRY)) {
    scores[id] = scoreLayout(layout, analysis);
  }

  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .filter(([, s]) => s > 0);

  let topScore = sorted[0]?.[1] ?? 0;
  let layoutId = sorted[0]?.[0] ?? FALLBACK_LAYOUT_ID;
  const candidates = sorted.slice(0, 5).map(([id]) => id);

  // Overflow detection: if top layout has denserVariant and itemCount exceeds maxItems by threshold
  const topLayout = LAYOUT_REGISTRY[layoutId];
  let overflowDetected = false;
  let overflowStrategy: 'denser-layout' | 'expanded' | 'split' | undefined;

  if (topLayout && analysis.itemCount > topLayout.maxItems + OVERFLOW_ITEM_THRESHOLD) {
    overflowDetected = true;
    const denser = getDenserVariant(layoutId);
    if (denser && analysis.itemCount <= denser.maxItems) {
      layoutId = denser.id;
      overflowStrategy = 'denser-layout';
    } else if (analysis.estimatedHeight && analysis.estimatedHeight > topLayout.estimatedHeight * 1.3) {
      overflowStrategy = 'expanded';
    } else {
      overflowStrategy = 'split';
    }
  }

  return {
    layoutId,
    score: topScore,
    candidates,
    method: topScore > 0 ? 'scoring' : 'fallback',
    overflowDetected: overflowDetected || undefined,
    overflowStrategy,
  };
}
