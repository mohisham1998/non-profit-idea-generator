# AI Layout Selection Contract

**Feature**: Slide Output Gamma Presentation Audit  
**Date**: 2026-02-23  
**Version**: 1.0

---

## Purpose

This contract defines the interface for AI-driven layout selection via OpenRouter API. The AI analyzes slide content and selects the optimal layout type to maximize presentation quality and stakeholder impact.

---

## Input Schema

```json
{
  "content": "string (slide content as text or JSON)",
  "contentType": "string (e.g., 'features', 'kpis', 'goals', 'challenges', 'vision', 'budget')",
  "contentLength": "number (character count)",
  "blockCount": "number (number of list items or sections)",
  "title": "string (optional, slide title for context)"
}
```

### Input Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | The actual slide content (text, list items, or JSON structure) |
| `contentType` | string | Yes | Category of content to guide layout selection |
| `contentLength` | number | Yes | Total character count of content (used for density assessment) |
| `blockCount` | number | Yes | Number of distinct items/sections (used for layout type selection) |
| `title` | string | No | Slide title for additional context |

### Input Example

```json
{
  "content": "1. Increase beneficiary reach by 40%\n2. Reduce operational costs by 25%\n3. Launch 3 new programs\n4. Establish partnerships with 5 organizations",
  "contentType": "goals",
  "contentLength": 156,
  "blockCount": 4,
  "title": "Project Goals"
}
```

---

## Output Schema

```json
{
  "layout": "string (enum: cards | list | grid | numbered | quote | timeline | compact | table | two-column | quadrant | flow | stat-blocks)",
  "itemStyle": "string (enum: numbered | check | arrow | dot | star | card)",
  "textSize": "string (enum: sm | md | lg)",
  "rationale": "string (brief explanation for the layout choice, optional for debugging)"
}
```

### Output Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `layout` | string (enum) | Yes | The optimal layout type for this slide content |
| `itemStyle` | string (enum) | Yes | The visual style for list items or content blocks |
| `textSize` | string (enum) | Yes | Recommended text size based on content density |
| `rationale` | string | No | Brief explanation for debugging/logging |

### Layout Type Descriptions

| Layout | Best For | Typical Block Count |
|--------|----------|---------------------|
| `quote` | Vision statements, objectives, inspirational content | 1-3 sentences |
| `numbered` | Sequential steps, objectives, outputs | 3-8 items |
| `cards` | Features, strengths, benefits with distinct categories | 2-6 items |
| `grid` | Features/items needing equal visual weight | 4-9 items |
| `list` | Simple bullet points for straightforward information | 3-10 items |
| `timeline` | Chronological events or phases | 3-8 events |
| `table` | Structured data with rows/columns | N/A (tabular data) |
| `compact` | Dense information needing space efficiency | 10+ items |
| `two-column` | Comparison, before/after, pros/cons | 2 sections |
| `quadrant` | SWOT, 2×2 matrix, four categories | 4 sections |
| `flow` | Process, user journey, sequential steps with arrows | 3-8 steps |
| `stat-blocks` | KPIs, metrics, numbers with labels | 2-6 stats |

### Output Example

```json
{
  "layout": "numbered",
  "itemStyle": "numbered",
  "textSize": "md",
  "rationale": "4 distinct goal items with sequential priority; numbered layout emphasizes order and importance"
}
```

---

## API Endpoint

**URL**: `https://openrouter.ai/api/v1/chat/completions`  
**Method**: `POST`  
**Headers**:
```json
{
  "Authorization": "Bearer YOUR_OPENROUTER_API_KEY",
  "Content-Type": "application/json",
  "HTTP-Referer": "https://your-nonprofit-app.com",
  "X-Title": "Nonprofit Presentation Generator"
}
```

