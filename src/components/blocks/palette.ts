import {
  AlignLeft,
  Grid3x3,
  Image as ImageIcon,
  Layout,
  LayoutGrid,
  Mail,
  Megaphone,
  MoveVertical,
  Phone,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { BlockType } from './types';

type PageScope = 'any' | 'home' | 'contact' | 'category';

export interface PaletteEntry {
  type: BlockType;
  label: string;
  hint: string;
  icon: LucideIcon;
  scope: PageScope;
  defaultProps: () => Record<string, unknown>;
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  richText: 'Text block',
  featureGrid: 'Feature grid',
  ctaBanner: 'Call-to-action banner',
  imageText: 'Image + text',
  spacer: 'Spacer',
  heroHome: 'Home hero',
  featuredProducts: 'Featured products',
  categoryGrid: 'Category grid',
  contactInfo: 'Contact info cards',
  quoteForm: 'Quote request form',
  heroCategory: 'Category hero',
  subCategoryGrid: 'Sub-category grid',
  featuredInCategory: 'Featured in category',
  directProducts: 'Category product grid',
};

export const BLOCK_PALETTE: PaletteEntry[] = [
  {
    type: 'richText',
    label: BLOCK_LABELS.richText,
    hint: 'Heading and paragraph',
    icon: AlignLeft,
    scope: 'any',
    defaultProps: () => ({ heading: 'New section', body: 'Click here to write your text.' }),
  },
  {
    type: 'featureGrid',
    label: BLOCK_LABELS.featureGrid,
    hint: 'Cards with an icon, title and text',
    icon: Grid3x3,
    scope: 'any',
    defaultProps: () => ({
      items: [
        { id: randomId(), icon: 'ShieldCheck', title: 'First item', text: 'Describe this item.' },
        { id: randomId(), icon: 'Award', title: 'Second item', text: 'Describe this item.' },
        { id: randomId(), icon: 'Zap', title: 'Third item', text: 'Describe this item.' },
      ],
    }),
  },
  {
    type: 'ctaBanner',
    label: BLOCK_LABELS.ctaBanner,
    hint: 'Dark banner with a button',
    icon: Megaphone,
    scope: 'any',
    defaultProps: () => ({
      heading: 'Ready to talk?',
      body: 'Tell us what you need and we will get back to you.',
      buttonLabel: 'Contact us',
      buttonHref: '/contact',
    }),
  },
  {
    type: 'imageText',
    label: BLOCK_LABELS.imageText,
    hint: 'Picture beside a heading and text',
    icon: ImageIcon,
    scope: 'any',
    defaultProps: () => ({
      imageUrl: '',
      heading: 'Heading',
      body: 'Click here to write your text. Hover the picture to add an image.',
      imageSide: 'left',
    }),
  },
  {
    type: 'spacer',
    label: BLOCK_LABELS.spacer,
    hint: 'Blank vertical space',
    icon: MoveVertical,
    scope: 'any',
    defaultProps: () => ({ size: 'md' }),
  },
  {
    type: 'heroHome',
    label: BLOCK_LABELS.heroHome,
    hint: 'Large intro with catalog / quote buttons',
    icon: Layout,
    scope: 'home',
    defaultProps: () => ({ badge: 'Badge', title: 'Your headline', subtitle: 'A short supporting sentence.' }),
  },
  {
    type: 'featuredProducts',
    label: BLOCK_LABELS.featuredProducts,
    hint: 'Products marked "featured" in the catalog',
    icon: Sparkles,
    scope: 'home',
    defaultProps: () => ({ heading: 'Featured systems', subheading: 'A selection from our current catalog.' }),
  },
  {
    type: 'categoryGrid',
    label: BLOCK_LABELS.categoryGrid,
    hint: 'Top-level product categories',
    icon: LayoutGrid,
    scope: 'home',
    defaultProps: () => ({ heading: 'Shop by product line' }),
  },
  {
    type: 'contactInfo',
    label: BLOCK_LABELS.contactInfo,
    hint: 'Phone, email and address cards',
    icon: Phone,
    scope: 'contact',
    defaultProps: () => ({}),
  },
  {
    type: 'quoteForm',
    label: BLOCK_LABELS.quoteForm,
    hint: 'The contact / quote request form',
    icon: Mail,
    scope: 'contact',
    defaultProps: () => ({ heading: 'Send a message' }),
  },
  {
    type: 'heroCategory',
    label: BLOCK_LABELS.heroCategory,
    hint: 'Category name, description and shop button',
    icon: Layout,
    scope: 'category',
    defaultProps: () => ({}),
  },
  {
    type: 'subCategoryGrid',
    label: BLOCK_LABELS.subCategoryGrid,
    hint: 'Cards for this category\'s sub-categories',
    icon: LayoutGrid,
    scope: 'category',
    defaultProps: () => ({}),
  },
  {
    type: 'featuredInCategory',
    label: BLOCK_LABELS.featuredInCategory,
    hint: 'Featured products in this category',
    icon: Sparkles,
    scope: 'category',
    defaultProps: () => ({}),
  },
  {
    type: 'directProducts',
    label: BLOCK_LABELS.directProducts,
    hint: 'All products in this category',
    icon: Grid3x3,
    scope: 'category',
    defaultProps: () => ({}),
  },
];

function scopeOf(pageId: string): PageScope | null {
  if (pageId.startsWith('category:')) return 'category';
  if (pageId === 'home' || pageId === 'contact') return pageId;
  return 'any';
}

/** Block types an admin may add to the given page. */
export function paletteForPage(pageId: string): PaletteEntry[] {
  const scope = scopeOf(pageId);
  return BLOCK_PALETTE.filter((entry) => entry.scope === 'any' || entry.scope === scope);
}
