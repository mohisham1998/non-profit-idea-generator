import { describe, it, expect } from 'vitest';
import { getDashboardLayout, saveDashboardLayout, resetDashboardLayout } from './db';

describe('Dashboard Layout Customization Tests', () => {
  describe('Layout Management', () => {
    it('should save dashboard layout for user', async () => {
      const userId = 1;
      const tabsOrder = ['budget', 'tasks', 'kpis', 'risks'];
      
      const layout = await saveDashboardLayout(userId, tabsOrder);
      
      expect(layout).toBeDefined();
      expect(layout).not.toBeNull();
      if (layout) {
        const parsedOrder = JSON.parse(layout.tabsOrder);
        expect(parsedOrder).toEqual(tabsOrder);
      }
    });

    it('should retrieve saved dashboard layout', async () => {
      const userId = 1;
      const tabsOrder = ['kpis', 'risks', 'budget', 'tasks'];
      
      await saveDashboardLayout(userId, tabsOrder);
      const layout = await getDashboardLayout(userId);
      
      expect(layout).toBeDefined();
      expect(layout).not.toBeNull();
      if (layout) {
        const parsedOrder = JSON.parse(layout.tabsOrder);
        expect(parsedOrder).toEqual(tabsOrder);
      }
    });

    it('should update existing dashboard layout', async () => {
      const userId = 1;
      const firstOrder = ['tasks', 'budget', 'kpis', 'risks'];
      const secondOrder = ['risks', 'kpis', 'budget', 'tasks'];
      
      await saveDashboardLayout(userId, firstOrder);
      await saveDashboardLayout(userId, secondOrder);
      
      const layout = await getDashboardLayout(userId);
      expect(layout).toBeDefined();
      if (layout) {
        const parsedOrder = JSON.parse(layout.tabsOrder);
        expect(parsedOrder).toEqual(secondOrder);
      }
    });

    it('should reset dashboard layout', async () => {
      const userId = 1;
      const customOrder = ['budget', 'tasks', 'kpis', 'risks'];
      
      await saveDashboardLayout(userId, customOrder);
      const resetSuccess = await resetDashboardLayout(userId);
      
      expect(resetSuccess).toBe(true);
      
      const layout = await getDashboardLayout(userId);
      expect(layout).toBeNull();
    });
  });

  describe('Input Validation', () => {
    it('should accept valid tabs order', async () => {
      const userId = 1;
      const validOrders = [
        ['tasks', 'budget', 'kpis', 'risks'],
        ['budget', 'kpis', 'risks', 'tasks'],
        ['risks', 'tasks', 'budget', 'kpis'],
      ];
      
      for (const order of validOrders) {
        const layout = await saveDashboardLayout(userId, order);
        expect(layout).toBeDefined();
        expect(layout).not.toBeNull();
      }
    });

    it('should handle empty tabs order gracefully', async () => {
      const userId = 1;
      const emptyOrder: string[] = [];
      
      const layout = await saveDashboardLayout(userId, emptyOrder);
      expect(layout).toBeDefined();
      if (layout) {
        const parsedOrder = JSON.parse(layout.tabsOrder);
        expect(parsedOrder).toEqual(emptyOrder);
      }
    });
  });

  describe('User Isolation', () => {
    it('should maintain separate layouts for different users', async () => {
      const user1Id = 1;
      const user2Id = 2;
      const user1Order = ['tasks', 'budget', 'kpis', 'risks'];
      const user2Order = ['risks', 'kpis', 'budget', 'tasks'];
      
      await saveDashboardLayout(user1Id, user1Order);
      await saveDashboardLayout(user2Id, user2Order);
      
      const user1Layout = await getDashboardLayout(user1Id);
      const user2Layout = await getDashboardLayout(user2Id);
      
      expect(user1Layout).toBeDefined();
      expect(user2Layout).toBeDefined();
      
      if (user1Layout && user2Layout) {
        const user1ParsedOrder = JSON.parse(user1Layout.tabsOrder);
        const user2ParsedOrder = JSON.parse(user2Layout.tabsOrder);
        
        expect(user1ParsedOrder).toEqual(user1Order);
        expect(user2ParsedOrder).toEqual(user2Order);
        expect(user1ParsedOrder).not.toEqual(user2ParsedOrder);
      }
    });
  });
});
