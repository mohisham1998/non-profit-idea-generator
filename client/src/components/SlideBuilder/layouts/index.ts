/**
 * Layout components index - 45 Gamma-inspired layouts
 * @see specs/007-gamma-smart-layout-engine/spec.md
 */
export { LayoutBase } from './LayoutBase';
export { PlaceholderLayout } from './PlaceholderLayout';

// C1 — Cover & Section
export { CoverHero } from './CoverHero';
export { CoverSplit } from './CoverSplit';
export { SectionDivider } from './SectionDivider';
export { AgendaOutline } from './AgendaOutline';

// C2 — Text + Media
export { Split5050 } from './Split5050';
export { Split3070 } from './Split3070';
export { TextOverlay } from './TextOverlay';
export { GalleryCaptions } from './GalleryCaptions';
export { VisualCallout } from './VisualCallout';

// C3 — Cards / Features
export { FeatureCards3 } from './FeatureCards3';
export { FeatureCards4 } from './FeatureCards4';
export { IconCards3 } from './IconCards3';
export { IconCards6 } from './IconCards6';
export { ProblemSolution } from './ProblemSolution';
export { BenefitsGrid } from './BenefitsGrid';

// C4 — KPIs / Stats
export { StatBlocks3 } from './StatBlocks3';
export { StatBlocks4 } from './StatBlocks4';
export { KpiTable } from './KpiTable';
export { KpiListIcons } from './KpiListIcons';
export { ProgressBars } from './ProgressBars';
export { BigNumberBreakdown } from './BigNumberBreakdown';

// C5 — Comparison & Decision
export { Compare2Col } from './Compare2Col';
export { Compare3Col } from './Compare3Col';
export { ProsCons } from './ProsCons';
export { BeforeAfter } from './BeforeAfter';
export { OptionsTable } from './OptionsTable';

// C6 — Process / Journey / Timeline
export { StepsHorizontal } from './StepsHorizontal';
export { StepsVertical } from './StepsVertical';
export { TimelineHorizontal } from './TimelineHorizontal';
export { TimelineVertical } from './TimelineVertical';
export { PhasesDeliverables } from './PhasesDeliverables';
export { FunnelJourney } from './FunnelJourney';

// C7 — Frameworks / Matrices
export { SwotGrid } from './SwotGrid';
export { Matrix2x2 } from './Matrix2x2';
export { Pillars3 } from './Pillars3';
export { Pillars4 } from './Pillars4';

// C8 — Budget / Allocation
export { BudgetCategoryBars } from './BudgetCategoryBars';
export { BudgetTable } from './BudgetTable';
export { AllocationVisual } from './AllocationVisual';
export { CostBreakdownCards } from './CostBreakdownCards';

// C9 — Lists / Content Density
export { BulletHierarchy } from './BulletHierarchy';
export { NumberedBadges } from './NumberedBadges';
export { ChecklistIcons } from './ChecklistIcons';
export { QuoteTestimonial } from './QuoteTestimonial';
export { CallToAction } from './CallToAction';

/** Layout ID to component map for registry wiring */
import type { ComponentType } from 'react';
import type { LayoutProps } from '../../lib/types/layouts';
import { PlaceholderLayout } from './PlaceholderLayout';

