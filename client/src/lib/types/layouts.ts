/**
 * Layout types for Gamma-inspired Smart Layout Engine
 * @see specs/007-gamma-smart-layout-engine/contracts/layout-registry-schema.md
 */

import type { ComponentType } from 'react';

// Layout families (C1–C9)
export type LayoutFamily =
  | 'cover'
  | 'text-media'
  | 'cards'
  | 'kpis'
  | 'comparison'
  | 'process'
  | 'frameworks'
  | 'budget'
  | 'lists';

// Content patterns for layout selection
export type ContentPattern =
  | '1-item'
  | '2-items'
  | '3-items'
  | '4-items'
  | '5-items'
  | '6-items'
  | '7+-items'
  | 'title-only'
  | 'title-subtitle'
  | 'hero-number'
  | 'quote'
  | 'bullet-list'
  | 'numbered-list'
  | 'checklist'
  | 'features'
  | 'benefits'
  | 'steps'
  | 'phases'
  | 'stats'
  | 'kpis'
  | 'metrics'
  | 'progress'
  | 'comparison'
  | 'pros-cons'
  | 'before-after'
  | 'options'
  | 'timeline'
  | 'journey'
  | 'funnel'
  | 'matrix'
  | 'grid'
  | 'swot'
  | 'pillars'
  | 'budget'
  | 'allocation'
  | 'costs'
  | 'image-heavy'
  | 'text-heavy'
  | 'balanced'
  | 'cta'
  | 'testimonial';

export type DensityLevel = 'low' | 'medium' | 'high';

export type ContentStructure =
  | 'list'
  | 'stats'
  | 'matrix'
  | 'steps'
  | 'narrative'
  | 'mixed';

export type OverflowStrategy =
  | 'none'
  | 'denser-layout'
  | 'expanded'
  | 'split';

/** Image placement in layout */
export interface ImagePlacement {
  position:
    | 'background'
    | 'left-panel'
    | 'right-panel'
    | 'top-banner'
    | 'bottom-banner'
    | 'card-1'
    | 'card-2'
    | 'card-3'
    | 'card-4'
    | 'icon-1'
    | 'icon-2'
    | 'icon-3'
    | 'icon-4'
    | 'icon-5'
    | 'icon-6';
  size: 'full' | 'half' | 'third' | 'quarter' | 'icon';
  contentPrompt?: string;
  required: boolean;
}

/** Layout-specific configuration */
export interface LayoutConfig {
  imagePlacements: ImagePlacement[];
  customSpacing?: number;
  columns?: number;
  rows?: number;
  highlightIndex?: number;
  showIcons?: boolean;
  iconSet?: 'lucide' | 'custom';
}

/** Parsed content block */
export interface ContentBlock {
  id?: string;
  type: 'heading' | 'subheading' | 'paragraph' | 'bullet' | 'number' | 'stat' | 'quote' | 'image-ref' | 'table-row';
  content: string;
  value?: number;
  unit?: string;
  label?: string;
  level?: number;
  icon?: string;
}

/** Content analysis for layout selection */
export interface ContentAnalysis {
  itemCount: number;
  densityScore: number;
  structureType: ContentStructure;
  secondaryStructures?: ContentStructure[];
  hasTable: boolean;
  hasMetrics: boolean;
  hasImages: boolean;
  hasList: boolean;
  hasTimeline: boolean;
  hasComparison: boolean;
  hasMatrix?: boolean;
  hasBudget?: boolean;
  hasQuote?: boolean;
  patterns: ContentPattern[];
  avgWordsPerItem?: number;
  totalChars?: number;
  estimatedHeight?: number;
}

/** Theme/branding for slides */
export interface PresentationTheme {
  id: string;
  name: string;
  logo?: string;
  logoPosition: string;
  logoSize: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}

/** Image for layout */
export interface SlideImageRef {
  id: string;
  url: string;
  status: 'loading' | 'ready' | 'failed';
  position: string;
  size: string;
}

/** Props passed to layout components */
export interface LayoutProps {
  title: string;
  blocks: ContentBlock[];
  theme: PresentationTheme;
  images: SlideImageRef[];
  config: LayoutConfig;
  isEditing?: boolean;
  onContentChange?: (content: string) => void;
}

/** Mapper types - will be implemented per layout */
export type PptxMapper = (
  content: LayoutContent,
  theme: PresentationTheme,
  config: LayoutConfig
) => PptxSlideDefinition;

export type PdfMapper = (
  content: LayoutContent,
  theme: PresentationTheme,
  config: LayoutConfig
) => PdfSlideDefinition;

/** Content passed to mappers */
export interface LayoutContent {
  title: string;
  blocks: ContentBlock[];
  images: ResolvedImage[];
  slideType: string;
  config: LayoutConfig;
}

export interface ResolvedImage {
  placement: string;
  url: string;
  width: number;
  height: number;
  alt?: string;
}

/** PDF/PPTX output definitions - minimal types for registry */
export interface PdfSlideDefinition {
  width: number;
  height: number;
  background: unknown;
  elements: unknown[];
}

export interface PptxSlideDefinition {
  layout?: string;
  background: unknown;
  elements: unknown[];
}

/** Layout definition in registry */
export interface LayoutDefinition {
  id: string;
  family: LayoutFamily;
  name: string;
  description: string;
  bestFor: ContentPattern[];
  minItems: number;
  maxItems: number;
  supportsImages: boolean;
  imagePlacements?: ImagePlacement[];
  densityLevel: DensityLevel;
  estimatedHeight: number;
  denserVariant?: string;
  component: ComponentType<LayoutProps>;
  pptxMapper: PptxMapper;
  pdfMapper: PdfMapper;
}
