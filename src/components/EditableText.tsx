import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { subscribeSiteContent, setSiteContentValue } from '../lib/siteContent';
import { useAuth } from '../lib/auth';
import { InlineEditable } from './InlineEditable';

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

function useSiteContent(): SiteContentApi {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within <SiteContentProvider>');
  return ctx;
}

type TextTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div';

interface EditableTextProps {
  /** Stable unique key for this text block, e.g. "home.hero.title". */
  id: string;
  defaultValue: string;
  as?: TextTag;
  className?: string;
  /** Use a resizable textarea instead of a single-line input when editing.
   *  Defaults to true for anything except `span` (short inline labels). */
  multiline?: boolean;
}

/**
 * Plain-text content block keyed by a stable id in the flat `siteContent`
 * doc. For everyone else it just renders the current value; for a signed-in
 * admin it becomes click-to-edit (see InlineEditable). Page sections built
 * from blocks store their text in the block's own props instead.
 */
export function EditableText({
  id,
  defaultValue,
  as: Tag = 'span',
  className = '',
  multiline,
}: EditableTextProps) {
  const { isAdmin } = useAuth();
  const { content, setValue } = useSiteContent();
  const value = content[id] ?? defaultValue;

  if (!isAdmin) {
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <InlineEditable
      as={Tag}
      value={value}
      onCommit={(next) => setValue(id, next)}
      className={className}
      multiline={multiline}
    />
  );
}

export function EditModeBanner() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return null;
  return (
    <div className="bg-amber-400 text-amber-950 text-xs font-bold text-center py-1.5 px-4">
      Edit mode is on — text with a dashed outline can be clicked to change it.
    </div>
  );
}
