/**
 * Processes the slide store's image generation queue.
 * Triggers generation for each slide in the queue (max 3 concurrent).
 */
import { useEffect, useRef } from 'react';
import { useSlideStore } from '@/stores/slideStore';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { getKeywordsForContentType } from '@/lib/iconSelector';

const MAX_CONCURRENT = 3;

export function useImageGenerationQueue() {
  const queue = useSlideStore((s) => s.imageGenerationQueue);
  const cards = useSlideStore((s) => s.cards);
  const { generateImage } = useImageGeneration();
  const processingRef = useRef(new Set<string>());
  const inFlightRef = useRef(0);

  useEffect(() => {
    if (queue.length === 0 || inFlightRef.current >= MAX_CONCURRENT) return;

    const toProcess = queue
      .filter((id) => !processingRef.current.has(id))
      .slice(0, MAX_CONCURRENT - inFlightRef.current);

    for (const slideId of toProcess) {
      const card = cards.find((c) => c.id === slideId);
      if (!card || !card.images?.some((img) => img.status === 'loading')) continue;

      const contentType =
        (card.type === 'custom' ? Object.keys(card.content || {})[0] : card.type) || 'default';
      const keywords =
        card.layoutConfig?.imagePlacements?.[0]?.contentPrompt
          ?.split(/\s+/)
          .filter(Boolean)
          .slice(0, 6) ?? getKeywordsForContentType(contentType);

      processingRef.current.add(slideId);
      inFlightRef.current += 1;

      generateImage(slideId, contentType, keywords.slice(0, 10))
        .finally(() => {
          processingRef.current.delete(slideId);
          inFlightRef.current = Math.max(0, inFlightRef.current - 1);
        });
    }
  }, [queue, cards, generateImage]);
}
