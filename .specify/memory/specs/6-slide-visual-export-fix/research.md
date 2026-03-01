# Research: Slide Visual Export Fix

**Feature**: Slide Visual Export Fix  
**Branch**: `6-slide-visual-export-fix`  
**Date**: 2026-02-28

---

## Research Questions

This document resolves all technical unknowns identified during planning.

---

## 1. AI Image Generation via OpenRouter (DALL-E 3)

### Decision

Use **OpenAI DALL-E 3** via OpenRouter API for generating realistic, Saudi-context images.

### Rationale

- **Already integrated**: Project uses OpenRouter for text generation; extending to images is straightforward
- **API consumption tracking**: DALL-E 3 calls count toward OpenRouter usage (consistent with existing quota system)
- **High quality**: DALL-E 3 produces realistic, prompt-adherent images suitable for professional presentations
- **Saudi context**: Supports detailed prompts for cultural accuracy ("Saudi Arabia", "professional", "nonprofit", "realistic")
- **Generation speed**: 5-10 seconds per image (acceptable with async background generation)

### Alternatives Considered

| Alternative | Pros | Cons | Verdict |
|-------------|------|------|---------|
| DALL-E 2 | Faster (3-5s), lower cost | Less realistic, weaker prompt adherence | ❌ Rejected - quality insufficient for professional presentations |
| Stable Diffusion (Replicate) | Open source, customizable, moderate cost | Requires more prompt engineering, inconsistent quality | ❌ Rejected - complexity vs. quality tradeoff unfavorable |
| Midjourney | Highest quality, most realistic | Requires Discord bot or API waitlist, not via OpenRouter | ❌ Rejected - integration complexity, not OpenRouter-compatible |
| Stock photo API (Unsplash/Pexels) | Fast, no generation cost | Limited Saudi-specific content, not contextual to slide data | ❌ Rejected - lacks contextual relevance and Saudi cultural accuracy |

### Implementation Notes

- **API Endpoint**: OpenRouter `/api/v1/chat/completions` with model `openai/dall-e-3`
- **Prompt Structure**: `"Professional realistic photograph for nonprofit presentation in Saudi Arabia: {content-specific-keywords}. High quality, culturally appropriate, no text overlay."`
- **Image Size**: 1024x1024 or 1792x1024 (landscape for slide compatibility)
- **Cost**: ~$0.04-0.08 per image (DALL-E 3 standard quality)
- **Rate Limiting**: OpenRouter handles rate limits; implement retry logic with exponential backoff

---

## 2. HTML-to-Image Export Strategy

### Decision

Use **html2canvas** library to convert React slide components to images, then embed in PDF/PPTX.

### Rationale

- **Pixel-perfect fidelity**: Captures exact visual rendering including CSS, images, icons, gradients
- **No manual recreation**: Avoids complex logic to recreate layouts with PDF/PPTX primitives
- **Proven library**: html2canvas is mature, widely used, handles RTL and complex layouts
- **Simple integration**: Works with existing React components without modification
- **Export speed**: ~500ms-1s per slide conversion (acceptable for 10-slide deck <10s target)

### Alternatives Considered

| Alternative | Pros | Cons | Verdict |
|-------------|------|------|---------|
| Pure PDF/PPTX primitives | Text searchable, smaller file size | Complex to recreate layouts, high maintenance, icons/gradients difficult | ❌ Rejected - complexity vs. fidelity tradeoff unfavorable |
| dom-to-image | Similar to html2canvas | Less maintained, compatibility issues | ❌ Rejected - html2canvas more reliable |
| Puppeteer screenshot | Perfect fidelity | Requires headless browser, server-side only, slow | ❌ Rejected - client-side solution preferred |
| Canvas API manual | Full control | Extremely complex, high maintenance | ❌ Rejected - reinventing html2canvas |

### Implementation Notes

