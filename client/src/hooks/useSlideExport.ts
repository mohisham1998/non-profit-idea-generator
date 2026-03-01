/**
 * Hook for exporting SlideBuilder cards to PDF and PPTX.
 * Uses native pdfExporter and pptxExporter (layout mappers, Cairo font, RTL).
 * T109/T110: Export progress UI + error handling with retry.
 */
import { useCallback, useState } from 'react';
import { useSlideStore } from '@/stores/slideStore';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { exportDeckToPdf } from '@/lib/pdfExporter';
import { exportDeckToPptx } from '@/lib/pptxExporter';

const IMAGE_LOAD_WAIT_MS = 500;

export type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';
export type ExportFormat = 'pdf' | 'pptx' | null;

function getErrorMessage(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('memory') || msg.includes('Memory')) return 'استهلاك ذاكرة كبير';
  return fallback;
}

export function useSlideExport() {
  const { cards, presentationName, theme } = useSlideStore();
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [format, setFormat] = useState<ExportFormat>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [progress, setProgress] = useState(0);

  const clearExportStatus = useCallback(() => {
    setStatus('idle');
    setFormat(null);
    setErrorMessage(undefined);
    setProgress(0);
  }, []);

  const waitForImages = useCallback(async () => {
    const withImages = cards.filter((c) => c.images?.some((i) => i.status === 'loading'));
    if (withImages.length === 0) return;
    await new Promise((r) => setTimeout(r, IMAGE_LOAD_WAIT_MS));
  }, [cards]);

  const exportToPPTX = useCallback(async () => {
    if (!cards.length) return;
    setStatus('exporting');
    setFormat('pptx');
    setErrorMessage(undefined);
    setProgress(10);

    await waitForImages();
    setProgress(25);

    try {
      const blob = await exportDeckToPptx(
        cards,
        {
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          accentColor: theme.accentColor,
        },
        presentationName || 'عرض تقديمي'
      );
      setProgress(90);
      saveAs(blob, `${presentationName || 'عرض-تقديمي'}.pptx`);
      setProgress(100);
      setStatus('success');
      toast.success('تم تصدير PowerPoint بنجاح');
    } catch (err) {
      const msg = getErrorMessage(err, 'فشل تصدير PowerPoint');
      setErrorMessage(msg);
      setStatus('error');
      toast.error(msg);
      throw err;
    }
  }, [cards, presentationName, theme, waitForImages]);

  const exportToPDF = useCallback(async () => {
    if (!cards.length) return;
    setStatus('exporting');
    setFormat('pdf');
    setErrorMessage(undefined);
    setProgress(10);

    await waitForImages();
    setProgress(25);

    try {
      const blob = await exportDeckToPdf(
        cards,
        {
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          accentColor: theme.accentColor,
          fontFamily: theme.fontFamily,
        },
        presentationName || 'عرض تقديمي'
      );
      setProgress(90);
      saveAs(blob, `${presentationName || 'عرض-تقديمي'}.pdf`);
      setProgress(100);
      setStatus('success');
      toast.success('تم تصدير PDF بنجاح');
    } catch (err) {
      const msg = getErrorMessage(err, 'فشل تصدير PDF');
      setErrorMessage(msg);
      setStatus('error');
      toast.error(msg);
      throw err;
    }
  }, [cards, presentationName, theme, waitForImages]);

  const retryExport = useCallback(() => {
    if (format === 'pdf') return exportToPDF();
    if (format === 'pptx') return exportToPPTX();
  }, [format, exportToPDF, exportToPPTX]);

  return {
    exportToPDF,
    exportToPPTX,
    exportStatus: status,
    exportFormat: format,
    exportProgress: progress,
    exportErrorMessage: errorMessage,
    retryExport,
    clearExportStatus,
  };
}
