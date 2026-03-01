# Contract: Content Analyzer Schema

**Feature**: 007-gamma-smart-layout-engine  
**Type**: Internal TypeScript Interface  
**Date**: 2026-03-01

---

## Overview

Defines the content analysis system that examines slide content and produces structured analysis for layout selection. This is the input to the layout scoring algorithm.

---

## TypeScript Interfaces

### ContentStructure Enum

```typescript
export type ContentStructure =
  | 'list'       // Bullet points, features, items
  | 'stats'      // KPIs, metrics, numbers
  | 'matrix'     // 2x2, SWOT, grid structures
  | 'steps'      // Process, timeline, sequential
  | 'narrative'  // Paragraphs, quotes, long text
  | 'mixed';     // Combination of structures
```

### ContentAnalysis Interface

```typescript
export interface ContentAnalysis {
  /** Number of distinct content items/blocks */
  itemCount: number;
  
  /** Density score: characters per block (0-100 normalized) */
  densityScore: number;
  
  /** Primary detected structure */
  structureType: ContentStructure;
  
  /** Secondary structures if mixed */
  secondaryStructures: ContentStructure[];
  
  /** Contains tabular/grid data */
  hasTable: boolean;
  
  /** Contains numeric KPIs or statistics */
  hasMetrics: boolean;
  
  /** Contains or references images */
  hasImages: boolean;
  
  /** Contains bullet or numbered list */
  hasList: boolean;
  
  /** Contains chronological/sequential content */
  hasTimeline: boolean;
  
  /** Contains comparison between options */
  hasComparison: boolean;
  
  /** Contains 2x2 or 4-quadrant structure */
  hasMatrix: boolean;
  
  /** Contains budget/cost/allocation data */
  hasBudget: boolean;
  
  /** Contains quote or testimonial */
  hasQuote: boolean;
  
  /** Detected content patterns for layout matching */
  patterns: ContentPattern[];
  
  /** Average words per item */
  avgWordsPerItem: number;
  
  /** Total character count */
  totalChars: number;
  
  /** Estimated render height at standard dimensions */
  estimatedHeight: number;
}
```

### ContentBlock Interface

```typescript
export interface ContentBlock {
  /** Block type */
  type: 'heading' | 'subheading' | 'paragraph' | 'bullet' | 'number' | 
        'stat' | 'quote' | 'image-ref' | 'table-row';
  
  /** Block content text */
  content: string;
  
  /** Numeric value if stat block */
  value?: number;
  
  /** Unit or suffix (e.g., '%', 'SAR', 'users') */
  unit?: string;
  
  /** Label for stat blocks */
  label?: string;
  
  /** Nesting level for lists */
  level?: number;
  
  /** Associated icon name */
  icon?: string;
}
```

---

## Analysis Functions

### analyzeContent

Main entry point for content analysis.

```typescript
/**
 * Analyze slide content and produce structured analysis
 * @param content - Raw content string (may include markdown)
 * @param slideType - Optional semantic type hint
 * @returns ContentAnalysis object
 */
export function analyzeContent(
  content: string,
  slideType?: CardType
): ContentAnalysis;
```

### parseContentBlocks

Parse raw content into typed blocks.

```typescript
/**
 * Parse content string into typed blocks
 * @param content - Raw content string
 * @returns Array of ContentBlock
 */
export function parseContentBlocks(content: string): ContentBlock[];
```

### detectContentPatterns

Identify content patterns for layout matching.

```typescript
/**
 * Detect content patterns from blocks
 * @param blocks - Parsed content blocks
 * @returns Array of ContentPattern
 */
export function detectContentPatterns(blocks: ContentBlock[]): ContentPattern[];
```

### calculateDensityScore

Compute normalized density score.

```typescript
/**
 * Calculate density score (0-100)
 * @param totalChars - Total character count
 * @param blockCount - Number of blocks
 * @returns Normalized density score
 */
export function calculateDensityScore(
  totalChars: number,
  blockCount: number
): number;
```

---

## Detection Heuristics

### Structure Detection Rules

| Structure | Detection Criteria |
|-----------|-------------------|
| `list` | 50%+ blocks are bullet/number type |
| `stats` | 30%+ blocks are stat type with numeric values |
| `matrix` | Contains 4 items with opposing pairs (SWOT keywords) |
| `steps` | Contains sequential markers (step 1, phase 1, first/then/finally) |
| `narrative` | Average block length > 100 chars, < 3 blocks |
| `mixed` | No single structure > 50% |

### Pattern Detection Rules

| Pattern | Detection Criteria |
|---------|-------------------|
| `n-items` | Exact count of content blocks (1-7+) |
| `stats` | Has numeric values with labels |
| `kpis` | Has metrics with % or currency |
| `comparison` | Contains "vs", "or", comparison keywords |
| `pros-cons` | Contains "advantages", "disadvantages", "pros", "cons" |
| `timeline` | Contains dates, years, or sequence markers |
| `budget` | Contains "SAR", "budget", "cost", currency symbols |
| `quote` | Block starts with quote marks or "قال" |
| `image-heavy` | Has image references or [image] markers |
| `text-heavy` | Total chars > 500, no images |

### Density Score Calculation

```typescript
// Density ranges
// 0-20: Very light (titles, stats)
// 21-40: Light (cards, icons)
// 41-60: Medium (balanced content)
// 61-80: Heavy (detailed text)
// 81-100: Very heavy (paragraphs)

const avgCharsPerBlock = totalChars / blockCount;
const normalized = Math.min(100, Math.round(avgCharsPerBlock / 5));
```

---

## Estimated Height Calculation

```typescript
const BASE_HEIGHT = 1080; // Standard slide height
const HEADER_HEIGHT = 120; // Title area
const FOOTER_HEIGHT = 60; // Branding area
const CONTENT_AREA = BASE_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT; // 900px

function estimateHeight(blocks: ContentBlock[]): number {
  let height = HEADER_HEIGHT + FOOTER_HEIGHT;
  
  for (const block of blocks) {
    switch (block.type) {
      case 'heading': height += 60; break;
      case 'subheading': height += 40; break;
      case 'paragraph': height += Math.ceil(block.content.length / 80) * 24; break;
      case 'bullet': height += 32; break;
      case 'number': height += 32; break;
      case 'stat': height += 80; break;
      case 'quote': height += 100; break;
      case 'image-ref': height += 200; break;
      case 'table-row': height += 40; break;
    }
  }
  
  return height;
}
```

---

## Constraints

1. **Item Count**: Must be ≥ 0
2. **Density Score**: Must be 0-100 inclusive
3. **Structure Type**: Must be valid ContentStructure enum value
4. **Patterns**: Must be valid ContentPattern values from registry
5. **Estimated Height**: Must be positive integer
