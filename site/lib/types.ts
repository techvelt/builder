export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface Product {
  slug: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  image?: string;
  category?: string;
  sku?: string;
  inStock?: boolean;
  badge?: string;
}

export interface Category {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  productCount?: number;
  children?: Category[];
}

export interface HeroData {
  title: string;
  subtitle?: string;
  image?: string;
  ctaLabel?: string;
  ctaHref?: string;
  badge?: string;
}

export interface TrustBadge {
  icon: string;
  title: string;
  description: string;
}

export interface PageMeta {
  title?: string;
  description?: string;
}

export interface Page {
  slug: string;
  title: string;
  type: 'home' | 'page' | 'product' | 'category';
  description?: string;
  content?: string;
  hero?: HeroData;
  products?: Product[];
  categories?: Category[];
  breadcrumbs?: BreadcrumbItem[];
  trustBadges?: TrustBadge[];
  meta?: PageMeta;
}
