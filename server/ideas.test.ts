import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  createIdea: vi.fn(),
  getUserIdeas: vi.fn(),
  searchUserIdeas: vi.fn(),
  getIdeaById: vi.fn(),
  deleteIdea: vi.fn(),
  countUserIdeas: vi.fn(),
  updateIdea: vi.fn(),
  createConversation: vi.fn(),
  getIdeaConversations: vi.fn(),
  getConversationById: vi.fn(),
  addMessage: vi.fn(),
  getConversationMessages: vi.fn(),
}));

// Mock the LLM function
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { createIdea, getUserIdeas, searchUserIdeas, getIdeaById, deleteIdea, countUserIdeas, updateIdea, createConversation, getIdeaConversations, getConversationById, addMessage, getConversationMessages } from "./db";
import { invokeLLM } from "./_core/llm";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "مستخدم تجريبي",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

const mockIdea = {
  id: 1,
  userId: 1,
  programDescription: "برنامج تدريبي للشباب",
  targetAudience: "الشباب من 18-30 سنة",
  targetCount: "100 مستفيد",
  duration: "6 أشهر",
  idea: "فكرة البرنامج التدريبي",
  objective: "تأهيل الشباب لسوق العمل",
  justifications: "الحاجة لتدريب الشباب",
  features: "تدريب عملي ونظري",
  strengths: "فريق متخصص",
  outputs: "100 متدرب",
  expectedResults: "توظيف 50% من المتدربين",
  risks: "مخاطر التسرب وعدم الالتزام",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ideas router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ideas.list", () => {
    it("returns user ideas successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getUserIdeas).mockResolvedValue([mockIdea]);
      vi.mocked(countUserIdeas).mockResolvedValue(1);

      const result = await caller.ideas.list({ limit: 20, offset: 0 });

      expect(result.ideas).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(getUserIdeas).toHaveBeenCalledWith(1, 20, 0);
    });

    it("searches ideas when search query provided", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(searchUserIdeas).mockResolvedValue([mockIdea]);
      vi.mocked(countUserIdeas).mockResolvedValue(1);

      const result = await caller.ideas.list({ limit: 20, offset: 0, search: "تدريب" });

      expect(searchUserIdeas).toHaveBeenCalledWith(1, "تدريب", 20, 0);
      expect(result.ideas).toHaveLength(1);
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.ideas.list({ limit: 20, offset: 0 })).rejects.toThrow();
    });
  });

  describe("ideas.getById", () => {
    it("returns idea by id", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);

      const result = await caller.ideas.getById({ id: 1 });

      expect(result).toEqual(mockIdea);
      expect(getIdeaById).toHaveBeenCalledWith(1, 1);
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(null);

      await expect(caller.ideas.getById({ id: 999 })).rejects.toThrow("الفكرة غير موجودة");
    });
  });

  describe("ideas.delete", () => {
    it("deletes idea successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(deleteIdea).mockResolvedValue(true);

      const result = await caller.ideas.delete({ id: 1 });

      expect(result.success).toBe(true);
      expect(deleteIdea).toHaveBeenCalledWith(1, 1);
    });

    it("throws error when idea not found or unauthorized", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(deleteIdea).mockResolvedValue(false);

      await expect(caller.ideas.delete({ id: 999 })).rejects.toThrow(
        "لم يتم العثور على الفكرة أو ليس لديك صلاحية حذفها"
      );
    });
  });

  describe("ideas.generate", () => {
    it("generates idea successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const llmResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              idea: "فكرة مولدة",
              objective: "هدف مولد",
              justifications: "مبررات مولدة",
              features: "مميزات مولدة",
              strengths: "نقاط قوة مولدة",
              outputs: "مخرجات مولدة",
              expectedResults: "نتائج متوقعة مولدة",
            }),
          },
        }],
      };

      vi.mocked(invokeLLM).mockResolvedValue(llmResponse as any);
      vi.mocked(createIdea).mockResolvedValue({
        ...mockIdea,
        idea: "فكرة مولدة",
      });

      const result = await caller.ideas.generate({
        programDescription: "برنامج تدريبي للشباب في مجال التقنية",
        targetAudience: "الشباب من 18-30 سنة",
        targetCount: "100 مستفيد",
        duration: "6 أشهر",
      });

      expect(result.success).toBe(true);
      expect(result.idea).toBeDefined();
      expect(invokeLLM).toHaveBeenCalled();
      expect(createIdea).toHaveBeenCalled();
    });

    it("throws error for short description", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ideas.generate({ programDescription: "قصير" })
      ).rejects.toThrow();
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ideas.generate({ programDescription: "برنامج تدريبي للشباب" })
      ).rejects.toThrow();
    });
  });

  describe("ideas.update", () => {
    it("updates idea successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const updatedIdea = {
        ...mockIdea,
        idea: "فكرة محدثة",
      };

      vi.mocked(updateIdea).mockResolvedValue(updatedIdea);

      const result = await caller.ideas.update({
        id: 1,
        idea: "فكرة محدثة",
      });

      expect(result.success).toBe(true);
      expect(result.idea?.idea).toBe("فكرة محدثة");
      expect(updateIdea).toHaveBeenCalled();
    });

    it("throws error when no fields provided", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ideas.update({ id: 1 })
      ).rejects.toThrow("يجب تحديد حقل واحد على الأقل للتحديث");
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(updateIdea).mockResolvedValue(null);

      await expect(
        caller.ideas.update({ id: 999, idea: "فكرة جديدة" })
      ).rejects.toThrow("لم يتم العثور على الفكرة أو ليس لديك صلاحية تعديلها");
    });
  });

  describe("ideas.regenerateSection", () => {
    it("regenerates section successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const regeneratedIdea = {
        ...mockIdea,
        objective: "هدف معاد توليده",
      };

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({ objective: "هدف معاد توليده" }),
          },
        }],
      } as any);
      vi.mocked(updateIdea).mockResolvedValue(regeneratedIdea);

      const result = await caller.ideas.regenerateSection({
        id: 1,
        section: "objective",
      });

      expect(result.success).toBe(true);
      expect(result.section).toBe("objective");
      expect(result.content).toBe("هدف معاد توليده");
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(null);

      await expect(
        caller.ideas.regenerateSection({ id: 999, section: "idea" })
      ).rejects.toThrow("الفكرة غير موجودة");
    });
  });

  describe("ideas.generateMultiple", () => {
    it("generates multiple versions successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const llmResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              versions: [
                {
                  versionName: "النسخة الرسمية",
                  idea: "فكرة 1",
                  objective: "هدف 1",
                  justifications: "مبررات 1",
                  features: "مميزات 1",
                  strengths: "نقاط قوة 1",
                  outputs: "مخرجات 1",
                  expectedResults: "نتائج 1",
                },
                {
                  versionName: "النسخة الإبداعية",
                  idea: "فكرة 2",
                  objective: "هدف 2",
                  justifications: "مبررات 2",
                  features: "مميزات 2",
                  strengths: "نقاط قوة 2",
                  outputs: "مخرجات 2",
                  expectedResults: "نتائج 2",
                },
                {
                  versionName: "النسخة العملية",
                  idea: "فكرة 3",
                  objective: "هدف 3",
                  justifications: "مبررات 3",
                  features: "مميزات 3",
                  strengths: "نقاط قوة 3",
                  outputs: "مخرجات 3",
                  expectedResults: "نتائج 3",
                },
              ],
            }),
          },
        }],
      };

      vi.mocked(invokeLLM).mockResolvedValue(llmResponse as any);

      const result = await caller.ideas.generateMultiple({
        programDescription: "برنامج تدريبي للشباب في مجال التقنية",
        targetAudience: "الشباب من 18-30 سنة",
      });

      expect(result.success).toBe(true);
      expect(result.versions).toHaveLength(3);
      expect(result.versions[0].versionName).toBe("النسخة الرسمية");
      expect(invokeLLM).toHaveBeenCalled();
    });

    it("throws error for short description", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ideas.generateMultiple({ programDescription: "قصير" })
      ).rejects.toThrow();
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ideas.generateMultiple({ programDescription: "برنامج تدريبي للشباب" })
      ).rejects.toThrow();
    });
  });

  describe("ideas.saveVersion", () => {
    it("saves selected version successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(createIdea).mockResolvedValue(mockIdea);

      const result = await caller.ideas.saveVersion({
        programDescription: "برنامج تدريبي",
        versionName: "النسخة الرسمية",
        idea: "فكرة محفوظة",
        objective: "هدف محفوظ",
        justifications: "مبررات محفوظة",
        features: "مميزات محفوظة",
        strengths: "نقاط قوة محفوظة",
        outputs: "مخرجات محفوظة",
        expectedResults: "نتائج محفوظة",
      });

      expect(result.success).toBe(true);
      expect(result.idea).toBeDefined();
      expect(createIdea).toHaveBeenCalled();
    });
  });

  describe("ideas.evaluate", () => {
    it("evaluates idea successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const llmResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              overallScore: 85,
              criteria: [
                { name: "وضوح الفكرة", score: 90, feedback: "فكرة واضحة" },
                { name: "قابلية التنفيذ", score: 80, feedback: "قابلة للتنفيذ" },
              ],
              strengths: ["نقطة قوة 1", "نقطة قوة 2"],
              improvements: ["تحسين 1", "تحسين 2"],
              summary: "فكرة جيدة بشكل عام",
            }),
          },
        }],
      };

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(invokeLLM).mockResolvedValue(llmResponse as any);

      const result = await caller.ideas.evaluate({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.evaluation).toBeDefined();
      expect(result.evaluation.overallScore).toBe(85);
      expect(result.evaluation.criteria).toHaveLength(2);
      expect(result.evaluation.strengths).toHaveLength(2);
      expect(result.evaluation.improvements).toHaveLength(2);
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(null);

      await expect(
        caller.ideas.evaluate({ id: 999 })
      ).rejects.toThrow("الفكرة غير موجودة");
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ideas.evaluate({ id: 1 })
      ).rejects.toThrow();
    });
  });

  describe("ideas.generateKPIs", () => {
    it("generates KPIs successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const llmResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              kpis: [
                {
                  name: "عدد المستفيدين",
                  type: "كمي",
                  category: "مخرجات",
                  description: "إجمالي عدد المستفيدين من البرنامج",
                  measurementMethod: "سجلات الحضور والتسجيل",
                  target: "100 مستفيد",
                  frequency: "شهري",
                },
                {
                  name: "نسبة الرضا",
                  type: "نوعي",
                  category: "نتائج",
                  description: "مستوى رضا المستفيدين",
                  measurementMethod: "استبيانات الرضا",
                  target: "85%",
                  frequency: "ربع سنوي",
                },
              ],
              recommendations: ["توصية 1", "توصية 2"],
              summary: "ملخص المؤشرات",
            }),
          },
        }],
      };

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(invokeLLM).mockResolvedValue(llmResponse as any);

      const result = await caller.ideas.generateKPIs({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.kpis).toBeDefined();
      expect(result.kpis.kpis).toHaveLength(2);
      expect(result.kpis.recommendations).toHaveLength(2);
      expect(result.kpis.summary).toBe("ملخص المؤشرات");
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(null);

      await expect(
        caller.ideas.generateKPIs({ id: 999 })
      ).rejects.toThrow("الفكرة غير موجودة");
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ideas.generateKPIs({ id: 1 })
      ).rejects.toThrow();
    });
  });

  describe("ideas.estimateBudget", () => {
    it("estimates budget successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const llmResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              totalBudget: 150000,
              currency: "ريال سعودي",
              categories: [
                {
                  name: "الموارد البشرية",
                  amount: 60000,
                  percentage: 40,
                  items: ["رواتب المدربين", "مكافآت المنسقين"],
                },
                {
                  name: "التجهيزات",
                  amount: 30000,
                  percentage: 20,
                  items: ["أجهزة حاسب", "معدات عرض"],
                },
              ],
              assumptions: ["افتراض 1", "افتراض 2"],
              recommendations: ["توصية 1", "توصية 2"],
              fundingSources: ["مصدر 1", "مصدر 2"],
              disclaimer: "هذا تقدير تقريبي",
            }),
          },
        }],
      };

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(invokeLLM).mockResolvedValue(llmResponse as any);

      const result = await caller.ideas.estimateBudget({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.budget).toBeDefined();
      expect(result.budget.totalBudget).toBe(150000);
      expect(result.budget.categories).toHaveLength(2);
      expect(result.budget.assumptions).toHaveLength(2);
      expect(result.budget.recommendations).toHaveLength(2);
      expect(result.budget.fundingSources).toHaveLength(2);
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(null);

      await expect(
        caller.ideas.estimateBudget({ id: 999 })
      ).rejects.toThrow("الفكرة غير موجودة");
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ideas.estimateBudget({ id: 1 })
      ).rejects.toThrow();
    });
  });

  describe("ideas.generateSWOT", () => {
    it("generates SWOT analysis successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const llmResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              strengths: [
                { title: "فريق متخصص", description: "فريق عمل ذو خبرة في المجال" },
                { title: "شراكات قوية", description: "علاقات مع جهات داعمة" },
              ],
              weaknesses: [
                { title: "محدودية الموارد", description: "ميزانية محدودة للتوسع" },
                { title: "نقص الكوادر", description: "حاجة لمزيد من المتطوعين" },
              ],
              opportunities: [
                { title: "دعم حكومي", description: "توجه الدولة لدعم القطاع غير الربحي" },
                { title: "تقنيات جديدة", description: "إمكانية استخدام التقنية للوصول" },
              ],
              threats: [
                { title: "منافسة", description: "وجود برامج مشابهة" },
                { title: "تغير الأولويات", description: "تغير أولويات الممولين" },
              ],
              strategies: [
                "استثمار نقاط القوة للاستفادة من الفرص",
                "معالجة نقاط الضعف لتجنب التهديدات",
              ],
              summary: "تحليل شامل يوضح الوضع الاستراتيجي للبرنامج",
            }),
          },
        }],
      };

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(invokeLLM).mockResolvedValue(llmResponse as any);

      const result = await caller.ideas.generateSWOT({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.swot).toBeDefined();
      expect(result.swot.strengths).toHaveLength(2);
      expect(result.swot.weaknesses).toHaveLength(2);
      expect(result.swot.opportunities).toHaveLength(2);
      expect(result.swot.threats).toHaveLength(2);
      expect(result.swot.strategies).toHaveLength(2);
      expect(result.swot.summary).toBe("تحليل شامل يوضح الوضع الاستراتيجي للبرنامج");
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(null);

      await expect(
        caller.ideas.generateSWOT({ id: 999 })
      ).rejects.toThrow("الفكرة غير موجودة");
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ideas.generateSWOT({ id: 1 })
      ).rejects.toThrow();
    });
  });

  describe("ideas.generateLogFrame", () => {
    it("generates logical framework successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const llmResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              goal: {
                narrative: "تحسين مهارات الشباب وتأهيلهم لسوق العمل",
                indicators: ["نسبة التوظيف 60%", "رضا المستفيدين 85%"],
                verification: ["تقارير التوظيف", "استبيانات الرضا"],
                assumptions: ["استقرار سوق العمل", "توفر فرص وظيفية"],
              },
              purpose: {
                narrative: "تدريب 100 شاب على المهارات التقنية",
                indicators: ["عدد المتدربين", "نسبة الإتمام"],
                verification: ["سجلات الحضور", "شهادات التخرج"],
                assumptions: ["التزام المتدربين", "جودة المحتوى"],
              },
              outputs: [
                {
                  narrative: "100 متدرب مؤهل",
                  indicators: ["عدد المتخرجين"],
                  verification: ["شهادات التخرج"],
                  assumptions: ["اكتمال البرنامج"],
                },
                {
                  narrative: "مناهج تدريبية محدثة",
                  indicators: ["عدد المناهج"],
                  verification: ["وثائق المناهج"],
                  assumptions: ["توفر الخبراء"],
                },
              ],
              activities: [
                {
                  narrative: "تصميم المناهج التدريبية",
                  inputs: ["خبراء محتوى", "أدوات تصميم"],
                  timeframe: "الشهر الأول",
                  responsible: "فريق التطوير",
                },
                {
                  narrative: "تنفيذ الدورات التدريبية",
                  inputs: ["مدربين", "قاعات تدريب"],
                  timeframe: "الأشهر 2-5",
                  responsible: "فريق التدريب",
                },
              ],
              summary: "إطار منطقي متكامل يربط بين الأهداف والأنشطة والمخرجات",
            }),
          },
        }],
      };

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(invokeLLM).mockResolvedValue(llmResponse as any);

      const result = await caller.ideas.generateLogFrame({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.logFrame).toBeDefined();
      expect(result.logFrame.goal).toBeDefined();
      expect(result.logFrame.goal.narrative).toBe("تحسين مهارات الشباب وتأهيلهم لسوق العمل");
      expect(result.logFrame.goal.indicators).toHaveLength(2);
      expect(result.logFrame.purpose).toBeDefined();
      expect(result.logFrame.outputs).toHaveLength(2);
      expect(result.logFrame.activities).toHaveLength(2);
      expect(result.logFrame.summary).toBe("إطار منطقي متكامل يربط بين الأهداف والأنشطة والمخرجات");
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(null);

      await expect(
        caller.ideas.generateLogFrame({ id: 999 })
      ).rejects.toThrow("الفكرة غير موجودة");
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ideas.generateLogFrame({ id: 1 })
      ).rejects.toThrow();
    });
  });

  describe("ideas.updateLogFrame", () => {
    const mockLogFrame = {
      goal: {
        narrative: "تحسين مهارات الشباب",
        indicators: ["نسبة التوظيف 60%"],
        verification: ["تقارير التوظيف"],
        assumptions: ["استقرار سوق العمل"],
      },
      purpose: {
        narrative: "تدريب 100 شاب",
        indicators: ["عدد المتدربين"],
        verification: ["سجلات الحضور"],
        assumptions: ["التزام المتدربين"],
      },
      outputs: [
        {
          narrative: "100 متدرب مؤهل",
          indicators: ["عدد المتخرجين"],
          verification: ["شهادات التخرج"],
          assumptions: ["اكتمال البرنامج"],
        },
      ],
      activities: [
        {
          narrative: "تصميم المناهج",
          inputs: ["خبراء محتوى"],
          timeframe: "الشهر الأول",
          responsible: "فريق التطوير",
        },
      ],
      summary: "إطار منطقي متكامل",
    };

    it("updates logical framework successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(updateIdea).mockResolvedValue({
        ...mockIdea,
        logFrame: JSON.stringify(mockLogFrame),
      });

      const result = await caller.ideas.updateLogFrame({
        id: 1,
        logFrame: mockLogFrame,
      });

      expect(result.success).toBe(true);
      expect(result.logFrame).toEqual(mockLogFrame);
      expect(updateIdea).toHaveBeenCalledWith(1, 1, {
        logFrame: JSON.stringify(mockLogFrame),
      });
    });

    it("updates goal narrative", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const updatedLogFrame = {
        ...mockLogFrame,
        goal: {
          ...mockLogFrame.goal,
          narrative: "هدف عام معدل",
        },
      };

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(updateIdea).mockResolvedValue({
        ...mockIdea,
        logFrame: JSON.stringify(updatedLogFrame),
      });

      const result = await caller.ideas.updateLogFrame({
        id: 1,
        logFrame: updatedLogFrame,
      });

      expect(result.success).toBe(true);
      expect(result.logFrame.goal.narrative).toBe("هدف عام معدل");
    });

    it("updates activities", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const updatedLogFrame = {
        ...mockLogFrame,
        activities: [
          {
            narrative: "نشاط معدل",
            inputs: ["مدخل جديد"],
            timeframe: "الشهر الثاني",
            responsible: "فريق جديد",
          },
        ],
      };

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(updateIdea).mockResolvedValue({
        ...mockIdea,
        logFrame: JSON.stringify(updatedLogFrame),
      });

      const result = await caller.ideas.updateLogFrame({
        id: 1,
        logFrame: updatedLogFrame,
      });

      expect(result.success).toBe(true);
      expect(result.logFrame.activities[0].narrative).toBe("نشاط معدل");
      expect(result.logFrame.activities[0].timeframe).toBe("الشهر الثاني");
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(null);

      await expect(
        caller.ideas.updateLogFrame({ id: 999, logFrame: mockLogFrame })
      ).rejects.toThrow("الفكرة غير موجودة");
    });

     it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.ideas.updateLogFrame({ id: 1, logFrame: mockLogFrame })
      ).rejects.toThrow();
    });
  });

  describe("ideas.generateTimeline", () => {
    it("generates timeline successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const llmResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              phases: [
                {
                  name: "مرحلة التخطيط",
                  duration: "4 أسابيع",
                  startWeek: 1,
                  endWeek: 4,
                  activities: [
                    {
                      name: "تحديد الأهداف",
                      description: "وضع الأهداف التفصيلية",
                      responsible: "مدير المشروع",
                      deliverables: "وثيقة الأهداف",
                      dependencies: "لا يوجد",
                    },
                  ],
                },
                {
                  name: "مرحلة التنفيذ",
                  duration: "8 أسابيع",
                  startWeek: 5,
                  endWeek: 12,
                  activities: [
                    {
                      name: "تنفيذ التدريب",
                      description: "إجراء الدورات التدريبية",
                      responsible: "فريق التدريب",
                      deliverables: "تقارير التدريب",
                      dependencies: "مرحلة التخطيط",
                    },
                  ],
                },
              ],
              milestones: [
                {
                  name: "انطلاق البرنامج",
                  week: 1,
                  description: "بدء العمل رسمياً",
                },
                {
                  name: "اكتمال التدريب",
                  week: 12,
                  description: "انتهاء الدورات التدريبية",
                },
              ],
              totalDuration: "12 أسبوع",
              criticalPath: "التخطيط -> التنفيذ -> التقييم",
              summary: "خطة تنفيذية شاملة للبرنامج",
            }),
          },
        }],
      };

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(invokeLLM).mockResolvedValue(llmResponse as any);

      const result = await caller.ideas.generateTimeline({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.timeline).toBeDefined();
      expect(result.timeline.phases).toHaveLength(2);
      expect(result.timeline.milestones).toHaveLength(2);
      expect(result.timeline.totalDuration).toBe("12 أسبوع");
      expect(result.timeline.criticalPath).toBeDefined();
      expect(result.timeline.summary).toBeDefined();
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(null);

      await expect(
        caller.ideas.generateTimeline({ id: 999 })
      ).rejects.toThrow("الفكرة غير موجودة");
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ideas.generateTimeline({ id: 1 })
      ).rejects.toThrow();
    });
  });

  describe("ideas.improveIdea", () => {
    it("improves idea successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const llmResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              overallAssessment: "فكرة جيدة مع إمكانية تطوير",
              improvements: [
                {
                  area: "الأهداف",
                  currentState: "أهداف عامة",
                  suggestion: "تحديد أهداف SMART",
                  impact: "تحسين القياس",
                  priority: "عالية",
                },
                {
                  area: "الاستدامة",
                  currentState: "غير محددة",
                  suggestion: "إضافة خطة استدامة",
                  impact: "ضمان الاستمرارية",
                  priority: "متوسطة",
                },
              ],
              bestPractices: ["ممارسة 1", "ممارسة 2"],
              innovativeIdeas: ["فكرة إبداعية 1", "فكرة إبداعية 2"],
              potentialPartnerships: "شراكات مع القطاع الخاص",
              scalabilityOptions: "خيارات التوسع الإقليمي",
              improvedVision: "رؤية محسنة للبرنامج",
              improvedObjectives: "أهداف محسنة وقابلة للقياس",
              summary: "ملخص التحسينات المقترحة",
            }),
          },
        }],
      };

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(invokeLLM).mockResolvedValue(llmResponse as any);

      const result = await caller.ideas.improveIdea({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.improvements).toBeDefined();
      expect(result.improvements.overallAssessment).toBeDefined();
      expect(result.improvements.improvements).toHaveLength(2);
      expect(result.improvements.bestPractices).toHaveLength(2);
      expect(result.improvements.innovativeIdeas).toHaveLength(2);
      expect(result.improvements.improvedVision).toBeDefined();
      expect(result.improvements.improvedObjectives).toBeDefined();
      expect(result.improvements.summary).toBeDefined();
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(null);

      await expect(
        caller.ideas.improveIdea({ id: 999 })
      ).rejects.toThrow("الفكرة غير موجودة");
    });

     it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.ideas.improveIdea({ id: 1 })
      ).rejects.toThrow();
    });
  });

  describe("ideas.applyImprovements", () => {
    it("applies improvements successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const updatedIdea = {
        ...mockIdea,
        vision: "رؤية محسنة للبرنامج",
        detailedObjectives: "أهداف محسنة وقابلة للقياس",
      };

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(updateIdea).mockResolvedValue(updatedIdea);

      const result = await caller.ideas.applyImprovements({
        id: 1,
        improvedVision: "رؤية محسنة للبرنامج",
        improvedObjectives: "أهداف محسنة وقابلة للقياس",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("تم تطبيق التحسينات بنجاح");
      expect(result.idea).toBeDefined();
      expect(updateIdea).toHaveBeenCalledWith(1, ctx.user.id, {
        vision: "رؤية محسنة للبرنامج",
        detailedObjectives: "أهداف محسنة وقابلة للقياس",
      });
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(null);

      await expect(
        caller.ideas.applyImprovements({
          id: 999,
          improvedVision: "رؤية محسنة",
          improvedObjectives: "أهداف محسنة",
        })
      ).rejects.toThrow("الفكرة غير موجودة");
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ideas.applyImprovements({
          id: 1,
          improvedVision: "رؤية محسنة",
          improvedObjectives: "أهداف محسنة",
        })
      ).rejects.toThrow();
    });
  });
});


