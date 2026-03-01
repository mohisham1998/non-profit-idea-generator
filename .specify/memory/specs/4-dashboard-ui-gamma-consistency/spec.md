# Feature Specification — Dashboard UI & Gamma Consistency

**Feature**: Dashboard UI & Gamma Consistency
**Branch**: `4-dashboard-ui-gamma-consistency`
**Created**: 2026-02-23
**Status**: Draft
**Input**: Change project generation progress UI to match Dashboard; remove all oranges (including hover) from old dashboard; update output slides to match Gamma app as per plan; generate slides with many different layouts so output is formatted, well-organized, presentable (not solid text); ensure layouts are friendly to how nonprofit organizational plans in Saudi Arabia look

---

## Clarifications

### Session 2026-02-23

- Q: If admin sets primary color to orange, how should the system behave? → A: The issue is not banning orange. The old theme used orange as its accent; after the UI refactor, some screens still show leftover orange instead of the new primary color or dashboard accent. We must replace leftover orange from the old theme with the new primary/dashboard accent everywhere. If the user chooses orange as their primary in branding, that is acceptable; the problem is incomplete migration from old theme.

---

## Summary

Align all UI surfaces with the modern admin dashboard design system: make the project generation progress screen match the dashboard aesthetics, replace all leftover orange from the old theme (including hover states) with the new primary color or dashboard accent, and ensure output slides conform to the Gamma-inspired design. Crucially, the system MUST generate slides with many different layouts so that output is formatted, well-organized, and presentable—not solid blocks of text. Layouts MUST be friendly to how nonprofit organizational plans in Saudi Arabia typically look, supporting formal, professional presentations suitable for donors, boards, and government stakeholders.

---

## User Scenarios & Testing

### User Story 1 — Consistent Progress Experience (Priority: P1)

As a nonprofit admin, I want the project generation progress screen (جاري توليد المشروع) to look and feel like the rest of the dashboard so that the experience is cohesive and professional.

**Why this priority**: The progress screen is a core touchpoint during content generation; visual inconsistency breaks trust and feels unpolished.

**Independent Test**: Start a new project generation and verify the progress card matches dashboard styling (colors, cards, typography, accent palette).

**Acceptance Scenarios**:

1. **Given** the user starts project generation, **When** the progress screen is shown, **Then** the card uses the same color palette as the dashboard (white/light background, new primary or cyan/teal accents—not leftover old-theme orange).
2. **Given** the progress screen is displayed, **When** the user views it, **Then** the overall progress bar and sub-step indicators use the new primary or dashboard accent colors, not leftover orange.
3. **Given** the progress screen is displayed, **When** the user hovers over any interactive element, **Then** hover states use the new primary or dashboard accent, not old-theme orange.

---

### User Story 2 — Replace Leftover Old-Theme Orange (Priority: P1)

As a nonprofit admin, I want all screens to use the new primary color or dashboard accent (not leftover orange from the old theme) so that the UI refactor is complete and the interface is consistent.

**Why this priority**: The old theme used orange; after the refactor, some areas still show orange instead of the new primary. Those leftovers indicate incomplete migration and should be replaced with the new primary/dashboard accent.

**Independent Test**: Navigate all main screens (dashboard, generation, settings, slides) and hover over links, buttons, and cards; confirm the new primary or dashboard accent is used, not leftover orange from the old theme.

**Acceptance Scenarios**:

1. **Given** the user is anywhere in the app, **When** they hover over buttons, links, cards, or progress indicators, **Then** hover and focus states use the new primary color or dashboard accent, not leftover old-theme orange.
2. **Given** the user views any page, **When** the page loads, **Then** static elements (badges, labels, accents, charts) use the new primary or dashboard accent where the old theme used orange.
3. **Given** the user has set a custom primary color in branding, **When** viewing the app, **Then** that primary color (or the default dashboard accent if unset) appears in place of any old-theme orange.

---

### User Story 3 — Gamma-Style Output Slides (Priority: P2)

As a nonprofit admin, I want the exported and in-app slide output to match the Gamma app design as defined in the Gamma Slides Redesign plan so that presentations are modern and professional.

**Why this priority**: Output slides are the primary deliverable; alignment with the Gamma plan ensures visual quality and consistency.

**Independent Test**: Generate a full deck and compare against Gamma Slides Redesign spec (layouts, typography, spacing, gradients, backgrounds).

**Acceptance Scenarios**:

1. **Given** a deck is generated, **When** the user views slides in the builder, **Then** each slide type (Cover, KPI, Budget, SWOT, Custom) matches the Gamma-inspired layouts and styling from the plan.
2. **Given** a deck is generated, **When** the user exports to PDF or PowerPoint, **Then** the exported slides preserve Gamma-style design (typography, gradients, spacing, icons).
3. **Given** the Gamma Slides Redesign spec defines layout types and visual treatment, **When** comparing output slides to the spec, **Then** no discrepancies exist for required elements (e.g., cover backgrounds, KPI progress bars, SWOT quadrants, budget breakdowns).

---

### User Story 4 — Varied, Formatted Slide Layouts (Priority: P1)

