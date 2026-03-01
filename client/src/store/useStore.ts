/**
 * Global Zustand Store for Admin Dashboard
 * 
 * Manages global state for:
 * - User profile and theming
 * - Dashboard navigation
 * - AI model selection
 * - Quota and usage stats
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
interface UserProfile {
  id: number;
  name: string | null;
  email: string | null;
  organizationName: string | null;
  organizationLogo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  backgroundColor: string | null;
  logoPlacement: 'cover' | 'footer' | 'hidden';
  selectedModelId: string | null;
  quotaLimitUsd: number;
  currentUsageUsd: number;
}

interface DashboardStats {
  totalIdeas: number;
  totalDecks: number;
  recentActions: Array<{
    id: string;
    type: 'create' | 'update' | 'delete' | 'generate';
    title: string;
    timestamp: Date;
  }>;
}

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  provider?: string;
  pricing?: {
    prompt: number;
    completion: number;
  };
}

// Store State Interface
interface DashboardState {
  // User & Profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  updateBranding: (branding: Partial<UserProfile>) => void;
  
  // Theming
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Dashboard Navigation
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
  
  // AI Model Selection
  selectedModelId: string | null;
  availableModels: OpenRouterModel[];
  modelsLoading: boolean;
  modelsError: string | null;
  setSelectedModel: (modelId: string) => void;
  setAvailableModels: (models: OpenRouterModel[]) => void;
  setModelsLoading: (loading: boolean) => void;
  setModelsError: (error: string | null) => void;
  
  // Usage & Quota
  usageStats: {
    currentUsage: number;
    quotaLimit: number;
    percentage: number;
  };
  updateUsageStats: (stats: { currentUsage: number; quotaLimit: number }) => void;
  
  // Dashboard Stats
  dashboardStats: DashboardStats;
  updateDashboardStats: (stats: Partial<DashboardStats>) => void;
  addRecentAction: (action: DashboardStats['recentActions'][0]) => void;
}

// Create Store with Persistence
export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial State
      userProfile: null,
      isDarkMode: false,
      sidebarCollapsed: false,
      activePage: 'home',
      selectedModelId: null,
      availableModels: [],
      modelsLoading: false,
      modelsError: null,
      usageStats: {
        currentUsage: 0,
        quotaLimit: 50,
        percentage: 0,
      },
      dashboardStats: {
        totalIdeas: 0,
        totalDecks: 0,
        recentActions: [],
      },

      // Actions
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      updateBranding: (branding) => set((state) => {
        const base = state.userProfile ?? {
          id: 0,
          name: null,
          email: null,
          organizationName: null,
          organizationLogo: null,
          primaryColor: null,
          secondaryColor: null,
          backgroundColor: null,
          logoPlacement: 'cover' as const,
          selectedModelId: null,
          quotaLimitUsd: 50,
          currentUsageUsd: 0,
        };
        return { userProfile: { ...base, ...branding } };
      }),

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),

      setActivePage: (page) => set({ activePage: page }),

      setSelectedModel: (modelId) => set({ selectedModelId: modelId }),

      setAvailableModels: (models) => set({ availableModels: models }),
      setModelsLoading: (loading) => set({ modelsLoading: loading }),
      setModelsError: (error) => set({ modelsError: error }),

      updateUsageStats: (stats) => set({
        usageStats: {
          currentUsage: stats.currentUsage,
          quotaLimit: stats.quotaLimit,
          percentage: (stats.currentUsage / stats.quotaLimit) * 100,
        },
      }),

      updateDashboardStats: (stats) => set((state) => ({
        dashboardStats: { ...state.dashboardStats, ...stats },
      })),

      addRecentAction: (action) => set((state) => ({
        dashboardStats: {
          ...state.dashboardStats,
          recentActions: [action, ...state.dashboardStats.recentActions.slice(0, 9)],
        },
      })),
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        sidebarCollapsed: state.sidebarCollapsed,
        selectedModelId: state.selectedModelId,
      }),
    }
  )
);

// Selector hooks for better performance
export const useUserProfile = () => useDashboardStore((state) => state.userProfile);
export const useBranding = () => useDashboardStore((state) => ({
  primaryColor: state.userProfile?.primaryColor,
  secondaryColor: state.userProfile?.secondaryColor,
  backgroundColor: state.userProfile?.backgroundColor,
  logoUrl: state.userProfile?.organizationLogo,
  logoPlacement: state.userProfile?.logoPlacement,
}));
export const useUsageStats = () => useDashboardStore((state) => state.usageStats);
export const useModels = () => useDashboardStore((state) => ({
  models: state.availableModels,
  selectedId: state.selectedModelId,
  loading: state.modelsLoading,
  error: state.modelsError,
}));