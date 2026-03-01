# Feature Specification — Slide Output Gamma Presentation Audit

**Feature**: Slide Output Gamma Presentation Audit
**Branch**: `5-slide-gamma-presentation-audit`
**Created**: 2026-02-23
**Status**: Draft
**Input**: Audit slide output: current output is too simple, not formatted, solid text, short slide height, not presentable; compare with Gamma examples; document limitations and requirements for Gamma-quality presentation output

---

## Clarifications

### Session 2026-02-23

- Q: When content is very long for a single slide, which strategy should the system use (paginate, split, scroll, truncate)? → A: Split into multiple slides automatically — each slide gets one focused idea.
- Q: How should "sufficient height" and "adequate padding" be defined for testability? → A: Match Gamma reference dimensions; slides MUST use standard PPTX/PDF slide dimensions (e.g. 16:9) so exports are correct—height aligned with PowerPoint and PDF output.
- Q: Who or what decides the layout for each slide (AI, rules, user, fixed)? → A: AI decides layout dynamically per slide based on content type—just like Gamma.app. This is core to the app: AI selects the best presentation format for each slide to maximize professionalism and stakeholder impact. Layouts are completely generic and dynamic; each slide gets its own optimal layout.
- Q: What visual style should numbered badges use (explicit specs, Gamma reference, theme primary, AI-decided)? → A: Use theme primary color for badges—slides MUST follow the dashboard's customizable primary color to match the nonprofit's branding and design guidelines. The Gamma examples shown were a custom theme, not Gamma's default style.
- Q: What is the icon source and selection method (user uploads, AI from library, fixed set, external service)? → A: AI selects contextually appropriate icons from a reliable, free predefined library (e.g. Lucide/Heroicons). AI has full control over icon selection to optimize page layout and presentation quality.

---

## Summary

This spec documents the audit of current slide output compared to Gamma-app quality. The current output is simple, unformatted, uses solid text blocks, has insufficient slide height, and is not presentable. Gamma provides professionally designed, varied, well-structured slides with AI-driven dynamic layout selection. This spec captures the audit findings, current limitations, and functional requirements to achieve Gamma-quality presentation output where AI selects the optimal layout for each slide to maximize professionalism and stakeholder impact—the core idea of the app.

---

## Audit Findings

### Bad Examples (Current Output)

| Issue | Description |
| ----- | ----------- |
| Simple layout | Output is plain text with straightforward icons; lacks visual hierarchy and structure |
| Not formatted | No cards, panels, numbered badges, or distinct section blocks |
| Solid text blocks | Content (e.g., feature lists, المميزات) appears as dense, uninterrupted text—hard to scan |
| Slide height too short | Vertical space is insufficient; content feels cramped |
| Not presentable | Output does not meet professional presentation standards for donors, boards, or government stakeholders |

### Good Examples (Gamma Target)

| Attribute | Gamma Characteristics |
| --------- | ---------------------- |
| Structured layout | Colored panels, clear headers with icons, distinct content blocks |
| Varied layouts | Two-column, quadrant diagrams, 2D matrix charts, user journey flows, numbered section cards |
| Typography | Strategic bolding, font hierarchy, color accents for key metrics or terms |
| Visual elements | Icons integrated into design (not isolated); numbered badges in colored rectangles |
| Adequate height | Slide height used effectively; ample white space and padding |
| Professional | Ready for formal nonprofit presentations in Saudi Arabia |

---

## Current Limitations

1. **Slide height**: Too small; content does not use vertical space effectively; slides feel cramped.
2. **Solid text blocks**: No visual separation—lists and features appear as single dense paragraphs.
3. **Simple layout**: No colored panels, section headers with icons, or distinct card-like blocks.
4. **Limited layout types**: No two-column layouts, quadrant diagrams, 2D matrices, user journey flows, or numbered section cards.
5. **Weak hierarchy**: No strategic bolding, color accents for metrics/key terms, or numbered badges.
6. **Icon usage**: Icons are basic and not integrated into richer visual elements or headers.
7. **Content structure**: No modular blocks (e.g., feature cards, challenge cards) for easy scanning.

---

## User Scenarios & Testing

### User Story 1 — Adequate Slide Height (Priority: P1)

