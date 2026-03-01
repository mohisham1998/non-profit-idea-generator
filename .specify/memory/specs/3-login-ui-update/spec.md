# Feature Specification: Login Portal UI Update

**Feature Branch**: `3-login-ui-update`  
**Created**: 2026-02-23  
**Status**: Draft  
**Input**: User description: "i have opend the portal and am still seeing the old UI" + "the update will happen even still before the login"

## Summary

Users opening the portal at the login page continue to see the legacy login interface. **The update MUST happen before login** — i.e., the login/portal entry page itself MUST display the new UI. Users MUST see the redesigned interface the moment they open the portal, before authenticating. The login page MUST be updated to match the admin dashboard aesthetic (white background, Cairo font, RTL Arabic, clean card-based layout, professional gradients) and provide a cohesive first impression before users enter the main dashboard.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See New Login UI on Portal Open (Priority: P1)

When a user opens the portal (e.g., navigates to the login route or application root), they MUST see the new login page design instead of the legacy UI. The page MUST present the login form and platform features in the updated visual style with consistent typography, colors, spacing, and layout.

**Why this priority**: Users expect to see the redesigned interface when they access the application. The login page is the first touchpoint and must match the new design to build trust and continuity.

**Independent Test**: Can be fully tested by opening the portal URL and verifying the login page displays the new design (white background, Cairo font, RTL layout, card-based structure). Delivers immediate visual confirmation that the update is live.

**Acceptance Scenarios**:

1. **Given** the portal is accessible, **When** a user opens the login page (e.g., `/login` or root), **Then** the user sees the new login UI with the updated design (white base, Cairo font, RTL, card-based layout).
2. **Given** a user has never visited the portal, **When** they navigate to the login page, **Then** they see the new design without needing to clear cache or refresh.

---

### User Story 2 - Consistent Visual Design with Admin Dashboard (Priority: P2)

The login page MUST use the same design language as the admin dashboard: white background, Cairo font family, RTL Arabic layout, and professional styling (gradients, shadows, card layouts). Branding elements (logo area, primary color accents) MUST align with dashboard settings where applicable.

**Why this priority**: Visual consistency across login and dashboard reduces cognitive load and reinforces professional quality.

**Independent Test**: Side-by-side comparison of login page and dashboard; verify shared design tokens (background, font, RTL, card styling).

**Acceptance Scenarios**:

1. **Given** the login page is displayed, **When** a user views the layout, **Then** the background is white, text uses Cairo font, and the layout is RTL.
2. **Given** the login page is displayed, **When** a user views the feature cards and form sections, **Then** they use the same card-based, shadowed, gradient-accented styling as the dashboard.

---

### User Story 3 - Preserve Login and Account Creation Functionality (Priority: P1)

All existing login and account creation functionality MUST continue to work. Email/password login, "Create new account" navigation, and any authentication flows MUST remain unchanged in behavior; only the visual presentation is updated.

**Why this priority**: UI update must not break authentication; users must still be able to log in and create accounts.

**Independent Test**: Perform login and account creation flows end-to-end; verify successful authentication and navigation to dashboard.

**Acceptance Scenarios**:

1. **Given** the user has valid credentials, **When** they submit the login form on the new UI, **Then** they are authenticated and directed to the dashboard.
2. **Given** the user selects "Create new account", **When** they complete the flow, **Then** they can create an account and access the dashboard.

---

### Edge Cases

- What happens when the user has cached assets? The system SHOULD ensure updated assets are served (e.g., via cache-busting or appropriate headers) so users see the new UI without manual cache clearing.
- How does the system handle users who bookmarked the old login URL? The same route MUST serve the new UI; no redirect or special handling is required beyond serving the updated page.
- What happens on slow connections? The new UI SHOULD load progressively; core form elements MUST be usable before decorative assets fully load.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The login page MUST display the new UI design when users navigate to the login route or application root. The update MUST be visible before the user logs in; no authentication is required to see the new design.
- **FR-002**: The login page MUST use a white background (`#FFFFFF`) as the base, consistent with the admin dashboard.
- **FR-003**: The login page MUST use the Cairo font family for all text elements.
- **FR-004**: The login page MUST be laid out in RTL (right-to-left) for Arabic.
- **FR-005**: The login form, feature cards, and statistics section MUST use the same card-based layout, shadows, and gradient accents as the admin dashboard.
- **FR-006**: Email and password login MUST continue to function as before; only visual presentation changes.
- **FR-007**: The "Create new account" action MUST continue to function and navigate users to the registration flow.
- **FR-008**: The system SHOULD serve the updated UI in a way that minimizes the chance of users seeing cached old UI (e.g., appropriate cache headers or asset versioning).

### Key Entities

- **Login Page**: The portal entry point containing the login form, feature highlights, and statistics; visual design only is in scope.
- **User Session**: Unchanged; authentication logic remains the same.

## Assumptions

- The "new UI" refers to the design system defined in the admin dashboard spec (2-admin-dashboard-ui): white background, Cairo font, RTL, card-based layout.
- No changes to authentication logic, API endpoints, or backend behavior.
- The login page exists at a known route (e.g., `/login`); the spec does not mandate a specific path.
- Platform features and statistics shown on the login page may be updated visually but their content structure is presumed acceptable unless explicitly changed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users opening the portal see the new login UI (white background, Cairo font, RTL, card-based layout) on first load without requiring cache clearing.
- **SC-002**: Login and account creation completion rates remain unchanged or improve after the UI update.
- **SC-003**: Visual consistency between login page and admin dashboard is verifiable (shared design tokens).
- **SC-004**: Zero regressions in authentication flows; all existing login and registration paths function correctly.
