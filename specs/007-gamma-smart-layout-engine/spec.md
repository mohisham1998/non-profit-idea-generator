# Feature Specification: Gamma-Inspired Smart Layout Engine

**Feature Branch**: `007-gamma-smart-layout-engine`  
**Created**: 2026-03-01  
**Status**: Draft  
**Input**: User description: "Gamma-inspired Smart Layout Engine for presentation-grade slides with visual hierarchy, smart layouts, image rendering fixes, and WYSIWYG PDF/PPT export"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Visually-Designed Slides (Priority: P1)

As a nonprofit marketing user, I want to generate presentation-grade slides that use smart layouts (cards, grids, stats, timelines) instead of plain text, so that my slide decks look professional and suitable for Saudi Arabian charity marketing plans.

**Why this priority**: This is the core value proposition—transforming plain text slides into visually compelling presentations. Without this, the product fails its primary purpose.

**Independent Test**: Can be fully tested by generating a slide deck and verifying each slide uses a registered layout template with proper visual hierarchy (headings, spacing, icons, structured components).

**Acceptance Scenarios**:

1. **Given** a user generates a slide deck with KPI data, **When** the AI processes the content, **Then** the slide renders using a "Stat blocks" or "KPI table" layout from the registry with proper visual formatting.
2. **Given** a user generates a SWOT analysis slide, **When** the slide renders, **Then** it uses a "SWOT 2x2 grid" layout with distinct quadrant styling and visual separation.
3. **Given** a slide contains a list of 3 benefits, **When** the AI selects a layout, **Then** it chooses "Feature cards (3-up)" or "Icon cards (3-up)" based on content density, not a bullet list.
4. **Given** the same slide type (e.g., "Budget") with different content structures, **When** layouts are selected, **Then** different layouts may be chosen based on content (e.g., `budget-table` for detailed data vs. `allocation-visual` for high-level overview vs. `stat-blocks-4` for 4 key figures).
5. **Given** a generic content slide with 3 main points, **When** the AI analyzes the content, **Then** it can choose from any applicable layout across all families (e.g., `feature-cards-3`, `icon-cards-3`, `pillars-3`, `steps-horizontal`) based on content semantics.
6. **Given** any slide regardless of semantic type, **When** the AI selects a layout, **Then** all 45 layouts in the registry are available candidates.

---

### User Story 2 - Reliable Image Rendering (Priority: P1)

As a user, I want images to load reliably in my slides and appear correctly in exports, so that I don't have broken visuals in my presentations.

**Why this priority**: Currently images fail to load, which completely breaks slide quality. This is a critical bug fix that must work before other visual enhancements matter.

**Independent Test**: Can be tested by adding images to slides and verifying they render in the canvas, display fallback placeholders on failure, and appear in PDF/PPT exports.

**Acceptance Scenarios**:

1. **Given** a slide with an image URL, **When** the slide renders, **Then** the image loads and displays within 3 seconds.
2. **Given** an image fails to load (network error, invalid URL), **When** the failure occurs, **Then** a styled placeholder appears with a retry button.
3. **Given** a slide with images is exported to PDF, **When** the export completes, **Then** all images appear in the PDF at appropriate resolution.
4. **Given** a slide with images is exported to PowerPoint, **When** the export completes, **Then** all images appear in the PPT file.

---

### User Story 3 - Full Slide Content Without Truncation (Priority: P1)

As a user, I want all slide content to be fully visible without truncation, so that important information (especially in KPI, Budget, and SWOT slides) is never cut off.

**Why this priority**: Truncated content makes slides unusable for presentations. Users cannot present incomplete data to stakeholders.

**Independent Test**: Can be tested by generating content-heavy slides (10+ KPIs, detailed budgets) and verifying all content is visible either by expanded height, denser layout, or content splitting.

**Acceptance Scenarios**:

1. **Given** a KPI slide with 8 metrics, **When** the slide renders, **Then** all 8 metrics are fully visible (no content cut off).
2. **Given** a budget slide with 12 line items, **When** the content exceeds standard height, **Then** the system either expands slide height, switches to a denser layout, or splits into multiple slides.
3. **Given** an add-on slide with extensive content, **When** the slide renders, **Then** no text or visual elements are truncated.

