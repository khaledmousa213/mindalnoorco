import { useEffect, useState } from 'react';
import { subscribePageBlocks } from '../lib/pageBlocks';
import type { Block } from '../components/blocks/types';

interface State {
  blocks: Block[];
  loading: boolean;
  /** True if the query failed — "no blocks" then means "unknown", not "empty". */
  failed: boolean;
}

/** Live stored blocks for one page (empty until an admin has customised it). */
export function usePageBlocks(pageId: string): State {
  const [state, setState] = useState<State>({ blocks: [], loading: true, failed: false });

  useEffect(() => {
    setState({ blocks: [], loading: true, failed: false });
    if (!pageId) {
      setState({ blocks: [], loading: false, failed: false });
      return;
    }
    return subscribePageBlocks(
      pageId,
      (blocks) => setState({ blocks, loading: false, failed: false }),
      () => setState({ blocks: [], loading: false, failed: true }),
    );
  }, [pageId]);

  return state;
}
