import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from './db';
import { ideas, sustainabilityAnalysis, researchStudy } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Export and Copy Features', () => {
  let testIdeaId: number;
  let testUserId: number = 1;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // إنشاء فكرة اختبارية
    const result = await db.insert(ideas).values({
      userId: testUserId,
      programDescription: 'برنامج اختباري لتصدير PDF',
      targetAudience: 'الشباب',
      targetCount: '100',
      duration: '6 أشهر',
      selectedName: 'برنامج الاختبار',
      vision: 'رؤية اختبارية',
      generalGoal: 'هدف عام اختباري',
      detailedGoals: JSON.stringify(['هدف 1', 'هدف 2']),
      idea: 'فكرة اختبارية',
      objective: 'هدف اختباري',
      justifications: JSON.stringify(['مبرر 1', 'مبرر 2']),
      features: JSON.stringify(['ميزة 1', 'ميزة 2']),
      strengths: JSON.stringify(['قوة 1', 'قوة 2']),
      outputs: JSON.stringify(['مخرج 1', 'مخرج 2']),
      expectedResults: JSON.stringify(['نتيجة متوقعة 1', 'نتيجة متوقعة 2']),
      outcomes: JSON.stringify(['نتيجة 1', 'نتيجة 2']),
      risks: JSON.stringify(['خطر 1', 'خطر 2']),
      proposedNames: JSON.stringify(['اسم 1', 'اسم 2']),
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: testUserId,
    });

    testIdeaId = Number(result.insertId) || 1; // استخدام 1 كقيمة افتراضية للاختبار

    // إنشاء تحليل استدامة اختباري
    await db.insert(sustainabilityAnalysis).values({
      ideaId: testIdeaId,
      overallScore: 85,
      indicators: JSON.stringify([
        { name: 'مؤشر 1', score: 90, description: 'وصف المؤشر 1' },
        { name: 'مؤشر 2', score: 80, description: 'وصف المؤشر 2' },
      ]),
      recommendations: JSON.stringify([
        { priority: 'عالية', title: 'توصية 1', description: 'وصف التوصية 1' },
      ]),
      longTermPlan: JSON.stringify({
        year1: 'خطة السنة الأولى',
        year2: 'خطة السنة الثانية',
        year3: 'خطة السنة الثالثة',
      }),
      risks: JSON.stringify([
        { level: 'متوسط', title: 'خطر 1', description: 'وصف الخطر 1', mitigation: 'استراتيجية التخفيف' },
      ]),
      fundingSources: JSON.stringify([
        { source: 'مصدر 1', amount: '100000', description: 'وصف المصدر 1' },
      ]),
    });

    // إنشاء دراسة بحثية اختبارية
    await db.insert(researchStudy).values({
      ideaId: testIdeaId,
      executiveSummary: 'ملخص تنفيذي اختباري',
      programImportance: 'أهمية البرنامج الاختبارية',
      socialReturn: 'العائد الاجتماعي الاختباري',
      organizationReturn: 'العائد للجمعية الاختباري',
      recommendations: 'التوصيات الاختبارية',
      references: JSON.stringify([
        {
          title: 'مرجع اختباري',
          author: 'مؤلف اختباري',
          year: '2024',
          source: 'مصدر اختباري',
          url: 'https://example.com',
        },
      ]),
    });
  });

  describe('Sustainability Analysis Export', () => {
    it('should have sustainability analysis data ready for export', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [analysis] = await db
        .select()
        .from(sustainabilityAnalysis)
        .where(eq(sustainabilityAnalysis.ideaId, testIdeaId));

      expect(analysis).toBeDefined();
      expect(analysis.overallScore).toBe(85);
      expect(analysis.indicators).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.fundingSources).toBeDefined();
    });

    it('should have valid JSON structure for sustainability data', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [analysis] = await db
        .select()
        .from(sustainabilityAnalysis)
        .where(eq(sustainabilityAnalysis.ideaId, testIdeaId));

      const indicators = JSON.parse(analysis.indicators as string);
      expect(Array.isArray(indicators)).toBe(true);
      expect(indicators.length).toBeGreaterThan(0);

      const recommendations = JSON.parse(analysis.recommendations as string);
      expect(Array.isArray(recommendations)).toBe(true);

      const fundingSources = JSON.parse(analysis.fundingSources as string);
      expect(Array.isArray(fundingSources)).toBe(true);
    });
  });

  describe('Research Study Export', () => {
    it('should have research study data ready for export', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [study] = await db
        .select()
        .from(researchStudy)
        .where(eq(researchStudy.ideaId, testIdeaId));

      expect(study).toBeDefined();
      expect(study.executiveSummary).toBeDefined();
      expect(study.programImportance).toBeDefined();
      expect(study.socialReturn).toBeDefined();
      expect(study.organizationReturn).toBeDefined();
      expect(study.recommendations).toBeDefined();
      expect(study.references).toBeDefined();
    });

    it('should have valid references structure', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [study] = await db
        .select()
        .from(researchStudy)
        .where(eq(researchStudy.ideaId, testIdeaId));

      const references = JSON.parse(study.references as string);
      expect(Array.isArray(references)).toBe(true);
      expect(references.length).toBeGreaterThan(0);
      expect(references[0]).toHaveProperty('title');
      expect(references[0]).toHaveProperty('author');
      expect(references[0]).toHaveProperty('year');
    });
  });

  describe('Content Structure for Copy Feature', () => {
    it('should have all required fields for sustainability content copy', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [idea] = await db
        .select()
        .from(ideas)
        .where(eq(ideas.id, testIdeaId));

      const [analysis] = await db
        .select()
        .from(sustainabilityAnalysis)
        .where(eq(sustainabilityAnalysis.ideaId, testIdeaId));

      expect(idea.selectedName).toBeDefined();
      expect(analysis.overallScore).toBeDefined();
      expect(analysis.indicators).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.longTermPlan).toBeDefined();
      expect(analysis.risks).toBeDefined();
    });

    it('should have all required fields for research study content copy', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [idea] = await db
        .select()
        .from(ideas)
        .where(eq(ideas.id, testIdeaId));

      const [study] = await db
        .select()
        .from(researchStudy)
        .where(eq(researchStudy.ideaId, testIdeaId));

      expect(idea.selectedName).toBeDefined();
      expect(study.executiveSummary).toBeDefined();
      expect(study.programImportance).toBeDefined();
      expect(study.socialReturn).toBeDefined();
      expect(study.organizationReturn).toBeDefined();
      expect(study.recommendations).toBeDefined();
      expect(study.references).toBeDefined();
    });
  });

  describe('Data Integrity for Export', () => {
    it('should maintain Arabic text encoding in sustainability data', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [analysis] = await db
        .select()
        .from(sustainabilityAnalysis)
        .where(eq(sustainabilityAnalysis.ideaId, testIdeaId));

      const indicators = JSON.parse(analysis.indicators as string);
      expect(indicators[0].name).toContain('مؤشر');
      expect(indicators[0].description).toContain('وصف');
    });

    it('should maintain Arabic text encoding in research study data', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [study] = await db
        .select()
        .from(researchStudy)
        .where(eq(researchStudy.ideaId, testIdeaId));

      expect(study.executiveSummary).toContain('ملخص');
      expect(study.programImportance).toContain('أهمية');
    });
  });
});