---

### User Story 4 - Valid PDF Export with Full Styling (Priority: P1)

As a user, I want to export my slide deck to PDF and have it open correctly with all styling preserved, so that I can share professional documents.

**Why this priority**: PDF export is currently broken/corrupted. This is a critical bug that prevents users from delivering their work product.

**Independent Test**: Can be tested by exporting a styled deck to PDF, opening it in standard PDF readers, and verifying layout, fonts (Cairo), RTL text, colors, and images match the canvas.

**Acceptance Scenarios**:

1. **Given** a completed slide deck, **When** the user exports to PDF, **Then** the PDF file opens without corruption in Adobe Reader, Chrome, and Preview.
2. **Given** a deck with Arabic RTL text, **When** exported to PDF, **Then** text renders right-to-left with correct Cairo font.
3. **Given** a deck with gradients, borders, shadows, and colors, **When** exported to PDF, **Then** all styling appears as shown in the canvas.
4. **Given** a multi-slide deck, **When** exported to PDF, **Then** each slide appears on a separate page with correct dimensions.

---

### User Story 5 - PowerPoint Export with Layout Preservation (Priority: P1)

As a user, I want to export my slide deck to PowerPoint with all layouts and styling preserved, so that I can edit and present using Microsoft PowerPoint.

**Why this priority**: PPT export currently outputs plain text without styling. This defeats the purpose of visual slides and is a critical gap.

**Independent Test**: Can be tested by exporting a styled deck to PPT, opening in PowerPoint, and verifying layouts, colors, fonts, images, and icons are preserved.

**Acceptance Scenarios**:

1. **Given** a slide using "Feature cards (3-up)" layout, **When** exported to PPT, **Then** the three cards appear with proper positioning and styling in PowerPoint.
2. **Given** a slide with icons and images, **When** exported to PPT, **Then** both icons and images appear in the PowerPoint file.
3. **Given** a deck with Cairo font and RTL text, **When** exported to PPT, **Then** text direction and font are preserved.
4. **Given** a slide with brand colors and logo, **When** exported to PPT, **Then** branding elements appear correctly.

---

### User Story 6 - AI Layout Selection with Logging (Priority: P2)

As a system administrator or developer, I want the AI layout selection to be logged with layout IDs for each slide, so that I can debug and optimize layout choices.

**Why this priority**: Essential for debugging and improving the layout selection algorithm, but not user-facing functionality.

**Independent Test**: Can be tested by generating slides and checking logs for layout ID selections per slide.

**Acceptance Scenarios**:

1. **Given** the AI generates a slide, **When** layout selection occurs, **Then** a log entry records the slide index, content analysis factors (item count, density score, presence of tables/metrics/images), and selected layout ID.
2. **Given** a slide deck is generated, **When** reviewing logs, **Then** every slide has a corresponding layout selection log entry.

---

### User Story 7 - Deck Persistence and Return Access (Priority: P2)

As a user, I want my generated decks to be saved so I can return to them later, so that I don't lose my work and can iterate on presentations.

**Why this priority**: Important for user experience and workflow, but secondary to core rendering and export functionality.

**Independent Test**: Can be tested by generating a deck, closing the app, returning, and verifying the deck is accessible with all slides intact.

**Acceptance Scenarios**:

1. **Given** a user generates a slide deck, **When** generation completes, **Then** the deck is automatically saved/persisted.
2. **Given** a user returns to the application, **When** they access their deck history, **Then** previously generated decks are listed and accessible.
3. **Given** a user opens a saved deck, **When** it loads, **Then** all slides render with their original layouts and content.

---

### User Story 8 - User Profile with Consumption/Quota Display (Priority: P3)

As a user, I want to see my usage/consumption quota in my profile, so that I understand my usage levels.

**Why this priority**: Display-only feature for user awareness. Quota enforcement is planned for later.

**Independent Test**: Can be tested by checking user profile displays consumption metrics.

