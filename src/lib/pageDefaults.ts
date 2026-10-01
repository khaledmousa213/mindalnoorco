import type { DefaultBlockInput } from '../components/blocks/types';
import { COMPANY } from './company';

/**
 * Built-in layouts. Until an admin customises a page these are shown as-is,
 * and they are what gets saved to Firestore the first time an admin opens the
 * page (or presses "Reset to standard layout").
 */

export const DEFAULT_HOME_BLOCKS: DefaultBlockInput[] = [
  {
    type: 'heroSlider',
    props: {
      interval: 6,
      slides: [
        {
          id: 'imaging',
          media: 'image',
          image: '',
          video: '',
          badge: `Authorized Mindray distributor · ${COMPANY.city}`,
          title: 'Diagnostic imaging equipment for hospitals and clinics',
          text: `Ultrasound systems, digital radiography, and surgical imaging — supplied, installed, and serviced by ${COMPANY.name}, with clinical training and manufacturer warranty.`,
          buttons: [
            { id: 'catalog', label: 'Browse the catalog', href: '/catalog', variant: 'primary' },
            { id: 'quote', label: 'Request a quote', href: '#quote', variant: 'secondary' },
          ],
        },
        {
          id: 'ultrasound',
          media: 'image',
          image: '',
          video: '',
          badge: 'Ultrasound',
          title: 'Ultrasound for every specialty',
          text: 'From portable point-of-care units to premium cart-based systems for radiology, cardiology, and women’s health.',
          buttons: [
            { id: 'catalog', label: 'Explore ultrasound', href: '/catalog', variant: 'primary' },
            { id: 'quote', label: 'Request a quote', href: '#quote', variant: 'secondary' },
          ],
        },
        {
          id: 'service',
          media: 'image',
          image: '',
          video: '',
          badge: 'Service & training',
          title: 'Installation, training, and local support',
          text: 'Factory-trained engineers, on-site clinical application training, preventive maintenance, and spare parts stocked locally.',
          buttons: [
            { id: 'contact', label: 'Contact our team', href: '/contact', variant: 'primary' },
            { id: 'about', label: 'About us', href: '/about', variant: 'secondary' },
          ],
        },
      ],
    },
  },
  {
    type: 'section',
    props: {
      style: 'plain',
      width: 'wide',
      elements: [
        {
          id: 'trust',
          type: 'cards',
          columns: 3,
          items: [
            {
              id: 'warranty',
              icon: 'ShieldCheck',
              title: 'Manufacturer warranty',
              text: 'Genuine equipment with OEM warranty and software support.',
            },
            {
              id: 'service',
              icon: 'Wrench',
              title: 'Installation & service',
              text: 'Commissioning, preventive maintenance, and spare parts.',
            },
            {
              id: 'training',
              icon: 'PackageSearch',
              title: 'Clinical training',
              text: 'On-site application training for your clinical teams.',
            },
          ],
        },
      ],
    },
  },
  {
    type: 'section',
    props: {
      style: 'plain',
      width: 'wide',
      elements: [
        { id: 'title', type: 'heading', level: 2, text: 'Featured systems' },
        { id: 'subtitle', type: 'text', size: 'sm', text: 'A selection from our current catalog.' },
        { id: 'grid', type: 'featuredProducts' },
        { id: 'more', type: 'link', label: 'View all products →', href: '/catalog' },
      ],
    },
  },
  {
    type: 'section',
    props: {
      style: 'plain',
      width: 'wide',
      elements: [
        { id: 'title', type: 'heading', level: 2, text: 'Shop by product line' },
        { id: 'grid', type: 'categoryGrid' },
      ],
    },
  },
];