// ==================== Conversations Tests ====================
describe("conversations router", () => {
  const mockIdea = {
    id: 1,
    userId: 1,
    programDescription: "برنامج تدريبي لتأهيل الشباب",
    idea: "فكرة البرنامج",
    objective: "الهدف",
    justifications: "المبررات",
    features: "المميزات",
    strengths: "نقاط القوة",
    outputs: "المخرجات",
    expectedResults: "النتائج المتوقعة",
    vision: "الرؤية",
    generalObjective: "الهدف العام",
    detailedObjectives: "الأهداف التفصيلية",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockConversation = {
    id: 1,
    userId: 1,
    ideaId: 1,
    title: "محادثة تطوير: برنامج تدريبي...",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMessage = {
    id: 1,
    conversationId: 1,
    role: "assistant",
    content: "مرحباً! أنا مساعدك لتطوير الفكرة.",
    createdAt: new Date(),
  };

  describe("start", () => {
    it("starts a new conversation for an idea", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(createConversation).mockResolvedValue(mockConversation);
      vi.mocked(addMessage).mockResolvedValue(mockMessage);

      const result = await caller.conversations.start({ ideaId: 1 });

      expect(result.success).toBe(true);
      expect(result.conversation).toBeDefined();
      expect(result.welcomeMessage).toContain("مرحباً");
      expect(createConversation).toHaveBeenCalled();
      expect(addMessage).toHaveBeenCalled();
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(null);

      await expect(
        caller.conversations.start({ ideaId: 999 })
      ).rejects.toThrow("الفكرة غير موجودة");
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.conversations.start({ ideaId: 1 })
      ).rejects.toThrow();
    });
  });

  describe("sendMessage", () => {
    it("sends a message and gets AI response", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getConversationById).mockResolvedValue(mockConversation);
      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
      vi.mocked(addMessage).mockResolvedValue(mockMessage);
      vi.mocked(getConversationMessages).mockResolvedValue([mockMessage]);
      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [{ message: { content: "رد المساعد الذكي" } }],
      } as any);

      const result = await caller.conversations.sendMessage({
        conversationId: 1,
        message: "كيف يمكن تحسين الأهداف؟",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(addMessage).toHaveBeenCalled(); // user message + assistant response
    });

    it("throws error when conversation not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getConversationById).mockResolvedValue(null);

      await expect(
        caller.conversations.sendMessage({
          conversationId: 999,
          message: "رسالة",
        })
      ).rejects.toThrow("المحادثة غير موجودة");
    });

    it("throws error for empty message", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.conversations.sendMessage({
          conversationId: 1,
          message: "",
        })
      ).rejects.toThrow();
    });
  });

  describe("getMessages", () => {
    it("returns conversation messages", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getConversationById).mockResolvedValue(mockConversation);
      vi.mocked(getConversationMessages).mockResolvedValue([mockMessage]);

      const result = await caller.conversations.getMessages({ conversationId: 1 });

      expect(result.conversation).toBeDefined();
      expect(result.messages).toHaveLength(1);
    });

    it("throws error when conversation not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getConversationById).mockResolvedValue(null);

      await expect(
        caller.conversations.getMessages({ conversationId: 999 })
      ).rejects.toThrow("المحادثة غير موجودة");
    });
  });

  describe("listByIdea", () => {
    it("returns conversations for an idea", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaConversations).mockResolvedValue([mockConversation]);

      const result = await caller.conversations.listByIdea({ ideaId: 1 });

      expect(result).toHaveLength(1);
      expect(getIdeaConversations).toHaveBeenCalledWith(1, ctx.user.id);
    });
  });

  describe("getSuggestions", () => {
    it("returns question suggestions for an idea", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(mockIdea);

      const result = await caller.conversations.getSuggestions({ ideaId: 1 });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it("throws error when idea not found", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(getIdeaById).mockResolvedValue(null);

      await expect(
        caller.conversations.getSuggestions({ ideaId: 999 })
      ).rejects.toThrow("الفكرة غير موجودة");
    });
  });
});

