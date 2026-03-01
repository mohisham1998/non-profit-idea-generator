# Feature Specification — Gamma-Inspired Slide Redesign

**Feature**: Gamma-Inspired Slide Redesign
**Branch**: `1-gamma-slides-redesign`
**Status**: Draft
**Date**: 2026-02-28
**Author**: Team

---

## Summary

Upgrade the current slide-generation output from a basic text-and-layout format into a
Gamma-app-inspired, professionally designed, and fully customizable presentation experience.
The new slides MUST feature varied layout types (Cover, KPI, Budget, SWOT, Custom), polished
visual design (branded backgrounds, quality typography, icons, proper spacing), and AI-driven
content generation and real-time refinement per slide — all with full Arabic/RTL support for
nonprofit charities operating in Saudi Arabia.

---

## Constitution Alignment

- **P1 — AI Content Generation via OpenRouter**: AI generates contextual text per slide type
  (mission, KPIs, budget breakdowns, SWOT items) via OpenRouter, with adaptive model
  suggestions per slide category.
- **P2 — Admin Dashboard UI**: Slide builder lives inside the admin dashboard's central
  workspace with sidebar thumbnail navigation and a dedicated Customization Panel.
- **P4 — Full Customization of Slide Layouts**: Multiple layout types, drag-to-reorder,
  resize components, non-destructive layout switching, AI layout recommendations.
- **P5 — Real-Time AI Refinement**: Inline AI suggestions for content clarity, rephrasing,
  and design adjustments with debounced API calls.
- **P7 — Arabic Language & RTL Support**: All slide content, labels, icons, and exports MUST
  render correctly in RTL/Arabic.

---

## User Stories

| ID   | As a…                      | I want to…                                                         | So that…                                                              |
|------|----------------------------|--------------------------------------------------------------------|-----------------------------------------------------------------------|
| US-1 | Nonprofit admin            | generate a full slide deck with cover, KPI, budget & SWOT slides  | I get a ready-to-present deck without manual design work              |
| US-2 | Nonprofit admin            | choose or switch the layout style of each slide                    | my presentation matches the audience and content type                 |
| US-3 | Nonprofit admin            | have AI refine the text on any slide in real time                  | the language is clear, professional, and tailored to my organization  |
| US-4 | Nonprofit admin            | customize colors, backgrounds, fonts, and icon sets per slide      | the deck reflects my organization's brand identity                    |
| US-5 | Nonprofit admin            | export the polished deck to PDF or PowerPoint                      | I can share it with donors, partners, or boards                       |
| US-6 | Nonprofit admin            | see and navigate slides via a thumbnail sidebar                    | I can quickly jump to any slide and track deck structure              |
| US-7 | Arabic-speaking admin      | have all slide content and UI labels in Arabic, right-to-left      | the presentation is readable and professional for my audience         |

---

## Functional Requirements

### Must Have (P0)

- [ ] **FR-1** The system MUST generate a multi-slide deck containing at minimum: Cover slide,
  KPI slide, Budget slide, SWOT Analysis slide, and at least one Custom Content slide, based
  on the user's input form.
- [ ] **FR-2** Each slide type MUST have at least two distinct layout options the user can
  switch between without losing content.
- [ ] **FR-3** The Cover slide MUST display: title, subtitle, and target audience field, with
  a visually engaging background (gradient or template image).
- [ ] **FR-4** The KPI slide MUST display key indicators with progress bars or chart elements
  and representative icons per KPI category.
- [ ] **FR-5** The Budget slide MUST display a total budget figure, a category breakdown with
  percentage allocations, and visual progress bars.
- [ ] **FR-6** The SWOT slide MUST divide into four quadrants (Strengths/Green,
  Weaknesses/Red, Opportunities/Blue, Threats/Amber) with icons and text descriptions.
- [ ] **FR-7** The Custom Content slide MUST allow free-form text content with selectable
  layout options (single column, two-column grid, timeline).
- [ ] **FR-8** AI MUST generate contextual text for each slide type based on the user's input
  (organization name, mission, program type, target KPIs, budget figures).
- [ ] **FR-9** Each slide MUST offer an inline AI refinement action (button or panel) that
  rewrites, clarifies, or expands the current slide text on demand.
- [ ] **FR-10** All slides and their UI labels MUST render in Arabic with RTL directionality.
- [ ] **FR-11** The slide builder MUST display a thumbnail sidebar listing all slides; clicking
  a thumbnail MUST navigate to that slide.
