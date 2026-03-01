# Research: Slide Output Gamma Presentation Audit

**Feature**: Slide Output Gamma Presentation Audit  
**Date**: 2026-02-23  
**Status**: Complete

---

## 1. AI Layout Selection Strategy

**Decision**: Structured Output (JSON Schema) with OpenRouter

**Rationale**:
- **Type Safety**: JSON Schema validation guarantees valid responses, eliminating parsing errors
- **Cost Efficiency**: ~$0.0001-0.0002 per layout selection (1-2 cents per 100 slides)
- **Low Latency**: ~500-900ms total (15ms OpenRouter + 400-850ms model inference)
- **Native Support**: Works across GPT-4o, Claude Sonnet 4.5, Gemini, Fireworks models

**Alternatives Considered**:
- **Natural Language**: More flexible but requires parsing, higher token costs, inconsistent formats → Rejected
- **Rule-Based**: Zero cost, instant, but less adaptive → Used as fallback
- **Hybrid**: Rules for simple cases, AI for complex → Future optimization

**Implementation Notes**:
- **Recommended Model**: GPT-4.1 Mini ($0.40/1M input, $1.60/1M output)
- **Budget Alternative**: DeepSeek Chat ($0.32/1M input, $0.89/1M output)
- **Cost Example**: 1000 presentations × 10 slides = $1.50-2.00 (GPT-4.1 Mini) or $0.80 (DeepSeek)
- **Latency**: 500-750ms per slide; 5-7.5s for 10 slides sequential, ~1s if batched/parallel
- **Fallback Strategy**: Three-tier (AI → Rule-based → Default safe layout)
- **Schema**: Structured output with layout type, item style, text size, reasoning

---

## 2. PPTX/PDF Export Libraries

**Decision**:
- **PowerPoint**: PptxGenJS
- **PDF**: @digicole/pdfmake-rtl

**Rationale**:

**PptxGenJS**:
- Active maintenance (110K weekly downloads vs officegen 14.5K, inactive 4 years)
- Native RTL support (`rtlMode: true`, `lang: "ar"`)
- Full TypeScript support
- Native 16:9 via `LAYOUT_16x9` (10 × 5.625 inches, default)
- Browser compatible
- Visual fidelity: images (PNG, JPG, GIF, SVG), shapes, colors, transparency, base64 encoding

**@digicole/pdfmake-rtl**:
- Automatic RTL handling (detects Arabic text)
- Cairo font built-in (automatic for Arabic, Persian, Urdu)
- Drop-in pdfmake replacement (100% compatible)
- Mixed Arabic/English support seamlessly
- Client-side generation
- Full styling (colors, layouts, tables, images)

**Alternatives Considered**:
- **officegen**: Inactive 4 years, no RTL docs, no TypeScript → Rejected
- **jsPDF**: Manual RTL config, garbled text issues, complex setup → Rejected
- **pdfmake (standard)**: No native RTL, manual font config → Rejected

**Implementation Notes**:

