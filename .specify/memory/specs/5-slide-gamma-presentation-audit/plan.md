# Implementation Plan: Slide Output Gamma Presentation Audit

**Branch**: `5-slide-gamma-presentation-audit` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `.specify/memory/specs/5-slide-gamma-presentation-audit/spec.md`

## Summary

Transform slide output from simple, unformatted text blocks into Gamma-quality presentations with AI-driven dynamic layout selection. Each slide must use standard PPTX/PDF dimensions (16:9), support varied layouts (two-column, quadrants, flows, stat blocks, cards), break content into distinct visual blocks (never solid text), and follow the nonprofit's customizable primary color for branding. AI selects the optimal layout per slide based on content type and volume, chooses contextually appropriate icons from Lucide/Heroicons, and ensures text is perfectly formatted for stakeholder presentations. Long content splits into multiple focused slides automatically.

## Technical Context

**Language/Version**: TypeScript 5.x (React 18.x)  
**Primary Dependencies**: React, Tailwind CSS, Lucide/Heroicons (icons), OpenRouter API (AI layout/content decisions), jsPDF or similar (PDF export), pptxgenjs or similar (PowerPoint export)  
**Storage**: Supabase (user profiles, branding settings including primary color)  
**Testing**: Vitest/Jest for unit tests, Playwright for visual regression (slide layout comparisons)  
**Target Platform**: Web application (desktop/tablet browsers)  
**Project Type**: Web application (React SPA with backend API)  
**Performance Goals**: Slide generation <3s per slide; AI layout selection <2s; export to PDF/PPTX <5s for 10-slide deck  
**Constraints**: RTL support mandatory; PPTX/PDF exports must preserve 16:9 dimensions and visual fidelity; AI calls debounced (500ms minimum per P5)  
**Scale/Scope**: ~10 layout types (two-column, quadrant, flow, stat blocks, cards, etc.); ~50 icon categories from Lucide/Heroicons; supports decks up to 50 slides

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle 1 — AI Content Generation via OpenRouter

✅ **PASS**: AI dynamically selects layouts per slide via OpenRouter; layout selection is content-driven and adaptive (FR-4).

### Principle 2 — Admin Dashboard UI

✅ **PASS**: Slide builder lives in admin dashboard workspace; customization panel for branding (primary color) already exists; this feature extends slide rendering within that UI.

### Principle 3 — User Profile with Quota Limit

✅ **PASS**: No quota changes; feature enhances slide output quality within existing quota system.

### Principle 4 — Full Customization of Slide Layouts

✅ **PASS**: AI-driven dynamic layout selection is core; layouts are non-destructive (content preserved when layout changes); users can customize via primary color (FR-3).

### Principle 5 — Real-Time AI Refinement

✅ **PASS**: AI layout selection happens during generation; real-time refinement already exists per P5; this feature adds layout intelligence.

### Principle 6 — Third-Party Integration Readiness

✅ **PASS**: Export to PDF/PPTX (FR-1) supports third-party sharing; no new integrations required.

### Principle 7 — Arabic Language & RTL Support

✅ **PASS**: All layouts MUST support RTL (FR-9); numbered badges, flow diagrams, and visual hierarchy must render correctly in RTL.

### Principle 8 — Post-Update Terminal Error Check & Self-Healing

✅ **PASS**: No terminal/build changes expected; feature is slide rendering logic only.

