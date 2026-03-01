# Implementation Plan: Slide Visual Export Fix

**Branch**: `6-slide-visual-export-fix` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)

---

## Summary

Transform slide output from plain text to polished, marketing-grade presentations with AI-generated Saudi-context images, contextual icons, Gamma-style smart layouts, and pixel-perfect PDF/PPTX exports. Images generate asynchronously with lazy loading placeholders, stored in PostgreSQL (10GB/user limit), and AI decides both layout type and image placement inline with content. Exports use html-to-image to capture exact visual styling.

---

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.1, Node.js 18+  
**Primary Dependencies**: React, Tailwind CSS, Lucide React (icons), OpenRouter API (DALL-E 3), html2canvas (html-to-image), pptxgenjs (PowerPoint), jsPDF + jspdf-rtl-support (PDF), PostgreSQL (image blob storage), Zustand (state), tRPC (API)  
**Storage**: PostgreSQL database with binary blob storage for AI-generated images (10GB per-user limit)  
**Testing**: Vitest, React Testing Library  
**Target Platform**: Web application (browser-based, responsive)  
**Project Type**: Full-stack web application (React frontend + Express backend + PostgreSQL)  
**Performance Goals**: Image generation 3-10s per image (async background), export 10-slide deck <10s (PDF), <15s (PPTX), lazy loading for smooth UX  
**Constraints**: 10GB image storage per user, 16:9 slide dimensions, RTL support for Arabic, Cairo font for exports, Saudi-context image appropriateness  
**Scale/Scope**: Multi-user SaaS, ~10-50 slides per deck, ~5-20 images per deck, PostgreSQL blob storage, API consumption tracking

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle 1 — AI Content Generation via OpenRouter

**Status**: ✅ PASS

- Uses OpenAI DALL-E 3 via OpenRouter for image generation
- Counts toward API consumption (tracked on Usage Quota page)
- Extends existing OpenRouter integration (already used for text generation)
- Model selection: DALL-E 3 for realistic, high-quality images

### Principle 2 — Admin Dashboard UI

**Status**: ✅ PASS

- Enhances existing SlideBuilder component (already dashboard-integrated)
- Maintains dashboard aesthetic with visual slide cards
- No new navigation required (extends current slide editing workflow)
- Follows established design system (Tailwind, shadcn/ui components)

### Principle 3 — User Profile with Quota Limit

**Status**: ✅ PASS

- Adds image storage quota (10GB per user) to existing quota system
- Tracked and displayed on API Consumption page (existing page)
- Enforces storage limit (prevents generation when quota exceeded)
- Aligns with existing usage tracking architecture

### Principle 4 — Slide Customization & Editing

**Status**: ✅ PASS

- Extends existing slide editing (SlideCard, StylePanel)
- AI-driven layout and image placement (user can still manually edit via StylePanel)
- Maintains existing customization controls (colors, layouts, content)
- Adds visual elements without removing existing editing capabilities

### Principle 5 — Real-time AI Refinement

**Status**: ✅ PASS

- Background image generation with lazy loading (non-blocking)
- Images reveal in real-time as they complete
- Maintains existing AI chat/refinement features for text content
- Extends AI capabilities to visual elements

### Principle 6 — Export Flexibility

**Status**: ✅ PASS

- Enhances existing PDF/PPTX export (replaces text-only export with visual export)
- Uses html-to-image for pixel-perfect fidelity
- Maintains 16:9 dimensions and RTL support
- Preserves all visual elements (images, icons, layouts, colors)

### Principle 7 — Supabase Integration

**Status**: ✅ PASS

- Uses existing theme.primaryColor from Supabase branding
- Stores images in PostgreSQL (Supabase-compatible)
- Tracks image storage quota in existing user table
- No new authentication or data sync required

### Principle 8 — Post-Update Terminal Error Check

**Status**: ✅ PASS

- Implementation will include TypeScript type checking
- Export functionality will be tested before completion
- Image generation will have error handling and fallbacks
- Follows existing error handling patterns (toast notifications, graceful degradation)

**Overall Gate Status**: ✅ ALL GATES PASS - No violations, no complexity justification needed

---

## Project Structure

### Documentation (this feature)

```text
specs/6-slide-visual-export-fix/
├── plan.md              # This file
├── research.md          # Phase 0: Technology research
├── data-model.md        # Phase 1: Data entities
├── quickstart.md        # Phase 1: Integration guide
├── contracts/           # Phase 1: API contracts
│   ├── image-generation-api.md
│   ├── layout-with-images-schema.md
│   └── export-visual-schema.md
├── checklists/
│   └── requirements.md  # Already created
└── tasks.md             # Phase 2: Implementation tasks
```

### Source Code (repository root)

```text
client/
├── src/
│   ├── components/
│   │   └── SlideBuilder/
│   │       ├── SlideCard.tsx           # Update: image zones, placeholders
│   │       ├── SlideBuilder.tsx        # Update: export with html-to-image
│   │       ├── ImagePlaceholder.tsx    # New: gradient + icon placeholder
│   │       ├── blocks/                 # Existing: content blocks
│   │       └── layouts/                # Update: image placement zones
│   │           ├── TwoColumnLayout.tsx
│   │           ├── QuadrantLayout.tsx
│   │           ├── CardGridLayout.tsx
│   │           ├── FlowLayout.tsx
│   │           ├── StatBlocksLayout.tsx
│   │           └── NumberedLayout.tsx
│   ├── hooks/
│   │   ├── useSlideExport.ts          # Update: html-to-image export
│   │   ├── useImageGeneration.ts      # New: DALL-E 3 integration
│   │   └── useImageStorage.ts         # New: quota tracking
│   ├── lib/
│   │   ├── aiLayoutSelector.ts        # Update: image placement decisions
│   │   ├── imageGenerator.ts          # New: DALL-E 3 API calls
│   │   ├── slideExportUtils.ts        # Update: html-to-image conversion
│   │   └── slideLayoutEngine.ts       # Update: image zone allocation
│   ├── stores/
│   │   └── slideStore.ts              # Update: image state, placeholders
│   └── pages/
│       └── UsageQuota.tsx             # Update: image storage tracking
│
server/
├── routers/
│   ├── images.ts                      # New: image generation endpoints
│   └── usage.ts                       # Update: image storage quota
├── db.ts                              # Update: image blob storage schema
└── services/
    ├── imageGeneration.ts             # New: DALL-E 3 service
    └── imageStorage.ts                # New: blob CRUD operations
│
drizzle/
└── schema.ts                          # Update: generated_images table
```

**Structure Decision**: Web application structure (Option 2 from template). Frontend React components handle slide rendering with image placeholders and lazy loading. Backend tRPC endpoints manage DALL-E 3 API calls via OpenRouter and PostgreSQL blob storage. Export uses client-side html2canvas to convert slides to images, then embeds in PDF/PPTX.

---

## Complexity Tracking

> No constitution violations - this section is not applicable.

---

