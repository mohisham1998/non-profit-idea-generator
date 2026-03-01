# Feature Specification: Slide Visual Export Fix

**Feature Branch**: `6-slide-visual-export-fix`  
**Created**: 2026-02-28  
**Status**: Draft  
**Input**: Fix slide visualization with AI images, icons, Gamma layouts, and pixel-perfect PDF/PPTX export

---

## Clarifications

### Session 2026-02-28

- Q: Which AI image generation service should be used? → A: OpenAI DALL-E 3 via OpenRouter API (counts toward API consumption like normal prompts, already integrated, high-quality realistic images).
- Q: Where should generated images be stored? → A: Database blob storage (PostgreSQL binary data), 10GB storage limit per user, tracked and displayed on API Consumption page.
- Q: When should images be generated? → A: Background generation with lazy loading - show placeholder immediately, generate asynchronously, reveal when ready, then cache in database.
- Q: Where should images be positioned in slide layouts? → A: Inline with content - AI decides image placement(s) per layout (single or multiple images), positioned within content flow based on smart layout type (e.g., beside stat blocks, between sections, in two-column splits).
- Q: What should placeholder images look like during loading or failures? → A: Gradient backgrounds (using theme colors) with large contextual icon - professional, no external assets needed, programmatically generated.
- Q: How should slides be converted to PDF/PPTX for pixel-perfect export? → A: html-to-image approach - each card/slide exported as image with exact styling from portal, then embedded in PDF/PPTX.

---

## Summary

This specification addresses critical issues in the current slide output system: slides render as plain text without visual hierarchy, AI-generated images are missing, icons are not contextually placed, layouts don't match Gamma-style presentation quality, and PDF/PPTX exports lose all styling and formatting. The feature will transform slides from basic text output into polished, marketing-grade presentation decks with automatic image generation (Saudi-context aware), contextual icon placement, smart Gamma-style layouts, and pixel-perfect exports that preserve all visual elements.

---

## User Scenarios & Testing

### User Story 1 — Visual Slide Rendering with Images & Icons (Priority: P1)

As a nonprofit admin, I want slides to automatically include relevant, realistic, Saudi-context images and contextual icons so that presentations look professional and visually engaging rather than plain text.

**Why this priority**: Plain text slides are unprofessional and fail to engage donors, boards, and government stakeholders. Visual elements are essential for credibility and impact.

**Independent Test**: Generate a deck with features, KPIs, and budget slides; verify each slide contains contextually appropriate images (Saudi-based, realistic, professional) and icons (placed near headers, stats, or key sections).

**Acceptance Scenarios**:

1. **Given** a slide with KPIs content, **When** the slide is rendered, **Then** each KPI section displays a contextual icon (e.g., Gauge, TrendingUp), a placeholder appears for the image location, and the Saudi-context image reveals automatically when generation completes (3-10s).
2. **Given** a slide with budget breakdown, **When** the slide is rendered, **Then** the slide includes a DollarSign or Coins icon for each category and a professional financial/planning image (Saudi business context).
3. **Given** a slide with program features, **When** the slide is rendered, **Then** each feature card displays a Sparkles or relevant icon and the slide includes an inspiring Saudi community/impact image.
4. **Given** any slide type, **When** AI selects an image, **Then** the image is realistic (not abstract), culturally accurate for Saudi Arabia, and professionally appropriate for nonprofit presentations.

---

### User Story 2 — Gamma-Style Smart Layouts (Priority: P1)

As a nonprofit admin, I want slides to use varied, intelligent layouts (stat blocks, card grids, two-column, quadrants, flows) based on content type so that presentations match Gamma-app quality and are easy to scan.

**Why this priority**: Single-layout output feels monotonous and amateur; varied layouts improve comprehension and professionalism—core to stakeholder impact.

**Independent Test**: Generate a deck with multiple slide types (vision, goals, KPIs, SWOT, budget); verify at least 4 different layout types are used and content is structured (no solid text blocks).

**Acceptance Scenarios**:

