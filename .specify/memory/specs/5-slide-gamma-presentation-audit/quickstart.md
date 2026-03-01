# Quickstart: Slide Output Gamma Presentation Audit

**Feature**: Slide Output Gamma Presentation Audit  
**Date**: 2026-02-23

---

## Overview

This guide helps you quickly add new layout types, test slide rendering, and debug AI layout selection for the Gamma-quality slide output feature.

---

## Adding a New Layout Type

### Step 1: Create Layout Component

Create a new layout component in `client/src/components/SlideBuilder/layouts/`:

```tsx
// NewLayout.tsx
import React from 'react';
import { SlideLayoutProps } from '@/types/slide';
import { BLOCK_REGISTRY } from '../blocks';

export const NewLayout: React.FC<SlideLayoutProps> = ({ 
  contentBlocks, 
  primaryColor, 
  rtl, 
  dimensions 
}) => {
  return (
    <div 
      className={`slide-layout-new ${rtl ? 'rtl' : 'ltr'}`}
      dir={rtl ? 'rtl' : 'ltr'}
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
        aspectRatio: dimensions.aspectRatio 
      }}
    >
      {/* Render contentBlocks with your layout logic */}
      <div className="layout-container p-8">
        {contentBlocks.map(block => {
          const BlockComponent = BLOCK_REGISTRY[block.type];
          return (
            <BlockComponent
              key={block.id}
              type={block.type}
              content={block.content}
              style={block.style}
              primaryColor={primaryColor}
              rtl={rtl}
            />
          );
        })}
      </div>
    </div>
  );
};
```

### Step 2: Register the Layout

Add your layout to the registry in `layouts/index.ts`:

```ts
// layouts/index.ts
import { NewLayout } from './NewLayout';

export const LAYOUT_REGISTRY = {
  "two-column": TwoColumnLayout,
  "quadrant": QuadrantLayout,
  "new-layout": NewLayout, // Add here
  // ...
};

// Update LayoutType enum
export type LayoutType = 
  | "two-column" 
  | "quadrant"
  | "new-layout" // Add here
  | /* ... */;
```

### Step 3: Update AI Layout Selection

Add the new layout type to the AI prompt in `lib/aiLayoutSelector.ts`:

```ts
const layoutSelectionSchema = {
  // ...
  schema: {
    properties: {
      layout: {
        type: "string",
        enum: [
          "cards", "list", "grid", "numbered", 
          "quote", "timeline", "compact", "table",
          "new-layout" // Add here
        ]
      }
    }
  }
};

const systemPrompt = `...
Layout Guidelines:
- "new-layout": Best for [describe when to use this layout] ([X-Y] items)
...`;
```

### Step 4: Add Visual Regression Test

Add a test in `tests/visual/slideLayouts.spec.ts`:

```ts
test('NewLayout renders correctly in LTR mode', async ({ page }) => {
  await page.goto('/slide-builder');
  
  const slide = {
    type: 'new-layout',
    contentBlocks: [/* test data */],
    primaryColor: '#3B82F6',
    rtl: false,
    dimensions: { width: 1920, height: 1080, aspectRatio: '16:9' }
  };
  
  await page.evaluate((slideData) => {
    window.renderSlide(slideData);
  }, slide);
  
  await expect(page).toHaveScreenshot('new-layout-ltr.png');
});

test('NewLayout renders correctly in RTL mode', async ({ page }) => {
  // Same as above but with rtl: true
});
```

---

## Testing Slide Rendering

### Unit Tests

Run unit tests for layout and content block components:

```bash
# Test AI layout selector
npm test -- aiLayoutSelector.test.ts

# Test slide layout engine
npm test -- slideLayoutEngine.test.ts

# Test icon selector
npm test -- iconSelector.test.ts

# Run all slide-related tests
npm test -- --grep "slide"
```

### Visual Regression Tests

Run Playwright visual regression tests:

```bash
# Run all visual tests
npm run test:visual

# Run specific layout test
npm run test:visual -- --grep "TwoColumnLayout"

# Update snapshots (after intentional visual changes)
npm run test:visual -- --update-snapshots
```

### Manual Testing Checklist

1. **Generate a Deck with Varied Content**
   - Create a new project with mixed content types (features, KPIs, goals, challenges, vision, budget)
   - Verify each slide uses a distinct layout (no two consecutive slides with same layout unless content demands it)

2. **Verify No Solid Text Blocks**
   - Check that all content appears in cards, badges, or sections (not one dense paragraph)
   - Verify numbered content uses visually distinct badges

3. **Test Primary Color Application**
   - Change primary color in user branding settings
   - Regenerate slides
   - Verify badges, headers, and accents use the new primary color

4. **Test RTL Support**
   - Switch language to Arabic
   - Regenerate slides
   - Verify all layouts render correctly in RTL (text alignment, icon placement, numbered badges)

5. **Test Export to PDF/PPTX**
   - Export deck to PDF
   - Verify 16:9 dimensions, visual fidelity, Cairo font rendering
   - Export deck to PowerPoint
   - Verify 16:9 dimensions, visual fidelity, Cairo font rendering (or base64 image fallback)

6. **Test Slide Splitting**
   - Create a slide with >800 characters or >8 content blocks
   - Verify system splits into multiple slides with context preservation ("Goals (1 of 3)", etc.)

---

## Debugging AI Layout Selection

### Check OpenRouter API Logs

1. **Enable Logging in `aiLayoutSelector.ts`**:
   ```ts
   async function selectLayoutWithAI(slideTitle, contentType, slideContent) {
     console.log('[AI Layout] Input:', { slideTitle, contentType, contentLength: slideContent.length });
     
     const response = await fetch(/* ... */);
     const data = await response.json();
     
     console.log('[AI Layout] Output:', data.choices[0].message.content);
     return JSON.parse(data.choices[0].message.content);
   }
   ```

