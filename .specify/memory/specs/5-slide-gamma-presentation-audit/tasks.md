# Tasks: Slide Output Gamma Presentation Audit

**Input**: Design documents from `.specify/memory/specs/5-slide-gamma-presentation-audit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Consolidated into 10 tasks for easy traceability. Each task maps to one or more user stories (US1–US4).

**Format**: `[ID] [P?] [Story] Description with file path`

---

## Phase 1: Setup

- [x] T001 Install pptxgenjs and @digicole/pdfmake-rtl in client/package.json; add type definitions if needed

---

## Phase 2: Content Blocks & Layouts (US2, US3, US4)

- [x] T002 [P] [US2] [US4] Create content block components (ContentCard, NumberedBadge, SectionHeader, StatBlock) and BLOCK_REGISTRY in client/src/components/SlideBuilder/blocks/

- [x] T003 [P] [US1] [US3] Create layout components (TwoColumnLayout, QuadrantLayout, CardGridLayout, FlowLayout, StatBlocksLayout, NumberedLayout) and LAYOUT_REGISTRY in client/src/components/SlideBuilder/layouts/ — use 16:9 dimensions, RTL support, primary color for badges/accents

---

## Phase 3: AI & Layout Engine (US3, US4)

- [x] T004 [US3] [US4] Implement aiLayoutSelector.ts (OpenRouter structured output + rule-based fallback) and iconSelector.ts (keyword-to-Lucide mapping) in client/src/lib/

- [x] T005 [US2] [US4] Implement slideLayoutEngine.ts and update convertToSlides.ts — content splitting (>800 chars or >8 blocks), block structure (no solid text), layout assignment per slide in client/src/lib/

---

## Phase 4: Slide Rendering & Export (US1, US2)

- [x] T006 [US1] [US2] Update SlideCard.tsx — 16:9 dimensions, LAYOUT_REGISTRY rendering, primary color from branding, RTL in client/src/components/SlideBuilder/

- [x] T007 [US1] Implement SlideExporter component and useSlideExport hook for PDF (jsPDF+jspdf-rtl) and PPTX (pptxgenjs) with 16:9, RTL in client/src/

---

## Phase 5: Integration & Polish

- [x] T008 [US4] Wire primary color from Supabase user branding to SlideCard and all layout/block components; ensure badges, headers, accents use it in client/

- [x] T009 Run quickstart.md validation — generate deck, verify varied layouts, no solid text, 16:9 export, RTL; fix any gaps

- [x] T010 Documentation: Update README or feature docs with Gamma slide output changes; add quickstart reference in client/

---

## Dependencies & Execution Order

```
T001 (Setup)
  ├── T002 (Content blocks) [P]
  ├── T003 (Layouts)       [P]
  └── T004 (AI + icons)    ← depends on T001

T002, T003 complete → T005 (Layout engine + convertToSlides)
T004 complete       → T005
T005 complete       → T006 (SlideCard update)
T006 complete       → T007 (Export)

T006, T007 complete → T008 (Primary color wiring)
T008 complete       → T009 (Validation)
T009 complete       → T010 (Docs)
```

**Parallel opportunities**: T002 and T003 can run in parallel after T001.

---

## Implementation Strategy

**MVP (Tasks T001–T007)**: Setup → Blocks + Layouts → AI + Engine → SlideCard + Export. Delivers Gamma-quality slides with AI layout selection, no solid text, 16:9 dimensions, PDF/PPTX export.

**Polish (T008–T010)**: Primary color branding, validation, docs.

---

## Task Count Summary

| Phase     | Tasks | User Stories |
|-----------|-------|--------------|
| Setup     | 1     | —            |
| Blocks & Layouts | 2 | US1, US2, US3, US4 |
| AI & Engine | 2  | US2, US3, US4 |
| Rendering & Export | 2 | US1, US2 |
| Integration & Polish | 3 | US4 + cross-cutting |
| **Total** | **10** | **US1–US4** |

**Independent Test per Story**:
- **US1**: Generate deck → slides use 16:9, export PDF/PPTX correct
- **US2**: Generate deck with features/goals → each item in card/badge, no solid text
- **US3**: Generate deck → at least 3 layout types used (two-column, cards, flow, etc.)
- **US4**: Headers, key terms, icons visible; primary color on badges/accents; RTL works
