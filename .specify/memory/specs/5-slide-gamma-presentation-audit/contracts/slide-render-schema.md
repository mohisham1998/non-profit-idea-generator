# Slide Render Schema

**Feature**: Slide Output Gamma Presentation Audit  
**Date**: 2026-02-23  
**Version**: 1.0

---

## Purpose

This contract defines the component interfaces and props structure for rendering slides with Gamma-quality layouts. All layout components MUST implement the `SlideLayoutProps` interface, and all content block components MUST implement the `ContentBlockProps` interface.

---

## SlideLayout Component Props

### Interface

```typescript
interface SlideLayoutProps {
  type: LayoutType;
  contentBlocks: ContentBlock[];
  primaryColor: string; // hex color from user branding
  rtl: boolean; // true for Arabic/RTL, false for English/LTR
  dimensions: SlideDimensions;
}

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

interface SlideDimensions {
  width: number; // 1920 pixels or 10 inches
  height: number; // 1080 pixels or 5.625 inches
  aspectRatio: string; // "16:9"
}

interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string | number;
  style?: ContentBlockStyle;
  position?: BlockPosition;
}

type ContentBlockType = 
  | "card" 
  | "badge" 
  | "header" 
  | "stat" 
  | "text" 
  | "icon";

interface ContentBlockStyle {
  bold?: boolean;
  colorAccent?: boolean;
  iconName?: string; // Lucide icon name
}

interface BlockPosition {
  row?: number; // grid row index
  col?: number; // grid column index
}
```

### Props Description

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `LayoutType` | Yes | The layout type to render (determines which layout component to use) |
| `contentBlocks` | `ContentBlock[]` | Yes | Array of content units to render within the layout |
| `primaryColor` | `string` | Yes | Hex color from user branding (e.g., `"#3B82F6"`) applied to badges, accents, headers |
| `rtl` | `boolean` | Yes | If true, render in RTL mode (Arabic); if false, render in LTR mode (English) |
| `dimensions` | `SlideDimensions` | Yes | Slide dimensions (must be 16:9 aspect ratio) |

### Example Usage

```tsx
import { TwoColumnLayout } from '@/components/SlideBuilder/layouts';

<TwoColumnLayout
  type="two-column"
  contentBlocks={[
    { id: "1", type: "header", content: "Benefits", style: { iconName: "CheckCircle2" } },
    { id: "2", type: "card", content: "Benefit 1", style: { colorAccent: true } },
    { id: "3", type: "card", content: "Benefit 2", style: { colorAccent: true } }
  ]}
  primaryColor="#3B82F6"
  rtl={false}
  dimensions={{ width: 1920, height: 1080, aspectRatio: "16:9" }}
/>
```

---

## ContentBlock Component Props

### Interface

```typescript
interface ContentBlockProps {
  type: ContentBlockType;
  content: string | number;
  style?: ContentBlockStyle;
  primaryColor: string; // for badges, accents
  rtl: boolean;
}

type ContentBlockType = 
  | "card" 
  | "badge" 
  | "header" 
  | "stat" 
  | "text" 
  | "icon";

interface ContentBlockStyle {
  bold?: boolean;
  colorAccent?: boolean;
  iconName?: string;
}
```

### Props Description

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `ContentBlockType` | Yes | The type of content block to render |
| `content` | `string \| number` | Yes | The actual content to display |
| `style` | `ContentBlockStyle` | No | Optional styling metadata (bold, color accent, icon) |
| `primaryColor` | `string` | Yes | Hex color for badges, accents (from user branding) |
| `rtl` | `boolean` | Yes | If true, render in RTL mode; if false, render in LTR mode |

### Example Usage

```tsx
import { ContentCard, NumberedBadge, SectionHeader } from '@/components/SlideBuilder/blocks';

// Card Block
<ContentCard
  type="card"
  content="AI-powered content generation with real-time refinement"
  style={{ colorAccent: true, iconName: "Sparkles" }}
  primaryColor="#3B82F6"
  rtl={false}
/>

// Numbered Badge
<NumberedBadge
  type="badge"
  content={1}
  style={{ colorAccent: true }}
  primaryColor="#3B82F6"
  rtl={false}
/>

// Section Header
<SectionHeader
  type="header"
  content="Key Features"
  style={{ iconName: "Sparkles" }}
  primaryColor="#3B82F6"
  rtl={false}
/>
```

---

## Layout Component Registry

All layout components MUST be registered in the `LAYOUT_REGISTRY` for dynamic rendering:

```typescript
// client/src/components/SlideBuilder/layouts/index.ts
import { TwoColumnLayout } from './TwoColumnLayout';
import { QuadrantLayout } from './QuadrantLayout';
import { FlowLayout } from './FlowLayout';
import { StatBlocksLayout } from './StatBlocksLayout';
import { CardGridLayout } from './CardGridLayout';
import { ListLayout } from './ListLayout';
import { NumberedLayout } from './NumberedLayout';
import { QuoteLayout } from './QuoteLayout';
import { TimelineLayout } from './TimelineLayout';
import { TableLayout } from './TableLayout';

export const LAYOUT_REGISTRY: Record<LayoutType, React.FC<SlideLayoutProps>> = {
  "two-column": TwoColumnLayout,
  "quadrant": QuadrantLayout,
  "flow": FlowLayout,
  "stat-blocks": StatBlocksLayout,
  "card-grid": CardGridLayout,
  "list": ListLayout,
  "numbered": NumberedLayout,
  "quote": QuoteLayout,
  "timeline": TimelineLayout,
  "table": TableLayout
};
```