2. **Check Browser Console**:
   - Open DevTools → Console
   - Look for `[AI Layout]` logs
   - Verify input/output match expectations

### Verify Fallback Logic

Test that fallback logic triggers correctly:

```ts
// In aiLayoutSelector.test.ts
test('falls back to rule-based selection on AI timeout', async () => {
  // Mock OpenRouter API to timeout
  global.fetch = jest.fn(() => 
    new Promise((resolve) => setTimeout(resolve, 5000))
  );
  
  const result = await selectLayoutWithFallback({
    slideTitle: 'Test',
    contentType: 'goals',
    slideContent: 'Goal 1, Goal 2, Goal 3'
  });
  
  // Should use rule-based fallback
  expect(result.layout).toBe('numbered');
  expect(result.itemStyle).toBe('numbered');
});
```

### Test with Content That Should Trigger Each Layout

Create test cases for each layout type:

```ts
const testCases = [
  { contentType: 'vision', expectedLayout: 'quote' },
  { contentType: 'goals', expectedLayout: 'numbered' },
  { contentType: 'features', expectedLayout: 'grid' },
  { contentType: 'kpis', expectedLayout: 'stat-blocks' },
  { contentType: 'swot', expectedLayout: 'quadrant' },
  { contentType: 'timeline', expectedLayout: 'timeline' }
];

testCases.forEach(({ contentType, expectedLayout }) => {
  test(`selects ${expectedLayout} for ${contentType}`, async () => {
    const result = await selectLayoutWithAI(
      'Test Title',
      contentType,
      'Sample content for ' + contentType
    );
    expect(result.layout).toBe(expectedLayout);
  });
});
```

---

## Common Issues & Solutions

### Issue: Mixed RTL/LTR Text Renders Incorrectly

**Symptom**: Arabic and English in the same text block appear garbled or in wrong order.

**Solution**: Separate Arabic and English text into different content blocks:

```tsx
// Bad: Mixed text in one block
<TextBlock content="المميزات Features" />

// Good: Separate blocks
<TextBlock content="المميزات" rtl={true} />
<TextBlock content="Features" rtl={false} />
```

### Issue: Cairo Font Not Rendering in PPTX Export

**Symptom**: Arabic text appears as boxes or wrong font in exported PowerPoint.

**Solution**: Enable `preserveVisualFidelity` in export config to convert text to base64 images:

```ts
const exportConfig: SlideExportConfig = {
  format: 'pptx',
  dimensions: { width: 10, height: 5.625 },
  font: 'Cairo',
  rtl: true,
  preserveVisualFidelity: true // Converts text to images
};
```

### Issue: AI Layout Selection Returns Invalid Layout Type

**Symptom**: AI suggests a layout type not in the registry (e.g., typo or hallucination).

**Solution**: Fallback logic should catch this; verify fallback is working:

```ts
const LayoutComponent = LAYOUT_REGISTRY[slide.type];
if (!LayoutComponent) {
  console.error(`Unknown layout type: ${slide.type}, falling back to 'list'`);
  return LAYOUT_REGISTRY['list'];
}
```

### Issue: Slide Height Appears Cramped

**Symptom**: Content doesn't use vertical space effectively; slides feel compressed.

**Solution**: Verify dimensions are set correctly (16:9 aspect ratio):

```ts
const dimensions = {
  width: 1920,  // pixels
  height: 1080, // pixels
  aspectRatio: '16:9'
};

// Verify aspect ratio
console.assert(dimensions.width / dimensions.height === 16 / 9);
```

### Issue: Solid Text Block Appears Despite Validation

**Symptom**: A slide contains a single uninterrupted block of text.

**Solution**: Add validation to `convertToSlides.ts` to enforce content block structure:

```ts
function validateContentBlocks(blocks: ContentBlock[]): boolean {
  // Ensure no single text block exceeds 500 characters
  const hasLongTextBlock = blocks.some(
    block => block.type === 'text' && block.content.length > 500
  );
  
  if (hasLongTextBlock) {
    console.error('Solid text block detected; split required');
    return false;
  }
  
  return true;
}
```

---

## Performance Optimization Tips

1. **Batch AI Layout Selection**: If generating multiple slides, consider batching layout selections in a single API call
2. **Cache Layout Decisions**: Cache layout decisions for similar content types to reduce API calls
3. **Async Processing**: Run layout selection in parallel with other slide generation tasks
4. **Pre-encode Images**: Pre-encode icons and badges as base64 for faster rendering and export

---

## Next Steps

1. **Review** this quickstart and familiarize yourself with the workflow
2. **Run** existing tests to verify setup: `npm test && npm run test:visual`
3. **Generate** a sample deck and manually verify all requirements
4. **Iterate** on layouts and styling based on user feedback

---

## Additional Resources

- **Spec**: `.specify/memory/specs/5-slide-gamma-presentation-audit/spec.md`
- **Plan**: `.specify/memory/specs/5-slide-gamma-presentation-audit/plan.md`
- **Research**: `.specify/memory/specs/5-slide-gamma-presentation-audit/research.md`
- **Data Model**: `.specify/memory/specs/5-slide-gamma-presentation-audit/data-model.md`
- **Contracts**: `.specify/memory/specs/5-slide-gamma-presentation-audit/contracts/`
- **Lucide Icons**: https://lucide.dev/icons/
- **PptxGenJS Docs**: https://gitbrent.github.io/PptxGenJS/
- **pdfmake-rtl Docs**: https://www.npmjs.com/package/@digicole/pdfmake-rtl
