/**
 * Data model for the Mind Alnoor Co. catalog.
 * Deliberately small: one product = a handful of fields an admin can fill in quickly.
 */

export interface ProductSpecRow {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  /** URL-safe identifier used in /product/:slug. Unique across the catalog. */
  slug: string;
  name: string;
  /** Manufacturer, e.g. "Mindray". Free text, surfaced as a filter. */
  brand: string;
  categoryId: string;
  /** Denormalised category name, kept in sync on write so lists don't need a join. */
  categoryName: string;
  /** One-line summary shown on cards. */
  shortDescription: string;
  /** Full description shown on the product page. */
  description: string;
  /** Storage download URLs. images[0] is the primary/card image. */
  images: string[];
  keyFeatures: string[];
  specs: ProductSpecRow[];
  /** Free text, e.g. "Request a quote" or "From $18,500". Optional. */
  priceRange: string;
  /** Storage download URL for a PDF datasheet. Optional. */
  datasheetUrl: string;
  isFeatured: boolean;
  /** Draft products are hidden from the public site but visible in admin. */
  isPublished: boolean;
  /** Manual sort order, ascending. */
  order: number;
  /** Epoch millis. */
  createdAt: number;
  updatedAt: number;
}

/** Shape of the product form before it is persisted (no id / timestamps yet). */
export type ProductDraft = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
}

export type CategoryDraft = Omit<Category, 'id'>;

export type QuoteStatus = 'new' | 'contacted' | 'closed';

export interface QuoteRequestProductRef {
  id: string;
  name: string;
}

export interface QuoteRequest {
  id: string;
  createdAt: number;
  status: QuoteStatus;
  name: string;
  email: string;
  phone: string;
  organization: string;
  message: string;
  /** Products the enquiry is about (empty for a general contact-page message). */
  products: QuoteRequestProductRef[];
  /** Where the request came from, e.g. "product:sonomax-e90" or "contact". */
  source: string;
}

export type QuoteRequestInput = Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>;
