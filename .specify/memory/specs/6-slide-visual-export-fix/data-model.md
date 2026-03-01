# Data Model: Slide Visual Export Fix

**Feature**: Slide Visual Export Fix  
**Branch**: `6-slide-visual-export-fix`  
**Date**: 2026-02-28

---

## Overview

This document defines the data entities and their relationships for AI-generated slide images, storage quota tracking, and visual export configurations.

---

## New Entities

### 1. GeneratedImage

Stores AI-generated images (DALL-E 3) as binary blobs in PostgreSQL with metadata for caching and quota enforcement.

**Table**: `generated_images`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique image identifier |
| `user_id` | integer | NOT NULL, FK → users.id | Owner of the image |
| `slide_deck_id` | integer | NULL, FK → slide_decks.id | Associated slide deck (null if orphaned) |
| `slide_id` | varchar(100) | NOT NULL | Frontend slide card ID (e.g., "slide-123") |
| `content_type` | varchar(50) | NOT NULL | MIME type (e.g., "image/png", "image/jpeg") |
| `prompt` | text | NOT NULL | DALL-E 3 prompt used to generate image |
| `content_hash` | varchar(64) | NOT NULL | SHA-256 hash of prompt for deduplication |
| `image_data` | bytea | NOT NULL | Binary image data (blob) |
| `file_size` | integer | NOT NULL | Size in bytes for quota tracking |
| `width` | integer | NOT NULL | Image width in pixels |
| `height` | integer | NOT NULL | Image height in pixels |
| `generation_status` | varchar(20) | NOT NULL, DEFAULT 'pending' | Status: pending, completed, failed |
| `error_message` | text | NULL | Error details if generation failed |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | Generation timestamp |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_generated_images_user_id` on `user_id` (for quota queries)
- `idx_generated_images_slide_id` on `slide_id` (for slide lookups)
- `idx_generated_images_content_hash` on `content_hash` (for deduplication)
- `idx_generated_images_slide_deck_id` on `slide_deck_id` (for cascade delete)

**Relationships**:
- `user_id` → `users.id` (many-to-one, cascade delete)
- `slide_deck_id` → `slide_decks.id` (many-to-one, cascade delete)

**Validation Rules**:
- `file_size` > 0 and < 10MB (single image limit)
- `content_type` IN ('image/png', 'image/jpeg', 'image/webp')
- `generation_status` IN ('pending', 'completed', 'failed')
- `content_hash` is SHA-256 hex string (64 chars)

**State Transitions**:
```
pending → completed (image generated successfully)
pending → failed (generation error after retries)
```

---

### 2. ImageStorageQuota (Extension of existing `users` table)

Tracks per-user image storage usage for quota enforcement.

**Table**: `users` (add new columns)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `image_storage_used_bytes` | bigint | NOT NULL, DEFAULT 0 | Current image storage usage in bytes |
| `image_storage_limit_bytes` | bigint | NOT NULL, DEFAULT 10737418240 | Storage limit in bytes (10GB default) |

**Validation Rules**:
- `image_storage_used_bytes` >= 0
- `image_storage_limit_bytes` > 0
- `image_storage_used_bytes` <= `image_storage_limit_bytes` (enforced before generation)

**Quota Calculation**:
```sql
SELECT SUM(file_size) FROM generated_images WHERE user_id = ?
```

---

### 3. SlideLayoutConfig (Frontend-only, no database table)

Configuration for AI-driven layout selection with image placement zones.

**TypeScript Interface**:

```typescript
interface SlideLayoutConfig {
  layoutType: 'two-column' | 'quadrant' | 'card-grid' | 'stat-blocks' | 'flow' | 'numbered';
  imagePlacements: ImagePlacement[];
  contentZones: ContentZone[];
}

interface ImagePlacement {
  position: 'background' | 'left-panel' | 'right-panel' | 'top-banner' | 'inline-between' | 'center-overlay';
  size: 'full' | 'half' | 'third' | 'quarter';
  zIndex: number; // 0 = background, 10 = inline, 20 = overlay
  imageId?: string; // Reference to GeneratedImage.id (when loaded)
  placeholder: PlaceholderConfig; // Gradient + icon config
}

interface ContentZone {
  type: 'header' | 'body' | 'stat' | 'card' | 'badge';
  position: { x: string; y: string }; // Tailwind classes (e.g., "left-0", "top-4")
  width: string; // Tailwind width (e.g., "w-1/2", "w-full")
}

interface PlaceholderConfig {
  gradientFrom: string; // Hex color (theme primary)
  gradientTo: string; // Hex color (darkened primary)
  iconName: string; // Lucide icon name
  iconSize: number; // Pixels (96 for large)
}
```

**Validation Rules**:
- `imagePlacements` length 0-3 (max 3 images per slide)
- `position` values must be valid enum
- `zIndex` must be 0, 10, or 20
- `gradientFrom` and `gradientTo` must be valid hex colors

---

### 4. ExportVisualData (Frontend-only, ephemeral)

Temporary data structure for html-to-image export pipeline.

**TypeScript Interface**:

```typescript
interface ExportVisualData {
  slideId: string;
  imageDataUrl: string; // Base64 data URL from html2canvas
  width: number; // 1920 pixels
  height: number; // 1080 pixels
  format: 'png' | 'jpeg';
  quality: number; // 0.95 for high quality
}

