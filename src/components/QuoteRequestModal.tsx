import { useEffect } from 'react';
import { X } from 'lucide-react';
import { QuoteRequestForm } from './QuoteRequestForm';
import type { QuoteRequestProductRef } from '../lib/types';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: QuoteRequestProductRef[];
  source: string;
}

export const QuoteRequestModal = ({ isOpen, onClose, products, source }: QuoteRequestModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold leading-tight">Request a quote</h2>
            <p className="text-xs text-slate-400">We usually reply within one business day.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <QuoteRequestForm products={products} source={source} />
        </div>
      </div>
    </div>
  );
};
