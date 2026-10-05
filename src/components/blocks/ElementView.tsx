import { useState } from 'react';
import { Lightbox } from '../Lightbox';
import { CARD_ICONS } from './icons';
import { SmartLink } from './SmartLink';
import { parseVideoUrl } from './video';
import { CategoryCardGrid, FeaturedProductsGrid, QuoteFormElement } from './DynamicElements';
import type { Align, ButtonItem, PageElement, Size } from './types';

export type Tone = 'light' | 'dark';

interface Props {
  element: PageElement;
  tone: Tone;
}

const ALIGN: Record<Align, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };
const JUSTIFY: Record<Align, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};
const HEADING: Record<1 | 2 | 3, string> = {
  1: 'text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight',
  2: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
  3: 'text-lg sm:text-xl font-extrabold',
};
const TEXT_SIZE: Record<Size, string> = {
  sm: 'text-sm leading-relaxed',
  md: 'text-[15px] leading-relaxed',
  lg: 'text-base sm:text-lg leading-relaxed',
};
const SPACER: Record<Size, string> = { sm: 'h-3', md: 'h-8', lg: 'h-16' };
const COLUMNS: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

function buttonClass(variant: ButtonItem['variant'], tone: Tone): string {
  const base = 'inline-flex items-center gap-2 font-bold text-sm px-5 py-3 rounded-full transition';
  if (variant === 'primary') {
    return `${base} bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white shadow-md shadow-teal-600/20`;
  }
  return tone === 'dark'
    ? `${base} bg-white/10 hover:bg-white/20 text-white`
    : `${base} bg-slate-100 hover:bg-slate-200 text-slate-800`;
}

export function ElementView({ element, tone }: Props) {
  const dark = tone === 'dark';

  switch (element.type) {
    case 'heading': {
      const Tag = `h${element.level}` as 'h1' | 'h2' | 'h3';
      return (
        <Tag className={`${HEADING[element.level]} ${dark ? 'text-white' : 'text-slate-900'} ${ALIGN[element.align ?? 'left']}`}>
          {element.text}
        </Tag>
      );
    }

    case 'text':
      return (
        <p
          className={`whitespace-pre-line ${TEXT_SIZE[element.size ?? 'md']} ${
            dark ? 'text-slate-300' : 'text-slate-700'
          } ${ALIGN[element.align ?? 'left']}`}
        >
          {element.text}
        </p>
      );

    case 'badge':
      return (
        <div>
          <span className="inline-flex items-center gap-2 bg-teal-50 text-teal-800 text-xs font-bold px-3.5 py-1 rounded-full border border-teal-200/70">
            <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse shrink-0" />
            {element.text}
          </span>
        </div>
      );

    case 'image':
      return element.url ? (
        <div className="rounded-2xl overflow-hidden bg-slate-100">
          <img src={element.url} alt={element.alt ?? ''} className="w-full h-auto block" />
        </div>
      ) : null;

    case 'gallery':
      return element.images.length > 0 ? <Gallery images={element.images} /> : null;

    case 'video': {
      const source = parseVideoUrl(element.url);
      if (source.kind === 'embed') {
        return (
          <div className="aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe
              src={source.src}
              title="Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        );
      }
      return source.kind === 'file' ? <video src={source.src} controls className="w-full rounded-2xl bg-black" /> : null;
    }

    case 'buttons':
      return element.items.length > 0 ? (
        <div className={`flex flex-wrap items-start gap-3 pt-1 ${JUSTIFY[element.align ?? 'left']}`}>
          {element.items.map((item) => (
            <SmartLink key={item.id} href={item.href} className={buttonClass(item.variant, tone)}>
              {item.label}
            </SmartLink>
          ))}
        </div>
      ) : null;

    case 'link':
      return (
        <div>
          <SmartLink
            href={element.href}
            className={`text-sm font-bold hover:underline ${dark ? 'text-teal-300' : 'text-teal-700'}`}
          >
            {element.label}
          </SmartLink>
        </div>
      );

    case 'divider':
      return <hr className={dark ? 'border-slate-700' : 'border-slate-200'} />;

    case 'spacer':
      return <div className={SPACER[element.size]} aria-hidden />;

    case 'cards':
      return (
        <div className={`grid ${COLUMNS[element.columns]} gap-4`}>
          {element.items.map((item) => {
            const Icon = CARD_ICONS[item.icon] ?? CARD_ICONS.ShieldCheck;
            const body = (
              <>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-50 to-sky-50 text-teal-700 flex items-center justify-center shrink-0 ring-1 ring-teal-100">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500 leading-relaxed mt-1 break-words">{item.text}</p>
                </div>
              </>
            );
            const cardClass =
              'bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 h-full shadow-sm shadow-slate-200/50';
            return item.href ? (
              <SmartLink
                key={item.id}
                href={item.href}
                className={`${cardClass} hover:border-teal-400 hover:-translate-y-0.5 hover:shadow-md transition`}
              >
                {body}
              </SmartLink>
            ) : (
              <div key={item.id} className={cardClass}>
                {body}
              </div>
            );
          })}
        </div>
      );

    case 'featuredProducts':
      return <FeaturedProductsGrid />;
    case 'categoryGrid':
      return <CategoryCardGrid />;
    case 'quoteForm':
      return <QuoteFormElement />;

    default:
      return null;
  }
}

function Gallery({ images }: { images: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpen(i)}
            className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group cursor-zoom-in"
          >
            <img src={url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          </button>
        ))}
      </div>
      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
