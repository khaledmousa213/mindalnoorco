import { Link } from 'react-router-dom';
import { ArrowRight, ImageOff } from 'lucide-react';
import type { Product } from '../lib/types';
import { useQuoteModal } from './QuoteModalProvider';

export const ProductCard = ({ product }: { product: Product }) => {
  const { open: openQuote } = useQuoteModal();
  const image = product.images[0];

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 hover:border-teal-400 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      <Link
        to={`/product/${product.slug}`}
        className="relative block h-48 sm:h-52 bg-slate-100 overflow-hidden"
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageOff className="w-10 h-10" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.categoryName && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-700 border border-slate-200 shadow-xs">
              {product.categoryName}
            </span>
          )}
          {!product.isPublished && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
              Draft
            </span>
          )}
        </div>
      </Link>

      <div className="flex-1 flex flex-col p-4 sm:p-5">
        <div className="flex-1 space-y-2">
          {product.brand && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
              {product.brand}
            </span>
          )}
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
            <Link to={`/product/${product.slug}`} className="hover:text-teal-700 transition">
              {product.name}
            </Link>
          </h3>
          {product.shortDescription && (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              {product.shortDescription}
            </p>
          )}
          {product.keyFeatures.length > 0 && (
            <ul className="space-y-1 pt-1">
              {product.keyFeatures.slice(0, 2).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <span className="text-teal-600 font-bold leading-none">•</span>
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pt-4 mt-3 border-t border-slate-100 space-y-3">
          {product.priceRange && (
            <div className="text-sm font-black text-slate-900">{product.priceRange}</div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/product/${product.slug}`}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center justify-center gap-1.5"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() =>
                openQuote({
                  products: [{ id: product.id, name: product.name }],
                  source: `product:${product.slug}`,
                })
              }
              className="px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white transition shadow-xs cursor-pointer"
            >
              Request quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
