import { Sparkles } from 'lucide-react';
import { ProductCard } from '../ProductCard';
import { Container } from '../ui';
import type { CategoryBlockContext } from './types';

export function FeaturedInCategoryBlock({ ctx }: { ctx: CategoryBlockContext }) {
  const { category, categoryProducts } = ctx;
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
}