### Dynamic Layout Rendering

```tsx
// In SlideCard.tsx or similar
import { LAYOUT_REGISTRY } from '@/components/SlideBuilder/layouts';

function SlideCard({ slide }: { slide: SlideLayout }) {
  const LayoutComponent = LAYOUT_REGISTRY[slide.type];
  
  if (!LayoutComponent) {
    console.error(`Unknown layout type: ${slide.type}`);
    return <div>Error: Unknown layout</div>;
  }
  
  return (
    <LayoutComponent
      type={slide.type}
      contentBlocks={slide.contentBlocks}
      primaryColor={slide.primaryColor}
      rtl={slide.rtl}
      dimensions={slide.dimensions}
    />
  );
}
```

---

## Content Block Component Registry

All content block components MUST be registered for dynamic rendering:

```typescript
// client/src/components/SlideBuilder/blocks/index.ts
import { ContentCard } from './ContentCard';
import { NumberedBadge } from './NumberedBadge';
import { SectionHeader } from './SectionHeader';
import { StatBlock } from './StatBlock';
import { TextBlock } from './TextBlock';
import { IconBlock } from './IconBlock';

export const BLOCK_REGISTRY: Record<ContentBlockType, React.FC<ContentBlockProps>> = {
  "card": ContentCard,
  "badge": NumberedBadge,
  "header": SectionHeader,
  "stat": StatBlock,
  "text": TextBlock,
  "icon": IconBlock
};
```

---

## Validation Rules

### SlideLayoutProps Validation

- `contentBlocks` MUST NOT be empty
- `primaryColor` MUST be valid hex color (regex: `/^#[0-9A-Fa-f]{6}$/`)
- `dimensions.aspectRatio` MUST be `"16:9"`
- `dimensions.width / dimensions.height` MUST equal ~1.777 (16:9 ratio)

### ContentBlockProps Validation

- `content` MUST NOT be empty string (except for `type: "icon"`)
- If `type` is `"text"`, `content` MUST be ≤500 characters
- If `type` is `"badge"`, `content` MUST be number or ≤3 characters
- If `style.iconName` is provided, it MUST exist in Lucide library (fallback to `Circle` if not found)

---

## RTL Support

All layout and content block components MUST support RTL rendering:

### RTL Implementation Guidelines

1. **Root Element**: Set `dir="rtl"` when `rtl` prop is true
2. **Tailwind Utilities**: Use `rtl:` prefix for RTL-specific styles
   - `rtl:text-right` (text alignment)
   - `rtl:ml-4` (margin left becomes margin right in RTL)
   - `rtl:flex-row-reverse` (reverse flex direction)
3. **Custom Logic**: For complex layouts (flow diagrams, numbered badges), implement custom RTL logic
   - **Flow Diagrams**: Reverse arrow direction and node order
   - **Numbered Badges**: Ensure number appears on correct side (right in RTL, left in LTR)
   - **Quadrant Layouts**: Mirror quadrant positions

### RTL Example

```tsx
// TwoColumnLayout.tsx
export const TwoColumnLayout: React.FC<SlideLayoutProps> = ({ contentBlocks, primaryColor, rtl, dimensions }) => {
  return (
    <div 
      className={`slide-layout-two-column ${rtl ? 'rtl' : 'ltr'}`}
      dir={rtl ? 'rtl' : 'ltr'}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <div className={`flex ${rtl ? 'flex-row-reverse' : 'flex-row'} gap-8`}>
        <div className={`flex-1 ${rtl ? 'rtl:text-right' : 'text-left'}`}>
          {/* Left column content */}
        </div>
        <div className={`flex-1 ${rtl ? 'rtl:text-right' : 'text-left'}`}>
          {/* Right column content */}
        </div>
      </div>
    </div>
  );
};
```

---

## Styling Guidelines

### Primary Color Application

- **Badges**: `bg-[${primaryColor}]` for background, `text-white` for text
- **Headers**: `text-[${primaryColor}]` for color accent
- **Accents**: `border-[${primaryColor}]` for borders, `text-[${primaryColor}]` for key terms

### Typography Hierarchy

- **Main Headers** (level 1): `text-2xl font-bold`
- **Subheaders** (level 2): `text-xl font-semibold`
- **Body Text**: `text-base` (default), `text-sm` (dense content)
- **Badges**: `text-xs font-medium`

### Spacing

- **Header Separation**: `mb-4` or `mb-6` margin below headers
- **Card Padding**: `p-4` or `p-6` inside cards
- **Grid Gap**: `gap-4` or `gap-6` between grid items

---

## Testing

### Unit Tests

- Test each layout component with valid props → renders without errors
- Test each content block component with valid props → renders without errors
- Test layout registry → all layout types have registered components
- Test block registry → all block types have registered components

### Visual Regression Tests

- Test each layout type in LTR mode → matches Gamma reference
- Test each layout type in RTL mode → mirrors correctly
- Test primary color application → badges, headers, accents use correct color
- Test slide dimensions → all slides render at 16:9 aspect ratio

---

## Example Implementation

See:
- `client/src/components/SlideBuilder/layouts/` for layout components
- `client/src/components/SlideBuilder/blocks/` for content block components
- `client/src/components/SlideBuilder/SlideCard.tsx` for dynamic rendering
