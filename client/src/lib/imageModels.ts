/**
 * Curated list of OpenRouter image generation models (verified to work).
 * Each model has its own section/data for testing and selection.
 */
export interface ImageModelOption {
  id: string;
  name: string;
  provider: string;
  description?: string;
  /** Verified working via OpenRouter docs */
  verified: boolean;
}

export const IMAGE_MODELS: ImageModelOption[] = [
  { id: 'black-forest-labs/flux.2-flex', name: 'FLUX.2 Flex', provider: 'Black Forest Labs', verified: true },
  { id: 'black-forest-labs/flux.2-pro', name: 'FLUX.2 Pro', provider: 'Black Forest Labs', verified: true },
  { id: 'google/gemini-2.5-flash-image-preview', name: 'Gemini 2.5 Flash Image', provider: 'Google', verified: true },
  { id: 'google/gemini-3.1-flash-image-preview', name: 'Gemini 3.1 Flash Image', provider: 'Google', verified: true },
  { id: 'sourceful/riverflow-v2-fast', name: 'Riverflow v2 Fast', provider: 'Sourceful', verified: true },
  { id: 'sourceful/riverflow-v2-pro', name: 'Riverflow v2 Pro', provider: 'Sourceful', verified: true },
];

const STORAGE_KEY = 'ai-agents-selected-image-model';

export function getSelectedImageModel(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setSelectedImageModel(modelId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, modelId);
}
