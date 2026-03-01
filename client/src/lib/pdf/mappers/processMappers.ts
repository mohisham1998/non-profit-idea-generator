/**
 * PDF mappers for Process family layouts
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

function stepsMapper(content: LayoutContent, theme: PresentationTheme): PdfSlideDefinition {
  const elements: PdfElement[] = [];
  const primary = theme.primaryColor || '#0891b2';
  elements.push(textEl(content.title || '', M, 15, W - 2 * M, 18, primary));
  const blocks = (content.blocks || []).slice(0, 6);
  blocks.forEach((b, i) => {
    const y = 45 + i * 18;
    elements.push({
      type: 'shape',
      x: W - M - 25,
      y: y - 2,
      width: 18,
      height: 18,
      shape: { type: 'circle', fillColor: primary },
    });
    elements.push(textEl(`${i + 1}`, W - M - 25, y + 2, 18, 10, '#ffffff'));
    elements.push(textEl(b.content, M, y, W - 2 * M - 35, 10, '#334155'));
  });
  return { width: W, height: H, background: bg(theme), elements };
}

export const processPdfMappers: Record<string, (c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig) => PdfSlideDefinition> = {
  'steps-horizontal': stepsMapper,
  'steps-vertical': stepsMapper,
  'timeline-horizontal': stepsMapper,
  'timeline-vertical': stepsMapper,
  'phases-deliverables': stepsMapper,
  'funnel-journey': stepsMapper,
};
