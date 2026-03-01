# Data Model: Gamma-Inspired Smart Layout Engine

**Feature**: 007-gamma-smart-layout-engine  
**Date**: 2026-03-01

---

## Entity Relationship Overview

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    SlideDeck    │1─────*│     Slide       │*─────1│  LayoutRegistry │
└─────────────────┘       └─────────────────┘       └─────────────────┘
        │                         │
        │                         │
        │                    1    │ *
        │               ┌─────────┴─────────┐
        │               │    SlideImage     │
        │               └───────────────────┘
        │
        │ 1
┌───────┴─────────┐
│      User       │
└─────────────────┘
```

---

## Entities

### 1. LayoutDefinition (Registry Entry)

Represents a single layout in the 45-layout registry. Stored in code, not database.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique layout identifier (e.g., `feature-cards-3`) |
| `family` | `LayoutFamily` | Layout family enum (cover, text-media, cards, kpis, comparison, process, frameworks, budget, lists) |
| `name` | `string` | Human-readable name (e.g., "Feature Cards (3-up)") |
| `bestFor` | `ContentPattern[]` | Content patterns this layout excels at |
| `minItems` | `number` | Minimum content items supported |
| `maxItems` | `number` | Maximum content items before overflow |
| `supportsImages` | `boolean` | Whether layout can include images |
| `densityLevel` | `'low' \| 'medium' \| 'high'` | Content density level |
| `estimatedHeight` | `number` | Expected height in pixels at 1920×1080 |

**Validation Rules**:
- `id` must be unique across registry
- `minItems` ≤ `maxItems`
- `estimatedHeight` must be positive

---

### 2. ContentAnalysis

Computed analysis of slide content for layout selection. Transient (not persisted).

| Field | Type | Description |
|-------|------|-------------|
| `itemCount` | `number` | Number of content items/blocks |
| `densityScore` | `number` | Characters per block ratio (0-100) |
| `structureType` | `ContentStructure` | Detected structure: list, stats, matrix, steps, narrative, mixed |
| `hasTable` | `boolean` | Contains tabular data |
| `hasMetrics` | `boolean` | Contains numeric KPIs/stats |
| `hasImages` | `boolean` | Contains or needs images |
| `hasList` | `boolean` | Contains bullet/numbered list |
| `hasTimeline` | `boolean` | Contains chronological/sequential content |
| `hasComparison` | `boolean` | Contains comparative content |

**Enums**:
```typescript
type ContentStructure = 
  | 'list'       // Bullet points, features
  | 'stats'      // KPIs, metrics, numbers
  | 'matrix'     // 2x2, SWOT, grid
  | 'steps'      // Process, timeline
  | 'narrative'  // Paragraphs, quotes
  | 'mixed';     // Combination
```

---

### 3. LayoutSelectionLog

Audit log for AI layout decisions. Persisted for debugging/analytics.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `uuid` | Primary key |
| `slideDeckId` | `uuid` | FK to slide_decks |
| `slideIndex` | `number` | Position in deck (0-indexed) |
| `slideType` | `string` | Semantic type hint (e.g., "budget", "kpi") |
| `contentAnalysis` | `jsonb` | ContentAnalysis object |
| `candidateLayouts` | `string[]` | Layout IDs considered |
| `candidateScores` | `jsonb` | Score per candidate layout |
| `selectedLayoutId` | `string` | Final selected layout ID |
| `selectionMethod` | `'scoring' \| 'ai' \| 'fallback'` | How layout was chosen |
| `createdAt` | `timestamp` | When selection occurred |

**Indexes**:
- `slideDeckId` for deck-level queries
- `selectedLayoutId` for layout usage analytics
- `createdAt` for time-based analysis

---

### 4. SlideCard (Enhanced)

Extends existing `SlideCard` in slideStore with layout engine fields.

| Field | Type | Description | New? |
|-------|------|-------------|------|
| `id` | `string` | Unique identifier | Existing |
| `type` | `CardType` | Semantic type | Existing |
| `title` | `string` | Slide title | Existing |
| `content` | `string` | Raw content | Existing |
| `style` | `CardStyle` | Styling options | Existing |
| `order` | `number` | Position in deck | Existing |
| `images` | `SlideImage[]` | Attached images | Existing |
| `layoutId` | `string` | Selected layout from registry | **New** |
| `layoutConfig` | `LayoutConfig` | Layout-specific config | Enhanced |
| `contentAnalysis` | `ContentAnalysis` | Computed content analysis | **New** |
| `overflowStrategy` | `OverflowStrategy` | How overflow was handled | **New** |

**New Types**:
```typescript
type OverflowStrategy = 
  | 'none'           // Content fits
  | 'denser-layout'  // Switched to denser variant
  | 'expanded'       // Slide height expanded
  | 'split';         // Content split to next slide

