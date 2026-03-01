/**
 * PPTX background renderer
 * @see specs/007-gamma-smart-layout-engine/contracts/export-mappers-schema.md
 */
import type pptxgen from 'pptxgenjs';
import { hex } from './pptxElements';

export interface PptxBackgroundDef {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
}

/** Apply background to slide */
export function applyPptxBackground(
  slide: pptxgen.Slide,
  bg: PptxBackgroundDef
): void {
  if (bg.type === 'solid' && bg.color) {
    slide.background = { color: hex(bg.color) };
  } else {
    slide.background = { color: 'F8FAFC' };
  }
}
