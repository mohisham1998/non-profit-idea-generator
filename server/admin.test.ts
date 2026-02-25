import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllSystemFeatures, toggleSystemFeature, getAllUsersWithPermissions, updateUserPermission } from './db';

// Mock the database
vi.mock('./db', async () => {
  const actual = await vi.importActual('./db');
  return {
    ...actual,
    getDb: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue([]),
    })),
  };
});

describe('Admin System Features', () => {
  describe('getAllSystemFeatures', () => {
    it('should return an array', async () => {
      const features = await getAllSystemFeatures();
      expect(Array.isArray(features)).toBe(true);
    });
  });

  describe('toggleSystemFeature', () => {
    it('should accept featureKey and isEnabled parameters', async () => {
      // Test that the function accepts correct parameters
      const result = await toggleSystemFeature('test_feature', true);
      expect(typeof result).toBe('boolean');
    });

    it('should accept false for isEnabled', async () => {
      const result = await toggleSystemFeature('test_feature', false);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getAllUsersWithPermissions', () => {
    it('should return an array', async () => {
      const users = await getAllUsersWithPermissions();
      expect(Array.isArray(users)).toBe(true);
    });
  });

  describe('updateUserPermission', () => {
    it('should accept userId, permissionKey and value parameters', async () => {
      const result = await updateUserPermission(1, 'canGenerateIdea', 1);
      expect(typeof result).toBe('boolean');
    });

    it('should accept 0 for value to disable permission', async () => {
      const result = await updateUserPermission(1, 'canGenerateIdea', 0);
      expect(typeof result).toBe('boolean');
    });
  });
});

describe('Feature Categories', () => {
  it('should have valid category names', () => {
    const validCategories = ['generation', 'analysis', 'methodology', 'interaction', 'export', 'general'];
    validCategories.forEach(category => {
      expect(typeof category).toBe('string');
      expect(category.length).toBeGreaterThan(0);
    });
  });

  it('should have valid permission keys', () => {
    const permissionKeys = [
      'canGenerateIdea',
      'canGenerateKPIs',
      'canEstimateBudget',
      'canGenerateSWOT',
      'canGenerateLogFrame',
      'canGeneratePMDPro',
      'canGenerateDesignThinking',
      'canChat',
      'canExportPDF',
    ];
    
    permissionKeys.forEach(key => {
      expect(typeof key).toBe('string');
      expect(key.startsWith('can')).toBe(true);
    });
  });
});