interface LayoutConfig {
  imagePlacements: ImagePlacement[];
  customSpacing?: number;
  columns?: number;
  rows?: number;
  highlightIndex?: number;  // For comparison tables
}
```

---

### 5. ExportJob (New)

Tracks export operations for async processing and error handling.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `uuid` | Primary key |
| `slideDeckId` | `uuid` | FK to slide_decks |
| `userId` | `uuid` | FK to users |
| `format` | `'pdf' \| 'pptx'` | Export format |
| `status` | `ExportStatus` | Current status |
| `progress` | `number` | 0-100 progress percentage |
| `outputUrl` | `string \| null` | URL to download file |
| `errorMessage` | `string \| null` | Error details if failed |
| `createdAt` | `timestamp` | Job created |
| `completedAt` | `timestamp \| null` | Job completed |

**Enums**:
```typescript
type ExportStatus = 
  | 'pending'     // Queued
  | 'processing'  // In progress
  | 'completed'   // Success
  | 'failed';     // Error
```

---

## Database Schema Changes

### New Table: `layout_selection_logs`

```sql
CREATE TABLE layout_selection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_deck_id UUID NOT NULL REFERENCES slide_decks(id) ON DELETE CASCADE,
  slide_index INTEGER NOT NULL,
  slide_type VARCHAR(50),
  content_analysis JSONB NOT NULL,
  candidate_layouts TEXT[] NOT NULL,
  candidate_scores JSONB,
  selected_layout_id VARCHAR(100) NOT NULL,
  selection_method VARCHAR(20) NOT NULL DEFAULT 'scoring',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_layout_logs_deck ON layout_selection_logs(slide_deck_id);
CREATE INDEX idx_layout_logs_layout ON layout_selection_logs(selected_layout_id);
CREATE INDEX idx_layout_logs_created ON layout_selection_logs(created_at);
```

### New Table: `export_jobs`

```sql
CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_deck_id UUID NOT NULL REFERENCES slide_decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'pptx')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  output_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_export_jobs_user ON export_jobs(user_id);
CREATE INDEX idx_export_jobs_deck ON export_jobs(slide_deck_id);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);
```

### Enhanced: `slide_decks.slides` JSON Structure

The `slides` JSONB column will store enhanced slide objects:

```typescript
interface PersistedSlide {
  id: string;
  type: CardType;
  title: string;
  content: string;
  style: CardStyle;
  order: number;
  images: SlideImage[];
  layoutId: string;           // NEW
  layoutConfig: LayoutConfig; // ENHANCED
  overflowStrategy: OverflowStrategy; // NEW
}
```

---

## State Transitions

### Export Job Lifecycle

```
  pending ──────► processing ──────► completed
     │                │
     │                ▼
     └──────────► failed
```

**Transition Rules**:
- `pending → processing`: Worker picks up job
- `processing → completed`: Export succeeds, `outputUrl` set
- `processing → failed`: Export fails, `errorMessage` set
- `pending → failed`: Job times out or cancelled

### Layout Selection Flow

```
Content Input
     │
     ▼
┌─────────────────┐
│ Analyze Content │
│ (ContentAnalysis)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Score Layouts   │
│ (all 45 layouts)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     Ambiguous?     ┌─────────────┐
│ Select Top      │────────────────────►│ AI Fallback │
│ Scoring Layout  │                     └──────┬──────┘
└────────┬────────┘                            │
         │◄────────────────────────────────────┘
         ▼
┌─────────────────┐
│ Log Decision    │
└────────┬────────┘
         │
         ▼
    Selected Layout
```

---

## Validation Rules Summary

| Entity | Rule |
|--------|------|
| LayoutDefinition | `id` unique, `minItems` ≤ `maxItems` |
| ContentAnalysis | `densityScore` 0-100, `itemCount` ≥ 0 |
| LayoutSelectionLog | `slideIndex` ≥ 0, `candidateLayouts` non-empty |
| ExportJob | `progress` 0-100, `format` in ['pdf', 'pptx'] |
| SlideCard | `layoutId` must exist in registry |
