# Tasks: Dashboard UI & Gamma Consistency

**Input**: Design documents from `specs/4-dashboard-ui-gamma-consistency/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Not explicitly requested in spec; no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `client/src/` for React components, pages, lib
- Paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Validate environment and design system readiness

- [x] T001 Validate design tokens and `--primary` CSS variable exist in `client/src/styles/tokens.css`
- [x] T002 [P] Confirm `client/index.css` and `.quota-progress` use `--primary`; document any fixes needed
- [x] T003 [P] Audit `client/src/pages/BrandingSettings.tsx` to ensure `--primary` is set from user selection; orange remains as preset option

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure design system is canonical before UI updates

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Update `client/src/styles/tokens.css` so `--primary` is the canonical accent; ensure no new orange tokens; warning can stay as amber
- [x] T005 Confirm `client/index.css` uses `--primary` for progress bars and accent elements
- [x] T006 [P] Verify `client/src/pages/BrandingSettings.tsx` keeps orange as preset option and sets `--primary` from selection

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Consistent Progress Experience (Priority: P1) 🎯 MVP

**Goal**: Progress screen (جاري توليد المشروع) matches dashboard styling: white/light card, primary accents, no leftover orange.

**Independent Test**: Start project generation; verify progress card matches dashboard (colors, card style, typography, primary accents).

### Implementation for User Story 1

- [x] T007 [US1] Replace `purple-*` and `indigo-*` with `primary` / `cyan` in `client/src/components/ProgressIndicator.tsx`
- [x] T008 [US1] Apply card styling consistent with DashboardHome and UsageQuota (white/light bg, subtle border, shadow-md) in `client/src/components/ProgressIndicator.tsx`
- [x] T009 [US1] Use `bg-primary`, `text-primary`, `border-primary` for progress bars, active stage, and icon container in `client/src/components/ProgressIndicator.tsx`
- [x] T010 [US1] Ensure hover states on progress screen use primary (not orange) in `client/src/components/ProgressIndicator.tsx`

**Checkpoint**: User Story 1 complete — progress screen matches dashboard styling

---

## Phase 4: User Story 2 — Replace Leftover Old-Theme Orange (Priority: P1)

**Goal**: All screens use new primary/dashboard accent; no leftover orange from old theme (including hover states).

**Independent Test**: Navigate all main screens; hover over buttons, links, cards; confirm new primary used, not leftover orange.

### Implementation for User Story 2

- [x] T011 [P] [US2] Replace `from-orange-*`, `to-orange-*`, `text-orange-*`, `border-orange-*` with `primary` or `cyan` in `client/src/pages/Login.tsx`
- [x] T012 [P] [US2] Replace `from-amber-*`, `to-orange-*` gradients with `primary`/`cyan` in `client/src/pages/AdminDashboard.tsx`
- [x] T013 [P] [US2] Replace orange gradients, progress bars, risk indicators with `primary` or semantic colors in `client/src/pages/ProjectDashboard.tsx`
- [x] T014 [P] [US2] Replace orange card headers, borders, gradients with `primary` in `client/src/pages/ProgramEvaluation.tsx`
- [x] T015 [P] [US2] Change Archived badge from `bg-orange-*` to `bg-amber-*` (semantic) or `primary` in `client/src/pages/DeckLibrary.tsx`
- [x] T016 [P] [US2] Replace orange gradient backgrounds with `primary`/cyan in `client/src/pages/ColorSettings.tsx` (ColorSettings uses its own palette; defaults updated)
- [x] T017 [P] [US2] Remove or repurpose `orange` theme; use `primary` for accent variant in `client/src/components/StatCard.tsx` (orange kept as user option per plan)
- [x] T018 [P] [US2] Replace `amber-400` decorative accents with `primary` in `client/src/components/TemplateSelector.tsx`
- [x] T019 [P] [US2] Replace `from-red-500 to-orange-500` with `primary` gradient in `client/src/components/ExportPDFButton.tsx`
- [x] T020 [P] [US2] Replace `#f97316` with primary variable in `client/src/components/Background3D.tsx`
- [x] T021 [US2] Replace hardcoded `#f97316` with `var(--primary)` or equivalent in `client/src/lib/pdfGenerator.ts`
- [x] T022 [US2] Replace orange in template gradients with primary in `client/src/lib/templates.ts` (creative template keeps intentional palette)
- [x] T023 [US2] Change default `cover` and `designThinking` from `orange` to `primary` in `client/src/lib/convertToSlides.ts`
- [x] T024 [US2] Audit hover states across all updated pages; ensure they use primary, not orange

**Checkpoint**: User Story 2 complete — no leftover old-theme orange; semantic amber OK for warnings

---

## Phase 5: User Story 3 — Gamma-Style Output Slides (Priority: P2)

**Goal**: Output slides match Gamma Slides Redesign spec (layouts, typography, spacing, gradients); use primary instead of orange.

**Independent Test**: Generate a full deck; compare against Gamma spec (Cover, KPI, Budget, SWOT, Custom); verify layouts and styling.

### Implementation for User Story 3

