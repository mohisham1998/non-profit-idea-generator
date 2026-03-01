# Quickstart: Slide Visual Export Fix

**Feature**: Slide Visual Export Fix  
**Branch**: `6-slide-visual-export-fix`  
**Date**: 2026-02-28

---

## Overview

This guide provides a step-by-step walkthrough for implementing AI-generated images, Gamma-style layouts, and pixel-perfect exports for the slide builder.

---

## Prerequisites

Before starting implementation:

1. **Environment Setup**:
   - Node.js 18+ installed
   - PostgreSQL database running (Supabase or local)
   - OpenRouter API key configured in `.env`

2. **Dependencies**:
   ```bash
   cd client
   npm install html2canvas@1.4.1
   
   cd ../server
   npm install openai@4.28.0 crypto
   ```

3. **Database Migration**:
   ```bash
   # Run migrations for new tables
   npm run db:migrate
   ```

4. **Verify Existing Features**:
   - Slide builder renders slides correctly
   - Theme primary color loads from user branding
   - Basic PDF/PPTX export works (text-only)

---

## Implementation Phases

### Phase 1: Database Schema (1-2 hours)

#### Step 1.1: Create `generated_images` Table

**File**: `drizzle/schema.ts`

Add new table definition:

```typescript
export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  slideDeckId: integer("slide_deck_id").references(() => slideDecks.id, { onDelete: 'cascade' }),
  slideId: varchar("slide_id", { length: 100 }).notNull(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  prompt: text("prompt").notNull(),
  contentHash: varchar("content_hash", { length: 64 }).notNull(),
  imageData: bytea("image_data").notNull(),
  fileSize: integer("file_size").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  generationStatus: varchar("generation_status", { length: 20 }).notNull().default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertGeneratedImage = typeof generatedImages.$inferInsert;
```

#### Step 1.2: Add Image Storage Quota to `users` Table

In existing `users` table definition, add:

```typescript
imageStorageUsedBytes: bigint("image_storage_used_bytes").notNull().default(0),
imageStorageLimitBytes: bigint("image_storage_limit_bytes").notNull().default(10737418240), // 10GB
```

#### Step 1.3: Run Migration

```bash
npm run db:generate  # Generate migration SQL
npm run db:migrate   # Apply migration
```

**Verify**: Check PostgreSQL that `generated_images` table exists with correct columns.

---

### Phase 2: Image Generation Service (2-3 hours)

#### Step 2.1: Create Image Generator

**File**: `server/services/imageGeneration.ts` (new file)

```typescript
import OpenAI from 'openai';
import crypto from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export async function generateImage(prompt: string): Promise<{ url: string; width: number; height: number }> {
  const response = await openai.images.generate({
    model: 'openai/dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });
  
  return {
    url: response.data[0].url,
    width: 1024,
    height: 1024,
  };
}

export function constructPrompt(contentType: string, keywords: string[]): string {
  const styleMap: Record<string, string> = {
    kpis: 'analytics dashboard, data visualization, office environment',
    budget: 'financial planning, budget documents, calculator, coins',
    swot: 'strategic planning, business meeting, whiteboard',
    vision: 'inspiring landscape, future vision, bright horizon',
    // ... add more mappings
  };
  
  const style = styleMap[contentType] || 'professional workspace';
  const keywordsStr = keywords.join(', ');
  
  return `Professional realistic photograph for nonprofit presentation in Saudi Arabia: ${keywordsStr}. Style: ${style}. High quality, culturally appropriate, no text overlay, no people's faces, suitable for charity/nonprofit context.`;
}