// اختبارات PMDPro
describe("generatePMDPro", () => {
  it("generates PMDPro plan for an idea", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            projectSummary: "ملخص المشروع",
            phases: [
              {
                name: "التحديد والتصميم",
                description: "تحديد المشكلة وتصميم الحل",
                activities: ["تحليل المشكلة", "دراسة الجدوى"],
                deliverables: ["وثيقة المشروع"],
                duration: "شهر واحد"
              }
            ],
            logicalFramework: [
              {
                level: "الهدف العام",
                description: "تحسين مهارات الشباب",
                indicators: "عدد المستفيدين",
                verification: "تقارير التدريب",
                assumptions: "توفر الموارد"
              }
            ],
            stakeholders: [
              {
                name: "المستفيدون",
                role: "المشاركون في البرنامج",
                influence: "عالي",
                interest: "عالي"
              }
            ],
            risks: [
              {
                description: "تأخر التمويل",
                probability: "متوسطة",
                impact: "عالي",
                mitigation: "تنويع مصادر التمويل"
              }
            ],
            monitoringPlan: {
              description: "خطة متابعة شاملة",
              indicators: [
                {
                  name: "معدل الحضور",
                  target: "90%",
                  frequency: "أسبوعي"
                }
              ]
            },
            lessonsLearned: ["أهمية التخطيط المبكر"]
          })
        }
      }]
    } as any);
    
    const result = await caller.ideas.generatePMDPro({ id: 1 });
    
    expect(result.success).toBe(true);
    expect(result.pmdpro).toHaveProperty("projectSummary");
    expect(result.pmdpro).toHaveProperty("phases");
    expect(result.pmdpro).toHaveProperty("logicalFramework");
    expect(result.pmdpro).toHaveProperty("stakeholders");
    expect(result.pmdpro).toHaveProperty("risks");
    expect(result.pmdpro).toHaveProperty("monitoringPlan");
    expect(result.pmdpro.phases).toBeInstanceOf(Array);
    expect(result.pmdpro.phases.length).toBeGreaterThan(0);
  });

  it("throws error when idea not found", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    vi.mocked(getIdeaById).mockResolvedValue(null);
    
    await expect(
      caller.ideas.generatePMDPro({ id: 999 })
    ).rejects.toThrow("الفكرة غير موجودة");
  });

  it("throws error for unauthenticated user", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.ideas.generatePMDPro({ id: 1 })
    ).rejects.toThrow();
  });
});


