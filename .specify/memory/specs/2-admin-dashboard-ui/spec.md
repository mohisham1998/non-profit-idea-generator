# Feature Specification — Admin Dashboard UI

**Feature**: Admin Dashboard UI
**Branch**: `2-admin-dashboard-ui`
**Status**: Draft
**Date**: 2026-02-28
**Author**: Team

---

## Summary

Design and build a fully animated, professional admin dashboard as the primary interface for the
nonprofit slide-generation application. The dashboard MUST use a white background with the Cairo
font family and operate exclusively in right-to-left (RTL) Arabic mode. It MUST serve as the
central hub for: browsing and managing previously generated slide decks, selecting the AI model
(from a live OpenRouter model list), customizing the organization's branding (logo and primary
color), and monitoring personal AI usage and quota consumption — all within a premium, visually
active interface.

**UI Refactoring Requirement**: The current slide builder UI must be completely refactored to match
modern admin dashboard aesthetics as shown in the reference images (e.g. TailAdmin-style). The new UI
should feature:
- Clean, card-based layouts with subtle shadows and hover effects
- Vibrant gradient charts and data visualizations
- Professional color schemes with smooth animations
- Sidebar navigation with collapsible menu
- Dashboard overview with summary statistics cards
- Modern table layouts for data display
- Responsive design that works across desktop and tablet viewports

**Design Reference (TailAdmin-style)**:
- **Navigation sidebar**: Dark blue/slate background (e.g. `#1e293b` / slate-800), section headers
  (MENU / SUPPORT / OTHERS in Arabic), icons + text, chevrons for expandable items
- **Active state**: Slightly darker background + accent border (e.g. cyan) on the inner edge
- **RTL & Cairo**: All layout MUST respect RTL; Cairo font family for all text
- **Animations**: Sidebar hover (subtle translate), collapse/expand transitions, page fade-in,
  card hover lift, progress bar fill animation
- **Cards & charts**: Summary stat cards with icons and distinct themes; area/line charts with
  gradient fills and tooltips; data tables with status badges and actions

---

## Constitution Alignment

- **P1 — AI Content Generation via OpenRouter**: The dashboard surfaces a live, user-selectable
  OpenRouter model list so the user controls which model is used for all AI generation tasks.
- **P2 — Admin Dashboard UI**: This feature IS the admin dashboard — sidebar, central workspace,
  settings, and branding panel are all defined here.
- **P3 — User Profile with Quota Limit**: Usage consumption tracking and quota display are core
  elements of this dashboard, sourced from the backend.
- **P6 — Future Expansion & Integration**: The model selector is designed as a configurable
  option, not hardcoded, enabling seamless addition of new OpenRouter models over time.
- **P7 — Arabic Language & RTL Support**: The dashboard operates exclusively in RTL Arabic
  (Cairo font), with no LTR fallback mode.

---

## User Stories

