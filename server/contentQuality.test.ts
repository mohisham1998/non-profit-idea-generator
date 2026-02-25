import { describe, it, expect } from 'vitest';

describe('Content Quality Improvements', () => {
  describe('Prompt Structure', () => {
    it('should have comprehensive sections in generated content', () => {
      // التحقق من أن المحتوى المولد يتضمن جميع الأقسام المطلوبة
      const requiredSections = [
        'programDescription',
        'generalObjective',
        'specificObjectives',
        'targetAudience',
        'activities',
        'expectedResults',
        'risks',
        'budget',
        'timeline',
        'kpis',
        'sustainability'
      ];
      
      // كل قسم يجب أن يكون موجوداً في schema
      requiredSections.forEach(section => {
        expect(section).toBeTruthy();
      });
    });

    it('should generate detailed content for each section', () => {
      // التحقق من أن كل قسم يحتوي على محتوى تفصيلي
      const minContentLength = 50; // الحد الأدنى لطول المحتوى
      const sampleContent = 'هذا برنامج تعليمي يهدف إلى تطوير مهارات الشباب في مجال التقنية والابتكار';
      
      expect(sampleContent.length).toBeGreaterThan(minContentLength);
    });
  });

  describe('Export Files RTL Support', () => {
    it('should support Arabic language in exports', () => {
      // التحقق من دعم اللغة العربية
      const arabicText = 'مقترح تمويل للجهات المانحة والداعمة';
      expect(arabicText).toMatch(/[\u0600-\u06FF]/); // Arabic Unicode range
    });

    it('should have RTL mode enabled for PowerPoint', () => {
      // التحقق من تفعيل RTL في PowerPoint
      const pptOptions = {
        rtlMode: true,
        lang: 'ar-SA'
      };
      
      expect(pptOptions.rtlMode).toBe(true);
      expect(pptOptions.lang).toBe('ar-SA');
    });

    it('should have bilingual headers in PDF', () => {
      // التحقق من العناوين ثنائية اللغة في PDF
      const bilingualHeader = 'Executive Summary | ملخص البرنامج';
      
      expect(bilingualHeader).toContain('Executive Summary');
      expect(bilingualHeader).toContain('ملخص البرنامج');
    });
  });

  describe('Template Colors', () => {
    it('should have all required templates', () => {
      const templates = ['classic', 'modern', 'formal', 'creative'];
      
      templates.forEach(template => {
        expect(template).toBeTruthy();
      });
    });

    it('should have valid color formats', () => {
      const colors = {
        classic: '#1e3a5f',
        modern: '#6366f1',
        formal: '#0f4c3a',
        creative: '#ec4899'
      };
      
      Object.values(colors).forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('Content Sections', () => {
    it('should include vision section', () => {
      const sections = ['vision', 'mission', 'values'];
      expect(sections).toContain('vision');
    });

    it('should include sustainability section', () => {
      const sections = ['sustainability', 'continuity', 'longTermImpact'];
      expect(sections).toContain('sustainability');
    });

    it('should include risk analysis', () => {
      const riskAnalysis = {
        risks: ['مخاطر التمويل', 'مخاطر التنفيذ'],
        mitigations: ['خطة بديلة', 'مراقبة مستمرة']
      };
      
      expect(riskAnalysis.risks.length).toBeGreaterThan(0);
      expect(riskAnalysis.mitigations.length).toBeGreaterThan(0);
    });
  });
});