import { CoverHero } from './CoverHero';
import { CoverSplit } from './CoverSplit';
import { SectionDivider } from './SectionDivider';
import { AgendaOutline } from './AgendaOutline';
import { Split5050 } from './Split5050';
import { Split3070 } from './Split3070';
import { TextOverlay } from './TextOverlay';
import { GalleryCaptions } from './GalleryCaptions';
import { VisualCallout } from './VisualCallout';
import { FeatureCards3 } from './FeatureCards3';
import { FeatureCards4 } from './FeatureCards4';
import { IconCards3 } from './IconCards3';
import { IconCards6 } from './IconCards6';
import { ProblemSolution } from './ProblemSolution';
import { BenefitsGrid } from './BenefitsGrid';
import { StatBlocks3 } from './StatBlocks3';
import { StatBlocks4 } from './StatBlocks4';
import { KpiTable } from './KpiTable';
import { KpiListIcons } from './KpiListIcons';
import { ProgressBars } from './ProgressBars';
import { BigNumberBreakdown } from './BigNumberBreakdown';
import { Compare2Col } from './Compare2Col';
import { Compare3Col } from './Compare3Col';
import { ProsCons } from './ProsCons';
import { BeforeAfter } from './BeforeAfter';
import { OptionsTable } from './OptionsTable';
import { StepsHorizontal } from './StepsHorizontal';
import { StepsVertical } from './StepsVertical';
import { TimelineHorizontal } from './TimelineHorizontal';
import { TimelineVertical } from './TimelineVertical';
import { PhasesDeliverables } from './PhasesDeliverables';
import { FunnelJourney } from './FunnelJourney';
import { SwotGrid } from './SwotGrid';
import { Matrix2x2 } from './Matrix2x2';
import { Pillars3 } from './Pillars3';
import { Pillars4 } from './Pillars4';
import { BudgetCategoryBars } from './BudgetCategoryBars';
import { BudgetTable } from './BudgetTable';
import { AllocationVisual } from './AllocationVisual';
import { CostBreakdownCards } from './CostBreakdownCards';
import { BulletHierarchy } from './BulletHierarchy';
import { NumberedBadges } from './NumberedBadges';
import { ChecklistIcons } from './ChecklistIcons';
import { QuoteTestimonial } from './QuoteTestimonial';
import { CallToAction } from './CallToAction';

export const LAYOUT_COMPONENTS: Record<string, ComponentType<LayoutProps>> = {
  'cover-hero': CoverHero,
  'cover-split': CoverSplit,
  'section-divider': SectionDivider,
  'agenda-outline': AgendaOutline,
  'split-50-50': Split5050,
  'split-30-70': Split3070,
  'text-overlay': TextOverlay,
  'gallery-captions': GalleryCaptions,
  'visual-callout': VisualCallout,
  'feature-cards-3': FeatureCards3,
  'feature-cards-4': FeatureCards4,
  'icon-cards-3': IconCards3,
  'icon-cards-6': IconCards6,
  'problem-solution': ProblemSolution,
  'benefits-grid': BenefitsGrid,
  'stat-blocks-3': StatBlocks3,
  'stat-blocks-4': StatBlocks4,
  'kpi-table': KpiTable,
  'kpi-list-icons': KpiListIcons,
  'progress-bars': ProgressBars,
  'big-number-breakdown': BigNumberBreakdown,
  'compare-2col': Compare2Col,
  'compare-3col': Compare3Col,
  'pros-cons': ProsCons,
  'before-after': BeforeAfter,
  'options-table': OptionsTable,
  'steps-horizontal': StepsHorizontal,
  'steps-vertical': StepsVertical,
  'timeline-horizontal': TimelineHorizontal,
  'timeline-vertical': TimelineVertical,
  'phases-deliverables': PhasesDeliverables,
  'funnel-journey': FunnelJourney,
  'swot-grid': SwotGrid,
  'matrix-2x2': Matrix2x2,
  'pillars-3': Pillars3,
  'pillars-4': Pillars4,
  'budget-category-bars': BudgetCategoryBars,
  'budget-table': BudgetTable,
  'allocation-visual': AllocationVisual,
  'cost-breakdown-cards': CostBreakdownCards,
  'bullet-hierarchy': BulletHierarchy,
  'numbered-badges': NumberedBadges,
  'checklist-icons': ChecklistIcons,
  'quote-testimonial': QuoteTestimonial,
  'call-to-action': CallToAction,
};

export function getLayoutComponent(id: string): ComponentType<LayoutProps> | undefined {
  return LAYOUT_COMPONENTS[id] ?? PlaceholderLayout;
}