**Acceptance Scenarios**:

1. **Given** a user accesses their profile, **When** the profile loads, **Then** consumption/quota metrics are displayed.
2. **Given** a user generates slides, **When** they check their profile, **Then** usage reflects recent activity.

---

### User Story 9 - Model Selection via OpenRouter (Priority: P3)

As a user, I want to select which AI model to use from available OpenRouter models, so that I can choose based on speed, quality, or cost preferences.

**Why this priority**: Nice-to-have flexibility feature. Default model selection can work for MVP.

**Independent Test**: Can be tested by accessing model selection UI and verifying it lists available OpenRouter models.

**Acceptance Scenarios**:

1. **Given** a user accesses model selection, **When** the UI loads, **Then** available models from OpenRouter API are listed.
2. **Given** a user selects a different model, **When** they generate slides, **Then** the selected model is used for generation.

---

### Edge Cases

- What happens when all images on a slide fail to load? → Slide renders with placeholders; user can retry or remove images.
- What happens when content exceeds maximum slide height after using densest layout? → Content splits into multiple slides with continuation indicator.
- What happens when export fails mid-process? → User receives error notification with option to retry; partial exports are not saved.
- What happens when no layout in registry matches content structure? → Fallback to most generic layout variant (e.g., "Bullet list formatted hierarchy").
- What happens when network disconnects during image loading? → Images show loading state with retry option when network returns.

## Requirements *(mandatory)*

### Functional Requirements

#### Smart Layout Engine

- **FR-001**: System MUST implement a layout registry containing all 45 layouts across 9 families (Cover, Text+Media, Cards, KPIs, Comparison, Process, Frameworks, Budget, Lists) as defined in the Smart Layout Registry.
- **FR-002**: System MUST make ALL layouts available for ANY slide type. The AI chooses from the entire registry based on content, not slide type.
- **FR-003**: System MUST select layouts based on content analysis: content structure (list/stats/matrix/steps), item count, density score, presence of tables/metrics, availability of images, and slide type as a guiding signal only.
- **FR-004**: System MUST NOT lock slide types to fixed layouts; content structure drives layout selection. Example: A "Budget" slide may use `stat-blocks-4`, `budget-table`, or `icon-cards-6` depending on content.
- **FR-005**: System MUST log layout selection decisions including slide index, analysis factors, candidate layouts considered, and final selected layout ID.

#### Visual Rendering

- **FR-006**: Slides MUST render with consistent spacing and visual hierarchy (headings, subheadings, body text).
- **FR-007**: Slides MUST support icons for key items where contextually appropriate.
- **FR-008**: Slides MUST support images with reliable loading and graceful fallback (placeholder + retry).
- **FR-009**: Slides MUST render structured components (cards, grids, stats blocks, matrices, timelines, split layouts) per layout specifications.
- **FR-010**: Slide content MUST never be truncated; system MUST handle overflow via height expansion, denser layout, or content splitting.

#### Export Fidelity

- **FR-011**: PDF export MUST produce valid, non-corrupted files that open in standard PDF readers.
- **FR-012**: PDF export MUST preserve layout structure, positioning, Cairo typography, RTL direction, colors, gradients, borders, shadows, icons, images, and branding.
- **FR-013**: PowerPoint export MUST preserve layout structure, positioning, typography, RTL direction, colors, icons, images, and branding.
- **FR-014**: Export output MUST match exactly what the user sees in the slide builder canvas.

#### Data Persistence

- **FR-015**: System MUST save/persist generated decks so users can return to previously generated slides.
- **FR-016**: System MUST enforce a maximum of 30 slides per deck; content splitting from overflow handling counts toward this limit.

#### User Interface

- **FR-017**: UI MUST maintain admin-dashboard look and feel (not marketing website style).
- **FR-018**: UI MUST use white background, Cairo font, and RTL-only text direction.
- **FR-019**: UI MUST include smooth animations for panels, transitions, and hover interactions.
- **FR-020**: User profile MUST display consumption/quota metrics (display only).
- **FR-021**: System MUST provide model selection UI listing available OpenRouter models.

