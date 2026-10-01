import type { Block, CategoryBlockContext } from './types';
import { SectionBlock } from './SectionBlock';
import { HeroSliderBlock } from './HeroSliderBlock';
import { HeroCategoryBlock } from './HeroCategoryBlock';
import { SubCategoryGridBlock } from './SubCategoryGridBlock';
import { FeaturedInCategoryBlock } from './FeaturedInCategoryBlock';
import { DirectProductsBlock } from './DirectProductsBlock';

interface BlockRendererProps {
  block: Block;
  /** Required for the category-page-only block types. */
  categoryContext?: CategoryBlockContext;
}

export function BlockRenderer({ block, categoryContext }: BlockRendererProps) {
  switch (block.type) {
    case 'section':
      return <SectionBlock block={block} />;
    case 'heroSlider':
      return <HeroSliderBlock block={block} />;
    case 'heroCategory':
      return categoryContext ? <HeroCategoryBlock ctx={categoryContext} /> : null;
    case 'subCategoryGrid':
      return categoryContext ? <SubCategoryGridBlock ctx={categoryContext} /> : null;
    case 'featuredInCategory':
      return categoryContext ? <FeaturedInCategoryBlock ctx={categoryContext} /> : null;
    case 'directProducts':
      return categoryContext ? <DirectProductsBlock ctx={categoryContext} /> : null;
    default:
      return null;
  }
}
