import { useEffect, useState } from 'react';
import { subscribePageBlocks } from '../lib/pageBlocks';
import type { Block } from '../components/blocks/types';

/** Live stored blocks for one page (empty until an admin has customised it). */
export function usePageBlocks(pageId: string): { blocks: Block[]; loading: boolean } {
  const [state, setState] = useState<{ blocks: Block[]; loading: boolean }>({
    blocks: [],
    loading: true,
  });

  useEffect(() => {
    setState({ blocks: [], loading: true });
    if (!pageId) {
      setState({ blocks: [], loading: false });
      return;
    }
    return subscribePageBlocks(
      pageId,
      (blocks) => setState({ blocks, loading: false }),
      () => setState({ blocks: [], loading: false }),
    );
  }, [pageId]);

  return state;
}