### Key Entities

- **Layout Registry**: Collection of layout templates organized by family, each with a unique layout ID, supported content structures, and rendering specifications. See **Smart Layout Registry** section below for complete list.
- **Slide**: Content container with semantic type hint, content data, selected layout ID, and rendered output state.
- **Content Analysis**: Computed metadata including item count, density score, content structure type, presence of tables/metrics/images.
- **Deck**: Collection of slides with metadata (title, creation date, last modified), branding settings (logo, primary color), and persistence state.
- **Export Job**: Export operation with target format (PDF/PPT), progress state, and output file reference.

### Smart Layout Registry (Complete)

The AI selects from this registry for **ANY slide** based on content analysis—not based on slide type. Slide type (Cover/KPI/Budget/SWOT/etc.) is a semantic hint, not a layout restriction. The same layout can be used across different slide types if the content structure fits.

**Selection Criteria** (AI analyzes these factors):
- Content structure: list vs stats vs matrix vs steps vs narrative
- Item count: 3 vs 4 vs 6 vs 10+ items
- Density score: short/light vs medium vs heavy/detailed
- Presence of: tables, metrics/numbers, images, icons
- Slide type: used as guiding signal, NOT as constraint

---

#### C1 — Cover & Section Layouts

| Layout ID | Layout Name | Best For |
|-----------|-------------|----------|
| `cover-hero` | Cover Hero | Title + subtitle + background/image |
| `cover-split` | Cover Split | Text on one side + image on other |
| `section-divider` | Section Divider | Chapter/section breaks |
| `agenda-outline` | Agenda / Outline | List of topics or agenda items |

---

#### C2 — Text + Media Layouts

| Layout ID | Layout Name | Best For |
|-----------|-------------|----------|
| `split-50-50` | Split Layout (50/50) | Equal text and media balance |
| `split-30-70` | Split Layout (30/70) | Media-heavy with supporting text |
| `text-overlay` | Text Overlay on Image | Narrative with visual background |
| `gallery-captions` | Gallery + Captions | Multiple images with descriptions |
| `visual-callout` | Visual + Key Callout | Single image with emphasized point |

---

#### C3 — Cards / Features Layouts

| Layout ID | Layout Name | Best For |
|-----------|-------------|----------|
| `feature-cards-3` | Feature Cards (3-up) | 3 key features/points |
| `feature-cards-4` | Feature Cards (4-up) | 4 key features/points |
| `icon-cards-3` | Icon Cards (3-up) | 3 items with icons |
| `icon-cards-6` | Icon Cards (6-up compact) | 6 items in dense grid |
| `problem-solution` | Problem → Solution | Before/after or challenge/resolution |
| `benefits-grid` | Benefits Grid | Multiple benefits in visual grid |

---

#### C4 — KPIs / Stats Layouts

| Layout ID | Layout Name | Best For |
|-----------|-------------|----------|
| `stat-blocks-3` | Stat Blocks (3) | 3 key metrics prominently displayed |
| `stat-blocks-4` | Stat Blocks (4) | 4 key metrics prominently displayed |
| `kpi-table` | KPI Table | Detailed metrics in tabular format |
| `kpi-list-icons` | KPI List with Icons | Metrics as list with visual icons |
| `progress-bars` | Progress Bars / Targets | Goals with progress indicators |
| `big-number-breakdown` | Big Number + Breakdown | Hero number with supporting details |

---

#### C5 — Comparison & Decision Layouts

| Layout ID | Layout Name | Best For |
|-----------|-------------|----------|
| `compare-2col` | Two-Column Comparison | Side-by-side comparison of 2 options |
| `compare-3col` | Three-Column Comparison | Comparison of 3 options |
| `pros-cons` | Pros / Cons | Advantages vs disadvantages |
| `before-after` | Before / After | State change or transformation |
| `options-table` | Options Table with Highlight | Decision matrix with recommended option |

---

#### C6 — Process / Journey / Timeline Layouts

