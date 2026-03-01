# Research: Gamma-Inspired Smart Layout Engine

**Feature**: 007-gamma-smart-layout-engine  
**Date**: 2026-03-01  
**Status**: Complete

---

## Research Tasks

### R1: PDF Export Corruption Fix

**Question**: Why is PDF export producing corrupted files, and what's the best approach to fix it?

**Research Findings**:
- Current implementation uses `html2canvas` to capture slides as images, then `jsPDF` to create PDF
- `html2canvas` has known issues with:
  - Cross-origin images (CORS)
  - CSS gradients and shadows
  - Custom fonts (Cairo) not rendering correctly
  - RTL text direction sometimes ignored
- The corruption likely stems from failed image captures or font embedding issues

**Decision**: Replace html2canvas-based capture with a server-side PDF generation approach using `@react-pdf/renderer` or improve current `jspdf-rtl-support` with proper font embedding.

**Rationale**: Server-side PDF generation gives more control over fonts, RTL, and styling. React-PDF can render React components directly to PDF without DOM capture.

**Alternatives Considered**:
- Keep html2canvas + fix issues incrementally (rejected: too many edge cases)
- Use Puppeteer for server-side capture (rejected: heavy dependency, resource-intensive)
- Use @react-pdf/renderer (selected: native React integration, good RTL support)

---

### R2: PowerPoint Export Layout Preservation

**Question**: Why does PPT export lose styling, and how can we preserve visual layouts?

**Research Findings**:
- Current implementation captures slides as images using `html2canvas`, then embeds as single image per slide in `pptxgenjs`
- This means no editable text/shapes in PPT—just flat images
- For true WYSIWYG with editable elements, need to programmatically build PPT using `pptxgenjs` native shapes/text
- `pptxgenjs` supports: shapes, text boxes, tables, images, charts, RTL text

**Decision**: Implement native `pptxgenjs` element rendering that maps each layout type to PPT shapes/text boxes with proper positioning.

**Rationale**: Native PPT elements preserve editability and guarantee consistent styling without DOM rendering issues.

**Alternatives Considered**:
- Keep image-based export (rejected: not editable, defeats purpose)
- Use LibreOffice conversion server (rejected: complex infrastructure)
- Build native pptxgenjs output (selected: direct control, widely used)

---

### R3: Image Loading Reliability

**Question**: Why do images fail to load, and what's the best fallback strategy?

**Research Findings**:
- Images are stored as base64 in PostgreSQL `generated_images` table
- Image URLs are generated via tRPC endpoint
- Failures can occur from:
  - CORS issues when loading external URLs
  - Large base64 strings causing memory pressure
  - Missing/deleted images from DB
  - Network timeouts during AI generation

**Decision**: 
1. Implement robust image loading with retry logic (3 attempts with exponential backoff)
2. Add graceful placeholder with retry button on failure
3. Pre-validate images before render
4. Add image caching layer to reduce DB hits

**Rationale**: Multiple layers of resilience ensure images almost always display, with clear user feedback when they don't.

**Alternatives Considered**:
- Move to S3 storage (AWS SDK already installed but unused) — deferred for future
- Client-side caching only (insufficient for reliability)
- Selected multi-layer approach with retry + placeholder + validation

---

### R4: Smart Layout Selection Algorithm

**Question**: How should AI select layouts from the 45-layout registry based on content?

**Research Findings**:
- Current `aiLayoutSelector.ts` uses simple rule-based mapping: slide type → layout
- Gamma.app approach analyzes content structure, not just slide type
- Content analysis factors:
  - Item count (detectItemCount from content)
  - Density score (character count / block count)
  - Content structure (list, stats, matrix, steps, narrative)
  - Presence of tables, metrics, images

**Decision**: Implement content analyzer that scores each layout in registry against content features, then selects highest-scoring layout. Include AI fallback for ambiguous cases.

**Algorithm**:
```
1. Parse content to extract: items[], hasNumbers, hasTable, hasList, hasImages
2. Compute: itemCount, densityScore, structureType
3. For each layout in registry:
   - Score = weightedMatch(layout.bestFor, contentFeatures)
4. Select layout with highest score
5. Log decision: {slideIndex, contentAnalysis, candidateLayouts, selectedLayout}
```

