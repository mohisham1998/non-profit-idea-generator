import { describe, it, expect, vi } from 'vitest';
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
  getAllUsers: vi.fn(),
  getUsersByStatus: vi.fn(),
  updateUserStatus: vi.fn(),
  getUserStats: vi.fn(),
  getUserById: vi.fn(),
  getPermissions: vi.fn(),
  updatePermissions: vi.fn(),
  getAllSystemFeatures: vi.fn(),
  toggleSystemFeature: vi.fn(),
  getAllUsersWithPermissions: vi.fn(),
  updateUserPermission: vi.fn(),
  updateAllUserPermissions: vi.fn(),
  // Dashboard functions
  getOrCreateProjectTracking: vi.fn(),
  updateProjectTracking: vi.fn(),
  createProjectTask: vi.fn(),
  getProjectTasks: vi.fn(),
  updateProjectTask: vi.fn(),
  deleteProjectTask: vi.fn(),
  createBudgetItem: vi.fn(),
  getBudgetItems: vi.fn(),
  updateBudgetItem: vi.fn(),
  deleteBudgetItem: vi.fn(),
  createKpiItem: vi.fn(),
  getKpiItems: vi.fn(),
  updateKpiItem: vi.fn(),
  deleteKpiItem: vi.fn(),
  createRiskItem: vi.fn(),
  getRiskItems: vi.fn(),
  updateRiskItem: vi.fn(),
  deleteRiskItem: vi.fn(),
}));

import {
  getOrCreateProjectTracking,
  getProjectTasks,
  getBudgetItems,
  getKpiItems,
  getRiskItems,
} from "./db";

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
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

const caller = appRouter.createCaller(createAuthContext());

