# Implementation Plan — Admin Dashboard UI

**Feature**: Admin Dashboard UI
**Status**: Draft
**Date**: 2026-02-28
**Author**: Antigravity

---

## Background

The project requires converting the current slide-generation tool into a fully-fledged AI-powered admin dashboard for nonprofit charities. The dashboard must be RTL-only (Arabic), use the Cairo font, and provide a premium, animated experience (inspired by Gamma and modern Bootstrap admin templates). It will serve as the hub for managing slide decks, configuring branding (logo and primary color), selecting AI models via OpenRouter, and tracking quota usage.

**UI Refactoring**: The current implementation has a basic slide builder interface. This plan includes a complete UI refactoring to match modern admin dashboard aesthetics with:
- Card-based summary statistics with charts (pie, line, bar)
- Gradient-filled area charts for trends
- Professional data tables with status badges
- Animated sidebar with collapsible states
- Consistent design system (spacing, colors, shadows, typography)
- Responsive layouts for desktop/tablet/mobile

---

## Constitution Check

> Verify that this plan does not violate any principle in `.specify/memory/constitution.md`.

| Principle | Status | Notes |
|-----------|--------|-------|
| P1 — AI Content Generation via OpenRouter | ✅ | Backend integrates OpenRouter; frontend provides selection UI. |
| P2 — Admin Dashboard UI | ✅ | This plan implements the core dashboard layout and navigation. |
| P3 — User Profile with Quota Limit | ✅ | Quota usage UI and backend tracking via tenant API keys are included. |
| P4 — Full Customization of Slide Layouts | ✅ | To be handled primarily in the slide builder, but deck access is here. |
| P5 — Real-Time AI Refinement | ✅ | Supported by the underlying architecture. |
| P6 — Future Expansion & Integration | ✅ | Tech stack (Node.js, Postgres, React) supports future growth. |
| P7 — Arabic Language & RTL Support | ✅ | Strict RTL and Cairo font applied globally via Tailwind. |

---

## Proposed Changes

### Frontend (React, Tailwind CSS, Zustand, Framer Motion)

#### [NEW] `src/layouts/AdminLayout.tsx`
- Implement the main dashboard layout with the animated sidebar (Framer Motion) and central workspace.
- Enforce RTL direction (`dir="rtl"`) and Cairo font.

#### [NEW] `src/pages/DashboardHome.tsx`
- Implement the analytical overview with summary cards, interactive charts for token usage/deck trends, and recent actions strip.

#### [NEW] `src/pages/DeckLibrary.tsx`
- Implement modern data table layout for previously generated slide decks.
- Table columns: Code, Title, Slides, Status, Created Date, Actions.
- Status badges with color coding (Draft=gray, Published=green, Archived=orange).
- Row action buttons (Edit, View, Duplicate, Delete) with icons.
- Search input and filter controls (by status, date range).
- Pagination controls and empty state handling.

#### [NEW] `src/pages/ModelSettings.tsx`
- Fetch and display the live OpenRouter model list (grouped by provider).
- Implement selection persistence and the fallback warning banner if the fetch fails.

#### [NEW] `src/pages/BrandingSettings.tsx`
- Implement logo upload (max 2MB) and placement toggles (cover, footer, hidden).
- Implement primary color picker (presets + hex) that updates global CSS variables in real time.

#### [NEW] `src/pages/UsageQuota.tsx`
- Display total AI token cost (USD), plan limit, and a progress bar based on backend OpenRouter usage data.

#### [NEW] `src/store/useStore.ts`
- Implement Zustand store for global state management (user profile, theme customization, selected model, quota stats).

#### [NEW] `src/components/StatCard.tsx`
- Reusable statistics card component with icon, title, value, change percentage.
- Mini chart support (pie, line, bar charts).
- Hover lift effect and color theme variants.

#### [NEW] `src/components/AreaChart.tsx`
- Recharts integration for dual-axis area charts.
- Gradient fills under lines, interactive tooltips.
- Legend with RTL support and responsive sizing.

