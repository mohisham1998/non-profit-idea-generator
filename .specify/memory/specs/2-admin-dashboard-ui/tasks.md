# Tasks — Admin Dashboard UI

**Feature**: Admin Dashboard UI
**Sprint / Milestone**: Milestone 3 (Administration)
**Generated**: 2026-02-28

---

## Legend

- `[ ]` To do
- `[/]` In progress
- `[x]` Done
- **Priority**: P0 (blocker) | P1 (important) | P2 (nice-to-have)
- **Type**: `[BE]` Backend | `[FE]` Frontend | `[AI]` AI integration | `[DB]` Database | `[TEST]` Testing | `[INFRA]` Infrastructure

---

## Task List

### Phase 1: Setup & Foundation

- [x] T001 [DB] Map User/Tenant Profile schema in PostgreSQL with `primaryColor`, `logoUrl`, `logoPlacement`, `selectedModelId`, `openRouterApiKey`, and `quotaLimitUsd`
- [x] T002 [DB] Map Slide Deck schema in PostgreSQL with `title`, `creationDate`, `slideCount`, `thumbnailUrl`, and `tenantId`
- [x] T003 [INFRA] Setup Tailwind CSS RTL configuration, CSS variables for theming, and Cairo font family in `tailwind.config.js` and `src/index.css`
- [x] T004 [BE] Setup base API router structure for `/api/decks`, `/api/models`, `/api/branding`, `/api/usage` in `server/routes/api.js`
- [x] T005 [P] [BE] Create OpenRouter API client utility for reuse across controllers in `server/utils/openrouter.js`

### Phase 2: US-7 (RTL Core Layout & Navigation)
*Goal: Provide the overall Arabic, RTL-only dashboard shell with an animated sidebar.*

- [x] T006 [FE] [US7] Create global Zustand state store for theme and user profile data in `src/store/useStore.ts`
- [x] T007 [FE] [US7] Create `src/layouts/AdminLayout.tsx` utilizing Framer Motion for the animated sidebar and enforcing `dir="rtl"`

### Phase 3: UI Refactoring (Modern Dashboard Components)
*Goal: Implement modern admin dashboard UI components matching reference images.*