describe('Dashboard Charts Data Tests', () => {
  describe('Budget Distribution Data', () => {
    it('should return budget items with categories and amounts', async () => {
      const mockTracking = {
        id: 1,
        ideaId: 1,
        status: 'planning',
        overallProgress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockBudgetItems = [
        { id: 1, projectTrackingId: 1, category: 'الموارد البشرية', plannedAmount: 50000, actualAmount: 25000 },
        { id: 2, projectTrackingId: 1, category: 'المعدات', plannedAmount: 30000, actualAmount: 15000 },
        { id: 3, projectTrackingId: 1, category: 'التسويق', plannedAmount: 20000, actualAmount: 10000 },
      ];

      vi.mocked(getOrCreateProjectTracking).mockResolvedValue(mockTracking);
      vi.mocked(getProjectTasks).mockResolvedValue([]);
      vi.mocked(getBudgetItems).mockResolvedValue(mockBudgetItems as any);
      vi.mocked(getKpiItems).mockResolvedValue([]);
      vi.mocked(getRiskItems).mockResolvedValue([]);

      const result = await caller.dashboard.getFullDashboard({ ideaId: 1 });

      expect(result.budgetItems).toHaveLength(3);
      expect(result.budgetItems[0].category).toBe('الموارد البشرية');
      expect(result.budgetItems[0].plannedAmount).toBe(50000);
      expect(result.budgetItems[0].actualAmount).toBe(25000);
    });

    it('should handle empty budget items', async () => {
      const mockTracking = {
        id: 1,
        ideaId: 1,
        status: 'planning',
        overallProgress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getOrCreateProjectTracking).mockResolvedValue(mockTracking);
      vi.mocked(getProjectTasks).mockResolvedValue([]);
      vi.mocked(getBudgetItems).mockResolvedValue([]);
      vi.mocked(getKpiItems).mockResolvedValue([]);
      vi.mocked(getRiskItems).mockResolvedValue([]);

      const result = await caller.dashboard.getFullDashboard({ ideaId: 1 });

      expect(result.budgetItems).toHaveLength(0);
    });
  });

  describe('Task Status Data', () => {
    it('should return tasks with different statuses', async () => {
      const mockTracking = {
        id: 1,
        ideaId: 1,
        status: 'planning',
        overallProgress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTasks = [
        { id: 1, projectTrackingId: 1, title: 'مهمة 1', status: 'pending', priority: 'high' },
        { id: 2, projectTrackingId: 1, title: 'مهمة 2', status: 'in_progress', priority: 'medium' },
        { id: 3, projectTrackingId: 1, title: 'مهمة 3', status: 'completed', priority: 'low' },
        { id: 4, projectTrackingId: 1, title: 'مهمة 4', status: 'pending', priority: 'urgent' },
      ];

      vi.mocked(getOrCreateProjectTracking).mockResolvedValue(mockTracking);
      vi.mocked(getProjectTasks).mockResolvedValue(mockTasks as any);
      vi.mocked(getBudgetItems).mockResolvedValue([]);
      vi.mocked(getKpiItems).mockResolvedValue([]);
      vi.mocked(getRiskItems).mockResolvedValue([]);

      const result = await caller.dashboard.getFullDashboard({ ideaId: 1 });

      expect(result.tasks).toHaveLength(4);
      
      // التحقق من توزيع الحالات
      const pendingTasks = result.tasks.filter(t => t.status === 'pending');
      const inProgressTasks = result.tasks.filter(t => t.status === 'in_progress');
      const completedTasks = result.tasks.filter(t => t.status === 'completed');
      
      expect(pendingTasks).toHaveLength(2);
      expect(inProgressTasks).toHaveLength(1);
      expect(completedTasks).toHaveLength(1);
    });

    it('should return tasks with different priorities', async () => {
      const mockTracking = {
        id: 1,
        ideaId: 1,
        status: 'planning',
        overallProgress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTasks = [
        { id: 1, projectTrackingId: 1, title: 'مهمة عاجلة', status: 'pending', priority: 'urgent' },
        { id: 2, projectTrackingId: 1, title: 'مهمة عالية', status: 'pending', priority: 'high' },
        { id: 3, projectTrackingId: 1, title: 'مهمة متوسطة', status: 'pending', priority: 'medium' },
        { id: 4, projectTrackingId: 1, title: 'مهمة منخفضة', status: 'pending', priority: 'low' },
      ];

      vi.mocked(getOrCreateProjectTracking).mockResolvedValue(mockTracking);
      vi.mocked(getProjectTasks).mockResolvedValue(mockTasks as any);
      vi.mocked(getBudgetItems).mockResolvedValue([]);
      vi.mocked(getKpiItems).mockResolvedValue([]);
      vi.mocked(getRiskItems).mockResolvedValue([]);

      const result = await caller.dashboard.getFullDashboard({ ideaId: 1 });

      // التحقق من توزيع الأولويات
      const urgentTasks = result.tasks.filter(t => t.priority === 'urgent');
      const highTasks = result.tasks.filter(t => t.priority === 'high');
      const mediumTasks = result.tasks.filter(t => t.priority === 'medium');
      const lowTasks = result.tasks.filter(t => t.priority === 'low');
      
      expect(urgentTasks).toHaveLength(1);
      expect(highTasks).toHaveLength(1);
      expect(mediumTasks).toHaveLength(1);
      expect(lowTasks).toHaveLength(1);
    });

    it('should handle empty tasks', async () => {
      const mockTracking = {
        id: 1,
        ideaId: 1,
        status: 'planning',
        overallProgress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getOrCreateProjectTracking).mockResolvedValue(mockTracking);
      vi.mocked(getProjectTasks).mockResolvedValue([]);
      vi.mocked(getBudgetItems).mockResolvedValue([]);
      vi.mocked(getKpiItems).mockResolvedValue([]);
      vi.mocked(getRiskItems).mockResolvedValue([]);

      const result = await caller.dashboard.getFullDashboard({ ideaId: 1 });

      expect(result.tasks).toHaveLength(0);
    });
  });

  describe('Budget Comparison Data', () => {
    it('should calculate budget variance correctly', async () => {
      const mockTracking = {
        id: 1,
        ideaId: 1,
        status: 'planning',
        overallProgress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockBudgetItems = [
        { id: 1, projectTrackingId: 1, category: 'فئة 1', plannedAmount: 100000, actualAmount: 80000 },
        { id: 2, projectTrackingId: 1, category: 'فئة 2', plannedAmount: 50000, actualAmount: 60000 }, // تجاوز
      ];

      vi.mocked(getOrCreateProjectTracking).mockResolvedValue(mockTracking);
      vi.mocked(getProjectTasks).mockResolvedValue([]);
      vi.mocked(getBudgetItems).mockResolvedValue(mockBudgetItems as any);
      vi.mocked(getKpiItems).mockResolvedValue([]);
      vi.mocked(getRiskItems).mockResolvedValue([]);

      const result = await caller.dashboard.getFullDashboard({ ideaId: 1 });

      // التحقق من البيانات للمخطط الشريطي
      const totalPlanned = result.budgetItems.reduce((sum, item) => sum + Number(item.plannedAmount), 0);
      const totalActual = result.budgetItems.reduce((sum, item) => sum + Number(item.actualAmount), 0);
      
      expect(totalPlanned).toBe(150000);
      expect(totalActual).toBe(140000);
    });
  });

  describe('Full Dashboard Data for Charts', () => {
    it('should return all data needed for charts', async () => {
      const mockTracking = {
        id: 1,
        ideaId: 1,
        status: 'in_progress',
        overallProgress: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTasks = [
        { id: 1, projectTrackingId: 1, title: 'مهمة 1', status: 'completed', priority: 'high' },
        { id: 2, projectTrackingId: 1, title: 'مهمة 2', status: 'in_progress', priority: 'medium' },
      ];

      const mockBudgetItems = [
        { id: 1, projectTrackingId: 1, category: 'موارد', plannedAmount: 50000, actualAmount: 30000 },
      ];

      const mockKpis = [
        { id: 1, projectTrackingId: 1, kpiName: 'مؤشر 1', targetValue: '100', actualValue: '75' },
      ];

      const mockRisks = [
        { id: 1, projectTrackingId: 1, riskDescription: 'خطر 1', severity: 'medium', status: 'identified' },
      ];

      vi.mocked(getOrCreateProjectTracking).mockResolvedValue(mockTracking);
      vi.mocked(getProjectTasks).mockResolvedValue(mockTasks as any);
      vi.mocked(getBudgetItems).mockResolvedValue(mockBudgetItems as any);
      vi.mocked(getKpiItems).mockResolvedValue(mockKpis as any);
      vi.mocked(getRiskItems).mockResolvedValue(mockRisks as any);

      const result = await caller.dashboard.getFullDashboard({ ideaId: 1 });

      // التحقق من وجود جميع البيانات المطلوبة للرسوم البيانية
      expect(result.tracking).toBeDefined();
      expect(result.tasks).toBeDefined();
      expect(result.budgetItems).toBeDefined();
      expect(result.kpis).toBeDefined();
      expect(result.risks).toBeDefined();
      
      expect(result.tracking.overallProgress).toBe(50);
      expect(result.tasks).toHaveLength(2);
      expect(result.budgetItems).toHaveLength(1);
    });
  });
});
