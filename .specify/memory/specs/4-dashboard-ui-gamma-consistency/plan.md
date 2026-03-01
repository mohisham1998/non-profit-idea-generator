# Implementation Plan — Dashboard UI & Gamma Consistency

**Feature**: Dashboard UI & Gamma Consistency
**Branch**: `4-dashboard-ui-gamma-consistency`
**Date**: 2026-02-23
**Spec**: [spec.md](./spec.md)

---

## Summary

Replace leftover orange from the old theme with the new primary color or dashboard accent across the app, align the project generation progress screen with dashboard styling, and ensure output slides conform to the Gamma Slides Redesign spec. The system must generate slides with many different layouts (card grids, numbered sections, stat blocks, icon lists) so output is formatted and presentable—not solid text blocks—and suitable for Saudi nonprofit organizational plans. The fix is a visual consistency pass—no backend schema changes—focusing on CSS, Tailwind classes, and component theming.

---

## Technical Context

| Item | Value |
|------|-------|
| **Language/Version** | TypeScript 5.9, React 19 |
| **Primary Dependencies** | Tailwind CSS, Framer Motion, Recharts, Radix UI |
| **Storage** | N/A (UI-only changes) |
| **Testing** | Vitest, React Testing Library |
| **Target Platform** | Web (Chrome, Safari, Firefox) |
| **Project Type** | Web application (React SPA) |
| **Performance Goals** | No regressions; CSS-only changes |
| **Constraints** | Preserve RTL, Cairo font, `--primary` CSS variable |
| **Scale/Scope** | ~30 files with orange/amber references; slide builder + export |

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| P1 — AI Content Generation via OpenRouter | ✅ | No changes to AI flows |
| P2 — Admin Dashboard UI | ✅ | Aligns UI with dashboard design |
| P3 — User Profile with Quota Limit | ✅ | No changes |
| P4 — Full Customization of Slide Layouts | ✅ | Gamma alignment supports customization |
| P5 — Real-Time AI Refinement | ✅ | No changes |
| P6 — Future Expansion & Integration | ✅ | Design system consistency aids future work |
| P7 — Arabic Language & RTL Support | ✅ | RTL and Cairo preserved |

---

## Project Structure

### Source Code (relevant paths)

```text
client/
├── src/
│   ├── components/
│   │   ├── ProgressIndicator.tsx    # Project generation progress (align with dashboard)
│   │   ├── SlideBuilder/
│   │   │   ├── SlideCard.tsx        # Slide styling, accent colors
│   │   │   └── StylePanel.tsx       # Color themes
│   │   ├── StatCard.tsx             # Theme variants
│   │   ├── TemplateSelector.tsx     # Decorative accents
│   │   ├── ExportPDFButton.tsx      # Button styling
│   │   └── ...
│   ├── pages/
│   │   ├── Home.tsx                 # Uses ProgressIndicator
│   │   ├── Login.tsx                # Old-theme orange
│   │   ├── AdminDashboard.tsx       # Old-theme amber/orange
│   │   ├── ProjectDashboard.tsx     # Old-theme orange gradients
│   │   ├── ProgramEvaluation.tsx    # Old-theme orange
│   │   ├── DeckLibrary.tsx          # Archived badge (orange)
│   │   ├── ModelSettings.tsx        # Error banner (amber - keep for warnings)
│   │   ├── UsageQuota.tsx           # Error/status (amber - keep for warnings)
│   │   ├── DashboardHome.tsx        # StatCard theme
│   │   ├── ColorSettings.tsx        # Gradient backgrounds
│   │   ├── BrandingSettings.tsx     # Color presets (orange option)
│   │   └── ...
│   ├── lib/
│   │   ├── convertToSlides.ts       # Default colors per card type
│   │   ├── pdfGenerator.ts          # Hardcoded orange (#f97316)
│   │   └── templates.ts             # Template gradients
│   └── styles/
│       ├── tokens.css               # Design system (warning = amber, OK)
│       └── index.css
```

---

## Proposed Changes

### Phase 1: Replace Leftover Orange (P1)

**Goal**: Replace old-theme orange with new primary/dashboard accent. Use CSS variable `--primary` or Tailwind `primary` where accents belong; use cyan/teal for dashboard-default.

| File | Change |
|------|--------|
| `client/src/pages/Login.tsx` | Replace `from-orange-*`, `to-orange-*`, `text-orange-*`, `border-orange-*` with `primary` or `cyan` variants |
| `client/src/pages/AdminDashboard.tsx` | Replace `from-amber-*`, `to-orange-*` gradients with `primary`/`cyan` |
| `client/src/pages/ProjectDashboard.tsx` | Replace orange gradients, progress bars, risk indicators with `primary` or semantic colors (green/yellow/red for budget/risk) |
| `client/src/pages/ProgramEvaluation.tsx` | Replace orange card headers, borders, gradients with `primary` |
| `client/src/pages/DeckLibrary.tsx` | Change Archived badge from `bg-orange-*` to `bg-amber-*` (semantic) or `primary` per design |
| `client/src/pages/ColorSettings.tsx` | Replace orange gradient backgrounds with `primary`/cyan |
| `client/src/components/StatCard.tsx` | Remove or repurpose `orange` theme; use `primary` for accent variant |
| `client/src/components/TemplateSelector.tsx` | Replace `amber-400` decorative accents with `primary` |
| `client/src/components/ExportPDFButton.tsx` | Replace `from-red-500 to-orange-500` with `primary` gradient |
| `client/src/components/Background3D.tsx` | Replace `#f97316` with primary variable |
| `client/src/lib/pdfGenerator.ts` | Replace hardcoded `#f97316` with `var(--primary)` or equivalent |
| `client/src/lib/templates.ts` | Replace orange in template gradients with primary |
| `client/src/lib/convertToSlides.ts` | Change default `cover` and `designThinking` from `orange` to `primary` |

