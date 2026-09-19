import { useRef, useState } from 'react';
import { ImageOff, Loader2, Pencil, Trash2 } from 'lucide-react';
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES, deleteStorageFile } from '../lib/storage';
import { useAuth } from '../lib/auth';

interface EditableImageProps {
  value: string;
  /** Persist the new image URL ('' clears it). */
  onCommit: (url: string) => Promise<void> | void;
  /** Uploads the picked file and resolves to its download URL. */
  upload: (file: File) => Promise<string>;
  /** Sizing/rounding for the frame, e.g. "h-56 rounded-2xl overflow-hidden". */
  className?: string;
  alt?: string;
}

/** Image that admins can replace or remove in place; everyone else just sees it. */
export function EditableImage({ value, onCommit, upload, className = '', alt = '' }: EditableImageProps) {
  const { isAdmin } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const picture = value ? (
    <img src={value} alt={alt} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full min-h-24 flex items-center justify-center bg-slate-100">
      <ImageOff className="w-6 h-6 text-slate-300" />
    </div>
  );

  if (!isAdmin) {
    return value ? <div className={`bg-slate-100 ${className}`}>{picture}</div> : null;
  }

  const onFile = async (file: File) => {
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image is too large (max 8 MB).');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const previous = value;
      const url = await upload(file);
      await onCommit(url);
      if (previous) void deleteStorageFile(previous);
    } catch {
      setError('Upload failed — check you are signed in and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`relative group/img bg-slate-100 ${className}`}>
      {picture}
      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition flex items-center justify-center gap-2 opacity-0 group-hover/img:opacity-100">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="p-2 rounded-full bg-white/90 text-slate-800 hover:bg-white cursor-pointer disabled:opacity-60"
          title="Change image"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => void onCommit('')}
            disabled={busy}
            className="p-2 rounded-full bg-white/90 text-rose-600 hover:bg-white cursor-pointer disabled:opacity-60"
            title="Remove image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {error && (
        <p className="absolute bottom-1 left-1 right-1 text-[10px] font-bold text-rose-700 bg-rose-50/95 rounded px-1.5 py-0.5">
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
