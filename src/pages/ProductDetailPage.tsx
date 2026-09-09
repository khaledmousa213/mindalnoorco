import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  FileText,
  ImageOff,
  Share2,
} from 'lucide-react';
import { useProducts } from '../hooks/useCatalog';
import { getProductBySlug } from '../lib/products';
import { ProductCard } from '../components/ProductCard';
import { Container, PageLoader } from '../components/ui';
import { useQuoteModal } from '../components/QuoteModalProvider';
import { usePageMeta } from '../lib/meta';
import type { Product } from '../lib/types';

export const ProductDetailPage = () => {
  const { slug = '' } = useParams();
  const { data: products, loading } = useProducts({ publishedOnly: true });
  const { open: openQuote } = useQuoteModal();

  const [fallback, setFallback] = useState<Product | null | undefined>(undefined);
  const product = useMemo(
    () => products.find((p) => p.slug === slug) ?? fallback ?? null,
    [products, slug, fallback],
  );

  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveImage(0);
  }, [slug]);

  // If not in the published list (e.g. a draft opened by an admin), try a direct read.
  useEffect(() => {
    if (!loading && !products.find((p) => p.slug === slug)) {
      getProductBySlug(slug).then(setFallback).catch(() => setFallback(null));
    }
  }, [loading, products, slug]);

  usePageMeta(product?.name, product?.shortDescription);

  if (loading && fallback === undefined) {
    return <PageLoader label="Loading product…" />;
  }

  if (!product) {
    return (
      <Container className="py-24 text-center space-y-4">
        <p className="text-sm text-slate-500">This product is no longer available.</p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to catalog
        </Link>
      </Container>
    );
  }

  const related = products
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 3);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <Container className="py-8 space-y-10">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/catalog" className="hover:text-teal-700 font-semibold">
          Catalog
        </Link>
        <span className="text-slate-300">/</span>
        <Link
          to={`/catalog?category=${encodeURIComponent(product.categoryName)}`}
          className="hover:text-teal-700 font-semibold"
        >
          {product.categoryName}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-bold truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gallery */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 h-72 sm:h-96 flex items-center justify-center">
            {product.images[activeImage] ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageOff className="w-12 h-12 text-slate-300" />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    activeImage === idx
                      ? 'border-teal-500 ring-2 ring-teal-500/30'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary + actions */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            {product.brand && (
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                {product.brand}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>
            {product.shortDescription && (
              <p className="text-sm text-slate-600 leading-relaxed">{product.shortDescription}</p>
            )}
            {product.priceRange && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Pricing
                </span>
                <span className="text-lg font-black text-slate-900">{product.priceRange}</span>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                onClick={() =>
                  openQuote({
                    products: [{ id: product.id, name: product.name }],
                    source: `product:${product.slug}`,
                  })
                }
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white font-bold text-sm transition shadow-sm cursor-pointer"
              >
                Request a quote
              </button>
              <div className="grid grid-cols-2 gap-2">
                {product.datasheetUrl && (
                  <a
                    href={product.datasheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    Datasheet
                  </a>
                )}
                <button
                  onClick={handleShare}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    product.datasheetUrl ? '' : 'col-span-2'
                  } bg-slate-100 hover:bg-slate-200 text-slate-800`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-600" /> Link copied
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {product.keyFeatures.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Key features
              </h2>
              <ul className="space-y-2">
                {product.keyFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-3">
          <h2 className="text-lg font-black text-slate-900">Overview</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </section>
      )}

      {/* Specs */}
      {product.specs.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
          <h2 className="text-lg font-black text-slate-900">Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {product.specs.map((row, idx) => (
                  <tr key={idx}>
                    <th className="py-2.5 pr-4 text-left font-semibold text-slate-500 align-top w-1/3 min-w-[140px]">
                      {row.label}
                    </th>
                    <td className="py-2.5 text-slate-900 font-medium">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-lg font-black text-slate-900">Related products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
};
