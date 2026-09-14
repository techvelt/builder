import Link from 'next/link';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const currency = product.currency ?? 'USD';
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(product.price);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-50">
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {product.badge}
          </span>
        )}
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-50 to-navy-50 text-4xl">
            📦
          </div>
        )}
        {!product.inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white">
            Out of Stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            {product.category}
          </p>
        )}
        <Link href={`/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-navy group-hover:text-primary transition">
            {product.title}
          </h3>
        </Link>
        {product.sku && (
          <p className="mt-1 text-xs text-gray-400">SKU: {product.sku}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="text-lg font-bold text-navy">{formattedPrice}</p>
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
            disabled={!product.inStock}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
