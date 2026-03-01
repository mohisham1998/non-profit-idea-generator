/**
 * PDF mappers for Frameworks family layouts
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

function gridMapper(content: LayoutContent, theme: PresentationTheme, cols: number): PdfSlideDefinition {
  const elements: PdfElement[] = [];
  const primary = theme.primaryColor || '#0891b2';
  elements.push(textEl(content.title || '', M, 15, W - 2 * M, 18, primary));
  const blocks = (content.blocks || []).slice(0, cols * cols);
  const cw = (W - 2 * M - (cols - 1) * 6) / cols;
  const ch = (H - 55 - (cols - 1) * 6) / cols;
  blocks.forEach((b, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = W - M - (col + 1) * cw - col * 6;
    const y = 45 + row * (ch + 6);
    elements.push({
      type: 'shape',
      x, y, width: cw, height: ch,
      shape: { type: 'rounded-rect', fillColor: primary + '12', cornerRadius: 4 },
    });
    elements.push(textEl(b.content, x + 4, y + 6, cw - 8, 9, '#334155'));
  });
  return { width: W, height: H, background: bg(theme), elements };
}

export const frameworksPdfMappers: Record<string, (c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig) => PdfSlideDefinition> = {
  'swot-grid': (c, t) => gridMapper(c, t, 2),
  'matrix-2x2': (c, t) => gridMapper(c, t, 2),
  'pillars-3': (c, t) => gridMapper(c, t, 3),
  'pillars-4': (c, t) => gridMapper(c, t, 2),
};
