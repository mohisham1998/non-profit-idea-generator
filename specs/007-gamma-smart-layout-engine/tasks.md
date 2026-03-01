# Tasks: Gamma-Inspired Smart Layout Engine

**Input**: Design documents from `/specs/007-gamma-smart-layout-engine/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in spec. Test tasks omitted.

**Organization**: Tasks grouped by user story (US1-US9) for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in all task descriptions

## Path Conventions (from plan.md)

- **Frontend**: `client/src/`
- **Backend**: `server/`
- **Database**: `drizzle/`
- **Assets**: `client/src/assets/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, types, and font assets

- [x] T001 Create layout types file in `client/src/lib/types/layouts.ts` with LayoutDefinition, LayoutFamily, ContentPattern, ContentAnalysis, LayoutConfig, OverflowStrategy interfaces
- [x] T002 [P] Add Cairo font files (Regular, Bold, SemiBold) to `client/src/assets/fonts/`
- [x] T003 [P] Create font loader utility for jsPDF in `client/src/lib/fontLoader.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create layout registry with all 45 layout definitions in `client/src/lib/layoutRegistry.ts`
- [x] T005 [P] Create content analyzer with parsing and pattern detection in `client/src/lib/contentAnalyzer.ts`
- [x] T006 [P] Create layout selector with scoring algorithm in `client/src/lib/layoutSelector.ts`
- [x] T007 Add `layout_selection_logs` table schema in `drizzle/schema.ts`
- [x] T008 Add `export_jobs` table schema in `drizzle/schema.ts`
- [x] T009 Generate and apply database migration in `drizzle/migrations/`
- [x] T010 [P] Create layout logging tRPC router in `server/layoutLogsRouter.ts`
- [x] T011 [P] Create export jobs tRPC router in `server/exportRouter.ts`
- [x] T012 Register new routers in `server/routers.ts`

**Checkpoint**: Foundation ready - layout registry, content analyzer, selector, and database tables exist

---

## Phase 3: User Story 1 - Generate Visually-Designed Slides (Priority: P1) 🎯 MVP

**Goal**: Transform plain text slides into presentation-grade slides using smart layout selection from 45-layout registry

**Independent Test**: Generate a slide deck and verify each slide uses a registered layout template with proper visual hierarchy

### Layout Components (45 total)

#### C1 — Cover & Section (4 layouts)

- [x] T013 [P] [US1] Create CoverHero layout component in `client/src/components/SlideBuilder/layouts/CoverHero.tsx`
- [x] T014 [P] [US1] Create CoverSplit layout component in `client/src/components/SlideBuilder/layouts/CoverSplit.tsx`
- [x] T015 [P] [US1] Create SectionDivider layout component in `client/src/components/SlideBuilder/layouts/SectionDivider.tsx`
- [x] T016 [P] [US1] Create AgendaOutline layout component in `client/src/components/SlideBuilder/layouts/AgendaOutline.tsx`

#### C2 — Text + Media (5 layouts)

- [x] T017 [P] [US1] Create Split5050 layout component in `client/src/components/SlideBuilder/layouts/Split5050.tsx`
- [x] T018 [P] [US1] Create Split3070 layout component in `client/src/components/SlideBuilder/layouts/Split3070.tsx`
- [x] T019 [P] [US1] Create TextOverlay layout component in `client/src/components/SlideBuilder/layouts/TextOverlay.tsx`
- [x] T020 [P] [US1] Create GalleryCaptions layout component in `client/src/components/SlideBuilder/layouts/GalleryCaptions.tsx`
- [x] T021 [P] [US1] Create VisualCallout layout component in `client/src/components/SlideBuilder/layouts/VisualCallout.tsx`

#### C3 — Cards / Features (6 layouts)

- [x] T022 [P] [US1] Create FeatureCards3 layout component in `client/src/components/SlideBuilder/layouts/FeatureCards3.tsx`
- [x] T023 [P] [US1] Create FeatureCards4 layout component in `client/src/components/SlideBuilder/layouts/FeatureCards4.tsx`
- [x] T024 [P] [US1] Create IconCards3 layout component in `client/src/components/SlideBuilder/layouts/IconCards3.tsx`
- [x] T025 [P] [US1] Create IconCards6 layout component in `client/src/components/SlideBuilder/layouts/IconCards6.tsx`
- [x] T026 [P] [US1] Create ProblemSolution layout component in `client/src/components/SlideBuilder/layouts/ProblemSolution.tsx`
- [x] T027 [P] [US1] Create BenefitsGrid layout component in `client/src/components/SlideBuilder/layouts/BenefitsGrid.tsx`

#### C4 — KPIs / Stats (6 layouts)

- [x] T028 [P] [US1] Create StatBlocks3 layout component in `client/src/components/SlideBuilder/layouts/StatBlocks3.tsx`
- [x] T029 [P] [US1] Create StatBlocks4 layout component in `client/src/components/SlideBuilder/layouts/StatBlocks4.tsx`
- [x] T030 [P] [US1] Create KpiTable layout component in `client/src/components/SlideBuilder/layouts/KpiTable.tsx`
- [x] T031 [P] [US1] Create KpiListIcons layout component in `client/src/components/SlideBuilder/layouts/KpiListIcons.tsx`
- [x] T032 [P] [US1] Create ProgressBars layout component in `client/src/components/SlideBuilder/layouts/ProgressBars.tsx`
- [x] T033 [P] [US1] Create BigNumberBreakdown layout component in `client/src/components/SlideBuilder/layouts/BigNumberBreakdown.tsx`

#### C5 — Comparison & Decision (5 layouts)

- [x] T034 [P] [US1] Create Compare2Col layout component in `client/src/components/SlideBuilder/layouts/Compare2Col.tsx`
- [x] T035 [P] [US1] Create Compare3Col layout component in `client/src/components/SlideBuilder/layouts/Compare3Col.tsx`
- [x] T036 [P] [US1] Create ProsCons layout component in `client/src/components/SlideBuilder/layouts/ProsCons.tsx`
- [x] T037 [P] [US1] Create BeforeAfter layout component in `client/src/components/SlideBuilder/layouts/BeforeAfter.tsx`
- [x] T038 [P] [US1] Create OptionsTable layout component in `client/src/components/SlideBuilder/layouts/OptionsTable.tsx`

#### C6 — Process / Journey / Timeline (6 layouts)

- [x] T039 [P] [US1] Create StepsHorizontal layout component in `client/src/components/SlideBuilder/layouts/StepsHorizontal.tsx`
- [x] T040 [P] [US1] Create StepsVertical layout component in `client/src/components/SlideBuilder/layouts/StepsVertical.tsx`
- [x] T041 [P] [US1] Create TimelineHorizontal layout component in `client/src/components/SlideBuilder/layouts/TimelineHorizontal.tsx`
- [x] T042 [P] [US1] Create TimelineVertical layout component in `client/src/components/SlideBuilder/layouts/TimelineVertical.tsx`
- [x] T043 [P] [US1] Create PhasesDeliverables layout component in `client/src/components/SlideBuilder/layouts/PhasesDeliverables.tsx`
- [x] T044 [P] [US1] Create FunnelJourney layout component in `client/src/components/SlideBuilder/layouts/FunnelJourney.tsx`

#### C7 — Frameworks / Matrices (4 layouts)

- [x] T045 [P] [US1] Create SwotGrid layout component in `client/src/components/SlideBuilder/layouts/SwotGrid.tsx`
- [x] T046 [P] [US1] Create Matrix2x2 layout component in `client/src/components/SlideBuilder/layouts/Matrix2x2.tsx`
- [x] T047 [P] [US1] Create Pillars3 layout component in `client/src/components/SlideBuilder/layouts/Pillars3.tsx`
- [x] T048 [P] [US1] Create Pillars4 layout component in `client/src/components/SlideBuilder/layouts/Pillars4.tsx`

#### C8 — Budget / Allocation (4 layouts)

- [x] T049 [P] [US1] Create BudgetCategoryBars layout component in `client/src/components/SlideBuilder/layouts/BudgetCategoryBars.tsx`
- [x] T050 [P] [US1] Create BudgetTable layout component in `client/src/components/SlideBuilder/layouts/BudgetTable.tsx`
- [x] T051 [P] [US1] Create AllocationVisual layout component in `client/src/components/SlideBuilder/layouts/AllocationVisual.tsx`
- [x] T052 [P] [US1] Create CostBreakdownCards layout component in `client/src/components/SlideBuilder/layouts/CostBreakdownCards.tsx`

#### C9 — Lists / Content Density (5 layouts)

- [x] T053 [P] [US1] Create BulletHierarchy layout component in `client/src/components/SlideBuilder/layouts/BulletHierarchy.tsx`
- [x] T054 [P] [US1] Create NumberedBadges layout component in `client/src/components/SlideBuilder/layouts/NumberedBadges.tsx`
- [x] T055 [P] [US1] Create ChecklistIcons layout component in `client/src/components/SlideBuilder/layouts/ChecklistIcons.tsx`
- [x] T056 [P] [US1] Create QuoteTestimonial layout component in `client/src/components/SlideBuilder/layouts/QuoteTestimonial.tsx`
- [x] T057 [P] [US1] Create CallToAction layout component in `client/src/components/SlideBuilder/layouts/CallToAction.tsx`

#### Layout Index & Integration

- [x] T058 [US1] Create layout components index file in `client/src/components/SlideBuilder/layouts/index.ts`
- [x] T059 [US1] Update slideStore with layoutId, contentAnalysis, overflowStrategy fields in `client/src/stores/slideStore.ts`
- [x] T060 [US1] Integrate layout selector into slide generation flow in `client/src/lib/aiLayoutSelector.ts`
- [x] T061 [US1] Update SlideCard to render using selected layout component in `client/src/components/SlideBuilder/SlideCard.tsx`

**Checkpoint**: User Story 1 complete — slides render with smart layouts from registry

---

## Phase 4: User Story 2 - Reliable Image Rendering (Priority: P1)

**Goal**: Fix image loading issues with retry logic and graceful fallback

**Independent Test**: Add images to slides, verify they render, show placeholder on failure with retry button

- [x] T062 [P] [US2] Create ImagePlaceholder component with retry button in `client/src/components/SlideBuilder/ImagePlaceholder.tsx`
- [x] T063 [P] [US2] Create useImageLoader hook with retry logic (3 attempts, exponential backoff) in `client/src/hooks/useImageLoader.ts`
- [x] T064 [US2] Enhance SlideImage component with retry/fallback logic in `client/src/components/SlideBuilder/SlideImage.tsx`
- [x] T065 [US2] Add image prevalidation before render in `client/src/lib/imageUtils.ts`

**Checkpoint**: User Story 2 complete — images load reliably with fallback UI

---

## Phase 5: User Story 3 - Full Slide Content Without Truncation (Priority: P1)

**Goal**: Implement overflow handling via denser layout, height expansion, or content splitting

**Independent Test**: Generate content-heavy slides (10+ KPIs) and verify all content visible

- [x] T066 [US3] Implement overflow detection in layout selector in `client/src/lib/layoutSelector.ts`
- [x] T067 [US3] Add denser variant lookup (e.g., icon-cards-3 → icon-cards-6) in `client/src/lib/layoutRegistry.ts`
- [x] T068 [US3] Implement height expansion strategy in `client/src/lib/slideLayoutEngine.ts`
- [x] T069 [US3] Implement content splitting with continuation indicator in `client/src/lib/slideLayoutEngine.ts`
- [x] T070 [US3] Enforce 30-slide maximum per deck in `client/src/stores/slideStore.ts`

**Checkpoint**: User Story 3 complete — no truncation, overflow handled gracefully

---

## Phase 6: User Story 4 - Valid PDF Export with Full Styling (Priority: P1)

**Goal**: Fix corrupted PDF export with native jsPDF generation and Cairo font embedding

**Independent Test**: Export styled deck to PDF, open in Adobe Reader/Chrome/Preview without corruption

- [ ] T071 [P] [US4] Create PDF element rendering utilities (text, shape, image, table) in `client/src/lib/pdf/pdfElements.ts`
- [ ] T072 [P] [US4] Create PDF background renderer (solid, gradient, image) in `client/src/lib/pdf/pdfBackground.ts`
- [ ] T073 [US4] Implement PDF mappers for Cover family layouts (4) in `client/src/lib/pdf/mappers/coverMappers.ts`
- [ ] T074 [P] [US4] Implement PDF mappers for Text+Media family layouts (5) in `client/src/lib/pdf/mappers/textMediaMappers.ts`
- [ ] T075 [P] [US4] Implement PDF mappers for Cards family layouts (6) in `client/src/lib/pdf/mappers/cardsMappers.ts`
- [ ] T076 [P] [US4] Implement PDF mappers for KPIs family layouts (6) in `client/src/lib/pdf/mappers/kpisMappers.ts`
- [ ] T077 [P] [US4] Implement PDF mappers for Comparison family layouts (5) in `client/src/lib/pdf/mappers/comparisonMappers.ts`
- [ ] T078 [P] [US4] Implement PDF mappers for Process family layouts (6) in `client/src/lib/pdf/mappers/processMappers.ts`
- [ ] T079 [P] [US4] Implement PDF mappers for Frameworks family layouts (4) in `client/src/lib/pdf/mappers/frameworksMappers.ts`
- [ ] T080 [P] [US4] Implement PDF mappers for Budget family layouts (4) in `client/src/lib/pdf/mappers/budgetMappers.ts`
- [ ] T081 [P] [US4] Implement PDF mappers for Lists family layouts (5) in `client/src/lib/pdf/mappers/listsMappers.ts`
- [ ] T082 [US4] Create main PDF exporter with font registration and RTL support in `client/src/lib/pdfExporter.ts`
- [ ] T083 [US4] Update useSlideExport hook for PDF export in `client/src/hooks/useSlideExport.ts`

**Checkpoint**: User Story 4 complete — PDF exports valid, styled, RTL-correct

---

## Phase 7: User Story 5 - PowerPoint Export with Layout Preservation (Priority: P1)

**Goal**: Replace image-based PPT export with native pptxgenjs element rendering

**Independent Test**: Export styled deck to PPT, open in PowerPoint with editable text and preserved layouts

- [ ] T084 [P] [US5] Create PPTX element rendering utilities (text, shape, image, table) in `client/src/lib/pptx/pptxElements.ts`
- [ ] T085 [P] [US5] Create PPTX background renderer (solid, gradient, image) in `client/src/lib/pptx/pptxBackground.ts`
- [ ] T086 [US5] Implement PPTX mappers for Cover family layouts (4) in `client/src/lib/pptx/mappers/coverMappers.ts`
- [ ] T087 [P] [US5] Implement PPTX mappers for Text+Media family layouts (5) in `client/src/lib/pptx/mappers/textMediaMappers.ts`
- [ ] T088 [P] [US5] Implement PPTX mappers for Cards family layouts (6) in `client/src/lib/pptx/mappers/cardsMappers.ts`
- [ ] T089 [P] [US5] Implement PPTX mappers for KPIs family layouts (6) in `client/src/lib/pptx/mappers/kpisMappers.ts`
- [ ] T090 [P] [US5] Implement PPTX mappers for Comparison family layouts (5) in `client/src/lib/pptx/mappers/comparisonMappers.ts`
- [ ] T091 [P] [US5] Implement PPTX mappers for Process family layouts (6) in `client/src/lib/pptx/mappers/processMappers.ts`
- [ ] T092 [P] [US5] Implement PPTX mappers for Frameworks family layouts (4) in `client/src/lib/pptx/mappers/frameworksMappers.ts`
- [ ] T093 [P] [US5] Implement PPTX mappers for Budget family layouts (4) in `client/src/lib/pptx/mappers/budgetMappers.ts`
- [ ] T094 [P] [US5] Implement PPTX mappers for Lists family layouts (5) in `client/src/lib/pptx/mappers/listsMappers.ts`
- [ ] T095 [US5] Create main PPTX exporter with RTL mode in `client/src/lib/pptxExporter.ts`
- [ ] T096 [US5] Update useSlideExport hook for PPTX export in `client/src/hooks/useSlideExport.ts`

**Checkpoint**: User Story 5 complete — PPT exports with native elements, editable, RTL-correct

---

## Phase 8: User Story 6 - AI Layout Selection with Logging (Priority: P2)

**Goal**: Log all layout selection decisions to database for debugging and optimization

**Independent Test**: Generate slides and verify logs contain slide index, analysis factors, and selected layout ID

- [x] T097 [US6] Implement layout selection logging in selector in `client/src/lib/layoutSelector.ts`
- [x] T098 [US6] Create tRPC mutation to persist layout logs in `server/layoutLogsRouter.ts`
- [x] T099 [US6] Wire logging call from slide generation flow in `client/src/lib/aiLayoutSelector.ts`
- [x] T100 [US6] Add layout logs query endpoint for debugging in `server/layoutLogsRouter.ts`

**Checkpoint**: User Story 6 complete — layout decisions logged to database

---

## Phase 9: User Story 7 - Deck Persistence and Return Access (Priority: P2)

**Goal**: Auto-save generated decks with new layout fields so users can return later

**Independent Test**: Generate deck, close app, return, verify deck accessible with original layouts

- [x] T101 [US7] Update slide_decks save to include layoutId, layoutConfig, overflowStrategy in `client/src/stores/slideStore.ts`
- [x] T102 [US7] Update deck loading to restore layout fields in `client/src/stores/slideStore.ts`
- [x] T103 [US7] Ensure deck list shows thumbnail with correct layout rendering in `client/src/pages/DeckLibrary.tsx`

**Checkpoint**: User Story 7 complete — decks persist with full layout state

---

## Phase 10: User Story 8 - User Profile with Consumption/Quota Display (Priority: P3)

**Goal**: Display usage/consumption metrics in user profile (display only, no enforcement)

**Independent Test**: Access profile and verify consumption metrics displayed

- [x] T104 [US8] Add slide generation count to user stats query in `server/usersRouter.ts`
- [x] T105 [US8] Display consumption metrics in profile UI in `client/src/pages/Profile.tsx`

**Checkpoint**: User Story 8 complete — profile shows consumption metrics

---

## Phase 11: User Story 9 - Model Selection via OpenRouter (Priority: P3)

**Goal**: Allow users to select AI model from available OpenRouter models

**Independent Test**: Access model selection UI, see list of models, select one for generation

- [x] T106 [US9] Create model selector UI component in `client/src/components/ModelSelector.tsx`
- [x] T107 [US9] Integrate model selection into slide generation settings in `client/src/pages/SlideBuilder.tsx`
- [x] T108 [US9] Pass selected model to LLM invocation in `server/_core/llm.ts`

**Checkpoint**: User Story 9 complete — users can select OpenRouter models

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Export job tracking, error handling, and final polish

- [x] T109 [P] Add export progress UI with status updates in `client/src/components/ExportProgress.tsx`
- [x] T110 [P] Add export error handling with retry option in `client/src/hooks/useSlideExport.ts`
- [x] T111 Add smooth UI animations for layout transitions in `client/src/components/SlideBuilder/SlideCard.tsx`
- [x] T112 [P] Code cleanup: remove old html2canvas-based export code in `client/src/lib/slideExportUtils.ts`
- [x] T113 Run quickstart.md validation scenarios
- [x] T114 Final RTL and Cairo font verification across all layouts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-11)**: All depend on Foundational completion
  - US1 (Phase 3): Foundation only
  - US2 (Phase 4): Foundation only (can parallel with US1)
  - US3 (Phase 5): Depends on US1 (needs layouts)
  - US4 (Phase 6): Depends on US1 (needs layouts for PDF mappers)
  - US5 (Phase 7): Depends on US1 (needs layouts for PPTX mappers)
  - US6 (Phase 8): Depends on Foundation (logging infrastructure)
  - US7 (Phase 9): Depends on US1 (needs layout fields in store)
  - US8 (Phase 10): Foundation only
  - US9 (Phase 11): Foundation only
- **Polish (Phase 12)**: Depends on US4, US5 (export stories)

### User Story Independence

| Story | Can Start After | Independent Test |
|-------|-----------------|------------------|
| US1 | Phase 2 (Foundation) | Generate slide → verify layout used |
| US2 | Phase 2 (Foundation) | Add image → verify loads/fallback |
| US3 | US1 | Generate 10+ KPIs → verify no truncation |
| US4 | US1 | Export PDF → open in readers |
| US5 | US1 | Export PPT → open in PowerPoint |
| US6 | Phase 2 (Foundation) | Generate → check database logs |
| US7 | US1 | Save deck → reload → verify layouts |
| US8 | Phase 2 (Foundation) | Check profile → see metrics |
| US9 | Phase 2 (Foundation) | Select model → generate slides |

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
```
T004 (registry) → T005, T006 can parallel
T007, T008 (schema) can parallel
T010, T011 (routers) can parallel
```

**Within Phase 3 (US1 - Layouts)**:
```
All 45 layout components (T013-T057) can run in FULL PARALLEL
```

**Within Phase 6 (US4 - PDF)**:
```
T071, T072 (utilities) can parallel
T073-T081 (family mappers) can parallel after utilities
```

**Within Phase 7 (US5 - PPTX)**:
```
T084, T085 (utilities) can parallel
T086-T094 (family mappers) can parallel after utilities
```

**Cross-Story Parallel**:
```
US2 can parallel with US1 (different files)
US6, US8, US9 can parallel (independent of layout rendering)
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Smart Layouts)
4. Complete Phase 4: User Story 2 (Image Reliability)
5. **STOP and VALIDATE**: Generate slides, verify layouts and images work
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Layouts) → Slides render with smart layouts ✓
3. US2 (Images) → Images load reliably ✓
4. US3 (Overflow) → No truncation ✓
5. US4 (PDF) → PDF export works ✓
6. US5 (PPT) → PPT export works ✓
7. US6-9 → Nice-to-have features ✓

### Suggested MVP Scope

**MVP = US1 + US2** (Phases 1-4)
- Smart layout selection working
- Images loading reliably
- ~70 tasks (T001-T065)

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 114 |
| **Phase 1 (Setup)** | 3 tasks |
| **Phase 2 (Foundational)** | 9 tasks |
| **US1 (Smart Layouts)** | 49 tasks |
| **US2 (Image Reliability)** | 4 tasks |
| **US3 (No Truncation)** | 5 tasks |
| **US4 (PDF Export)** | 13 tasks |
| **US5 (PPT Export)** | 13 tasks |
| **US6 (Logging)** | 4 tasks |
| **US7 (Persistence)** | 3 tasks |
| **US8 (Quota Display)** | 2 tasks |
| **US9 (Model Selection)** | 3 tasks |
| **Polish** | 6 tasks |
| **Parallel Opportunities** | 80+ tasks (70%) |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- 45 layout components can be implemented in full parallel
- Export mappers (PDF/PPTX) organized by layout family for parallel work
