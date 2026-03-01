/**
 * Hook for exporting SlideBuilder cards to PDF and PPTX.
 * Uses html-to-image for pixel-perfect visual export (layout, images, icons, colors).
 */
import { useCallback } from 'react';
import { useSlideStore } from '@/stores/slideStore';
import { captureSlideAsImage } from '@/lib/slideExportUtils';
import pptxgen from 'pptxgenjs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-rtl-support';
import { toast } from 'sonner';

const IMAGE_LOAD_WAIT_MS = 500;
const CAPTURE_TIMEOUT_MS = 20000;
const BATCH_SIZE = 10;

export function useSlideExport() {
  const { cards, presentationName } = useSlideStore();

  const waitForImages = useCallback(async () => {
    const withImages = cards.filter((c) => c.images?.some((i) => i.status === 'loading'));
    if (withImages.length === 0) return;
    await new Promise((r) => setTimeout(r, IMAGE_LOAD_WAIT_MS));
  }, [cards]);

  const captureWithTimeout = useCallback(
    (el: HTMLElement) =>
      Promise.race([
        captureSlideAsImage(el, { scale: 2, quality: 0.95 }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('IMAGE_LOAD_TIMEOUT')), CAPTURE_TIMEOUT_MS)
        ),
      ]),
    []
  );

  const captureAllSlides = useCallback(
    async (): Promise<Array<{ imageDataUrl: string; slideId: string; width: number; height: number } | null>> => {
      const result: Array<{ imageDataUrl: string; slideId: string; width: number; height: number } | null> = [];
      const batches =
        cards.length > BATCH_SIZE
          ? Array.from({ length: Math.ceil(cards.length / BATCH_SIZE) }, (_, i) =>
              cards.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
            )
          : [cards];
      for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        const batchResults = await Promise.all(
          batch.map(async (card, j) => {
            const i = b * BATCH_SIZE + j;
            toast.info(`جاري تحويل الشريحة ${i + 1} من ${cards.length}...`);
            const el = document.getElementById(`slide-${card.id}`);
            if (el) {
              try {
                return await captureWithTimeout(el);
              } catch (e) {
                const msg = e instanceof Error ? e.message : 'RENDER_FAILED';
                toast.error(`فشل تحويل الشريحة ${i + 1}: ${msg === 'IMAGE_LOAD_TIMEOUT' ? 'انتهت مهلة التحميل' : 'خطأ في العرض'}`);
                return null;
              }
            }
            return null;
          })
        );
        result.push(...batchResults);
      }
      return result;
    },
    [cards, captureWithTimeout]
  );

  const exportToPPTX = useCallback(async () => {
    if (!cards.length) return;
    toast.info('جاري تصدير PowerPoint...');
    await waitForImages();

    try {
      const captured = await captureAllSlides();
      const valid = captured.filter((c): c is NonNullable<typeof c> => c !== null);
      if (valid.length === 0) {
        toast.error('لم يتم العثور على شرائح للتصدير');
        return;
      }

      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';
      pptx.title = presentationName || 'عرض تقديمي';
      pptx.author = 'Nonprofit Ideas Generator';
      pptx.rtlMode = true;

      for (const slide of valid) {
        const s = pptx.addSlide();
        s.addImage({
          data: slide.imageDataUrl,
          x: 0,
          y: 0,
          w: '100%',
          h: '100%',
          sizing: { type: 'contain', w: '100%', h: '100%' },
        });
      }

      const result = await pptx.write({ outputType: 'blob' });
      const blob = result instanceof Blob ? result : new Blob([result as BlobPart]);
      saveAs(blob, `${presentationName || 'عرض-تقديمي'}.pptx`);
      toast.success('تم تصدير PowerPoint بنجاح');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ASSEMBLY_FAILED';
      if (msg.includes('memory') || msg.includes('Memory')) {
        toast.error('فشل التصدير: استهلاك ذاكرة كبير');
      } else {
        toast.error('فشل تصدير PowerPoint');
      }
      throw err;
    }
  }, [cards, presentationName, waitForImages, captureAllSlides]);

  const exportToPDF = useCallback(async () => {
    if (!cards.length) return;
    toast.info('جاري تصدير PDF...');
    await waitForImages();

    try {
      const captured = await captureAllSlides();
      const valid = captured.filter((c): c is NonNullable<typeof c> => c !== null);
      if (valid.length === 0) {
        toast.error('لم يتم العثور على شرائح للتصدير');
        return;
      }

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      pdf.setR2L(true);
      pdf.setProperties({
        title: presentationName || 'عرض تقديمي',
        author: 'Nonprofit Ideas Generator',
        subject: 'Nonprofit Presentation',
        creator: 'Nonprofit Ideas Generator',
      });

      for (let i = 0; i < valid.length; i++) {
        if (i > 0) pdf.addPage('a4', 'landscape');
        pdf.addImage(valid[i].imageDataUrl, 'PNG', 0, 0, 297, 167);
      }

      pdf.save(`${presentationName || 'عرض-تقديمي'}.pdf`);
      toast.success('تم تصدير PDF بنجاح');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ASSEMBLY_FAILED';
      if (msg.includes('memory') || msg.includes('Memory')) {
        toast.error('فشل التصدير: استهلاك ذاكرة كبير');
      } else {
        toast.error('فشل تصدير PDF');
      }
      throw err;
    }
  }, [cards, presentationName, waitForImages, captureAllSlides]);

  return { exportToPDF, exportToPPTX };
}
