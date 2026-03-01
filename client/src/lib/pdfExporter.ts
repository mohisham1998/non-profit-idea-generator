/**
 * Native PDF exporter with Cairo font and RTL support
 * @see specs/007-gamma-smart-layout-engine/spec.md US4
 */
import jsPDF from 'jspdf';
import { registerCairoFonts } from './fontLoader';
import { renderPdfBackground } from './pdf/pdfBackground';
import { renderPdfElement } from './pdf/pdfElements';
import type { PdfSlideDefinition } from './types/layouts';
import { contentToBlocks } from './contentToBlocks';
import { getLayout } from './layoutRegistry';
import { coverPdfMappers } from './pdf/mappers/coverMappers';
import { textMediaPdfMappers } from './pdf/mappers/textMediaMappers';
import { cardsPdfMappers } from './pdf/mappers/cardsMappers';
import { kpisPdfMappers } from './pdf/mappers/kpisMappers';
import { comparisonPdfMappers } from './pdf/mappers/comparisonMappers';
import { processPdfMappers } from './pdf/mappers/processMappers';
import { frameworksPdfMappers } from './pdf/mappers/frameworksMappers';
import { budgetPdfMappers } from './pdf/mappers/budgetMappers';
import { listsPdfMappers } from './pdf/mappers/listsMappers';
import type { SlideCard } from '@/stores/slideStore';

const ALL_PDF_MAPPERS: Record<string, (c: any, t: any, cfg: any) => PdfSlideDefinition> = {
  ...coverPdfMappers,
  ...textMediaPdfMappers,
  ...cardsPdfMappers,
  ...kpisPdfMappers,
  ...comparisonPdfMappers,
  ...processPdfMappers,
  ...frameworksPdfMappers,
  ...budgetPdfMappers,
  ...listsPdfMappers,
};

function cardToLayoutContent(card: SlideCard, theme: any): { content: any; layoutId: string } {
  const layoutId = card.layoutId || 'bullet-hierarchy';
  const blocks = contentToBlocks(card.content, card.title);
  const images = (card.images || [])
    .filter((img) => img.url && img.status === 'ready')
    .map((img) => ({
      placement: img.position,
      url: img.url,
      width: 400,
      height: 300,
    }));
  const content = {
    title: card.title,
    blocks,
    images,
    slideType: card.type,
    config: card.layoutConfig || { imagePlacements: [] },
  };
  return { content, layoutId };
}

function getPdfMapper(layoutId: string): ((c: any, t: any, cfg: any) => PdfSlideDefinition) | undefined {
  return ALL_PDF_MAPPERS[layoutId];
}

export async function exportDeckToPdf(
  cards: SlideCard[],
  theme: { primaryColor: string; secondaryColor: string; accentColor: string; fontFamily: string },
  presentationName: string
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 167],
  });
  doc.setR2L(true);
  doc.setProperties({
    title: presentationName || 'عرض تقديمي',
    author: 'Nonprofit Ideas Generator',
  });

  await registerCairoFonts(doc);

  const layoutTheme = {
    id: 'export',
    name: theme?.name || 'Default',
    logoPosition: 'top-right',
    logoSize: 'medium',
    primaryColor: theme.primaryColor || '#0891b2',
    secondaryColor: theme.secondaryColor || '#06b6d4',
    accentColor: theme.accentColor || '#0d9488',
    fontFamily: theme.fontFamily || 'Cairo',
  };

  for (let i = 0; i < cards.length; i++) {
    if (i > 0) doc.addPage([297, 167], 'landscape');
    const card = cards[i];
    const { content, layoutId } = cardToLayoutContent(card, layoutTheme);
    const mapper = getPdfMapper(layoutId);
    const def: PdfSlideDefinition = mapper
      ? mapper(content, layoutTheme, content.config)
      : {
          width: 297,
          height: 167,
          background: { type: 'solid', color: '#ffffff' },
          elements: [],
        };

    const bg = def.background as { type: string; color?: string };
    renderPdfBackground(doc, bg, 297, 167);

    const elements = (def.elements || []) as Array<{
      type: string;
      x: number;
      y: number;
      width: number;
      height: number;
      text?: { content: string; fontFamily: string; fontSize: number; color: string; alignment: string; direction: string };
      shape?: { type: string; fillColor?: string; cornerRadius?: number };
      image?: { url: string };
    }>;
    for (const el of elements) {
      renderPdfElement(doc, el as any, 297, 167);
    }
  }

  return doc.output('blob');
}
