# Contract: Layout with Images Schema

**Feature**: Slide Visual Export Fix  
**Contract Type**: Data Structure / AI Output Schema  
**Date**: 2026-02-28

---

## Overview

This contract defines the structured output schema for AI layout selection, including layout type, content zones, and image placement decisions. Used by `aiLayoutSelector.ts` to determine how slides are visually structured.

---

## AI Layout Selection Output

### Schema

```typescript
interface AILayoutDecision {
  layoutType: LayoutType;
  reasoning: string; // Why this layout was chosen
  imagePlacements: ImagePlacement[];
  contentZones: ContentZone[];
  estimatedHeight: 'standard' | 'tall' | 'multi-slide'; // Height prediction
}

type LayoutType = 
  | 'two-column' 
  | 'quadrant' 
  | 'card-grid' 
  | 'stat-blocks' 
  | 'flow' 
  | 'numbered'
  | 'hero' // Large image + minimal text
  | 'split' // 50/50 image + content
  | 'overlay'; // Image background with text overlay

interface ImagePlacement {
  position: ImagePosition;
  size: ImageSize;
  zIndex: 0 | 10 | 20; // 0=background, 10=inline, 20=overlay
  contentPrompt: string; // What the image should depict
  priority: 'high' | 'medium' | 'low'; // Generation priority
}

type ImagePosition = 
  | 'background' 
  | 'left-panel' 
  | 'right-panel' 
  | 'top-banner' 
  | 'inline-between' // Between content sections
  | 'center-overlay';

type ImageSize = 
  | 'full'    // 100% width/height
  | 'half'    // 50%
  | 'third'   // 33%
  | 'quarter'; // 25%

interface ContentZone {
  type: ContentZoneType;
  gridArea?: string; // CSS Grid area name (e.g., "header", "main", "sidebar")
  flexOrder?: number; // Flex order for responsive layouts
  width: string; // Tailwind width class (e.g., "w-1/2", "w-full")
  alignment: 'left' | 'right' | 'center';
}

type ContentZoneType = 
  | 'header' 
  | 'body' 
  | 'stat' 
  | 'card' 
  | 'badge' 
  | 'quote'
  | 'list';
```

---

## Layout Type Specifications

### 1. Two-Column Layout

**Use Case**: Vision + image, comparison, text + visual

**Structure**:
- Left column: Text content (50% width)
- Right column: Image (50% width)
- OR: Image left, content right (AI decides based on content flow)

**Image Placements**:
```typescript
{
  position: 'left-panel' | 'right-panel',
  size: 'half',
  zIndex: 10,
  contentPrompt: "Inspiring {keywords} in Saudi Arabia",
  priority: 'high'
}
```

**Content Zones**:
- Header: Full width top (w-full)
- Column 1: Half width (w-1/2)
- Column 2: Half width (w-1/2)

---

### 2. Quadrant Layout

**Use Case**: SWOT analysis, 2×2 comparisons

**Structure**:
- 4 equal quadrants (50% × 50% each)
- Optional: Background image with semi-transparent overlay

**Image Placements**:
```typescript
{
  position: 'background',
  size: 'full',
  zIndex: 0,
  contentPrompt: "Strategic planning {keywords} in Saudi Arabia",
  priority: 'medium'
}
```

**Content Zones**:
- 4 quadrants: Each w-1/2 h-1/2 with internal padding

---

### 3. Card Grid Layout

**Use Case**: Features, services, team members

**Structure**:
- Top banner image (optional)
- 2-3 column grid of cards
- Each card: icon + title + description

**Image Placements**:
```typescript
[
  {
    position: 'top-banner',
    size: 'full',
    zIndex: 10,
    contentPrompt: "Modern {keywords} in Saudi Arabia",
    priority: 'high'
  }
]
```

**Content Zones**:
- Banner: Full width, h-32
- Grid: 2-3 columns (w-1/2 or w-1/3) × N rows

---

### 4. Stat Blocks Layout

**Use Case**: KPIs, metrics, numbers

**Structure**:
- Side panel image (30% width)
- Stat blocks grid (70% width)
- Each stat: large number + label + icon

**Image Placements**:
```typescript
{
  position: 'right-panel',
  size: 'third',
  zIndex: 10,
  contentPrompt: "Analytics dashboard {keywords} in Saudi Arabia",
  priority: 'medium'
}
```

**Content Zones**:
- Main area: 2×2 or 3×2 grid (w-2/3)
- Side panel: Image (w-1/3)

---

### 5. Flow Layout

**Use Case**: Process steps, timeline, roadmap

**Structure**:
- Numbered steps with arrows/connectors
- Images inline between steps (optional)

**Image Placements**:
```typescript
[
  {
    position: 'inline-between',
    size: 'quarter',
    zIndex: 10,
    contentPrompt: "Step {step_number} {keywords} in Saudi Arabia",
    priority: 'low'
  }
]
```

