/**
 * Image prevalidation utilities
 * @see specs/007-gamma-smart-layout-engine/spec.md US2
 */

/** Check if URL looks like a valid image URL (basic validation) */
export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'data:';
  } catch {
    return false;
  }
}

/** Prevalidate image URL - returns true if URL format is acceptable for loading */
export function prevalidateImageUrl(url: string | undefined | null): boolean {
  return isValidImageUrl(url);
}
