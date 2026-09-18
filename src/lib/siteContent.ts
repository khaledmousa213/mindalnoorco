import { doc, FieldPath, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Free-form site copy (headings, intros, taglines) that admins can edit
 * inline from the public pages, separate from the structured product /
 * category data. Everything lives in one small document keyed by a stable
 * string id per text block, e.g. "home.hero.title".
 */
const CONTENT_REF = doc(db, 'siteContent', 'default');

export function subscribeSiteContent(
  onData: (content: Record<string, string>) => void,
): () => void {
  return onSnapshot(
    CONTENT_REF,
    (snap) => onData((snap.data()?.content as Record<string, string>) ?? {}),
    () => onData({}),
  );
}

export async function setSiteContentValue(id: string, value: string): Promise<void> {
  // IMPORTANT: id itself contains dots (e.g. "home.hero.title"), so it must be
  // passed as its own FieldPath segment — a plain "content.<id>" string would
  // have every dot in `id` re-parsed as another level of nesting, scattering
  // each edit into the wrong place instead of one flat key under `content`.
  const path = new FieldPath('content', id);
  try {
    await updateDoc(CONTENT_REF, path, value);
  } catch {
    // Document doesn't exist yet — create it.
    await setDoc(CONTENT_REF, { content: { [id]: value } }, { merge: true });
  }
}
