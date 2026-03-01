# Contract: Export Mappers Schema

**Feature**: 007-gamma-smart-layout-engine  
**Type**: Internal TypeScript Interface  
**Date**: 2026-03-01

---

## Overview

Defines the mapping interfaces for converting layout components to PDF and PowerPoint formats. Each layout in the registry must implement both mappers to ensure WYSIWYG export fidelity.

---

## PDF Mapper

### PdfMapper Type

```typescript
export type PdfMapper = (
  content: LayoutContent,
  theme: PresentationTheme,
  config: LayoutConfig
) => PdfSlideDefinition;
```

### PdfSlideDefinition Interface

```typescript
export interface PdfSlideDefinition {
  /** Slide dimensions */
  width: number;   // default: 1920
  height: number;  // default: 1080
  
  /** Background settings */
  background: PdfBackground;
  
  /** Ordered elements to render */
  elements: PdfElement[];
  
  /** Page metadata */
  metadata?: {
    title?: string;
    slideIndex?: number;
  };
}
```

### PdfBackground Interface

```typescript
export interface PdfBackground {
  type: 'solid' | 'gradient' | 'image';
  color?: string;           // Hex color for solid
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;         // degrees for linear
  };
  imageUrl?: string;        // URL for image background
  opacity?: number;         // 0-1
}
```

### PdfElement Interface

```typescript
export interface PdfElement {
  type: 'text' | 'shape' | 'image' | 'table' | 'line';
  
  /** Position (top-left origin) */
  x: number;
  y: number;
  
  /** Dimensions */
  width: number;
  height: number;
  
  /** Z-index for layering */
  zIndex?: number;
  
  /** Element-specific properties */
  text?: PdfTextProps;
  shape?: PdfShapeProps;
  image?: PdfImageProps;
  table?: PdfTableProps;
  line?: PdfLineProps;
}
```

### PdfTextProps Interface

```typescript
export interface PdfTextProps {
  content: string;
  fontFamily: string;       // 'Cairo', 'Cairo-Bold', etc.
  fontSize: number;         // points
  fontWeight?: 'normal' | 'bold' | 'semibold';
  color: string;            // Hex color
  alignment: 'right' | 'center' | 'left';  // RTL: 'right' is default
  direction: 'rtl' | 'ltr';
  lineHeight?: number;      // multiplier
  maxLines?: number;
  overflow?: 'clip' | 'ellipsis';
}
```

### PdfShapeProps Interface

```typescript
export interface PdfShapeProps {
  type: 'rectangle' | 'circle' | 'rounded-rect';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  cornerRadius?: number;    // for rounded-rect
  shadow?: PdfShadow;
}

export interface PdfShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}
```

### PdfImageProps Interface

```typescript
export interface PdfImageProps {
  url: string;              // Can be base64 data URL
  fit: 'contain' | 'cover' | 'fill';
  alignment?: 'center' | 'top' | 'bottom';
  opacity?: number;
  borderRadius?: number;
}
```

### PdfTableProps Interface

```typescript
export interface PdfTableProps {
  rows: PdfTableRow[];
  columnWidths: number[];   // percentages or pixels
  headerRow?: boolean;
  borderColor?: string;
  cellPadding?: number;
}

export interface PdfTableRow {
  cells: PdfTableCell[];
  isHeader?: boolean;
  backgroundColor?: string;
}

export interface PdfTableCell {
  content: string;
  colSpan?: number;
  rowSpan?: number;
  alignment?: 'right' | 'center' | 'left';
  fontWeight?: 'normal' | 'bold';
  backgroundColor?: string;
}
```

---

## PowerPoint Mapper

### PptxMapper Type

```typescript
export type PptxMapper = (
  content: LayoutContent,
  theme: PresentationTheme,
  config: LayoutConfig
) => PptxSlideDefinition;
```

### PptxSlideDefinition Interface

```typescript
export interface PptxSlideDefinition {
  /** Slide layout (pptxgenjs layout name) */
  layout?: string;
  
  /** Background settings */
  background: PptxBackground;
  
  /** Ordered elements to add */
  elements: PptxElement[];
  
  /** Slide notes */
  notes?: string;
}
```

### PptxBackground Interface

```typescript
export interface PptxBackground {
  type: 'solid' | 'gradient' | 'image';
  color?: string;           // Hex without #
  
  gradient?: {
    type: 'linear' | 'radial';
    colors: Array<{
      color: string;
      position: number;     // 0-100
    }>;
    angle?: number;
  };
  
  image?: {
    data?: string;          // base64
    path?: string;          // file path
    sizing?: {
      type: 'cover' | 'contain' | 'tile';
    };
  };
}
```

### PptxElement Interface

```typescript
export interface PptxElement {
  type: 'text' | 'shape' | 'image' | 'table' | 'line';
  
  /** Position in inches from top-left */
  x: number;
  y: number;
  
  /** Dimensions in inches */
  w: number;
  h: number;
  
  /** Element-specific options */
  text?: PptxTextProps;
  shape?: PptxShapeProps;
  image?: PptxImageProps;
  table?: PptxTableProps;
  line?: PptxLineProps;
}
```

### PptxTextProps Interface