**Semantic color exceptions** (keep as-is or use amber where meaning is warning):

- `ModelSettings.tsx`, `UsageQuota.tsx`: Error/warning banners (`bg-amber-*`) — semantically correct for warnings.
- `DeckLibrary.tsx` Archived badge: Can stay amber (warning-like) or switch to neutral; avoid orange as old-theme accent.
- SWOT Threats quadrant: Gamma spec uses amber; keep amber for semantic distinction.
- EditableBudget, ValueAddAnalysis: Amber for budget/value context is acceptable.

### Phase 2: Progress Indicator Alignment (P1)

**Goal**: Make `ProgressIndicator` (جاري توليد المشروع) match dashboard styling.

| File | Change |
|------|--------|
| `client/src/components/ProgressIndicator.tsx` | Replace `purple-*` and `indigo-*` with `primary` / `cyan` (dashboard accent). Use `bg-primary`, `text-primary`, `border-primary` and card styling consistent with `DashboardHome` and `UsageQuota`. |

**Target style**:

- Card: White/light background, subtle border, `shadow-md`
- Progress bars: `bg-primary` (uses `--primary` CSS variable)
- Active stage: `text-primary`
- Icon container: `bg-primary` gradient
- Message text: `text-muted-foreground` or `text-primary/80`

### Phase 3: Slide Builder & Export Gamma Alignment (P2)

**Goal**: Ensure slide output matches Gamma Slides Redesign spec; use new primary instead of orange.

| File | Change |
|------|--------|
| `client/src/components/SlideBuilder/SlideCard.tsx` | Update `idea` card style from `from-amber-500 to-orange-600` to primary gradient; ensure `orange`/`amber` accent keys use primary when applied as layout accent |
| `client/src/components/SlideBuilder/StylePanel.tsx` | Keep `orange` and `amber` as user-selectable layout options; ensure default/fallback uses primary |
| `client/src/lib/convertToSlides.ts` | Default cover and designThinking to `primary` instead of `orange` |
| `client/src/lib/pdfGenerator.ts` | Use `var(--primary)` for section headers and accents; remove hardcoded `#f97316` |
| `client/src/lib/templates.ts` | Update template gradients to use primary; remove orange from default palette |

**Gamma spec reference** (1-gamma-slides-redesign):

- Cover: gradient/template background, title, subtitle, target audience
- KPI: progress bars, icons
- Budget: category breakdown, progress bars
- SWOT: Quadrants (Strengths/Green, Weaknesses/Red, Opportunities/Blue, Threats/Amber)
- Custom: Layout options

Verify SlideCard layouts, typography, spacing, and backgrounds match Gamma spec; fix any discrepancies.

**Varied layouts (FR-7)**: Ensure the system maps content to multiple layout types (card grids, numbered sections, stat blocks, icon lists, KPI blocks) so no slide is a single block of solid text. Update `convertToSlides.ts` / slide templates to use layout variants per content type.

**Saudi nonprofit styling (FR-8)**: Ensure layouts are professional, structured, RTL-ready, and appropriate for formal presentations to donors, boards, and government stakeholders.

### Phase 4: Design Tokens & Theming

| File | Change |
|------|--------|
| `client/src/styles/tokens.css` | Ensure `--primary` is the canonical accent; no new orange tokens. Warning can stay as amber. |
| `client/index.css` | Confirm `.quota-progress` and similar use `--primary` |
| `client/src/pages/BrandingSettings.tsx` | Keep orange as a preset option (user may choose it); ensure `--primary` is set from selection |

---

## Implementation Order

1. **Phase 1**: Replace leftover orange across pages and shared components.
2. **Phase 2**: Update `ProgressIndicator` to use dashboard styling.
3. **Phase 3**: Align slide builder and export with Gamma spec and primary.
4. **Phase 4**: Validate design tokens and run visual audit.

---

## Verification Plan

### Manual Verification

- [ ] Navigate all main screens; confirm no leftover old-theme orange where primary should appear.
- [ ] Hover over buttons, links, cards; confirm hover states use primary.
- [ ] Start project generation; verify progress card matches dashboard (card style, primary accents).
- [ ] Generate a deck; verify slides match Gamma spec (layouts, typography, primary accents).
- [ ] Verify slides use varied layouts (cards, grids, stats, numbered sections); no solid text blocks.
- [ ] Confirm output is suitable for Saudi nonprofit organizational plans (professional, structured, RTL-ready).
- [ ] Export to PDF/PowerPoint; verify Gamma-style preserved, no hardcoded orange.

### Automated Tests

- [ ] No new failures in existing tests after color/token changes.
- [ ] Optional: Add a visual regression or CSS lint rule to flag `orange-500`, `orange-600`, `#f97316`, `#ea580c` in non-exception files.

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Third-party charts use orange by default | Low | Override via Recharts `theme` or custom colors prop |
| Branding preset "orange" conflicts with "no leftover" goal | N/A | User-selected orange is allowed; only old-theme leftovers are replaced |
| PDF export loses primary variable | Medium | Use computed primary at export time; fallback to hex in pdfGenerator |