**Gate Result**: ✅ **ALL GATES PASS** — Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
.specify/memory/specs/5-slide-gamma-presentation-audit/
├── plan.md              # This file
├── research.md          # Phase 0 output (AI layout selection, PPTX/PDF export libraries)
├── data-model.md        # Phase 1 output (Slide Layout, Content Block, Visual Hierarchy)
├── quickstart.md        # Phase 1 output (how to add new layout types, test slide rendering)
├── contracts/           # Phase 1 output (AI layout selection API contract, slide render schema)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
client/
├── src/
│   ├── components/
│   │   └── SlideBuilder/
│   │       ├── SlideCard.tsx              # Main slide rendering component (UPDATE)
│   │       ├── layouts/                   # NEW: Layout components
│   │       │   ├── TwoColumnLayout.tsx
│   │       │   ├── QuadrantLayout.tsx
│   │       │   ├── FlowLayout.tsx
│   │       │   ├── StatBlocksLayout.tsx
│   │       │   ├── CardGridLayout.tsx
│   │       │   └── index.ts
│   │       ├── blocks/                    # NEW: Content block components
│   │       │   ├── ContentCard.tsx
│   │       │   ├── NumberedBadge.tsx
│   │       │   ├── SectionHeader.tsx
│   │       │   ├── StatBlock.tsx
│   │       │   └── index.ts
│   │       └── SlideExporter.tsx          # NEW: PDF/PPTX export logic
│   ├── lib/
│   │   ├── convertToSlides.ts             # AI content-to-slides logic (UPDATE)
│   │   ├── aiLayoutSelector.ts            # NEW: AI layout selection via OpenRouter
│   │   ├── slideLayoutEngine.ts           # NEW: Layout rendering engine
│   │   └── iconSelector.ts                # NEW: AI icon selection from Lucide/Heroicons
│   └── hooks/
│       └── useSlideExport.ts              # NEW: Hook for PDF/PPTX export
│
└── tests/
    ├── unit/
    │   ├── aiLayoutSelector.test.ts
    │   ├── slideLayoutEngine.test.ts
    │   └── iconSelector.test.ts
    └── visual/
        └── slideLayouts.spec.ts           # Playwright visual regression tests

server/
└── (no changes expected; AI calls via OpenRouter client-side or existing API)
```

**Structure Decision**: Web application structure (Option 2 from template). Slide rendering is client-side React; AI layout selection calls OpenRouter API (existing integration). PDF/PPTX export uses client-side libraries (jsPDF, pptxgenjs). Primary color fetched from Supabase user branding settings (already exists). No new backend routes required.

## Complexity Tracking

> No constitution violations; table not needed.

---

## Phase 0: Research

### Research Tasks

1. **AI Layout Selection Strategy**
   - Research how to prompt OpenRouter models to select optimal layout types based on content (e.g., "Given this content: [text], choose: two-column, quadrant, flow, stat-blocks, or cards")
   - Evaluate whether to use structured output (JSON) or parse natural language responses
   - Determine token cost and latency for layout selection calls
   - Identify fallback strategy if AI call fails (default layout per content type)

2. **PPTX/PDF Export Libraries**
   - Evaluate pptxgenjs vs officegen vs other libraries for PowerPoint export with RTL support
   - Evaluate jsPDF vs pdfmake vs other libraries for PDF export with RTL, custom fonts (Cairo), and 16:9 dimensions
   - Test whether libraries preserve visual fidelity (colors, icons, badges, spacing) from React components
   - Identify any limitations with RTL text rendering in exports

3. **Layout Rendering Engine Design**
   - Research best practices for dynamic React component rendering based on AI-selected layout type
   - Evaluate whether to use a layout registry (map of layout type → component) or switch/case
   - Determine how to pass content blocks (cards, badges, headers) to layout components as props
   - Identify patterns for ensuring content never appears as solid text (validation/linting)

4. **Icon Selection from Lucide/Heroicons**
   - Research how to map content keywords (e.g., "budget", "KPI", "challenge") to appropriate icons
   - Evaluate whether to use AI (OpenRouter) to suggest icons or a predefined keyword-to-icon mapping
   - Identify icon library API for dynamically loading icons by name
   - Determine fallback icon if AI suggests unavailable icon

5. **Slide Splitting for Long Content**
   - Research heuristics for detecting when content is too long for one slide (character count, block count, height estimation)
   - Evaluate strategies for splitting content into multiple slides while preserving context (e.g., "Goals (1 of 3)", "Goals (2 of 3)")
   - Identify edge cases (e.g., single very long paragraph, nested lists)

6. **Visual Hierarchy & Typography**
   - Research Tailwind CSS utility patterns for strategic bolding, color accents, and font hierarchy
   - Evaluate how to dynamically apply primary color from user branding to badges, headers, and accents
   - Identify best practices for ensuring headers are visually separated from body content

7. **RTL Layout Support**
   - Research Tailwind CSS RTL utilities (rtl: prefix) and how to apply them to all layout components
   - Evaluate whether numbered badges and flow diagrams require custom RTL logic or if Tailwind handles it
   - Test Cairo font rendering in RTL for all layout types

### Output

**File**: `research.md` in feature directory

**Format**:
```markdown
# Research: Slide Output Gamma Presentation Audit

