import { useEffect, useMemo } from 'react';
import { useAuth } from '../lib/auth';
import { BLOCK_VERSION, resetPageBlocks } from '../lib/pageBlocks';
import { defaultsForPage } from '../lib/pageDefaults';
import { usePageBlocks } from './usePageBlocks';
import type { Block } from '../components/blocks/types';

/**
 * The blocks a page renders: stored blocks, or the built-in defaults until the
 * page has been customised (so a page is never blank and looks like it always did).
 *
 * A signed-in admin visiting a page with no stored blocks (or blocks saved by
 * an older version of the builder) gets the standard layout written to
 * Firestore, so the admin screens have stored blocks to edit. Stored blocks
 * have Firestore ids; defaults use `default-<n>` ids.
 */
export function usePageBuilder(pageId: string) {
  const { isAdmin } = useAuth();
  const { blocks: stored, loading, failed } = usePageBlocks(pageId);
  const defaults = useMemo(() => defaultsForPage(pageId), [pageId]);

  const usable = stored.length > 0 && stored.every((b) => b.v === BLOCK_VERSION);

  // Never reset when the query failed: "no blocks" would then just mean "couldn't read them".
  useEffect(() => {
    if (isAdmin && !loading && !failed && pageId && defaults.length > 0 && !usable) {
      void resetPageBlocks(pageId, defaults);
    }
  }, [isAdmin, loading, failed, usable, pageId, defaults]);

  const blocks = useMemo<Block[]>(() => {
    if (usable) return stored;
    return defaults.map((d, i) => ({
      id: `default-${i}`,
      pageId,
      type: d.type,
      order: i,
      props: d.props,
    }));
  }, [usable, stored, defaults, pageId]);

  return { pageId, blocks, loading };
}
