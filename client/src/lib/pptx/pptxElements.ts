/**
 * PPTX element rendering utilities for pptxgenjs
 * @see specs/007-gamma-smart-layout-engine/contracts/export-mappers-schema.md
 */
import type pptxgen from 'pptxgenjs';

/** Strip # from hex for PPTX */
export function hex(color: string): string {
  return color.replace(/^#/, '');
}

export interface PptxTextOpts {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  align?: 'right' | 'center' | 'left';
}

export interface PptxShapeOpts {
  x: number;
  y: number;
  w: number;
  h: number;
  fillColor?: string;
  shape?: 'rect' | 'roundRect' | 'ellipse';
  rectRadius?: number;
}

export interface PptxImageOpts {
  x: number;
  y: number;
  w: number;
  h: number;
  data: string;
}

/** Add text to slide */
export function addPptxText(slide: pptxgen.Slide, opts: PptxTextOpts): void {
  slide.addText(opts.text, {
    x: opts.x,
    y: opts.y,
    w: opts.w,
    h: opts.h,
    fontSize: opts.fontSize ?? 12,
    color: hex(opts.color ?? '333333'),
    bold: opts.bold,
    align: opts.align ?? 'right',
    valign: 'top',
    rtlMode: true,
    fontFace: 'Cairo',
  });
}

/** Add shape to slide */
export function addPptxShape(slide: pptxgen.Slide, opts: PptxShapeOpts): void {
  slide.addShape(opts.shape ?? 'rect', {
    x: opts.x,
    y: opts.y,
    w: opts.w,
    h: opts.h,
    fill: { color: hex(opts.fillColor ?? 'ffffff') },
    rectRadius: opts.rectRadius ?? 0,
  });
}

/** Add image to slide */
export function addPptxImage(slide: pptxgen.Slide, opts: PptxImageOpts): void {
  try {
    slide.addImage({
      data: opts.data,
      x: opts.x,
      y: opts.y,
      w: opts.w,
      h: opts.h,
      sizing: { type: 'contain', w: opts.w, h: opts.h },
    });
  } catch {
    // Skip invalid images
  }
}
