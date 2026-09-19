import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Block, BlockType, DefaultBlockInput } from '../components/blocks/types';

const COLLECTION = 'pageBlocks';
const blocksRef = collection(db, COLLECTION);

function fromDoc(id: string, data: Record<string, unknown>): Block {
  return {
    id,
    pageId: (data.pageId as string) ?? '',
    type: (data.type as BlockType) ?? 'richText',
    order: typeof data.order === 'number' ? (data.order as number) : 0,
    props: (data.props as Record<string, unknown>) ?? {},
  };
}

/** Live, ordered list of the blocks that make up one page. */
export function subscribePageBlocks(
  pageId: string,
  onData: (blocks: Block[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return onSnapshot(
    query(blocksRef, where('pageId', '==', pageId), orderBy('order', 'asc')),
    (snap) => onData(snap.docs.map((d) => fromDoc(d.id, d.data()))),
    (err) => onError?.(err),
  );
}

export async function createBlock(
  pageId: string,
  type: BlockType,
  props: Record<string, unknown>,
  order: number,
): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(blocksRef, { pageId, type, props, order, createdAt: now, updatedAt: now });
  return ref.id;
}

/** Replaces the whole props object — callers merge their patch into the current props first. */
export async function updateBlockProps(id: string, props: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { props, updatedAt: Date.now() });
}

export async function deleteBlock(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/** Persist a new ordering. `orderedIds` is the full list top-to-bottom. */
export async function reorderBlocks(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, COLLECTION, id), { order: index, updatedAt: Date.now() });
  });
  await batch.commit();
}

/**
 * Writes the default layout for a page the first time it has no stored blocks,
 * so there is real state to edit/reorder. No-op if the page already has blocks.
 */
export async function seedIfEmpty(pageId: string, defaults: DefaultBlockInput[]): Promise<void> {
  if (defaults.length === 0) return;
  const existing = await getDocs(query(blocksRef, where('pageId', '==', pageId)));
  if (!existing.empty) return;
  const now = Date.now();
  const batch = writeBatch(db);
  defaults.forEach((def, index) => {
    batch.set(doc(blocksRef), {
      pageId,
      type: def.type,
      props: def.props,
      order: index,
      createdAt: now,
      updatedAt: now,
    });
  });
  await batch.commit();
}
