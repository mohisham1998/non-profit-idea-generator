/**
 * PDF mappers for Cards family layouts
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

function cardsMapper(content: LayoutContent, theme: PresentationTheme, cols: number): PdfSlideDefinition {
  const elements: PdfElement[] = [];
  const primary = theme.primaryColor || '#0891b2';
  elements.push(textEl(content.title || '', M, 15, W - 2 * M, 18, primary));
  const blocks = (content.blocks || []).slice(0, cols * 2);
  const cw = (W - 2 * M - (cols - 1) * 8) / cols;
  const ch = 35;
  blocks.forEach((b, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = W - M - (col + 1) * cw - col * 8;
    const y = 45 + row * (ch + 8);
    elements.push({
      type: 'shape',
      x, y, width: cw, height: ch,
      shape: { type: 'rounded-rect', fillColor: primary + '15', cornerRadius: 4 },
    });
    elements.push(textEl(b.content, x + 6, y + 8, cw - 12, 10, '#334155'));
  });
  return { width: W, height: H, background: bg(theme), elements };
}

export const cardsPdfMappers: Record<string, (c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig) => PdfSlideDefinition> = {
  'feature-cards-3': (c, t) => cardsMapper(c, t, 3),
  'feature-cards-4': (c, t) => cardsMapper(c, t, 4),
  'icon-cards-3': (c, t) => cardsMapper(c, t, 3),
  'icon-cards-6': (c, t) => cardsMapper(c, t, 6),
  'problem-solution': (c, t) => cardsMapper(c, t, 2),
  'benefits-grid': (c, t) => cardsMapper(c, t, 4),
};
