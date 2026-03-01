import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  generateSlideImage,
  constructPrompt,
  hashPrompt,
} from "./services/imageGeneration";
import {
  storeImage,
  getImageById,
  getUserQuota,
  findImageByHash,
} from "./services/imageStorage";

export const imagesRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        slideId: z.string().min(1),
        slideDeckId: z.number().optional(),
        contentType: z.string().min(1),
        keywords: z.array(z.string()).min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const quota = await getUserQuota(ctx.user.id);
      if (quota.usedBytes >= quota.limitBytes) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Storage quota exceeded (10GB limit)",
        });
      }

      const prompt = constructPrompt(input.contentType, input.keywords);
      const contentHash = hashPrompt(prompt);

      // Deduplication: check if we already have this image
      const existing = await findImageByHash(ctx.user.id, contentHash, input.slideId);
      if (existing) {
        return {
          imageId: String(existing.id),
          status: "completed" as const,
          dataUrl: `data:image/png;base64,${existing.imageDataBase64}`,
        };
      }

      try {
        const result = await generateSlideImage(prompt);
        let buffer: Buffer;

        if (result.base64) {
          buffer = Buffer.from(result.base64, "base64");
        } else if (result.url) {
          const res = await fetch(result.url);
          const arr = await res.arrayBuffer();
          buffer = Buffer.from(arr);
        } else {
          throw new Error("No image data returned");
        }

        const imageId = await storeImage({
          userId: ctx.user.id,
          slideDeckId: input.slideDeckId,
          slideId: input.slideId,
          contentType: "image/png",
          prompt,
          contentHash,
          imageBuffer: buffer,
          width: result.width,
          height: result.height,
          generationStatus: "completed",
        });

        const dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
        return {
          imageId: String(imageId),
          status: "completed" as const,
          dataUrl,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Image generation failed";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: msg,
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ imageId: z.string() }))
    .query(async ({ ctx, input }) => {
      const id = parseInt(input.imageId, 10);
      if (isNaN(id)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Image not found" });
      }
      const row = await getImageById(id, ctx.user.id);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Image not found" });
      }
      return `data:image/png;base64,${row.imageData.toString("base64")}`;
    }),

  getQuota: protectedProcedure.query(async ({ ctx }) => {
    const q = await getUserQuota(ctx.user.id);
    return {
      usedBytes: q.usedBytes,
      limitBytes: q.limitBytes,
      remainingBytes: q.remainingBytes,
      usedPercentage: q.limitBytes > 0 ? (q.usedBytes / q.limitBytes) * 100 : 0,
    };
  }),
});