- **Library**: `html2canvas` v1.4.1 (already in package.json)
- **Process**: 
  1. Render slide in hidden DOM element with fixed 1920×1080 dimensions
  2. Call `html2canvas(element, { scale: 2, useCORS: true })` to capture
  3. Convert canvas to blob/base64
  4. Embed in PDF (jsPDF `addImage`) or PPTX (pptxgenjs `addImage`)
- **CORS**: Set `useCORS: true` for external images (DALL-E 3 URLs)
- **Scale**: Use `scale: 2` for high-DPI export quality
- **Font Rendering**: Cairo font must be loaded before capture for correct Arabic rendering

---

## 3. Image Storage in PostgreSQL

### Decision

Store AI-generated images as **binary blobs in PostgreSQL** with 10GB per-user quota.

### Rationale

- **No external dependencies**: Uses existing PostgreSQL database (Supabase)
- **Simple integration**: Standard blob storage with Drizzle ORM
- **Quota enforcement**: Easy to track storage per user with SQL aggregation
- **Fast retrieval**: Direct database access, no S3 latency
- **Cost-effective**: No additional cloud storage costs

### Alternatives Considered

| Alternative | Pros | Cons | Verdict |
|-------------|------|------|---------|
| S3/CDN | Scalable, optimized for large files | External service, additional costs, complexity | ❌ Rejected - unnecessary for 10GB/user limit |
| File system | Simple, fast | Not scalable, backup complexity, Docker volume issues | ❌ Rejected - PostgreSQL more reliable |
| Session storage (browser) | No server storage | Lost on refresh, can't persist across sessions | ❌ Rejected - images must persist |
| Base64 in JSON | Simple | Huge database size, slow queries, inefficient | ❌ Rejected - blob storage more efficient |

### Implementation Notes

- **Table**: `generated_images` with columns: `id`, `user_id`, `slide_id`, `content_type`, `prompt`, `image_data` (bytea), `file_size`, `created_at`
- **Indexing**: Index on `user_id` and `slide_id` for fast lookups
- **Quota Tracking**: `SELECT SUM(file_size) FROM generated_images WHERE user_id = ?` to calculate usage
- **Cleanup**: Cascade delete when slide deck deleted; optional: auto-delete images >90 days old
- **Retrieval**: Serve via `/api/images/:id` endpoint with proper Content-Type headers

---

## 4. Image Placement & Layout Intelligence

### Decision

**AI-driven inline placement** - AI decides where single or multiple images appear within each layout based on content structure and layout type.

### Rationale

- **Flexibility**: Different layouts need different image placements (two-column: side-by-side, quadrant: center, card grid: header)
- **Context-aware**: AI considers content density, text length, and visual balance
- **Gamma-style**: Matches Gamma.app's intelligent image placement
- **No rigid templates**: Avoids one-size-fits-all approach that feels generic

### Layout-Specific Image Zones

| Layout Type | Image Placement Strategy | Example |
|-------------|-------------------------|---------|
| Two-Column | Left or right column (50% width), content in other column | Vision (text) + inspiring image |
| Quadrant | Center or background with semi-transparent overlay | SWOT with subtle background image |
| Card Grid | Top banner or interspersed between card rows | Features with header image |
| Stat Blocks | Background or side panel (30% width) | KPIs with analytics image |
| Flow/Timeline | Inline between steps or as background | Process with step-by-step visuals |
| Numbered List | Side panel or alternating (odd/even) | Goals with side image |

### Implementation Notes

- **AI Decision**: Extend `aiLayoutSelector.ts` to return `{ layoutType, imagePlacements: [{ position, size, zIndex }] }`
- **Position Types**: `background`, `left-panel`, `right-panel`, `top-banner`, `inline-between`, `center-overlay`
- **Size Options**: `full` (100%), `half` (50%), `third` (33%), `quarter` (25%)
- **Z-Index**: `background` (z-0), `inline` (z-10), `overlay` (z-20)

---

