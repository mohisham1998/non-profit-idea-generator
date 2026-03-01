# Contract: Export Visual Schema

**Feature**: Slide Visual Export Fix  
**Contract Type**: Export Pipeline Data Structure  
**Date**: 2026-02-28

---

## Overview

This contract defines the data structures and process for exporting slides as pixel-perfect PDF and PowerPoint files using html-to-image conversion.

---

## Export Request Schema

### PDF Export Request

```typescript
interface ExportPDFRequest {
  slideIds?: string[]; // Optional: export specific slides (default: all)
  includeMetadata?: boolean; // Include title, author, date (default: true)
  orientation?: 'landscape' | 'portrait'; // Default: landscape (16:9)
  quality?: number; // 0.8-1.0 (default: 0.95)
}
```

### PowerPoint Export Request

```typescript
interface ExportPPTXRequest {
  slideIds?: string[]; // Optional: export specific slides (default: all)
  includeMetadata?: boolean; // Include title, author, date (default: true)
  layout?: '16:9' | '4:3'; // Default: 16:9
  quality?: number; // 0.8-1.0 (default: 0.95)
}
```

**Validation**:
- `slideIds` must reference existing slides in current deck
- `quality` must be between 0.8 and 1.0
- `orientation` / `layout` must be valid enum values

---

## Export Pipeline Schema

### Stage 1: Slide Rendering

```typescript
interface SlideRenderConfig {
  slideId: string;
  width: number; // 1920 pixels (16:9 standard)
  height: number; // 1080 pixels
  scale: number; // 2 for high-DPI (3840×2160 capture)
  backgroundColor: string; // Hex color or 'transparent'
  waitForImages: boolean; // Wait for all images to load (default: true)
  timeout: number; // Max wait time in ms (default: 10000)
}
```

**Process**:
1. Clone slide DOM element to hidden container
2. Set fixed dimensions (1920×1080)
3. Ensure all images loaded (check `img.complete`)
4. Apply inline styles (resolve Tailwind classes)
5. Render fonts (ensure Cairo loaded)

---

### Stage 2: HTML-to-Image Conversion

```typescript
interface Html2CanvasConfig {
  scale: 2; // High-DPI for sharp export
  useCORS: true; // Allow external images (DALL-E 3 URLs)
  allowTaint: false; // Prevent canvas tainting
  backgroundColor: string; // From slide theme
  logging: false; // Disable console logs
  width: 1920;
  height: 1080;
  windowWidth: 1920;
  windowHeight: 1080;
  foreignObjectRendering: false; // Use DOM clone (more reliable)
  imageTimeout: 15000; // Wait up to 15s for images
  removeContainer: true; // Clean up after capture
}

interface CapturedSlideImage {
  slideId: string;
  canvas: HTMLCanvasElement;
  dataUrl: string; // Base64 PNG or JPEG
  blob: Blob;
  width: number; // 3840 (scale × 1920)
  height: number; // 2160 (scale × 1080)
  captureTimeMs: number;
}
```

**Process**:
1. Call `html2canvas(element, config)`
2. Convert canvas to blob: `canvas.toBlob(callback, 'image/png', 0.95)`
3. Convert blob to data URL for embedding
4. Store in `ExportManifest`

---

### Stage 3: PDF Assembly

```typescript
interface PDFAssemblyConfig {
  format: 'a4' | 'letter'; // Paper size (a4 default)
  orientation: 'landscape' | 'portrait'; // landscape for 16:9
  unit: 'mm' | 'pt'; // mm default
  compress: boolean; // true for smaller file size
  rtl: boolean; // true for Arabic content
}

interface PDFSlideEmbed {
  imageDataUrl: string; // Base64 from html2canvas
  x: number; // Position X (0 for full bleed)
  y: number; // Position Y (0 for full bleed)
  width: number; // 297mm (A4 landscape width)
  height: number; // 167mm (16:9 aspect at A4 width)
  format: 'PNG' | 'JPEG';
  compression: 'FAST' | 'MEDIUM' | 'SLOW'; // MEDIUM default
}
```

