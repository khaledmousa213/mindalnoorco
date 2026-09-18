import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
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
  try {
    // Dot-path update touches only this one key, leaving the rest of the map alone.
    await updateDoc(CONTENT_REF, { [`content.${id}`]: value });
  } catch {
    // Document doesn't exist yet — create it.
    await setDoc(CONTENT_REF, { content: { [id]: value } }, { merge: true });
  }
}
