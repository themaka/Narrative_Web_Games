// =============================================================================
// useAssetUrl — Resolves asset URLs (short name vs full URL)
// =============================================================================

import { useCallback } from 'react';

/**
 * Returns a function that resolves asset URLs.
 *
 * - If a value starts with `http://` or `https://`, use it as-is
 * - Otherwise, prepend the assetBaseUrl from config
 * - If no assetBaseUrl is configured, return the value as-is (assume relative path)
 */
export function useAssetUrl(assetBaseUrl?: string) {
  const resolveUrl = useCallback(
    (value: string | undefined): string | undefined => {
      if (!value) return undefined;

      // Special values — not URLs
      if (value === 'clear' || value === 'none' || value === 'stop') {
        return value;
      }

      // Already a full URL
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
      }

      // Prepend base URL if available
      if (assetBaseUrl) {
        const base = assetBaseUrl.endsWith('/') ? assetBaseUrl : `${assetBaseUrl}/`;
        return `${base}${value}`;
      }

      // No base URL — return as-is
      return value;
    },
    [assetBaseUrl]
  );

  return resolveUrl;
}
