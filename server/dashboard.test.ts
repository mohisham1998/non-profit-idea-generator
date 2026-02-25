import { describe, it, expect, beforeAll, vi } from 'vitest';
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
  updateProjectTracking,
  createProjectTask,
  getProjectTasks,
  updateProjectTask,
  deleteProjectTask,
  createBudgetItem,
  getBudgetItems,
  updateBudgetItem,
  deleteBudgetItem,
  createKpiItem,
  getKpiItems,
  updateKpiItem,
  deleteKpiItem,
  createRiskItem,
  getRiskItems,
  updateRiskItem,
  deleteRiskItem,
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

describe('Dashboard API Tests', () => {
  // ==================== Project Tracking Tests ====================
  describe('Project Tracking', () => {
    it('should get or create project tracking', async () => {
      const mockTracking = {
        id: 1,
        ideaId: 1,
        status: 'planning',
        overallProgress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getOrCreateProjectTracking).mockResolvedValue(mockTracking);

      const result = await caller.dashboard.getTracking({ ideaId: 1 });

      expect(getOrCreateProjectTracking).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(mockTracking);
    });

    it('should throw error when tracking creation fails', async () => {
      vi.mocked(getOrCreateProjectTracking).mockResolvedValue(null);

      await expect(caller.dashboard.getTracking({ ideaId: 999 }))
        .rejects.toThrow('فشل في جلب بيانات التتبع');
    });

    it('should update project tracking', async () => {
      const mockUpdated = {
        id: 1,
        ideaId: 1,
        status: 'in_progress',
        overallProgress: 50,
        notes: 'ملاحظات جديدة',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(updateProjectTracking).mockResolvedValue(mockUpdated);

      const result = await caller.dashboard.updateTracking({
        trackingId: 1,
        status: 'in_progress',
        overallProgress: 50,
        notes: 'ملاحظات جديدة',
      });

      expect(updateProjectTracking).toHaveBeenCalled();
      expect(result.status).toBe('in_progress');
      expect(result.overallProgress).toBe(50);
    });

    it('should get full dashboard data', async () => {
      const mockTracking = {
        id: 1,
        ideaId: 1,
        status: 'planning',
        overallProgress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTasks = [{ id: 1, title: 'مهمة 1', status: 'pending' }];
      const mockBudgetItems = [{ id: 1, category: 'فئة 1', plannedAmount: 1000 }];
      const mockKpis = [{ id: 1, kpiName: 'مؤشر 1', targetValue: '100' }];
      const mockRisks = [{ id: 1, riskDescription: 'خطر 1', severity: 'medium' }];

      vi.mocked(getOrCreateProjectTracking).mockResolvedValue(mockTracking);
      vi.mocked(getProjectTasks).mockResolvedValue(mockTasks as any);
      vi.mocked(getBudgetItems).mockResolvedValue(mockBudgetItems as any);
      vi.mocked(getKpiItems).mockResolvedValue(mockKpis as any);
      vi.mocked(getRiskItems).mockResolvedValue(mockRisks as any);

      const result = await caller.dashboard.getFullDashboard({ ideaId: 1 });

      expect(result.tracking).toEqual(mockTracking);
      expect(result.tasks).toEqual(mockTasks);
      expect(result.budgetItems).toEqual(mockBudgetItems);
      expect(result.kpis).toEqual(mockKpis);
      expect(result.risks).toEqual(mockRisks);
    });
  });

  // ==================== Tasks Tests ====================
  describe('Tasks Management', () => {
    it('should create a new task', async () => {
      const mockTask = {
        id: 1,
        projectTrackingId: 1,
        title: 'مهمة جديدة',
        description: 'وصف المهمة',
        status: 'pending',
        priority: 'high',
        assignee: 'أحمد',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(createProjectTask).mockResolvedValue(mockTask);

      const result = await caller.dashboard.createTask({
        trackingId: 1,
        title: 'مهمة جديدة',
        description: 'وصف المهمة',
        priority: 'high',
        assignee: 'أحمد',
      });

      expect(createProjectTask).toHaveBeenCalled();
      expect(result.title).toBe('مهمة جديدة');
      expect(result.priority).toBe('high');
    });

    it('should throw error when task creation fails', async () => {
      vi.mocked(createProjectTask).mockResolvedValue(null);

      await expect(caller.dashboard.createTask({
        trackingId: 1,
        title: 'مهمة فاشلة',
      })).rejects.toThrow('فشل في إنشاء المهمة');
    });

    it('should update task status', async () => {
      const mockUpdated = {
        id: 1,
        projectTrackingId: 1,
        title: 'مهمة محدثة',
        status: 'completed',
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(updateProjectTask).mockResolvedValue(mockUpdated);

      const result = await caller.dashboard.updateTask({
        taskId: 1,
        status: 'completed',
      });

      expect(updateProjectTask).toHaveBeenCalled();
      expect(result.status).toBe('completed');
    });

    it('should delete task', async () => {
      vi.mocked(deleteProjectTask).mockResolvedValue(true);

      const result = await caller.dashboard.deleteTask({ taskId: 1 });

      expect(deleteProjectTask).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
    });

    it('should throw error when task deletion fails', async () => {
      vi.mocked(deleteProjectTask).mockResolvedValue(false);

      await expect(caller.dashboard.deleteTask({ taskId: 999 }))
        .rejects.toThrow('فشل في حذف المهمة');
    });
  });

  // ==================== Budget Tests ====================
  describe('Budget Management', () => {
    it('should create a budget item', async () => {
      const mockItem = {
        id: 1,
        projectTrackingId: 1,
        category: 'الموارد البشرية',
        description: 'رواتب الموظفين',
        plannedAmount: 50000,
        actualAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(createBudgetItem).mockResolvedValue(mockItem);

      const result = await caller.dashboard.createBudgetItem({
        trackingId: 1,
        category: 'الموارد البشرية',
        description: 'رواتب الموظفين',
        plannedAmount: 50000,
      });

      expect(createBudgetItem).toHaveBeenCalled();
      expect(result.category).toBe('الموارد البشرية');
      expect(result.plannedAmount).toBe(50000);
    });

    it('should update budget item', async () => {
      const mockUpdated = {
        id: 1,
        projectTrackingId: 1,
        category: 'الموارد البشرية',
        plannedAmount: 50000,
        actualAmount: 25000,
        notes: 'تم صرف نصف المبلغ',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(updateBudgetItem).mockResolvedValue(mockUpdated);

      const result = await caller.dashboard.updateBudgetItem({
        itemId: 1,
        actualAmount: 25000,
        notes: 'تم صرف نصف المبلغ',
      });

      expect(updateBudgetItem).toHaveBeenCalled();
      expect(result.actualAmount).toBe(25000);
    });

    it('should delete budget item', async () => {
      vi.mocked(deleteBudgetItem).mockResolvedValue(true);

      const result = await caller.dashboard.deleteBudgetItem({ itemId: 1 });

      expect(deleteBudgetItem).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
    });
  });

  // ==================== KPI Tests ====================
  describe('KPI Management', () => {
    it('should create a KPI item', async () => {
      const mockItem = {
        id: 1,
        projectTrackingId: 1,
        kpiName: 'عدد المستفيدين',
        targetValue: '500',
        actualValue: null,
        unit: 'شخص',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(createKpiItem).mockResolvedValue(mockItem);

      const result = await caller.dashboard.createKpi({
        trackingId: 1,
        kpiName: 'عدد المستفيدين',
        targetValue: '500',
        unit: 'شخص',
      });

      expect(createKpiItem).toHaveBeenCalled();
      expect(result.kpiName).toBe('عدد المستفيدين');
      expect(result.targetValue).toBe('500');
    });

    it('should update KPI actual value', async () => {
      const mockUpdated = {
        id: 1,
        projectTrackingId: 1,
        kpiName: 'عدد المستفيدين',
        targetValue: '500',
        actualValue: '250',
        notes: 'تم تحقيق 50%',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(updateKpiItem).mockResolvedValue(mockUpdated);

      const result = await caller.dashboard.updateKpi({
        itemId: 1,
        actualValue: '250',
        notes: 'تم تحقيق 50%',
      });

      expect(updateKpiItem).toHaveBeenCalled();
      expect(result.actualValue).toBe('250');
    });

    it('should delete KPI item', async () => {
      vi.mocked(deleteKpiItem).mockResolvedValue(true);

      const result = await caller.dashboard.deleteKpi({ itemId: 1 });

      expect(deleteKpiItem).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
    });
  });

  // ==================== Risk Tests ====================
  describe('Risk Management', () => {
    it('should create a risk item', async () => {
      const mockItem = {
        id: 1,
        projectTrackingId: 1,
        riskDescription: 'تأخر في التمويل',
        severity: 'high',
        likelihood: 'medium',
        status: 'identified',
        mitigationStrategy: 'البحث عن مصادر بديلة',
        owner: 'المدير المالي',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(createRiskItem).mockResolvedValue(mockItem);

      const result = await caller.dashboard.createRisk({
        trackingId: 1,
        riskDescription: 'تأخر في التمويل',
        severity: 'high',
        likelihood: 'medium',
        mitigationStrategy: 'البحث عن مصادر بديلة',
        owner: 'المدير المالي',
      });

      expect(createRiskItem).toHaveBeenCalled();
      expect(result.riskDescription).toBe('تأخر في التمويل');
      expect(result.severity).toBe('high');
    });

    it('should update risk status', async () => {
      const mockUpdated = {
        id: 1,
        projectTrackingId: 1,
        riskDescription: 'تأخر في التمويل',
        severity: 'high',
        likelihood: 'medium',
        status: 'mitigated',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(updateRiskItem).mockResolvedValue(mockUpdated);

      const result = await caller.dashboard.updateRisk({
        itemId: 1,
        status: 'mitigated',
      });

      expect(updateRiskItem).toHaveBeenCalled();
      expect(result.status).toBe('mitigated');
    });

    it('should delete risk item', async () => {
      vi.mocked(deleteRiskItem).mockResolvedValue(true);

      const result = await caller.dashboard.deleteRisk({ itemId: 1 });

      expect(deleteRiskItem).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
    });
  });

  // ==================== Validation Tests ====================
  describe('Input Validation', () => {
    it('should reject task with empty title', async () => {
      await expect(caller.dashboard.createTask({
        trackingId: 1,
        title: '',
      })).rejects.toThrow();
    });

    it('should reject budget item with negative amount', async () => {
      await expect(caller.dashboard.createBudgetItem({
        trackingId: 1,
        category: 'فئة',
        plannedAmount: -100,
      })).rejects.toThrow();
    });

    it('should reject KPI with empty name', async () => {
      await expect(caller.dashboard.createKpi({
        trackingId: 1,
        kpiName: '',
        targetValue: '100',
      })).rejects.toThrow();
    });

    it('should reject risk with empty description', async () => {
      await expect(caller.dashboard.createRisk({
        trackingId: 1,
        riskDescription: '',
      })).rejects.toThrow();
    });

    it('should accept valid task priority values', async () => {
      const mockTask = {
        id: 1,
        projectTrackingId: 1,
        title: 'مهمة',
        status: 'pending',
        priority: 'urgent',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(createProjectTask).mockResolvedValue(mockTask);

      const result = await caller.dashboard.createTask({
        trackingId: 1,
        title: 'مهمة عاجلة',
        priority: 'urgent',
      });

      expect(result.priority).toBe('urgent');
    });

    it('should accept valid risk severity values', async () => {
      const mockRisk = {
        id: 1,
        projectTrackingId: 1,
        riskDescription: 'خطر حرج',
        severity: 'critical',
        likelihood: 'high',
        status: 'identified',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(createRiskItem).mockResolvedValue(mockRisk);

      const result = await caller.dashboard.createRisk({
        trackingId: 1,
        riskDescription: 'خطر حرج',
        severity: 'critical',
        likelihood: 'high',
      });

      expect(result.severity).toBe('critical');
    });
  });
});