export const DEFAULT_ABOUT_BLOCKS: DefaultBlockInput[] = [
  {
    type: 'heroSlider',
    props: {
      interval: 6,
      slides: [
        {
          id: 'about',
          media: 'image',
          image: '',
          video: '',
          badge: 'About us',
          title: `About ${COMPANY.name}`,
          text: 'Authorized Mindray distributor supplying diagnostic imaging systems to hospitals and clinics across Jordan and the region.',
          buttons: [{ id: 'contact', label: 'Contact us', href: '/contact', variant: 'primary' }],
        },
        {
          id: 'team',
          media: 'image',
          image: '',
          video: '',
          badge: 'Our team',
          title: 'Engineers and clinical specialists',
          text: 'Factory-trained service engineers and application specialists supporting your teams from installation onwards.',
          buttons: [{ id: 'quote', label: 'Request a quote', href: '#quote', variant: 'primary' }],
        },
      ],
    },
  },
  {
    type: 'section',
    props: {
      style: 'plain',
      width: 'narrow',
      elements: [
        { id: 'title', type: 'heading', level: 2, text: 'Who we are' },
        { id: 'arabic', type: 'text', size: 'sm', text: COMPANY.nameArabic },
        {
          id: 'intro',
          type: 'text',
          size: 'md',
          text: `${COMPANY.name} is a supplier and authorized distributor of Mindray medical systems, delivering diagnostic ultrasound, digital radiography (DR) suites, surgical C-arms, and point-of-care imaging to hospitals, radiology clinics, and diagnostic centers across Jordan and the region.`,
        },
        { id: 'distributor', type: 'text', size: 'sm', text: 'Authorized distributor of Mindray' },
      ],
    },
  },
  {
    type: 'section',
    props: {
      style: 'plain',
      width: 'narrow',
      elements: [
        {
          id: 'pillars',
          type: 'cards',
          columns: 2,
          items: [
            {
              id: 'partnership',
              icon: 'Award',
              title: 'Authorized Mindray partnership',
              text: 'Genuine equipment sourced directly from the manufacturer, with original warranties, OEM software updates, and authentic transducers.',
            },
            {
              id: 'engineering',
              icon: 'ShieldCheck',
              title: 'Biomedical engineering',
              text: 'Factory-trained service engineers for turnkey installation, calibration, and preventive maintenance.',
            },
            {
              id: 'training',
              icon: 'Stethoscope',
              title: 'Clinical application training',
              text: 'On-site specialists supporting radiologists, sonographers, and surgeons with workflow setup and protocol presets.',
            },
            {
              id: 'support',
              icon: 'Clock',
              title: 'Spare parts & support',
              text: 'Local inventory for replacement parts and loaner probes, with fast clinical response times.',
            },
          ],
        },
      ],
    },
  },
  {
    type: 'section',
    props: {
      style: 'plain',
      width: 'narrow',
      elements: [
        { id: 'title', type: 'heading', level: 2, text: 'Our work' },
        { id: 'gallery', type: 'gallery', images: [] },
      ],
    },
  },
  {
    type: 'section',
    props: {
      style: 'dark',
      width: 'narrow',
      elements: [
        { id: 'title', type: 'heading', level: 3, text: 'Showroom & regional support' },
        {
          id: 'details',
          type: 'text',
          size: 'md',
          text: `${COMPANY.addressLine}\n${COMPANY.phoneDisplay}\n${COMPANY.email}`,
        },
        {
          id: 'buttons',
          type: 'buttons',
          items: [{ id: 'contact', label: 'Contact us', href: '/contact', variant: 'primary' }],
        },
      ],
    },
  },
];

export const DEFAULT_CONTACT_BLOCKS: DefaultBlockInput[] = [
  {
    type: 'section',
    props: {
      style: 'plain',
      width: 'narrow',
      elements: [
        { id: 'title', type: 'heading', level: 1, text: 'Contact us' },
        {
          id: 'intro',
          type: 'text',
          size: 'md',
          text: 'Send us a message for pricing, a product demonstration, or service and spare parts. We reply within one business day.',
        },
        {
          id: 'cards',
          type: 'cards',
          columns: 3,
          items: [
            {
              id: 'phone',
              icon: 'PhoneCall',
              title: 'Phone',
              text: COMPANY.phoneDisplay,
              href: `tel:${COMPANY.phoneHref}`,
            },
            {
              id: 'email',
              icon: 'Mail',
              title: 'Email',
              text: COMPANY.email,
              href: `mailto:${COMPANY.email}`,
            },
            { id: 'address', icon: 'MapPin', title: 'Address', text: COMPANY.addressLine },
          ],
        },
      ],
    },
  },
  {
    type: 'section',
    props: {
      style: 'card',
      width: 'narrow',
      elements: [
        { id: 'title', type: 'heading', level: 3, text: 'Send a message' },
        { id: 'form', type: 'quoteForm' },
      ],
    },
  },
];

export const DEFAULT_CATEGORY_BLOCKS: DefaultBlockInput[] = [
  { type: 'heroCategory', props: {} },
  { type: 'subCategoryGrid', props: {} },
  { type: 'featuredInCategory', props: {} },
  { type: 'directProducts', props: {} },
];

/** The standard layout for a page id, or [] if the id is not a known page. */
export function defaultsForPage(pageId: string): DefaultBlockInput[] {
  if (pageId === 'home') return DEFAULT_HOME_BLOCKS;
  if (pageId === 'about') return DEFAULT_ABOUT_BLOCKS;
  if (pageId === 'contact') return DEFAULT_CONTACT_BLOCKS;
  if (pageId.startsWith('category:')) return DEFAULT_CATEGORY_BLOCKS;
  return [];
}
