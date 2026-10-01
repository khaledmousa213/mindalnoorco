import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { subscribeSiteContent, setSiteContentValue } from '../lib/siteContent';

interface SiteContentApi {
  content: Record<string, string>;
  setValue: (id: string, value: string) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentApi | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => subscribeSiteContent(setContent), []);

  const setValue = useCallback(async (id: string, value: string) => {
    setContent((c) => ({ ...c, [id]: value })); // optimistic
    await setSiteContentValue(id, value);
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, setValue }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent(): SiteContentApi {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within <SiteContentProvider>');
  return ctx;
}

type TextTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div';

/** Site-wide texts that are not part of a page's blocks, with their built-in wording. */
export const SITE_TEXTS: { id: string; label: string; defaultValue: string; multiline?: boolean }[] = [
  {
    id: 'footer.description',
    label: 'Footer · Company description',
    multiline: true,
    defaultValue:
      'Supplier of diagnostic ultrasound, digital radiography, and surgical imaging systems for hospitals and clinics — with installation, clinical training, and after-sales service.',
  },
];

interface SiteTextProps {
  /** Stable unique key for this text block, e.g. "footer.description". */
  id: string;
  defaultValue: string;
  as?: TextTag;
  className?: string;
}

/**
 * Plain-text content keyed by a stable id in the flat `siteContent` doc,
 * falling back to `defaultValue`. Page sections built from blocks store their
 * text in the block's own props instead.
 */
export function SiteText({ id, defaultValue, as: Tag = 'span', className = '' }: SiteTextProps) {
  const { content } = useSiteContent();
  return <Tag className={className}>{content[id] ?? defaultValue}</Tag>;
}
