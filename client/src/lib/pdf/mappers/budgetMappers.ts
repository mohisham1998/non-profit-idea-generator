/**
 * PDF mappers for Budget family layouts
 */
import type { LayoutContent, LayoutConfig, PdfSlideDefinition, PresentationTheme } from '../../types/layouts';
import type { PdfElement } from '../pdfElements';

const W = 297;
const H = 167;
const M = 15;

function bg(theme: PresentationTheme): unknown {
  return { type: 'solid' as const, color: (theme.primaryColor || '#0891b2') + '08' };
}

function textEl(content: string, x: number, y: number, w: number, fs: number, color: string): PdfElement {
  return {
    type: 'text',
    x, y, width: w, height: fs * 1.5,
    text: { content, fontFamily: 'Cairo', fontSize: fs, color, alignment: 'right', direction: 'rtl' },
  };
}

function budgetMapper(content: LayoutContent, theme: PresentationTheme): PdfSlideDefinition {
  const elements: PdfElement[] = [];
  const primary = theme.primaryColor || '#0891b2';
  elements.push(textEl(content.title || '', M, 15, W - 2 * M, 18, primary));
  const blocks = (content.blocks || []).slice(0, 8).filter((b) => b.type === 'stat' || b.value != null);
  blocks.forEach((b, i) => {
    const y = 45 + i * 14;
    const label = b.type === 'stat' ? b.label ?? b.content : b.content;
    const val = b.type === 'stat' && b.value != null ? `${b.value}${b.unit || ''}` : b.content;
    elements.push(textEl(label, M, y, W - 2 * M - 60, 10, '#334155'));
    elements.push(textEl(val, W - M - 55, y, 55, 10, primary));
  });
  return { width: W, height: H, background: bg(theme), elements };
}

export const budgetPdfMappers: Record<string, (c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig) => PdfSlideDefinition> = {
  'budget-category-bars': budgetMapper,
  'budget-table': budgetMapper,
  'allocation-visual': budgetMapper,
  'cost-breakdown-cards': budgetMapper,
};