**Content Zones**:
- Steps: Vertical or horizontal flow with flex layout
- Connectors: Arrows between steps

---

### 6. Hero Layout

**Use Case**: Cover slide, section dividers

**Structure**:
- Large background image (full bleed)
- Centered text overlay with semi-transparent background

**Image Placements**:
```typescript
{
  position: 'background',
  size: 'full',
  zIndex: 0,
  contentPrompt: "Inspiring {keywords} landscape in Saudi Arabia",
  priority: 'high'
}
```

**Content Zones**:
- Overlay: Centered text with backdrop-blur

---

## AI Decision Logic

### Input to AI Layout Selector

```typescript
interface LayoutSelectionInput {
  slideType: string; // e.g., "kpis", "budget", "swot"
  contentLength: number; // Character count
  contentBlocks: number; // Number of distinct sections
  hasNumbers: boolean; // Contains numeric data
  hasComparison: boolean; // Contains vs/comparison
  hasSequence: boolean; // Contains steps/timeline
  keywords: string[]; // Extracted keywords
}
```

### Output from AI Layout Selector

```typescript
interface LayoutSelectionOutput {
  layoutType: LayoutType;
  reasoning: string;
  imagePlacements: ImagePlacement[]; // 0-3 images
  contentZones: ContentZone[];
  confidence: number; // 0-1 (for fallback logic)
}
```

### OpenRouter Structured Output

**Model**: `openai/gpt-4o` (supports structured output)  
**System Prompt**:
```
You are a presentation design AI. Given slide content, select the best Gamma-style layout and decide where to place images (0-3 per slide). Prioritize visual hierarchy, readability, and professional aesthetics. For Saudi nonprofit presentations, suggest realistic, culturally appropriate images.
```

**User Prompt**:
```
Slide type: {slideType}
Content: {truncated_content}
Keywords: {keywords}

Select layout type and image placements. Return JSON matching AILayoutDecision schema.
```

**Response Format**: JSON matching `AILayoutDecision` schema (enforced via OpenRouter `response_format`)

---

## Fallback Rules

If AI selection fails or returns invalid schema:

1. **Rule-Based Fallback**:
   - SWOT → `quadrant` layout, 1 background image
   - KPIs (>4 items) → `stat-blocks` layout, 1 side-panel image
   - Features (>3 items) → `card-grid` layout, 1 top-banner image
   - Vision/Mission → `two-column` layout, 1 right-panel image
   - Timeline → `flow` layout, 0 images (icons only)

2. **Image Placement Defaults**:
   - If no images specified → add 1 image at `right-panel`, `half` size
   - If >3 images specified → keep only first 3 (priority order)

---

## Validation Rules

### Layout Type Validation

- Must be one of the defined `LayoutType` enum values
- Cannot be empty or null

### Image Placement Validation

- `imagePlacements.length` must be 0-3
- Each `position` must be valid `ImagePosition` enum
- Each `size` must be valid `ImageSize` enum
- `zIndex` must be 0, 10, or 20
- `contentPrompt` must be 10-200 characters
- `priority` must be 'high', 'medium', or 'low'

### Content Zone Validation

- `contentZones.length` must be 1-10
- Each `type` must be valid `ContentZoneType` enum
- `width` must be valid Tailwind class (w-full, w-1/2, w-1/3, w-1/4, w-2/3, w-3/4)
- `alignment` must be 'left', 'right', or 'center'

---

## Example: SWOT Slide Layout Decision

### Input

```json
{
  "slideType": "swot",
  "contentLength": 450,
  "contentBlocks": 4,
  "hasNumbers": false,
  "hasComparison": true,
  "hasSequence": false,
  "keywords": ["strengths", "weaknesses", "opportunities", "threats", "strategic", "analysis"]
}
```

### Output

```json
{
  "layoutType": "quadrant",
  "reasoning": "SWOT analysis requires 4 equal sections for comparison. Quadrant layout provides clear visual separation with optional background image for context.",
  "imagePlacements": [
    {
      "position": "background",
      "size": "full",
      "zIndex": 0,
      "contentPrompt": "Strategic planning whiteboard in Saudi Arabia professional office, realistic, high quality",
      "priority": "medium"
    }
  ],
  "contentZones": [
    { "type": "header", "width": "w-full", "alignment": "center" },
    { "type": "card", "gridArea": "top-left", "width": "w-1/2", "alignment": "right" },
    { "type": "card", "gridArea": "top-right", "width": "w-1/2", "alignment": "right" },
    { "type": "card", "gridArea": "bottom-left", "width": "w-1/2", "alignment": "right" },
    { "type": "card", "gridArea": "bottom-right", "width": "w-1/2", "alignment": "right" }
  ],
  "estimatedHeight": "standard",
  "confidence": 0.95
}
```

---

## Contract Version

**Version**: 1.0.0  
**Breaking Changes**: N/A (new contract)  
**Deprecations**: None