| ID   | As a…             | I want to…                                                                  | So that…                                                                       |
|------|-------------------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| US-1 | Nonprofit admin   | see a polished, animated admin dashboard on login                           | I get a professional, confidence-inspiring entry point to the application      |
| US-2 | Nonprofit admin   | browse all my previously generated slide decks from the dashboard           | I can quickly find and re-open any past presentation                           |
| US-3 | Nonprofit admin   | select which AI model (from OpenRouter's list) to use for generation        | I can balance between speed, quality, and cost based on my needs               |
| US-4 | Nonprofit admin   | upload my organization's logo to the dashboard                              | the interface and any exports reflect my brand identity                        |
| US-5 | Nonprofit admin   | choose a primary color that applies globally across the dashboard           | the tool feels like my organization's own platform                             |
| US-6 | Nonprofit admin   | see how many AI requests / slides I have generated vs. my quota             | I can track usage and plan ahead before reaching my limit                      |
| US-7 | Arabic-speaking admin | use the entire dashboard in Arabic, right-to-left, with no English UI   | the tool is immediately accessible and professional for my team                |

---

## Functional Requirements

### Must Have (P0)

- [ ] **FR-1** The dashboard MUST use a white (`#FFFFFF`) background as the base for all panels
  and the main workspace.
- [ ] **FR-2** The Cairo font family MUST be applied globally to all text elements in the
  dashboard (headings, labels, body, buttons).
- [ ] **FR-3** The entire dashboard layout MUST be RTL-only; no LTR mode or language toggle is
  required in this feature.
- [ ] **FR-4** The dashboard MUST include an animated sidebar with navigation sections for:
  Home / Dashboard, Slide Decks Library, AI Model Settings, Branding Settings, and Usage &
  Quota.
- [ ] **FR-5** The central workspace MUST display a grid or list of all previously generated
  slide decks, each shown as a card with: deck title, creation date, slide count, and a
  thumbnail preview of the first slide. Each card MUST expose a context menu (or action
  buttons on hover) with the following actions: **Open for editing**, **Rename**, **Duplicate**,
  and **Delete** (with a confirmation prompt before permanent deletion).
- [ ] **FR-6** Clicking "Open for editing" on a deck card MUST navigate the user into the
  slide builder for that deck. Clicking "Duplicate" MUST create an identical copy of the
  deck and add it to the library immediately, named "[original title] — نسخة". Clicking
  "Rename" MUST allow inline renaming of the deck title. Clicking "Delete" MUST prompt
  for confirmation then permanently remove the deck.
- [ ] **FR-7** The dashboard MUST provide an AI Model Settings page that fetches and displays
  the current list of available models from OpenRouter, allowing the user to select one as
  the active model.
- [ ] **FR-8** The selected AI model MUST be persisted to the user's profile and used as the
  default for all subsequent generation and refinement tasks.
- [ ] **FR-9** The Branding Settings page MUST allow the user to upload a custom logo image
  (PNG/SVG, max 2 MB) that always appears in the dashboard sidebar. The page MUST also
  provide a logo placement toggle for exported slide decks with three options the user can
  set independently:
    - **Cover page only** — logo appears on the first slide only.
    - **All slides (footer)** — a small logo appears in the footer of every slide.
    - **Hidden in exports** — logo is shown in the dashboard only, not in exported files.
  The selected placement MUST be persisted to the user's branding profile.
- [ ] **FR-10** The Branding Settings page MUST include a primary color picker; the selected
  color MUST apply to all accent elements across the dashboard (buttons, active states,
  progress bars, highlights) in real time.
- [ ] **FR-11** The Usage & Quota page MUST display: total AI token cost consumed (in USD)
  for the current monthly period, the plan quota ceiling (e.g., $50.00 for Basic plan), and
  a visual progress bar indicating remaining token budget — all sourced from the tenant's
  OpenRouter API key consumption data.
- [ ] **FR-12** All usage and cost data MUST be fetched from OpenRouter's usage/cost API
  using the tenant's dedicated API key. Data MUST NOT be hardcoded or simulated in the
  frontend. The dashboard MUST display cost with two decimal places in USD (e.g., "$12.47
  of $50.00 used").
- [ ] **FR-13** The dashboard MUST include micro-animations for: sidebar hover states, card
  hover effects (subtle lift/shadow), page transition fade-ins, and progress bar fills on
  load.

### Should Have (P1)

- [ ] **FR-14** The deck library SHOULD support search by deck title in Arabic.
- [ ] **FR-15** The deck library SHOULD support sorting by: newest first, oldest first, and
  most slides.
- [ ] **FR-16** The AI Model Settings page SHOULD group OpenRouter models by category or
  provider for easier scanning.
- [ ] **FR-17** The primary color picker SHOULD offer a palette of curated nonprofit-friendly
  presets in addition to a free hex/HSL input.
- [ ] **FR-18** The sidebar SHOULD collapse to an icon-only rail on narrower viewports while
  remaining RTL-aligned.
- [ ] **FR-19** The Usage & Quota section SHOULD display a breakdown of usage by time period
  (e.g., this month vs. prior months).
- [ ] **FR-23** If the OpenRouter model list cannot be fetched (network failure, API key error,
- [ ] **FR-24** If the OpenRouter model list cannot be fetched (network failure, API key error,
  or rate limit), the dashboard MUST display the last successfully cached model list and
  show a visible warning banner (e.g., "قائمة النماذج قد لا تكون محدّثة") to inform the
  user. The user MUST still be able to view and confirm their currently selected model.

### Nice to Have (P2)

- [ ] **FR-20** The dashboard Home page MUST present an analytical overview consisting of:
  - **Summary cards** showing key metrics: total decks created, total AI token cost used this month, and remaining quota percentage.
  - **Interactive charts** visualizing token usage over time (daily/weekly) and deck creation trends.
  - **Recent actions strip** displaying the latest 5 user actions (deck created, model changed, branding updated) with timestamps.
  - Each widget must be clickable to navigate to the relevant detailed view (e.g., clicking the usage chart opens a full usage analytics page).
  - All charts and cards must respect RTL layout and use the primary brand color for accents.
  - The Home page must load within 2 seconds on a standard broadband connection.
- [ ] **FR-21** The branding color MAY be exportable so that generated PDF/PowerPoint files
  also reflect the chosen primary color.
- [ ] **FR-22** The dashboard MAY support a dark-mode variant while preserving Cairo font and
  RTL layout.
- [ ] **FR-23** The dashboard home/overview page MAY show a summary widget with: recent
  activity, quick-create button, and a motivational stats card (e.g., "10 decks created
  this month").

### UI Refactoring Requirements (P0 - Must Have)

- [ ] **FR-25** The dashboard home page MUST display summary statistics in card format with:
  - Total Active Users count with percentage change indicator
  - Total Sales count with pie chart visualization
  - Orders Received count with line chart trend
  - Total Income amount with bar chart visualization
  - Each card MUST have a distinct color scheme and icon
  - Cards MUST have subtle hover effects and shadows
- [ ] **FR-26** The dashboard MUST include area/line charts displaying:
  - Recent Report trends with dual-axis visualization (Services vs Products)
  - Smooth gradient fills under chart lines
  - Interactive tooltips on hover
  - Legend with color-coded labels
  - Grid lines for better readability
- [ ] **FR-27** The dashboard MUST display data tables with:
  - Project listings with columns: Code, Employees, Product, Project Name, Status, Email, Name
  - Status badges with color coding (Active=green, Pending=orange, etc.)
  - Action buttons (edit, view) for each row
  - Pagination or infinite scroll for large datasets
  - Sortable columns
- [ ] **FR-28** The sidebar navigation MUST include:
  - Dark background (slate/blue tones) with section groupings (e.g. القائمة الرئيسية, الدعم, أخرى)
  - Collapsible menu with smooth animations
  - Icon-only collapsed state
  - Active page highlighting with darker background + accent border (RTL: border on inner edge)
  - Chevrons for expandable items; nested menu support
  - User profile section at bottom with avatar
  - TailAdmin-style look and feel adapted for RTL and Cairo font
- [ ] **FR-29** All UI components MUST follow a consistent design system:
  - 8px spacing grid
  - Rounded corners (8px for cards, 4px for buttons)
  - Consistent shadow depths (sm, md, lg)
  - Color palette with primary, secondary, success, warning, danger states
  - Typography scale (xs, sm, base, lg, xl, 2xl)
- [ ] **FR-30** The dashboard MUST be fully responsive:
  - Desktop: Full sidebar + main content
  - Tablet: Collapsible sidebar
  - Mobile: Hidden sidebar with hamburger menu
  - All charts MUST adapt to smaller viewports

---

## Non-Functional Requirements

- **Arabic/RTL (P7)**: The dashboard MUST render exclusively in RTL mode. The Cairo font MUST
  be loaded from a reliable CDN (e.g., Google Fonts) and MUST apply to all text nodes,
  including dynamically injected content. All icons and directional indicators MUST be
  mirrored appropriately for RTL.
- **Performance**: The dashboard home view MUST reach interactive state within 2 seconds on a
  standard broadband connection. The OpenRouter model list MUST load within 3 seconds; a
  loading skeleton MUST display in the interim.
- **Accessibility**: All navigation items MUST have descriptive ARIA labels in Arabic. Keyboard
  navigation MUST be functional for the sidebar, deck cards, and form controls.
- **Security**: Logo uploads MUST be validated server-side for file type and size. User branding
  preferences and model selection MUST be scoped to the authenticated user only.
- **Consistency**: The chosen primary color MUST meet a minimum contrast ratio of 4.5:1 against
  white backgrounds to ensure text legibility; a visual warning SHOULD appear if the selected
  color fails this check.

---

## Assumptions

- Each tenant (organization) is assigned a **dedicated OpenRouter API key** by the platform
  administrator. This key is stored securely on the backend and is never exposed to the frontend.
- Quota is measured in **AI token cost (USD)**. The Basic plan sets a monthly ceiling of
  **$50.00**. The platform MUST compare cumulative OpenRouter cost for the tenant's key against
  this ceiling each time the Usage & Quota page is loaded.
- Monthly quota resets on the **1st of each calendar month** (aligned with OpenRouter billing).
- The OpenRouter API provides a cost/usage endpoint queryable by API key; this is the authoritative
  source for consumption data.
- "Animated" refers to CSS/JS micro-animations (transitions, hover lifts, fade-ins) rather than
  complex 3D or video animations. No animation library beyond what's already installed is assumed.
- The Cairo font will be loaded via Google Fonts; no self-hosted font assets are assumed.
- Logo images are stored in the existing `uploads/` directory with a reference saved to the user
  profile record.
- The primary color is stored as a hex string on the user profile.
- A "deck" in the library corresponds to an existing generated idea/slides record in the database.

---

## Out of Scope

- Multi-user team dashboards or organization-level shared branding (single user only in this
  phase).
- Functional quota enforcement (blocking generation when quota is reached) — UI only in this
  phase per P3.
- Real-time OpenRouter model performance metrics or pricing comparisons.
- Social sharing or public deck publishing.
- Mobile-native or PWA packaging (responsive web only).

---

## Acceptance Criteria

- [ ] **AC-1** Upon login, the user sees an animated admin dashboard with white background,
  Cairo font, and RTL layout, reaching interactive state within 2 seconds.
- [ ] **AC-2** The deck library displays all previously generated slide decks as cards;
  clicking any card opens the slide builder in edit mode for that deck.
- [ ] **AC-3** The AI Model Settings page shows a list of models fetched live from OpenRouter;
  selecting one and saving persists the selection across sessions.
- [ ] **AC-4** Uploading a logo image updates the sidebar logo immediately without a page
  reload.
- [ ] **AC-5** Selecting a primary color updates all accent elements (buttons, progress bars,
  active sidebar items) in real time across the entire dashboard.
- [ ] **AC-6** The Usage & Quota page displays accurate, backend-sourced counts for AI
  requests made and slides generated, alongside a visual progress bar.
- [ ] **AC-7** All dashboard text, labels, navigation items, and error messages are in Arabic
  and render correctly right-to-left using the Cairo font.
- [ ] **AC-8** The dashboard displays a loading skeleton for the deck library and model list
  while data is being fetched, rather than a blank or broken state.
- [ ] **AC-9** Micro-animations are present on: sidebar hover, card hover (lift effect), page
  fade-in transitions, and quota progress bar fill on load.

---

## Clarifications

### Session 2026-02-28

- Q: What should the quota measure and when does it reset? → A: Quota = AI token cost in USD
  per tenant's dedicated OpenRouter API key. Basic plan = $50.00/month. Resets monthly on the
  1st. Cost computed from OpenRouter's live usage/pricing data.
- Q: What happens if the OpenRouter model list cannot be fetched? → A: Show the last cached
  model list with a visible "list may be outdated" warning banner. The user can still view and
  confirm their currently selected model.
- Q: What deck management actions are available in the library? → A: Each deck card exposes
  four actions: Open for editing, Rename (inline), Duplicate (creates a copy named "[title] —
  نسخة"), and Delete (with a permanent-deletion confirmation prompt).
- Q: Where does the uploaded logo appear in exported slide decks? → A: User-configurable via
  a Branding Settings toggle with three independent options: cover page only, all slides footer,
  or hidden in exports. The logo always appears in the dashboard sidebar regardless of export
  setting.

---

## Open Questions

| # | Question                                                                                              | Owner | Status   |
|---|-------------------------------------------------------------------------------------------------------|-------|----------|
| 1 | Should the OpenRouter model list be cached locally (e.g., for 1 hour) to reduce API calls?           | Team  | Open     |
| 2 | Is there a maximum number of stored decks per user, or are all historical decks always accessible?    | Team  | Open     |
