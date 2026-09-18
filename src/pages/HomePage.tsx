import { Link } from 'react-router-dom';
import { ArrowRight, ImageOff, PackageSearch, ShieldCheck, Wrench } from 'lucide-react';
import { useCategories, useProducts } from '../hooks/useCatalog';
import { buildCategoryTree, getDescendantIds } from '../lib/categories';
import { ProductCard } from '../components/ProductCard';
import { EditableText } from '../components/EditableText';
import { Container, PageLoader } from '../components/ui';
import { useQuoteModal } from '../components/QuoteModalProvider';
import { usePageMeta } from '../lib/meta';
import { COMPANY } from '../lib/company';

const TRUST_ITEMS = [
  {
    key: 'warranty',
    icon: ShieldCheck,
    title: 'Manufacturer warranty',
    text: 'Genuine equipment with OEM warranty and software support.',
  },
  {
    key: 'service',
    icon: Wrench,
    title: 'Installation & service',
    text: 'Commissioning, preventive maintenance, and spare parts.',
  },
  {
    key: 'training',
    icon: PackageSearch,
    title: 'Clinical training',
    text: 'On-site application training for your clinical teams.',
  },
] as const;

export const HomePage = () => {
  usePageMeta();
  const { data: products, loading } = useProducts({ publishedOnly: true });
  const { data: categories } = useCategories();
  const { open: openQuote } = useQuoteModal();
  const topCategories = buildCategoryTree(categories);

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
              <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse shrink-0" />
              <EditableText
                id="home.hero.badge"
                defaultValue={`Authorized Mindray distributor · ${COMPANY.city}`}
              />
            </span>
            <EditableText
              as="h1"
              id="home.hero.title"
              defaultValue="Diagnostic imaging equipment for hospitals and clinics"
              className="block text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight"
            />
            <EditableText
              as="p"
              id="home.hero.subtitle"
              multiline
              defaultValue={`Ultrasound systems, digital radiography, and surgical imaging — supplied, installed, and serviced by ${COMPANY.name}, with clinical training and manufacturer warranty.`}
              className="block text-sm sm:text-base text-slate-600 leading-relaxed"
            />
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
          {TRUST_ITEMS.map(({ key, icon: Icon, title, text }) => (
            <div key={key} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <EditableText
                  as="p"
                  id={`home.trust.${key}.title`}
                  defaultValue={title}
                  className="block text-xs font-bold text-slate-900"
                />
                <EditableText
                  as="p"
                  id={`home.trust.${key}.text`}
                  defaultValue={text}
                  multiline
                  className="block text-xs text-slate-500 leading-relaxed mt-0.5"
                />
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Featured products */}
      <Container className="py-8 space-y-6">
        <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <EditableText
              as="h2"
              id="home.featured.title"
              defaultValue="Featured systems"
              className="block text-2xl font-black text-slate-900 tracking-tight"
            />
            <EditableText
              as="p"
              id="home.featured.subtitle"
              defaultValue="A selection from our current catalog."
              className="block text-xs text-slate-500 mt-1"
            />
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
      {topCategories.length > 0 && (
        <Container className="py-8 space-y-6">
          <EditableText
            as="h2"
            id="home.categories.title"
            defaultValue="Shop by product line"
            className="block text-2xl font-black text-slate-900 tracking-tight"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topCategories.map((cat) => {
              const count = products.filter((p) =>
                getDescendantIds(categories, cat.id).includes(p.categoryId),
              ).length;
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="group bg-white border border-slate-200 hover:border-teal-400 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
                >
                  <div className="h-44 bg-slate-100 overflow-hidden flex items-center justify-center">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <ImageOff className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-900 group-hover:text-teal-700 transition">
                          {cat.name}
                        </h3>
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
                      {cat.children.length > 0 ? 'Browse series' : 'View products'}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      )}
    </div>
  );
};
