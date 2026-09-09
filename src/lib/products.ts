import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product, ProductDraft } from './types';

const COLLECTION = 'products';
const productsRef = collection(db, COLLECTION);

function fromDoc(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    slug: (data.slug as string) ?? id,
    name: (data.name as string) ?? '',
    brand: (data.brand as string) ?? '',
    categoryId: (data.categoryId as string) ?? '',
    categoryName: (data.categoryName as string) ?? '',
    shortDescription: (data.shortDescription as string) ?? '',
    description: (data.description as string) ?? '',
    images: (data.images as string[]) ?? [],
    keyFeatures: (data.keyFeatures as string[]) ?? [],
    specs: (data.specs as Product['specs']) ?? [],
    priceRange: (data.priceRange as string) ?? '',
    datasheetUrl: (data.datasheetUrl as string) ?? '',
    isFeatured: Boolean(data.isFeatured),
    isPublished: Boolean(data.isPublished),
    order: typeof data.order === 'number' ? (data.order as number) : 0,
    createdAt: typeof data.createdAt === 'number' ? (data.createdAt as number) : 0,
    updatedAt: typeof data.updatedAt === 'number' ? (data.updatedAt as number) : 0,
  };
}

export interface SubscribeProductsOptions {
  /** When true, only isPublished products are returned (public site). */
  publishedOnly?: boolean;
}

/**
 * Live subscription to the product catalog, ordered by `order`.
 * Returns an unsubscribe function.
 */
export function subscribeProducts(
  options: SubscribeProductsOptions,
  onData: (products: Product[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const constraints: QueryConstraint[] = [];
  if (options.publishedOnly) {
    constraints.push(where('isPublished', '==', true));
  }
  constraints.push(orderBy('order', 'asc'));

  return onSnapshot(
    query(productsRef, ...constraints),
    (snap) => onData(snap.docs.map((d) => fromDoc(d.id, d.data()))),
    (err) => onError?.(err),
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const snap = await getDocs(query(productsRef, where('slug', '==', slug)));
  if (snap.empty) return null;
  const first = snap.docs[0];
  return fromDoc(first.id, first.data());
}

export async function isSlugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const snap = await getDocs(query(productsRef, where('slug', '==', slug)));
  return snap.docs.some((d) => d.id !== exceptId);
}

export async function getNextOrder(): Promise<number> {
  const snap = await getDocs(query(productsRef, orderBy('order', 'desc')));
  if (snap.empty) return 0;
  const top = snap.docs[0].data().order;
  return (typeof top === 'number' ? top : 0) + 1;
}

export async function createProduct(draft: ProductDraft): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(productsRef, { ...draft, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function updateProduct(
  id: string,
  patch: Partial<ProductDraft>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...patch, updatedAt: Date.now() });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/** Persist a new ordering. `orderedIds` is the full list top-to-bottom. */
export async function reorderProducts(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, COLLECTION, id), { order: index, updatedAt: Date.now() });
  });
  await batch.commit();
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? fromDoc(snap.id, snap.data()) : null;
}
