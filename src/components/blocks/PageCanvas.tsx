import { BlockRenderer } from './BlockRenderer';
import type { Block, CategoryBlockContext } from './types';

interface Props {
  blocks: Block[];
  categoryContext?: CategoryBlockContext;
}

/** Renders a page's blocks top to bottom. Pages are edited from the admin screens. */
export function PageCanvas({ blocks, categoryContext }: Props) {
  return (
    <>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} categoryContext={categoryContext} />
      ))}
    </>
  );
}
