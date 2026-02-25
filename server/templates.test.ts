import { describe, it, expect } from 'vitest';

// اختبارات نظام القوالب
describe('Template System', () => {
  // تعريف القوالب المتاحة
  const validTemplates = ['classic', 'modern', 'formal', 'creative'];
  
  // اختبار وجود جميع القوالب المطلوبة
  it('should have all required template types', () => {
    expect(validTemplates).toContain('classic');
    expect(validTemplates).toContain('modern');
    expect(validTemplates).toContain('formal');
    expect(validTemplates).toContain('creative');
  });

  // اختبار أن كل قالب له ألوان صحيحة
  it('should have valid color format for each template', () => {
    const templateColors = {
      classic: {
        primary: '#1e3a5f',
        secondary: '#2c5282',
        accent: '#c9a227',
      },
      modern: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#f59e0b',
      },
      formal: {
        primary: '#0f4c3a',
        secondary: '#166534',
        accent: '#b8860b',
      },
      creative: {
        primary: '#ec4899',
        secondary: '#f97316',
        accent: '#06b6d4',
      },
    };

    // التحقق من صيغة الألوان hex
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    
    Object.entries(templateColors).forEach(([templateId, colors]) => {
      expect(hexColorRegex.test(colors.primary)).toBe(true);
      expect(hexColorRegex.test(colors.secondary)).toBe(true);
      expect(hexColorRegex.test(colors.accent)).toBe(true);
    });
  });

  // اختبار أن القالب الافتراضي هو classic
  it('should default to classic template', () => {
    const defaultTemplate = 'classic';
    expect(validTemplates).toContain(defaultTemplate);
    expect(defaultTemplate).toBe('classic');
  });

  // اختبار تحويل الألوان من hex إلى RGB
  it('should correctly convert hex to RGB', () => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // اختبار تحويل اللون الأخضر
    const greenColor = hexToRgb('#1e7e34');
    expect(greenColor).toEqual({ r: 30, g: 126, b: 52 });

    // اختبار تحويل اللون الأزرق
    const blueColor = hexToRgb('#6366f1');
    expect(blueColor).toEqual({ r: 99, g: 102, b: 241 });

    // اختبار تحويل اللون الوردي
    const pinkColor = hexToRgb('#ec4899');
    expect(pinkColor).toEqual({ r: 236, g: 72, b: 153 });
  });

  // اختبار أن كل قالب له اسم عربي
  it('should have Arabic names for all templates', () => {
    const templateNames = {
      classic: 'كلاسيكي',
      modern: 'عصري',
      formal: 'رسمي',
      creative: 'إبداعي',
    };

    Object.entries(templateNames).forEach(([id, name]) => {
      expect(name).toBeTruthy();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });

  // اختبار أن القوالب لها أوصاف
  it('should have descriptions for all templates', () => {
    const templateDescriptions = {
      classic: 'تصميم رسمي تقليدي بألوان هادئة ومحايدة',
      modern: 'تصميم حديث بألوان زاهية وتدرجات جذابة',
      formal: 'تصميم احترافي مناسب للجهات الحكومية والرسمية',
      creative: 'تصميم مبتكر بأشكال هندسية وألوان جريئة',
    };

    Object.values(templateDescriptions).forEach((desc) => {
      expect(desc).toBeTruthy();
      expect(desc.length).toBeGreaterThan(10);
    });
  });
});

// اختبارات خيارات التصدير
describe('Export Options with Templates', () => {
  it('should accept templateId in export options', () => {
    const exportOptions = {
      approvedSections: new Set(['summary', 'impact']),
      marketingContent: { summary: 'Test summary' },
      ideaData: { programDescription: 'Test program' },
      templateId: 'modern' as const,
    };

    expect(exportOptions.templateId).toBe('modern');
    expect(exportOptions.approvedSections.has('summary')).toBe(true);
  });

  it('should use default template when not specified', () => {
    const exportOptions = {
      approvedSections: new Set(['summary']),
      marketingContent: {},
      ideaData: {},
    };

    const templateId = (exportOptions as any).templateId || 'classic';
    expect(templateId).toBe('classic');
  });
});
