/**
 * Export jobs router - track PDF/PPTX export operations
 */
import { eq } from 'drizzle-orm';
import { router, protectedProcedure } from './_core/trpc';
import { z } from 'zod';
import { getDb } from './db';
import { exportJobs } from '../drizzle/schema';

export const exportRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        slideDeckId: z.number(),
        format: z.enum(['pdf', 'pptx']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const [row] = await db
        .insert(exportJobs)
        .values({
          slideDeckId: input.slideDeckId,
          userId: ctx.user.id,
          format: input.format,
          status: 'pending',
          progress: 0,
        })
        .returning();
      return row;
    }),

  updateProgress: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(['processing', 'completed', 'failed']).optional(),
        progress: z.number().min(0).max(100).optional(),
        outputUrl: z.string().optional(),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const [row] = await db
        .update(exportJobs)
        .set({
          ...(input.status !== undefined && { status: input.status }),
          ...(input.progress !== undefined && { progress: input.progress }),
          ...(input.outputUrl !== undefined && { outputUrl: input.outputUrl }),
          ...(input.errorMessage !== undefined && { errorMessage: input.errorMessage }),
          ...(input.status === 'completed' && { completedAt: new Date() }),
          ...(input.status === 'failed' && { completedAt: new Date() }),
        })
        .where(eq(exportJobs.id, input.id))
        .returning();
      return row;
    }),

  getByUser: protectedProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(exportJobs)
        .where(eq(exportJobs.userId, ctx.user.id))
        .orderBy(exportJobs.createdAt)
        .limit(input.limit);
    }),
});
