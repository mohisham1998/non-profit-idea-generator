# Data Model: Slide Output Gamma Presentation Audit

**Feature**: Slide Output Gamma Presentation Audit  
**Date**: 2026-02-23  
**Status**: Complete

---

## Entities

### 1. SlideLayout

Represents the structural arrangement and visual configuration of a single slide.

**Fields**:
- `type`: `LayoutType` (enum: `"two-column"` | `"quadrant"` | `"flow"` | `"stat-blocks"` | `"card-grid"` | `"list"` | `"numbered"` | `"quote"` | `"timeline"` | `"table"`)
- `contentBlocks`: `ContentBlock[]` (array of content units to render)
- `dimensions`: `SlideDimensions` (object: `{ width: number, height: number, aspectRatio: string }`)
- `primaryColor`: `string` (hex color from user branding, e.g., `"#3B82F6"`)
- `rtl`: `boolean` (true for Arabic/RTL, false for English/LTR)
- `visualHierarchy`: `VisualHierarchy` (metadata for headers, key terms, icons)

**Validation Rules**:
- `contentBlocks` MUST NOT be empty (no blank slides)
- `primaryColor` MUST be valid hex color (regex: `/^#[0-9A-Fa-f]{6}$/`)
- `dimensions.aspectRatio` MUST be `"16:9"`
- `dimensions.width` MUST be `1920` (pixels) or `10` (inches)
- `dimensions.height` MUST be `1080` (pixels) or `5.625` (inches)
- `type` MUST be one of the defined `LayoutType` enum values

**Relationships**:
- One `Slide` has one `SlideLayout`
- One `SlideLayout` has many `ContentBlock` (1..*)
- One `SlideLayout` has one `VisualHierarchy`

**State Transitions**:
```
Draft → AI Layout Selection → Rendered → Exported
```

**Example**:
```typescript
{
  type: "card-grid",
  contentBlocks: [
    { id: "1", type: "header", content: "Key Features", style: { iconName: "Sparkles" } },
    { id: "2", type: "card", content: "Feature 1", style: { colorAccent: true } },
    { id: "3", type: "card", content: "Feature 2", style: { colorAccent: true } },
    { id: "4", type: "card", content: "Feature 3", style: { colorAccent: true } }
  ],
  dimensions: { width: 1920, height: 1080, aspectRatio: "16:9" },
  primaryColor: "#3B82F6",
  rtl: false,
  visualHierarchy: {
    headers: [{ level: 1, text: "Key Features", iconName: "Sparkles" }],
    keyTerms: ["Feature 1", "Feature 2", "Feature 3"],
    icons: [{ context: "features", iconName: "Sparkles" }]
  }
}
```

---

### 2. ContentBlock

Represents a distinct unit of content within a slide (card, badge, header, stat, text, icon).

**Fields**:
- `id`: `string` (unique identifier within slide)
- `type`: `ContentBlockType` (enum: `"card"` | `"badge"` | `"header"` | `"stat"` | `"text"` | `"icon"`)
- `content`: `string | number` (actual content to display)
- `style`: `ContentBlockStyle` (optional styling metadata)
  - `bold`: `boolean` (optional, apply bold font)
  - `colorAccent`: `boolean` (optional, apply primary color accent)
  - `iconName`: `string` (optional, Lucide icon name)
- `position`: `BlockPosition` (optional, for grid layouts)
  - `row`: `number` (optional, grid row index)
  - `col`: `number` (optional, grid column index)

**Validation Rules**:
- `id` MUST be unique within the slide's `contentBlocks` array
- `type` MUST be one of the defined `ContentBlockType` enum values
- `content` MUST NOT be empty string (except for `type: "icon"`)
- If `type` is `"text"`, `content` MUST be ≤500 characters (triggers split if exceeded)
- If `type` is `"badge"`, `content` MUST be a number or short string (≤3 characters)
- If `style.iconName` is provided, it MUST exist in Lucide icon library (validated via fallback)

**Relationships**:
- Many `ContentBlock` belong to one `SlideLayout`

**Example**:
```typescript
{
  id: "feature-1",
  type: "card",
  content: "AI-powered content generation with real-time refinement",
  style: {
    bold: false,
    colorAccent: true,
    iconName: "Sparkles"
  },
  position: { row: 0, col: 0 }
}
```

---

### 3. VisualHierarchy

Metadata for organizing headers, key terms, and icons to enable quick scanning and visual engagement.

**Fields**:
- `headers`: `HeaderMetadata[]` (array of header definitions)
  - `level`: `number` (1 = main header, 2 = subheader, 3 = tertiary)
  - `text`: `string` (header content)
  - `iconName`: `string` (optional, Lucide icon name)
- `keyTerms`: `string[]` (array of terms to bold/accent for quick scanning)
- `icons`: `IconMetadata[]` (array of icon assignments)
  - `context`: `string` (content context, e.g., "budget", "kpi", "challenge")
  - `iconName`: `string` (Lucide icon name)

**Validation Rules**:
- `headers` MUST have at least one header with `level: 1`
- `keyTerms` SHOULD NOT exceed 10 items (too many accents reduce effectiveness)
- `icons` MUST have unique `context` values (no duplicate contexts)

**Relationships**:
- One `VisualHierarchy` belongs to one `SlideLayout`

