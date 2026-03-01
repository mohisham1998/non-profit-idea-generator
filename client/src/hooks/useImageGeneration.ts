import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useSlideStore } from "@/stores/slideStore";
import { toast } from "sonner";

export function useImageGeneration() {
  const [loading, setLoading] = useState(false);
  const generateMutation = trpc.images.generate.useMutation();
  const updateImageStatus = useSlideStore((s) => s.updateImageStatus);
  const updateCard = useSlideStore((s) => s.updateCard);

  const generateImage = useCallback(
    async (
      slideId: string,
      contentType: string,
      keywords: string[],
      slideDeckId?: number
    ) => {
      setLoading(true);
      try {
        const result = await generateMutation.mutateAsync({
          slideId,
          slideDeckId,
          contentType,
          keywords,
        });

        if (result.status === "completed" && result.dataUrl) {
          updateImageStatus(slideId, "ready");
          const state = useSlideStore.getState();
          const card = state.getCard(slideId);
          const existingImages = card?.images ?? [];
          const updated = existingImages.map((img, i) =>
            i === 0
              ? {
                  ...img,
                  id: result.imageId,
                  url: result.dataUrl!,
                  status: "ready" as const,
                }
              : img
          );
          const visualReady = updated.every((im) => im.status !== "loading");
          updateCard(slideId, {
            images: updated,
            visualReady,
          });
          toast.success("تم توليد الصورة بنجاح");
          return { imageId: result.imageId, dataUrl: result.dataUrl };
        }
        updateImageStatus(slideId, "failed");
        toast.error("فشل توليد الصورة");
        return null;
      } catch (e) {
        updateImageStatus(slideId, "failed");
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("quota") || msg.includes("Storage quota")) {
          toast.error("وصلت للحد الأقصى من تخزين الصور (10 ج.ب)");
        } else {
          toast.error("فشل توليد الصورة");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [generateMutation, updateImageStatus, updateCard]
  );

  return { generateImage, loading };
}
