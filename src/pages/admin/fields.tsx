import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

/** Labelled text input that saves on blur (or Enter) and shows a small "Saved" tick. */
export function TextField({
  label,
  value,
  placeholder,
  multiline,
  allowEmpty,
  onSave,
}: {
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  allowEmpty?: boolean;
  onSave: (value: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => setDraft(value), [value]);

  const commit = async () => {
    const next = draft.trim();
    if (next === value.trim() || (!next && !allowEmpty)) {
      setDraft(value);
      return;
    }
    setStatus('saving');
    try {
      await onSave(next);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('idle');
    }
  };

  const cls =
    'w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

  return (
    <label className="block space-y-1">
      <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
        {label}
        {status === 'saving' && <Loader2 className="w-3 h-3 animate-spin" />}
        {status === 'saved' && <span className="text-teal-600">Saved</span>}
      </span>
      {multiline ? (
        <textarea
          rows={3}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void commit()}
          className={cls}
        />
      ) : (
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className={cls}
        />
      )}
    </label>
  );
}
