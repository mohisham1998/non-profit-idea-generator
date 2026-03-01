# Quickstart: Gamma-Inspired Smart Layout Engine

**Feature**: 007-gamma-smart-layout-engine  
**Date**: 2026-03-01

---

## Prerequisites

- Node.js 20+ with pnpm 10.x
- PostgreSQL database (existing setup)
- Cairo font files (bundled in `client/assets/fonts/`)

---

## Key Files to Modify

### Client-Side (Frontend)

| File | Purpose |
|------|---------|
| `client/src/lib/layoutRegistry.ts` | **NEW** - Layout definitions registry (45 layouts) |
| `client/src/lib/contentAnalyzer.ts` | **NEW** - Content analysis for layout selection |
| `client/src/lib/layoutSelector.ts` | **NEW** - Scoring algorithm for layout selection |
| `client/src/lib/aiLayoutSelector.ts` | **MODIFY** - Wire new selector, add logging |
| `client/src/lib/slideLayoutEngine.ts` | **MODIFY** - Integrate new layout system |
| `client/src/components/SlideBuilder/layouts/` | **MODIFY** - Add new layout components |
| `client/src/hooks/useSlideExport.ts` | **MODIFY** - Replace capture with native export |
| `client/src/lib/pdfExporter.ts` | **NEW** - Native PDF generation |
| `client/src/lib/pptxExporter.ts` | **NEW** - Native PPTX generation |
| `client/src/components/SlideBuilder/SlideImage.tsx` | **MODIFY** - Add retry/fallback |
| `client/src/stores/slideStore.ts` | **MODIFY** - Add layoutId, overflowStrategy |

### Server-Side (Backend)

| File | Purpose |
|------|---------|
| `server/layoutLogsRouter.ts` | **NEW** - Layout selection logging API |
| `server/exportRouter.ts` | **NEW** - Export job management API |
| `drizzle/schema.ts` | **MODIFY** - Add layout_selection_logs, export_jobs |
| `drizzle/migrations/` | **NEW** - Migration for new tables |

### Assets

| File | Purpose |
|------|---------|
| `client/assets/fonts/Cairo-Regular.ttf` | **NEW** - Cairo font for embedding |
| `client/assets/fonts/Cairo-Bold.ttf` | **NEW** - Cairo bold font |
| `client/assets/fonts/Cairo-SemiBold.ttf` | **NEW** - Cairo semibold font |

---

## Implementation Steps

### Step 1: Database Migration

```bash
# Create migration
pnpm drizzle-kit generate:pg

# Apply migration
pnpm drizzle-kit push:pg
```

### Step 2: Layout Registry

Create `client/src/lib/layoutRegistry.ts`:

```typescript
import { LayoutDefinition, LayoutFamily } from './types/layouts';

// Import all layout components
import { CoverHero } from '../components/SlideBuilder/layouts/CoverHero';
import { FeatureCards3 } from '../components/SlideBuilder/layouts/FeatureCards3';
// ... import all 45 layouts

export const LAYOUT_REGISTRY: Record<string, LayoutDefinition> = {
  'cover-hero': {
    id: 'cover-hero',
    family: 'cover',
    name: 'Cover Hero',
    description: 'Title + subtitle + background/image',
    bestFor: ['title-only', 'title-subtitle', '1-item'],
    minItems: 1,
    maxItems: 2,
    supportsImages: true,
    densityLevel: 'low',
    estimatedHeight: 1080,
    component: CoverHero,
    pptxMapper: coverHeroPptxMapper,
    pdfMapper: coverHeroPdfMapper,
  },
  // ... define all 45 layouts
};
```

### Step 3: Content Analyzer

Create `client/src/lib/contentAnalyzer.ts`:

```typescript
import { ContentAnalysis, ContentBlock, ContentPattern } from './types/layouts';

export function analyzeContent(content: string, slideType?: string): ContentAnalysis {
  const blocks = parseContentBlocks(content);
  const patterns = detectContentPatterns(blocks);
  
  return {
    itemCount: blocks.length,
    densityScore: calculateDensityScore(content, blocks.length),
    structureType: detectStructureType(blocks),
    patterns,
    hasTable: patterns.includes('table'),
    hasMetrics: patterns.includes('stats') || patterns.includes('kpis'),
    hasImages: content.includes('[image]') || content.includes('صورة'),
    hasList: blocks.some(b => b.type === 'bullet' || b.type === 'number'),
    // ... other flags
  };
}
```

### Step 4: Layout Selector

Create `client/src/lib/layoutSelector.ts`:

