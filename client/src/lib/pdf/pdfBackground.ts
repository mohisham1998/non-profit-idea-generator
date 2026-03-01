/**
 * PDF background renderer (solid, gradient, image)
 * @see specs/007-gamma-smart-layout-engine/contracts/export-mappers-schema.md
 */
import type { JsPDF } from 'jspdf';

export interface PdfBackgroundDef {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;
  };
  imageUrl?: string;
  opacity?: number;
}

function hex(color: string): string {
  const s = color.replace(/^#/, '');
  return s.length > 6 ? s.slice(0, 6) : s;
}

/** Render background onto jsPDF page (full page rect) */
export function renderPdfBackground(
  doc: JsPDF,
  bg: PdfBackgroundDef,
  pageW: number,
  pageH: number
): void {
  if (bg.type === 'solid' && bg.color) {
    doc.setFillColor(hex(bg.color));
    doc.rect(0, 0, pageW, pageH, 'F');
    return;
  }
  if (bg.type === 'gradient' && bg.gradient?.colors?.[0]) {
    doc.setFillColor(hex(bg.gradient.colors[0]));
    doc.rect(0, 0, pageW, pageH, 'F');
    return;
  }
  if (bg.type === 'image' && bg.imageUrl) {
    try {
      doc.addImage(bg.imageUrl, 'PNG', 0, 0, pageW, pageH);
    } catch {
      doc.setFillColor(hex('#ffffff'));
      doc.rect(0, 0, pageW, pageH, 'F');
    }
    return;
  }
  doc.setFillColor(hex('#ffffff'));
  doc.rect(0, 0, pageW, pageH, 'F');
}