**Process**:
1. Initialize jsPDF: `new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })`
2. Set RTL: `pdf.setR2L(true)`
3. For each slide image:
   - Add page: `pdf.addPage()`
   - Embed image: `pdf.addImage(dataUrl, 'PNG', 0, 0, 297, 167)`
4. Save: `pdf.save('presentation.pdf')`

**Metadata Embedding**:
```typescript
pdf.setProperties({
  title: presentationName,
  author: userName,
  subject: 'Nonprofit Presentation',
  keywords: 'nonprofit, Saudi Arabia, AI-generated',
  creator: 'Nonprofit Admin Dashboard'
});
```

---

### Stage 4: PowerPoint Assembly

```typescript
interface PPTXAssemblyConfig {
  layout: '16:9' | '4:3'; // 16:9 default
  author: string;
  title: string;
  subject: string;
  rtlMode: boolean; // true for Arabic
}

interface PPTXSlideEmbed {
  imageDataUrl: string; // Base64 from html2canvas
  x: 0; // Full bleed
  y: 0;
  w: '100%'; // Full slide width
  h: '100%'; // Full slide height
  sizing: {
    type: 'cover'; // Cover entire slide
    w: '100%';
    h: '100%';
  };
}
```

**Process**:
1. Initialize pptxgenjs: `new pptxgen()`
2. Set layout: `pptx.layout = 'LAYOUT_16x9'`
3. Set metadata: `pptx.author = userName`, `pptx.title = presentationName`
4. For each slide image:
   - Add slide: `const slide = pptx.addSlide()`
   - Embed image: `slide.addImage({ data: dataUrl, x: 0, y: 0, w: '100%', h: '100%' })`
5. Write: `const blob = await pptx.write({ outputType: 'blob' })`
6. Save: `saveAs(blob, 'presentation.pptx')`

**RTL Configuration**:
```typescript
pptx.rtlMode = true; // Enable RTL for entire presentation
```

---

## Export Manifest Schema

### Complete Export Manifest

```typescript
interface ExportManifest {
  version: '1.0.0';
  format: 'pdf' | 'pptx';
  slides: ExportSlideData[];
  metadata: ExportMetadata;
  theme: ExportTheme;
  performance: ExportPerformance;
}

interface ExportSlideData {
  slideId: string;
  slideNumber: number; // 1-indexed
  imageDataUrl: string; // Base64 PNG/JPEG
  width: number; // 3840 (high-DPI)
  height: number; // 2160
  originalWidth: number; // 1920 (display size)
  originalHeight: number; // 1080
  captureTimeMs: number;
  imagesIncluded: number; // Count of AI images in slide
}

interface ExportMetadata {
  title: string; // Presentation name
  author: string; // User name
  createdAt: Date;
  slideCount: number;
  totalFileSize: number; // Estimated size in bytes
}

interface ExportTheme {
  primaryColor: string; // Hex
  fontFamily: 'Cairo';
  rtl: boolean;
  logo?: string; // Base64 or URL
}

interface ExportPerformance {
  totalTimeMs: number;
  averageSlideTimeMs: number;
  parallelConversions: boolean;
  memoryPeakMB: number; // Estimated
}
```

---

## Error Handling

### Export Errors

```typescript
type ExportError = 
  | 'RENDER_FAILED'       // html2canvas failed to capture
  | 'IMAGE_LOAD_TIMEOUT'  // Images didn't load in time
  | 'MEMORY_EXCEEDED'     // Browser ran out of memory
  | 'ASSEMBLY_FAILED'     // PDF/PPTX library error
  | 'SAVE_FAILED';        // File save error

interface ExportErrorResponse {
  error: ExportError;
  message: string;
  slideId?: string; // Which slide caused error (if applicable)
  retryable: boolean; // Can user retry?
  suggestion: string; // User-facing suggestion
}
```

**Error Examples**:

| Error | Message | Retryable | Suggestion |
|-------|---------|-----------|------------|
| `RENDER_FAILED` | "Failed to capture slide 5" | Yes | "Try refreshing the page and exporting again" |
| `IMAGE_LOAD_TIMEOUT` | "Images didn't load in time" | Yes | "Wait for all images to load before exporting" |
| `MEMORY_EXCEEDED` | "Too many slides for browser memory" | No | "Try exporting fewer slides at once" |
| `ASSEMBLY_FAILED` | "PDF generation error" | Yes | "Check browser console and retry" |

