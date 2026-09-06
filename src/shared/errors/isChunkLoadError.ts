/**
 * Chunk-load errors surface when a lazily-imported module can't be fetched — most often a
 * stale deploy: the user's cached index references hashed chunks that no longer exist. The
 * only real recovery is a full reload to pick up the new index, so callers surface a reload
 * action rather than an in-place retry (which would just fail again).
 *
 * Kept in its own module (not the component file) so ErrorBoundary.tsx stays a
 * components-only module for React Fast Refresh.
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /loading (css )?chunk|dynamically imported module|importing a module script failed|failed to fetch/i.test(
    error.message
  );
}
