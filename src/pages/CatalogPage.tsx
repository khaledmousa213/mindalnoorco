import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCategories, useProducts } from '../hooks/useCatalog';
import { getDescendantIds } from '../lib/categories';
import { FilterBar, type SortKey } from '../components/FilterBar';
import { ProductCard } from '../components/ProductCard';
import { Container, EmptyState, ErrorNote, PageLoader } from '../components/ui';
import { usePageMeta } from '../lib/meta';

const SORT_KEYS: SortKey[] = ['featured', 'name', 'newest'];

export const CatalogPage = () => {
  const [params, setParams] = useSearchParams();
  const { data: products, loading, error } = useProducts({ publishedOnly: true });
  const { data: categories } = useCategories();

  const search = params.get('q') ?? '';
  const category = params.get('category') ?? 'all';
  const brand = params.get('brand') ?? 'all';
  const sortParam = params.get('sort') ?? 'featured';
  const sort: SortKey = SORT_KEYS.includes(sortParam as SortKey)
    ? (sortParam as SortKey)
    : 'featured';

  const activeCategory = categories.find((c) => c.slug === category || c.name === category);
  usePageMeta(activeCategory ? activeCategory.name : 'Catalog');

  const setParam = (key: string, value: string, fallback = 'all') => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!value || value === fallback) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  };

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.slice();

    if (activeCategory) {
      // Matching a category also matches its sub-categories, so a top-level
      // category shows everything within it, not just directly-tagged products.
      const ids = getDescendantIds(categories, activeCategory.id);
      list = list.filter((p) => ids.includes(p.categoryId));
    }
    if (brand !== 'all') list = list.filter((p) => p.brand === brand);
    if (q) {
      list = list.filter((p) =>
        [p.name, p.brand, p.shortDescription, p.categoryName, ...p.keyFeatures]
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }

    list.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'newest') return b.createdAt - a.createdAt;
      // featured
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return a.order - b.order;
    });
    return list;
  }, [products, categories, activeCategory, brand, search, sort]);

  const parentCategory = activeCategory?.parentId
    ? categories.find((c) => c.id === activeCategory.parentId)
    : undefined;
  const siblingOrChildCategories = activeCategory
    ? activeCategory.parentId
      ? categories.filter((c) => c.parentId === activeCategory.parentId) // siblings
      : categories.filter((c) => c.parentId === activeCategory.id) // children
    : [];

  return (
    <Container className="py-8 space-y-6">
      <div>
        {parentCategory && (
          <Link
            to={`/category/${parentCategory.slug}`}
            className="text-xs font-bold text-teal-700 hover:underline"
          >
            ← {parentCategory.name}
          </Link>
        )}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {activeCategory ? activeCategory.name : 'Product catalog'}
        </h1>
        {activeCategory?.description ? (
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">{activeCategory.description}</p>
        ) : (
          <p className="text-sm text-slate-500 mt-1">
            Diagnostic imaging systems supplied and serviced by Mind Alnoor Co.
          </p>
        )}
        {siblingOrChildCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3">
            {siblingOrChildCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setParam('category', c.slug)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                  c.id === activeCategory?.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={(v) => setParam('q', v, '')}
        categories={categories.filter((c) => !c.parentId)}
        selectedCategory={(parentCategory ?? activeCategory)?.slug ?? 'all'}
        onSelectCategory={(slug) => setParam('category', slug)}
        brands={brands}
        selectedBrand={brand}
        onSelectBrand={(b) => setParam('brand', b)}
        sortBy={sort}
        onSortChange={(s) => setParam('sort', s, 'featured')}
        totalCount={products.length}
        filteredCount={filtered.length}
      />

      {error ? (
        <ErrorNote message={`Could not load products: ${error}`} />
      ) : loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No products match your filters"
          description="Try clearing the search or choosing a different category."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Container>
  );
};
