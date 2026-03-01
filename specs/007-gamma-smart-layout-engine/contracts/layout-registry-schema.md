# Contract: Layout Registry Schema

**Feature**: 007-gamma-smart-layout-engine  
**Type**: Internal TypeScript Interface  
**Date**: 2026-03-01

---

## Overview

Defines the structure of the Smart Layout Registry containing all 45 layouts. This is the single source of truth for layout definitions used by:
- AI layout selector
- Slide renderer
- PDF exporter
- PPT exporter

---

## TypeScript Interfaces

### LayoutFamily Enum

```typescript
export type LayoutFamily =
  | 'cover'       // C1: Cover & Section
  | 'text-media'  // C2: Text + Media
  | 'cards'       // C3: Cards / Features
  | 'kpis'        // C4: KPIs / Stats
  | 'comparison'  // C5: Comparison & Decision
  | 'process'     // C6: Process / Journey / Timeline
  | 'frameworks'  // C7: Frameworks / Matrices
  | 'budget'      // C8: Budget / Allocation
  | 'lists';      // C9: Lists / Content Density
```

### ContentPattern Enum

```typescript
export type ContentPattern =
  // Item counts
  | '1-item' | '2-items' | '3-items' | '4-items' | '5-items' | '6-items' | '7+-items'
  // Content types
  | 'title-only' | 'title-subtitle' | 'hero-number' | 'quote'
  | 'bullet-list' | 'numbered-list' | 'checklist'
  | 'features' | 'benefits' | 'steps' | 'phases'
  | 'stats' | 'kpis' | 'metrics' | 'progress'
  | 'comparison' | 'pros-cons' | 'before-after' | 'options'
  | 'timeline' | 'journey' | 'funnel'
  | 'matrix' | 'grid' | 'swot' | 'pillars'
  | 'budget' | 'allocation' | 'costs'
  | 'image-heavy' | 'text-heavy' | 'balanced'
  | 'cta' | 'testimonial';
```

### DensityLevel Type

```typescript
export type DensityLevel = 'low' | 'medium' | 'high';
```

### LayoutDefinition Interface

```typescript
export interface LayoutDefinition {
  /** Unique identifier (e.g., 'feature-cards-3') */
  id: string;
  
  /** Layout family for grouping */
  family: LayoutFamily;
  
  /** Human-readable display name */
  name: string;
  
  /** Short description of best use case */
  description: string;
  
  /** Content patterns this layout handles well */
  bestFor: ContentPattern[];
  
  /** Minimum items required for this layout */
  minItems: number;
  
  /** Maximum items before overflow */
  maxItems: number;
  
  /** Whether layout supports image slots */
  supportsImages: boolean;
  
  /** Image placement positions if supported */
  imagePlacements?: ImagePlacement[];
  
  /** Content density level */
  densityLevel: DensityLevel;
  
  /** Estimated height in pixels at 1920×1080 */
  estimatedHeight: number;
  
  /** Denser variant layout ID (for overflow handling) */
  denserVariant?: string;
  
  /** React component for rendering */
  component: React.ComponentType<LayoutProps>;
  
  /** PPTX element mapper function */
  pptxMapper: PptxMapper;
  
  /** PDF element mapper function */
  pdfMapper: PdfMapper;
}
```

### LayoutProps Interface

```typescript
export interface LayoutProps {
  /** Slide title */
  title: string;
  
  /** Parsed content blocks */
  blocks: ContentBlock[];
  
  /** Theme/branding settings */
  theme: PresentationTheme;
  
  /** Images to render */
  images: SlideImage[];
  
  /** Layout-specific configuration */
  config: LayoutConfig;
  
  /** Whether in edit mode */
  isEditing: boolean;
  
  /** Content change handler */
  onContentChange?: (content: string) => void;
}
```

### LayoutConfig Interface

```typescript
export interface LayoutConfig {
  /** Image placement instructions */
  imagePlacements: ImagePlacement[];
  
  /** Custom spacing override (px) */
  customSpacing?: number;
  
  /** Number of columns (for grid layouts) */
  columns?: number;
  
  /** Number of rows (for grid layouts) */
  rows?: number;
  
  /** Highlighted item index (for comparison) */
  highlightIndex?: number;
  
  /** Show icons alongside items */
  showIcons?: boolean;
  
  /** Icon set to use */
  iconSet?: 'lucide' | 'custom';
}
```