As a nonprofit admin, I want each slide to have sufficient height so that content is not cramped and uses the available space effectively, matching Gamma-style proportions.

**Why this priority**: Cramped slides undermine professionalism and readability; donors and boards expect polished presentations.

**Independent Test**: Generate a deck and measure slide height; compare to Gamma examples; verify content is not compressed.

**Acceptance Scenarios**:

1. **Given** a slide deck is generated, **When** the user views any slide, **Then** the slide height is sufficient for the content, with adequate padding and white space.
2. **Given** content of varying length, **When** slides are rendered, **Then** vertical space adapts or is sized appropriately so content does not appear cramped.
3. **Given** a Gamma reference slide and export to PDF/PowerPoint, **When** comparing dimensions, **Then** output slides use standard PPTX/PDF proportions (e.g. 16:9) and match Gamma reference; exported files display correctly.

---

### User Story 2 — No Solid Text Blocks (Priority: P1)

As a nonprofit admin, I want content to be broken into distinct, formatted sections (cards, panels, numbered lists with badges) so that no slide appears as a single block of solid text.

**Why this priority**: Solid text blocks are hard to scan and unprofessional; Gamma uses structured blocks for every content type.

**Independent Test**: Generate a deck with feature lists, challenges, or detailed goals; verify each appears in formatted blocks, not one dense paragraph.

**Acceptance Scenarios**:

1. **Given** a slide contains a list (e.g., features, goals, challenges), **When** rendered, **Then** each item appears in a distinct block or card—not a single paragraph.
2. **Given** numbered content, **When** rendered, **Then** numbers appear in visually distinct badges or blocks (e.g., rounded rectangles) using the dashboard's customizable primary color.
3. **Given** any slide, **When** viewed, **Then** no slide consists of a single uninterrupted block of text.

---

### User Story 3 — Rich Layout Variety (Priority: P2)

As a nonprofit admin, I want slides to use varied layouts (two-column, quadrant diagrams, user journey flows, matrix charts, stat blocks) appropriate to content type so that presentations match Gamma-quality design.

**Why this priority**: Varied layouts improve comprehension and professionalism; single-layout output feels monotonous and amateur.

**Independent Test**: Generate a deck and verify multiple layout types are used; compare structure to Gamma examples.

**Acceptance Scenarios**:

1. **Given** content suited to comparison (e.g., KPIs, benefits), **When** rendered, **Then** slides may use two-column layout or quadrant-style diagrams where appropriate.
2. **Given** sequential content (e.g., user journey, process steps), **When** rendered, **Then** a flow or timeline layout with clear step indicators is used.
3. **Given** a deck, **When** viewed, **Then** layouts vary by content type (e.g., stats as blocks, challenges as cards, goals as numbered sections).

---

### User Story 4 — Strong Visual Hierarchy (Priority: P1)

As a nonprofit admin, I want clear headings, strategic bolding, color accents for key terms/metrics, and integrated icons so that information is easy to scan and visually engaging.

**Why this priority**: Weak hierarchy makes slides hard to parse; donors and boards need to grasp key points quickly.

**Independent Test**: Generate a deck and verify headings, bolding, and accents; compare to Gamma examples.

**Acceptance Scenarios**:

1. **Given** a slide with section headers, **When** rendered, **Then** headers use distinct styling (size, color, icons) and are visually separated from body content.
2. **Given** content with key metrics or terms, **When** rendered, **Then** those terms are emphasized (e.g., bold, color accent) for quick scanning.
3. **Given** icons, **When** rendered, **Then** they are contextually appropriate (AI-selected from a reliable, free library like Lucide/Heroicons), integrated into headers or design elements, and not isolated or arbitrary.

---

### Edge Cases

- What happens when content is very long for a single slide? The system MUST split into multiple slides automatically—each slide gets one focused idea. Never compress into a cramped single block, paginate within a slide, or use scrollable sections.
- How does the system handle Arabic/RTL? All layout logic MUST support RTL; numbered badges and flow diagrams MUST render correctly in RTL.

---

## Requirements

### Functional Requirements