1. **Given** a slide with SWOT analysis, **When** the slide is rendered, **Then** it uses a quadrant layout with four distinct sections (strengths, weaknesses, opportunities, threats) with icons and color-coded backgrounds.
2. **Given** a slide with 6-8 KPIs, **When** the slide is rendered, **Then** it uses a stat blocks or card grid layout with each KPI in its own visual block (not a list).
3. **Given** a slide with vision and target audience, **When** the slide is rendered, **Then** it uses a two-column layout (vision on one side, audience details on the other) or image+text split.
4. **Given** a slide with sequential steps or timeline, **When** the slide is rendered, **Then** it uses a flow or numbered layout with visual connectors between steps.
5. **Given** any slide, **When** rendered, **Then** no slide consists of a single uninterrupted text block—all content is structured into cards, badges, headers, or stat blocks.

---

### User Story 3 — Pixel-Perfect PDF/PPTX Export (Priority: P1)

As a nonprofit admin, I want PDF and PowerPoint exports to exactly match the visual slide rendering (layout, images, icons, colors, fonts, spacing) so that exported files are presentation-ready without manual reformatting.

**Why this priority**: Current exports strip all styling, making them unusable for stakeholder presentations. Export fidelity is non-negotiable for professional use.

**Independent Test**: Generate a deck, export to PDF and PPTX; open both files and compare to on-screen slides; verify layout, images, icons, colors, Cairo font, RTL, and spacing are identical.

**Acceptance Scenarios**:

1. **Given** a slide with card grid layout and icons, **When** exported to PDF, **Then** the PDF shows the same card grid structure, all icons render correctly, and layout matches the on-screen version.
2. **Given** a slide with an AI-generated image and stat blocks, **When** exported to PowerPoint, **Then** the PPTX file includes the image in the correct position, stat blocks with icons, and all colors/fonts preserved.
3. **Given** a slide with Arabic text and RTL layout, **When** exported to PDF or PPTX, **Then** text direction is RTL, Cairo font is used, and alignment is correct (right-aligned).
4. **Given** a slide with theme primary color on badges and headers, **When** exported, **Then** the primary color is preserved in the exported file (not replaced with default colors).
5. **Given** a multi-slide deck, **When** exported, **Then** all slides maintain consistent 16:9 dimensions and visual fidelity across the entire document.

---

### User Story 4 — Dynamic Slide Height & Content Adaptation (Priority: P2)

As a nonprofit admin, I want slides with long content (budget categories, detailed objectives, SWOT items) to expand vertically or intelligently paginate so that no content is truncated or cut off.

**Why this priority**: Truncated content makes slides unusable and unprofessional. Content must be fully visible and well-structured.

**Independent Test**: Generate a slide with 12+ budget categories or 10+ detailed objectives; verify all content is visible, well-spaced, and not cut off.

**Acceptance Scenarios**:

1. **Given** a budget slide with 15 categories, **When** the slide is rendered, **Then** all 15 categories are visible, either by expanding the slide height or intelligently splitting into multiple slides (e.g., "Budget (1 of 2)").
2. **Given** a KPI slide with 12 indicators, **When** the slide is rendered, **Then** all 12 KPIs are displayed in a multi-row grid or across multiple slides without truncation.
3. **Given** a SWOT slide with 8+ items per quadrant, **When** the slide is rendered, **Then** each quadrant expands to fit content or uses scrollable/paginated layout, ensuring no items are hidden.
4. **Given** any slide, **When** content exceeds the 16:9 viewport, **Then** the system either increases slide height (for export) or splits content across multiple slides with clear continuation indicators.

---

### Edge Cases

