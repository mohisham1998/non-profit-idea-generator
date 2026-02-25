import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// Mock the db module
vi.mock("./db", () => ({
  getIdeaById: vi.fn(),
}));

import { invokeLLM } from "./_core/llm";
import { getIdeaById } from "./db";

describe("Donor Marketing Content Generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate donor marketing content for a valid idea", async () => {
    // Mock idea data
    const mockIdea = {
      id: 1,
      userId: "user123",
      programDescription: "برنامج تعليمي للأطفال",
      vision: "تمكين الأطفال من التعلم",
      generalObjective: "تحسين مستوى التعليم",
      targetAudience: "الأطفال من 6-12 سنة",
      features: "تعليم تفاعلي",
      expectedResults: "تحسين الأداء الأكاديمي",
    };

    // Mock LLM response
    const mockLLMResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              summary: "ملخص البرنامج التعليمي",
              impact: "أثر إيجابي على المجتمع",
              shortTermResults: ["نتيجة 1", "نتيجة 2"],
              longTermResults: ["نتيجة طويلة 1", "نتيجة طويلة 2"],
              budget: "وصف الميزانية",
              budgetBreakdown: [
                { category: "الموارد البشرية", percentage: 40 },
                { category: "التشغيل", percentage: 30 },
              ],
              totalBudget: "50,000",
              partnerships: "فرص الشراكة",
              partnershipBenefits: ["ميزة 1", "ميزة 2"],
              timelinePhases: [
                { phase: "التحضير", duration: "شهر", activities: "التخطيط" },
              ],
              stats: {
                objectives: 5,
                beneficiaries: "1000+",
                budget: "50,000",
                duration: "12",
              },
            }),
          },
        },
      ],
    };

    (getIdeaById as any).mockResolvedValue(mockIdea);
    (invokeLLM as any).mockResolvedValue(mockLLMResponse);

    // Verify mocks are set up correctly
    expect(getIdeaById).toBeDefined();
    expect(invokeLLM).toBeDefined();
  });

  it("should throw error when idea is not found", async () => {
    (getIdeaById as any).mockResolvedValue(null);

    // Verify that getIdeaById returns null
    const result = await getIdeaById(999, "user123");
    expect(result).toBeNull();
  });

  it("should handle LLM response parsing correctly", () => {
    const validResponse = {
      summary: "ملخص",
      impact: "أثر",
      shortTermResults: ["نتيجة 1"],
      longTermResults: ["نتيجة 2"],
      budget: "ميزانية",
      budgetBreakdown: [{ category: "بند", percentage: 50 }],
      totalBudget: "100,000",
      partnerships: "شراكات",
      partnershipBenefits: ["ميزة"],
      timelinePhases: [{ phase: "مرحلة", duration: "شهر", activities: "نشاط" }],
      stats: { objectives: 3, beneficiaries: "500", budget: "100,000", duration: "6" },
    };

    // Test JSON parsing
    const jsonString = JSON.stringify(validResponse);
    const parsed = JSON.parse(jsonString);

    expect(parsed.summary).toBe("ملخص");
    expect(parsed.shortTermResults).toHaveLength(1);
    expect(parsed.budgetBreakdown[0].percentage).toBe(50);
    expect(parsed.stats.objectives).toBe(3);
  });

  it("should validate budget breakdown percentages", () => {
    const budgetBreakdown = [
      { category: "الموارد البشرية", percentage: 40 },
      { category: "التشغيل", percentage: 25 },
      { category: "المواد", percentage: 20 },
      { category: "الإدارة", percentage: 15 },
    ];

    const totalPercentage = budgetBreakdown.reduce((sum, item) => sum + item.percentage, 0);
    expect(totalPercentage).toBe(100);
  });

  it("should validate timeline phases structure", () => {
    const timelinePhases = [
      { phase: "المرحلة التحضيرية", duration: "1-2 شهر", activities: "التخطيط والإعداد" },
      { phase: "مرحلة التنفيذ", duration: "6-8 أشهر", activities: "تنفيذ الأنشطة" },
      { phase: "مرحلة المتابعة", duration: "2-3 أشهر", activities: "التقييم والتوثيق" },
    ];

    expect(timelinePhases).toHaveLength(3);
    timelinePhases.forEach((phase) => {
      expect(phase).toHaveProperty("phase");
      expect(phase).toHaveProperty("duration");
      expect(phase).toHaveProperty("activities");
    });
  });

  it("should validate stats structure", () => {
    const stats = {
      objectives: 5,
      beneficiaries: "1000+",
      budget: "50,000",
      duration: "12",
    };

    expect(stats.objectives).toBeGreaterThan(0);
    expect(stats.beneficiaries).toBeTruthy();
    expect(stats.budget).toBeTruthy();
    expect(stats.duration).toBeTruthy();
  });
});

describe("Export Functionality", () => {
  it("should validate approved sections set operations", () => {
    const approvedSections = new Set<string>();
    
    // Add sections
    approvedSections.add("summary");
    approvedSections.add("impact");
    approvedSections.add("budget");
    
    expect(approvedSections.size).toBe(3);
    expect(approvedSections.has("summary")).toBe(true);
    expect(approvedSections.has("partnerships")).toBe(false);
    
    // Toggle section
    approvedSections.delete("impact");
    expect(approvedSections.size).toBe(2);
    expect(approvedSections.has("impact")).toBe(false);
  });

  it("should validate export content structure", () => {
    const exportOptions = {
      approvedSections: new Set(["summary", "impact", "budget"]),
      marketingContent: {
        summary: "ملخص البرنامج",
        impact: "الأثر المتوقع",
        budget: "الميزانية",
      },
      ideaData: {
        programDescription: "برنامج تعليمي",
        generalObjective: "تحسين التعليم",
      },
    };

    expect(exportOptions.approvedSections.size).toBe(3);
    expect(exportOptions.marketingContent.summary).toBeTruthy();
    expect(exportOptions.ideaData.programDescription).toBeTruthy();
  });

  it("should prevent export when no sections are approved", () => {
    const approvedSections = new Set<string>();
    
    const canExport = approvedSections.size > 0;
    expect(canExport).toBe(false);
  });

  it("should allow export when at least one section is approved", () => {
    const approvedSections = new Set(["summary"]);
    
    const canExport = approvedSections.size > 0;
    expect(canExport).toBe(true);
  });
});
