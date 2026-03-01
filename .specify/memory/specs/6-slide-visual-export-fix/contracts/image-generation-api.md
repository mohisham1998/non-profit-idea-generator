# Contract: Image Generation API

**Feature**: Slide Visual Export Fix  
**Contract Type**: Backend API Endpoint (tRPC)  
**Date**: 2026-02-28

---

## Overview

This contract defines the tRPC API for generating AI images via DALL-E 3 (OpenRouter), storing them in PostgreSQL, and retrieving them for slide rendering and export.

---

## Endpoint 1: Generate Image

**Purpose**: Request AI image generation for a slide with background processing.

### Request

**Procedure**: `images.generate` (tRPC mutation)

```typescript
interface GenerateImageRequest {
  slideId: string;           // Frontend slide card ID
  slideDeckId?: number;      // Optional: associate with saved deck
  contentType: string;       // Slide content type (e.g., "kpis", "budget", "swot")
  keywords: string[];        // Content keywords for prompt (e.g., ["education", "community", "Saudi Arabia"])
  layoutType: string;        // Layout type for context (e.g., "two-column", "stat-blocks")
  imagePosition: 'background' | 'left-panel' | 'right-panel' | 'top-banner' | 'inline-between' | 'center-overlay';
  preferredSize?: { width: number; height: number }; // Optional: default 1024×1024
}
```

**Validation**:
- `slideId` must be non-empty string
- `contentType` must be valid slide type
- `keywords` must have 1-10 items
- `layoutType` must be valid layout type
- `imagePosition` must be valid enum value
- `preferredSize.width` and `height` must be 256, 512, 1024, or 1792 (DALL-E 3 supported sizes)

### Response

```typescript
interface GenerateImageResponse {
  imageId: string;           // Database ID for generated_images record
  status: 'pending' | 'completed' | 'failed';
  estimatedTimeSeconds: number; // Estimated generation time (5-10s)
  placeholderConfig: {
    gradientFrom: string;    // Hex color for gradient start
    gradientTo: string;      // Hex color for gradient end
    iconName: string;        // Lucide icon name
  };
}
```

**Success**: HTTP 200, returns `imageId` and `status='pending'`  
**Error Cases**:
- `QUOTA_EXCEEDED`: User reached 10GB storage limit (HTTP 403)
- `INVALID_KEYWORDS`: Keywords contain inappropriate content (HTTP 400)
- `API_ERROR`: OpenRouter API failure (HTTP 503)

---

## Endpoint 2: Get Image Status

**Purpose**: Poll image generation status for lazy loading.

### Request

**Procedure**: `images.getStatus` (tRPC query)

```typescript
interface GetImageStatusRequest {
  imageId: string; // Database ID from generate response
}
```

### Response

```typescript
interface GetImageStatusResponse {
  imageId: string;
  status: 'pending' | 'completed' | 'failed';
  progress?: number; // 0-100 (if available from OpenRouter)
  errorMessage?: string; // If status='failed'
  imageUrl?: string; // If status='completed': /api/images/:id
}
```

**Success**: HTTP 200  
**Error Cases**:
- `NOT_FOUND`: Image ID doesn't exist (HTTP 404)
- `ACCESS_DENIED`: Image belongs to different user (HTTP 403)

---

## Endpoint 3: Get Image Data

**Purpose**: Retrieve binary image data for rendering or export.

### Request

**Procedure**: `images.getById` (tRPC query)

```typescript
interface GetImageRequest {
  imageId: string; // Database ID
}
```

### Response

**Content-Type**: `image/png` or `image/jpeg` (from `content_type` field)  
**Body**: Binary image data (blob)

**Success**: HTTP 200, returns image blob  
**Error Cases**:
- `NOT_FOUND`: Image ID doesn't exist (HTTP 404)
- `ACCESS_DENIED`: Image belongs to different user (HTTP 403)
- `NOT_READY`: Image status is 'pending' (HTTP 202, retry later)

---

## Endpoint 4: Get Storage Quota

**Purpose**: Retrieve user's current image storage usage and limit.

### Request

**Procedure**: `images.getQuota` (tRPC query)

```typescript
interface GetQuotaRequest {
  // No parameters (uses authenticated user ID)
}
```

### Response

```typescript
interface GetQuotaResponse {
  usedBytes: number;         // Current storage usage
  limitBytes: number;        // Storage limit (default 10GB)
  usedPercentage: number;    // usedBytes / limitBytes × 100
  remainingBytes: number;    // limitBytes - usedBytes
  imageCount: number;        // Total images stored
  estimatedImagesRemaining: number; // remainingBytes / avgImageSize
}
```

**Success**: HTTP 200  
**Error Cases**: None (always returns data for authenticated user)

---

## Endpoint 5: Delete Image

**Purpose**: Manually delete an image to free quota (optional feature).

### Request

**Procedure**: `images.delete` (tRPC mutation)

```typescript
interface DeleteImageRequest {
  imageId: string; // Database ID
}
```

### Response

