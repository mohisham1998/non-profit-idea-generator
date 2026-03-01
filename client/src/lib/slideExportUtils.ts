/**
 * Utilities for exporting SlideCard data to PDF and PPTX.
 * Supports html-to-image capture for pixel-perfect visual export.
 */
import type { SlideCard } from '@/stores/slideStore';
import { parseLines } from './slideLayoutEngine';
import html2canvas from 'html2canvas';

export interface ExportSlideData {
  title: string;
  bodyLines: string[];
  type: string;
  primaryColor?: string;
}

/** Visual export data (from html2canvas) */
export interface ExportVisualData {
  slideId: string;
  imageDataUrl: string;
  width: number;
  height: number;
  format: 'png' | 'jpeg';
  quality: number;
}

/** Export manifest for visual export pipeline */
export interface ExportManifest {
  slides: ExportVisualData[];
  metadata: { title: string; author: string; createdAt: Date; slideCount: number };
  theme: { primaryColor: string; fontFamily: string };
}

/**
 * Captures a slide DOM element as PNG using html2canvas.
 * Uses 1920×1080 viewport, scale 2 for high-DPI export. CORS must be supported for external images.
 */
export async function captureSlideAsImage(
  element: HTMLElement,
  options?: { scale?: number; quality?: number }
): Promise<ExportVisualData> {
  const scale = options?.scale ?? 2;
  const quality = options?.quality ?? 0.95;

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    width: 1920,
    height: 1080,
    windowWidth: 1920,
    windowHeight: 1080,
    imageTimeout: 15000,
  });

  const dataUrl = canvas.toDataURL('image/png', quality);
  const slideId = element.id?.replace('slide-', '') ?? '';

  return {
    slideId,
    imageDataUrl: dataUrl,
    width: canvas.width,
    height: canvas.height,
    format: 'png',
    quality,
  };
}

function safeStr(val: unknown): string {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) return val.map(safeStr).join('\n');
  if (typeof val === 'object') {
    const o = val as Record<string, unknown>;
    return (
      (o.text as string) ||
      (o.description as string) ||
      (o.title as string) ||
      (o.name as string) ||
      (o.value as string) ||
      JSON.stringify(val)
    );
  }
  return String(val);
}

/**
 * Extract exportable title + body lines from a SlideCard.
 */
export function cardToExportData(card: SlideCard, primaryColor?: string): ExportSlideData {
  const { type, title, content } = card;
  const bodyLines: string[] = [];

  switch (type) {
    case 'cover': {
      const c = content as Record<string, unknown>;
      if (c.title) bodyLines.push(safeStr(c.title));
      if (c.subtitle) bodyLines.push(safeStr(c.subtitle));
      if (c.targetAudience) bodyLines.push(`الجمهور المستهدف: ${safeStr(c.targetAudience)}`);
      if (c.duration) bodyLines.push(`المدة: ${safeStr(c.duration)}`);
      break;
    }
    case 'kpis': {
      const kpis = (content?.kpis ?? content?.indicators ?? content?.metrics ?? []) as unknown[];
      for (const kpi of Array.isArray(kpis) ? kpis : []) {
        const name = safeStr((kpi as any).name ?? (kpi as any).indicator ?? (kpi as any).title);
        const desc = safeStr((kpi as any).description);
        const target = safeStr((kpi as any).target);
        if (name) bodyLines.push(`• ${name}`);
        if (desc) bodyLines.push(`  ${desc}`);
        if (target) bodyLines.push(`  الهدف: ${target}`);
      }
      if (content?.summary) bodyLines.push(safeStr(content.summary));
      break;
    }
    case 'budget': {
      const c = content as Record<string, unknown>;
      if (c.totalBudget != null) bodyLines.push(`الميزانية الإجمالية: ${safeStr(c.totalBudget)} ${safeStr(c.currency ?? 'ريال')}`);
      const cats = (c.categories ?? []) as Array<{ name?: string; amount?: number }>;
      for (const cat of cats) {
        bodyLines.push(`• ${safeStr(cat.name)}: ${cat.amount != null ? cat.amount.toLocaleString('ar-SA') : ''}`);
      }
      break;
    }
    case 'swot': {
      const keys = ['strengths', 'weaknesses', 'opportunities', 'threats'] as const;
      const labels: Record<string, string> = { strengths: 'نقاط القوة', weaknesses: 'نقاط الضعف', opportunities: 'الفرص', threats: 'التهديدات' };
      for (const k of keys) {
        const arr = (content as any)?.[k];
        if (Array.isArray(arr) && arr.length) {
          bodyLines.push(labels[k] + ':');
          for (const item of arr) bodyLines.push(`  • ${safeStr(item)}`);
        }
      }
      break;
    }
    case 'logframe': {
      const c = content as Record<string, unknown>;
      if (c.goal ?? c.impact) bodyLines.push(`الهدف: ${safeStr(c.goal ?? c.impact)}`);
      const outcomes = (c.outcomes ?? []) as unknown[];
      if (outcomes.length) {
        bodyLines.push('النتائج:');
        for (const o of outcomes) bodyLines.push(`  • ${safeStr(o)}`);
      }
      const outputs = (c.outputs ?? []) as unknown[];
      if (outputs.length) {
        bodyLines.push('المخرجات:');
        for (const o of outputs) bodyLines.push(`  • ${safeStr(o)}`);
      }
      break;
    }
    case 'custom':
    default: {
      const keys = Object.keys(content || {});
      for (const key of keys) {
        const val = (content as any)[key];
        if (Array.isArray(val)) {
          for (const v of val) bodyLines.push(`• ${safeStr(v)}`);
        } else {
          const lines = parseLines(val);
          if (lines.length > 0) {
            for (const ln of lines) bodyLines.push(ln);
          } else if (val != null && val !== '') {
            bodyLines.push(safeStr(val));
          }
        }
      }
      break;
    }
  }

  return { title, bodyLines, type, primaryColor };
}

/** 16:9 slide dimensions (inches for PPTX). */
export const SLIDE_16x9 = { w: 10, h: 5.625 };