## 1. AI Layout Selection Strategy

**Decision**: [Chosen approach]
**Rationale**: [Why chosen]
**Alternatives Considered**: [What else evaluated]
**Implementation Notes**: [Key details]

## 2. PPTX/PDF Export Libraries

**Decision**: [Chosen libraries]
**Rationale**: [Why chosen]
**Alternatives Considered**: [What else evaluated]
**Implementation Notes**: [RTL support, Cairo font, 16:9 dimensions]

## 3. Layout Rendering Engine Design

**Decision**: [Chosen pattern]
**Rationale**: [Why chosen]
**Alternatives Considered**: [What else evaluated]
**Implementation Notes**: [Registry vs switch, props structure]

## 4. Icon Selection from Lucide/Heroicons

**Decision**: [AI vs mapping]
**Rationale**: [Why chosen]
**Alternatives Considered**: [What else evaluated]
**Implementation Notes**: [API usage, fallback icons]

## 5. Slide Splitting for Long Content

**Decision**: [Chosen heuristics]
**Rationale**: [Why chosen]
**Alternatives Considered**: [What else evaluated]
**Implementation Notes**: [Thresholds, context preservation]

## 6. Visual Hierarchy & Typography

**Decision**: [Tailwind patterns]
**Rationale**: [Why chosen]
**Alternatives Considered**: [What else evaluated]
**Implementation Notes**: [Primary color application, header separation]

## 7. RTL Layout Support

**Decision**: [Tailwind RTL approach]
**Rationale**: [Why chosen]
**Alternatives Considered**: [What else evaluated]
**Implementation Notes**: [Custom logic needed, Cairo font]
```

---

## Phase 1: Design & Contracts

### Data Model

**File**: `data-model.md`

**Entities**:

1. **SlideLayout**
   - `type`: string (enum: "two-column", "quadrant", "flow", "stat-blocks", "card-grid", etc.)
   - `contentBlocks`: ContentBlock[]
   - `dimensions`: { width: number, height: number, aspectRatio: string } (e.g., 16:9)
   - `primaryColor`: string (hex, from user branding)
   - `rtl`: boolean

2. **ContentBlock**
   - `id`: string
   - `type`: string (enum: "card", "badge", "header", "stat", "text", "icon")
   - `content`: string | number
   - `style`: { bold?: boolean, colorAccent?: boolean, iconName?: string }
   - `position`: { row?: number, col?: number } (for grid layouts)

3. **VisualHierarchy**
   - `headers`: { level: number, text: string, iconName?: string }[]
   - `keyTerms`: string[] (terms to bold/accent)
   - `icons`: { context: string, iconName: string }[]

4. **SlideExportConfig**
   - `format`: "pdf" | "pptx"
   - `dimensions`: { width: number, height: number }
   - `font`: string (e.g., "Cairo")
   - `rtl`: boolean

**Relationships**:
- One Slide has one SlideLayout
- One SlideLayout has many ContentBlocks
- One SlideLayout has one VisualHierarchy

**Validation Rules**:
- `contentBlocks` MUST NOT be empty (no blank slides)
- No ContentBlock of type "text" MAY contain >500 characters (triggers split)
- `primaryColor` MUST be valid hex color
- `dimensions.aspectRatio` MUST be "16:9"

**State Transitions**:
- Draft → AI Layout Selection → Rendered → Exported

### Interface Contracts

**Directory**: `contracts/`

**Files**:

1. **`ai-layout-selection.md`**: Contract for AI layout selection API
   ```markdown
   # AI Layout Selection Contract
   
   ## Input
   ```json
   {
     "content": "string (slide content)",
     "contentType": "string (e.g., 'features', 'kpis', 'goals', 'challenges')",
     "contentLength": "number (character count)",
     "blockCount": "number (number of list items or sections)"
   }
   ```
   
   ## Output
   ```json
   {
     "layoutType": "string (enum: two-column, quadrant, flow, stat-blocks, card-grid)",
     "rationale": "string (why this layout was chosen)",
     "iconSuggestions": [
       { "context": "string", "iconName": "string (Lucide/Heroicons name)" }
     ]
   }
   ```
   
   ## Error Handling
   - If AI call fails, return default layout based on contentType
   - If suggested iconName not found in library, use fallback icon
   ```

2. **`slide-render-schema.md`**: Schema for slide rendering
   ```markdown
   # Slide Render Schema
   
   ## SlideLayout Component Props
   ```typescript
   interface SlideLayoutProps {
     type: "two-column" | "quadrant" | "flow" | "stat-blocks" | "card-grid";
     contentBlocks: ContentBlock[];
     primaryColor: string; // hex
     rtl: boolean;
     dimensions: { width: number; height: number; aspectRatio: string };
   }
   ```
   
   ## ContentBlock Component Props
   ```typescript
   interface ContentBlockProps {
     type: "card" | "badge" | "header" | "stat" | "text" | "icon";
     content: string | number;
     style?: { bold?: boolean; colorAccent?: boolean; iconName?: string };
     primaryColor: string; // for badges, accents
     rtl: boolean;
   }
   ```
   ```

### Quickstart

**File**: `quickstart.md`

```markdown
# Quickstart: Slide Output Gamma Presentation Audit

