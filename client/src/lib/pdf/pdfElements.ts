/**
 * PDF element rendering utilities for jsPDF
 * @see specs/007-gamma-smart-layout-engine/contracts/export-mappers-schema.md
 */
import type { JsPDF } from 'jspdf';

export interface PdfTextProps {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight?: 'normal' | 'bold' | 'semibold';
  color: string;
  alignment: 'right' | 'center' | 'left';
  direction: 'rtl' | 'ltr';
  lineHeight?: number;
}

export interface PdfShapeProps {
  type: 'rectangle' | 'circle' | 'rounded-rect';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  cornerRadius?: number;
}

export interface PdfImageProps {
  url: string;
  fit: 'contain' | 'cover' | 'fill';
  opacity?: number;
}

export interface PdfElement {
  type: 'text' | 'shape' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  text?: PdfTextProps;
  shape?: PdfShapeProps;
  image?: PdfImageProps;
}

/** Strip # from hex for jsPDF */
function hex(color: string): string {
  return color.replace(/^#/, '');
}

/** Render a single PDF element onto jsPDF doc (coordinates in mm) */
export function renderPdfElement(
  doc: JsPDF,
  el: PdfElement,
  _pageW: number,
  _pageH: number
): void {
  const { x, y, width, height, type } = el;
  if (type === 'text' && el.text) {
    const t = el.text;
    const style = (t.fontWeight === 'bold' ? 'bold' : t.fontWeight === 'semibold' ? 'semibold' : 'normal') as 'normal' | 'bold' | 'semibold';
    doc.setFont('Cairo', style);
    doc.setFontSize(t.fontSize);
    doc.setTextColor(hex(t.color));
    doc.setR2L(true);
    const tx = t.alignment === 'right' ? x + width : t.alignment === 'center' ? x + width / 2 : x;
    doc.text(t.content, tx, y + t.fontSize * 0.35, { align: t.alignment, maxWidth: width });
    return;
  }
  if (type === 'shape' && el.shape) {
    const s = el.shape;
    if (s.fillColor) doc.setFillColor(hex(s.fillColor));
    if (s.strokeColor) doc.setDrawColor(hex(s.strokeColor));
    doc.setLineWidth(s.strokeWidth ?? 0);
    if (s.type === 'rectangle' || s.type === 'rounded-rect') {
      const r = s.cornerRadius ?? 0;
      doc.roundedRect(x, y, width, height, r, r, 'FD');
    } else if (s.type === 'circle') {
      const r = Math.min(width, height) / 2;
      doc.circle(x + r, y + r, r, 'FD');
    }
    return;
  }
  if (type === 'image' && el.image) {
    try {
      doc.addImage(el.image.url, 'PNG', x, y, width, height);
    } catch {
      // Skip invalid images
    }
  }
}
