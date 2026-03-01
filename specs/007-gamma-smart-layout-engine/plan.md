# Implementation Plan: Gamma-Inspired Smart Layout Engine

**Branch**: `007-gamma-smart-layout-engine` | **Date**: 2026-03-01 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/007-gamma-smart-layout-engine/spec.md`

---

## Summary

Transform the existing slide builder from plain-text output to Gamma-app-inspired presentation-grade slides with:
- Smart layout selection from 45-layout registry based on content analysis
- Reliable image rendering with retry/fallback
- Fixed PDF export (currently corrupted)
- WYSIWYG PowerPoint export (currently text-only)
- Layout selection logging for debugging

**Technical Approach**: Replace html2canvas-based exports with native PDF/PPTX generation. Implement content analyzer + scoring algorithm for layout selection. Add database tables for layout logs and export jobs.

---

## Technical Context

**Language/Version**: TypeScript (strict mode)  
**Primary Dependencies**: React 19, Vite 7, pptxgenjs, jsPDF, Tailwind CSS 4, tRPC 11, Drizzle ORM  
**Storage**: PostgreSQL (existing)  
**Testing**: Vitest for unit, Playwright for E2E  
**Target Platform**: Web (modern browsers)  
**Project Type**: Full-stack web application  
**Performance Goals**: Slide render < 500ms, Export generation < 10s for 20 slides  
**Constraints**: RTL-only, Cairo font required, WYSIWYG export fidelity  
**Scale/Scope**: Single-user nonprofit marketing tool, ~20 slides per deck typical

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| P1: AI via OpenRouter | ✅ Pass | Layout selection can use AI fallback via existing OpenRouter integration |
| P2: Admin Dashboard UI | ✅ Pass | All UI maintains dashboard aesthetic, white background, Cairo font |
| P3: User Profile Quota | ✅ Pass | Quota display UI already exists; this feature doesn't modify it |
| P4: Full Slide Customization | ✅ Pass | 45 layouts provide extensive customization; AI suggests, user controls |
| P5: Real-Time AI Refinement | ✅ Pass | Layout selection provides AI-driven design suggestions |
| P6: Future Expansion | ✅ Pass | Layout registry is extensible; export mappers abstracted |
| P7: Arabic RTL Support | ✅ Pass | All layouts RTL-first; Cairo font embedded in exports |
| P8: Post-Update Error Check | ✅ Pass | Standard build/lint checks apply |

**Gate Result**: ✅ PASS — No violations. Proceed to Phase 0.

---

## Project Structure

### Documentation (this feature)

```text
specs/007-gamma-smart-layout-engine/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research findings
├── data-model.md        # Entity definitions
├── quickstart.md        # Implementation guide
├── contracts/
│   ├── layout-registry-schema.md
│   ├── content-analyzer-schema.md
│   └── export-mappers-schema.md
├── checklists/
│   └── requirements.md
└── tasks.md             # (created by /speckit.tasks)
```

### Source Code (repository root)

```text
client/
├── src/
│   ├── assets/
│   │   └── fonts/              # Cairo font files (NEW)
│   ├── components/
│   │   └── SlideBuilder/
│   │       ├── layouts/        # Layout components (ENHANCED)
│   │       │   ├── CoverHero.tsx
│   │       │   ├── FeatureCards3.tsx
│   │       │   ├── StatBlocks4.tsx
│   │       │   └── ... (45 layouts)
│   │       ├── SlideCard.tsx   # (MODIFY)
│   │       └── SlideImage.tsx  # (MODIFY - add retry)
│   ├── hooks/
│   │   └── useSlideExport.ts   # (MODIFY)
│   ├── lib/
│   │   ├── layoutRegistry.ts   # (NEW) Layout definitions
│   │   ├── contentAnalyzer.ts  # (NEW) Content analysis
│   │   ├── layoutSelector.ts   # (NEW) Scoring algorithm
│   │   ├── pdfExporter.ts      # (NEW) Native PDF export
│   │   ├── pptxExporter.ts     # (NEW) Native PPTX export
│   │   ├── aiLayoutSelector.ts # (MODIFY)
│   │   └── slideLayoutEngine.ts # (MODIFY)
│   └── stores/
│       └── slideStore.ts       # (MODIFY)

server/
├── layoutLogsRouter.ts         # (NEW) Layout logging API
├── exportRouter.ts             # (NEW) Export job API
└── routers.ts                  # (MODIFY) Add new routers

drizzle/
├── schema.ts                   # (MODIFY) Add new tables
└── migrations/
    └── XXXX_add_layout_logs.sql # (NEW)
