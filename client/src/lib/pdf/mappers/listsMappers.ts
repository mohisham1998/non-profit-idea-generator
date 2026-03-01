/**
 * PDF mappers for Lists family layouts
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

function listMapper(content: LayoutContent, theme: PresentationTheme): PdfSlideDefinition {
  const elements: PdfElement[] = [];
  const primary = theme.primaryColor || '#0891b2';
  elements.push(textEl(content.title || '', M, 15, W - 2 * M, 18, primary));
  const blocks = (content.blocks || []).slice(0, 12);
  blocks.forEach((b, i) => {
    const y = 45 + i * 11;
    const prefix = b.type === 'quote' ? '"' : '• ';
    elements.push(textEl(prefix + b.content, M, y, W - 2 * M, 10, '#334155'));
  });
  return { width: W, height: H, background: bg(theme), elements };
}

export const listsPdfMappers: Record<string, (c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig) => PdfSlideDefinition> = {
  'bullet-hierarchy': listMapper,
  'numbered-badges': listMapper,
  'checklist-icons': listMapper,
  'quote-testimonial': listMapper,
  'call-to-action': listMapper,
};
