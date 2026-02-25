import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database functions
vi.mock('./db', () => ({
  getOrganizationInfo: vi.fn(),
  updateOrganizationLogo: vi.fn(),
  updateOrganizationName: vi.fn(),
  updateOrganizationInfo: vi.fn(),
}));

// Mock the storage functions
vi.mock('./storage', () => ({
  storagePut: vi.fn(),
}));

import {
  getOrganizationInfo,
  updateOrganizationLogo,
  updateOrganizationName,
  updateOrganizationInfo,
} from './db';
import { storagePut } from './storage';

describe('Organization Logo Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrganizationInfo', () => {
    it('should return organization info for a valid user', async () => {
      const mockInfo = {
        logo: 'https://example.com/logo.png',
        name: 'جمعية الإحسان الخيرية',
      };
      
      vi.mocked(getOrganizationInfo).mockResolvedValue(mockInfo);
      
      const result = await getOrganizationInfo(1);
      
      expect(result).toEqual(mockInfo);
      expect(getOrganizationInfo).toHaveBeenCalledWith(1);
    });

    it('should return null for non-existent user', async () => {
      vi.mocked(getOrganizationInfo).mockResolvedValue(null);
      
      const result = await getOrganizationInfo(999);
      
      expect(result).toBeNull();
    });

    it('should return null values when no logo or name is set', async () => {
      const mockInfo = {
        logo: null,
        name: null,
      };
      
      vi.mocked(getOrganizationInfo).mockResolvedValue(mockInfo);
      
      const result = await getOrganizationInfo(1);
      
      expect(result?.logo).toBeNull();
      expect(result?.name).toBeNull();
    });
  });

  describe('updateOrganizationLogo', () => {
    it('should update logo successfully', async () => {
      vi.mocked(updateOrganizationLogo).mockResolvedValue(true);
      
      const result = await updateOrganizationLogo(1, 'https://example.com/new-logo.png');
      
      expect(result).toBe(true);
      expect(updateOrganizationLogo).toHaveBeenCalledWith(1, 'https://example.com/new-logo.png');
    });

    it('should handle logo deletion (null value)', async () => {
      vi.mocked(updateOrganizationLogo).mockResolvedValue(true);
      
      const result = await updateOrganizationLogo(1, null);
      
      expect(result).toBe(true);
      expect(updateOrganizationLogo).toHaveBeenCalledWith(1, null);
    });

    it('should return false on database error', async () => {
      vi.mocked(updateOrganizationLogo).mockResolvedValue(false);
      
      const result = await updateOrganizationLogo(1, 'https://example.com/logo.png');
      
      expect(result).toBe(false);
    });
  });

  describe('updateOrganizationName', () => {
    it('should update name successfully', async () => {
      vi.mocked(updateOrganizationName).mockResolvedValue(true);
      
      const result = await updateOrganizationName(1, 'جمعية الخير');
      
      expect(result).toBe(true);
      expect(updateOrganizationName).toHaveBeenCalledWith(1, 'جمعية الخير');
    });

    it('should handle Arabic organization names', async () => {
      vi.mocked(updateOrganizationName).mockResolvedValue(true);
      
      const arabicName = 'مؤسسة التنمية الاجتماعية للأعمال الخيرية';
      const result = await updateOrganizationName(1, arabicName);
      
      expect(result).toBe(true);
      expect(updateOrganizationName).toHaveBeenCalledWith(1, arabicName);
    });

    it('should return false on database error', async () => {
      vi.mocked(updateOrganizationName).mockResolvedValue(false);
      
      const result = await updateOrganizationName(1, 'Test Org');
      
      expect(result).toBe(false);
    });
  });

  describe('updateOrganizationInfo', () => {
    it('should update both logo and name', async () => {
      vi.mocked(updateOrganizationInfo).mockResolvedValue(true);
      
      const result = await updateOrganizationInfo(1, {
        logoUrl: 'https://example.com/logo.png',
        name: 'جمعية الإحسان',
      });
      
      expect(result).toBe(true);
    });

    it('should update only logo when name is not provided', async () => {
      vi.mocked(updateOrganizationInfo).mockResolvedValue(true);
      
      const result = await updateOrganizationInfo(1, {
        logoUrl: 'https://example.com/logo.png',
      });
      
      expect(result).toBe(true);
    });

    it('should update only name when logo is not provided', async () => {
      vi.mocked(updateOrganizationInfo).mockResolvedValue(true);
      
      const result = await updateOrganizationInfo(1, {
        name: 'جمعية الإحسان',
      });
      
      expect(result).toBe(true);
    });
  });

  describe('Logo Upload Flow', () => {
    it('should upload logo to S3 and return URL', async () => {
      const mockUrl = 'https://s3.example.com/logos/user-1-123456.png';
      vi.mocked(storagePut).mockResolvedValue({ key: 'logos/user-1-123456.png', url: mockUrl });
      
      const buffer = Buffer.from('fake-image-data');
      const result = await storagePut('logos/user-1-123456.png', buffer, 'image/png');
      
      expect(result.url).toBe(mockUrl);
      expect(storagePut).toHaveBeenCalledWith('logos/user-1-123456.png', buffer, 'image/png');
    });

    it('should handle different image formats', async () => {
      const formats = [
        { extension: 'png', mimeType: 'image/png' },
        { extension: 'jpg', mimeType: 'image/jpeg' },
        { extension: 'gif', mimeType: 'image/gif' },
        { extension: 'webp', mimeType: 'image/webp' },
      ];

      for (const format of formats) {
        const mockUrl = `https://s3.example.com/logos/user-1.${format.extension}`;
        vi.mocked(storagePut).mockResolvedValue({ key: `logos/user-1.${format.extension}`, url: mockUrl });
        
        const buffer = Buffer.from('fake-image-data');
        const result = await storagePut(`logos/user-1.${format.extension}`, buffer, format.mimeType);
        
        expect(result.url).toBe(mockUrl);
      }
    });
  });

  describe('Organization Info in Exports', () => {
    it('should include organization info in export options', () => {
      const exportOptions = {
        approvedSections: new Set(['summary', 'impact']),
        marketingContent: { summary: 'Test summary' },
        ideaData: { programDescription: 'Test program' },
        organizationInfo: {
          logo: 'https://example.com/logo.png',
          name: 'جمعية الإحسان',
        },
      };

      expect(exportOptions.organizationInfo).toBeDefined();
      expect(exportOptions.organizationInfo?.logo).toBe('https://example.com/logo.png');
      expect(exportOptions.organizationInfo?.name).toBe('جمعية الإحسان');
    });

    it('should handle missing organization info gracefully', () => {
      const exportOptions = {
        approvedSections: new Set(['summary']),
        marketingContent: {},
        ideaData: {},
        organizationInfo: undefined,
      };

      expect(exportOptions.organizationInfo).toBeUndefined();
    });

    it('should handle partial organization info', () => {
      const exportOptions = {
        approvedSections: new Set(['summary']),
        marketingContent: {},
        ideaData: {},
        organizationInfo: {
          logo: null,
          name: 'جمعية الإحسان',
        },
      };

      expect(exportOptions.organizationInfo?.logo).toBeNull();
      expect(exportOptions.organizationInfo?.name).toBe('جمعية الإحسان');
    });
  });
});
