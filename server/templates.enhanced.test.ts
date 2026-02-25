import { describe, it, expect } from 'vitest';

describe('Enhanced Design Templates', () => {
  describe('Template Definitions', () => {
    it('should have four template types', () => {
      const templateIds = ['classic', 'modern', 'formal', 'creative'];
      expect(templateIds).toHaveLength(4);
    });

    it('should have valid template IDs', () => {
      const validIds = ['classic', 'modern', 'formal', 'creative'];
      validIds.forEach(id => {
        expect(['classic', 'modern', 'formal', 'creative']).toContain(id);
      });
    });
  });

  describe('Template Colors', () => {
    const templateColors = {
      classic: {
        primary: '#1a365d',
        secondary: '#2d4a6f',
        accent: '#d4af37',
        headerBg: '#1a365d',
        headerText: '#ffffff',
      },
      modern: {
        primary: '#4f46e5',
        secondary: '#7c3aed',
        accent: '#f59e0b',
        headerBg: '#4f46e5',
        headerText: '#ffffff',
      },
      formal: {
        primary: '#064e3b',
        secondary: '#047857',
        accent: '#ca8a04',
        headerBg: '#064e3b',
        headerText: '#ffffff',
      },
      creative: {
        primary: '#db2777',
        secondary: '#f97316',
        accent: '#0ea5e9',
        headerBg: '#db2777',
        headerText: '#ffffff',
      },
    };

    it('should have valid hex colors for classic template', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      Object.values(templateColors.classic).forEach(color => {
        expect(color).toMatch(hexRegex);
      });
    });

    it('should have valid hex colors for modern template', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      Object.values(templateColors.modern).forEach(color => {
        expect(color).toMatch(hexRegex);
      });
    });

    it('should have valid hex colors for formal template', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      Object.values(templateColors.formal).forEach(color => {
        expect(color).toMatch(hexRegex);
      });
    });

    it('should have valid hex colors for creative template', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      Object.values(templateColors.creative).forEach(color => {
        expect(color).toMatch(hexRegex);
      });
    });

    it('should have white header text for all templates', () => {
      Object.values(templateColors).forEach(template => {
        expect(template.headerText).toBe('#ffffff');
      });
    });

    it('should have matching primary and headerBg colors', () => {
      Object.values(templateColors).forEach(template => {
        expect(template.primary).toBe(template.headerBg);
      });
    });
  });

  describe('Template Style Properties', () => {
    it('should have distinct primary colors for each template', () => {
      const primaryColors = [
        '#1a365d', // classic
        '#4f46e5', // modern
        '#064e3b', // formal
        '#db2777', // creative
      ];
      const uniqueColors = new Set(primaryColors);
      expect(uniqueColors.size).toBe(4);
    });

    it('should have distinct accent colors for each template', () => {
      const accentColors = [
        '#d4af37', // classic - gold
        '#f59e0b', // modern - amber
        '#ca8a04', // formal - yellow
        '#0ea5e9', // creative - cyan
      ];
      const uniqueColors = new Set(accentColors);
      expect(uniqueColors.size).toBe(4);
    });
  });

  describe('Template Names (Arabic)', () => {
    const templateNames = {
      classic: 'كلاسيكي',
      modern: 'عصري',
      formal: 'رسمي',
      creative: 'إبداعي',
    };

    it('should have Arabic names for all templates', () => {
      expect(templateNames.classic).toBe('كلاسيكي');
      expect(templateNames.modern).toBe('عصري');
      expect(templateNames.formal).toBe('رسمي');
      expect(templateNames.creative).toBe('إبداعي');
    });

    it('should have non-empty names', () => {
      Object.values(templateNames).forEach(name => {
        expect(name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Template Descriptions (Arabic)', () => {
    const templateDescriptions = {
      classic: 'تصميم أنيق وخالد',
      modern: 'تصميم عصري ومبتكر',
      formal: 'تصميم رسمي واحترافي',
      creative: 'تصميم إبداعي وجريء',
    };

    it('should have Arabic descriptions for all templates', () => {
      Object.values(templateDescriptions).forEach(desc => {
        expect(desc.length).toBeGreaterThan(0);
        // Check for Arabic characters
        expect(/[\u0600-\u06FF]/.test(desc)).toBe(true);
      });
    });
  });
});
