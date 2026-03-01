/**
 * OpenRouter Models API client with in-memory caching
 * Used to fetch available AI models for model selection UI
 * Returns only curated, reliable models for nonprofit idea generation.
 */

import { ENV } from "./env";

export interface OpenRouterModel {
  id: string;
  name?: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt?: number;
    completion?: number;
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
}

export type ModelComplexity = "basic" | "standard" | "advanced";

export interface CuratedModel {
  id: string;
  name: string;
  provider: string;
  complexity: ModelComplexity;
  pricing?: { prompt: number; completion: number };
  /** Est. USD cost per ~2k-token idea generation */
  estCostPerIdea?: number;
  contextLength?: number;
}

interface OpenRouterModelsResponse {
  data?: OpenRouterModel[];
  error?: string;
}

/** Curated list: reliable models for nonprofit idea generation (creative text, structured output) */
const CURATED_IDS = [
  "openai/gpt-4o-mini",
  "openai/gpt-4o",
  "openai/gpt-4-turbo",
  "anthropic/claude-3.5-haiku",
  "anthropic/claude-3.5-sonnet",
  "anthropic/claude-3-opus",
  "anthropic/claude-3-haiku",
  "google/gemini-2.0-flash-001",
  "google/gemini-flash-1.5",
  "google/gemini-2.5-pro-preview",
  "google/gemini-pro-1.5",
  "meta-llama/llama-3.3-70b-instruct",
  "meta-llama/llama-3.1-8b-instruct",
];

const COMPLEXITY_MAP: Record<string, ModelComplexity> = {
  "openai/gpt-4o-mini": "basic",
  "anthropic/claude-3.5-haiku": "basic",
  "anthropic/claude-3-haiku": "basic",
  "google/gemini-2.0-flash-001": "basic",
  "google/gemini-flash-1.5": "basic",
  "meta-llama/llama-3.1-8b-instruct": "basic",
  "openai/gpt-4o": "standard",
  "anthropic/claude-3.5-sonnet": "standard",
  "google/gemini-pro-1.5": "standard",
  "google/gemini-2.5-pro-preview": "standard",
  "meta-llama/llama-3.3-70b-instruct": "standard",
  "openai/gpt-4-turbo": "advanced",
  "anthropic/claude-3-opus": "advanced",
};

const COMPLEXITY_LABELS: Record<ModelComplexity, string> = {
  basic: "أساسي",
  standard: "قياسي",
  advanced: "متقدم",
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cachedModels: OpenRouterModel[] | null = null;
let cacheExpiry = 0;

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  const now = Date.now();
  if (cachedModels && now < cacheExpiry) {
    return cachedModels;
  }

  const apiKey = ENV.openrouterApiKey;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${errText || res.statusText}`);
  }

  const json = (await res.json()) as OpenRouterModelsResponse;
  const models = json.data ?? [];
  cachedModels = models;
  cacheExpiry = now + CACHE_TTL_MS;
  return models;
}

/** Filter to curated models and enrich with complexity, pricing, quota impact */
export function getCuratedModels(raw: OpenRouterModel[]): CuratedModel[] {
  const byId = new Map(raw.map((m) => [m.id, m]));
  const result: CuratedModel[] = [];
  for (const curatedId of CURATED_IDS) {
    const m = byId.get(curatedId) ?? raw.find((x) => x.id.startsWith(curatedId + ":"));
    if (!m) continue;
    const provider = m.id?.split("/")[0] ?? "other";
    const complexity = COMPLEXITY_MAP[curatedId] ?? "standard";
    const prompt = m.pricing?.prompt ?? 0;
    const completion = m.pricing?.completion ?? 0;
    // OpenRouter returns USD per token; ~1500 prompt + ~500 completion tokens per idea
    const estCostPerIdea = prompt * 1500 + completion * 500;
    result.push({
      id: m.id,
      name: m.name ?? m.id,
      provider,
      complexity,
      pricing: { prompt, completion },
      estCostPerIdea,
      contextLength: m.context_length ?? m.top_provider?.context_length,
    });
  }
  return result;
}

export { COMPLEXITY_LABELS };