**RTL Support**:
- **PptxGenJS**: `rtlMode: true` + `lang: "ar"`; **limitation**: mixed RTL/LTR in same paragraph has issues (GitHub #1349) → **workaround**: separate text blocks
- **@digicole/pdfmake-rtl**: Zero config, automatic RTL detection, no limitations

**Cairo Font**:
- **PptxGenJS**: Cannot embed fonts (feature request #176); font must be installed on viewer systems; **workaround**: convert text to base64 images for guaranteed rendering
- **@digicole/pdfmake-rtl**: Built-in, no config needed

**16:9 Dimensions**:
- **PptxGenJS**: `pptx.layout = 'LAYOUT_16x9'` (default)
- **@digicole/pdfmake-rtl**: Use landscape page size for presentation-like layout

**Visual Fidelity**:
- **PptxGenJS**: Images via URL/path/base64 (pre-encode for performance); colors (hex, RGB); transformations (rotation, transparency); precise positioning (x, y, w, h in inches)
- **@digicole/pdfmake-rtl**: Full pdfmake styling (colors, margins, padding, tables, images, columns, absolute positioning)

---

## 3. Layout Rendering Engine Design

**Decision**: Layout Registry (map of layout type → React component)

**Rationale**:
- **Extensibility**: Easy to add new layouts without modifying core logic
- **Type Safety**: TypeScript ensures all layouts implement same interface
- **Testability**: Each layout component can be tested independently
- **Maintainability**: Clear separation of concerns; layout logic isolated

**Alternatives Considered**:
- **Switch/Case**: Simpler but harder to extend, violates open/closed principle → Rejected
- **Dynamic Imports**: Reduces bundle size but adds complexity and latency → Overkill for ~10 layouts

**Implementation Notes**:
- **Registry Structure**:
  ```typescript
  export const LAYOUT_REGISTRY: Record<LayoutType, React.FC<SlideLayoutProps>> = {
    "two-column": TwoColumnLayout,
    "quadrant": QuadrantLayout,
    "flow": FlowLayout,
    "stat-blocks": StatBlocksLayout,
    "card-grid": CardGridLayout,
    // ...
  };
  ```
- **Props Structure**: All layouts receive `{ contentBlocks, primaryColor, rtl, dimensions }`
- **Content Validation**: Linter/validator ensures no solid text blocks (all content in cards/badges/sections)
- **Rendering**: `const LayoutComponent = LAYOUT_REGISTRY[aiSelectedType]; return <LayoutComponent {...props} />;`

---

## 4. Icon Selection from Lucide/Heroicons

**Decision**: Predefined Keyword-to-Icon Mapping (with optional AI enhancement for future)

**Rationale**:
- **Performance**: Instant, deterministic results (no API latency)
- **Cost**: Zero additional cost (vs $0.001-0.01 per AI call × 5-20 icons per deck)
- **Reliability**: No API failures, works offline
- **Lucide Already Installed**: Project uses `lucide-react@0.453.0` extensively
- **Fallback Simplicity**: AI suggestions require validation anyway; mapping infrastructure needed regardless

**Alternatives Considered**:
- **Pure AI**: Nuanced understanding but adds 100-500ms latency, costs, requires validation → Rejected as overkill
- **Heroicons**: Clean design but requires additional dependency, smaller library (300 vs 1000+ icons), project standardized on Lucide → Rejected

**Implementation Notes**:
- **Dynamic Loading**: Wildcard import (`import * as LucideIcons from 'lucide-react'`) with type-safe loader
- **Mapping**: Comprehensive keyword map (English + Arabic) organized by categories (financial, performance, challenges, goals, time, people, impact, innovation, communication, resources)
- **Fallback Strategy**: Three-tier (keyword match → category fallback → default icon)
- **Example Mappings**:
  - `budget`/`ميزانية` → `DollarSign`
  - `kpi`/`مؤشر` → `Gauge`
  - `challenge`/`تحدي` → `AlertCircle`
  - `goal`/`هدف` → `Target`
  - `timeline`/`جدول` → `Calendar`
  - `team`/`فريق` → `Users`
  - `impact`/`أثر` → `Zap`
- **AI Enhancement (Optional Future)**: Use AI only for unmapped edge cases; call only if keyword match fails
- **Best Practices**: Consistency across slides, simplicity, color coding, size hierarchy, accessibility, cultural sensitivity, performance caching

---

## 5. Slide Splitting for Long Content

**Decision**: Character + Block Count Heuristics with Context Preservation

**Rationale**:
- **User Clarity**: Clarification confirmed split into multiple slides (not paginate/scroll/truncate)
- **Focused Ideas**: Each slide gets one focused idea (Gamma-style)
- **Measurable**: Character count and block count are deterministic and testable

**Alternatives Considered**:
- **Height Estimation**: More accurate but requires rendering/measurement → Too complex
- **Fixed Block Count**: Simple but ignores content density → Rejected
- **Manual Splitting**: User-controlled but defeats automation goal → Rejected

**Implementation Notes**:
- **Heuristics**:
  - **Character Threshold**: >800 characters per slide triggers split
  - **Block Threshold**: >8 content blocks (cards/badges/sections) triggers split
  - **Combined**: If either threshold exceeded, split
- **Context Preservation**:
  - Numbered slides: "Goals (1 of 3)", "Goals (2 of 3)", "Goals (3 of 3)"
  - Maintain section header across split slides
  - Preserve visual style (layout type, primary color, icons)
- **Edge Cases**:
  - Single very long paragraph: Split at sentence boundaries (period + space)
  - Nested lists: Flatten or split at top-level items
  - Mixed content: Prioritize logical breaks (headers, sections)
- **Validation**: No slide may have >1000 characters or >10 blocks after split

---

## 6. Visual Hierarchy & Typography

**Decision**: Tailwind CSS Utility Patterns with Dynamic Primary Color Application

**Rationale**:
- **Consistency**: Tailwind utilities ensure consistent spacing, sizing, and colors across all layouts
- **Branding**: Primary color from user branding (Supabase) applied dynamically to badges, headers, accents
- **Maintainability**: Utility classes easier to maintain than custom CSS
- **RTL Support**: Tailwind RTL utilities (`rtl:` prefix) work seamlessly

**Alternatives Considered**:
- **Custom CSS**: More control but harder to maintain, no RTL utilities → Rejected
- **CSS-in-JS**: Dynamic but adds runtime overhead → Unnecessary with Tailwind

**Implementation Notes**:
- **Strategic Bolding**: `font-semibold` or `font-bold` for key terms, metrics
- **Color Accents**: `text-[primaryColor]` or `bg-[primaryColor]` for badges, headers, key terms
- **Font Hierarchy**:
  - Headers: `text-2xl font-bold` (section headers), `text-xl font-semibold` (subsection)
  - Body: `text-base` (default), `text-sm` (dense content)
  - Badges: `text-xs font-medium` (numbered badges)
- **Header Separation**: `mb-4` or `mb-6` margin below headers; `border-b` optional divider
- **Primary Color Application**:
  - Fetch from Supabase user branding settings
  - Apply via Tailwind arbitrary values: `bg-[${primaryColor}]`, `text-[${primaryColor}]`, `border-[${primaryColor}]`
  - Fallback: Default dashboard accent (cyan/teal) if unset

---

## 7. RTL Layout Support

**Decision**: Tailwind CSS RTL Utilities (`rtl:` prefix) with Minimal Custom Logic

**Rationale**:
- **Built-in Support**: Tailwind 3.x has native RTL support via `rtl:` and `ltr:` prefixes
- **Automatic Flipping**: Margins, padding, text alignment, flex direction auto-flip with `dir="rtl"`
- **Cairo Font**: Already in project; works with Tailwind
- **Minimal Custom Logic**: Only needed for complex layouts (flow diagrams, numbered badges)

**Alternatives Considered**:
- **Custom RTL CSS**: Full control but reinvents wheel, hard to maintain → Rejected
- **RTL-Specific Components**: Duplicate components for RTL/LTR → Rejected as unmaintainable

**Implementation Notes**:
- **Tailwind RTL**:
  - Set `dir="rtl"` on root element when Arabic detected
  - Use `rtl:` prefix for RTL-specific styles: `rtl:text-right`, `rtl:ml-4`, `rtl:flex-row-reverse`
  - Automatic flipping: `ml-4` becomes `mr-4` in RTL, `text-left` becomes `text-right`
- **Cairo Font**: Already configured; no additional setup
- **Custom Logic Needed**:
  - **Numbered Badges**: Ensure number appears on correct side (right in RTL, left in LTR)
  - **Flow Diagrams**: Reverse arrow direction and node order in RTL
  - **Quadrant Layouts**: Mirror quadrant positions (top-right ↔ top-left, bottom-right ↔ bottom-left)
- **Testing**: Visual regression tests for all layout types in both LTR and RTL modes
- **Edge Cases**: Mixed Arabic/English content (handled by browser's bidi algorithm; no custom logic needed)

---

## Summary

All research complete. Key decisions:
1. **AI Layout Selection**: Structured output via OpenRouter (GPT-4.1 Mini or DeepSeek)
2. **Export Libraries**: PptxGenJS (PowerPoint) + @digicole/pdfmake-rtl (PDF)
3. **Layout Engine**: Registry pattern with React components
4. **Icon Selection**: Predefined keyword mapping (Lucide) with optional AI enhancement
5. **Slide Splitting**: Character + block count heuristics with context preservation
6. **Visual Hierarchy**: Tailwind utilities with dynamic primary color
7. **RTL Support**: Tailwind `rtl:` prefix with minimal custom logic for complex layouts

Ready for Phase 1 (data-model.md, contracts/, quickstart.md).
