import { ProductCard } from '../ProductCard';
import { Container, EmptyState, PageLoader } from '../ui';
import type { CategoryBlockContext } from './types';

/** Full product grid; only shown for categories that have no sub-categories. */
export function DirectProductsBlock({ ctx }: { ctx: CategoryBlockContext }) {
  const { category, children, categoryProducts, productsLoading } = ctx;
  if (children.length > 0) return null;

  return (
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
  );
}
