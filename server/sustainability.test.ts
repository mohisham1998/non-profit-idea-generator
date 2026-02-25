import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

// Mock context for testing
const createMockContext = (userId: number): TrpcContext => ({
  req: {} as any,
  res: {} as any,
  user: {
    id: userId,
    openId: `internal_${userId}`,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'approved' as const,
    associationName: 'Test Association',
    phoneNumber: '1234567890',
    loginMethod: null,
    lastSignedIn: null,
  },
});

describe('Sustainability Expert', () => {
  const testUserId = 1;

  describe('generateAnalysis and getAnalysis', () => {
    it('should generate and retrieve sustainability analysis for an idea', async () => {
      const caller = appRouter.createCaller(createMockContext(testUserId));
      
      // First, generate a test idea
      const idea = await caller.ideas.generate({
        programDescription: 'برنامج تعليمي للأطفال يهدف إلى تحسين مستوى التحصيل الدراسي للأطفال من خلال برامج تعليمية مبتكرة',
        targetAudience: 'الأطفال من 6-12 سنة',
        targetCount: '100',
        duration: '6 أشهر',
      });
      
      // Check that no analysis exists initially
      const initialAnalysis = await caller.sustainability.getAnalysis({ ideaId: idea.id });
      expect(initialAnalysis).toBeNull();
      
      // Generate sustainability analysis
      const analysis = await caller.sustainability.generateAnalysis({ ideaId: idea.id });
      
      expect(analysis).toBeDefined();
      expect(analysis.ideaId).toBe(idea.id);
      expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
      expect(analysis.overallScore).toBeLessThanOrEqual(100);
      expect(analysis.indicators).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.longTermPlan).toBeDefined();
      expect(analysis.risks).toBeDefined();
      
      // Retrieve the generated analysis
      const retrievedAnalysis = await caller.sustainability.getAnalysis({ ideaId: idea.id });
      expect(retrievedAnalysis).toBeDefined();
      expect(retrievedAnalysis?.ideaId).toBe(idea.id);
      expect(retrievedAnalysis?.id).toBe(analysis.id);
      
      // Try to generate again - should return existing
      const secondAnalysis = await caller.sustainability.generateAnalysis({ ideaId: idea.id });
      expect(secondAnalysis.id).toBe(analysis.id);
      expect(secondAnalysis.createdAt).toEqual(analysis.createdAt);
    }, 60000); // Increase timeout for LLM calls

    it('should throw error for non-existent idea', async () => {
      const caller = appRouter.createCaller(createMockContext(testUserId));
      
      await expect(
        caller.sustainability.generateAnalysis({ ideaId: 999999 })
      ).rejects.toThrow('الفكرة غير موجودة');
    }, 30000);
  });

  describe('Analysis Data Structure', () => {
    it('should have valid data structures in generated analysis', async () => {
      const caller = appRouter.createCaller(createMockContext(testUserId));
      
      // Generate a test idea and analysis
      const idea = await caller.ideas.generate({
        programDescription: 'برنامج صحي للمجتمع يهدف إلى تحسين الوعي الصحي وتقديم خدمات طبية مجانية',
        targetAudience: 'جميع أفراد المجتمع',
        targetCount: '500',
        duration: 'سنة واحدة',
      });
      
      const analysis = await caller.sustainability.generateAnalysis({ ideaId: idea.id });
      
      // Validate indicators structure
      const indicators = typeof analysis.indicators === 'string' 
        ? JSON.parse(analysis.indicators) 
        : analysis.indicators;
      
      expect(Array.isArray(indicators)).toBe(true);
      if (indicators.length > 0) {
        expect(indicators[0]).toHaveProperty('name');
        expect(indicators[0]).toHaveProperty('score');
        expect(indicators[0]).toHaveProperty('description');
      }
      
      // Validate recommendations structure
      const recommendations = typeof analysis.recommendations === 'string' 
        ? JSON.parse(analysis.recommendations) 
        : analysis.recommendations;
      
      expect(Array.isArray(recommendations)).toBe(true);
      if (recommendations.length > 0) {
        expect(recommendations[0]).toHaveProperty('priority');
        expect(recommendations[0]).toHaveProperty('title');
        expect(recommendations[0]).toHaveProperty('description');
      }
      
      // Validate long-term plan structure
      const longTermPlan = typeof analysis.longTermPlan === 'string' 
        ? JSON.parse(analysis.longTermPlan) 
        : analysis.longTermPlan;
      
      expect(typeof longTermPlan).toBe('object');
      const hasYears = longTermPlan.year1 || longTermPlan.year2 || longTermPlan.year3;
      expect(hasYears).toBeTruthy();
      
      // Validate risks structure
      const risks = typeof analysis.risks === 'string' 
        ? JSON.parse(analysis.risks) 
        : analysis.risks;
      
      expect(Array.isArray(risks)).toBe(true);
      if (risks.length > 0) {
        expect(risks[0]).toHaveProperty('severity');
        expect(risks[0]).toHaveProperty('title');
        expect(risks[0]).toHaveProperty('description');
        expect(risks[0]).toHaveProperty('mitigation');
      }
    }, 60000);
  });
});
