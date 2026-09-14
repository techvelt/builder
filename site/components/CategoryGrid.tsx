import Link from 'next/link';
import type { Category } from '@/lib/types';

interface CategoryGridProps {
  categories: Category[];
  title?: string;
  subtitle?: string;
}

export default function CategoryGrid({
  categories,
  title = 'Shop by Category',
  subtitle,
}: CategoryGridProps) {
  return (
    <section className="py-12 lg:py-16">
      <div className="container-site">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-gray-500">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md hover:border-primary/30"
            >
              <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary-50 to-navy-50">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">
                    🩺
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-navy group-hover:text-primary transition">
                  {category.title}
                </h3>
                {category.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                    {category.description}
                  </p>
                )}
                {category.productCount != null && (
                  <p className="mt-2 text-xs font-medium text-primary">
                    {category.productCount} products
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
