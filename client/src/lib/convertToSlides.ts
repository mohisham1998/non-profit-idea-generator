import { SlideCard, CardType, defaultCardStyle } from '@/stores/slideStore';
import { nanoid } from 'nanoid';

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
    slides.push({
      id: nanoid(),
      type: 'cover',
      title: 'Cover Slide',
      content: {
        title: data.generatedIdea.selectedName || data.generatedIdea.programDescription.substring(0, 100),
        subtitle: data.generatedIdea.programDescription,
        targetAudience: data.generatedIdea.targetAudience,
        duration: data.generatedIdea.duration,
      },
      style: {
        ...defaultCardStyle,
        backgroundColor: '#ffffff',
        colorTheme: 'default',
        contentAlignment: 'top',
      },
      order: order++,
    });
  }
  
  // 2. Convert main idea sections
  if (data.generatedIdea) {
    const idea = data.generatedIdea;
    
    // Proposed Names — NOT a slide card; stored in slideStore.proposedNames
    // and shown via the ProposedNamesModal popup instead.
    
    // Vision
    if (idea.vision) {
      slides.push(createSlide('custom', 'الرؤية', {
        vision: idea.vision,
      }, order++));
    }
    
    // General Objective
    if (idea.generalObjective) {
      slides.push(createSlide('custom', 'الهدف العام', {
        generalObjective: idea.generalObjective,
      }, order++));
    }
    
    // Detailed Objectives
    if (idea.detailedObjectives) {
      slides.push(createSlide('custom', 'الأهداف التفصيلية', {
        detailedObjectives: idea.detailedObjectives,
      }, order++));
    }
    
    // Main Idea
    slides.push(createSlide('custom', 'الفكرة', {
      idea: idea.idea,
    }, order++));
    
    // Justifications
    slides.push(createSlide('custom', 'مبررات البرنامج', {
      justifications: idea.justifications,
    }, order++));
    
    // Features
    slides.push(createSlide('custom', 'المميزات', {
      features: idea.features,
    }, order++));
    
    // Strengths
    slides.push(createSlide('custom', 'نقاط القوة', {
      strengths: idea.strengths,
    }, order++));
    
    // Outputs
    slides.push(createSlide('custom', 'المخرجات', {
      outputs: idea.outputs,
    }, order++));
    
    // Expected Results
    slides.push(createSlide('custom', 'النتائج المتوقعة', {
      expectedResults: idea.expectedResults,
    }, order++));
    
    // Risks
    if (idea.risks) {
      slides.push(createSlide('custom', 'المخاطر', {
        risks: idea.risks,
      }, order++));
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
    slides.push(createSlide('designThinking', 'التفكير التصميمي', data.designThinkingData, order++, 'orange'));
  }
  
  if (data.showMarketing && data.marketingData) {
    slides.push(createSlide('marketing', 'المحتوى التسويقي', data.marketingData, order++, 'purple'));
  }
  
  return slides;
}

/**
 * Helper function to create a slide
 */
function createSlide(
  type: CardType,
  title: string,
  content: any,
  order: number,
  colorTheme: 'default' | 'blue' | 'green' | 'purple' | 'orange' = 'default'
): SlideCard {
  return {
    id: nanoid(),
    type,
    title,
    content,
    style: {
      ...defaultCardStyle,
      colorTheme,
    },
    order,
  };
}

/**
 * Convert a single component to a slide (for adding new components)
 */
export function convertComponentToSlide(
  type: CardType,
  title: string,
  content: any,
  colorTheme?: 'default' | 'blue' | 'green' | 'purple' | 'orange'
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
export function getDefaultColorForType(type: CardType): 'default' | 'blue' | 'green' | 'purple' | 'orange' {
  const colorMap: Record<CardType, 'default' | 'blue' | 'green' | 'purple' | 'orange'> = {
    cover: 'orange',
    kpis: 'blue',
    budget: 'green',
    swot: 'purple',
    logframe: 'blue',
    timeline: 'blue',
    pmdpro: 'purple',
    designThinking: 'orange',
    marketing: 'purple',
    custom: 'default',
  };
  
  return colorMap[type] || 'default';
}
