/**
 * PDF mappers for Text+Media family layouts
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

function genericMapper(content: LayoutContent, theme: PresentationTheme): PdfSlideDefinition {
  const elements: PdfElement[] = [];
  const primary = theme.primaryColor || '#0891b2';
  elements.push(textEl(content.title || '', M, 20, W - 2 * M, 18, primary));
  (content.blocks || []).slice(0, 12).forEach((b, i) => {
    elements.push(textEl(b.content, M, 45 + i * 9, W - 2 * M - 80, 11, '#334155'));
  });
  if (content.images?.length && content.images[0]?.url) {
    elements.push({
      type: 'image',
      x: W - M - 80,
      y: 45,
      width: 75,
      height: 60,
      image: { url: content.images[0].url, fit: 'contain' },
    });
  }
  return { width: W, height: H, background: bg(theme), elements };
}

export function split5050Pdf(c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig): PdfSlideDefinition {
  return genericMapper(c, t);
}
export function split3070Pdf(c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig): PdfSlideDefinition {
  return genericMapper(c, t);
}
export function textOverlayPdf(c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig): PdfSlideDefinition {
  return genericMapper(c, t);
}
export function galleryCaptionsPdf(c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig): PdfSlideDefinition {
  return genericMapper(c, t);
}
export function visualCalloutPdf(c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig): PdfSlideDefinition {
  return genericMapper(c, t);
}

export const textMediaPdfMappers: Record<string, (c: LayoutContent, t: PresentationTheme, cfg: LayoutConfig) => PdfSlideDefinition> = {
  'split-50-50': split5050Pdf,
  'split-30-70': split3070Pdf,
  'text-overlay': textOverlayPdf,
  'gallery-captions': galleryCaptionsPdf,
  'visual-callout': visualCalloutPdf,
};
