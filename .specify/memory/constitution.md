<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0 (new principle)
Modified principles: N/A
Added sections:
  - Principle 8: Post-Update Terminal Error Check & Self-Healing
Removed sections: N/A
Templates:
  ✅ .specify/templates/constitution-template.md — no change
  ✅ .specify/templates/plan-template.md — no change
  ✅ .specify/templates/spec-template.md — no change
  ✅ .specify/templates/tasks-template.md — no change
Deferred TODOs: None
-->

# Project Constitution — Nonprofit AI Admin Dashboard

**Project**: Nonprofit AI Admin Dashboard (nonprofit-ideas-generator)
**Version**: 1.1.0
**Ratification Date**: 2026-02-28
**Last Amended**: 2026-02-23
**Status**: Active

---

## 1. Vision & Objective

The goal of this project is to transform the current slide-generation tool into a fully-fledged
AI-powered admin dashboard for nonprofit charities. The dashboard MUST allow users to generate
and manage AI-driven slide content, fully customize layouts, and track their usage (with quotas).

The system MUST empower users to create detailed, professional, AI-assisted slides tailored to
their needs with full customization. The admin dashboard interface MUST provide easy access to
features such as content generation, user quotas, and real-time editing.

---

## 2. Core Principles

### Principle 1 — AI Content Generation via OpenRouter

The system MUST leverage OpenRouter as the primary gateway for selecting different AI models
for content generation, depending on the needs of each slide.

**Non-negotiable rules:**

- Model selection MUST be user-configurable through OpenRouter's API.
- AI-generated content MUST be driven by user input (e.g., mission statements, KPIs, program
  descriptions) with support for real-time refinement and customization.
- The system MUST suggest the most contextually appropriate AI model depending on slide type
  (e.g., SWOT analysis, Budget, KPIs), providing adaptive AI behaviour.
- All AI integrations MUST be routed through OpenRouter unless a user-configured override
  (custom LLM endpoint) is explicitly set.

**Rationale:** OpenRouter provides model flexibility without lock-in to a single provider,
enabling cost optimization and capability expansion as the AI landscape evolves.

---

### Principle 2 — Admin Dashboard UI

The application UI MUST be structured as an admin dashboard rather than a traditional website
interface, delivering a clean, professional, and intuitive experience for managing slide
creation and user settings.

**Non-negotiable rules:**

- The UI MUST include a persistent sidebar for navigation to: Content Generation, Slide
  Customization, Profile Settings, and Quota Management.
- A central workspace MUST display slides in an editable, presentation-tool-like format.
- The dashboard MUST adopt a minimalist, data-driven aesthetic consistent with professional
  admin tools.
- A dedicated Customization Panel MUST be accessible for adjusting themes, layouts, and
  AI-enhanced content tools.
- All new UI components MUST follow the established design system (tokens, spacing, typography)
  defined in the project's CSS foundation.

**Rationale:** An admin dashboard pattern separates power from complexity, giving users a
focused, productive environment rather than a marketing-style page.

---

### Principle 3 — User Profile with Quota Limit

Every user MUST have a profile that includes a usage quota for slide generation. The quota
MUST be visible in the UI even before functional enforcement is implemented.

**Non-negotiable rules:**

- Each user profile MUST display: name, email, and (optionally) password change controls.
- The profile page MUST show a quota limit display (e.g., slides generated vs. total allowed)
  with a visual progress bar.
- The UI quota elements MUST be present and accurate at all times, even when functional
  enforcement (blocking users at quota) is deferred to a later phase.
- Quota data MUST be sourced from the backend user record and MUST NOT be hardcoded in
  the frontend.

**Rationale:** Displaying quota visually builds trust and prepares users for eventual
enforcement, reducing surprise when limits are introduced.

---

### Principle 4 — Full Customization of Slide Layouts

Users MUST have full control over slide layouts, with the ability to apply customizable
themes, edit content, and adjust layout structures for each slide.

**Non-negotiable rules:**

- Slides MUST support multiple layout types: grid, timeline, comparison chart, and freeform
  card layouts.
- Users MUST be able to move, resize, and reorder components (text boxes, images, charts)
  within each slide.
- AI MUST be able to suggest layout adjustments based on slide content to improve readability
  and visual appeal.
- All layout options MUST be non-destructive: changing a layout MUST NOT discard existing
  slide content.

**Rationale:** Gamma-app-style customization elevates the tool from a generator to a full
presentation editor, increasing user retention and output quality.

---

