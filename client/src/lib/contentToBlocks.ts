/**
 * Convert SlideCard content (any) to ContentBlock[] for layout components
 * @see specs/007-gamma-smart-layout-engine/spec.md
 */
import { parseContentBlocks } from './contentAnalyzer';
import type { ContentBlock } from './types/layouts';

/** Flatten nested content into a string suitable for parsing */
function flattenContent(c: unknown): string {
  if (c == null) return '';
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) {
    return c
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>;
          const val = obj.value ?? obj.target ?? obj.amount;
          const label = obj.name ?? obj.indicator ?? obj.title ?? obj.text ?? obj.description;
          if (val != null && label != null) return `${val} ${typeof obj.unit === 'string' ? obj.unit : ''} ${label}`.trim();
          return (label ?? obj.content ?? JSON.stringify(item)) as string;
        }
        return String(item);
      })
      .join('\n');
  }
  if (typeof c === 'object') {
    const obj = c as Record<string, unknown>;
    if (obj.kpis && Array.isArray(obj.kpis)) return flattenContent(obj.kpis);
    if (obj.categories && Array.isArray(obj.categories)) return flattenContent(obj.categories);
    if (obj.indicators && Array.isArray(obj.indicators)) return flattenContent(obj.indicators);
    if (obj.strengths && obj.weaknesses) {
      const arr = [
        ...(Array.isArray(obj.strengths) ? obj.strengths : []),
        ...(Array.isArray(obj.weaknesses) ? obj.weaknesses : []),
        ...(Array.isArray(obj.opportunities) ? obj.opportunities : []),
        ...(Array.isArray(obj.threats) ? obj.threats : []),
      ];
      return arr.map((x) => (typeof x === 'string' ? x : (x as Record<string, unknown>)?.title ?? (x as Record<string, unknown>)?.point ?? String(x))).join('\n');
    }
    const vals = Object.values(obj).filter((v) => v != null && v !== '');
    return vals.map((v) => (typeof v === 'string' ? v : Array.isArray(v) ? flattenContent(v) : String(v))).join('\n');
  }
  return String(c);
}

/** Convert KPIs or budget categories to stat blocks */
function structuredToBlocks(obj: Record<string, unknown>): ContentBlock[] | null {
  const kpis = obj.kpis ?? obj.indicators ?? obj.metrics;
  if (Array.isArray(kpis) && kpis.length > 0) {
    return kpis.map((k: unknown) => {
      const item = k as Record<string, unknown>;
      const val = typeof item.value === 'number' ? item.value : typeof item.target === 'number' ? item.target : undefined;
      const label = String(item.name ?? item.indicator ?? item.title ?? item.description ?? '');
      return { type: 'stat' as const, content: label, value: val ?? 0, unit: String(item.unit ?? ''), label };
    });
  }
  const cats = obj.categories;
  if (Array.isArray(cats) && cats.length > 0) {
    return cats.map((c: unknown) => {
      const item = c as Record<string, unknown>;
      const val = typeof item.amount === 'number' ? item.amount : typeof item.value === 'number' ? item.value : 0;
      const label = String(item.name ?? item.title ?? '');
      return { type: 'stat' as const, content: label, value: val, unit: ' ر.س', label };
    });
  }
  return null;
}

/**
 * Convert card content to ContentBlock[] for layout components.
 * Uses parseContentBlocks when content is a string; otherwise flattens to string first.
 */
export function contentToBlocks(content: unknown, title?: string): ContentBlock[] {
  if (content && typeof content === 'object' && !Array.isArray(content)) {
    const structured = structuredToBlocks(content as Record<string, unknown>);
    if (structured && structured.length > 0) return structured;
  }
  const str = typeof content === 'string' ? content : flattenContent(content);
  const blocks = parseContentBlocks(str);
  if (blocks.length === 0 && title) {
    return [{ type: 'heading', content: title }];
  }
  return blocks;
}
