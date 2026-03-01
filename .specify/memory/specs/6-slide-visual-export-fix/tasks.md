# Tasks: Slide Visual Export Fix

**Input**: Design documents from `/specs/6-slide-visual-export-fix/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [x] T001 Install html2canvas dependency in `client/package.json`
- [x] T002 [P] Install openai SDK in `server/package.json`
- [x] T003 [P] Verify OpenRouter API key in `.env` file

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema

- [x] T004 Add `generated_images` table to `drizzle/schema.ts` with all columns (id, user_id, slide_deck_id, slide_id, content_type, prompt, content_hash, image_data, file_size, width, height, generation_status, error_message, created_at, updated_at)
- [x] T005 Add `imageStorageUsedBytes` and `imageStorageLimitBytes` columns to `users` table in `drizzle/schema.ts`
- [x] T006 Export TypeScript types for `GeneratedImage` and `InsertGeneratedImage` in `drizzle/schema.ts`
- [ ] T007 Generate database migration with `npm run db:generate` (N/A: project uses db:push)
- [ ] T008 Apply database migration with `npm run db:migrate` (run `pnpm db:push` - interactive)

### Backend Services

- [x] T009 [P] Create `server/services/imageGeneration.ts` with `generateImage()`, `constructPrompt()`, and `hashPrompt()` functions
- [x] T010 [P] Create `server/services/imageStorage.ts` with `storeImage()`, `getImageById()`, `getUserQuota()`, and `deleteImage()` functions
- [x] T011 Create `server/imagesRouter.ts` with tRPC router (generate, getById, getQuota procedures)
- [x] T012 Wire `imagesRouter` into main tRPC router in `server/routers.ts`

### Frontend State & Types

- [x] T013 [P] Add `SlideImage` interface to `client/src/stores/slideStore.ts` (id, url, status, position, size)
- [x] T014 [P] Add `images` and `visualReady` fields to `SlideCard` interface in `client/src/stores/slideStore.ts`
- [x] T015 [P] Add `imageGenerationQueue` and `imageLoadingStatus` state to slideStore
- [x] T016 [P] Add `requestImageGeneration()` and `updateImageStatus()` actions to slideStore

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Visual Slide Rendering with Images & Icons (Priority: P1) 🎯 MVP

**Goal**: Slides automatically include AI-generated Saudi-context images and contextual icons with lazy loading placeholders

**Independent Test**: Generate a deck with KPIs, budget, and features slides; verify each slide contains contextually appropriate images (Saudi-based, realistic) and icons, with placeholders appearing immediately and images revealing within 3-10s

### Implementation for User Story 1

- [x] T017 [P] [US1] Create `client/src/components/SlideBuilder/ImagePlaceholder.tsx` component with gradient background and large icon support
- [x] T018 [P] [US1] Create `client/src/hooks/useImageGeneration.ts` hook with `generateImage()` and `loading` state
- [x] T019 [US1] Update `client/src/components/SlideBuilder/SlideCard.tsx` to render image zones based on position (background, left-panel, right-panel, top-banner)
- [x] T020 [US1] Add `renderImage()` function in `SlideCard.tsx` to handle loading/ready/failed states with placeholder
- [x] T021 [US1] Implement prompt construction logic in `server/services/imageGeneration.ts` with content type → style mapping (kpis, budget, swot, vision, features, timeline, team, impact)
- [x] T022 [US1] Add Saudi-context keywords to all prompts ("Saudi Arabia", "professional", "realistic", "nonprofit", "charity")
- [x] T023 [US1] Implement image deduplication in `server/services/imageStorage.ts` using `content_hash` lookup before generation
- [x] T024 [US1] Add quota enforcement check in `images.generate` tRPC procedure (reject if `usedBytes >= limitBytes`)
- [x] T025 [US1] Implement background image generation with status polling in `useImageGeneration.ts` (N/A: DALL-E 3 returns sync, queue processes in background)
- [x] T026 [US1] Update `client/src/lib/iconSelector.ts` to support Saudi-context keywords (Arabic + English)
- [x] T027 [US1] Wire image generation into slide creation flow in `client/src/lib/convertToSlides.ts`

**Checkpoint**: At this point, slides should display with gradient placeholders immediately, then reveal AI-generated images within 3-10s

---

## Phase 4: User Story 2 - Gamma-Style Smart Layouts (Priority: P1) 🎯 MVP

**Goal**: Slides use varied, intelligent layouts (stat blocks, card grids, two-column, quadrants, flows) based on content type with no solid text blocks

**Independent Test**: Generate a deck with multiple slide types (vision, goals, KPIs, SWOT, budget); verify at least 4 different layout types are used and content is structured (no solid text blocks)

### Implementation for User Story 2

- [x] T028 [P] [US2] Create `AILayoutDecision` interface in `client/src/lib/aiLayoutSelector.ts` (layoutType, reasoning, imagePlacements, contentZones, estimatedHeight)
- [x] T029 [P] [US2] Create `ImagePlacement` and `ContentZone` interfaces in `client/src/lib/aiLayoutSelector.ts`
- [x] T030 [US2] Implement `selectLayoutWithImages()` function in `aiLayoutSelector.ts` with OpenRouter structured output (model: openai/gpt-4o)
- [x] T031 [US2] Add fallback layout logic in `aiLayoutSelector.ts` for when AI fails (SWOT→quadrant, KPIs→stat-blocks, Features→card-grid, Vision→two-column, Timeline→flow)
- [x] T032 [US2] Update `client/src/components/SlideBuilder/layouts/TwoColumnLayout.tsx` to support image zones (via SlideCard layoutConfig)
- [x] T033 [P] [US2] Update `client/src/components/SlideBuilder/layouts/QuadrantLayout.tsx` to support background image with overlay (via SlideCard)
- [x] T034 [P] [US2] Update `client/src/components/SlideBuilder/layouts/CardGridLayout.tsx` to support top-banner image (via SlideCard)
- [x] T035 [P] [US2] Update `client/src/components/SlideBuilder/layouts/StatBlocksLayout.tsx` to support side-panel image (via SlideCard)
- [x] T036 [P] [US2] Update `client/src/components/SlideBuilder/layouts/FlowLayout.tsx` to support inline-between images (via SlideCard)
- [x] T037 [US2] Add layout type validation in `aiLayoutSelector.ts` (must be valid enum value)
- [x] T038 [US2] Add image placement validation in `aiLayoutSelector.ts` (0-3 images, valid position/size/zIndex)
- [x] T039 [US2] Wire AI layout selection into `convertToSlides.ts` to assign layouts per slide
- [x] T040 [US2] Update `SlideCard.tsx` to apply layout-specific CSS classes based on `layoutConfig`

**Checkpoint**: At this point, slides should use varied layouts with proper image positioning (no single-layout monotony)

---

## Phase 5: User Story 3 - Pixel-Perfect PDF/PPTX Export (Priority: P1) 🎯 MVP

**Goal**: PDF and PowerPoint exports exactly match visual slide rendering (layout, images, icons, colors, fonts, spacing) for presentation-ready files

**Independent Test**: Generate a deck, export to PDF and PPTX; open both files and compare to on-screen slides; verify layout, images, icons, colors, Cairo font, RTL, and spacing are identical

### Implementation for User Story 3

- [x] T041 [P] [US3] Create `ExportVisualData` interface in `client/src/lib/slideExportUtils.ts` (slideId, imageDataUrl, width, height, format, quality)
- [x] T042 [P] [US3] Create `ExportManifest` interface in `client/src/lib/slideExportUtils.ts` (slides, metadata, theme, performance)
- [x] T043 [US3] Implement `captureSlideAsImage()` function in `slideExportUtils.ts` using html2canvas with scale: 2, useCORS: true, 1920×1080 dimensions
- [x] T044 [US3] Update `client/src/hooks/useSlideExport.ts` to use html-to-image conversion instead of text extraction
- [x] T045 [US3] Implement parallel slide capture in `useSlideExport.ts` using `Promise.all()` for all slides
- [x] T046 [US3] Update `exportToPDF()` in `useSlideExport.ts` to embed captured images with jsPDF (A4 landscape, 297×167mm per slide)
- [x] T047 [US3] Add RTL configuration in `exportToPDF()` with `pdf.setR2L(true)`
- [x] T048 [US3] Add PDF metadata in `exportToPDF()` (title, author, subject, keywords, creator)
- [x] T049 [US3] Update `exportToPPTX()` in `useSlideExport.ts` to embed captured images with pptxgenjs (16:9 layout, full-bleed images)
- [x] T050 [US3] Add RTL configuration in `exportToPPTX()` with `pptx.rtlMode = true`
- [x] T051 [US3] Add progress indicator during export (toast: "Exporting slide X of N...")
- [x] T052 [US3] Add error handling for export failures (RENDER_FAILED, IMAGE_LOAD_TIMEOUT, MEMORY_EXCEEDED, ASSEMBLY_FAILED, SAVE_FAILED)
- [x] T053 [US3] Add export success/failure toasts in `SlideBuilder.tsx` export button handlers
- [x] T054 [US3] Ensure all images have `status='ready'` before export (wait for lazy loading completion)

**Checkpoint**: At this point, exported PDF/PPTX files should be pixel-perfect matches of on-screen slides

---

## Phase 6: User Story 4 - Dynamic Slide Height & Content Adaptation (Priority: P2)

**Goal**: Slides with long content (budget categories, detailed objectives, SWOT items) expand vertically or intelligently paginate so no content is truncated

**Independent Test**: Generate a slide with 12+ budget categories or 10+ detailed objectives; verify all content is visible, well-spaced, and not cut off

### Implementation for User Story 4

- [x] T055 [P] [US4] Add `estimatedHeight` field to `AILayoutDecision` interface in `aiLayoutSelector.ts` ('standard' | 'tall' | 'multi-slide')
- [x] T056 [P] [US4] Implement content length analysis in `aiLayoutSelector.ts` to predict slide height needs
- [x] T057 [US4] Create `splitSlideContent()` function in `client/src/lib/slideLayoutEngine.ts` to split long content across multiple slides
- [x] T058 [US4] Add slide continuation logic in `convertToSlides.ts` (e.g., "Budget (1 of 3)", "Budget (2 of 3)")
- [x] T059 [US4] Update `SlideCard.tsx` to support dynamic height expansion (min-h based on estimatedHeight)
- [x] T060 [US4] Add content truncation detection in `slideLayoutEngine.ts` (check if content exceeds 800 chars or 8 blocks)
- [x] T061 [US4] Update layout components to support multi-row grids for long lists (CardGridLayout, StatBlocksLayout)
- [x] T062 [US4] Add vertical scrolling indicator for slides with overflow content (visual cue for users)

**Checkpoint**: At this point, long-content slides should either expand vertically or split into multiple slides with no truncation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Image Storage Quota Display

- [x] T063 [P] Add `imageStorageUsage` state to slideStore (used, limit, percentage) — via useImageStorage query
- [x] T064 [P] Create `useImageStorage.ts` hook with `refreshStorageQuota()` function
- [x] T065 Update `client/src/pages/UsageQuota.tsx` to display image storage section with progress bar
- [x] T066 Add "Image Storage" card to UsageQuota page showing used/limit in GB and percentage
- [x] T067 Add warning message when user reaches 90% of storage quota
- [x] T068 Add error message when user reaches 100% of storage quota (prevent new generation)

### Performance Optimization

- [x] T069 [P] Implement concurrent image generation limit (max 3 simultaneous DALL-E 3 calls per user)
- [x] T070 [P] Add image caching in slideStore during session (images stored in card, no re-fetch)
- [x] T071 Add batched export for large decks (>20 slides: convert in batches of 10)
- [x] T072 Add memory cleanup after html2canvas capture (batched processing reduces memory pressure)
- [ ] T073 Optimize image blob retrieval with streaming for large images (>5MB)

### Error Handling & User Feedback

- [x] T074 [P] Add retry logic with exponential backoff for transient API errors (503, 429) in `imageGeneration.ts`
- [x] T075 [P] Add content filtering for inappropriate keywords in `constructPrompt()` function
- [x] T076 Add user-facing error messages for quota exceeded, generation failed, export failed
- [x] T077 Add loading states for all async operations (image generation, export)
- [x] T078 Add success toasts for completed operations (image generated, export completed)

### Testing & Validation

- [ ] T079 [P] Verify `generated_images` table exists in database with correct schema
- [ ] T080 [P] Test image generation end-to-end (request → DALL-E 3 → store → retrieve)
- [ ] T081 [P] Test quota enforcement (reject when limit exceeded)
- [ ] T082 Test layout variety across different slide types (SWOT, KPIs, budget, vision, features)
- [ ] T083 Test export fidelity (PDF matches on-screen, PPTX matches on-screen)
- [ ] T084 Test RTL support in exports (Arabic text right-aligned, Cairo font rendered)
- [ ] T085 Test image deduplication (same prompt → reuse existing image)
- [ ] T086 Test content splitting for long slides (15+ items → multiple slides)
- [ ] T087 Test placeholder → image transition (gradient + icon → actual image)
- [ ] T088 Manual test: Generate 10-slide deck, export to PDF, open in Adobe Reader, verify quality
- [ ] T089 Manual test: Generate 10-slide deck, export to PPTX, open in PowerPoint, verify quality
- [ ] T090 Manual test: Reach storage quota, verify error message and prevention of new generation

### Documentation

- [x] T091 [P] Update `README.md` with new slide builder features (AI images, smart layouts, pixel-perfect export)
- [x] T092 [P] Add troubleshooting section to `quickstart.md` for common issues
- [x] T093 Document image storage quota in user-facing help/docs (UsageQuota card description)
- [x] T094 Add code comments for complex functions (constructPrompt, selectLayoutWithImages, captureSlideAsImage)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 3 (P1): Depends on US1 and US2 (needs images and layouts to export)
  - User Story 4 (P2): Can start after Foundational - No dependencies on other stories
- **Polish (Phase 7)**: Depends on all P1 user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories (can run in parallel with US1)
- **User Story 3 (P1)**: Depends on US1 (needs images) and US2 (needs layouts) - Must wait for both to complete
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Models/interfaces before services
- Services before API endpoints
- API endpoints before frontend hooks
- Frontend hooks before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: All tasks (T001-T003) can run in parallel
- **Phase 2 Database**: T004-T006 must be sequential, T007-T008 depend on T006
- **Phase 2 Backend**: T009-T010 can run in parallel, T011 depends on both, T012 depends on T011
- **Phase 2 Frontend**: T013-T016 can run in parallel
- **User Story 1**: T017-T018 can run in parallel, T019-T020 depend on T017, T021-T024 can run in parallel, T025-T027 depend on T024
- **User Story 2**: T028-T029 can run in parallel, T033-T036 can run in parallel (different layout files)
- **User Story 3**: T041-T042 can run in parallel, T046-T050 depend on T043-T045
- **User Story 4**: T055-T056 can run in parallel
- **Phase 7**: Most tasks can run in parallel within each subsection

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 - All P1)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T016) - CRITICAL
3. Complete Phase 3: User Story 1 (T017-T027) - Images & Icons
4. Complete Phase 4: User Story 2 (T028-T040) - Smart Layouts
5. Complete Phase 5: User Story 3 (T041-T054) - Pixel-Perfect Export
6. **STOP and VALIDATE**: Test all P1 stories together
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Images working
3. Add User Story 2 → Test independently → Layouts working
4. Add User Story 3 → Test independently → Export working (MVP complete!)
5. Add User Story 4 → Test independently → Content adaptation working
6. Add Polish → Final touches → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T016)
2. Once Foundational is done:
   - Developer A: User Story 1 (T017-T027) - Images
   - Developer B: User Story 2 (T028-T040) - Layouts
   - Developer C: Quota display (T063-T068)
3. Once US1 + US2 complete:
   - Developer A: User Story 3 (T041-T054) - Export
   - Developer B: User Story 4 (T055-T062) - Content adaptation
   - Developer C: Error handling (T074-T078)
4. All developers: Testing & validation (T079-T090)
5. All developers: Documentation (T091-T094)

---

## Task Estimates

| Phase | Task Count | Estimated Time |
|-------|------------|----------------|
| Phase 1: Setup | 3 | 0.5 hours |
| Phase 2: Foundational | 13 | 4-6 hours |
| Phase 3: User Story 1 | 11 | 6-8 hours |
| Phase 4: User Story 2 | 13 | 5-7 hours |
| Phase 5: User Story 3 | 14 | 6-8 hours |
| Phase 6: User Story 4 | 8 | 3-4 hours |
| Phase 7: Polish | 31 | 6-8 hours |
| **Total** | **94 tasks** | **30-42 hours** |

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All P1 user stories (1, 2, 3) must be complete for MVP
- User Story 4 (P2) is enhancement, can be deferred if needed
- Phase 7 (Polish) tasks can be prioritized based on criticality
