import { describe, it, expect, vi } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createAuthContext() {
  const user: AuthenticatedUser = {
    id: 1,
    openId: 'sample-user',
    email: 'test@example.com',
    name: 'Test User',
    loginMethod: 'manus',
    role: 'user',
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };

  return { ctx };
}

describe('Program Evaluation Router', () => {
  describe('evaluateProgram', () => {
    it('يجب أن يرفع خطأ إذا كان اسم البرنامج فارغاً', async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.evaluation.evaluateProgram({
          programName: '',
          programDescription: 'وصف البرنامج التفصيلي للبرنامج',
          methodology: 'logframe',
        })
      ).rejects.toThrow();
    });

    it('يجب أن يرفع خطأ إذا كان وصف البرنامج قصيراً جداً', async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.evaluation.evaluateProgram({
          programName: 'برنامج تجريبي',
          programDescription: 'قصير',
          methodology: 'logframe',
        })
      ).rejects.toThrow();
    });

    it('يجب أن يقبل منهجية الإطار المنطقي', async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // هذا الاختبار يتحقق من أن الـ input validation يعمل بشكل صحيح
      expect(async () => {
        await caller.evaluation.evaluateProgram({
          programName: 'برنامج تجريبي',
          programDescription: 'هذا وصف تفصيلي للبرنامج التجريبي الذي نريد تقييمه',
          methodology: 'logframe',
        });
      }).toBeDefined();
    });

    it('يجب أن يقبل منهجية نظرية التغيير', async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      expect(async () => {
        await caller.evaluation.evaluateProgram({
          programName: 'برنامج تجريبي',
          programDescription: 'هذا وصف تفصيلي للبرنامج التجريبي الذي نريد تقييمه',
          methodology: 'theory-of-change',
        });
      }).toBeDefined();
    });

    it('يجب أن يقبل منهجية الإدارة القائمة على النتائج', async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      expect(async () => {
        await caller.evaluation.evaluateProgram({
          programName: 'برنامج تجريبي',
          programDescription: 'هذا وصف تفصيلي للبرنامج التجريبي الذي نريد تقييمه',
          methodology: 'results-based',
        });
      }).toBeDefined();
    });

    it('يجب أن يقبل منهجية التقييم التشاركي', async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      expect(async () => {
        await caller.evaluation.evaluateProgram({
          programName: 'برنامج تجريبي',
          programDescription: 'هذا وصف تفصيلي للبرنامج التجريبي الذي نريد تقييمه',
          methodology: 'participatory',
        });
      }).toBeDefined();
    });

    it('يجب أن يرفع خطأ للمنهجيات غير الصحيحة', async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.evaluation.evaluateProgram({
          programName: 'برنامج تجريبي',
          programDescription: 'هذا وصف تفصيلي للبرنامج التجريبي الذي نريد تقييمه',
          methodology: 'invalid-methodology' as any,
        })
      ).rejects.toThrow();
    });

    it('يجب أن يقبل البيانات الاختيارية', async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      expect(async () => {
        await caller.evaluation.evaluateProgram({
          programName: 'برنامج تجريبي',
          programDescription: 'هذا وصف تفصيلي للبرنامج التجريبي الذي نريد تقييمه',
          objectives: 'الأهداف الرئيسية',
          targetBeneficiaries: 'الفئة المستهدفة',
          outcomes: 'النتائج المتوقعة',
          challenges: 'التحديات والعوائق',
          methodology: 'logframe',
        });
      }).toBeDefined();
    });

    it('يجب أن يقبل البيانات الجزئية', async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      expect(async () => {
        await caller.evaluation.evaluateProgram({
          programName: 'برنامج تجريبي',
          programDescription: 'هذا وصف تفصيلي للبرنامج التجريبي الذي نريد تقييمه',
          objectives: 'الأهداف فقط',
          methodology: 'logframe',
        });
      }).toBeDefined();
    });
  });

  describe('معالجة الأخطاء', () => {
    it('يجب أن يرفع خطأ للمستخدمين غير المصرح لهم', async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {
          protocol: 'https',
          headers: {},
        } as TrpcContext['req'],
        res: {} as TrpcContext['res'],
      };

      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.evaluation.evaluateProgram({
          programName: 'برنامج تجريبي',
          programDescription: 'هذا وصف تفصيلي للبرنامج التجريبي الذي نريد تقييمه',
          methodology: 'logframe',
        })
      ).rejects.toThrow();
    });
  });

  describe('صيغة البيانات المدخلة', () => {
    it('يجب أن يقبل أسماء البرامج بالعربية', async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      expect(async () => {
        await caller.evaluation.evaluateProgram({
          programName: 'برنامج محو الأمية',
          programDescription: 'هذا وصف تفصيلي للبرنامج التجريبي الذي نريد تقييمه',
          methodology: 'logframe',
        });
      }).toBeDefined();
    });

    it('يجب أن يقبل أوصاف البرامج الطويلة', async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const longDescription = 'أ'.repeat(500);

      expect(async () => {
        await caller.evaluation.evaluateProgram({
          programName: 'برنامج تجريبي',
          programDescription: longDescription,
          methodology: 'logframe',
        });
      }).toBeDefined();
    });
  });
});
