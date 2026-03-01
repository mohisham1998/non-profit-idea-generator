/**
 * Content analyzer for layout selection
 * @see specs/007-gamma-smart-layout-engine/contracts/content-analyzer-schema.md
 */
import type { ContentAnalysis, ContentBlock, ContentPattern, ContentStructure } from './types/layouts';

const SWOT_KEYWORDS = ['قوة', 'ضعف', 'فرصة', 'تهديد', 'strength', 'weakness', 'opportunity', 'threat'];
const BUDGET_KEYWORDS = ['ميزانية', 'تكلفة', 'مبلغ', 'ريال', 'سار', 'sar', 'budget', 'cost'];
const COMPARISON_KEYWORDS = ['مقارنة', 'أو', 'بديل', 'vs', 'comparison', 'or', 'versus'];
const STEPS_KEYWORDS = ['المرحلة', 'الخطوة', 'أولاً', 'ثانياً', 'phase', 'step', 'first', 'then'];
const QUOTE_CHARS = ['"', '"', '"', '«', '»', '"', '"', 'قال'];

/** Split inline numbered items (e.g. "1. a 2. b 3. c") into separate lines */
function splitInlineNumbered(line: string): string[] {
  const match = line.match(/\d+[.)]\s+/g);
  if (!match || match.length < 2) return [line];
  const parts = line.split(/(?=\d+[.)]\s+)/).map((p) => p.trim()).filter(Boolean);
  return parts;
}

function _parseContentBlocks(content: string): ContentBlock[] {
  if (!content || typeof content !== 'string') return [];
  const blocks: ContentBlock[] = [];
  const rawLines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const lines: string[] = [];
  for (const line of rawLines) {
    const split = splitInlineNumbered(line);
    lines.push(...split);
  }
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Stat pattern: number + label (e.g., "95% نسبة النجاح" or "500 ريال")
    const statMatch = trimmed.match(/^([\d.,]+)\s*([%\u0660-\u0669]*)\s+(.+)$/);
    if (statMatch) {
      const num = parseFloat(statMatch[1].replace(/,/g, '').replace(/\u0660/g, '0'));
      if (!isNaN(num)) {
        blocks.push({ type: 'stat', content: trimmed, value: num, unit: statMatch[2] || '', label: statMatch[3] });
        continue;
      }
    }

    // Numbered list
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (numberedMatch) {
      blocks.push({ type: 'number', content: numberedMatch[2], level: 0 });
      continue;
    }

    // Bullet list
    if (/^[-•*]\s+/.test(trimmed) || /^[\u2022\u2023]\s+/.test(trimmed)) {
      blocks.push({ type: 'bullet', content: trimmed.replace(/^[-•*\u2022\u2023]\s+/, ''), level: 0 });
      continue;
    }

    // Quote
    if (QUOTE_CHARS.some((c) => trimmed.startsWith(c)) || trimmed.includes('قال')) {
      blocks.push({ type: 'quote', content: trimmed });
      continue;
    }

    // Image ref
    if (trimmed.includes('[image]') || trimmed.includes('صورة')) {
      blocks.push({ type: 'image-ref', content: trimmed });
      continue;
    }

    // Heading (short line)
    if (trimmed.length < 60 && blocks.length === 0) {
      blocks.push({ type: 'heading', content: trimmed });
    } else {
      blocks.push({ type: 'paragraph', content: trimmed });
    }
  }
  return blocks;
}

function detectContentPatterns(blocks: ContentBlock[]): ContentPattern[] {
  const patterns: ContentPattern[] = [];
  const count = blocks.length;

  if (count >= 1) patterns.push(count === 1 ? '1-item' : count === 2 ? '2-items' : count === 3 ? '3-items' : count === 4 ? '4-items' : count === 5 ? '5-items' : count === 6 ? '6-items' : '7+-items');

  const hasStats = blocks.some((b) => b.type === 'stat');
  const hasList = blocks.some((b) => b.type === 'bullet' || b.type === 'number');
  const hasQuote = blocks.some((b) => b.type === 'quote');
  const hasImages = blocks.some((b) => b.type === 'image-ref');

  if (hasStats) patterns.push('stats', 'kpis', 'metrics');
  if (hasList) patterns.push(blocks.some((b) => b.type === 'number') ? 'numbered-list' : 'bullet-list');
  if (hasQuote) patterns.push('quote', 'testimonial');
  if (hasImages) patterns.push('image-heavy');

  return Array.from(new Set(patterns));
}