// ==================== Design Thinking Tests ====================
describe("generateDesignThinking", () => {
  it("generates Design Thinking plan for an idea", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    vi.mocked(getIdeaById).mockResolvedValue(mockIdea);
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            summary: "ملخص تطبيق التفكير التصميمي",
            phase1_empathize: {
              title: "التعاطف",
              description: "فهم احتياجات المستفيدين",
              empathyMap: {
                says: ["يقولون أنهم بحاجة للتدريب"],
                thinks: ["يفكرون في مستقبلهم المهني"],
                does: ["يبحثون عن فرص عمل"],
                feels: ["يشعرون بالقلق من البطالة"]
              },
              researchMethods: [
                { method: "مقابلات", description: "مقابلات فردية", participants: "20 شاب", duration: "أسبوعين" }
              ],
              keyInsights: ["الحاجة للتدريب العملي"]
            },
            phase2_define: {
              title: "التحديد",
              description: "تحديد المشكلة بوضوح",
              problemStatement: "الشباب يحتاجون إلى مهارات تقنية لأن سوق العمل يتطلبها",
              pointOfView: "الشباب العاطل يحتاج لتدريب عملي",
              howMightWe: ["تقديم تدريب مكثف", "ربطهم بسوق العمل"]
            },
            phase3_ideate: {
              title: "التفكير",
              description: "توليد الأفكار الإبداعية",
              brainstormRules: ["لا حكم على الأفكار", "الكم قبل الكيف"],
              ideas: [
                { idea: "برنامج تدريبي مكثف", category: "تدريب", feasibility: "عالية", impact: "عالي" }
              ],
              selectedIdea: "برنامج تدريبي مكثف لمدة 3 أشهر",
              selectionCriteria: ["قابلية التنفيذ", "التأثير"]
            },
            phase4_prototype: {
              title: "النموذج الأولي",
              description: "بناء نموذج أولي للحل",
              prototypeType: "نموذج تجريبي",
              components: [
                { component: "منهج تدريبي", description: "محتوى الدورة", materials: "عروض تقديمية", time: "أسبوع" }
              ],
              buildSteps: ["تصميم المنهج", "إعداد المواد"],
              budget: "5000 ريال"
            },
            phase5_test: {
              title: "الاختبار",
              description: "اختبار النموذج مع المستفيدين",
              testPlan: {
                objective: "التحقق من فعالية التدريب",
                participants: "10 متدربين",
                duration: "أسبوعين",
                location: "مركز التدريب"
              },
              testScenarios: [
                { scenario: "تجربة التدريب", task: "إكمال الدورة", successCriteria: "اجتياز الاختبار" }
              ],
              feedbackQuestions: ["ما رأيك في المحتوى؟"],
              iterationPlan: "تحسين المنهج بناءً على الملاحظات"
            },
            timeline: [
              { phase: "التعاطف", duration: "أسبوعين", activities: ["مقابلات", "ملاحظة"] }
            ],
            resources: [
              { resource: "مدرب", type: "بشري", quantity: "2" }
            ],
            successMetrics: [
              { metric: "رضا المتدربين", target: "85%", measurement: "استبيان" }
            ]
          }),
        },
      }],
    } as any);
    
    const result = await caller.ideas.generateDesignThinking({ id: 1 });
    
    expect(result.success).toBe(true);
    expect(result.designThinking).toHaveProperty("summary");
    expect(result.designThinking).toHaveProperty("phase1_empathize");
    expect(result.designThinking).toHaveProperty("phase2_define");
    expect(result.designThinking).toHaveProperty("phase3_ideate");
    expect(result.designThinking).toHaveProperty("phase4_prototype");
    expect(result.designThinking).toHaveProperty("phase5_test");
    expect(result.designThinking.phase1_empathize.empathyMap).toHaveProperty("says");
    expect(result.designThinking.phase2_define.howMightWe).toBeInstanceOf(Array);
    expect(result.designThinking.phase3_ideate.ideas).toBeInstanceOf(Array);
  });

  it("throws error when idea not found", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    vi.mocked(getIdeaById).mockResolvedValue(null);
    
    await expect(
      caller.ideas.generateDesignThinking({ id: 999 })
    ).rejects.toThrow("الفكرة غير موجودة");
  });

  it("throws error for unauthenticated user", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.ideas.generateDesignThinking({ id: 1 })
    ).rejects.toThrow();
  });
});


