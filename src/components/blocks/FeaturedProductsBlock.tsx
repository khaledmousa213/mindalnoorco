import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { InlineEditable } from '../InlineEditable';
import { ProductCard } from '../ProductCard';
import { Container, PageLoader } from '../ui';
import { useProducts } from '../../hooks/useCatalog';
import type { Block, FeaturedProductsProps } from './types';

interface Props {
  block: Block;
  isAdmin: boolean;
  onUpdateProps: (patch: Partial<FeaturedProductsProps>) => void;
}

export function FeaturedProductsBlock({ block, isAdmin, onUpdateProps }: Props) {
  const props = block.props as unknown as FeaturedProductsProps;
  const { data: products, loading } = useProducts({ publishedOnly: true });

  const featured = (() => {
    const marked = products.filter((p) => p.isFeatured);
    return (marked.length > 0 ? marked : products).slice(0, 3);
  })();

  return (
    <Container className="py-8 space-y-6">
      <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          {isAdmin ? (
            <InlineEditable
              as="h2"
              value={props.heading ?? ''}
              onCommit={(heading) => onUpdateProps({ heading })}
              className="block text-2xl font-black text-slate-900 tracking-tight"
            />
          ) : (
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{props.heading}</h2>
          )}
          {isAdmin ? (
            <InlineEditable
              as="p"
              value={props.subheading ?? ''}
              placeholder="Subheading (optional)"
              onCommit={(subheading) => onUpdateProps({ subheading })}
              className="block text-xs text-slate-500 mt-1"
            />
          ) : props.subheading ? (
            <p className="text-xs text-slate-500 mt-1">{props.subheading}</p>
          ) : null}
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
  );
}