- **FR-1** Each slide MUST use standard PPTX/PDF slide dimensions (e.g. 16:9 aspect ratio) so that in-app display and export to PowerPoint/PDF are consistent; slide height and proportions MUST match Gamma reference and never appear cramped.
- **FR-2** Lists (features, goals, challenges, etc.) MUST be rendered as distinct blocks, cards, or numbered sections—never as a single solid text block.
- **FR-3** Numbered content MUST use visually distinct numbering (e.g., numbered badges in rounded rectangles) using the dashboard's customizable primary color to match the nonprofit's branding and design guidelines.
- **FR-4** The system MUST support varied layout types: two-column, quadrant diagrams, user journey flows, stat blocks, and card grids. AI MUST dynamically select the best layout for each slide based on content type and volume to maximize presentation quality—just like Gamma.app. Layouts are completely generic and dynamic; each slide gets its own optimal layout.
- **FR-5** Section headers MUST have clear visual hierarchy (size, color, optional icons) and be separated from body content.
- **FR-6** Key metrics, terms, or data points MUST be visually emphasized (e.g., bold, color accent) for quick scanning.
- **FR-7** Icons MUST be integrated into headers or design elements, not presented as isolated, arbitrary graphics. AI MUST select contextually appropriate icons from a reliable, free predefined library (e.g. Lucide/Heroicons) with full control over icon selection to optimize layout and presentation quality.
- **FR-8** No slide MAY consist of a single uninterrupted block of text; content MUST be structured into logical sections or blocks. AI MUST ensure text appears perfectly formatted and well-presented to stakeholders in all layouts.
- **FR-9** All layout and formatting MUST support Arabic RTL correctly; numbered badges and flow diagrams MUST render appropriately in RTL.
- **FR-10** When content is too long for a single slide, the system MUST split it into multiple slides automatically—each slide gets one focused idea. Never compress, paginate within a slide, or use scrollable sections.

### Key Entities

- **Slide Layout**: The structural arrangement of content (height, blocks, columns, diagrams); must support varied, Gamma-style layouts.
- **Content Block**: A distinct unit of content (card, panel, numbered section); replaces solid text blocks.
- **Visual Hierarchy**: Headings, bolding, color accents, and icon placement; enables quick scanning.

---

## Success Criteria

### Measurable Outcomes

- **SC-1**: Slide dimensions match standard PPTX/PDF (16:9) and pass visual comparison with Gamma examples; no slide appears cramped; exported PDF and PowerPoint use correct slide proportions.
- **SC-2**: No slide contains a single solid block of text; all lists and dense content are broken into distinct blocks or cards.
- **SC-3**: At least three distinct layout types (e.g., two-column, cards, flow) are used across a typical deck.
- **SC-4**: Headers, key terms, and icons follow a clear visual hierarchy; users can quickly identify main points.
- **SC-5**: Output is suitable for formal nonprofit presentations in Saudi Arabia; stakeholders rate it as presentable and professional.

---

## Assumptions

- Gamma examples (images 3–7) define the target visual quality for formatting and layout structure; the color scheme shown is a custom theme (not Gamma's default), and implementation MUST use the nonprofit's customizable primary color from dashboard branding.
- Slides are primarily for export to PDF and PowerPoint; dimensions and proportions MUST align with PPTX/PDF standards (e.g. 16:9) so exports display correctly.
- AI-driven dynamic layout selection is the core idea of the app: AI chooses the best layout per slide (like Gamma.app) to ensure maximum presentation quality and stakeholder impact.
- All slide visual elements (badges, accents, headers) MUST follow the dashboard's customizable primary color to match each nonprofit's branding and design guidelines.
- Icons are sourced from a reliable, free predefined library (e.g. Lucide/Heroicons already in project); AI has full control over icon selection to optimize presentation.
- Existing slide builder and export pipeline will be extended; no replacement of core generation flow.
- Spec 4 (Dashboard UI & Gamma Consistency) and Spec 1 (Gamma Slides Redesign) remain dependencies; this spec refines and adds audit-derived requirements.
- Cairo font and RTL support are already in place; this spec adds layout and formatting requirements that must work with RTL.

---

## Dependencies

- Gamma Slides Redesign (1-gamma-slides-redesign) for slide types and base design.
- Dashboard UI & Gamma Consistency (4-dashboard-ui-gamma-consistency) for varied layouts and no-solid-text requirements.
- Existing slide builder, `convertToSlides`, and `SlideCard` components.
