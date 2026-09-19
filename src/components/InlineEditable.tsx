import { useEffect, useState } from 'react';
import { Check, Loader2, Pencil } from 'lucide-react';

type TextTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div';

interface InlineEditableProps {
  value: string;
  /** Persist the new value. Rejecting shows a "save failed" note. */
  onCommit: (value: string) => Promise<void> | void;
  as?: TextTag;
  className?: string;
  /** Use a resizable textarea instead of a single-line input when editing.
   *  Defaults to true for anything except `span` (short inline labels). */
  multiline?: boolean;
  /** Shown (dimmed) when the value is empty. */
  placeholder?: string;
}

/**
 * Click-to-edit text primitive: renders `value`, turns into an input on click,
 * saves on blur / Enter, cancels on Escape. Callers decide whether to render
 * it at all (i.e. gate on admin) and where the value is stored.
 */
export function InlineEditable({
  value,
  onCommit,
  as: Tag = 'span',
  className = '',
  multiline,
  placeholder,
}: InlineEditableProps) {
  const isMultiline = multiline ?? Tag !== 'span';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const commit = async () => {
    setEditing(false);
    const next = draft.trim();
    if (!next || next === value) {
      setDraft(value);
      return;
    }
    setStatus('saving');
    try {
      await onCommit(next);
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
        placeholder={placeholder}
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
        placeholder={placeholder}
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
      {value || <span className="opacity-40 italic">{placeholder ?? 'Click to edit'}</span>}
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