- [ ] **FR-12** The deck MUST be exportable to PDF and PowerPoint, with RTL Arabic text and
  typography preserved.

### Should Have (P1)

- [ ] **FR-13** AI MUST suggest a recommended layout for each slide type based on the volume
  and type of content (e.g., many KPIs → table layout vs. few KPIs → card layout).
- [ ] **FR-14** Users SHOULD be able to reorder slides by dragging thumbnails in the sidebar.
- [ ] **FR-15** Users SHOULD be able to apply a global color theme to the entire deck from a
  set of predefined palettes (e.g., Islamic green, charity blue, deep purple).
- [ ] **FR-16** Each slide SHOULD support a custom background: solid color, gradient, or
  upload from a set of curated nonprofit-appropriate images.
- [ ] **FR-17** AI content suggestions SHOULD be displayed in a non-intrusive side panel or
  tooltip without overwriting content unless the user accepts.
- [ ] **FR-18** AI calls for real-time refinement MUST be debounced with a minimum 500ms
  delay to avoid excessive API usage (per P5).

### Nice to Have (P2)

- [ ] **FR-19** Users MAY be able to move and resize individual content blocks (text, chart,
  icon) within a slide using a drag-and-drop interface.
- [ ] **FR-20** AI MAY suggest relevant icons or images to accompany slide content
  automatically.
- [ ] **FR-21** A presentation preview mode MAY display the deck full-screen, slide by slide,
  simulating an actual presentation.

---

## Non-Functional Requirements

- **Arabic/RTL (P7)**: All slide elements, toolbar labels, AI output, and export files MUST
  render correctly in RTL Arabic. No component may override the root `rtl` direction for
  cosmetic reasons only.
- **Performance**: The initial slide deck MUST be generated and displayed within 10 seconds
  of the user submitting the input form. AI refinement suggestions MUST appear within 3
  seconds of a user action.
- **Accessibility**: Slide navigation via keyboard SHOULD be supported. All interactive
  elements MUST have descriptive ARIA labels in Arabic.
- **Security**: Slide content is user-specific and MUST only be accessible to the
  authenticated user who created it.

---

## Assumptions

- Users are authenticated nonprofit administrators (single tenant per session).
- The OpenRouter API key is already configured in the project `.env`; no new auth
  infrastructure is required for AI calls.
- Export quality targets standard A4 / 16:9 widescreen slide dimensions.
- Icon sets will be sourced from the project's existing icon library (Lucide/Heroicons) with
  common nonprofit/financial/KPI categories covered.
- "Drag to reorder slides" (FR-14) is a P1 and may depend on existing DnD kit already
  installed in the project (`@dnd-kit`).

---

## Out of Scope

- Real-time collaborative editing (multiple users editing the same deck simultaneously).
- Video or audio embedding in slides.
- Payment processing or subscription management.
- Functional quota enforcement (quota UI is present per P3, but blocking behavior is
  deferred to a later phase).
- Third-party cloud storage sync (deferred to integration phase per P6).

---

## Acceptance Criteria

- [ ] **AC-1** Given a completed input form, the system generates a deck of ≥ 5 slides
  (Cover, KPI, Budget, SWOT, Custom) within 10 seconds.
- [ ] **AC-2** Each slide type is visually distinct and matches its described layout (e.g.,
  SWOT shows four clearly color-coded quadrants).
- [ ] **AC-3** Switching the layout option on any slide does NOT erase or corrupt existing
  content on that slide.
- [ ] **AC-4** Clicking "AI Refine" on a slide returns a rewritten version of the text
  within 3 seconds; the user can accept or discard it.
- [ ] **AC-5** The full deck exports to a valid PDF and .pptx file with Arabic text
  correctly rendered right-to-left.
- [ ] **AC-6** All UI labels, button text, and AI-generated content are displayed in Arabic.
- [ ] **AC-7** Clicking a slide thumbnail in the sidebar scrolls the workspace to that slide.
- [ ] **AC-8** Applying a global theme updates all slides' color scheme simultaneously
  without requiring individual slide edits.

---

## Open Questions

| # | Question                                                                                 | Owner | Status   |
|---|------------------------------------------------------------------------------------------|-------|----------|
| 1 | Should the AI model for slide generation be user-selectable per deck, or set globally? | Team  | Open     |
| 2 | Are there specific Saudi nonprofit brand guidelines or color restrictions to follow?    | Team  | Open     |