### ImagePlacement Interface

```typescript
export interface ImagePlacement {
  /** Placement position */
  position: 'background' | 'left-panel' | 'right-panel' | 'top-banner' | 
            'bottom-banner' | 'card-1' | 'card-2' | 'card-3' | 'card-4' |
            'icon-1' | 'icon-2' | 'icon-3' | 'icon-4' | 'icon-5' | 'icon-6';
  
  /** Size of image area */
  size: 'full' | 'half' | 'third' | 'quarter' | 'icon';
  
  /** Content prompt for AI image generation */
  contentPrompt?: string;
  
  /** Whether image is required or optional */
  required: boolean;
}
```

---

## Layout Registry Structure

```typescript
export const LAYOUT_REGISTRY: Record<string, LayoutDefinition> = {
  // C1 — Cover & Section
  'cover-hero': { ... },
  'cover-split': { ... },
  'section-divider': { ... },
  'agenda-outline': { ... },
  
  // C2 — Text + Media
  'split-50-50': { ... },
  'split-30-70': { ... },
  'text-overlay': { ... },
  'gallery-captions': { ... },
  'visual-callout': { ... },
  
  // C3 — Cards / Features
  'feature-cards-3': { ... },
  'feature-cards-4': { ... },
  'icon-cards-3': { ... },
  'icon-cards-6': { ... },
  'problem-solution': { ... },
  'benefits-grid': { ... },
  
  // C4 — KPIs / Stats
  'stat-blocks-3': { ... },
  'stat-blocks-4': { ... },
  'kpi-table': { ... },
  'kpi-list-icons': { ... },
  'progress-bars': { ... },
  'big-number-breakdown': { ... },
  
  // C5 — Comparison & Decision
  'compare-2col': { ... },
  'compare-3col': { ... },
  'pros-cons': { ... },
  'before-after': { ... },
  'options-table': { ... },
  
  // C6 — Process / Journey / Timeline
  'steps-horizontal': { ... },
  'steps-vertical': { ... },
  'timeline-horizontal': { ... },
  'timeline-vertical': { ... },
  'phases-deliverables': { ... },
  'funnel-journey': { ... },
  
  // C7 — Frameworks / Matrices
  'swot-grid': { ... },
  'matrix-2x2': { ... },
  'pillars-3': { ... },
  'pillars-4': { ... },
  
  // C8 — Budget / Allocation
  'budget-category-bars': { ... },
  'budget-table': { ... },
  'allocation-visual': { ... },
  'cost-breakdown-cards': { ... },
  
  // C9 — Lists / Content Density
  'bullet-hierarchy': { ... },
  'numbered-badges': { ... },
  'checklist-icons': { ... },
  'quote-testimonial': { ... },
  'call-to-action': { ... },
};
```

---

## Registry Access Functions

```typescript
/** Get layout by ID */
export function getLayout(id: string): LayoutDefinition | undefined;

/** Get all layouts in a family */
export function getLayoutsByFamily(family: LayoutFamily): LayoutDefinition[];

/** Get layouts matching content patterns */
export function getLayoutsForPatterns(patterns: ContentPattern[]): LayoutDefinition[];

/** Get denser variant of a layout (for overflow handling) */
export function getDenserVariant(layoutId: string): LayoutDefinition | undefined;

/** Get all layout IDs */
export function getAllLayoutIds(): string[];

/** Validate layout exists in registry */
export function isValidLayoutId(id: string): boolean;
```

---

## Constraints

1. **Uniqueness**: Each `id` must be unique across the entire registry
2. **Completeness**: All 45 layouts must be defined
3. **Component Required**: Every layout must have a valid React component
4. **Export Mappers Required**: Every layout must have both pptxMapper and pdfMapper
5. **Height Limits**: `estimatedHeight` must be ≤ 1620 (150% of standard 1080)
6. **Item Bounds**: `minItems` must be ≤ `maxItems`
7. **Denser Variant**: If specified, must reference a valid layout ID with higher density