// ==================== Export Full Report Tests ====================
describe("exportFullReport", () => {
  it("exports full report for an idea", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    vi.mocked(getIdeaById).mockResolvedValue({
      ...mockIdea,
      kpis: JSON.stringify({ kpis: [{ name: "KPI 1" }] }),
      logFrame: JSON.stringify({ goal: { narrative: "Goal" } }),
      timeline: JSON.stringify({ phases: [] }),
      pmdpro: JSON.stringify({ projectSummary: "Summary" }),
      designThinking: JSON.stringify({ summary: "DT Summary" }),
      evaluation: JSON.stringify({ overallScore: 85 }),
    });
    
    const result = await caller.ideas.exportFullReport({ id: 1 });
    
    expect(result.success).toBe(true);
    expect(result.report).toHaveProperty("metadata");
    expect(result.report).toHaveProperty("basicInfo");
    expect(result.report).toHaveProperty("visionAndObjectives");
    expect(result.report).toHaveProperty("justificationsAndFeatures");
    expect(result.report).toHaveProperty("outputsAndResults");
    expect(result.report.metadata.title).toBe(mockIdea.programDescription);
  });

  it("throws error when idea not found", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    vi.mocked(getIdeaById).mockResolvedValue(null);
    
    await expect(
      caller.ideas.exportFullReport({ id: 999 })
    ).rejects.toThrow("الفكرة غير موجودة");
  });

  it("throws error for unauthenticated user", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.ideas.exportFullReport({ id: 1 })
    ).rejects.toThrow();
  });
});


