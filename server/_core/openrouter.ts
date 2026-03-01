/**
 * OpenRouter API Client
 * 
 * Provides utilities for fetching available models and usage data
 * from the OpenRouter API with caching support.
 */

import { ENV } from './env';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: number;
    completion: number;
  };
  provider?: string;
}

interface ModelsCache {
  models: OpenRouterModel[];
  timestamp: number;
}

// In-memory cache
let modelsCache: ModelsCache | null = null;

/**
 * Fetch available models from OpenRouter API
 */
export async function fetchOpenRouterModels(apiKey?: string): Promise<OpenRouterModel[]> {
  // Check cache first
  if (modelsCache && Date.now() - modelsCache.timestamp < CACHE_TTL_MS) {
    console.log('[OpenRouter] Returning cached models');
    return modelsCache.models;
  }

  try {
    const key = apiKey || ENV.openrouterApiKey;
    if (!key) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': process.env.VITE_APP_URL || 'http://localhost:3000',
        'X-Title': 'Nonprofit Ideas Generator',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const models: OpenRouterModel[] = data.data || [];

    // Update cache
    modelsCache = {
      models,
      timestamp: Date.now(),
    };

    console.log(`[OpenRouter] Fetched ${models.length} models`);
    return models;
  } catch (error) {
    console.error('[OpenRouter] Failed to fetch models:', error);
    
    // Return cached data even if stale, or empty array
    if (modelsCache) {
      console.log('[OpenRouter] Returning stale cache due to error');
      return modelsCache.models;
    }
    
    throw error;
  }
}

/**
 * Group models by provider for display
 */
export function groupModelsByProvider(models: OpenRouterModel[]): Record<string, OpenRouterModel[]> {
  const grouped: Record<string, OpenRouterModel[]> = {};

  for (const model of models) {
    // Extract provider from model ID (e.g., "openai/gpt-4" -> "openai")
    const provider = model.id.split('/')[0] || 'unknown';
    
    if (!grouped[provider]) {
      grouped[provider] = [];
    }
    
    grouped[provider].push(model);
  }

  return grouped;
}

/**
 * Fetch usage/cost data from OpenRouter
 */
export async function fetchOpenRouterUsage(apiKey?: string): Promise<{
  totalCost: number;
  totalTokens: number;
  requests: number;
}> {
  try {
    const key = apiKey || ENV.openrouterApiKey;
    if (!key) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch(`${OPENROUTER_BASE_URL}/credits`, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': process.env.VITE_APP_URL || 'http://localhost:3000',
        'X-Title': 'Nonprofit Ideas Generator',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      totalCost: data.total_usage || 0,
      totalTokens: data.total_tokens || 0,
      requests: data.total_requests || 0,
    };
  } catch (error) {
    console.error('[OpenRouter] Failed to fetch usage:', error);
    throw error;
  }
}

/**
 * Clear models cache (useful for testing or force refresh)
 */
export function clearModelsCache(): void {
  modelsCache = null;
  console.log('[OpenRouter] Models cache cleared');
}

/**
 * Get cached models status
 */
export function getCacheStatus(): { cached: boolean; age?: number } {
  if (!modelsCache) {
    return { cached: false };
  }
  
  return {
    cached: true,
    age: Date.now() - modelsCache.timestamp,
  };
}

/**
 * Validate OpenRouter API key
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/auth/key`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('[OpenRouter] Key validation failed:', error);
    return false;
  }
}