```typescript
import { LAYOUT_REGISTRY } from './layoutRegistry';
import { ContentAnalysis, LayoutDefinition } from './types/layouts';

export function selectLayout(
  analysis: ContentAnalysis,
  slideType?: string
): { layoutId: string; score: number; candidates: string[] } {
  const scores: Record<string, number> = {};
  
  for (const [id, layout] of Object.entries(LAYOUT_REGISTRY)) {
    scores[id] = scoreLayout(layout, analysis);
  }
  
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);
  
  return {
    layoutId: sorted[0][0],
    score: sorted[0][1],
    candidates: sorted.slice(0, 5).map(([id]) => id),
  };
}

function scoreLayout(layout: LayoutDefinition, analysis: ContentAnalysis): number {
  let score = 0;
  
  // Item count match
  if (analysis.itemCount >= layout.minItems && 
      analysis.itemCount <= layout.maxItems) {
    score += 30;
  }
  
  // Pattern match
  const patternMatches = layout.bestFor.filter(p => 
    analysis.patterns.includes(p)
  ).length;
  score += patternMatches * 15;
  
  // Density match
  if (layout.densityLevel === 'high' && analysis.densityScore > 60) score += 10;
  if (layout.densityLevel === 'low' && analysis.densityScore < 30) score += 10;
  
  return score;
}
```

### Step 5: Image Retry Component

Modify `client/src/components/SlideBuilder/SlideImage.tsx`:

```typescript
export function SlideImage({ src, alt, placement }: SlideImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  
  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(c => c + 1);
      setStatus('loading');
    }
  };
  
  if (status === 'error') {
    return (
      <ImagePlaceholder onRetry={handleRetry} canRetry={retryCount < 3} />
    );
  }
  
  return (
    <img 
      key={retryCount}
      src={src} 
      alt={alt}
      onLoad={() => setStatus('loaded')}
      onError={() => setStatus('error')}
    />
  );
}
```

### Step 6: PDF Exporter

Create `client/src/lib/pdfExporter.ts`:

```typescript
import { jsPDF } from 'jspdf';
import { LAYOUT_REGISTRY } from './layoutRegistry';
import { PdfSlideDefinition } from './types/exports';

// Register Cairo fonts
import CairoRegular from '../assets/fonts/Cairo-Regular.ttf';
import CairoBold from '../assets/fonts/Cairo-Bold.ttf';

export async function exportToPdf(
  slides: Slide[],
  theme: PresentationTheme
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1920, 1080],
  });
  
  // Register fonts
  doc.addFont(CairoRegular, 'Cairo', 'normal');
  doc.addFont(CairoBold, 'Cairo', 'bold');
  
  for (let i = 0; i < slides.length; i++) {
    if (i > 0) doc.addPage();
    
    const slide = slides[i];
    const layout = LAYOUT_REGISTRY[slide.layoutId];
    const definition = layout.pdfMapper(slide.content, theme, slide.config);
    
    renderPdfSlide(doc, definition);
  }
  
  return doc.output('blob');
}
```

### Step 7: PPTX Exporter

Create `client/src/lib/pptxExporter.ts`:

```typescript
import PptxGenJS from 'pptxgenjs';
import { LAYOUT_REGISTRY } from './layoutRegistry';

export async function exportToPptx(
  slides: Slide[],
  theme: PresentationTheme
): Promise<Blob> {
  const pptx = new PptxGenJS();
  
  pptx.layout = 'LAYOUT_16x9';
  pptx.rtlMode = true;
  
  for (const slide of slides) {
    const pptxSlide = pptx.addSlide();
    const layout = LAYOUT_REGISTRY[slide.layoutId];
    const definition = layout.pptxMapper(slide.content, theme, slide.config);
    
    renderPptxSlide(pptxSlide, definition);
  }
  
  return pptx.write({ outputType: 'blob' }) as Promise<Blob>;
}
```

---

## Testing

### Unit Tests

```bash
# Test layout registry
pnpm test client/src/lib/layoutRegistry.test.ts

# Test content analyzer
pnpm test client/src/lib/contentAnalyzer.test.ts

# Test layout selector
pnpm test client/src/lib/layoutSelector.test.ts
```

### Integration Tests

```bash
# Test PDF export
pnpm test:e2e tests/export-pdf.spec.ts

# Test PPTX export
pnpm test:e2e tests/export-pptx.spec.ts
```

### Manual Testing Checklist

1. [ ] Generate slide with 3 items → should use 3-up layout
2. [ ] Generate KPI slide with 4 metrics → should use stat-blocks-4
3. [ ] Add image to slide → should load without errors
4. [ ] Simulate image failure → should show placeholder with retry
5. [ ] Generate 10+ item slide → should use dense layout or split
6. [ ] Export to PDF → should open in Adobe Reader
7. [ ] Export to PPTX → should open in PowerPoint with editable text
8. [ ] Check layout logs → should see all selection decisions

---

## Common Issues

### Fonts Not Rendering in PDF

**Solution**: Ensure Cairo font files are in `client/assets/fonts/` and registered with jsPDF before any text rendering.

### RTL Text Reversed in Export

**Solution**: Set `rtlMode: true` in pptxgenjs and `direction: 'rtl'` in jsPDF text options.

### Images Not Appearing in Export

**Solution**: Ensure images are converted to base64 data URLs before passing to exporters. External URLs may not work in PDF generation.

### Layout Not Selected Correctly

**Solution**: Check content analysis output in console. Ensure `bestFor` patterns in layout definition match detected patterns.
