import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCategories, useProducts } from '../hooks/useCatalog';
import { usePageBuilder } from '../hooks/usePageBuilder';
import { findBySlug, getDescendantIds } from '../lib/categories';
import { BlockRenderer } from '../components/blocks/BlockRenderer';
import type { CategoryBlockContext, DefaultBlockInput } from '../components/blocks/types';
import { Container, PageLoader } from '../components/ui';
import { usePageMeta } from '../lib/meta';

const DEFAULT_CATEGORY_BLOCKS: DefaultBlockInput[] = [
  { type: 'heroCategory', props: {} },
  { type: 'subCategoryGrid', props: {} },
  { type: 'featuredInCategory', props: {} },
  { type: 'directProducts', props: {} },
];
const NO_BLOCKS: DefaultBlockInput[] = [];

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

  // Each category has its own layout, stored under its own page id; until an
  // admin customises it, the default section order below is used.
  const { blocks, editable, updateProps } = usePageBuilder(
    category ? `category:${category.id}` : '',
    category ? DEFAULT_CATEGORY_BLOCKS : NO_BLOCKS,
  );

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

  const categoryContext: CategoryBlockContext = {
    category,
    children,
    categoryProducts,
    countFor,
    productsLoading,
  };

  return (
    <div className="pb-16">
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          isAdmin={editable}
          onUpdateProps={(patch) => updateProps(block, patch)}
          categoryContext={categoryContext}
        />
      ))}
    </div>
  );
};
