/**
 * PDF mappers for KPIs family layouts
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

function statBlocksMapper(content: LayoutContent, theme: PresentationTheme, count: number): PdfSlideDefinition {
  const elements: PdfElement[] = [];
  const primary = theme.primaryColor || '#0891b2';
  elements.push(textEl(content.title || '', M, 15, W - 2 * M, 18, primary));
  const blocks = (content.blocks || []).slice(0, count).filter((b) => b.type === 'stat' || b.value != null);
  const cw = (W - 2 * M - (count - 1) * 10) / count;
  blocks.forEach((b, i) => {
    const x = W - M - (i + 1) * cw - i * 10;
    const y = 50;
    const val = b.type === 'stat' && b.value != null ? `${b.value}${b.unit || ''}` : b.content;
    const label = b.type === 'stat' ? b.label ?? b.content : '';
    elements.push({
      type: 'shape',
      x, y, width: cw, height: 60,
      shape: { type: 'rounded-rect', fillColor: primary + '12', cornerRadius: 6 },
    });
    elements.push(textEl(val, x, y + 15, cw - 6, 18, primary));
    if (label) elements.push(textEl(label, x, y + 38, cw - 6, 9, '#64748b'));
  });
  return { width: W, height: H, background: bg(theme), elements };
}

function kpiTableMapper(content: LayoutContent, theme: PresentationTheme): PdfSlideDefinition {
  const elements: PdfElement[] = [];
  const primary = theme.primaryColor || '#0891b2';
  elements.push(textEl(content.title || '', M, 15, W - 2 * M, 18, primary));
  const blocks = (content.blocks || []).slice(0, 10);
  const rowH = 12;
  blocks.forEach((b, i) => {
    const y = 42 + i * rowH;
    elements.push(textEl(b.type === 'stat' ? b.label ?? b.content : b.content, M, y, W - 2 * M - 60, 10, '#334155'));
    const val = b.type === 'stat' && b.value != null ? `${b.value}${b.unit || ''}` : b.content;
    elements.push(textEl(val, W - M - 55, y, 55, 10, primary));
  });
  return { width: W, height: H, background: bg(theme), elements };
}

export const kpisPdfMappers: Record<string, (c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig) => PdfSlideDefinition> = {
  'stat-blocks-3': (c, t) => statBlocksMapper(c, t, 3),
  'stat-blocks-4': (c, t) => statBlocksMapper(c, t, 4),
  'kpi-table': kpiTableMapper,
  'kpi-list-icons': (c, t) => statBlocksMapper(c, t, 6),
  'progress-bars': (c, t) => statBlocksMapper(c, t, 6),
  'big-number-breakdown': (c, t) => statBlocksMapper(c, t, 4),
};
