/**
 * Image blob storage in PostgreSQL for AI-generated slide images.
 * Enforces 10GB per-user quota.
 */
import { eq, sql, and } from "drizzle-orm";
import { getDb } from "../db";
import { generatedImages, users } from "../../drizzle/schema";
import type { InsertGeneratedImage } from "../../drizzle/schema";

const QUOTA_LIMIT_BYTES = 10 * 1024 * 1024 * 1024; // 10GB

export type StoreImageInput = {
  userId: number;
  slideDeckId?: number;
  slideId: string;
  contentType: string;
  prompt: string;
  contentHash: string;
  /** Image data as Buffer or base64 string */
  imageBuffer: Buffer | string;
  width: number;
  height: number;
  generationStatus?: "completed" | "failed";
  errorMessage?: string;
};

/** Check if image with same content hash exists (deduplication) */
export async function findImageByHash(
  userId: number,
  contentHash: string,
  slideId: string
): Promise<{ id: number; imageDataBase64: string } | null> {
  const db = await getDb();
  if (!db) return null;

  const [row] = await db
    .select({ id: generatedImages.id, imageData: generatedImages.imageData })
    .from(generatedImages)
    .where(
      and(
        eq(generatedImages.userId, userId),
        eq(generatedImages.contentHash, contentHash),
        eq(generatedImages.slideId, slideId)
      )
    )
    .limit(1);

  return row && row.imageData ? { id: row.id, imageDataBase64: row.imageData } : null;
}

/** Get user's current image storage usage in bytes */
export async function getUserQuota(userId: number): Promise<{
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
}> {
  const db = await getDb();
  if (!db) {
    return { usedBytes: 0, limitBytes: QUOTA_LIMIT_BYTES, remainingBytes: QUOTA_LIMIT_BYTES };
  }

  const [userRow] = await db
    .select({
      used: users.imageStorageUsedBytes,
      limit: users.imageStorageLimitBytes,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const usedBytes = Number(userRow?.used ?? 0);
  const limitBytes = Number(userRow?.limit ?? QUOTA_LIMIT_BYTES);
  const remainingBytes = Math.max(0, limitBytes - usedBytes);

  return { usedBytes, limitBytes, remainingBytes };
}

/** Store image blob and update user quota */
export async function storeImage(input: StoreImageInput): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const fileSize =
    typeof input.imageBuffer === "string"
      ? Buffer.byteLength(input.imageBuffer, "base64")
      : input.imageBuffer.length;
  const quota = await getUserQuota(input.userId);
  if (fileSize > quota.remainingBytes) {
    throw new Error("Storage quota exceeded (10GB limit)");
  }

  const imageDataStr =
    typeof input.imageBuffer === "string"
      ? input.imageBuffer
      : input.imageBuffer.toString("base64");

  const [inserted] = await db
    .insert(generatedImages)
    .values({
      userId: input.userId,
      slideDeckId: input.slideDeckId ?? null,
      slideId: input.slideId,
      contentType: input.contentType,
      prompt: input.prompt,
      contentHash: input.contentHash,
      imageData: imageDataStr,
      fileSize,
      width: input.width,
      height: input.height,
      generationStatus: input.generationStatus ?? "completed",
      errorMessage: input.errorMessage ?? null,
    } as InsertGeneratedImage)
    .returning({ id: generatedImages.id });

  if (!inserted) {
    throw new Error("Failed to insert image");
  }

  // Update user quota
  await db
    .update(users)
    .set({
      imageStorageUsedBytes: sql`${users.imageStorageUsedBytes} + ${fileSize}`,
    })
    .where(eq(users.id, input.userId));

  return inserted.id;
}

/** Get image data by ID (user must own it) */
export async function getImageById(
  imageId: number,
  userId: number
): Promise<{ imageData: Buffer; contentType: string } | null> {
  const db = await getDb();
  if (!db) return null;

  const [row] = await db
    .select({
      imageData: generatedImages.imageData,
      contentType: generatedImages.contentType,
    })
    .from(generatedImages)
    .where(
      and(eq(generatedImages.id, imageId), eq(generatedImages.userId, userId))
    )
    .limit(1);

  if (!row || !row.imageData) return null;
  const buffer = Buffer.from(row.imageData, "base64");
  return {
    imageData: buffer,
    contentType: row.contentType,
  };
}

/** Delete image and free quota */
export async function deleteImage(
  imageId: number,
  userId: number
): Promise<{ freedBytes: number } | null> {
  const db = await getDb();
  if (!db) return null;

  const [row] = await db
    .select({ fileSize: generatedImages.fileSize })
    .from(generatedImages)
    .where(
      and(eq(generatedImages.id, imageId), eq(generatedImages.userId, userId))
    )
    .limit(1);

  if (!row) return null;

  await db
    .delete(generatedImages)
    .where(
      and(eq(generatedImages.id, imageId), eq(generatedImages.userId, userId))
    );

  await db
    .update(users)
    .set({
      imageStorageUsedBytes: sql`GREATEST(0, ${users.imageStorageUsedBytes} - ${row.fileSize})`,
    })
    .where(eq(users.id, userId));

  return { freedBytes: row.fileSize };
}
