/**
 * Image loader hook with retry logic (3 attempts, exponential backoff)
 * @see specs/007-gamma-smart-layout-engine/spec.md US2
 */
import { useState, useEffect, useCallback } from 'react';

const MAX_ATTEMPTS = 3;
const INITIAL_DELAY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface UseImageLoaderResult {
  status: 'loading' | 'ready' | 'failed';
  error?: Error;
  retry: () => void;
}

/**
 * Load an image with retries (3 attempts, exponential backoff).
 * Returns status, error, and retry callback.
 */
export function useImageLoader(url: string | undefined | null): UseImageLoaderResult {
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [error, setError] = useState<Error | undefined>();
  const [attempt, setAttempt] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  const load = useCallback(async () => {
    if (!url || typeof url !== 'string') {
      setStatus('failed');
      setError(new Error('Invalid URL'));
      return;
    }

    setStatus('loading');
    setError(undefined);

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      try {
        const img = new Image();
        const loadPromise = new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Image load failed'));
        });
        img.src = url;
        await loadPromise;
        setStatus('ready');
        return;
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Image load failed'));
        if (i < MAX_ATTEMPTS - 1) {
          const backoff = INITIAL_DELAY_MS * Math.pow(2, i);
          await delay(backoff);
        }
      }
    }
    setStatus('failed');
  }, [url, retryKey]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  return { status, error, retry };
}
