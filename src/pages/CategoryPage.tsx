import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ImageOff, Sparkles } from 'lucide-react';
import { useCategories, useProducts } from '../hooks/useCatalog';
import { findBySlug, getDescendantIds } from '../lib/categories';
import { ProductCard } from '../components/ProductCard';
import { Container, EmptyState, PageLoader } from '../components/ui';
import { usePageMeta } from '../lib/meta';

export const CategoryPage = () => {
  const { slug = '' } = useParams();
  const { data: categories, loading: categoriesLoading } = useCategories();
  const { data: products, loading: productsLoading } = useProducts({ publishedOnly: true });

  const category = findBySlug(categories, slug);
  const children = useMemo(
    () => categories.filter((c) => c.parentId === category?.id).sort((a, b) => a.order - b.order),
    [categories, category],
  );

  usePageMeta(category?.name, category?.description);

  const descendantIds = useMemo(
    () => (category ? getDescendantIds(categories, category.id) : []),
    [categories, category],
  );
  const categoryProducts = useMemo(
    () => products.filter((p) => descendantIds.includes(p.categoryId)),
    [products, descendantIds],
  );
  const countFor = (categoryId: string) =>
    products.filter((p) => getDescendantIds(categories, categoryId).includes(p.categoryId)).length;

  if (categoriesLoading) return <PageLoader />;

  if (!category) {
    return (
      <Container className="py-24 text-center space-y-4">
        <p className="text-sm text-slate-500">We couldn&apos;t find that category.</p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          Browse the catalog
        </Link>
      </Container>
    );
  }

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        {category.imageUrl && (
          <img
            src={category.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-teal-950/80" />
        <Container className="relative py-14 sm:py-20 space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Link to="/catalog" className="hover:text-white font-semibold">
              Catalog
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-white font-bold">{category.name}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl">{category.name}</h1>
          {category.description && (
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}
          <Link
            to={`/catalog?category=${encodeURIComponent(category.slug)}`}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm px-5 py-3 rounded-full transition"
          >
            Shop all {category.name}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Container>
      </section>

      {/* Sub-categories */}
      {children.length > 0 && (
        <Container className="py-10 space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Browse {category.name} by series
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {children.map((child) => (
              <Link
                key={child.id}
                to={`/catalog?category=${encodeURIComponent(child.slug)}`}
                className="group bg-white border border-slate-200 hover:border-teal-400 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
              >
                <div className="h-40 bg-slate-100 overflow-hidden flex items-center justify-center">
                  {child.imageUrl ? (
                    <img
                      src={child.imageUrl}
                      alt={child.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ImageOff className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-black text-slate-900 group-hover:text-teal-700 transition">
                      {child.name}
                    </h3>
                    {child.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {child.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">{countFor(child.id)} systems</span>
                    <span className="text-teal-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      )}

      {/* Featured within this category */}
      {(() => {
        const featured = categoryProducts.filter((p) => p.isFeatured).slice(0, 3);
        if (featured.length === 0) return null;
        return (
          <Container className="py-10 space-y-6 border-t border-slate-200">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Featured in {category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Container>
        );
      })()}

      {/* Direct products (no sub-categories, or as a fallback) */}
      {children.length === 0 && (
        <Container className="py-10 space-y-6 border-t border-slate-200">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {category.name} systems
          </h2>
          {productsLoading ? (
            <PageLoader />
          ) : categoryProducts.length === 0 ? (
            <EmptyState
              title="No products yet"
              description="Check back soon, or browse the full catalog."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </Container>
      )}
    </div>
  );
};
