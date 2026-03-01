import { SlideCard, CardType, defaultCardStyle } from '@/stores/slideStore';
import { nanoid } from 'nanoid';
import { parseLines, shouldSplitContent, splitContentForSlides, getLayoutForContent } from './slideLayoutEngine';
import { selectLayoutWithImages, selectRegistryLayout } from './aiLayoutSelector';

/**
 * Converts existing component data from Home.tsx state into SlideCard format
 * This utility handles the migration from the old layout to the new slide builder
 */

interface ExistingComponentData {
  // Main idea sections
  generatedIdea?: {
    id: number;
    programDescription: string;
    targetAudience?: string | null;
    targetCount?: string | null;
    duration?: string | null;
    proposedNames?: string | string[] | null;
    selectedName?: string | null;
    vision?: string | null;
    generalObjective?: string | null;
    detailedObjectives?: string | null;
    idea: string;
    objective: string;
    justifications: string;
    features: string;
    strengths: string;
    outputs: string;
    expectedResults: string;
    risks?: string | null;
  };
  
  // Generated components
  kpisData?: any;
  budgetData?: any;
  swotData?: any;
  logFrameData?: any;
  timelineData?: any;
  pmdproData?: any;
  designThinkingData?: any;
  marketingData?: any;
  
  // Flags to check what's available
  showKPIs?: boolean;
  showBudget?: boolean;
  showSWOT?: boolean;
  showLogFrame?: boolean;
  showTimeline?: boolean;
  showPMDPro?: boolean;
  showDesignThinking?: boolean;
  showMarketing?: boolean;
}

/**
 * Main conversion function
 */
export function convertExistingDataToSlides(data: ExistingComponentData): SlideCard[] {
  const slides: SlideCard[] = [];
  let order = 0;
  
  // 1. Add cover slide (clean white design)
  if (data.generatedIdea) {
    const coverContent = {
      title: data.generatedIdea.selectedName || data.generatedIdea.programDescription.substring(0, 100),
      subtitle: data.generatedIdea.programDescription,
      targetAudience: data.generatedIdea.targetAudience,
      duration: data.generatedIdea.duration,
    };
    const coverText = [coverContent.title, coverContent.subtitle].filter(Boolean).join('\n');
    const { layoutId, contentAnalysis, logPayload } = selectRegistryLayout(coverText, 'cover');
    slides.push({
      id: nanoid(),
      type: 'cover',
      title: 'Cover Slide',
      content: coverContent,
      style: {
        ...defaultCardStyle,
        backgroundColor: '#ffffff',
        colorTheme: 'teal',
        contentAlignment: 'top',
      },
      order: order++,
      layoutId,
      contentAnalysis,
      layoutSelectionLogPayload: logPayload,
    });
  }
  
  // 2. Convert main idea sections
  if (data.generatedIdea) {
    const idea = data.generatedIdea;
    
    // Proposed Names — NOT a slide card; stored in slideStore.proposedNames
    // and shown via the ProposedNamesModal popup instead.
    
    // Vision
    if (idea.vision) {
      slides.push(createSlide('custom', 'الرؤية', { vision: idea.vision }, order++, 'default', 'vision'));
    }
    
    // General Objective
    if (idea.generalObjective) {
      slides.push(createSlide('custom', 'الهدف العام', { generalObjective: idea.generalObjective }, order++, 'default', 'generalObjective'));
    }
    
    // Detailed Objectives (split if long)
    if (idea.detailedObjectives) {
      order = createSlidesForListContent('custom', 'الأهداف التفصيلية', 'detailedObjectives', idea.detailedObjectives, order, 'default', slides);
    }
    
    // Main Idea
    slides.push(createSlide('custom', 'الفكرة', { idea: idea.idea }, order++, 'default', 'idea'));
    
    // Justifications (split if long)
    order = createSlidesForListContent('custom', 'مبررات البرنامج', 'justifications', idea.justifications, order, 'default', slides);
    
    // Features (split if long)
    order = createSlidesForListContent('custom', 'المميزات', 'features', idea.features, order, 'default', slides);
    
    // Strengths (split if long)
    order = createSlidesForListContent('custom', 'نقاط القوة', 'strengths', idea.strengths, order, 'default', slides);
    
    // Outputs (split if long)
    order = createSlidesForListContent('custom', 'المخرجات', 'outputs', idea.outputs, order, 'default', slides);
    
    // Expected Results (split if long)
    order = createSlidesForListContent('custom', 'النتائج المتوقعة', 'expectedResults', idea.expectedResults, order, 'default', slides);
    
    // Risks (split if long)
    if (idea.risks) {
      order = createSlidesForListContent('custom', 'المخاطر', 'risks', idea.risks, order, 'default', slides);
    }
  }
  
  // 3. Convert generated components
  if (data.showKPIs && data.kpisData) {
    slides.push(createSlide('kpis', 'مؤشرات قياس الأداء (KPIs)', data.kpisData, order++, 'blue'));
  }
  
  if (data.showBudget && data.budgetData) {
    slides.push(createSlide('budget', 'تقدير الميزانية', data.budgetData, order++, 'green'));
  }
  
  if (data.showSWOT && data.swotData) {
    slides.push(createSlide('swot', 'تحليل SWOT', data.swotData, order++, 'purple'));
  }
  
  if (data.showLogFrame && data.logFrameData) {
    slides.push(createSlide('logframe', 'الإطار المنطقي', data.logFrameData, order++, 'blue'));
  }
  
  if (data.showTimeline && data.timelineData) {
    slides.push(createSlide('timeline', 'الجدول الزمني', data.timelineData, order++, 'blue'));
  }
  
  if (data.showPMDPro && data.pmdproData) {
    slides.push(createSlide('pmdpro', 'خطة PMDPro', data.pmdproData, order++, 'purple'));
  }
  
  if (data.showDesignThinking && data.designThinkingData) {
    slides.push(createSlide('designThinking', 'التفكير التصميمي', data.designThinkingData, order++, 'teal'));
  }
  
  if (data.showMarketing && data.marketingData) {
    slides.push(createSlide('marketing', 'المحتوى التسويقي', data.marketingData, order++, 'purple'));
  }
  
  return slides;
}