- [x] T008 [INFRA] Create design system tokens in `src/styles/tokens.css`:
  - Spacing scale (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px)
  - Shadow depths (sm, md, lg, xl)
  - Border radius (xs, sm, md, lg, xl, full)
  - Color palette (primary, secondary, success, warning, danger with shades)
  - Typography scale (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
- [x] T009 [FE] Update `AdminLayout.tsx` sidebar with:
  - Smooth collapse/expand animations
  - Icon-only collapsed state
  - Active page highlighting
  - Nested menu support
  - User profile section at bottom
- [x] T010 [FE] Create reusable `StatCard.tsx` component with:
  - Icon, title, value, change percentage
  - Mini chart support (pie, line, bar)
  - Hover lift effect
  - Color theme variants
- [x] T011 [FE] Create `AreaChart.tsx` component with:
  - Recharts integration for dual-axis area charts
  - Gradient fills under lines
  - Interactive tooltips
  - Legend with RTL support
  - Responsive sizing
- [x] T012 [FE] Create `DataTable.tsx` component with:
  - Generic column configuration
  - Status badge renderer
  - Action buttons per row
  - Sortable columns
  - Pagination controls
  - Empty state handling

### Phase 4: US-1 (Dashboard Analytical Overview)
*Goal: Display a polished summary view immediately upon login with modern UI.*

- [x] T013 [BE] [US1] Create `/api/usage/overview` endpoint (getUsageOverview tRPC) to serve summary stats, recent actions, usage trend, and recent decks
- [x] T014 [FE] [US1] Create `src/pages/DashboardHome.tsx` with:
  - Replace placeholder content with StatCard grid
  - Add AreaChart for trends
  - Add DataTable for recent projects
  - Implement responsive breakpoints (grid cols 1/2/4 for sm/lg)

### Phase 5: US-2 (Deck Library Management)
*Goal: Enable the admin to browse, open, rename, duplicate, and delete their generated decks.*

- [x] T015 [BE] [US2] Implement CRUD endpoints (`GET/POST/PUT/DELETE /api/decks`) with duplication logic in `server/controllers/deckController.js`
- [x] T016 [P] [FE] [US2] Create `src/pages/DeckLibrary.tsx` with modern data table layout:
  - Table columns: Code, Title, Slides, Status, Created Date, Actions
  - Status badges with color coding (Draft=gray, Published=green, Archived=orange)
  - Row action buttons (Edit, View, Duplicate, Delete) with icons
  - Hover effects on table rows
  - Pagination controls
  - Empty state illustration when no decks exist
- [x] T017 [FE] [US2] Add search input and filter controls (by status, date range) to `DeckLibrary.tsx`

### Phase 6: US-3 (AI Model Selection via OpenRouter)
*Goal: Allow selection of the specific generative AI model from a live OpenRouter list.*

- [x] T018 [BE] [US3] Implement `/api/models` endpoint fetching and locally caching models from OpenRouter in `server/controllers/modelController.js`
- [x] T019 [P] [FE] [US3] Create `src/pages/ModelSettings.tsx` to fetch and display the grouped model list
- [x] T020 [FE] [US3] Implement model selection persistence in global state and handle fetch failures with the warning banner in `src/pages/ModelSettings.tsx`

### Phase 7: US-4 & US-5 (Branding Customization)
*Goal: Let admins upload logos and pick primary thematic colors.*

- [x] T021 [BE] [US4] Implement `/api/branding` endpoint handling 2MB max image uploads and color/placement updates in `server/controllers/brandingController.js`
- [x] T022 [P] [FE] [US4] Create `src/pages/BrandingSettings.tsx` with logo upload UI and placement radio toggles (Cover, Footer, Hidden)
- [x] T023 [FE] [US4] Implement primary color picker (presets + hex) that dynamically updates CSS variables in `src/pages/BrandingSettings.tsx`

### Phase 8: US-6 (Usage & Quota Tracking)
*Goal: Display accurate, USD-based token usage parsed directly from OpenRouter APIs.*

- [x] T024 [BE] [US6] Implement `/api/usage` endpoint retrieving live bill/token cost from OpenRouter via tenant key in `server/controllers/usageController.js`
- [x] T025 [P] [FE] [US6] Create `src/pages/UsageQuota.tsx` displaying fetched usage cost vs $50.00 limits with an animated progress bar

### Phase 9: Polish, Testing & Cross-Cutting

- [x] T026 [TEST] Write unit tests ensuring quota cost calculations match plan limits in `server/controllers/usageController.test.js`
- [x] T027 [TEST] Write component tests validating that fallback warning banners render without network in `src/pages/ModelSettings.test.tsx`
- [ ] T028 [FE] Verify ARIA labels in Arabic and assess contrast ratios for dynamically selected primary colors across the app
- [ ] T029 [TEST] Test responsive layouts on mobile, tablet, and desktop viewports
- [ ] T030 [TEST] Verify all animations perform smoothly (60fps) and respect prefers-reduced-motion

---

## Dependency Graph

```
[Phase 1 Setup] T001, T002, T003, T004, T005
       ↓
[Phase 2 Frame] T006, T007
       ↓
[Phase 3 UI Refactor] T008, T009, T010, T011, T012
       ↓
[Phase 4 Home]  T013, T014
       ↓
[Phase 5 Decks] T015, T016, T017
       ↓
[Phase 6 Model] T018, T019, T020
       ↓
[Phase 7 Brand] T021, T022, T023
       ↓
[Phase 8 Usage] T024, T025
       ↓
[Phase 9 Test]  T026, T027, T028, T029, T030
```

---

## Notes

- **Parallel Execution**: Frontend and Backend tasks labeled `[P]` within User Story phases can safely be worked on by separate workflows or engineers concurrently.
- All tasks must adhere to purely `rtl` direction logic and utilize the Cairo font family as stated in FR-1, 2, and 3.
