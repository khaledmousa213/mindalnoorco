import {
  AlignLeft,
  Grid3x3,
  Image as ImageIcon,
  Layout,
  GalleryHorizontal,
  Images,
  LayoutGrid,
  Megaphone,
  Sparkles,
  Square,
  Video,
  type LucideIcon,
} from 'lucide-react';
import type { BlockType, PageElement } from './types';
import { newHeroSlide } from './HeroSliderBlock';

export interface SectionPreset {
  key: string;
  type: BlockType;
  label: string;
  hint: string;
  icon: LucideIcon;
  /** Only offered on category pages. */
  categoryOnly?: boolean;
  defaultProps: () => Record<string, unknown>;
}

function id(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  section: 'Section',
  heroSlider: 'Hero slider',
  heroCategory: 'Category hero',
  subCategoryGrid: 'Sub-category cards',
  featuredInCategory: 'Featured in category',
  directProducts: 'Category product grid',
};

function section(
  style: 'plain' | 'hero' | 'card' | 'dark',
  elements: PageElement[],
  width: 'wide' | 'narrow' = 'wide',
): Record<string, unknown> {
  return { style, width, elements };
}

export const SECTION_PRESETS: SectionPreset[] = [
  {
    key: 'blank',
    type: 'section',
    label: 'Blank section',
    hint: 'Start empty, add what you like',
    icon: Square,
    defaultProps: () => section('plain', []),
  },
  {
    key: 'heroSlider',
    type: 'heroSlider',
    label: 'Hero slider',
    hint: 'Full-width slides with image or video',
    icon: GalleryHorizontal,
    defaultProps: () => ({ interval: 6, slides: [newHeroSlide()] }),
  },
  {
    key: 'text',
    type: 'section',
    label: 'Text section',
    hint: 'Heading and paragraph',
    icon: AlignLeft,
    defaultProps: () =>
      section('plain', [
        { id: id(), type: 'heading', text: 'New section', level: 2 },
        { id: id(), type: 'text', text: 'Click here to write your text.', size: 'md' },
      ]),
  },
  {
    key: 'image',
    type: 'section',
    label: 'Image section',
    hint: 'Heading, text and a picture',
    icon: ImageIcon,
    defaultProps: () =>
      section('plain', [
        { id: id(), type: 'heading', text: 'Heading', level: 2 },
        { id: id(), type: 'text', text: 'Click here to write your text.', size: 'md' },
        { id: id(), type: 'image', url: '' },
      ]),
  },
  {
    key: 'gallery',
    type: 'section',
    label: 'Photo gallery',
    hint: 'Heading and a grid of photos',
    icon: Images,
    defaultProps: () =>
      section('plain', [
        { id: id(), type: 'heading', text: 'Gallery', level: 2 },
        { id: id(), type: 'gallery', images: [] },
      ]),
  },
  {
    key: 'video',
    type: 'section',
    label: 'Video section',
    hint: 'Heading and a video',
    icon: Video,
    defaultProps: () =>
      section('plain', [
        { id: id(), type: 'heading', text: 'Watch', level: 2 },
        { id: id(), type: 'video', url: '' },
      ]),
  },
  {
    key: 'cards',
    type: 'section',
    label: 'Cards section',
    hint: 'A row of icon cards',
    icon: Grid3x3,
    defaultProps: () =>
      section('plain', [
        {
          id: id(),
          type: 'cards',
          columns: 3,
          items: [
            { id: id(), icon: 'ShieldCheck', title: 'First card', text: 'Describe this card.' },
            { id: id(), icon: 'Award', title: 'Second card', text: 'Describe this card.' },
            { id: id(), icon: 'Zap', title: 'Third card', text: 'Describe this card.' },
          ],
        },
      ]),
  },
  {
    key: 'banner',
    type: 'section',
    label: 'Dark banner',
    hint: 'Text and a button on dark',
    icon: Megaphone,
    defaultProps: () =>
      section('dark', [
        { id: id(), type: 'heading', text: 'Ready to talk?', level: 3 },
        { id: id(), type: 'text', text: 'Tell us what you need and we will get back to you.', size: 'md' },
        {
          id: id(),
          type: 'buttons',
          items: [{ id: id(), label: 'Contact us', href: '/contact', variant: 'primary' }],
        },
      ]),
  },
  {
    key: 'featured',
    type: 'section',
    label: 'Featured products',
    hint: 'Live from your catalog',
    icon: Sparkles,
    defaultProps: () =>
      section('plain', [
        { id: id(), type: 'heading', text: 'Featured systems', level: 2 },
        { id: id(), type: 'featuredProducts' },
      ]),
  },
  {
    key: 'categories',
    type: 'section',
    label: 'Category cards',
    hint: 'Live from your catalog',
    icon: LayoutGrid,
    defaultProps: () =>
      section('plain', [
        { id: id(), type: 'heading', text: 'Shop by product line', level: 2 },
        { id: id(), type: 'categoryGrid' },
      ]),
  },
  {
    key: 'heroCategory',
    type: 'heroCategory',
    label: 'Category hero',
    hint: 'Category name, description and shop button',
    icon: Layout,
    categoryOnly: true,
    defaultProps: () => ({}),
  },
  {
    key: 'subCategoryGrid',
    type: 'subCategoryGrid',
    label: 'Sub-category cards',
    hint: 'Cards for this category\'s sub-categories',
    icon: LayoutGrid,
    categoryOnly: true,
    defaultProps: () => ({}),
  },
  {
    key: 'featuredInCategory',
    type: 'featuredInCategory',
    label: 'Featured in category',
    hint: 'Featured products in this category',
    icon: Sparkles,
    categoryOnly: true,
    defaultProps: () => ({}),
  },
  {
    key: 'directProducts',
    type: 'directProducts',
    label: 'Category product grid',
    hint: 'All products in this category',
    icon: Grid3x3,
    categoryOnly: true,
    defaultProps: () => ({}),
  },
];

/** Section types an admin may add to the given page. */
export function presetsForPage(pageId: string): SectionPreset[] {
  const isCategory = pageId.startsWith('category:');
  return SECTION_PRESETS.filter((p) => !p.categoryOnly || isCategory);
}
