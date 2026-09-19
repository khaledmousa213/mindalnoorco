import type { Block, CategoryBlockContext } from './types';
import { RichTextBlock } from './RichTextBlock';
import { FeatureGridBlock } from './FeatureGridBlock';
import { CTABannerBlock } from './CTABannerBlock';
import { ImageTextBlock } from './ImageTextBlock';
import { SpacerBlock } from './SpacerBlock';
import { HeroHomeBlock } from './HeroHomeBlock';
import { FeaturedProductsBlock } from './FeaturedProductsBlock';
import { CategoryGridBlock } from './CategoryGridBlock';
import { ContactInfoBlock } from './ContactInfoBlock';
import { QuoteFormBlock } from './QuoteFormBlock';
import { HeroCategoryBlock } from './HeroCategoryBlock';
import { SubCategoryGridBlock } from './SubCategoryGridBlock';
import { FeaturedInCategoryBlock } from './FeaturedInCategoryBlock';
import { DirectProductsBlock } from './DirectProductsBlock';

interface BlockRendererProps {
  block: Block;
  /** True only for a signed-in admin viewing persisted (editable) blocks. */
  isAdmin: boolean;
  onUpdateProps: (patch: Record<string, unknown>) => void;
  /** Required for the category-page-only block types. */
  categoryContext?: CategoryBlockContext;
}

export function BlockRenderer({ block, isAdmin, onUpdateProps, categoryContext }: BlockRendererProps) {
  const common = { block, isAdmin, onUpdateProps };

  switch (block.type) {
    case 'richText':
      return <RichTextBlock {...common} />;
    case 'featureGrid':
      return <FeatureGridBlock {...common} />;
    case 'ctaBanner':
      return <CTABannerBlock {...common} />;
    case 'imageText':
      return <ImageTextBlock {...common} />;
    case 'spacer':
      return <SpacerBlock {...common} />;
    case 'heroHome':
      return <HeroHomeBlock {...common} />;
    case 'featuredProducts':
      return <FeaturedProductsBlock {...common} />;
    case 'categoryGrid':
      return <CategoryGridBlock {...common} />;
    case 'contactInfo':
      return <ContactInfoBlock {...common} />;
    case 'quoteForm':
      return <QuoteFormBlock {...common} />;
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