- What happens when AI image generation fails or returns an inappropriate image? → System uses gradient background (theme colors) with large contextual icon as placeholder.
- What happens when a user reaches their 10GB image storage limit? → System prevents new image generation, shows warning message, and suggests deleting old slide decks or upgrading storage quota.
- How does the system handle slides with mixed English and Arabic content? → RTL detection per text block; Arabic sections align right with Cairo font, English sections align left with Latin font.
- What happens when a slide has 20+ list items (e.g., detailed objectives)? → System splits into multiple slides (e.g., "Detailed Objectives (1 of 3)") with 6-8 items per slide, maintaining layout consistency.
- How does export handle very long slide decks (50+ slides)? → Export proceeds normally; PDF/PPTX libraries handle large documents; progress indicator shows export status.
- What happens when theme primary color is not set? → System uses default dashboard accent color (#0891b2 teal) for badges and accents.
- How does the system handle slides with no content or empty fields? → Skip empty slides; show placeholder text "لا يوجد محتوى" for empty sections within a slide.

---

## Requirements

### Functional Requirements

#### Visual Rendering

- **FR-001**: System MUST automatically generate and insert contextually relevant, realistic images for each slide based on content type (e.g., KPI slide → Saudi office/analytics image, budget slide → financial planning image).
- **FR-002**: All AI-generated images MUST be Saudi-context appropriate (culturally accurate, professionally suitable for nonprofit presentations, realistic not abstract).
- **FR-003**: System MUST automatically place contextual icons from Lucide library near headers, stats, KPIs, and feature cards based on content keywords (e.g., "goal" → Target icon, "budget" → DollarSign icon).
- **FR-004**: Slides MUST use varied layouts based on content type: stat blocks for KPIs, quadrants for SWOT, card grids for features, two-column for vision+audience, flow for timelines.
- **FR-005**: No slide MUST render as a single solid text block—all content MUST be structured into cards, badges, headers, stat blocks, or visual sections.
- **FR-006**: Slides MUST maintain 16:9 aspect ratio (1920×1080 pixels or 10×5.625 inches) for standard presentation compatibility.
- **FR-007**: Slides MUST use theme primary color from branding settings for all badges, numbered items, headers, and accents.

#### Image Generation

- **FR-008**: System MUST integrate with OpenAI DALL-E 3 via OpenRouter API to create realistic, contextually appropriate images per slide (counts toward API consumption).
- **FR-009**: Image prompts MUST include "Saudi Arabia", "professional", "realistic", and content-specific keywords (e.g., "nonprofit", "community", "education", "healthcare").
- **FR-010**: Generated images MUST be stored in PostgreSQL database as binary data (blob storage) to avoid regenerating on every render.
- **FR-010a**: System MUST enforce a 10GB storage limit per user for generated images.
- **FR-010b**: User's current image storage usage MUST be tracked and displayed on the API Consumption page.
- **FR-010c**: System MUST generate images asynchronously in the background after deck creation, showing placeholders with lazy loading until images are ready.
- **FR-010d**: When an image is generated, it MUST immediately reveal to the user (replacing the placeholder) and be cached in the database.
- **FR-011**: System MUST provide fallback placeholder images using gradient backgrounds (theme colors) with large contextual icons when AI generation fails or is loading.

#### Layout Intelligence

- **FR-012**: System MUST select layout type automatically based on content structure: lists → card grid or numbered layout, comparisons → two-column or quadrant, stats → stat blocks, sequential → flow or timeline.
- **FR-012a**: AI MUST decide image placement(s) per layout - single or multiple images positioned inline with content (e.g., beside stat blocks, in two-column splits, between sections) based on layout type.
- **FR-013**: Layouts MUST support RTL (Arabic) and LTR (English) text with correct alignment and icon positioning.
- **FR-014**: Layouts MUST adapt to content length: short content → centered/spacious, long content → grid or multi-column, very long → split across multiple slides.

#### Content Adaptation

- **FR-015**: System MUST split slides when content exceeds 800 characters or 8 content blocks, creating continuation slides with titles like "Features (1 of 3)".
- **FR-016**: Split slides MUST maintain layout consistency and visual continuity (same icons, colors, structure).
- **FR-017**: Slides with truncated content (due to fixed height) MUST either expand vertically for export or auto-split into multiple slides.

#### Export Fidelity

- **FR-018**: PDF export MUST preserve exact visual layout by converting each slide to an image using html-to-image (capturing exact styling from portal), then embedding in PDF with 16:9 dimensions.
- **FR-019**: PowerPoint export MUST preserve exact visual layout by converting each slide to an image using html-to-image (capturing exact styling from portal), then embedding in PPTX with 16:9 dimensions.
- **FR-020**: Exported files MUST maintain 16:9 dimensions for all slides.
- **FR-021**: Exported files MUST preserve RTL text direction and right-alignment for Arabic content.
- **FR-022**: Exported files MUST embed or reference all images used in slides (no broken image links).
- **FR-023**: Exported files MUST use Cairo font for Arabic text and maintain theme primary color for all accents.

### Key Entities

- **SlideVisualConfig**: Configuration for visual rendering (image generation enabled, icon placement rules, layout selection strategy, fallback images).
- **GeneratedImage**: AI-generated image metadata (prompt, URL, content type, cache key, generation timestamp).
- **LayoutTemplate**: Predefined layout structure (type, content block positions, image zones, icon placements, spacing rules).
- **ExportManifest**: Export configuration (format, dimensions, font embedding, image inclusion, style preservation rules).

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of generated slides include at least one contextually relevant image (AI-generated or fallback).
- **SC-002**: 100% of slides with stats, KPIs, or features include contextual icons (automatically placed).
- **SC-003**: Generated decks use at least 4 different layout types across slides (verified by layout type distribution).
- **SC-004**: 0% of slides render as solid text blocks (all content structured into visual components).
- **SC-005**: PDF and PPTX exports match on-screen rendering with 95%+ visual fidelity (layout, images, icons, colors, fonts preserved).
- **SC-006**: Users can export a 10-slide deck to PDF in under 10 seconds.
- **SC-007**: Users can export a 10-slide deck to PowerPoint in under 15 seconds.
- **SC-008**: Exported files open correctly in Adobe Reader (PDF) and Microsoft PowerPoint (PPTX) without errors or missing elements.
- **SC-009**: Slides with 15+ content items either expand to full height or split across 2+ slides with no truncation.
- **SC-010**: 100% of AI-generated images are Saudi-context appropriate and professionally suitable (validated by content review).

---

## Assumptions

- OpenAI DALL-E 3 is accessible via OpenRouter API (already integrated in project).
- Image generation API supports prompt-based generation with style parameters (realistic, professional, Saudi context).
- Generated images are stored in PostgreSQL database as binary blobs with 10GB per-user limit.
- Cairo font is available for PDF/PPTX export (already installed via pdfmake-rtl and system fonts).
- Theme primary color is stored in Supabase user branding settings (already implemented).
- Export libraries (pptxgenjs, jsPDF) support image embedding and complex layouts.
- Users have sufficient storage/bandwidth for image-heavy slide decks.

---

## Out of Scope

- Video embedding in slides (images only for this spec).
- Animated transitions or slide effects (static slides only).
- User-uploaded custom images (AI-generated and fallback images only).
- Real-time collaborative editing of slides (single-user editing only).
- Slide templates library or user-created templates (system-generated layouts only).
- Export to formats other than PDF and PPTX (Word, HTML, etc.).
- Offline mode or cached slide generation (online AI image generation required).

---

## Dependencies

- **AI Image Generation API**: OpenAI DALL-E 3 via OpenRouter (already integrated, counts toward API usage).
- **Image Storage**: PostgreSQL database blob storage (10GB per-user limit, tracked on API Consumption page).
- **Export Libraries**: pptxgenjs (PowerPoint), jsPDF + jspdf-rtl-support (PDF), file-saver (download).
- **Icon Library**: Lucide React (already integrated).
- **Layout Components**: Existing layout registry (TwoColumnLayout, QuadrantLayout, CardGridLayout, etc.).
- **Theme System**: Existing slideStore with theme.primaryColor from Supabase branding.

---

## Notes

- **Image Generation Performance**: Images generate asynchronously in background (3-10s each). Placeholders shown immediately with lazy loading; images reveal as they complete and are cached in database.
- **Saudi Context**: Image prompts must include "Saudi Arabia", "professional", "realistic" , "charities" , "donation" , and avoid culturally inappropriate elements (alcohol, inappropriate dress, non-Saudi landmarks).
- **Export Complexity**: Pixel-perfect export uses html-to-image to convert each React slide component to an image with exact portal styling, then embeds images in PDF/PPTX files.
- **Layout Selection**: AI layout selection enhanced to decide both layout type AND image placement(s) - determines where single or multiple images appear inline with content based on smart layout structure.
- **Fallback Strategy**: When AI image generation fails, use gradient backgrounds (theme colors) with large contextual icons as placeholders - professional, programmatically generated, no external assets required.
