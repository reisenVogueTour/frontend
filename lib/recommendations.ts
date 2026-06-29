import type { Experience } from "./types/reisen";

/**
 * Hand-off for AI recommendations between the prompt page and the results page.
 * The prompt page calls the AI, stashes the matches here, then redirects to the
 * destination results page, which reads them back (keyed by slug so a different
 * destination never shows stale picks).
 */

const STORAGE_KEY = "reisen:ai-recommendations";

export type StoredRecommendations = {
  slug: string;
  prompt: string;
  recommended: Experience[];
};

export function storeRecommendations(value: StoredRecommendations): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function clearRecommendations(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function readRecommendations(
  slug: string,
): StoredRecommendations | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRecommendations;
    if (parsed.slug === slug && Array.isArray(parsed.recommended)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
