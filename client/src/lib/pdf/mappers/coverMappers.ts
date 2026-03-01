/**
 * PDF mappers for Cover family layouts
 * @see specs/007-gamma-smart-layout-engine/spec.md
 */
import type {
  LayoutContent,
  LayoutConfig,
  PdfSlideDefinition,
  PresentationTheme,
} from '../../types/layouts';
import type { PdfElement } from '../pdfElements';

const W = 297;
const H = 167;
const M = 20;

function toPdfBg(theme: PresentationTheme): PdfSlideDefinition['background'] {
  return { type: 'solid', color: theme.primaryColor ? theme.primaryColor + '15' : '#f8fafc' };
}

function textEl(
  content: string,
  x: number,
  y: number,
  w: number,
  fontSize: number,
  color: string,
  fontFamily = 'Cairo'
): PdfElement {
  return {
    type: 'text',
    x,
    y,
    width: w,
    height: fontSize * 1.5,
    text: {
      content,
      fontFamily,
      fontSize,
      color,
      alignment: 'right',
      direction: 'rtl',
    },
  };
}

function coverHeroPdf(
  content: LayoutContent,
  theme: PresentationTheme,
  _config: LayoutConfig
): PdfSlideDefinition {
  const elements: PdfElement[] = [];
  const title = content.title || '';
  const blocks = content.blocks || [];
  const subtitle = blocks[0]?.content || '';
  elements.push(textEl(title, M, 50, W - 2 * M, 28, theme.primaryColor || '#0891b2'));
  if (subtitle) elements.push(textEl(subtitle, M, 90, W - 2 * M, 14, '#475569'));
  return {
    width: W,
    height: H,
    background: toPdfBg(theme),
    elements,
  };
}

function coverSplitPdf(
  content: LayoutContent,
  theme: PresentationTheme,
  _config: LayoutConfig
): PdfSlideDefinition {
  return coverHeroPdf(content, theme, _config);
}

function sectionDividerPdf(
  content: LayoutContent,
  theme: PresentationTheme,
  _config: LayoutConfig
): PdfSlideDefinition {
  const elements: PdfElement[] = [];
  const title = content.title || '';
  elements.push(textEl(title, M, H / 2 - 20, W - 2 * M, 32, theme.primaryColor || '#0891b2'));
  return { width: W, height: H, background: toPdfBg(theme), elements };
}

function agendaOutlinePdf(
  content: LayoutContent,
  theme: PresentationTheme,
  _config: LayoutConfig
): PdfSlideDefinition {
  const elements: PdfElement[] = [];
  elements.push(textEl(content.title || '', M, 25, W - 2 * M, 20, theme.primaryColor || '#0891b2'));
  const blocks = content.blocks || [];
  blocks.slice(0, 10).forEach((b, i) => {
    elements.push(textEl(`• ${b.content}`, M, 55 + i * 10, W - 2 * M, 12, '#334155'));
  });
  return { width: W, height: H, background: toPdfBg(theme), elements };
}

export const coverPdfMappers: Record<string, (c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig) => PdfSlideDefinition> = {
  'cover-hero': coverHeroPdf,
  'cover-split': coverSplitPdf,
  'section-divider': sectionDividerPdf,
  'agenda-outline': agendaOutlinePdf,
};