export function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}
```

#### Step 2.2: Create Image Storage Service

**File**: `server/services/imageStorage.ts` (new file)

```typescript
import { db } from '../db';
import { generatedImages, users } from '../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export async function storeImage(data: {
  userId: number;
  slideId: string;
  prompt: string;
  imageUrl: string;
  width: number;
  height: number;
}): Promise<string> {
  // Fetch image blob from URL
  const response = await fetch(data.imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const imageData = Buffer.from(arrayBuffer);
  
  // Insert into database
  const [image] = await db.insert(generatedImages).values({
    userId: data.userId,
    slideId: data.slideId,
    contentType: 'image/png',
    prompt: data.prompt,
    contentHash: hashPrompt(data.prompt),
    imageData: imageData,
    fileSize: imageData.length,
    width: data.width,
    height: data.height,
    generationStatus: 'completed',
  }).returning();
  
  // Update user quota
  await db.update(users)
    .set({ imageStorageUsedBytes: sql`${users.imageStorageUsedBytes} + ${imageData.length}` })
    .where(eq(users.id, data.userId));
  
  return image.id.toString();
}

export async function getImageById(imageId: string, userId: number): Promise<Buffer | null> {
  const [image] = await db.select()
    .from(generatedImages)
    .where(eq(generatedImages.id, parseInt(imageId)))
    .limit(1);
  
  if (!image || image.userId !== userId) return null;
  return image.imageData;
}

export async function getUserQuota(userId: number): Promise<{ used: number; limit: number }> {
  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return {
    used: Number(user.imageStorageUsedBytes),
    limit: Number(user.imageStorageLimitBytes),
  };
}
```

#### Step 2.3: Create tRPC Image Router

**File**: `server/routers/images.ts` (new file)

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { generateImage, constructPrompt } from '../services/imageGeneration';
import { storeImage, getImageById, getUserQuota } from '../services/imageStorage';

export const imagesRouter = router({
  generate: protectedProcedure
    .input(z.object({
      slideId: z.string(),
      contentType: z.string(),
      keywords: z.array(z.string()).min(1).max(10),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check quota
      const quota = await getUserQuota(ctx.user.id);
      if (quota.used >= quota.limit) {
        throw new Error('Storage quota exceeded');
      }
      
      // Generate image
      const prompt = constructPrompt(input.contentType, input.keywords);
      const { url, width, height } = await generateImage(prompt);
      
      // Store in database
      const imageId = await storeImage({
        userId: ctx.user.id,
        slideId: input.slideId,
        prompt,
        imageUrl: url,
        width,
        height,
      });
      
      return { imageId, status: 'completed' };
    }),
  
  getById: protectedProcedure
    .input(z.object({ imageId: z.string() }))
    .query(async ({ ctx, input }) => {
      const imageData = await getImageById(input.imageId, ctx.user.id);
      if (!imageData) throw new Error('Image not found');
      
      // Return as base64 data URL
      return `data:image/png;base64,${imageData.toString('base64')}`;
    }),
  
  getQuota: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserQuota(ctx.user.id);
    }),
});
```

**Wire into main router** (`server/routers/index.ts`):

```typescript
import { imagesRouter } from './images';

export const appRouter = router({
  // ... existing routers
  images: imagesRouter,
});
```

**Test**: Call `trpc.images.generate.mutate()` from frontend, verify image stored in database.

---

### Phase 3: Frontend Image Integration (3-4 hours)

#### Step 3.1: Update SlideCard Interface

**File**: `client/src/stores/slideStore.ts`

Add to `SlideCard` interface:

```typescript
interface SlideCard {
  // ... existing fields
  
  images?: SlideImage[];
  visualReady?: boolean;
}

interface SlideImage {
  id: string;
  url: string;
  status: 'loading' | 'ready' | 'failed';
  position: 'background' | 'left-panel' | 'right-panel' | 'top-banner';
  size: 'full' | 'half' | 'third';
}
```

#### Step 3.2: Create Image Placeholder Component

**File**: `client/src/components/SlideBuilder/ImagePlaceholder.tsx` (new file)

```typescript
import React from 'react';
import * as LucideIcons from 'lucide-react';

interface ImagePlaceholderProps {
  gradientFrom: string;
  gradientTo: string;
  iconName: string;
  size?: 'small' | 'medium' | 'large';
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  gradientFrom,
  gradientTo,
  iconName,
  size = 'large',
}) => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Image;
  const iconSize = size === 'large' ? 96 : size === 'medium' ? 64 : 48;
  
  return (
    <div
      className="flex items-center justify-center animate-pulse"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        width: '100%',
        height: '100%',
      }}
    >
      <Icon size={iconSize} className="text-white opacity-60" />
    </div>
  );
};
```

#### Step 3.3: Create Image Generation Hook

**File**: `client/src/hooks/useImageGeneration.ts` (new file)

```typescript
import { useState, useCallback } from 'react';
import { trpc } from '../lib/trpc';

export function useImageGeneration() {
  const [loading, setLoading] = useState(false);
  const generateMutation = trpc.images.generate.useMutation();
  const getImageQuery = trpc.images.getById.useQuery;
  
  const generateImage = useCallback(async (
    slideId: string,
    contentType: string,
    keywords: string[]
  ) => {
    setLoading(true);
    try {
      const { imageId } = await generateMutation.mutateAsync({
        slideId,
        contentType,
        keywords,
      });
      
      // Fetch image data
      const imageUrl = await getImageQuery({ imageId });
      
      return { imageId, imageUrl };
    } finally {
      setLoading(false);
    }
  }, [generateMutation, getImageQuery]);
  
  return { generateImage, loading };
}
```

#### Step 3.4: Update SlideCard to Show Images

**File**: `client/src/components/SlideBuilder/SlideCard.tsx`

Add image rendering logic:

```typescript
// Inside SlideCard component
const renderImage = (image: SlideImage) => {
  if (image.status === 'loading') {
    return (
      <ImagePlaceholder
        gradientFrom={themePrimaryColor}
        gradientTo={darkenColor(themePrimaryColor, 20)}
        iconName="Image"
        size="large"
      />
    );
  }
  
  if (image.status === 'ready') {
    return <img src={image.url} alt="" className="w-full h-full object-cover" />;
  }
  
  return null; // Failed state - keep placeholder
};

// In JSX, add image zones based on position
{card.images?.map((image, idx) => (
  <div
    key={idx}
    className={cn(
      'absolute',
      image.position === 'background' && 'inset-0 z-0',
      image.position === 'left-panel' && 'left-0 top-0 bottom-0 w-1/2 z-10',
      image.position === 'right-panel' && 'right-0 top-0 bottom-0 w-1/2 z-10',
      image.position === 'top-banner' && 'top-0 left-0 right-0 h-32 z-10'
    )}
  >
    {renderImage(image)}
  </div>
))}
```

**Test**: Manually add a `SlideImage` to a card in slideStore, verify placeholder shows, then update status to 'ready' with data URL, verify image displays.

---

### Phase 4: AI Layout Selection (2-3 hours)

#### Step 4.1: Update AI Layout Selector

**File**: `client/src/lib/aiLayoutSelector.ts`

Extend `selectLayout()` to return image placements:

```typescript
interface LayoutDecision {
  layoutType: string;
  imagePlacements: ImagePlacement[];
}

interface ImagePlacement {
  position: 'background' | 'left-panel' | 'right-panel' | 'top-banner';
  size: 'full' | 'half' | 'third';
  contentPrompt: string;
}

export async function selectLayoutWithImages(
  slideType: string,
  content: string,
  keywords: string[]
): Promise<LayoutDecision> {
  // Call OpenRouter with structured output
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a presentation design AI. Select layout and image placements for slides.',
        },
        {
          role: 'user',
          content: `Slide type: ${slideType}\nContent: ${content.slice(0, 500)}\nKeywords: ${keywords.join(', ')}\n\nSelect layout and 0-3 image placements.`,
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  
  const data = await response.json();
  const decision = JSON.parse(data.choices[0].message.content);
  
  // Fallback if AI fails
  if (!decision.layoutType) {
    return fallbackLayout(slideType);
  }
  
  return decision;
}

function fallbackLayout(slideType: string): LayoutDecision {
  const fallbacks: Record<string, LayoutDecision> = {
    swot: {
      layoutType: 'quadrant',
      imagePlacements: [{ position: 'background', size: 'full', contentPrompt: 'Strategic planning in Saudi Arabia' }],
    },
    kpis: {
      layoutType: 'stat-blocks',
      imagePlacements: [{ position: 'right-panel', size: 'third', contentPrompt: 'Analytics dashboard in Saudi Arabia' }],
    },
    // ... more fallbacks
  };
  
  return fallbacks[slideType] || { layoutType: 'two-column', imagePlacements: [] };
}
```

**Test**: Call `selectLayoutWithImages()` with sample slide data, verify it returns layout + image placements.

---

### Phase 5: Export with html-to-image (3-4 hours)

#### Step 5.1: Update Export Hook

**File**: `client/src/hooks/useSlideExport.ts`

Replace text-only export with html-to-image:

```typescript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';

export function useSlideExport() {
  const { cards, theme, presentationName } = useSlideStore();
  
  const exportToPDF = useCallback(async () => {
    // 1. Capture all slides as images
    const slideImages = await Promise.all(
      cards.map(async (card) => {
        const element = document.getElementById(`slide-${card.id}`);
        if (!element) return null;
        
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 1920,
          height: 1080,
        });
        
        return canvas.toDataURL('image/png', 0.95);
      })
    );
    
    // 2. Create PDF
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    pdf.setR2L(true);
    
    slideImages.forEach((dataUrl, index) => {
      if (index > 0) pdf.addPage();
      if (dataUrl) pdf.addImage(dataUrl, 'PNG', 0, 0, 297, 167);
    });
    
    // 3. Save
    pdf.save(`${presentationName}.pdf`);
  }, [cards, presentationName]);
  
  const exportToPPTX = useCallback(async () => {
    // Similar to PDF but using pptxgenjs
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    
    const slideImages = await Promise.all(/* same as PDF */);
    
    slideImages.forEach((dataUrl) => {
      const slide = pptx.addSlide();
      if (dataUrl) slide.addImage({ data: dataUrl, x: 0, y: 0, w: '100%', h: '100%' });
    });
    
    const blob = await pptx.write({ outputType: 'blob' });
    saveAs(blob, `${presentationName}.pptx`);
  }, [cards, presentationName]);
  
  return { exportToPDF, exportToPPTX };
}
```

**Test**: Export a deck with images, open PDF/PPTX, verify images are embedded and layout matches on-screen rendering.

---

### Phase 6: Integration & Polish (2-3 hours)

#### Step 6.1: Wire Image Generation into Slide Creation

**File**: `client/src/lib/convertToSlides.ts`

When creating slides, trigger image generation:

```typescript
export async function convertToSlidesWithImages(data: any): Promise<SlideCard[]> {
  const slides = convertToSlides(data); // Existing function
  
  // For each slide, select layout and request images
  const slidesWithImages = await Promise.all(
    slides.map(async (slide) => {
      const keywords = extractKeywords(slide.content);
      const layoutDecision = await selectLayoutWithImages(slide.type, slide.content, keywords);
      
      // Request image generation (async, non-blocking)
      const images = layoutDecision.imagePlacements.map((placement) => ({
        id: '', // Will be set when generation completes
        url: '',
        status: 'loading' as const,
        position: placement.position,
        size: placement.size,
      }));
      
      // Trigger generation in background
      layoutDecision.imagePlacements.forEach(async (placement, idx) => {
        const { imageId, imageUrl } = await generateImage(
          slide.id,
          slide.type,
          keywords
        );
        
        // Update slide with completed image
        updateSlideImage(slide.id, idx, { id: imageId, url: imageUrl, status: 'ready' });
      });
      
      return { ...slide, images, visualReady: false };
    })
  );
  
  return slidesWithImages;
}
```

#### Step 6.2: Add Storage Quota Display

**File**: `client/src/pages/UsageQuota.tsx`

Add image storage section:

```typescript
const { data: imageQuota } = trpc.images.getQuota.useQuery();

return (
  <div>
    {/* Existing quota displays */}
    
    <div className="mt-6">
      <h3 className="text-lg font-semibold">تخزين الصور</h3>
      <div className="mt-2">
        <div className="flex justify-between text-sm">
          <span>{formatBytes(imageQuota?.used || 0)} / {formatBytes(imageQuota?.limit || 0)}</span>
          <span>{((imageQuota?.used || 0) / (imageQuota?.limit || 1) * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${((imageQuota?.used || 0) / (imageQuota?.limit || 1) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  </div>
);
```

---

## Testing Checklist

### Unit Tests

- [ ] `imageGeneration.constructPrompt()` returns valid prompts
- [ ] `imageStorage.storeImage()` saves blob to database
- [ ] `imageStorage.getUserQuota()` calculates usage correctly
- [ ] `aiLayoutSelector.selectLayoutWithImages()` returns valid schema

### Integration Tests

- [ ] Generate image via tRPC → stored in database
- [ ] Fetch image by ID → returns correct blob
- [ ] Quota enforcement → rejects when limit exceeded
- [ ] Export PDF → includes all images
- [ ] Export PPTX → includes all images

### Manual Testing

1. **Image Generation**:
   - Create new slide deck
   - Verify placeholders appear immediately
   - Wait 5-10s, verify images reveal
   - Check database: images stored as blobs

2. **Layout Variety**:
   - Generate deck with SWOT, KPIs, budget, vision slides
   - Verify different layouts used (quadrant, stat-blocks, two-column)
   - Verify images positioned correctly per layout

3. **Export Fidelity**:
   - Export deck to PDF
   - Open in Adobe Reader
   - Verify: layout matches, images present, colors correct, RTL text aligned
   - Repeat for PPTX in Microsoft PowerPoint

4. **Quota Tracking**:
   - Check Usage Quota page
   - Verify image storage shows correct usage
   - Generate images until quota reached
   - Verify error message shown

---

## Troubleshooting

### Images Not Generating

**Symptom**: Placeholders never change to actual images

**Fixes**:
- Check OpenRouter API key in `.env`
- Verify `OPENROUTER_API_KEY` has DALL-E 3 access
- Check browser console for tRPC errors
- Check server logs for OpenAI API errors

### Export Missing Images

**Symptom**: PDF/PPTX exports with blank spaces instead of images

**Fixes**:
- Ensure all images have `status='ready'` before exporting
- Add `await new Promise(resolve => setTimeout(resolve, 1000))` before html2canvas
- Check CORS: DALL-E 3 URLs must allow cross-origin access
- Use `useCORS: true` in html2canvas config

### Quota Not Updating

**Symptom**: Image storage usage doesn't increase after generation

**Fixes**:
- Check `storeImage()` updates `users.imageStorageUsedBytes`
- Verify SQL query uses `sql` template literal for increment
- Check database: `image_storage_used_bytes` column exists

### Layout Not Changing

**Symptom**: All slides use same layout

**Fixes**:
- Verify `aiLayoutSelector.selectLayoutWithImages()` called per slide
- Check OpenRouter response: should return different layouts for different content
- Check fallback logic: ensure rule-based fallback works
- Verify `layoutType` applied to `SlideCard` component

---

## Performance Optimization

### Image Generation

- **Parallel Generation**: Generate up to 3 images concurrently
- **Deduplication**: Check `content_hash` before generating (reuse existing)
- **Caching**: Store generated images in database (no regeneration on refresh)

### Export Speed

- **Parallel Conversion**: Convert all slides simultaneously with `Promise.all()`
- **High-DPI**: Use `scale: 2` for quality, but consider `scale: 1.5` if too slow
- **Batch Processing**: For >20 slides, convert in batches of 10

### Memory Management

- **Cleanup**: Remove hidden DOM elements after html2canvas capture
- **Blob Release**: Call `URL.revokeObjectURL()` after using blob URLs
- **Lazy Loading**: Only load images when slide is visible (IntersectionObserver)

---

## Next Steps

After completing quickstart:

1. **Run `/speckit.tasks`** to break down implementation into granular tasks
2. **Create feature branch**: `git checkout -b 6-slide-visual-export-fix`
3. **Implement in order**: Database → Backend → Frontend → Export → Polish
4. **Test thoroughly**: Unit tests, integration tests, manual testing
5. **Create PR**: Include screenshots of before/after exports

---

## Troubleshooting

### Image generation fails

- **OPENROUTER_API_KEY missing**: Ensure `.env` has `OPENROUTER_API_KEY` for DALL-E 3
- **Quota exceeded**: Check Usage & Quota page; 10GB image storage limit per user
- **CORS errors**: Ensure `useCORS: true` in html2canvas; images must support CORS

### Export fails or produces blank slides

- **Element not found**: Ensure each slide has `id="slide-{card.id}"` on the export target
- **IMAGE_LOAD_TIMEOUT**: Increase `imageTimeout` in html2canvas or `CAPTURE_TIMEOUT_MS` in useSlideExport
- **Memory issues**: For decks >20 slides, batched export runs automatically

### Layout or image placement wrong

- **Fallback layouts**: `selectLayoutWithImages()` uses rule-based fallback when AI unavailable
- **Validation**: `validateLayoutDecision()` enforces valid layoutType and imagePlacements

### Database schema out of sync

- **Run `pnpm db:push`** (project uses db:push, not migrations)
- If prompted about unique constraint, choose "No, add the constraint without truncating"

---

## Support

- **Specification**: `.specify/memory/specs/6-slide-visual-export-fix/spec.md`
- **Research**: `.specify/memory/specs/6-slide-visual-export-fix/research.md`
- **Data Model**: `.specify/memory/specs/6-slide-visual-export-fix/data-model.md`
- **Contracts**: `.specify/memory/specs/6-slide-visual-export-fix/contracts/`
- **Plan**: `.specify/memory/specs/6-slide-visual-export-fix/plan.md`