#### [NEW] `src/components/DataTable.tsx`
- Generic data table component with column configuration.
- Status badge renderer and action buttons per row.
- Sortable columns, pagination controls, empty state handling.

#### [NEW] `src/styles/tokens.css`
- Design system tokens: spacing scale, shadow depths, border radius.
- Color palette (primary, secondary, success, warning, danger with shades).
- Typography scale (xs to 4xl).

### Backend (Node.js, Express, PostgreSQL)

#### [MODIFY] `server/routes/api.js` (or equivalent entry point)
- Add or update endpoints for dashboard data: `/api/decks`, `/api/models`, `/api/branding`, `/api/usage`.

#### [NEW] `server/controllers/modelController.js`
- Fetch available models from OpenRouter API.
- Handle caching to prevent rate-limiting and serve on fallback.

#### [NEW] `server/controllers/usageController.js`
- Interface with OpenRouter API using the tenant's dedicated API key to fetch live cost/token usage.

#### [NEW] `server/controllers/brandingController.js`
- Handle logo uploads (validation, storage) and persisting color preferences to the user's profile in Postgres.

---

## Data Model Changes

- **User/Tenant Profile**: Add fields for `primaryColor`, `logoUrl`, `logoPlacement` ('cover', 'footer', 'hidden'), `selectedModelId`, `openRouterApiKey` (encrypted), and `quotaLimitUsd`.
- **Slide Deck**: Ensure fields exist for `title`, `creationDate`, `slideCount`, `thumbnailUrl`, and `tenantId`.

---

## API Changes

- `GET /api/models`: Returns list of available OpenRouter models.
- `GET /api/usage`: Returns current billing cycle token cost and limit.
- `PUT /api/branding`: Updates user branding preferences (color, logo).
- `GET /api/decks`, `POST /api/decks`, `PUT /api/decks/:id`, `DELETE /api/decks/:id`: CRUD operations for decks.

---

## UI/UX Considerations

- **RTL & Typography**: The entire app must be forced into RTL (`dir="rtl"` on `<html>` or `<body>`), using the Cairo font.
- **Animations**: Use Framer Motion for page transitions, sidebar toggling, card hover effects, and entrance animations to match the premium requirement (FR-13).
- **Theming**: The selected primary color will be injected as a CSS variable (e.g., `--color-primary`) and applied via Tailwind utility classes.
- **Accessibility**: ARIA labels in Arabic and high-contrast color warnings for branding selection.
- **Design System**: Implement consistent spacing (8px grid), shadows (sm/md/lg), border radius (4px/8px), and color palette across all components.
- **Responsive Design**: All components must adapt to desktop (full sidebar), tablet (collapsible sidebar), and mobile (hidden sidebar with hamburger menu) viewports.
- **Data Visualization**: Use Recharts for all charts with gradient fills, smooth animations, and RTL-aware legends.
- **Modern UI Elements**: Implement status badges, action buttons with icons, hover effects, loading skeletons, and empty states throughout.

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| OpenRouter API latency or downtime | Medium | Implement caching for model list and show warning banner with last known models. |
| Logo upload abuse | Low | Implement strict server-side validation (max 2MB, PNG/SVG only). |
| Contrast issues with custom colors | Medium | Implement a contrast checker in the UI to warn users if their color choice is illegible. |

---

## Verification Plan

### Automated Tests
- [ ] Backend: Unit tests for OpenRouter usage fetching and quota calculation matching limits.
- [ ] Backend: Unit tests for deck duplication logic.
- [ ] Frontend: Component tests for the model list fallback UI.

### Manual Verification
- [ ] Verify RTL layout and Cairo font application across all pages.
- [ ] Test the deck card actions (Rename, Duplicate, Delete) for correct state updates.
- [ ] Simulate OpenRouter fetch failure and verify the warning banner appears.
- [ ] Upload a logo and change the primary color; verify real-time updates across the dashboard components.