- [x] T025 [P] [US3] Update `idea` card style from `from-amber-500 to-orange-600` to primary gradient in `client/src/components/SlideBuilder/SlideCard.tsx`
- [x] T026 [US3] Ensure `orange`/`amber` accent keys use primary when applied as layout accent in `client/src/components/SlideBuilder/SlideCard.tsx`
- [x] T027 [US3] Keep `orange` and `amber` as user-selectable in `client/src/components/SlideBuilder/StylePanel.tsx`; ensure default/fallback uses primary
- [x] T028 [US3] Verify SlideCard layouts, typography, spacing, backgrounds match Gamma spec in `client/src/components/SlideBuilder/`
- [x] T029 [US3] Use `var(--primary)` for section headers and accents; remove hardcoded orange in `client/src/lib/pdfGenerator.ts`
- [x] T030 [US3] Update template gradients to use primary in `client/src/lib/templates.ts` (creative template keeps intentional palette per plan)
- [x] T031 [US3] Verify exported PDF and PowerPoint preserve Gamma-style design and primary accents

**Checkpoint**: User Story 3 complete — slides match Gamma spec; primary used throughout

---

## Phase 6: User Story 4 — Varied, Formatted Slide Layouts (Priority: P1)

**Goal**: System generates slides with many different layouts (cards, grids, stats, numbered sections); no solid text blocks; suitable for Saudi nonprofit organizational plans.

**Independent Test**: Generate nonprofit plan deck; verify varied layouts and that no slide is a single dense text block; confirm RTL-ready and professional style.

### Implementation for User Story 4

- [x] T032 [US4] Add layout mapping logic in `client/src/lib/convertToSlides.ts` to map content types to layout variants (card grid, numbered sections, stat blocks, icon lists, KPI blocks)
- [x] T033 [US4] Implement or extend card grid layout for challenge/issue content in slide generation (e.g., 2x3 cards with icons and bullets)
- [x] T034 [US4] Implement or extend numbered section layout for list/process content (e.g., purple/lavender numbered headers with bullet points)
- [x] T035 [US4] Implement or extend stat/KPI block layout for metrics (e.g., percentage blocks with headings)
- [x] T036 [US4] Ensure no slide type outputs a single block of solid text; each slide uses a formatted layout
- [x] T037 [US4] Apply Saudi nonprofit styling: professional, structured, RTL-ready; appropriate for donors, boards, government in `client/src/lib/convertToSlides.ts` and slide templates
- [x] T038 [US4] Validate varied layouts in SlideBuilder and PDF/PowerPoint export

**Checkpoint**: User Story 4 complete — varied layouts; no solid text; Saudi nonprofit appropriate

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and consistency pass

- [x] T039 [P] Run visual audit: navigate all screens; confirm no leftover orange where primary should appear
- [x] T040 [P] Verify hover states across app use primary
- [x] T041 Verify Cairo font and RTL layout preserved across all updated UI surfaces
- [x] T042 Run full generation flow; export to PDF and PowerPoint; confirm Gamma-style, varied layouts, and primary accents preserved
- [x] T043 Optional: Add CSS lint or grep rule to flag `orange-500`, `orange-600`, `#f97316`, `#ea580c` in non-exception files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US2)**: Depends on Phase 2
- **Phase 5 (US3)**: Depends on Phase 2; may run after or in parallel with Phase 4
- **Phase 6 (US4)**: Depends on Phase 2; benefits from Phase 5 (slide pipeline); can start after Phase 5 or in parallel with late Phase 5 tasks
- **Phase 7 (Polish)**: Depends on Phases 3–6 completion

### User Story Dependencies

- **US1 (Progress)**: No dependency on US2, US3, US4
- **US2 (Orange)**: No dependency on US1, US3, US4
- **US3 (Gamma)**: No dependency on US1, US2; shares files with US4 (convertToSlides, pdfGenerator)
- **US4 (Varied layouts)**: Touches convertToSlides; best done after or alongside US3

### Parallel Opportunities

- **Phase 1**: T002, T003 can run in parallel
- **Phase 2**: T006 can run in parallel
- **Phase 4**: T011–T020 can run in parallel (different files)
- **Phase 5**: T025 can run early in parallel with Phase 4
- **Phase 7**: T039, T040 can run in parallel

---

## Parallel Example: User Story 2 (Orange Replacement)

```bash
# Launch all page updates in parallel:
Task T011: Login.tsx
Task T012: AdminDashboard.tsx
Task T013: ProjectDashboard.tsx
Task T014: ProgramEvaluation.tsx
Task T015: DeckLibrary.tsx
Task T016: ColorSettings.tsx
Task T017: StatCard.tsx
Task T018: TemplateSelector.tsx
Task T019: ExportPDFButton.tsx
Task T020: Background3D.tsx
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 + 4)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Progress)
4. Complete Phase 4: US2 (Orange)
5. Complete Phase 6: US4 (Varied layouts)
6. **STOP and VALIDATE**: Test progress, orange removal, slide layouts
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → Progress matches dashboard
3. US2 → No leftover orange
4. US4 → Varied slide layouts (Saudi nonprofit style)
5. US3 → Gamma spec alignment
6. Polish → Full verification

### Suggested Order for Single Developer

1. Phases 1–2
2. Phase 3 (US1)
3. Phase 4 (US2) — parallelize T011–T020
4. Phase 5 (US3)
5. Phase 6 (US4)
6. Phase 7 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Semantic exceptions: ModelSettings, UsageQuota (amber for warnings); SWOT Threats (amber); EditableBudget, ValueAddAnalysis (amber OK)
- BrandingSettings: Keep orange as user-selectable preset
- Cairo font and RTL must be preserved throughout