---

## Performance Targets

### Conversion Speed

| Metric | Target | Measurement |
|--------|--------|-------------|
| Single slide capture | <1s | html2canvas execution time |
| 10-slide parallel capture | <8s | Promise.all completion time |
| PDF assembly | <2s | jsPDF write time |
| PPTX assembly | <5s | pptxgenjs write time |
| Total 10-slide PDF export | <10s | End-to-end user experience |
| Total 10-slide PPTX export | <15s | End-to-end user experience |

### Memory Constraints

| Scenario | Peak Memory | Strategy |
|----------|-------------|----------|
| 10 slides | ~100MB | Parallel conversion (all at once) |
| 20 slides | ~200MB | Parallel conversion (all at once) |
| 50+ slides | ~500MB | Batched conversion (10 slides per batch) |

---

## Quality Assurance

### Visual Fidelity Checklist

For each exported slide, verify:

- ✅ Layout matches on-screen rendering (same structure)
- ✅ All images present and positioned correctly
- ✅ All icons visible and correct size
- ✅ Colors match theme (primary color, backgrounds)
- ✅ Fonts render correctly (Cairo for Arabic)
- ✅ RTL text alignment correct (right-aligned)
- ✅ Spacing and padding preserved
- ✅ No clipping or overflow
- ✅ No pixelation or blur (high-DPI)
- ✅ 16:9 aspect ratio maintained

### Export File Validation

**PDF**:
- Opens in Adobe Reader without errors
- All pages present (1 page per slide)
- Images embedded (not linked)
- Metadata correct (title, author)

**PPTX**:
- Opens in Microsoft PowerPoint without errors
- All slides present
- Images embedded (not linked)
- Slide size is 16:9 (10 × 5.625 inches)

---

## Example: Complete Export Flow

### Step-by-Step Process

```typescript
// 1. User clicks "تصدير PDF"
const exportToPDF = async () => {
  // 2. Prepare manifest
  const manifest: ExportManifest = {
    version: '1.0.0',
    format: 'pdf',
    slides: [],
    metadata: { title: presentationName, author: userName, /* ... */ },
    theme: { primaryColor, fontFamily: 'Cairo', rtl: true },
    performance: { /* ... */ }
  };
  
  // 3. Capture all slides in parallel
  const capturePromises = cards.map(async (card) => {
    const element = renderSlideForExport(card); // Hidden DOM render
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const dataUrl = canvas.toDataURL('image/png', 0.95);
    return { slideId: card.id, imageDataUrl: dataUrl, width: 3840, height: 2160 };
  });
  
  const capturedSlides = await Promise.all(capturePromises);
  manifest.slides = capturedSlides;
  
  // 4. Assemble PDF
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  pdf.setR2L(true);
  pdf.setProperties({ title: manifest.metadata.title, author: manifest.metadata.author });
  
  capturedSlides.forEach((slide, index) => {
    if (index > 0) pdf.addPage();
    pdf.addImage(slide.imageDataUrl, 'PNG', 0, 0, 297, 167);
  });
  
  // 5. Save file
  pdf.save(`${presentationName}.pdf`);
  
  // 6. Show success toast
  toast.success('تم تصدير PDF بنجاح');
};
```

---

## Contract Version

**Version**: 1.0.0  
**Breaking Changes**: N/A (new contract)  
**Deprecations**: Replaces old text-only export (from previous implementation)

---

## Notes

- **Image Embedding**: All images embedded as base64 data URLs (no external links)
- **Font Embedding**: Cairo font must be available in browser (loaded via Google Fonts or local)
- **File Size**: Expect ~2-5MB per slide (high-quality PNG embedding), 20-50MB for 10-slide deck
- **Browser Compatibility**: Requires modern browser with canvas API support (Chrome 90+, Firefox 88+, Safari 14+)
- **CORS**: DALL-E 3 images must have CORS headers enabled (OpenRouter provides this)
