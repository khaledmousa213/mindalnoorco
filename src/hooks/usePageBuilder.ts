import { useEffect, useMemo } from 'react';
import { useAuth } from '../lib/auth';
import { seedIfEmpty, updateBlockProps } from '../lib/pageBlocks';
import { usePageBlocks } from './usePageBlocks';
import type { Block, DefaultBlockInput } from '../components/blocks/types';

/**
 * Everything a page needs to render from blocks:
 * - `blocks`: stored blocks, or the built-in defaults until the page has been
 *   customised (so a page is never blank and looks like it always did).
 * - `editable`: admin AND the blocks are persisted — only then is in-place
 *   editing safe (default blocks have no Firestore doc to write to yet).
 * - `updateProps`: merges a patch into a block's props and saves it.
 *
 * `defaults` must be a stable reference (module constant or memoised).
 * A signed-in admin visiting a page with no stored blocks seeds the defaults
 * into Firestore so the page becomes editable within a moment.
 */
export function usePageBuilder(pageId: string, defaults: DefaultBlockInput[]) {
  const { isAdmin } = useAuth();
  const { blocks: stored, loading } = usePageBlocks(pageId);

  useEffect(() => {
    if (isAdmin && !loading && stored.length === 0 && pageId && defaults.length > 0) {
      void seedIfEmpty(pageId, defaults);
    }
  }, [isAdmin, loading, stored.length, pageId, defaults]);

  const blocks = useMemo<Block[]>(() => {
    if (stored.length > 0) return stored;
    return defaults.map((d, i) => ({
      id: `default-${i}`,
      pageId,
      type: d.type,
      order: i,
      props: d.props,
    }));
  }, [stored, defaults, pageId]);

  const updateProps = (block: Block, patch: Record<string, unknown>) =>
    updateBlockProps(block.id, { ...block.props, ...patch });

  return { blocks, editable: isAdmin && stored.length > 0, loading, updateProps };
}
