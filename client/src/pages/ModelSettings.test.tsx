/**
 * Component tests for ModelSettings
 * Validates that fallback warning banners render when models fetch fails (no network).
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, cleanup } from '@testing-library/react';
import ModelSettings from './ModelSettings';

const { mockUseQuery, mockUseMutation } = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
  mockUseMutation: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock('@/lib/trpc', () => ({
  trpc: {
    adminDashboard: {
      getModels: {
        useQuery: mockUseQuery,
      },
      getSelectedModel: {
        useQuery: vi.fn(() => ({ data: { selectedModelId: null } })),
      },
      updateSelectedModel: {
        useMutation: mockUseMutation,
      },
    },
  },
}));

vi.mock('@/store/useStore', () => ({
  useDashboardStore: (selector: (s: unknown) => unknown) => {
    const state = {
      selectedModelId: null,
      setSelectedModel: vi.fn(),
      setAvailableModels: vi.fn(),
      setModelsLoading: vi.fn(),
      setModelsError: vi.fn(),
    };
    return selector(state);
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('ModelSettings', () => {
  beforeEach(() => {
    cleanup();
    mockUseQuery.mockClear();
  });

  it('renders fallback warning banner when models fetch fails (error in data)', () => {
    mockUseQuery.mockReturnValue({
      data: { models: [], error: 'فشل في الاتصال' },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<ModelSettings />);

    expect(screen.getByText('تعذر جلب قائمة النماذج')).toBeInTheDocument();
    expect(screen.getByText('فشل في الاتصال')).toBeInTheDocument();
  });

  it('renders retry button in error state', () => {
    const refetch = vi.fn();
    mockUseQuery.mockReturnValue({
      data: { models: [], error: 'Network error' },
      isLoading: false,
      refetch,
    });

    render(<ModelSettings />);

    const retryButtons = screen.getAllByText('إعادة المحاولة');
    expect(retryButtons.length).toBeGreaterThan(0);
  });

  it('renders model selection card when fetch succeeds', () => {
    mockUseQuery.mockReturnValue({
      data: {
        models: [{ id: 'test-1', name: 'Test Model', provider: 'test', complexity: 'basic' }],
        error: null,
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<ModelSettings />);

    // Success state shows the model selection card (النموذج المختار)
    expect(screen.getAllByText('النموذج المختار').length).toBeGreaterThan(0);
  });
});
