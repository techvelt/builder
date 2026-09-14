import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductCard from '@/components/ProductCard';
import CategoryGrid from '@/components/CategoryGrid';
import Hero from '@/components/Hero';
import { getPageBySlug, getAllSlugs } from '@/lib/content';
import type { Page } from '@/lib/types';

interface PageProps {
  params: { slug: string[] };
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({
    slug: slug.split('/'),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = getPageBySlug(params.slug);
  if (!page) return { title: 'Not Found' };

  return {
    title: page.meta?.title ?? page.title,
    description: page.meta?.description ?? page.description,
  };
}

function ProductPage({ page }: { page: Page }) {
  const product = page.products?.[0];
  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency ?? 'USD',
  }).format(product.price);

  return (
    <div className="container-site py-8 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">
              📦
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {product.category}
            </p>
          )}
          <h1 className="mt-2 text-3xl font-bold text-navy">{product.title}</h1>
          {product.sku && (
            <p className="mt-2 text-sm text-gray-400">SKU: {product.sku}</p>
          )}
          <p className="mt-4 text-3xl font-bold text-navy">{formattedPrice}</p>
          <p className="mt-2 text-sm">
            {product.inStock ? (
              <span className="font-medium text-green-600">In Stock</span>
            ) : (
              <span className="font-medium text-red-600">Out of Stock</span>
            )}
          </p>
          {page.description && (
            <p className="mt-6 text-gray-600 leading-relaxed">{page.description}</p>
          )}
          <div className="mt-8 flex gap-4">
            <button
              type="button"
              className="btn-primary px-8 py-3"
              disabled={!product.inStock}
            >
              Add to Cart
            </button>
            <button type="button" className="btn-secondary px-8 py-3">
              Save for Later
            </button>
          </div>
        </div>
      </div>

      {page.content && (
        <div className="prose prose-navy mt-12 max-w-none">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      )}
    </div>
  );
}

function CategoryPage({ page }: { page: Page }) {
  return (
    <>
      {page.hero && <Hero data={page.hero} />}
      <div className="container-site py-8">
        {page.description && (
          <p className="mb-8 max-w-2xl text-gray-600">{page.description}</p>
        )}
        {page.categories && page.categories.length > 0 && (
          <CategoryGrid categories={page.categories} title="" />
        )}
        {page.products && page.products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {page.products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function GenericPage({ page }: { page: Page }) {
  return (
    <div className="container-site py-8 lg:py-12">
      <h1 className="text-3xl font-bold text-navy">{page.title}</h1>
      {page.description && (
        <p className="mt-4 max-w-2xl text-gray-600">{page.description}</p>
      )}
      {page.content && (
        <div
          className="prose prose-navy mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}
    </div>
  );
}

export default function DynamicPage({ params }: PageProps) {
  const page = getPageBySlug(params.slug);
  if (!page) notFound();

  return (
    <>
      {page.breadcrumbs && page.breadcrumbs.length > 0 && (
        <Breadcrumbs items={page.breadcrumbs} />
      )}

      {page.type === 'product' && <ProductPage page={page} />}
      {page.type === 'category' && <CategoryPage page={page} />}
      {page.type === 'page' && <GenericPage page={page} />}
    </>
  );
}
