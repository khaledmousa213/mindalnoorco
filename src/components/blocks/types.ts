import type { Category, Product } from '../../lib/types';

export type BlockType =
  | 'richText'
  | 'featureGrid'
  | 'ctaBanner'
  | 'imageText'
  | 'spacer'
  | 'heroHome'
  | 'featuredProducts'
  | 'categoryGrid'
  | 'contactInfo'
  | 'quoteForm'
  | 'heroCategory'
  | 'subCategoryGrid'
  | 'featuredInCategory'
  | 'directProducts';

export interface Block {
  id: string;
  /** "home" | "about" | "contact" | `category:${categoryId}` */
  pageId: string;
  type: BlockType;
  order: number;
  props: Record<string, unknown>;
}

export interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  text: string;
}

export interface RichTextProps {
  heading?: string;
  headingLevel?: 'h1' | 'h2';
  body: string;
  align?: 'left' | 'center';
}

export interface FeatureGridProps {
  heading?: string;
  items: FeatureItem[];
}

export interface CtaBannerProps {
  eyebrow?: string;
  heading?: string;
  body?: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface ImageTextProps {
  imageUrl: string;
  heading: string;
  body: string;
  linkLabel?: string;
  linkHref?: string;
  imageSide: 'left' | 'right';
}

export interface SpacerProps {
  size: 'sm' | 'md' | 'lg';
}

export interface HeroHomeProps {
  badge: string;
  title: string;
  subtitle: string;
}

export interface FeaturedProductsProps {
  heading: string;
  subheading?: string;
}

export interface CategoryGridProps {
  heading: string;
}

export interface ContactInfoProps {
  heading?: string;
}

export interface QuoteFormProps {
  heading?: string;
}

/** Live data handed to the category-page-only blocks (they have no free-text props). */
export interface CategoryBlockContext {
  category: Category;
  children: Category[];
  categoryProducts: Product[];
  countFor: (categoryId: string) => number;
  productsLoading: boolean;
}

export interface DefaultBlockInput {
  type: BlockType;
  props: Record<string, unknown>;
}
