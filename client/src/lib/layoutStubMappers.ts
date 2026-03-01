/**
 * Stub PDF/PPTX mappers - return minimal definitions
 * Real mappers will be implemented per layout in Phase 4/5
 */
import type {
  LayoutContent,
  LayoutConfig,
  PdfSlideDefinition,
  PptxSlideDefinition,
  PresentationTheme,
} from './types/layouts';

const PDF_STUB: PdfSlideDefinition = {
  width: 1920,
  height: 1080,
  background: { type: 'solid', color: '#ffffff' },
  elements: [],
};

const PPTX_STUB: PptxSlideDefinition = {
  background: { type: 'solid', color: 'FFFFFF' },
  elements: [],
};

export function stubPdfMapper(
  _content: LayoutContent,
  _theme: PresentationTheme,
  _config: LayoutConfig
): PdfSlideDefinition {
  return { ...PDF_STUB };
}

export function stubPptxMapper(
  _content: LayoutContent,
  _theme: PresentationTheme,
  _config: LayoutConfig
): PptxSlideDefinition {
  return { ...PPTX_STUB };
}
