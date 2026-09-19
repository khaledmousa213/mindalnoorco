import { Link } from 'react-router-dom';
import { ArrowRight, PackageSearch } from 'lucide-react';
import { InlineEditable } from '../InlineEditable';
import { Container } from '../ui';
import { useQuoteModal } from '../QuoteModalProvider';
import type { Block, HeroHomeProps } from './types';

interface Props {
  block: Block;
  isAdmin: boolean;
  onUpdateProps: (patch: Partial<HeroHomeProps>) => void;
}

export function HeroHomeBlock({ block, isAdmin, onUpdateProps }: Props) {
  const props = block.props as unknown as HeroHomeProps;
  const { open: openQuote } = useQuoteModal();

  return (
    <section className="bg-white border-b border-slate-200">
      <Container className="py-12 sm:py-16">
        <div className="max-w-3xl space-y-5">
          <span className="inline-flex items-center gap-2 bg-teal-50 text-teal-800 text-xs font-bold px-3.5 py-1 rounded-full border border-teal-200/70">
            <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse shrink-0" />
            {isAdmin ? (
              <InlineEditable value={props.badge ?? ''} onCommit={(badge) => onUpdateProps({ badge })} />
            ) : (
              props.badge
            )}
          </span>
          {isAdmin ? (
            <InlineEditable
              as="h1"
              value={props.title ?? ''}
              onCommit={(title) => onUpdateProps({ title })}
              className="block text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight"
            />
          ) : (
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              {props.title}
            </h1>
          )}
          {isAdmin ? (
            <InlineEditable
              as="p"
              multiline
              value={props.subtitle ?? ''}
              onCommit={(subtitle) => onUpdateProps({ subtitle })}
              className="block text-sm sm:text-base text-slate-600 leading-relaxed"
            />
          ) : (
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{props.subtitle}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white font-bold text-sm px-5 py-3 rounded-full shadow-md shadow-teal-600/20 transition"
            >
              <PackageSearch className="w-4 h-4" />
              Browse the catalog
            </Link>
            <button
              onClick={() => openQuote({ source: 'home-hero' })}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm px-5 py-3 rounded-full transition cursor-pointer"
            >
              Request a quote
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
