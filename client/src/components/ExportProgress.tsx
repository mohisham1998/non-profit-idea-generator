/**
 * ExportProgress — T109: Export progress UI with status updates
 * Shows progress during PDF/PPTX export with status and optional retry on error.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';
export type ExportFormat = 'pdf' | 'pptx' | null;

export interface ExportProgressProps {
  status: ExportStatus;
  format: ExportFormat;
  progress?: number;
  message?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ExportProgress({
  status,
  format,
  progress = 0,
  message,
  errorMessage,
  onRetry,
  onDismiss,
}: ExportProgressProps) {
  if (status === 'idle') return null;

  const formatLabel = format === 'pdf' ? 'PDF' : 'PowerPoint';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      >
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-background min-w-[280px] max-w-md"
          dir="rtl"
        >
          {status === 'exporting' && (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  جاري تصدير {formatLabel}...
                </p>
                {message && (
                  <p className="text-xs text-muted-foreground truncate">{message}</p>
                )}
                {progress > 0 && progress < 100 && (
                  <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  تم تصدير {formatLabel} بنجاح
                </p>
              </div>
              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={onDismiss} className="shrink-0">
                  إغلاق
                </Button>
              )}
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive">
                  فشل تصدير {formatLabel}
                </p>
                {errorMessage && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{errorMessage}</p>
                )}
              </div>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0 gap-1">
                  <RefreshCw className="h-4 w-4" />
                  إعادة المحاولة
                </Button>
              )}
              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={onDismiss} className="shrink-0">
                  إغلاق
                </Button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