### Principle 5 — Real-Time AI Refinement

AI MUST provide real-time content and design refinement, ensuring that each slide maintains
quality and relevance based on the content provided by the user.

**Non-negotiable rules:**

- The system MUST offer content suggestions for improving clarity, adding detail, or
  reformatting text as the user edits a slide.
- The AI MUST be capable of suggesting design tweaks (font size adjustments, content
  alignment, relevant icon/image additions) in response to slide content.
- Refinement suggestions MUST be presented non-intrusively (e.g., a suggestion panel or
  inline tooltip), not applied automatically without user consent.
- All real-time AI calls MUST be debounced (minimum 500ms) to avoid excessive API usage.

**Rationale:** Real-time AI feedback turns static slides into living documents, reducing
manual editing effort while keeping users in control.

---

### Principle 6 — Future Expansion & Integration

The system MUST be designed to scale and integrate with other tools and services in the
future, particularly for AI content generation and data processing.

**Non-negotiable rules:**

- The AI provider layer MUST be abstracted behind a provider interface so that new models
  can be added via OpenRouter without changing core business logic.
- The codebase MUST not hard-code any single AI model identifier in business logic; model
  selection MUST flow through configurable settings.
- Third-party integration points (cloud storage, analytics) MUST be planned as optional
  plugin-style modules rather than tightly coupled features.
- All public-facing APIs MUST be versioned (e.g., `/api/v1/...`) to allow non-breaking
  evolution.

**Rationale:** Designing for extensibility from day one prevents expensive rewrites when new
requirements or providers emerge.

---

### Principle 7 — Arabic Language & RTL Support

The application MUST fully support Arabic as the primary language with correct right-to-left
(RTL) layout rendering throughout all UI components.

**Non-negotiable rules:**

- All UI text labels, slide content, and error messages MUST support Arabic (ar-SA locale).
- Layout directionality MUST be set to `rtl` at the root level; no component MUST override
  this for purely cosmetic reasons.
- Any new component added to the project MUST be tested in RTL mode before being considered
  complete.
- Export outputs (PDF, PowerPoint) MUST preserve RTL text direction and Arabic typography.

**Rationale:** The primary users of this nonprofit tool are Arabic-speaking charity
administrators; RTL correctness is non-negotiable for usability and accessibility.

---

### Principle 8 — Post-Update Terminal Error Check & Self-Healing

After each update (deployment, build, migration, or code change), the system SHOULD check
the terminal for errors and attempt to fix them autonomously where possible.

**Non-negotiable rules:**

- After any update that triggers a build, migration, or deploy step, the system MUST run
  a validation check (e.g., type check, lint, or test) and inspect terminal output for
  errors.
- When errors are detected, the system SHOULD attempt to resolve them automatically
  (e.g., fixing type errors, correcting schema mismatches, addressing lint issues)
  before reporting failure.
- Errors that cannot be auto-fixed MUST be surfaced clearly to the user with actionable
  guidance.
- This principle applies to development workflows, CI pipelines, and any automated
  update processes.

**Rationale:** Catching and fixing errors immediately after updates reduces debugging
time and keeps the codebase in a deployable state. Autonomous error resolution
improves developer velocity and reduces friction.

---

## 3. Governance

### Amendment Procedure

1. Any contributor wishing to amend this constitution MUST open a proposal describing:
   - The specific principle(s) affected.
   - The rationale for the change.
   - Any backward compatibility implications.
2. Amendments MUST be reviewed and approved by the project owner before merging.
3. Breaking changes (MAJOR version bump) require explicit written approval and a migration
   plan for existing features.
4. After approval, this file MUST be updated, the version incremented, and `LAST_AMENDED`
   set to the ISO date of the change.

### Versioning Policy

This constitution follows semantic versioning:

- **MAJOR** (`X.0.0`): Backward-incompatible governance changes — removal or fundamental
  redefinition of a principle.
- **MINOR** (`1.X.0`): New principle or section added, or materially expanded guidance.
- **PATCH** (`1.0.X`): Clarifications, wording corrections, or non-semantic refinements.

### Compliance Review

- Every feature spec (`.specify/memory/specs/*.md`) MUST reference at least one principle
  from this constitution in its "Constitution Alignment" section.
- Every implementation plan (`.specify/memory/plans/*.md`) MUST include a "Constitution
  Check" block confirming no principle is violated.
- A compliance review SHOULD be performed at the start of each milestone before implementation
  begins, and again during VERIFICATION before merging.
