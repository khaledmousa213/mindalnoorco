import { useEffect } from 'react';

const BASE_TITLE = 'Mind Alnoor Co.';
const DEFAULT_DESCRIPTION =
  'Mind Alnoor Co. — medical diagnostic imaging equipment supplier and authorized Mindray distributor in Amman, Jordan.';

/**
 * Sets document.title and the meta description for a page. Restores the
 * description on unmount so pages don't leak stale text into each other.
 */
export function usePageMeta(title?: string, description?: string): void {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | Medical Imaging Equipment`;

    const tag = document.querySelector('meta[name="description"]');
    const previous = tag?.getAttribute('content') ?? DEFAULT_DESCRIPTION;
    tag?.setAttribute('content', description ?? DEFAULT_DESCRIPTION);

    return () => {
      tag?.setAttribute('content', previous);
    };
  }, [title, description]);
}
