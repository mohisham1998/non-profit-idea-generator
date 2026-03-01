import { nanoid } from 'nanoid';
import { selectLayout } from './aiLayoutSelector';
import { getIconNameForCategory } from './iconSelector';
import type { ContentBlock } from '@/components/SlideBuilder/layouts';

const CHAR_THRESHOLD = 800;
const BLOCK_THRESHOLD = 8;

/** Parse text into lines (items), stripping list markers. */
export function parseLines(text: unknown): string[] {
  if (!text) return [];
  const str = typeof text === 'string' ? text : Array.isArray(text) ? text.join('\n') : String(text);
  return str
    .split(/[\n\r]+/)
    .map((l: string) => l.replace(/^[-•*·▪▸►✦]\s*/, '').replace(/^\d+[.)]\s*/, '').trim())
    .filter(Boolean);
}

/** Build content blocks from parsed lines. */
export function buildContentBlocks(
  items: string[],
  contentType: string,
  primaryColor: string
): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const iconName = getIconNameForCategory(contentType);

  items.forEach((item, i) => {
    blocks.push({
      id: nanoid(),
      type: 'card',
      content: item,
      style: { colorAccent: true, iconName },
    });
  });
  return blocks;
}

/** Check if content should be split into multiple slides. */
export function shouldSplitContent(content: string, blockCount: number): boolean {
  return content.length > CHAR_THRESHOLD || blockCount > BLOCK_THRESHOLD;
}

/** Split items into chunks for multiple slides (each slide gets one focused idea / chunk). */
export function splitContentForSlides(items: string[], maxPerSlide = 4): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < items.length; i += maxPerSlide) {
    chunks.push(items.slice(i, i + maxPerSlide));
  }
  return chunks;
}

/** Split slide content when it exceeds thresholds (800 chars or 8 blocks). */
export function splitSlideContent(
  content: string | Record<string, unknown>,
  blockCount: number
): { shouldSplit: boolean; chunks?: string[][] } {
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  if (text.length <= CHAR_THRESHOLD && blockCount <= BLOCK_THRESHOLD) {
    return { shouldSplit: false };
  }
  const items = parseLines(content);
  const chunks = splitContentForSlides(items, 6);
  return { shouldSplit: true, chunks };
}

/** Expansion factor for height expansion strategy */
const HEIGHT_EXPANSION_FACTOR = 1.3;

/** Check if content height exceeds layout capacity (height expansion strategy). */
export function needsHeightExpansion(
  estimatedHeight: number,
  layoutEstimatedHeight: number
): boolean {
  return estimatedHeight > layoutEstimatedHeight * HEIGHT_EXPANSION_FACTOR;
}

/** Continuation indicator text for split slides */
export const CONTINUATION_INDICATOR = '— تتمة —';

/** Split content with continuation indicator for multi-slide overflow. */
export function splitWithContinuation(
  items: string[],
  maxPerSlide: number
): { chunks: string[][]; hasContinuation: boolean } {
  if (items.length <= maxPerSlide) {
    return { chunks: [items], hasContinuation: false };
  }
  const chunks: string[][] = [];
  for (let i = 0; i < items.length; i += maxPerSlide) {
    const chunk = items.slice(i, i + maxPerSlide);
    if (chunks.length > 0) {
      chunk.unshift(CONTINUATION_INDICATOR);
    }
    chunks.push(chunk);
  }
  return { chunks, hasContinuation: true };
}

/** Get layout selection for a content type. */
export function getLayoutForContent(contentType: string, content?: string, blockCount?: number) {
  return selectLayout(contentType, content, blockCount);
}
