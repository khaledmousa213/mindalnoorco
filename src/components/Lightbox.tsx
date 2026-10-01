import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/** Full-screen photo viewer with previous / next and Escape to close. */
export function Lightbox({
  images,
  index,
  onIndex,
  onClose,
}: {
  images: string[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const go = (dir: -1 | 1) => onIndex((index + dir + images.length) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const navButton =
    'absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4" onClick={onClose}>
      <img
        src={images[index]}
        alt=""
        className="max-h-[85vh] max-w-full rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      {images.length > 1 && (
        <>
          <button
            className={`${navButton} left-4`}
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className={`${navButton} right-4`}
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="absolute bottom-4 text-xs font-bold text-white/70">
            {index + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
}