## Adding a New Layout Type

1. Create a new layout component in `client/src/components/SlideBuilder/layouts/`:
   ```tsx
   // NewLayout.tsx
   export const NewLayout: React.FC<SlideLayoutProps> = ({ contentBlocks, primaryColor, rtl }) => {
     return (
       <div className={`slide-layout-new ${rtl ? 'rtl' : 'ltr'}`}>
         {/* Render contentBlocks with your layout logic */}
       </div>
     );
   };
   ```

2. Register the layout in `layouts/index.ts`:
   ```ts
   export const LAYOUT_REGISTRY = {
     "two-column": TwoColumnLayout,
     "quadrant": QuadrantLayout,
     "new-layout": NewLayout, // Add here
     // ...
   };
   ```

3. Update AI layout selection prompt in `lib/aiLayoutSelector.ts` to include the new layout type.

4. Add visual regression test in `tests/visual/slideLayouts.spec.ts`.

## Testing Slide Rendering

1. Run unit tests:
   ```bash
   npm test -- aiLayoutSelector.test.ts
   ```

2. Run visual regression tests:
   ```bash
   npm run test:visual
   ```

3. Manual testing:
   - Generate a deck with varied content types (features, KPIs, goals, challenges)
   - Verify each slide uses a distinct layout (no two consecutive slides with same layout unless content demands it)
   - Verify no slide contains solid text blocks (all content in cards/badges/sections)
   - Export to PDF and PPTX; verify 16:9 dimensions and visual fidelity

## Debugging AI Layout Selection

- Check OpenRouter API logs for layout selection calls
- Verify fallback logic triggers if AI call fails
- Test with content that should trigger each layout type (e.g., 4 items → quadrant, 8 items → card-grid)
```

### Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh cursor-agent` to add:
- pptxgenjs (PowerPoint export)
- jsPDF (PDF export)
- Lucide/Heroicons (icon library)
- AI layout selection patterns (OpenRouter structured output)

---

## Phase 2: Tasks

**NOT CREATED BY THIS COMMAND**. Run `/speckit.tasks` after this plan is complete.

---

## Completion Report

**Branch**: `5-slide-gamma-presentation-audit`
**Plan File**: `.specify/memory/specs/5-slide-gamma-presentation-audit/plan.md`

**Next Steps**:
1. Review this plan
2. Run `/speckit.tasks` to generate task breakdown
3. Begin Phase 0 research (7 research tasks documented above)

**Artifacts to Generate**:
- Phase 0: `research.md` (7 research areas)
- Phase 1: `data-model.md` (4 entities), `contracts/` (2 contracts), `quickstart.md`
- Phase 2: `tasks.md` (via `/speckit.tasks`)