As a nonprofit admin, I want the system to generate slides with many different layouts so that the output is formatted, well-organized, and presentable—not solid blocks of text—and suitable for how nonprofit organizational plans in Saudi Arabia typically look.

**Why this priority**: This is the most important outcome: slides must feel professional and structured, not like raw text dumps. Nonprofit plans in Saudi Arabia are often presented to donors, government bodies, and boards; the layout must support that formal context.

**Independent Test**: Generate a nonprofit organizational plan deck; verify varied layouts (cards, grids, numbered sections, KPIs, etc.) and that no slide is a single dense text block.

**Acceptance Scenarios**:

1. **Given** the user generates a slide deck, **When** the deck is rendered, **Then** each slide uses a distinct, formatted layout (e.g., card grids, numbered sections, stat blocks, icon lists)—not a single block of solid text.
2. **Given** a deck is generated, **When** the user views it, **Then** layouts vary appropriately by content type (e.g., KPIs as stat blocks, challenges as cards, performance metrics as grids or charts).
3. **Given** the context is a nonprofit organizational plan in Saudi Arabia, **When** slides are generated, **Then** the visual style is professional and aligned with formal Saudi nonprofit presentation conventions (e.g., clean, structured, RTL-ready, appropriate for donors and government stakeholders).

---

### Edge Cases

- What happens when the user has a custom primary color set in branding? Progress and slides MUST use that primary color where accents are applied; do not fall back to old-theme orange.
- How does the system handle legacy decks or slides created before this update? Existing content should render using the new primary/accent where possible; new generation MUST use the new design.
- What if a third-party component (e.g., chart library) uses orange by default? The system MUST override or theme those components to use the new primary or dashboard accent.

---

## Requirements

### Functional Requirements

- **FR-1** The project generation progress screen MUST use the same color palette as the admin dashboard: white/light background, and the new primary color or dashboard accent (e.g., cyan/teal) for progress bars and active states—not leftover old-theme orange.
- **FR-2** Hover and focus states across the application MUST use the new primary color or dashboard accent; any leftover orange from the old theme MUST be replaced with theme-derived colors.
- **FR-3** All static UI elements (badges, labels, charts, progress indicators, buttons) that currently use old-theme orange MUST be updated to use the new primary or dashboard accent.
- **FR-4** Output slides (in-app builder and exports) MUST match the Gamma Slides Redesign specification: layouts (Cover, KPI, Budget, SWOT, Custom), typography, spacing, gradients, and backgrounds.
- **FR-5** Exported PDF and PowerPoint decks MUST preserve Gamma-style design and use the new primary/accent, not leftover old-theme styling.
- **FR-6** Cairo font and RTL layout MUST be maintained across all updated UI surfaces.
- **FR-7** The system MUST generate slides with many different layouts (e.g., card grids, numbered sections, stat blocks, icon lists) so that output is formatted, well-organized, and presentable—never a single block of solid text.
- **FR-8** Slide layouts MUST be suitable for nonprofit organizational plans in Saudi Arabia: professional, structured, and appropriate for formal presentations to donors, boards, and government stakeholders.

### Key Entities

- **Project Generation Progress UI**: The card and sub-steps shown during project generation; must align with dashboard styling.
- **Design System / Theme**: Color palette, hover states, and accent colors used application-wide.
- **Slide Deck Output**: Generated slides and exports; must conform to Gamma Slides Redesign spec, use varied layouts (no solid text blocks), and be appropriate for Saudi nonprofit organizational plans.

---

## Success Criteria

### Measurable Outcomes

- **SC-1**: No leftover old-theme orange appears where the new primary or dashboard accent should be used; verified by visual audit.
- **SC-2**: The project generation progress screen passes a side-by-side comparison with dashboard pages for color, card style, and typography consistency.
- **SC-3**: Output slides match the Gamma Slides Redesign spec for all slide types; layout, typography, and visual treatment meet the defined requirements.
- **SC-4**: Users report a cohesive, professional experience when moving between dashboard, generation, and slide output.
- **SC-5**: Generated decks use varied layouts (cards, grids, stats, numbered sections); no slide is a single block of solid text.
- **SC-6**: Slide output is suitable for Saudi nonprofit organizational plans: professional, structured, and appropriate for formal presentations.

---

## Assumptions

- The admin dashboard design system (colors, cards, typography) is the source of truth for in-app UI.
- The Gamma Slides Redesign spec (1-gamma-slides-redesign) defines the target for output slides.
- The problem is leftover orange from the old theme; the fix is to replace it with the new primary or dashboard accent. If a user selects orange as their primary color in branding, that is acceptable.
- Custom primary colors from branding settings take precedence; the new primary (whatever the user chooses) replaces old-theme orange wherever it appears.
- Nonprofit organizational plans in Saudi Arabia are typically formal, structured documents presented to donors, government, and boards; slide layouts must reflect that context.

---

## Dependencies

- Admin Dashboard UI (2-admin-dashboard-ui) for design tokens and component styles.
- Gamma Slides Redesign (1-gamma-slides-redesign) for output slide specifications.
- Existing slide builder and export pipelines for PDF/PowerPoint.
