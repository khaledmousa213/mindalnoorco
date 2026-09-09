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
} from 'firebase/firestore';
import { db } from './firebase';
import type { Category, CategoryDraft } from './types';

const COLLECTION = 'categories';
const categoriesRef = collection(db, COLLECTION);

function fromDoc(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    name: (data.name as string) ?? '',
    slug: (data.slug as string) ?? id,
    description: (data.description as string) ?? '',
    order: typeof data.order === 'number' ? (data.order as number) : 0,
  };
}

export function subscribeCategories(
  onData: (categories: Category[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return onSnapshot(
    query(categoriesRef, orderBy('order', 'asc')),
    (snap) => onData(snap.docs.map((d) => fromDoc(d.id, d.data()))),
    (err) => onError?.(err),
  );
}

export async function getNextCategoryOrder(): Promise<number> {
  const snap = await getDocs(query(categoriesRef, orderBy('order', 'desc')));
  if (snap.empty) return 0;
  const top = snap.docs[0].data().order;
  return (typeof top === 'number' ? top : 0) + 1;
}

export async function createCategory(draft: CategoryDraft): Promise<string> {
  const ref = await addDoc(categoriesRef, draft);
  return ref.id;
}

export async function updateCategory(
  id: string,
  patch: Partial<CategoryDraft>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), patch);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
