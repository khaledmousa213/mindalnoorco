import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  FileText,
  ImageOff,
  MessageCircle,
  Share2,
} from 'lucide-react';
import { useProducts } from '../hooks/useCatalog';
import { getProductBySlug } from '../lib/products';
import { ProductCard } from '../components/ProductCard';
import { Lightbox } from '../components/Lightbox';
import { Container, PageLoader } from '../components/ui';
import { useQuoteModal } from '../components/QuoteModalProvider';
import { usePageMeta } from '../lib/meta';
import { COMPANY } from '../lib/company';
import { whatsAppLink } from '../lib/whatsapp';
import type { Product } from '../lib/types';

type TabKey = 'overview' | 'specs' | 'photos' | 'probes';

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
  const [tab, setTab] = useState<TabKey | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    setActiveImage(0);
    setTab(null);
    setLightbox(null);
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

  const tabs: { key: TabKey; label: string }[] = [
    ...(product.description ? [{ key: 'overview' as const, label: 'Overview' }] : []),
    ...(product.specs.length > 0 ? [{ key: 'specs' as const, label: 'Specifications' }] : []),
    ...(product.photos.length > 0 ? [{ key: 'photos' as const, label: 'Real photos' }] : []),
    ...(product.probes.length > 0 ? [{ key: 'probes' as const, label: 'Probes' }] : []),
  ];
  const currentTab = tabs.find((t) => t.key === tab)?.key ?? tabs[0]?.key;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const smallButton =
    'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer';

  return (
    <Container className="w-full py-8 space-y-8">
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

      {/* Name across the top */}
      <div className="space-y-1">
        {product.brand && (
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">{product.brand}</span>
        )}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          {product.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: product picture */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 h-72 sm:h-[28rem] flex items-center justify-center">
            {product.images[activeImage] ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-contain"
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
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 bg-white transition cursor-pointer ${
                    activeImage === idx
                      ? 'border-teal-500 ring-2 ring-teal-500/30'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            {product.shortDescription && (
              <p className="text-sm text-slate-700 leading-relaxed">{product.shortDescription}</p>
            )}

            {product.keyFeatures.length > 0 && (
              <ul className="space-y-2">
                {product.keyFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {product.priceRange && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Pricing</span>
                <span className="text-lg font-black text-slate-900">{product.priceRange}</span>
              </div>
            )}

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

            {COMPANY.whatsapp && (
              <a
                href={whatsAppLink(
                  COMPANY.whatsapp,
                  `Hello, I'm interested in the ${product.name}. ${window.location.href}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="-mt-2 w-full py-3 rounded-xl border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Ask on WhatsApp
              </a>
            )}

            <div className="flex flex-wrap gap-2">
              {product.datasheetUrl && (
                <a href={product.datasheetUrl} target="_blank" rel="noopener noreferrer" className={smallButton}>
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  Catalog
                </a>
              )}
              <button onClick={handleShare} className={smallButton}>
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
      </div>

      {/* Sections below: Overview / Specifications / Real photos / Probes */}
      {tabs.length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 sm:px-6" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={currentTab === t.key}
                onClick={() => setTab(t.key)}
                className={`relative px-4 py-4 text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                  currentTab === t.key ? 'text-teal-700' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.label}
                {currentTab === t.key && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-teal-600" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {currentTab === 'overview' && (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line max-w-4xl">
                {product.description}
              </p>
            )}

            {currentTab === 'specs' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {product.specs.map((row, idx) =>
                      row.label ? (
                        <tr key={idx}>
                          <th className="py-2.5 pr-4 text-left font-semibold text-slate-500 align-top w-1/3 min-w-[140px]">
                            {row.label}
                          </th>
                          <td className="py-2.5 text-slate-900 font-medium">{row.value}</td>
                        </tr>
                      ) : (
                        <tr key={idx}>
                          <td colSpan={2} className="py-2.5 text-slate-800">
                            {row.value}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {currentTab === 'photos' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {product.photos.map((url, idx) => (
                  <button
                    key={url}
                    onClick={() => setLightbox(idx)}
                    className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group cursor-zoom-in"
                  >
                    <img
                      src={url}
                      alt={`${product.name} — photo ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </button>
                ))}
              </div>
            )}

            {currentTab === 'probes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.probes.map((probe) => (
                  <div key={probe.id} className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
                    {/* Pictures are optional: a probe without one is just its name and description. */}
                    {probe.image && (
                      <div className="h-44 bg-white flex items-center justify-center border-b border-slate-100">
                        <img src={probe.image} alt={probe.name} loading="lazy" className="max-h-full max-w-full object-contain p-3" />
                      </div>
                    )}
                    <div className="p-4 space-y-1">
                      <p className="text-sm font-black text-slate-900">{probe.name}</p>
                      {probe.description && (
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{probe.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {lightbox !== null && (
        <Lightbox images={product.photos} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
      )}
    </Container>
  );
};