interface ExportManifest {
  slides: ExportVisualData[];
  metadata: {
    title: string;
    author: string;
    createdAt: Date;
    slideCount: number;
  };
  theme: {
    primaryColor: string;
    logo?: string;
    fontFamily: 'Cairo';
  };
}
```

**Validation Rules**:
- `imageDataUrl` must start with `data:image/`
- `width` = 1920, `height` = 1080 (16:9 standard)
- `quality` between 0.8 and 1.0

---

## Modified Entities

### 1. SlideCard (Frontend State - slideStore.ts)

Add image-related fields to existing `SlideCard` interface.

**Existing Interface** (from `client/src/stores/slideStore.ts`):

```typescript
interface SlideCard {
  id: string;
  type: 'cover' | 'kpis' | 'budget' | 'swot' | 'custom' | /* ... */;
  title: string;
  content: string | object; // Varies by type
  layout?: string;
  // ... existing fields ...
}
```

**New Fields**:

```typescript
interface SlideCard {
  // ... existing fields ...
  
  // New image fields
  images?: SlideImage[]; // AI-generated images for this slide
  layoutConfig?: SlideLayoutConfig; // AI-selected layout with image zones
  visualReady?: boolean; // True when all images loaded
}

interface SlideImage {
  id: string; // References GeneratedImage.id
  url: string; // Data URL or API endpoint (/api/images/:id)
  status: 'loading' | 'ready' | 'failed';
  placeholder: PlaceholderConfig;
  position: ImagePlacement['position'];
  size: ImagePlacement['size'];
}
```

**Validation Rules**:
- `images` length 0-3 (max 3 images per slide)
- `visualReady` = true only when all `images[].status === 'ready'`

---

### 2. PresentationTheme (Frontend State - slideStore.ts)

Already exists; no changes needed. Uses existing `primaryColor`, `logo`, `globalBackgroundColor`.

---

## Entity Relationships

```
users (1) ──< (many) generated_images
users (1) ──< (many) slide_decks
slide_decks (1) ──< (many) generated_images