## 5. Placeholder Image Strategy

### Decision

**Gradient backgrounds with large contextual icons** - programmatically generated using theme colors and Lucide icons.

### Rationale

- **No external assets**: Generated on-the-fly with CSS gradients and SVG icons
- **Professional appearance**: Gradients look polished, icons provide context
- **Theme consistency**: Uses theme.primaryColor for gradient colors
- **Fast rendering**: No network requests, instant display
- **Fallback reliability**: Always works, no dependencies

### Implementation Notes

- **Gradient**: `linear-gradient(135deg, ${primaryColor}, ${darkenColor(primaryColor, 20%)})`
- **Icon**: Large (96px) contextual icon centered (e.g., DollarSign for budget, Gauge for KPIs)
- **Opacity**: Semi-transparent overlay (20%) if used as background behind content
- **Animation**: Subtle pulse animation while loading to indicate async generation in progress

---

## 6. Lazy Loading & Background Generation

### Decision

**Async background generation with WebSocket or polling** for real-time image reveal.

### Rationale

- **Non-blocking UX**: User sees slides immediately with placeholders
- **Progressive enhancement**: Images appear as they complete (3-10s each)
- **Parallel generation**: Multiple images generate simultaneously (up to 3 concurrent)
- **Smooth experience**: No long wait times, no loading spinners blocking entire UI

### Implementation Notes

- **Generation Flow**:
  1. Deck created → identify slides needing images
  2. Show gradient+icon placeholders immediately
  3. Trigger background API calls to `/api/images/generate` (tRPC mutation)
  4. Backend calls DALL-E 3, stores blob in PostgreSQL
  5. Return image ID to frontend
  6. Frontend polls or receives WebSocket event, fetches image via `/api/images/:id`
  7. Replace placeholder with actual image, update slideStore
- **Concurrency**: Limit to 3 simultaneous DALL-E 3 calls to avoid rate limits
- **Caching**: Check database first before generating (by `slide_id` + `content_hash`)
- **Error Handling**: If generation fails after 3 retries, keep gradient placeholder permanently

---

## 7. Export Performance & Quality

### Decision

Use **html2canvas with high-DPI scaling** for visual fidelity, optimize with parallel slide conversion.

### Rationale

- **Quality**: Scale factor 2 produces sharp, high-resolution images suitable for printing
- **Speed**: Convert slides in parallel (Promise.all) to meet <10s target for 10-slide deck
- **Compatibility**: Works in all modern browsers, no server-side rendering needed
- **Reliability**: Mature library with good RTL and font support

### Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Single slide conversion | <1s | html2canvas with scale: 2 |
| 10-slide PDF export | <10s | Parallel conversion + jsPDF assembly |
| 10-slide PPTX export | <15s | Parallel conversion + pptxgenjs assembly |
| Image embedding | <100ms/image | Base64 encoding + direct embed |
| Memory usage | <500MB | Convert and release slides sequentially if needed |

### Implementation Notes

- **Parallel Conversion**: `await Promise.all(slides.map(slide => html2canvas(...)))`
- **Progress Indicator**: Show "Exporting slide 3 of 10..." toast during export
- **Memory Management**: If >20 slides, convert in batches of 10 to avoid memory issues
- **Image Quality**: Use `quality: 0.95` for canvas.toBlob() to balance size vs. quality

---

## Research Summary

All technical unknowns resolved:

- ✅ AI image generation: DALL-E 3 via OpenRouter
- ✅ Image storage: PostgreSQL binary blobs (10GB/user)
- ✅ Export strategy: html2canvas → image embedding
- ✅ Image placement: AI-driven inline positioning per layout
- ✅ Placeholders: Gradient + large icon (programmatic)
- ✅ Lazy loading: Async background generation with real-time reveal
- ✅ Performance: Parallel conversion, <10s PDF, <15s PPTX

**Next Phase**: Generate data-model.md, contracts/, and quickstart.md