**Request Body**:
```json
{
  "model": "openai/gpt-4.1-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a presentation design expert specializing in nonprofit and Saudi Arabian organizational presentations. Your task is to select the optimal slide layout based on content type and structure. [Full system prompt in implementation]"
    },
    {
      "role": "user",
      "content": "Analyze this slide content and select the optimal layout:\n\nTitle: \"Project Goals\"\nContent Type: goals\nContent: [content here]\n\nNumber of items/sections: 4\nEstimated word count: 156"
    }
  ],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "slide_layout_selection",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "layout": { "type": "string", "enum": ["cards", "list", "grid", "numbered", "quote", "timeline", "compact", "table", "two-column", "quadrant", "flow", "stat-blocks"] },
          "itemStyle": { "type": "string", "enum": ["numbered", "check", "arrow", "dot", "star", "card"] },
          "textSize": { "type": "string", "enum": ["sm", "md", "lg"] },
          "rationale": { "type": "string" }
        },
        "required": ["layout", "itemStyle", "textSize"],
        "additionalProperties": false
      }
    }
  },
  "temperature": 0.3,
  "max_tokens": 150
}
```

---

## Error Handling

### AI Call Failure

If the AI call fails (timeout, API error, invalid response), the system MUST fall back to rule-based layout selection:

**Fallback Strategy**:
1. **Tier 1**: AI Selection (with 3-second timeout)
2. **Tier 2**: Rule-Based Selection (predefined `contentType` → layout mapping)
3. **Tier 3**: Default Safe Layout (`list` with `dot` item style, `md` text size)

### Rule-Based Fallback Mapping

```typescript
const LAYOUT_BY_CONTENT: Record<string, { layout: string, itemStyle: string, textSize: string }> = {
  vision: { layout: "quote", itemStyle: "card", textSize: "lg" },
  generalObjective: { layout: "quote", itemStyle: "card", textSize: "lg" },
  detailedObjectives: { layout: "numbered", itemStyle: "numbered", textSize: "md" },
  idea: { layout: "quote", itemStyle: "card", textSize: "lg" },
  justifications: { layout: "cards", itemStyle: "card", textSize: "md" },
  features: { layout: "grid", itemStyle: "star", textSize: "md" },
  strengths: { layout: "cards", itemStyle: "card", textSize: "md" },
  outputs: { layout: "numbered", itemStyle: "numbered", textSize: "md" },
  expectedResults: { layout: "list", itemStyle: "check", textSize: "md" },
  risks: { layout: "numbered", itemStyle: "arrow", textSize: "md" },
  kpis: { layout: "stat-blocks", itemStyle: "card", textSize: "lg" },
  budget: { layout: "table", itemStyle: "card", textSize: "md" },
  swot: { layout: "quadrant", itemStyle: "card", textSize: "md" },
  timeline: { layout: "timeline", itemStyle: "arrow", textSize: "md" },
  goals: { layout: "numbered", itemStyle: "numbered", textSize: "md" },
  challenges: { layout: "cards", itemStyle: "card", textSize: "md" }
};
```

### Invalid Icon Suggestions

If the AI suggests an icon name that doesn't exist in the Lucide library, the system MUST use the fallback icon (`Circle` or category-appropriate icon).

---

## Performance Expectations

| Metric | Target | Notes |
|--------|--------|-------|
| **Latency** | 500-750ms | Includes OpenRouter gateway (~15ms) + model inference (~400-600ms) + network (~50-100ms) |
| **Cost** | $0.0001-0.0002 per call | Using GPT-4.1 Mini; DeepSeek Chat is ~$0.00008 |
| **Timeout** | 3 seconds | After 3s, fall back to rule-based selection |
| **Success Rate** | >95% | With fallback strategy, 100% of slides get a layout |

---

## Versioning

**Version 1.0**: Initial contract with 12 layout types, 6 item styles, 3 text sizes

**Future Enhancements**:
- Add `iconSuggestions` array to output for AI-driven icon selection
- Support batch layout selection (multiple slides in one API call)
- Add `confidence` score to output for monitoring AI decision quality

---

## Testing

### Unit Tests

- Test AI call with valid input → returns valid output schema
- Test AI call timeout → falls back to rule-based selection
- Test AI call with invalid API key → falls back to rule-based selection
- Test rule-based fallback for each `contentType` → returns expected layout

### Integration Tests

- Generate 10-slide deck → verify each slide has a layout type assigned
- Generate deck with mixed content types → verify layout variety (no two consecutive slides with same layout unless content demands it)
- Generate deck with AI API disabled → verify all slides use fallback layouts

---

## Example Implementation

See `client/src/lib/aiLayoutSelector.ts` for reference implementation.
