import { Link } from 'react-router-dom';
import { ArrowRight, PackageSearch, ShieldCheck, Wrench } from 'lucide-react';
import { useCategories, useProducts } from '../hooks/useCatalog';
import { ProductCard } from '../components/ProductCard';
import { Container, PageLoader } from '../components/ui';
import { useQuoteModal } from '../components/QuoteModalProvider';
import { usePageMeta } from '../lib/meta';
import { COMPANY } from '../lib/company';

export const HomePage = () => {
  usePageMeta();
  const { data: products, loading } = useProducts({ publishedOnly: true });
  const { data: categories } = useCategories();
  const { open: openQuote } = useQuoteModal();

  const featured = (() => {
    const marked = products.filter((p) => p.isFeatured);
    return (marked.length > 0 ? marked : products).slice(0, 3);
  })();

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <Container className="py-12 sm:py-16">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex items-center gap-2 bg-teal-50 text-teal-800 text-xs font-bold px-3.5 py-1 rounded-full border border-teal-200/70">
              <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
              Authorized Mindray distributor · {COMPANY.city}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              Diagnostic imaging equipment for{' '}
              <span className="bg-gradient-to-r from-sky-600 via-teal-600 to-lime-600 bg-clip-text text-transparent">
                hospitals and clinics
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Ultrasound systems, digital radiography, and surgical imaging — supplied, installed, and
              serviced by {COMPANY.name}, with clinical training and manufacturer warranty.
            </p>
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

      {/* Trust strip */}
      <Container className="py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: ShieldCheck, title: 'Manufacturer warranty', text: 'Genuine equipment with OEM warranty and software support.' },
            { icon: Wrench, title: 'Installation & service', text: 'Commissioning, preventive maintenance, and spare parts.' },
            { icon: PackageSearch, title: 'Clinical training', text: 'On-site application training for your clinical teams.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Featured products */}
      <Container className="py-8 space-y-6">
        <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured systems</h2>
            <p className="text-xs text-slate-500 mt-1">A selection from our current catalog.</p>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline shrink-0 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <PageLoader />
        ) : featured.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            No products published yet. Sign in to the admin area to add your first product.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>

      {/* Categories */}
      {categories.length > 0 && (
        <Container className="py-8 space-y-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Browse by category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${encodeURIComponent(cat.slug)}`}
                  className="group bg-white border border-slate-200 hover:border-teal-400 rounded-2xl p-5 transition shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-slate-900 group-hover:text-teal-700 transition">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-teal-700 mt-4 flex items-center gap-1">
                    View products <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      )}
    </div>
  );
};