**Rationale**: Scoring approach allows any layout to be selected for any slide based on content, matching Gamma's behavior.

**Alternatives Considered**:
- Pure AI selection (rejected: expensive, slow, inconsistent)
- Fixed slide-type mapping (rejected: current approach, not flexible)
- Hybrid scoring + AI (selected: fast default, AI for edge cases)

---

### R5: Slide Height Overflow Handling

**Question**: How should the system handle content that exceeds slide height?

**Research Findings**:
- Current `slideLayoutEngine.ts` has `splitSlideContent()` for >800 chars or >8 blocks
- No dynamic height adaptation in current layout components
- Fixed slide dimensions cause truncation

**Decision**: Implement three-tier overflow strategy:
1. **First**: Try denser layout variant (e.g., `icon-cards-6` instead of `icon-cards-3`)
2. **Second**: Expand slide height up to 150% of standard
3. **Third**: Split content into multiple slides with continuation indicator

**Rationale**: Progressive overflow handling preserves content integrity without forcing all slides to split.

**Alternatives Considered**:
- Always split (rejected: creates too many slides)
- Always expand (rejected: breaks export dimensions)
- Progressive strategy (selected: best balance)

---

### R6: Cairo Font Embedding in Exports

**Question**: How do we ensure Cairo font renders correctly in PDF and PPT exports?

**Research Findings**:
- Cairo is a Google Font (Arabic + Latin support)
- `jsPDF` requires font embedding via `addFont()` with base64 font data
- `pptxgenjs` uses system fonts or embedded fonts
- RTL requires proper font + direction settings

**Decision**: 
1. Bundle Cairo font files (Regular, Bold, SemiBold) as base64 in app
2. Register fonts with jsPDF at init
3. For PPT: embed font file or specify Cairo as font family (fallback: Arial)
4. Always set `rtl: true` direction on text elements

**Rationale**: Pre-bundled fonts guarantee consistent rendering regardless of system fonts.

**Alternatives Considered**:
- Rely on system fonts (rejected: inconsistent across machines)
- Use web fonts only (rejected: doesn't work in exports)
- Bundle fonts (selected: guaranteed consistency)

---

### R7: Layout Registry Architecture

**Question**: How should the 45 layouts be structured in code?

**Research Findings**:
- Current layouts are React components in `layouts/` directory
- Each layout has different props and rendering logic
- Need consistent interface for AI selection and export mapping

**Decision**: Create `LayoutRegistry` as typed object with:
```typescript
interface LayoutDefinition {
  id: string;                    // e.g., 'feature-cards-3'
  family: LayoutFamily;          // e.g., 'cards'
  name: string;                  // e.g., 'Feature Cards (3-up)'
  component: React.FC<LayoutProps>;
  bestFor: ContentPattern[];     // e.g., ['3-items', 'features', 'benefits']
  minItems: number;
  maxItems: number;
  supportsImages: boolean;
  densityLevel: 'low' | 'medium' | 'high';
  estimatedHeight: number;       // px at standard dimensions
  pptxMapper: (content, theme) => PptxSlideDefinition;
  pdfMapper: (content, theme) => PdfSlideDefinition;
}
```

**Rationale**: Unified registry enables AI selection, export mapping, and component rendering from single source of truth.

---

## Technology Decisions Summary

| Area | Decision | Key Library |
|------|----------|-------------|
| PDF Export | React-PDF or jsPDF with proper font embedding | `@react-pdf/renderer` or `jspdf` + Cairo fonts |
| PPT Export | Native pptxgenjs shapes/text (not image capture) | `pptxgenjs` |
| Images | Retry logic + placeholder + validation | Custom hooks |
| Layout Selection | Content scoring algorithm + AI fallback | Custom engine |
| Overflow | Progressive: denser layout → expand → split | Custom logic |
| Fonts | Bundled Cairo font files | Base64 fonts |
| Registry | Typed LayoutDefinition objects | TypeScript types |

---

## Resolved Clarifications

All technical context items have been resolved through research. No outstanding NEEDS CLARIFICATION items.