**Example**:
```typescript
{
  headers: [
    { level: 1, text: "Project Goals", iconName: "Target" },
    { level: 2, text: "Primary Objectives", iconName: null }
  ],
  keyTerms: ["Goal 1", "Goal 2", "Goal 3", "beneficiaries", "impact"],
  icons: [
    { context: "goals", iconName: "Target" },
    { context: "beneficiaries", iconName: "Users" },
    { context: "impact", iconName: "Zap" }
  ]
}
```

---

### 4. SlideExportConfig

Configuration for exporting slides to PDF or PowerPoint with correct dimensions and styling.

**Fields**:
- `format`: `ExportFormat` (enum: `"pdf"` | `"pptx"`)
- `dimensions`: `SlideDimensions` (object: `{ width: number, height: number }`)
- `font`: `string` (font family, e.g., `"Cairo"` for Arabic)
- `rtl`: `boolean` (true for Arabic/RTL, false for English/LTR)
- `preserveVisualFidelity`: `boolean` (true to convert text to images if font embedding fails)

**Validation Rules**:
- `format` MUST be `"pdf"` or `"pptx"`
- `dimensions` MUST match 16:9 aspect ratio (width / height = 1.777...)
- `font` MUST be `"Cairo"` if `rtl` is `true`
- If `format` is `"pptx"` and `preserveVisualFidelity` is `true`, text SHOULD be converted to base64 images

**Relationships**:
- One `SlideExportConfig` applies to one export operation (multiple slides)

**Example**:
```typescript
{
  format: "pptx",
  dimensions: { width: 10, height: 5.625 }, // inches for PowerPoint
  font: "Cairo",
  rtl: true,
  preserveVisualFidelity: true
}
```

---

## Relationships Diagram

```
Slide (1) ──────── (1) SlideLayout
                        │
                        ├── (1..*) ContentBlock
                        │
                        └── (1) VisualHierarchy
                                 │
                                 ├── (1..*) HeaderMetadata
                                 └── (0..*) IconMetadata

SlideExportConfig (1) ──────── (1..*) Slide (export operation)
```

---

## State Transitions

### SlideLayout Lifecycle

```
┌─────────┐
│  Draft  │ (Initial state: empty or template-based)
└────┬────┘
     │
     ▼
┌──────────────────────┐
│ AI Layout Selection  │ (OpenRouter API call to select optimal layout type)
└──────────┬───────────┘
           │
           ▼
┌──────────────────┐
│    Rendered      │ (React components render layout with content blocks)
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│    Exported     │ (PDF/PPTX generation with visual fidelity preservation)
└─────────────────┘
```

**Transition Rules**:
- **Draft → AI Layout Selection**: Triggered when content is finalized and ready for layout assignment
- **AI Layout Selection → Rendered**: Triggered when AI returns layout type and content blocks are populated
- **Rendered → Exported**: Triggered when user clicks export button; requires `SlideExportConfig`

---

## TypeScript Definitions

```typescript
// Enums
type LayoutType = 
  | "two-column" 
  | "quadrant" 
  | "flow" 
  | "stat-blocks" 
  | "card-grid" 
  | "list" 
  | "numbered" 
  | "quote" 
  | "timeline" 
  | "table";

type ContentBlockType = 
  | "card" 
  | "badge" 
  | "header" 
  | "stat" 
  | "text" 
  | "icon";

type ExportFormat = "pdf" | "pptx";

// Interfaces
interface SlideDimensions {
  width: number;
  height: number;
  aspectRatio: string; // "16:9"
}

interface ContentBlockStyle {
  bold?: boolean;
  colorAccent?: boolean;
  iconName?: string;
}

interface BlockPosition {
  row?: number;
  col?: number;
}

interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string | number;
  style?: ContentBlockStyle;
  position?: BlockPosition;
}

interface HeaderMetadata {
  level: number; // 1, 2, or 3
  text: string;
  iconName?: string;
}

interface IconMetadata {
  context: string;
  iconName: string;
}

interface VisualHierarchy {
  headers: HeaderMetadata[];
  keyTerms: string[];
  icons: IconMetadata[];
}

interface SlideLayout {
  type: LayoutType;
  contentBlocks: ContentBlock[];
  dimensions: SlideDimensions;
  primaryColor: string; // hex
  rtl: boolean;
  visualHierarchy: VisualHierarchy;
}

interface SlideExportConfig {
  format: ExportFormat;
  dimensions: SlideDimensions;
  font: string;
  rtl: boolean;
  preserveVisualFidelity: boolean;
}
```

---

## Validation Summary

| Entity | Key Validations |
|--------|----------------|
| `SlideLayout` | Non-empty `contentBlocks`, valid hex `primaryColor`, 16:9 `aspectRatio` |
| `ContentBlock` | Unique `id`, valid `type`, non-empty `content` (except icons), ≤500 chars for text |
| `VisualHierarchy` | At least one level-1 header, ≤10 key terms, unique icon contexts |
| `SlideExportConfig` | Valid `format`, 16:9 dimensions, Cairo font for RTL |

---

## Notes

- **No Solid Text Blocks**: All content MUST be structured into `ContentBlock` entities; no single uninterrupted text block allowed
- **Primary Color**: Fetched from Supabase user branding settings; fallback to dashboard accent if unset
- **Icon Library**: All `iconName` values reference Lucide icon names; fallback to `Circle` if not found
- **Slide Splitting**: If content exceeds 800 characters or 8 blocks, split into multiple `SlideLayout` entities with context preservation
