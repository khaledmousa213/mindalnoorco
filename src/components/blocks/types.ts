import type { Category, Product } from '../../lib/types';

/**
 * A page is an ordered list of blocks. Almost everything is a `section`,
 * which holds an ordered list of elements (text, image, video, buttons, ...).
 * The four category-only types show live catalog data and have no elements.
 */
export type BlockType =
  | 'section'
  | 'heroSlider'
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
  /** Schema version the doc was written with (see BLOCK_VERSION in lib/pageBlocks). */
  v?: number;
}

export type SectionStyle = 'plain' | 'hero' | 'card' | 'dark';
export type SectionWidth = 'wide' | 'narrow';

export interface SectionProps {
  style: SectionStyle;
  width: SectionWidth;
  elements: PageElement[];
}

export type Align = 'left' | 'center' | 'right';
export type Size = 'sm' | 'md' | 'lg';

export interface CardItem {
  id: string;
  icon: string;
  title: string;
  text: string;
  /** Optional: makes the whole card a link ("tel:...", "/about", "https://..."). */
  href?: string;
}

export interface ButtonItem {
  id: string;
  label: string;
  /** "#quote" opens the quote-request pop-up. */
  href: string;
  variant: 'primary' | 'secondary';
}

export interface HeroSlide {
  id: string;
  /** Which background is shown; both URLs are kept so switching back is lossless. */
  media: 'image' | 'video';
  image: string;
  /** YouTube, Vimeo or a direct .mp4/.webm link. */
  video: string;
  badge: string;
  title: string;
  text: string;
  buttons: ButtonItem[];
}

export interface HeroSliderProps {
  slides: HeroSlide[];
  /** Seconds per slide; 0 turns autoplay off. */
  interval: number;
}

export type PageElement =
  | { id: string; type: 'heading'; text: string; level: 1 | 2 | 3; align?: Align }
  | { id: string; type: 'text'; text: string; size?: Size; align?: Align }
  | { id: string; type: 'badge'; text: string }
  | { id: string; type: 'image'; url: string; alt?: string }
  | { id: string; type: 'gallery'; images: string[] }
  | { id: string; type: 'video'; url: string }
  | { id: string; type: 'buttons'; items: ButtonItem[]; align?: Align }
  | { id: string; type: 'link'; label: string; href: string }
  | { id: string; type: 'divider' }
  | { id: string; type: 'spacer'; size: Size }
  | { id: string; type: 'cards'; columns: 2 | 3 | 4; items: CardItem[] }
  | { id: string; type: 'featuredProducts' }
  | { id: string; type: 'categoryGrid' }
  | { id: string; type: 'quoteForm' };

export type ElementType = PageElement['type'];

/** Live data handed to the category-page-only blocks. */
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