```typescript
export interface PptxTextProps {
  text: string | PptxTextRun[];
  fontFace: string;         // 'Cairo'
  fontSize: number;         // points
  color: string;            // Hex without #
  bold?: boolean;
  italic?: boolean;
  align: 'right' | 'center' | 'left';
  valign?: 'top' | 'middle' | 'bottom';
  rtlMode: boolean;         // Always true for Arabic
  wrap?: boolean;
  shrinkText?: boolean;
  
  /** Shape fill (for text boxes) */
  fill?: {
    color: string;
  };
  
  /** Shape line (border) */
  line?: {
    color: string;
    width: number;
  };
  
  /** Shadow */
  shadow?: {
    type: 'outer';
    blur: number;
    offset: number;
    angle: number;
    color: string;
    opacity: number;
  };
}

export interface PptxTextRun {
  text: string;
  options?: {
    bold?: boolean;
    italic?: boolean;
    color?: string;
    fontSize?: number;
    fontFace?: string;
  };
}
```

### PptxShapeProps Interface

```typescript
export interface PptxShapeProps {
  /** pptxgenjs shape type */
  shapeType: 'rect' | 'roundRect' | 'ellipse' | 'line' | 'triangle';
  
  fill?: {
    color: string;
    transparency?: number;  // 0-100
  };
  
  line?: {
    color: string;
    width: number;          // points
    dashType?: 'solid' | 'dash' | 'dot';
  };
  
  /** Corner radius for roundRect (inches) */
  rectRadius?: number;
  
  shadow?: PptxShadow;
}

export interface PptxShadow {
  type: 'outer' | 'inner';
  blur: number;
  offset: number;
  angle: number;
  color: string;
  opacity: number;
}
```

### PptxImageProps Interface

```typescript
export interface PptxImageProps {
  /** Image source (one required) */
  data?: string;            // base64 with prefix
  path?: string;            // file path
  
  /** Sizing */
  sizing?: {
    type: 'contain' | 'cover' | 'crop';
    w?: number;
    h?: number;
  };
  
  /** Rounding (for profile pics, icons) */
  rounding?: boolean;
  
  /** Hyperlink */
  hyperlink?: {
    url: string;
    tooltip?: string;
  };
}
```

### PptxTableProps Interface

```typescript
export interface PptxTableProps {
  rows: PptxTableRow[];
  
  /** Column widths in inches */
  colW: number[];
  
  /** Row height in inches */
  rowH?: number;
  
  /** Table options */
  border?: {
    type: 'solid' | 'dash';
    color: string;
    pt: number;
  };
  
  fill?: { color: string };
  
  fontFace?: string;
  fontSize?: number;
  color?: string;
  align?: 'right' | 'center' | 'left';
  valign?: 'top' | 'middle' | 'bottom';
}

export interface PptxTableRow {
  cells: PptxTableCell[];
}

export interface PptxTableCell {
  text: string;
  options?: {
    fill?: { color: string };
    color?: string;
    bold?: boolean;
    align?: 'right' | 'center' | 'left';
    colspan?: number;
    rowspan?: number;
  };
}
```

---

## LayoutContent Interface

Common content structure passed to both mappers.

```typescript
export interface LayoutContent {
  /** Slide title */
  title: string;
  
  /** Parsed content blocks */
  blocks: ContentBlock[];
  
  /** Images with resolved URLs */
  images: ResolvedImage[];
  
  /** Slide semantic type */
  slideType: CardType;
  
  /** Layout-specific config */
  config: LayoutConfig;
}

export interface ResolvedImage {
  placement: string;        // Position ID
  url: string;              // Resolved URL (may be base64)
  width: number;
  height: number;
  alt?: string;
}
```

---

## Coordinate Systems

### PDF Coordinates
- Origin: Top-left
- Units: Pixels at 96 DPI
- Standard dimensions: 1920 × 1080 px

### PPTX Coordinates
- Origin: Top-left
- Units: Inches
- Standard dimensions: 13.33 × 7.5 inches (16:9)
- Conversion: 1 inch = 144 pixels at 96 DPI

### Conversion Helper

```typescript
function pxToInches(px: number): number {
  return px / 144;
}

function inchesToPx(inches: number): number {
  return inches * 144;
}
```

---

## Font Handling

### Cairo Font Variants

| Variant | PDF fontFamily | PPTX fontFace |
|---------|---------------|---------------|
| Regular | 'Cairo' | 'Cairo' |
| Bold | 'Cairo-Bold' | 'Cairo' + bold: true |
| SemiBold | 'Cairo-SemiBold' | 'Cairo' + bold: true |

### Font Embedding Requirements

**PDF**: Fonts must be registered with jsPDF before use:
```typescript
doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
doc.addFont('Cairo-Bold.ttf', 'Cairo', 'bold');
```

**PPTX**: Fonts are referenced by name; embedding handled by PowerPoint on open.

---

## RTL Handling

Both mappers must ensure:
1. Text alignment defaults to 'right'
2. Text direction set to RTL
3. Layout elements flow right-to-left
4. Tables read right-to-left (first column on right)

```typescript
// Standard RTL text props
const rtlTextDefaults = {
  align: 'right',
  rtlMode: true,
  direction: 'rtl',
};
```

---

## Constraints

1. **Element Bounds**: All elements must fit within slide dimensions
2. **Font Consistency**: Only Cairo font family allowed
3. **Color Format**: PDF uses '#RRGGBB', PPTX uses 'RRGGBB' (no hash)
4. **RTL Required**: All text must be RTL-enabled
5. **Image Resolution**: Images must be ≥ 72 DPI in exports
6. **Z-Index Order**: Elements rendered in array order (later = on top)
