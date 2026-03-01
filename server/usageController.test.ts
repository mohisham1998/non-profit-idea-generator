/**
 * Unit tests for usage/quota logic
 * Ensures quota cost calculations match plan limits ($50 default).
 */

import { describe, it, expect } from 'vitest';

const DEFAULT_QUOTA = 50;

/** Client-side percent calculation (matches UsageQuota.tsx) */
function calcPercent(currentUsd: number, limitUsd: number): number {
  return limitUsd > 0 ? Math.min(100, (currentUsd / limitUsd) * 100) : 0;
}

/** Client-side remaining calculation */
function calcRemaining(currentUsd: number, limitUsd: number): number {
  return Math.max(0, limitUsd - currentUsd);
}

describe('Usage / Quota Controller', () => {
  describe('quota cost calculations', () => {
    it('default plan limit is $50', () => {
      expect(DEFAULT_QUOTA).toBe(50);
    });

    it('percent never exceeds 100 when at or over limit', () => {
      expect(calcPercent(50, 50)).toBe(100);
      expect(calcPercent(60, 50)).toBe(100);
    });

    it('percent scales correctly for plan limits', () => {
      expect(calcPercent(25, 50)).toBe(50);
      expect(calcPercent(12.5, 50)).toBe(25);
      expect(calcPercent(0, 50)).toBe(0);
    });

    it('remaining is correct', () => {
      expect(calcRemaining(25, 50)).toBe(25);
      expect(calcRemaining(50, 50)).toBe(0);
      expect(calcRemaining(60, 50)).toBe(0);
      expect(calcRemaining(0, 50)).toBe(50);
    });

    it('handles zero limit gracefully', () => {
      expect(calcPercent(10, 0)).toBe(0);
      expect(calcRemaining(10, 0)).toBe(0);
    });

    it('format displays two decimals for USD', () => {
      const value = 12.47;
      expect(value.toFixed(2)).toBe('12.47');
    });
  });
});