```

**Structure Decision**: Existing full-stack monorepo structure maintained. New files added to appropriate existing directories. No structural changes required.

---

## Implementation Phases

### Phase 1: Foundation (Layout Registry + Content Analyzer)

**Goal**: Establish layout registry and content analysis infrastructure.

**Deliverables**:
1. TypeScript types for layouts (`client/src/lib/types/layouts.ts`)
2. Layout registry with 45 layout definitions (`client/src/lib/layoutRegistry.ts`)
3. Content analyzer (`client/src/lib/contentAnalyzer.ts`)
4. Layout selector with scoring algorithm (`client/src/lib/layoutSelector.ts`)
5. Database migration for `layout_selection_logs` table

**Dependencies**: None

**Estimated Complexity**: Medium

---

### Phase 2: Layout Components (React)

**Goal**: Implement React components for all 45 layouts.

**Deliverables**:
1. Cover family layouts (4 components)
2. Text+Media family layouts (5 components)
3. Cards family layouts (6 components)
4. KPIs family layouts (6 components)
5. Comparison family layouts (5 components)
6. Process family layouts (6 components)
7. Frameworks family layouts (4 components)
8. Budget family layouts (4 components)
9. Lists family layouts (5 components)

**Dependencies**: Phase 1 (types)

**Estimated Complexity**: High (45 components)

---

### Phase 3: Image Reliability

**Goal**: Fix image loading issues with retry/fallback.

**Deliverables**:
1. Enhanced `SlideImage` component with retry logic
2. Image placeholder component with retry button
3. Image preloader/validator hook
4. CORS-safe image fetching utility

**Dependencies**: None (can parallel with Phase 2)

**Estimated Complexity**: Low

---

### Phase 4: PDF Export Fix

**Goal**: Replace broken PDF export with working native generation.

**Deliverables**:
1. Cairo font files bundled as assets
2. Font registration utility for jsPDF
3. PDF element rendering functions
4. PDF mapper implementations for all layouts
5. Updated `useSlideExport` hook for PDF

**Dependencies**: Phase 1 (types), Phase 2 (layouts)

**Estimated Complexity**: Medium

---

### Phase 5: PowerPoint Export Fix

**Goal**: Replace image-based PPT with native element export.

**Deliverables**:
1. PPTX element rendering functions
2. PPTX mapper implementations for all layouts
3. RTL text handling in pptxgenjs
4. Updated `useSlideExport` hook for PPTX

**Dependencies**: Phase 1 (types), Phase 2 (layouts)

**Estimated Complexity**: Medium

---

### Phase 6: Integration + Overflow Handling

**Goal**: Wire everything together with overflow strategies.

**Deliverables**:
1. Integrate layout selector into slide generation flow
2. Implement overflow strategy: dense layout → expand → split
3. Layout selection logging to database
4. Update `slideStore` with new fields (layoutId, overflowStrategy)

**Dependencies**: All previous phases

**Estimated Complexity**: Medium

---

### Phase 7: Export Jobs + Polish

**Goal**: Add export job tracking and final polish.

**Deliverables**:
1. `export_jobs` table migration
2. Export job tRPC router
3. Export progress UI
4. Error handling and user feedback
5. Final testing and bug fixes

**Dependencies**: All previous phases

**Estimated Complexity**: Low

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cairo font not embedding correctly | Medium | High | Bundle fonts as base64, test early |
| pptxgenjs RTL issues | Low | Medium | Test with Arabic text first, have fallback |
| 45 layouts taking too long | Medium | Medium | Prioritize most-used layouts (cards, stats, cover) |
| Content analysis accuracy | Medium | Medium | Add AI fallback for ambiguous cases |
| PDF file size too large | Low | Low | Compress images before embedding |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Layout usage | 100% from registry | Check `layoutId` field on all slides |
| Image load rate | ≥95% | Monitor retry counts |
| PDF validity | 100% | Open in 3 readers without error |
| PPT editability | 100% | Verify text selectable in PowerPoint |
| Export fidelity | ≥95% visual match | Manual spot-check comparison |

---

## Artifacts Generated

| Artifact | Path | Status |
|----------|------|--------|
| Research | `specs/007-gamma-smart-layout-engine/research.md` | ✅ Complete |
| Data Model | `specs/007-gamma-smart-layout-engine/data-model.md` | ✅ Complete |
| Quickstart | `specs/007-gamma-smart-layout-engine/quickstart.md` | ✅ Complete |
| Layout Registry Contract | `specs/007-gamma-smart-layout-engine/contracts/layout-registry-schema.md` | ✅ Complete |
| Content Analyzer Contract | `specs/007-gamma-smart-layout-engine/contracts/content-analyzer-schema.md` | ✅ Complete |
| Export Mappers Contract | `specs/007-gamma-smart-layout-engine/contracts/export-mappers-schema.md` | ✅ Complete |

---

## Next Steps

Run `/speckit.tasks` to generate detailed task breakdown from this plan.
