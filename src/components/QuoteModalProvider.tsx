import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { QuoteRequestModal } from './QuoteRequestModal';
import type { QuoteRequestProductRef } from '../lib/types';

interface OpenOptions {
  products?: QuoteRequestProductRef[];
  source?: string;
}

interface QuoteModalApi {
  open: (options?: OpenOptions) => void;
}

const QuoteModalContext = createContext<QuoteModalApi | null>(null);

export function useQuoteModal(): QuoteModalApi {
  const ctx = useContext(QuoteModalContext);
  if (!ctx) throw new Error('useQuoteModal must be used within <QuoteModalProvider>');
  return ctx;
}

export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<QuoteRequestProductRef[]>([]);
  const [source, setSource] = useState('contact');

  const open = useCallback((options?: OpenOptions) => {
    setProducts(options?.products ?? []);
    setSource(options?.source ?? 'contact');
    setIsOpen(true);
  }, []);

  const api = useMemo<QuoteModalApi>(() => ({ open }), [open]);

  return (
    <QuoteModalContext.Provider value={api}>
      {children}
      <QuoteRequestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        products={products}
        source={source}
      />
    </QuoteModalContext.Provider>
  );
}
