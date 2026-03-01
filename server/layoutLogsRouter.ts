/**
 * Layout selection logs router - persist and query layout decisions
 */
import { eq, asc } from 'drizzle-orm';
import { router, protectedProcedure } from './_core/trpc';
import { z } from 'zod';
import { getDb } from './db';
import { layoutSelectionLogs } from '../drizzle/schema';

export const layoutLogsRouter = router({
  log: protectedProcedure
    .input(
      z.object({
        slideDeckId: z.number(),
        slideIndex: z.number(),
        slideType: z.string().optional(),
        contentAnalysis: z.record(z.string(), z.unknown()),
        candidateLayouts: z.array(z.string()),
        candidateScores: z.record(z.string(), z.number()).optional(),
        selectedLayoutId: z.string(),
        selectionMethod: z.enum(['scoring', 'ai', 'fallback']).default('scoring'),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const [row] = await db
        .insert(layoutSelectionLogs)
        .values({
          slideDeckId: input.slideDeckId,
          slideIndex: input.slideIndex,
          slideType: input.slideType ?? null,
          contentAnalysis: input.contentAnalysis,
          candidateLayouts: input.candidateLayouts,
          candidateScores: input.candidateScores ?? null,
          selectedLayoutId: input.selectedLayoutId,
          selectionMethod: input.selectionMethod,
        })
        .returning();
      return row;
    }),

  getByDeck: protectedProcedure
    .input(z.object({ slideDeckId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(layoutSelectionLogs)
        .where(eq(layoutSelectionLogs.slideDeckId, input.slideDeckId))
        .orderBy(asc(layoutSelectionLogs.slideIndex));
    }),
});