```typescript
interface DeleteImageResponse {
  success: boolean;
  freedBytes: number; // File size of deleted image
  newUsedBytes: number; // Updated quota usage
}
```

**Success**: HTTP 200  
**Error Cases**:
- `NOT_FOUND`: Image ID doesn't exist (HTTP 404)
- `ACCESS_DENIED`: Image belongs to different user (HTTP 403)

---

## Background Processing

### Image Generation Queue

**Flow**:
1. `images.generate` creates `generated_images` record with `status='pending'`
2. Returns immediately to frontend (non-blocking)
3. Backend worker (or async handler) picks up pending records
4. Calls DALL-E 3 via OpenRouter with constructed prompt
5. Stores blob in `image_data`, updates `status='completed'` or `'failed'`
6. Frontend polls `images.getStatus` every 2s until `status != 'pending'`

**Concurrency**: Max 3 simultaneous DALL-E 3 calls per user (rate limit protection)

---

## Prompt Construction

### Template

```
Professional realistic photograph for nonprofit presentation in Saudi Arabia: {keywords_joined}.
Style: {style_based_on_content_type}.
High quality, culturally appropriate, no text overlay, no people's faces, suitable for charity/nonprofit context.
```

### Content Type → Style Mapping

| Content Type | Style Keywords |
|--------------|----------------|
| `kpis` | "analytics dashboard, data visualization, office environment" |
| `budget` | "financial planning, budget documents, calculator, coins" |
| `swot` | "strategic planning, business meeting, whiteboard" |
| `vision` | "inspiring landscape, future vision, bright horizon" |
| `features` | "innovation, technology, modern workspace" |
| `timeline` | "calendar, roadmap, project timeline" |
| `team` | "collaborative workspace, teamwork, meeting room" |
| `impact` | "community impact, helping hands, social change" |

### Keyword Processing

1. Extract from slide content (title + body text)
2. Add "Saudi Arabia", "professional", "realistic", "nonprofit"
3. Remove inappropriate words (alcohol, gambling, etc.)
4. Limit to 50 tokens (DALL-E 3 prompt limit)

---

## Error Handling

### Retry Strategy

- **Transient Errors** (503, 429): Retry 3 times with exponential backoff (2s, 4s, 8s)
- **Permanent Errors** (400, 403): Mark as `failed` immediately, store error message
- **Timeout**: If generation takes >30s, mark as `failed` with "Generation timeout"

### Fallback

When `status='failed'`:
- Frontend displays gradient placeholder (theme colors) + large icon
- No retry from frontend (user can manually regenerate if needed)
- Error logged for admin review

---

## Security & Privacy

- **Authentication**: All endpoints require authenticated user (tRPC context)
- **Authorization**: Users can only access their own images (check `user_id`)
- **Content Filtering**: Validate keywords against inappropriate content list
- **Rate Limiting**: Max 10 image generation requests per minute per user
- **Quota Enforcement**: Check storage limit before accepting generation request

---

## Performance SLAs

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Generate request | <200ms | Time to return `imageId` |
| Image generation | 5-10s | DALL-E 3 API call time |
| Status poll | <100ms | Database query time |
| Image retrieval | <500ms | Blob fetch + transfer time |
| Quota check | <50ms | Aggregate query time |

---

## Example Usage

### Frontend: Request Image Generation

```typescript
const { imageId, placeholderConfig } = await trpc.images.generate.mutate({
  slideId: 'slide-123',
  slideDeckId: 456,
  contentType: 'kpis',
  keywords: ['education', 'community', 'Saudi Arabia', 'impact'],
  layoutType: 'stat-blocks',
  imagePosition: 'right-panel',
});

// Show placeholder immediately
setPlaceholder(placeholderConfig);

// Poll for completion
const interval = setInterval(async () => {
  const { status, imageUrl } = await trpc.images.getStatus.query({ imageId });
  if (status === 'completed') {
    setImageUrl(imageUrl);
    clearInterval(interval);
  } else if (status === 'failed') {
    // Keep placeholder
    clearInterval(interval);
  }
}, 2000);
```

### Backend: Generate Image

```typescript
// server/routers/images.ts
export const imagesRouter = router({
  generate: protectedProcedure
    .input(z.object({ slideId: z.string(), /* ... */ }))
    .mutation(async ({ ctx, input }) => {
      // Check quota
      const quota = await getImageStorageQuota(ctx.user.id);
      if (quota.usedBytes >= quota.limitBytes) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Storage quota exceeded' });
      }
      
      // Create pending record
      const image = await db.insert(generatedImages).values({
        userId: ctx.user.id,
        slideId: input.slideId,
        prompt: constructPrompt(input),
        contentHash: sha256(constructPrompt(input)),
        generationStatus: 'pending',
        /* ... */
      }).returning();
      
      // Trigger background generation
      generateImageAsync(image[0].id);
      
      return { imageId: image[0].id, status: 'pending', /* ... */ };
    }),
});
```

---

## Contract Version

**Version**: 1.0.0  
**Breaking Changes**: N/A (new API)  
**Deprecations**: None
