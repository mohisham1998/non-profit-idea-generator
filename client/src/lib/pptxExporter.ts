/**
 * Native PPTX exporter with layout mappers and RTL support
 * @see specs/007-gamma-smart-layout-engine/spec.md US5
 */
import pptxgen from 'pptxgenjs';
import { contentToBlocks } from './contentToBlocks';
import { addPptxText, addPptxShape, hex } from './pptx/pptxElements';
import { applyPptxBackground } from './pptx/pptxBackground';
import type { SlideCard } from '@/stores/slideStore';

const W_IN = 13.33;
const H_IN = 7.5;
const M_IN = 0.5;

function cardToContent(card: SlideCard) {
  const blocks = contentToBlocks(card.content, card.title);
  return { title: card.title, blocks };
}

export async function exportDeckToPptx(
  cards: SlideCard[],
  theme: { primaryColor: string; secondaryColor: string; accentColor: string },
  presentationName: string
): Promise<Blob> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = presentationName || 'عرض تقديمي';
  pptx.author = 'Nonprofit Ideas Generator';
  pptx.rtlMode = true;

  const primary = hex(theme.primaryColor || '#0891b2');

  for (const card of cards) {
    const slide = pptx.addSlide();
    applyPptxBackground(slide, { type: 'solid', color: primary + '08' });
    const { title, blocks } = cardToContent(card);

    addPptxText(slide, {
      text: title || '',
      x: M_IN,
      y: 0.3,
      w: W_IN - 2 * M_IN,
      h: 0.5,
      fontSize: 18,
      color: theme.primaryColor,
      bold: true,
      align: 'right',
    });

    for (let i = 0; i < Math.min(blocks.length, 12); i++) {
      const b = blocks[i];
      addPptxText(slide, {
        text: b.content,
        x: M_IN,
        y: 1 + i * 0.5,
        w: W_IN - 2 * M_IN,
        h: 0.45,
        fontSize: 11,
        color: '#334155',
        align: 'right',
      });
    }
  }

  const blob = await pptx.write({ outputType: 'blob' });
  return blob instanceof Blob ? blob : new Blob([blob as BlobPart]);
}