Frontend:
SlideCard (1) ──< (many) SlideImage
SlideImage (1) ──> (1) GeneratedImage [via id reference]
```

---

## Database Migrations

### Migration 1: Create `generated_images` table

```sql
CREATE TABLE generated_images (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slide_deck_id INTEGER REFERENCES slide_decks(id) ON DELETE CASCADE,
  slide_id VARCHAR(100) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  content_hash VARCHAR(64) NOT NULL,
  image_data BYTEA NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  generation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX idx_generated_images_slide_id ON generated_images(slide_id);
CREATE INDEX idx_generated_images_content_hash ON generated_images(content_hash);
CREATE INDEX idx_generated_images_slide_deck_id ON generated_images(slide_deck_id);
```

### Migration 2: Add image storage quota to `users` table

```sql
ALTER TABLE users
ADD COLUMN image_storage_used_bytes BIGINT NOT NULL DEFAULT 0,
ADD COLUMN image_storage_limit_bytes BIGINT NOT NULL DEFAULT 10737418240; -- 10GB in bytes

-- Backfill existing users with default quota
UPDATE users SET image_storage_limit_bytes = 10737418240 WHERE image_storage_limit_bytes IS NULL;
```

---

## Data Flow

### Image Generation Flow

1. **Trigger**: User generates slide deck → `convertToSlides()` creates `SlideCard[]`
2. **AI Layout Selection**: `aiLayoutSelector.selectLayout()` returns `SlideLayoutConfig` with `imagePlacements`
3. **Image Request**: For each `imagePlacement`, create `GeneratedImage` record with `status='pending'`
4. **Background Generation**: 
   - Frontend shows gradient+icon placeholder
   - Backend calls DALL-E 3 via OpenRouter
   - Store blob in `image_data`, update `status='completed'`
5. **Lazy Load**: Frontend polls `/api/images/:id/status`, fetches image when ready
6. **Cache**: Subsequent renders fetch from database (no regeneration)

### Export Flow

1. **Trigger**: User clicks "تصدير PDF" or "تصدير PowerPoint"
2. **Render**: For each `SlideCard`, render in hidden DOM with fixed 1920×1080 dimensions
3. **Capture**: Call `html2canvas(element, { scale: 2 })` → canvas
4. **Convert**: `canvas.toDataURL('image/png', 0.95)` → base64 data URL
5. **Embed**: 
   - **PDF**: `jsPDF.addImage(dataUrl, 'PNG', 0, 0, 297, 167)` (A4 landscape)
   - **PPTX**: `pptx.addSlide().addImage({ data: dataUrl, x: 0, y: 0, w: '100%', h: '100%' })`
6. **Download**: Save file via `file-saver`

### Quota Enforcement Flow

1. **Check Before Generation**: Query `SUM(file_size) FROM generated_images WHERE user_id = ?`
2. **Compare**: `current_usage + estimated_new_size <= image_storage_limit_bytes`
3. **Reject if Exceeded**: Return error "Storage quota exceeded (10GB limit)"
4. **Update After Generation**: Increment `users.image_storage_used_bytes` by `file_size`
5. **Display on Usage Page**: Show `image_storage_used_bytes / image_storage_limit_bytes` as progress bar

---

## Performance Considerations

### Image Storage

- **Blob Size**: DALL-E 3 1024×1024 PNG ≈ 1-2MB per image
- **Typical Deck**: 10 slides × 2 images = 20MB per deck
- **10GB Quota**: ~500 decks with images per user
- **Query Performance**: Indexed on `user_id` and `slide_id` for fast lookups

### Caching Strategy

- **Deduplication**: Check `content_hash` before generating (same prompt → reuse image)
- **Database Cache**: Store blobs in PostgreSQL (no external CDN needed for 10GB scale)
- **Frontend Cache**: Store image URLs in `slideStore` during session (no re-fetch)

### Export Performance

- **Parallel Conversion**: Convert 10 slides in parallel → ~5-8s total (500ms-800ms per slide)
- **Memory Usage**: html2canvas creates temporary canvases (~10MB per slide × 10 = 100MB peak)
- **Optimization**: If >20 slides, convert in batches of 10 to avoid memory pressure

---

## Schema Updates Summary

1. **New Table**: `generated_images` (12 columns, 4 indexes)
2. **Modified Table**: `users` (add 2 columns: `image_storage_used_bytes`, `image_storage_limit_bytes`)
3. **Frontend State**: Extend `SlideCard` interface with `images`, `layoutConfig`, `visualReady`
4. **No Changes**: `slide_decks`, `ideas`, `permissions` tables remain unchanged

---

## Drizzle ORM Schema Additions

```typescript
// drizzle/schema.ts

import { pgTable, serial, integer, varchar, text, bytea, bigint, timestamp } from "drizzle-orm/pg-core";

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

// Add to existing users table
// (in users definition, add these fields):
// imageStorageUsedBytes: bigint("image_storage_used_bytes").notNull().default(0),
// imageStorageLimitBytes: bigint("image_storage_limit_bytes").notNull().default(10737418240),
```

---

## Data Integrity Rules

1. **Cascade Delete**: When `slide_decks` deleted → delete all associated `generated_images`
2. **Quota Sync**: After image generation or deletion, recalculate `users.image_storage_used_bytes`
3. **Orphan Cleanup**: Periodically delete `generated_images` where `slide_deck_id IS NULL` and `created_at < NOW() - INTERVAL '7 days'`
4. **Deduplication**: Before generating, check if `content_hash` exists → reuse existing image
5. **Status Consistency**: If `generation_status = 'failed'`, `error_message` must not be NULL

---

## Frontend State Management (slideStore.ts)

### New State Fields

```typescript
interface SlideStoreState {
  // ... existing fields ...
  
  // New image state
  imageGenerationQueue: string[]; // Slide IDs awaiting image generation
  imageLoadingStatus: Record<string, 'loading' | 'ready' | 'failed'>; // Per-slide image status
  imageStorageUsage: { used: number; limit: number }; // Bytes
}

interface SlideStoreActions {
  // ... existing actions ...
  
  // New image actions
  requestImageGeneration: (slideId: string, prompt: string) => Promise<void>;
  updateImageStatus: (slideId: string, status: 'loading' | 'ready' | 'failed') => void;
  loadImageFromCache: (slideId: string) => Promise<string | null>;
  refreshStorageQuota: () => Promise<void>;
}
```

---

## API Consumption Tracking

### New Usage Metrics

Add to existing API consumption tracking (displayed on Usage Quota page):

| Metric | Unit | Calculation |
|--------|------|-------------|
| **Image Generation Requests** | Count | Number of DALL-E 3 API calls |
| **Image Storage Used** | GB | `image_storage_used_bytes / 1073741824` |
| **Image Storage Limit** | GB | `image_storage_limit_bytes / 1073741824` |
| **Image Generation Cost** | USD | `image_count × $0.04` (DALL-E 3 standard) |

**Display Format**:
```
Image Storage: 2.3 GB / 10 GB [███████░░░] 23%
Images Generated: 45 images ($1.80)
```

---

## Summary

- **1 new table**: `generated_images` (blob storage, quota tracking)
- **2 new columns**: `users.image_storage_used_bytes`, `users.image_storage_limit_bytes`
- **3 new frontend interfaces**: `SlideLayoutConfig`, `ImagePlacement`, `ExportVisualData`
- **Quota enforcement**: 10GB per user, tracked in real-time
- **Deduplication**: SHA-256 content hash prevents duplicate generation
- **Cascade delete**: Images deleted when slide deck deleted
- **Performance**: Indexed for fast quota queries and slide lookups
