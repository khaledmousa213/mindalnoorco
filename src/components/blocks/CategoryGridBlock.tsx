import { Link } from 'react-router-dom';
import { ArrowRight, ImageOff } from 'lucide-react';
import { InlineEditable } from '../InlineEditable';
import { Container } from '../ui';
import { useCategories, useProducts } from '../../hooks/useCatalog';
import { buildCategoryTree, getDescendantIds } from '../../lib/categories';
import type { Block, CategoryGridProps } from './types';

interface Props {
  block: Block;
  isAdmin: boolean;
  onUpdateProps: (patch: Partial<CategoryGridProps>) => void;
}

export function CategoryGridBlock({ block, isAdmin, onUpdateProps }: Props) {
  const props = block.props as unknown as CategoryGridProps;
  const { data: categories } = useCategories();
  const { data: products } = useProducts({ publishedOnly: true });
  const topCategories = buildCategoryTree(categories);

  if (topCategories.length === 0 && !isAdmin) return null;

  return (
    <Container className="py-8 space-y-6">
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

      {topCategories.length === 0 ? (
        <p className="text-xs text-slate-500">
          No categories yet — add some from Admin → Categories.
        </p>
      ) : (
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
      )}
    </Container>
  );
}
