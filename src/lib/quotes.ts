import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { QuoteRequest, QuoteRequestInput, QuoteStatus } from './types';

const COLLECTION = 'quoteRequests';
const quotesRef = collection(db, COLLECTION);

function fromDoc(id: string, data: Record<string, unknown>): QuoteRequest {
  return {
    id,
    createdAt: typeof data.createdAt === 'number' ? (data.createdAt as number) : 0,
    status: (data.status as QuoteStatus) ?? 'new',
    name: (data.name as string) ?? '',
    email: (data.email as string) ?? '',
    phone: (data.phone as string) ?? '',
    organization: (data.organization as string) ?? '',
    message: (data.message as string) ?? '',
    products: (data.products as QuoteRequest['products']) ?? [],
    source: (data.source as string) ?? '',
  };
}

/**
 * Persist a quote/contact request, then best-effort ping the email function.
 * The Firestore write is the source of truth: if the email call fails the
 * caller still treats the submission as successful.
 */
export async function createQuoteRequest(input: QuoteRequestInput): Promise<string> {
  const payload = {
    ...input,
    status: 'new' as QuoteStatus,
    createdAt: Date.now(),
  };
  const ref = await addDoc(quotesRef, payload);

  try {
    await fetch('/api/quote-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ref.id, ...payload }),
    });
  } catch {
    // Email is a notification convenience only — never block the user on it.
  }

  return ref.id;
}

export function subscribeQuoteRequests(
  onData: (requests: QuoteRequest[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return onSnapshot(
    query(quotesRef, orderBy('createdAt', 'desc')),
    (snap) => onData(snap.docs.map((d) => fromDoc(d.id, d.data()))),
    (err) => onError?.(err),
  );
}

export async function setQuoteStatus(id: string, status: QuoteStatus): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { status });
}
