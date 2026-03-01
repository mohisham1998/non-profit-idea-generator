/**
 * PDF mappers for Comparison family layouts
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

function compareMapper(content: LayoutContent, theme: PresentationTheme, cols: number): PdfSlideDefinition {
  const elements: PdfElement[] = [];
  const primary = theme.primaryColor || '#0891b2';
  elements.push(textEl(content.title || '', M, 15, W - 2 * M, 18, primary));
  const blocks = content.blocks || [];
  const cw = (W - 2 * M - (cols - 1) * 10) / cols;
  const n = Math.ceil(blocks.length / cols);
  for (let col = 0; col < cols; col++) {
    const x = W - M - (col + 1) * cw - col * 10;
    const colBlocks: string[] = [];
    for (let row = 0; row < n; row++) {
      const idx = row * cols + col;
      if (blocks[idx]) colBlocks.push(blocks[idx].content);
    }
    colBlocks.slice(0, 6).forEach((txt, row) => {
      elements.push(textEl(txt, x + 6, 45 + row * 18, cw - 12, 10, '#334155'));
    });
  }
  return { width: W, height: H, background: bg(theme), elements };
}

export const comparisonPdfMappers: Record<string, (c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig) => PdfSlideDefinition> = {
  'compare-2col': (c, t) => compareMapper(c, t, 2),
  'compare-3col': (c, t) => compareMapper(c, t, 3),
  'pros-cons': (c, t) => compareMapper(c, t, 2),
  'before-after': (c, t) => compareMapper(c, t, 2),
  'options-table': (c, t) => compareMapper(c, t, 4),
};
