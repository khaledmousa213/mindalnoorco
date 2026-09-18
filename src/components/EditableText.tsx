import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Check, Loader2, Pencil } from 'lucide-react';
import { subscribeSiteContent, setSiteContentValue } from '../lib/siteContent';
import { useAuth } from '../lib/auth';

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
 * Plain-text content block. For everyone else it just renders the current
 * value; for a signed-in admin it becomes click-to-edit, saving to Firestore
 * on blur / Enter. Product and category fields are NOT wired through this —
 * they keep their dedicated admin forms (images, specs, category pickers).
 */
export function EditableText({
  id,
  defaultValue,
  as: Tag = 'span',
  className = '',
  multiline,
}: EditableTextProps) {
  const isMultiline = multiline ?? Tag !== 'span';
  const { isAdmin } = useAuth();
  const { content, setValue } = useSiteContent();
  const value = content[id] ?? defaultValue;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  if (!isAdmin) {
    return <Tag className={className}>{value}</Tag>;
  }

  const commit = async () => {
    setEditing(false);
    const next = draft.trim();
    if (!next || next === value) {
      setDraft(value);
      return;
    }
    setStatus('saving');
    try {
      await setValue(id, next);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  if (editing) {
    // box-border keeps the border/padding inside the same width as the text
    // it replaces, instead of growing past the surrounding layout.
    const inputClass = `${className} block w-full box-border bg-amber-50 border-2 border-amber-400 rounded-md outline-none px-2 py-1`;
    return isMultiline ? (
      <textarea
        autoFocus
        rows={3}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`${inputClass} resize-y`}
      />
    ) : (
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={inputClass}
      />
    );
  }

  return (
    <Tag
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      title="Click to edit"
      className={`${className} group/edit cursor-text rounded-md outline-dashed outline-1 outline-teal-300/70 outline-offset-2 hover:outline-teal-500 hover:bg-teal-50/50 transition`}
    >
      {value}
      {status === 'saving' ? (
        <Loader2 className="inline-block w-3.5 h-3.5 ml-1 align-middle animate-spin text-teal-600" />
      ) : status === 'saved' ? (
        <Check className="inline-block w-3.5 h-3.5 ml-1 align-middle text-emerald-600" />
      ) : status === 'error' ? (
        <span className="inline-block ml-1 align-middle text-[10px] font-bold text-rose-600">
          save failed
        </span>
      ) : (
        <Pencil className="inline-block w-3 h-3 ml-1.5 align-middle opacity-40 group-hover/edit:opacity-80 transition" />
      )}
    </Tag>
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