/**
 * Helper function to create a slide.
 * Uses layout engine for layoutVariant, itemStyle, textSize (no solid text, content splitting).
 */
function createSlide(
  type: CardType,
  title: string,
  content: any,
  order: number,
  colorTheme: 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'teal' = 'default',
  contentKey?: string
): SlideCard {
  let layoutVariant: 'cards' | 'list' | 'grid' | 'numbered' | 'quote' | 'timeline' | 'compact' | 'table' | undefined;
  let itemStyle: 'numbered' | 'check' | 'arrow' | 'dot' | 'star' | 'card' | undefined;
  let textSize: 'sm' | 'md' | 'lg' | undefined;

  if (type === 'custom' && contentKey) {
    const raw = content[contentKey];
    const text = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw.join('\n') : String(raw ?? '');
    const items = parseLines(raw);
    const selection = getLayoutForContent(contentKey, text, items.length);
    layoutVariant = selection.layout as 'cards' | 'list' | 'grid' | 'numbered' | 'quote' | 'timeline' | 'compact' | 'table';
    itemStyle = selection.itemStyle;
    textSize = selection.textSize;
  }

  const contentTypeForLayout = (type === 'custom' && contentKey) ? contentKey : type;
  const raw = contentKey ? content[contentKey] : content;
  const text = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw.join('\n') : String(raw ?? '');
  const items = parseLines(raw);
  const layoutDecision = selectLayoutWithImages(contentTypeForLayout, text, items.length);
  const images = layoutDecision.imagePlacements.slice(0, 3).map((p) => ({
    id: '',
    url: '',
    status: 'loading' as const,
    position: p.position as 'background' | 'left-panel' | 'right-panel' | 'top-banner',
    size: p.size as 'full' | 'half' | 'third' | 'quarter',
  }));

  const { layoutId, contentAnalysis, logPayload } = selectRegistryLayout(text, contentTypeForLayout);

  return {
    id: nanoid(),
    type,
    title,
    content,
    style: {
      ...defaultCardStyle,
      colorTheme,
      ...(layoutVariant && { layoutVariant }),
      ...(itemStyle && { itemStyle }),
      ...(textSize && { textSize }),
    },
    order,
    layoutConfig: { layoutType: layoutDecision.layoutType, imagePlacements: layoutDecision.imagePlacements, estimatedHeight: layoutDecision.estimatedHeight },
    images: images.length > 0 ? images : undefined,
    layoutId,
    contentAnalysis,
    layoutSelectionLogPayload: logPayload,
  };
}

/** Create slides for list-type content, splitting if too long (>800 chars or >8 blocks). */
function createSlidesForListContent(
  type: CardType,
  baseTitle: string,
  contentKey: string,
  rawContent: any,
  orderStart: number,
  colorTheme: 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'teal',
  slides: SlideCard[]
): number {
  const text = typeof rawContent === 'string' ? rawContent : Array.isArray(rawContent) ? rawContent.join('\n') : String(rawContent ?? '');
  const items = parseLines(rawContent);
  const selection = getLayoutForContent(contentKey, text, items.length);

  if (!shouldSplitContent(text, items.length)) {
    slides.push(createSlide(type, baseTitle, { [contentKey]: text }, orderStart, colorTheme, contentKey));
    return orderStart + 1;
  }

  const chunks = splitContentForSlides(items, 4);
  chunks.forEach((chunk, i) => {
    const slideTitle = chunks.length > 1 ? `${baseTitle} (${i + 1} من ${chunks.length})` : baseTitle;
    slides.push(createSlide(type, slideTitle, { [contentKey]: chunk.join('\n') }, orderStart + i, colorTheme, contentKey));
  });
  return orderStart + chunks.length;
}

/**
 * Convert a single component to a slide (for adding new components)
 */
export function convertComponentToSlide(
  type: CardType,
  title: string,
  content: any,
  colorTheme?: 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'teal'
): Omit<SlideCard, 'id' | 'order'> {
  return {
    type,
    title,
    content,
    style: {
      ...defaultCardStyle,
      colorTheme: colorTheme || 'default',
    },
  };
}

/**
 * Get color theme based on card type
 */
export function getDefaultColorForType(type: CardType): 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'teal' {
  const colorMap: Record<CardType, 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'teal'> = {
    cover: 'teal',
    kpis: 'blue',
    budget: 'green',
    swot: 'purple',
    logframe: 'blue',
    timeline: 'blue',
    pmdpro: 'purple',
    designThinking: 'teal',
    marketing: 'purple',
    custom: 'default',
  };
  
  return colorMap[type] || 'default';
}