| Layout ID | Layout Name | Best For |
|-----------|-------------|----------|
| `steps-horizontal` | Steps Flow (Horizontal) | Sequential process left-to-right |
| `steps-vertical` | Steps Flow (Vertical) | Sequential process top-to-bottom |
| `timeline-horizontal` | Timeline (Horizontal) | Chronological events horizontal |
| `timeline-vertical` | Timeline (Vertical) | Chronological events vertical |
| `phases-deliverables` | Phases + Deliverables | Project phases with outputs |
| `funnel-journey` | Funnel / Journey Stages | Conversion funnel or user journey |

---

#### C7 — Frameworks / Matrices Layouts

| Layout ID | Layout Name | Best For |
|-----------|-------------|----------|
| `swot-grid` | SWOT 2x2 Grid | Strengths/Weaknesses/Opportunities/Threats |
| `matrix-2x2` | Generic 2x2 Matrix | Impact/effort, priority matrix, etc. |
| `pillars-3` | 3 Pillars | Three foundational elements |
| `pillars-4` | 4 Pillars | Four foundational elements |

---

#### C8 — Budget / Allocation Layouts

| Layout ID | Layout Name | Best For |
|-----------|-------------|----------|
| `budget-category-bars` | Total + Category Bars | Budget overview with category breakdown |
| `budget-table` | Budget Table + Totals | Detailed budget in table format |
| `allocation-visual` | Allocation Visual Block | Donut-style or visual budget distribution |
| `cost-breakdown-cards` | Cost Breakdown Cards | Costs displayed as cards |

---

#### C9 — Lists / Content Density Layouts

| Layout ID | Layout Name | Best For |
|-----------|-------------|----------|
| `bullet-hierarchy` | Bullet List (Formatted Hierarchy) | Structured text with hierarchy |
| `numbered-badges` | Numbered List (Badges) | Ordered items with visual numbers |
| `checklist-icons` | Checklist (Icons) | To-do or checklist items |
| `quote-testimonial` | Quote / Testimonial | Featured quote or testimonial |
| `call-to-action` | Call to Action Slide | Final CTA or next steps |

---

**Total: 45 layouts across 9 families**

**Key Principle**: Any layout can be applied to any slide. A "Budget" slide might use `stat-blocks-4` if it has 4 key figures, or `budget-table` if it has detailed line items, or `icon-cards-6` if presenting 6 budget categories visually. The AI analyzes content and chooses the best visual representation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of generated slides use a layout from the registered layout library (no plain text-only slides).
- **SC-002**: Images load successfully in slides at least 95% of the time under normal network conditions.
- **SC-003**: 100% of slide content is visible without truncation (verified across KPI, Budget, SWOT, and add-on slides).
- **SC-004**: PDF exports open successfully in 100% of tests across Adobe Reader, Chrome PDF viewer, and macOS Preview.
- **SC-005**: PowerPoint exports preserve layout structure in 100% of tested slides (verified by visual comparison).
- **SC-006**: Export fidelity achieves 95%+ visual match between canvas and exported output (measured by spot-check comparison).
- **SC-007**: Layout selection logs are generated for 100% of slides with complete analysis data.
- **SC-008**: Users can access previously generated decks within 3 seconds of returning to the application.

## Clarifications

### Session 2026-03-01

- Q: What is the primary source of slide images? → A: AI-generated only (DALL-E via OpenRouter); user upload not supported in this phase.
- Q: What is the maximum number of slides per deck? → A: 30 slides maximum.

## Assumptions

- **A-001**: Cairo font is available and can be embedded in both PDF and PowerPoint exports.
- **A-002**: Images are AI-generated via DALL-E through OpenRouter; user upload is out of scope for this feature.
- **A-003**: OpenRouter API provides a list of available models that can be queried.
- **A-004**: The existing slide builder infrastructure (cards, sidebar, theming/branding, inline editing) remains functional and this feature extends it.
- **A-005**: RTL (right-to-left) is the only text direction required; LTR support is not in scope.
- **A-006**: Quota enforcement will be implemented in a future phase; this feature only displays usage.