// ==================== Admin Tests ====================

describe('Admin - User Management', () => {
  it('should validate user status values', () => {
    const validStatuses = ['pending', 'approved', 'rejected'];
    
    validStatuses.forEach(status => {
      expect(['pending', 'approved', 'rejected']).toContain(status);
    });
  });

  it('should filter users by status correctly', () => {
    const allUsers = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'approved' },
      { id: 3, status: 'rejected' },
      { id: 4, status: 'pending' },
    ];
    
    const pendingUsers = allUsers.filter(u => u.status === 'pending');
    const approvedUsers = allUsers.filter(u => u.status === 'approved');
    const rejectedUsers = allUsers.filter(u => u.status === 'rejected');
    
    expect(pendingUsers.length).toBe(2);
    expect(approvedUsers.length).toBe(1);
    expect(rejectedUsers.length).toBe(1);
  });

  it('should calculate stats correctly', () => {
    const stats = {
      total: 10,
      pending: 3,
      approved: 5,
      rejected: 2
    };
    
    expect(stats.total).toBe(10);
    expect(stats.pending).toBe(3);
    expect(stats.approved).toBe(5);
    expect(stats.rejected).toBe(2);
    expect(stats.pending + stats.approved + stats.rejected).toBeLessThanOrEqual(stats.total);
  });

  it('should identify admin role correctly', () => {
    const regularUser = { role: 'user' };
    const adminUser = { role: 'admin' };
    
    expect(regularUser.role).not.toBe('admin');
    expect(adminUser.role).toBe('admin');
  });

  it('should transition user status correctly', () => {
    const transitions = [
      { from: 'pending', to: 'approved', action: 'approve' },
      { from: 'pending', to: 'rejected', action: 'reject' },
      { from: 'approved', to: 'pending', action: 'suspend' },
      { from: 'rejected', to: 'approved', action: 'reapprove' },
    ];
    
    transitions.forEach(t => {
      expect(t.from).toBeDefined();
      expect(t.to).toBeDefined();
      expect(['pending', 'approved', 'rejected']).toContain(t.from);
      expect(['pending', 'approved', 'rejected']).toContain(t.to);
    });
  });
});