function detectStructureType(blocks: ContentBlock[], rawContent: string): ContentStructure {
  const statsCount = blocks.filter((b) => b.type === 'stat').length;
  const listCount = blocks.filter((b) => b.type === 'bullet' || b.type === 'number').length;
  const quoteCount = blocks.filter((b) => b.type === 'quote').length;
  const total = blocks.length;

  const lower = rawContent.toLowerCase();
  const hasSwot = SWOT_KEYWORDS.some((k) => lower.includes(k));
  const hasBudget = BUDGET_KEYWORDS.some((k) => lower.includes(k));
  const hasComparison = COMPARISON_KEYWORDS.some((k) => lower.includes(k));
  const hasSteps = STEPS_KEYWORDS.some((k) => lower.includes(k));

  if (hasSwot && total >= 4) return 'matrix';
  if (hasBudget && total >= 3) return 'stats';
  if (hasComparison) return 'list';
  if (hasSteps) return 'steps';
  if (statsCount / total >= 0.3) return 'stats';
  if (listCount / total >= 0.5) return 'list';
  if (quoteCount > 0 && total <= 2) return 'narrative';
  if (total === 1 && rawContent.length > 100) return 'narrative';
  if (statsCount > 0 || listCount > 0) return 'mixed';

  return 'list';
}

function calculateDensityScore(totalChars: number, blockCount: number): number {
  if (blockCount <= 0) return 0;
  const avgCharsPerBlock = totalChars / blockCount;
  return Math.min(100, Math.round(avgCharsPerBlock / 5));
}

function estimateHeight(blocks: ContentBlock[]): number {
  let height = 180; // header + footer
  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        height += 60;
        break;
      case 'subheading':
        height += 40;
        break;
      case 'paragraph':
        height += Math.ceil((block.content?.length || 0) / 80) * 24;
        break;
      case 'bullet':
      case 'number':
        height += 32;
        break;
      case 'stat':
        height += 80;
        break;
      case 'quote':
        height += 100;
        break;
      case 'image-ref':
        height += 200;
        break;
      case 'table-row':
        height += 40;
        break;
      default:
        height += 24;
    }
  }
  return height;
}

export function analyzeContent(
  content: string,
  slideType?: string
): ContentAnalysis {
  const blocks = _parseContentBlocks(content);
  const totalChars = content.length;
  const blockCount = blocks.length;
  const patterns = detectContentPatterns(blocks);
  const structureType = detectStructureType(blocks, content);

  const lower = content.toLowerCase();
  const hasTable = /\|.+\|/.test(content) || lower.includes('جدول');
  const hasMetrics = blocks.some((b) => b.type === 'stat') || /\d+%|\d+\s*ريال|\d+\s*sar/i.test(content);
  const hasImages = blocks.some((b) => b.type === 'image-ref') || content.includes('[image]');
  const hasList = blocks.some((b) => b.type === 'bullet' || b.type === 'number');
  const hasTimeline = STEPS_KEYWORDS.some((k) => lower.includes(k)) || /\d{4}|\d+\s*شهر/i.test(content);
  const hasComparison = COMPARISON_KEYWORDS.some((k) => lower.includes(k));
  const hasMatrix = SWOT_KEYWORDS.some((k) => lower.includes(k));
  const hasBudget = BUDGET_KEYWORDS.some((k) => lower.includes(k));
  const hasQuote = blocks.some((b) => b.type === 'quote');

  const avgWordsPerItem = blockCount > 0 ? content.split(/\s+/).length / blockCount : 0;

  return {
    itemCount: blockCount,
    densityScore: calculateDensityScore(totalChars, blockCount),
    structureType,
    secondaryStructures: [],
    hasTable,
    hasMetrics,
    hasImages,
    hasList,
    hasTimeline,
    hasComparison,
    hasMatrix,
    hasBudget,
    hasQuote,
    patterns,
    avgWordsPerItem,
    totalChars,
    estimatedHeight: estimateHeight(blocks),
  };
}

export function parseContentBlocks(content: string): ContentBlock[] {
  return _parseContentBlocks(content);
}
